import { Router, Response } from "express";
import { db } from "../db/connection";
import { lessons, lessonExamples, practiceQuestions, questionOptions, userProgress, topics, subjects } from "../db/schema";
import { eq, and, asc, desc, or, like, sql } from "drizzle-orm";
import { authenticate, AuthenticatedRequest } from "../middleware/auth";

const router = Router();

/**
 * @swagger
 * /api/v1/lessons:
 *   get:
 *     summary: Get all lessons with topic and subject information
 *     tags: [Lessons]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search lessons by title only
 *       - in: query
 *         name: subjectIds
 *         schema:
 *           type: string
 *         description: Filter by subject IDs (comma-separated)
 *       - in: query
 *         name: difficultyLevel
 *         schema:
 *           type: string
 *           enum: [beginner, intermediate, advanced]
 *         description: Filter by difficulty level
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [title, difficulty, duration, created]
 *           default: created
 *         description: Sort lessons by field
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: asc
 *         description: Sort order
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Number of lessons per page
 *     responses:
 *       200:
 *         description: All lessons retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     lessons:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           title:
 *                             type: string
 *                           content:
 *                             type: string
 *                           summary:
 *                             type: string
 *                           estimatedDuration:
 *                             type: integer
 *                           difficultyLevel:
 *                             type: string
 *                           topicId:
 *                             type: integer
 *                           topicName:
 *                             type: string
 *                           subjectId:
 *                             type: integer
 *                           subjectName:
 *                             type: string
 *                           subjectColor:
 *                             type: string
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
router.get("/", authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;

    // Extract query parameters
    const { search, subjectIds, difficultyLevel, sortBy = "created", sortOrder = "asc", page = "1", limit = "20" } = req.query;

    // Parse pagination parameters
    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string) || 20));
    const offset = (pageNum - 1) * limitNum;

    // Build where conditions
    const whereConditions = [eq(lessons.isActive, true), eq(topics.isActive, true), eq(subjects.isActive, true)];

    // Add search condition
    if (search && typeof search === "string" && search.trim()) {
      const searchTerm = `%${search.trim()}%`;
      whereConditions.push(like(lessons.title, searchTerm));
    }

    // Add subject filter
    if (subjectIds && typeof subjectIds === "string") {
      const subjectIdArray = subjectIds
        .split(",")
        .map((id) => parseInt(id.trim()))
        .filter((id) => !isNaN(id));
      if (subjectIdArray.length > 0) {
        whereConditions.push(or(...subjectIdArray.map((id) => eq(subjects.id, id)))!);
      }
    }

    // Add difficulty filter
    if (difficultyLevel && typeof difficultyLevel === "string") {
      const validDifficultyLevels = ["beginner", "intermediate", "advanced"] as const;
      if (validDifficultyLevels.includes(difficultyLevel as (typeof validDifficultyLevels)[number])) {
        whereConditions.push(eq(lessons.difficultyLevel, difficultyLevel as (typeof validDifficultyLevels)[number]));
      }
    }

    // Build order by clause
    let orderByClause;
    const isDesc = sortOrder === "desc";

    switch (sortBy) {
      case "title":
        orderByClause = isDesc ? desc(lessons.title) : asc(lessons.title);
        break;
      case "difficulty":
        orderByClause = isDesc ? desc(lessons.difficultyLevel) : asc(lessons.difficultyLevel);
        break;
      case "duration":
        orderByClause = isDesc ? desc(lessons.estimatedDuration) : asc(lessons.estimatedDuration);
        break;
      case "created":
      default:
        orderByClause = isDesc ? desc(lessons.createdAt) : asc(lessons.createdAt);
        break;
    }

    // Get total count for pagination
    const totalCountResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(lessons)
      .innerJoin(topics, eq(lessons.topicId, topics.id))
      .innerJoin(subjects, eq(topics.subjectId, subjects.id))
      .where(and(...whereConditions));

    const totalCount = totalCountResult[0]?.count || 0;
    const totalPages = Math.ceil(totalCount / limitNum);

    // Get lessons with filters, search, and pagination
    const allLessons = await db
      .select({
        id: lessons.id,
        title: lessons.title,
        content: lessons.content,
        summary: lessons.summary,
        orderIndex: lessons.orderIndex,
        estimatedDuration: lessons.estimatedDuration,
        difficultyLevel: lessons.difficultyLevel,
        difficultySubLevel: lessons.difficultySubLevel,
        learningObjectives: lessons.learningObjectives,
        prerequisites: lessons.prerequisites,
        keyConcepts: lessons.keyConcepts,
        practicalApplications: lessons.practicalApplications,
        mediaContent: lessons.mediaContent,
        isActive: lessons.isActive,
        topicId: topics.id,
        topicName: topics.name,
        subjectId: subjects.id,
        subjectName: subjects.name,
        subjectColor: subjects.color,
        createdAt: lessons.createdAt,
        // Progress fields
        progressPercentage: userProgress.progressPercentage,
        isCompleted: userProgress.isCompleted,
        completedAt: userProgress.completedAt,
        lastAccessed: userProgress.lastAccessed,
      })
      .from(lessons)
      .innerJoin(topics, eq(lessons.topicId, topics.id))
      .innerJoin(subjects, eq(topics.subjectId, subjects.id))
      .leftJoin(userProgress, and(eq(userProgress.lessonId, lessons.id), eq(userProgress.userId, user.id)))
      .where(and(...whereConditions))
      .orderBy(orderByClause)
      .limit(limitNum)
      .offset(offset);

    // Format lessons with progress data
    const formattedLessons = allLessons.map((lesson) => ({
      ...lesson,
      progress:
        lesson.progressPercentage !== null
          ? {
              progressPercentage: lesson.progressPercentage,
              isCompleted: lesson.isCompleted,
              completedAt: lesson.completedAt,
              lastAccessed: lesson.lastAccessed,
            }
          : null,
      // Remove progress fields from root level
      progressPercentage: undefined,
      isCompleted: undefined,
      completedAt: undefined,
      lastAccessed: undefined,
    }));

    res.json({
      success: true,
      data: {
        lessons: formattedLessons,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: totalCount,
          totalPages: totalPages,
          hasNext: pageNum < totalPages,
          hasPrev: pageNum > 1,
        },
        filters: {
          search: search || null,
          subjectIds: subjectIds || null,
          difficultyLevel: difficultyLevel || null,
          sortBy,
          sortOrder,
        },
      },
    });
  } catch (error) {
    console.error("Get all lessons error:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
    });
  }
});

/**
 * @swagger
 * /api/v1/lessons/{id}:
 *   get:
 *     summary: Get lesson by ID with examples and practice questions
 *     tags: [Lessons]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Lesson ID
 *     responses:
 *       200:
 *         description: Lesson retrieved successfully
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
 *                   example: "Lesson retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     lesson:
 *                       $ref: '#/components/schemas/Lesson'
 *                     examples:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           arabicText:
 *                             type: string
 *                           transliteration:
 *                             type: string
 *                           translation:
 *                             type: string
 *                           audioUrl:
 *                             type: string
 *                             nullable: true
 *                     practiceQuestions:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/PracticeQuestion'
 *                     isCompleted:
 *                       type: boolean
 *                       description: Whether user has completed this lesson
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
 *       404:
 *         description: Lesson not found
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
router.get("/:id", authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const lessonId = parseInt(req.params.id);
    const user = req.user!;

    if (isNaN(lessonId)) {
      return res.status(400).json({
        success: false,
        message: "ID lesson tidak valid",
      });
    }

    // Get lesson details with enhanced fields
    const lesson = await db
      .select({
        id: lessons.id,
        topicId: lessons.topicId,
        title: lessons.title,
        content: lessons.content,
        summary: lessons.summary,
        orderIndex: lessons.orderIndex,
        estimatedDuration: lessons.estimatedDuration,
        difficultyLevel: lessons.difficultyLevel,
        difficultySubLevel: lessons.difficultySubLevel,
        learningObjectives: lessons.learningObjectives,
        prerequisites: lessons.prerequisites,
        keyConcepts: lessons.keyConcepts,
        practicalApplications: lessons.practicalApplications,
        mediaContent: lessons.mediaContent,
        isActive: lessons.isActive,
        createdAt: lessons.createdAt,
        updatedAt: lessons.updatedAt,
      })
      .from(lessons)
      .where(eq(lessons.id, lessonId))
      .limit(1);

    if (lesson.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Lesson tidak ditemukan",
      });
    }

    // Get lesson examples
    const examples = await db
      .select({
        id: lessonExamples.id,
        title: lessonExamples.title,
        content: lessonExamples.content,
        explanation: lessonExamples.explanation,
        orderIndex: lessonExamples.orderIndex,
        exampleType: lessonExamples.exampleType,
        mediaUrl: lessonExamples.mediaUrl,
      })
      .from(lessonExamples)
      .where(eq(lessonExamples.lessonId, lessonId))
      .orderBy(lessonExamples.orderIndex);

    // Get practice questions with options
    const questions = await db
      .select({
        id: practiceQuestions.id,
        type: practiceQuestions.type,
        question: practiceQuestions.question,
        explanation: practiceQuestions.explanation,
        difficultyLevel: practiceQuestions.difficultyLevel,
        points: practiceQuestions.points,
        orderIndex: practiceQuestions.orderIndex,
      })
      .from(practiceQuestions)
      .where(eq(practiceQuestions.lessonId, lessonId))
      .orderBy(practiceQuestions.orderIndex);

    // Get options for each question
    const questionsWithOptions = await Promise.all(
      questions.map(async (question) => {
        const options = await db
          .select({
            id: questionOptions.id,
            optionText: questionOptions.optionText,
            isCorrect: questionOptions.isCorrect,
            orderIndex: questionOptions.orderIndex,
          })
          .from(questionOptions)
          .where(eq(questionOptions.questionId, question.id))
          .orderBy(questionOptions.orderIndex);

        return {
          ...question,
          options,
        };
      })
    );

    // Check user progress for this lesson
    const progress = await db
      .select()
      .from(userProgress)
      .where(and(eq(userProgress.userId, user.id), eq(userProgress.lessonId, lessonId)))
      .limit(1);

    // Update lastAccessed when user views lesson detail
    const now = new Date().toISOString();
    if (progress.length > 0) {
      // Update existing progress with lastAccessed
      await db
        .update(userProgress)
        .set({
          lastAccessed: now,
        })
        .where(eq(userProgress.id, progress[0].id));
    } else {
      // Create new progress record with lastAccessed
      await db.insert(userProgress).values({
        userId: user.id,
        lessonId: lessonId,
        progressPercentage: 0,
        isCompleted: false,
        lastAccessed: now,
      });
    }

    // Safe JSON parsing function
    const safeJsonParse = (jsonString: string | null): string[] | object | null => {
      if (!jsonString) return null;

      // If it's already an object, return as is
      if (typeof jsonString === "object") {
        return jsonString;
      }

      // If it's a string, try to parse it as JSON first
      if (typeof jsonString === "string") {
        try {
          return JSON.parse(jsonString);
        } catch (error) {
          // If JSON parsing fails, treat as comma-separated string and convert to array
          if (jsonString.includes(",")) {
            return jsonString
              .split(",")
              .map((item) => item.trim())
              .filter((item) => item.length > 0);
          }
          // If no comma, return as single item array
          return jsonString.trim() ? [jsonString.trim()] : [];
        }
      }

      return null;
    };

    // Parse JSON fields for better frontend consumption
    const lessonData = {
      ...lesson[0],
      learningObjectives: safeJsonParse(lesson[0].learningObjectives) || [],
      prerequisites: safeJsonParse(lesson[0].prerequisites) || [],
      keyConcepts: safeJsonParse(lesson[0].keyConcepts) || [],
      practicalApplications: safeJsonParse(lesson[0].practicalApplications) || [],
      mediaContent: safeJsonParse(lesson[0].mediaContent),
    };

    res.json({
      success: true,
      data: {
        lesson: lessonData,
        examples,
        questions: questionsWithOptions,
        progress: progress.length > 0 ? progress[0] : null,
      },
    });
  } catch (error) {
    console.error("Get lesson error:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
    });
  }
});

/**
 * @swagger
 * /api/v1/lessons/{id}/complete:
 *   post:
 *     summary: Mark lesson as completed
 *     tags: [Lessons]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Lesson ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - studyTime
 *             properties:
 *               studyTime:
 *                 type: integer
 *                 description: Study time in minutes
 *                 minimum: 1
 *     responses:
 *       200:
 *         description: Lesson marked as completed successfully
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
 *                   example: "Lesson completed successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     progress:
 *                       $ref: '#/components/schemas/UserProgress'
 *       400:
 *         description: Invalid lesson ID or study time
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
 *         description: Lesson not found
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
router.post("/:id/complete", authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const lessonId = parseInt(req.params.id);
    const user = req.user!;
    const { studyTime } = req.body;

    if (isNaN(lessonId)) {
      return res.status(400).json({
        success: false,
        message: "ID lesson tidak valid",
      });
    }

    // Verify lesson exists
    const lesson = await db.select({ id: lessons.id }).from(lessons).where(eq(lessons.id, lessonId)).limit(1);

    if (lesson.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Lesson tidak ditemukan",
      });
    }

    // Check if progress already exists
    const existingProgress = await db
      .select()
      .from(userProgress)
      .where(and(eq(userProgress.userId, user.id), eq(userProgress.lessonId, lessonId)))
      .limit(1);

    if (existingProgress.length > 0) {
      // Update existing progress
      await db
        .update(userProgress)
        .set({
          isCompleted: true,
          completedAt: new Date().toISOString(),
          timeSpent: studyTime || existingProgress[0].timeSpent,
        })
        .where(and(eq(userProgress.userId, user.id), eq(userProgress.lessonId, lessonId)));
    } else {
      // Create new progress record
      await db.insert(userProgress).values({
        userId: user.id,
        lessonId,
        isCompleted: true,
        completedAt: new Date().toISOString(),
        timeSpent: studyTime || 0,
      });
    }

    res.json({
      success: true,
      message: "Lesson berhasil diselesaikan",
    });
  } catch (error) {
    console.error("Complete lesson error:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
    });
  }
});

export default router;
