import { Router, Response } from "express";
import { db } from "../db/connection";
import { practiceQuestions, questionOptions, userPracticeResults, userStats } from "../db/schema";
import { eq, and } from "drizzle-orm";
import { authenticate, AuthenticatedRequest } from "../middleware/auth";

const router = Router();

/**
 * @swagger
 * /api/v1/practice/submit:
 *   post:
 *     summary: Submit practice question answer
 *     tags: [Practice]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - questionId
 *             properties:
 *               questionId:
 *                 type: integer
 *                 description: Practice question ID
 *               selectedOptionId:
 *                 type: integer
 *                 nullable: true
 *                 description: Selected option ID for multiple choice questions
 *               userAnswer:
 *                 type: string
 *                 nullable: true
 *                 description: User's text answer for open-ended questions
 *               timeTaken:
 *                 type: integer
 *                 nullable: true
 *                 description: Time taken to answer in seconds
 *     responses:
 *       200:
 *         description: Answer submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Answer submitted successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     isCorrect:
 *                       type: boolean
 *                       description: Whether the answer is correct
 *                     correctAnswer:
 *                       type: string
 *                       description: The correct answer
 *                     explanation:
 *                       type: string
 *                       nullable: true
 *                       description: Explanation for the answer
 *                     pointsEarned:
 *                       type: integer
 *                       description: Points earned for this answer
 *       400:
 *         description: Invalid request data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Question not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/submit", authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    const { questionId, selectedOptionId, userAnswer, timeTaken } = req.body;

    if (!questionId) {
      return res.status(400).json({
        success: false,
        message: "ID pertanyaan diperlukan",
      });
    }

    // Get question details
    const question = await db.select().from(practiceQuestions).where(eq(practiceQuestions.id, questionId)).limit(1);

    if (question.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Pertanyaan tidak ditemukan",
      });
    }

    let isCorrect = false;
    let pointsEarned = 0;

    // Check answer based on question type
    if (question[0].type === "multiple_choice" || question[0].type === "true_false") {
      if (!selectedOptionId) {
        return res.status(400).json({
          success: false,
          message: "Pilihan jawaban diperlukan",
        });
      }

      // Check if selected option is correct
      const selectedOption = await db
        .select()
        .from(questionOptions)
        .where(and(eq(questionOptions.id, selectedOptionId), eq(questionOptions.questionId, questionId)))
        .limit(1);

      if (selectedOption.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Pilihan jawaban tidak valid",
        });
      }

      isCorrect = selectedOption[0].isCorrect;
      pointsEarned = isCorrect ? question[0].points || 0 : 0;
    } else if (question[0].type === "fill_blank") {
      if (!userAnswer) {
        return res.status(400).json({
          success: false,
          message: "Jawaban diperlukan",
        });
      }

      // For now, we'll mark these as correct and give full points
      // In a real implementation, you might want to implement answer checking logic
      isCorrect = true;
      pointsEarned = question[0].points || 0;
    }

    // Save user's answer
    await db.insert(userPracticeResults).values({
      userId: user.id,
      questionId,
      selectedOptionId: selectedOptionId || null,
      userAnswer: userAnswer || null,
      isCorrect,
      pointsEarned,
      timeTaken: timeTaken || null,
      attemptedAt: new Date().toISOString(),
    });

    // Update user stats
    const existingStats = await db.select().from(userStats).where(eq(userStats.userId, user.id)).limit(1);

    if (existingStats.length > 0) {
      await db
        .update(userStats)
        .set({
          totalPoints: (existingStats[0].totalPoints || 0) + pointsEarned,
          practiceQuestionsAnswered: (existingStats[0].practiceQuestionsAnswered || 0) + 1,
          correctAnswers: (existingStats[0].correctAnswers || 0) + (isCorrect ? 1 : 0),
          updatedAt: new Date().toISOString(),
        })
        .where(eq(userStats.userId, user.id));
    } else {
      await db.insert(userStats).values({
        userId: user.id,
        totalPoints: pointsEarned,
        practiceQuestionsAnswered: 1,
        correctAnswers: isCorrect ? 1 : 0,
        updatedAt: new Date().toISOString(),
      });
    }

    // Get correct answer for feedback
    let correctAnswer = null;
    if (question[0].type === "multiple_choice" || question[0].type === "true_false") {
      const correctOption = await db
        .select()
        .from(questionOptions)
        .where(and(eq(questionOptions.questionId, questionId), eq(questionOptions.isCorrect, true)))
        .limit(1);

      correctAnswer = correctOption.length > 0 ? correctOption[0] : null;
    }

    res.json({
      success: true,
      data: {
        isCorrect,
        pointsEarned,
        explanation: question[0].explanation,
        correctAnswer,
      },
    });
  } catch (error) {
    console.error("Submit practice error:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
    });
  }
});

/**
 * @swagger
 * /api/v1/practice/results/{lessonId}:
 *   get:
 *     summary: Get user's practice results for a lesson
 *     tags: [Practice]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: lessonId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Lesson ID
 *     responses:
 *       200:
 *         description: Practice results retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Practice results retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     results:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             description: Result ID
 *                           questionId:
 *                             type: integer
 *                             description: Question ID
 *                           selectedOptionId:
 *                             type: integer
 *                             nullable: true
 *                             description: Selected option ID
 *                           userAnswer:
 *                             type: string
 *                             nullable: true
 *                             description: User's text answer
 *                           isCorrect:
 *                             type: boolean
 *                             description: Whether answer was correct
 *                           pointsEarned:
 *                             type: integer
 *                             description: Points earned
 *                           timeTaken:
 *                             type: integer
 *                             nullable: true
 *                             description: Time taken in seconds
 *                           submittedAt:
 *                             type: string
 *                             format: date-time
 *                             description: When answer was submitted
 *                     summary:
 *                       type: object
 *                       properties:
 *                         totalQuestions:
 *                           type: integer
 *                           description: Total number of questions
 *                         correctAnswers:
 *                           type: integer
 *                           description: Number of correct answers
 *                         totalPoints:
 *                           type: integer
 *                           description: Total points earned
 *                         accuracy:
 *                           type: number
 *                           format: float
 *                           description: Accuracy percentage
 *       400:
 *         description: Invalid lesson ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/results/:lessonId", authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = (req as AuthenticatedRequest).user!;
    const lessonId = parseInt(req.params.lessonId);

    if (isNaN(lessonId)) {
      return res.status(400).json({
        success: false,
        message: "ID lesson tidak valid",
      });
    }

    // Get all practice results for this lesson
    const results = await db
      .select({
        id: userPracticeResults.id,
        questionId: userPracticeResults.questionId,
        selectedOptionId: userPracticeResults.selectedOptionId,
        userAnswer: userPracticeResults.userAnswer,
        isCorrect: userPracticeResults.isCorrect,
        pointsEarned: userPracticeResults.pointsEarned,
        timeTaken: userPracticeResults.timeTaken,
        attemptedAt: userPracticeResults.attemptedAt,
        question: practiceQuestions.question,
        questionType: practiceQuestions.type,
        explanation: practiceQuestions.explanation,
      })
      .from(userPracticeResults)
      .innerJoin(practiceQuestions, eq(userPracticeResults.questionId, practiceQuestions.id))
      .where(and(eq(userPracticeResults.userId, user.id), eq(practiceQuestions.lessonId, lessonId)))
      .orderBy(userPracticeResults.attemptedAt);

    // Calculate summary statistics
    const totalQuestions = results.length;
    const correctAnswers = results.filter((r) => r.isCorrect).length;
    const totalPoints = results.reduce((sum, r) => sum + (r.pointsEarned || 0), 0);
    const averageTime = totalQuestions > 0 ? results.reduce((sum, r) => sum + (r.timeTaken || 0), 0) / totalQuestions : 0;

    res.json({
      success: true,
      data: {
        results,
        summary: {
          totalQuestions,
          correctAnswers,
          accuracy: totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0,
          totalPoints,
          averageTime,
        },
      },
    });
  } catch (error) {
    console.error("Get practice results error:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
    });
  }
});

export default router;
