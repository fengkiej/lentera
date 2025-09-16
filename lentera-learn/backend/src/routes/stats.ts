import { Router, Response } from "express";
import { db } from "../db/connection";
import { userStats, userProgress, lessons, subjects, topics } from "../db/schema";
import { eq, and, count, sql } from "drizzle-orm";
import { authenticate, AuthenticatedRequest } from "../middleware/auth";

const router = Router();

/**
 * @swagger
 * /api/v1/stats/overview:
 *   get:
 *     summary: Get user's overall statistics
 *     tags: [Statistics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User statistics retrieved successfully
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
 *                   example: "User statistics retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalStudyTime:
 *                       type: integer
 *                       description: Total study time in minutes
 *                     currentStreak:
 *                       type: integer
 *                       description: Current study streak in days
 *                     longestStreak:
 *                       type: integer
 *                       description: Longest study streak in days
 *                     totalPoints:
 *                       type: integer
 *                       description: Total points earned
 *                     lessonsCompleted:
 *                       type: integer
 *                       description: Number of lessons completed
 *                     practiceQuestionsAnswered:
 *                       type: integer
 *                       description: Number of practice questions answered
 *                     correctAnswers:
 *                       type: integer
 *                       description: Number of correct answers
 *                     accuracy:
 *                       type: number
 *                       format: float
 *                       description: Overall accuracy percentage
 *                     lastStudyDate:
 *                       type: string
 *                       format: date-time
 *                       nullable: true
 *                       description: Last study date
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
router.get("/overview", authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    
    // Get user stats
    const stats = await db
      .select()
      .from(userStats)
      .where(eq(userStats.userId, user.id))
      .limit(1);

    const userStatsData = stats.length > 0 ? stats[0] : {
      userId: user.id,
      totalStudyTime: 0,
      currentStreak: 0,
      longestStreak: 0,
      totalPoints: 0,
      lessonsCompleted: 0,
      practiceQuestionsAnswered: 0,
      correctAnswers: 0,
      lastStudyDate: null,
      updatedAt: new Date().toISOString(),
    };

    // Get completed lessons count
    const completedLessons = await db
      .select({ count: count() })
      .from(userProgress)
      .where(
        and(
          eq(userProgress.userId, user.id),
          eq(userProgress.isCompleted, true)
        )
      );

    // Get total lessons count
    const totalLessons = await db
      .select({ count: count() })
      .from(lessons)
      .where(eq(lessons.isActive, true));

    // Calculate accuracy
    const practiceAnswered = userStatsData.practiceQuestionsAnswered || 0;
    const correctAnswers = userStatsData.correctAnswers || 0;
    const accuracy = practiceAnswered > 0 ? (correctAnswers / practiceAnswered) * 100 : 0;

    // Calculate progress percentage
    const progressPercentage = totalLessons[0].count > 0 
      ? (completedLessons[0].count / totalLessons[0].count) * 100 
      : 0;

    res.json({
      success: true,
      data: {
        overview: {
          totalStudyTime: userStatsData.totalStudyTime || 0,
          currentStreak: userStatsData.currentStreak || 0,
          longestStreak: userStatsData.longestStreak || 0,
          totalPoints: userStatsData.totalPoints || 0,
          lessonsCompleted: completedLessons[0].count,
          totalLessons: totalLessons[0].count,
          progressPercentage: Math.round(progressPercentage),
          practiceQuestionsAnswered: userStatsData.practiceQuestionsAnswered || 0,
          correctAnswers: userStatsData.correctAnswers || 0,
          accuracy: Math.round(accuracy),
          lastStudyDate: userStatsData.lastStudyDate,
        },
      },
    });
  } catch (error) {
    console.error("Get stats overview error:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
    });
  }
});

/**
 * @swagger
 * /api/v1/stats/progress/subjects:
 *   get:
 *     summary: Get user's progress by subject
 *     tags: [Statistics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Subject progress retrieved successfully
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
 *                   example: "Subject progress retrieved successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       subjectId:
 *                         type: integer
 *                         description: Subject ID
 *                       subjectName:
 *                         type: string
 *                         description: Subject name
 *                       totalLessons:
 *                         type: integer
 *                         description: Total lessons in subject
 *                       completedLessons:
 *                         type: integer
 *                         description: Completed lessons in subject
 *                       progressPercentage:
 *                         type: number
 *                         format: float
 *                         description: Progress percentage
 *                       lastStudied:
 *                         type: string
 *                         format: date-time
 *                         nullable: true
 *                         description: Last study date for this subject
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
router.get("/progress/subjects", authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    
    // Get progress by subject
    const subjectProgress = await db
      .select({
        subjectId: subjects.id,
        subjectName: subjects.name,
        subjectIcon: subjects.icon,
        subjectColor: subjects.color,
        totalLessons: count(lessons.id),
        completedLessons: sql<number>`SUM(CASE WHEN ${userProgress.isCompleted} = 1 THEN 1 ELSE 0 END)`,
      })
      .from(subjects)
      .innerJoin(topics, eq(topics.subjectId, subjects.id))
      .innerJoin(lessons, eq(lessons.topicId, topics.id))
      .leftJoin(
        userProgress,
        and(
          eq(userProgress.lessonId, lessons.id),
          eq(userProgress.userId, user.id)
        )
      )
      .where(eq(subjects.isActive, true))
      .groupBy(subjects.id, subjects.name, subjects.icon, subjects.color)
      .orderBy(subjects.orderIndex);

    // Calculate progress percentage for each subject
    const progressWithPercentage = subjectProgress.map((subject) => ({
      ...subject,
      progressPercentage: subject.totalLessons > 0 
        ? Math.round((subject.completedLessons / subject.totalLessons) * 100) 
        : 0,
    }));

    res.json({
      success: true,
      data: {
        subjects: progressWithPercentage,
      },
    });
  } catch (error) {
    console.error("Get subject progress error:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
    });
  }
});

/**
 * @swagger
 * /api/v1/stats/activity/recent:
 *   get:
 *     summary: Get user's recent activity
 *     tags: [Statistics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of recent activities to retrieve
 *     responses:
 *       200:
 *         description: Recent activity retrieved successfully
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
 *                   example: "Recent activity retrieved successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: Activity ID
 *                       lessonId:
 *                         type: integer
 *                         description: Lesson ID
 *                       lessonTitle:
 *                         type: string
 *                         description: Lesson title
 *                       subjectName:
 *                         type: string
 *                         description: Subject name
 *                       topicName:
 *                         type: string
 *                         description: Topic name
 *                       completedAt:
 *                         type: string
 *                         format: date-time
 *                         description: When the lesson was completed
 *                       studyTime:
 *                         type: integer
 *                         description: Study time in minutes
 *                       pointsEarned:
 *                         type: integer
 *                         description: Points earned from the lesson
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
router.get("/activity/recent", authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = (req as AuthenticatedRequest).user!;
    const limit = parseInt(req.query.limit as string) || 10;
    
    // Get recent lesson completions
    const recentLessons = await db
      .select({
        type: sql<string>`'lesson_completed'`,
        lessonId: lessons.id,
        lessonTitle: lessons.title,
        topicName: topics.name,
        subjectName: subjects.name,
        completedAt: userProgress.completedAt,
        timeSpent: userProgress.timeSpent,
      })
      .from(userProgress)
      .innerJoin(lessons, eq(userProgress.lessonId, lessons.id))
      .innerJoin(topics, eq(lessons.topicId, topics.id))
      .innerJoin(subjects, eq(topics.subjectId, subjects.id))
      .where(
        and(
          eq(userProgress.userId, user.id),
          eq(userProgress.isCompleted, true)
        )
      )
      .orderBy(sql`${userProgress.completedAt} DESC`)
      .limit(limit);

    // For now, we'll skip practice sessions due to schema complexity
    // In a real implementation, you'd need to join through practiceQuestions
    const recentPractice: typeof recentLessons = [];

    // Combine and sort activities
    const allActivities = [...recentLessons, ...recentPractice]
      .sort((a, b) => {
        const dateA = new Date(a.completedAt || 0);
        const dateB = new Date(b.completedAt || 0);
        return dateB.getTime() - dateA.getTime();
      })
      .slice(0, limit);

    res.json({
      success: true,
      data: {
        activities: allActivities,
      },
    });
  } catch (error) {
    console.error("Get recent activity error:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
    });
  }
});

export default router;