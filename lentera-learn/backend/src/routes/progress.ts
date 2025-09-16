import { Router, Response } from "express";
import { z } from "zod";
import { db } from "../db/connection";
import { userProgress, lessons, userStats, achievements, userAchievements, subjects, topics } from "../db/schema";
import { eq, and, desc, asc, sql, isNull, isNotNull } from "drizzle-orm";
import { createError, asyncHandler } from "../middleware/errorHandling.js";
import { authenticate, AuthenticatedRequest } from "../middleware/auth";

const router = Router();

// Validation schemas
const updateProgressSchema = z.object({
  lessonId: z.number().int().positive(),
  progressPercentage: z.number().min(0).max(100),
  completed: z.boolean().optional(),
});

const getProgressSchema = z.object({
  page: z
    .string()
    .transform((val) => parseInt(val))
    .pipe(z.number().min(1))
    .optional()
    .default("1"),
  limit: z
    .string()
    .transform((val) => parseInt(val))
    .pipe(z.number().min(1).max(50))
    .optional()
    .default("10"),
  sortBy: z.enum(["lesson", "progress", "lastAccessed"]).optional().default("lastAccessed"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
  completed: z
    .string()
    .transform((val) => val === "true")
    .optional(),
});

// All routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /api/v1/progress:
 *   get:
 *     summary: Get user's learning progress
 *     tags: [Progress]
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *           maximum: 50
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [lesson, progress, lastAccessed]
 *           default: lastAccessed
 *         description: Field to sort by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *       - in: query
 *         name: completed
 *         schema:
 *           type: boolean
 *         description: Filter by completion status
 *     responses:
 *       200:
 *         description: User progress retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         progress:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/UserProgress'
 *                         pagination:
 *                           type: object
 *                           properties:
 *                             page:
 *                               type: integer
 *                             limit:
 *                               type: integer
 *                             total:
 *                               type: integer
 *                             totalPages:
 *                               type: integer
 *                             hasNext:
 *                               type: boolean
 *                             hasPrev:
 *                               type: boolean
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  "/",
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const validatedQuery = getProgressSchema.parse(req.query);
    const { page, limit, sortBy, sortOrder, completed } = validatedQuery;
    const offset = (page - 1) * limit;

    // Build where conditions
    const whereConditions = [eq(userProgress.userId, req.user!.id)];
    if (completed !== undefined) {
      whereConditions.push(completed ? isNotNull(userProgress.completedAt) : isNull(userProgress.completedAt));
    }

    // Determine sorting
    let orderByClause;
    switch (sortBy) {
      case "lesson":
        orderByClause = sortOrder === "asc" ? asc(lessons.orderIndex) : desc(lessons.orderIndex);
        break;
      case "progress":
        orderByClause = sortOrder === "asc" ? asc(userProgress.progressPercentage) : desc(userProgress.progressPercentage);
        break;
      case "lastAccessed":
      default:
        orderByClause = sortOrder === "asc" ? asc(userProgress.lastAccessed) : desc(userProgress.lastAccessed);
        break;
    }

    // Build query with lesson details
    const progressData = await db
      .select({
        id: userProgress.id,
        userId: userProgress.userId,
        lessonId: userProgress.lessonId,
        progressPercentage: userProgress.progressPercentage,
        completedAt: userProgress.completedAt,
        lastAccessed: userProgress.lastAccessed,
        // Lesson details
        lessonTitle: lessons.title,
        lessonSummary: lessons.summary,
        lessonDifficulty: lessons.difficultyLevel,
        lessonOrderIndex: lessons.orderIndex,
      })
      .from(userProgress)
      .innerJoin(lessons, eq(userProgress.lessonId, lessons.id))
      .where(and(...whereConditions))
      .orderBy(orderByClause)
      .limit(limit)
      .offset(offset);

    // Get total count
    const countQuery = db
      .select({ count: sql<number>`count(*)` })
      .from(userProgress)
      .where(and(...whereConditions));

    const totalResult = await countQuery;
    const total = totalResult[0].count;

    res.json({
      success: true,
      data: {
        progress: progressData,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1,
        },
      },
    });
  })
);

/**
 * @swagger
 * /api/v1/progress/summary:
 *   get:
 *     summary: Get user's progress summary
 *     tags: [Progress]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User progress summary retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         summary:
 *                           type: object
 *                           properties:
 *                             totalLessons:
 *                               type: integer
 *                               description: Total number of lessons available
 *                             startedLessons:
 *                               type: integer
 *                               description: Number of lessons user has started
 *                             completedLessons:
 *                               type: integer
 *                               description: Number of lessons user has completed
 *                             completionRate:
 *                               type: integer
 *                               description: Completion rate percentage
 *                             averageProgress:
 *                               type: integer
 *                               description: Average progress across all started lessons
 *                             currentStreak:
 *                               type: integer
 *                               description: Current consecutive days streak
 *                         recentActivity:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               lessonId:
 *                                 type: integer
 *                               progressPercentage:
 *                                 type: integer
 *                               lastAccessed:
 *                                 type: string
 *                                 format: date-time
 *                               lessonTitle:
 *                                 type: string
 *                               lessonMeaning:
 *                                 type: string
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  "/summary",
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    // Get total lessons count
    const totalLessonsResult = await db.select({ count: sql<number>`count(*)` }).from(lessons);
    const totalLessons = totalLessonsResult[0].count;

    // Get user's progress data
    const userProgressData = await db
      .select({
        progressPercentage: userProgress.progressPercentage,
        isCompleted: userProgress.isCompleted,
      })
      .from(userProgress)
      .where(eq(userProgress.userId, req.user!.id));

    // Calculate statistics
    const startedLessons = userProgressData.length;
    const completedLessons = userProgressData.filter((p) => p.isCompleted).length;
    const averageProgress = startedLessons > 0 ? Math.round(userProgressData.reduce((sum, p) => sum + (p.progressPercentage || 0), 0) / startedLessons) : 0;

    // Calculate overall progress percentage based on completed lessons
    const progressPercentage = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentActivity = await db
      .select({
        lessonId: userProgress.lessonId,
        progressPercentage: userProgress.progressPercentage,
        lastAccessed: userProgress.lastAccessed,
        lessonTitle: lessons.title,
        lessonSummary: lessons.summary,
      })
      .from(userProgress)
      .innerJoin(lessons, eq(userProgress.lessonId, lessons.id))
      .where(
        and(
          eq(userProgress.userId, req.user!.id)
          // Note: SQLite date comparison might need adjustment based on your date format
        )
      )
      .orderBy(desc(userProgress.lastAccessed))
      .limit(5);

    // Get user stats for consistent data
    const userStatsData = await db.select().from(userStats).where(eq(userStats.userId, req.user!.id)).limit(1);
    const stats = userStatsData[0] || {
      currentStreak: 0,
      longestStreak: 0,
      lessonsCompleted: completedLessons,
      totalPoints: completedLessons * 100,
    };

    // Get subjects and topics count for better learning overview
    const totalSubjectsResult = await db
      .select({ count: sql<number>`count(distinct ${subjects.id})` })
      .from(subjects)
      .where(eq(subjects.isActive, true));
    const totalSubjects = totalSubjectsResult[0].count;

    const totalTopicsResult = await db
      .select({ count: sql<number>`count(distinct ${topics.id})` })
      .from(topics)
      .innerJoin(subjects, eq(topics.subjectId, subjects.id))
      .where(and(eq(topics.isActive, true), eq(subjects.isActive, true)));
    const totalTopics = totalTopicsResult[0].count;

    // Get completed topics count
    const completedTopicsResult = await db
      .select({
        topicId: lessons.topicId,
        totalLessons: sql<number>`count(${lessons.id})`,
        completedLessons: sql<number>`count(case when ${userProgress.isCompleted} = true then 1 end)`,
      })
      .from(lessons)
      .innerJoin(topics, eq(lessons.topicId, topics.id))
      .innerJoin(subjects, eq(topics.subjectId, subjects.id))
      .leftJoin(userProgress, and(eq(userProgress.lessonId, lessons.id), eq(userProgress.userId, req.user!.id)))
      .where(and(eq(lessons.isActive, true), eq(topics.isActive, true), eq(subjects.isActive, true)))
      .groupBy(lessons.topicId);

    const completedTopics = completedTopicsResult.filter((topic) => topic.totalLessons > 0 && topic.completedLessons === topic.totalLessons).length;

    res.json({
      success: true,
      data: {
        // General learning statistics
        totalLessons,
        startedLessons,
        completedLessons,
        totalSubjects,
        totalTopics,
        completedTopics,

        // Progress metrics
        completionRate: totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0,
        progressPercentage: Math.round(progressPercentage * 100) / 100,
        averageProgress,
        averageScore: 0, // Placeholder for future implementation

        // User engagement metrics
        totalTimeSpent: 0, // Placeholder - implement based on your needs
        streakDays: stats.currentStreak || 0,
        currentStreak: stats.currentStreak || 0,
        level: "Pemula", // Placeholder for level system
        points: stats.totalPoints || completedLessons * 100,

        // Activity data
        recentActivity,
      },
    });
  })
);

/**
 * @swagger
 * /api/v1/progress/continue-learning:
 *   get:
 *     summary: Get lessons for continue learning section
 *     tags: [Progress]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 3
 *         description: Maximum number of lessons to return
 *     responses:
 *       200:
 *         description: Continue learning lessons retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           rootWord:
 *                             type: string
 *                           meaning:
 *                             type: string
 *                           difficulty:
 *                             type: string
 *                           progressPercentage:
 *                             type: integer
 *                           orderIndex:
 *                             type: integer
 *                           surahNumber:
 *                             type: integer
 *                             nullable: true
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  "/continue-learning",
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const limit = parseInt(req.query.limit as string) || 3;

    // Get lessons with progress (prioritized)
    const lessonsWithProgress = await db
      .select({
        id: lessons.id,
        title: lessons.title,
        summary: lessons.summary,
        content: lessons.content,
        orderIndex: lessons.orderIndex,
        topicId: lessons.topicId,
        topicName: topics.name,
        topicOrderIndex: topics.orderIndex,
        subjectId: subjects.id,
        subjectName: subjects.name,
        subjectOrderIndex: subjects.orderIndex,
        progressPercentage: userProgress.progressPercentage,
        isCompleted: userProgress.isCompleted,
        lastAccessed: userProgress.lastAccessed,
      })
      .from(lessons)
      .innerJoin(topics, eq(lessons.topicId, topics.id))
      .innerJoin(subjects, eq(topics.subjectId, subjects.id))
      .innerJoin(userProgress, and(eq(userProgress.lessonId, lessons.id), eq(userProgress.userId, req.user!.id)))
      .where(
        and(
          eq(lessons.isActive, true),
          eq(topics.isActive, true),
          eq(subjects.isActive, true),
          // Only get lessons that are not completed but have progress
          sql`(${userProgress.isCompleted} = false AND ${userProgress.progressPercentage} > 0)`
        )
      )
      .orderBy(desc(userProgress.lastAccessed))
      .limit(limit);

    let finalLessons = lessonsWithProgress;

    // If no lessons with progress found, get suggestion lessons
    if (lessonsWithProgress.length === 0) {
      const suggestionLessons = await db
        .select({
          id: lessons.id,
          title: lessons.title,
          summary: lessons.summary,
          content: lessons.content,
          orderIndex: lessons.orderIndex,
          topicId: lessons.topicId,
          topicName: topics.name,
          topicOrderIndex: topics.orderIndex,
          subjectId: subjects.id,
          subjectName: subjects.name,
          subjectOrderIndex: subjects.orderIndex,
          progressPercentage: sql<number>`0`,
          isCompleted: sql<boolean>`false`,
          lastAccessed: sql<string>`NULL`,
        })
        .from(lessons)
        .innerJoin(topics, eq(lessons.topicId, topics.id))
        .innerJoin(subjects, eq(topics.subjectId, subjects.id))
        .leftJoin(userProgress, and(eq(userProgress.lessonId, lessons.id), eq(userProgress.userId, req.user!.id)))
        .where(
          and(
            eq(lessons.isActive, true),
            eq(topics.isActive, true),
            eq(subjects.isActive, true),
            // Only get lessons that have no progress record or are not completed
            sql`(${userProgress.id} IS NULL OR (${userProgress.isCompleted} = false AND ${userProgress.progressPercentage} = 0))`
          )
        )
        .orderBy(asc(subjects.orderIndex), asc(topics.orderIndex), asc(lessons.orderIndex))
        .limit(1);

      finalLessons = suggestionLessons;
    }

    // Format the response
    const formattedLessons = finalLessons.map((lesson) => ({
      id: lesson.id,
      title: lesson.title,
      summary: lesson.summary,
      content: lesson.content,
      progressPercentage: lesson.progressPercentage || 0,
      orderIndex: lesson.orderIndex,
      topicName: lesson.topicName,
      subjectName: lesson.subjectName,
    }));

    res.json({
      success: true,
      data: formattedLessons,
    });
  })
);

/**
 * @swagger
 * /api/v1/progress/lesson/{lessonId}:
 *   get:
 *     summary: Get progress for specific lesson
 *     tags: [Progress]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: lessonId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the lesson
 *     responses:
 *       200:
 *         description: Lesson progress retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         lesson:
 *                           $ref: '#/components/schemas/Lesson'
 *                         progress:
 *                           allOf:
 *                             - $ref: '#/components/schemas/UserProgress'
 *                             - type: object
 *                               nullable: true
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
 */
router.get(
  "/lesson/:lessonId",
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const lessonId = parseInt(req.params.lessonId);

    if (isNaN(lessonId)) {
      throw createError("Invalid lesson ID", 400);
    }

    // Check if lesson exists
    const lesson = await db.select().from(lessons).where(eq(lessons.id, lessonId)).limit(1);

    if (!lesson.length) {
      throw createError("Lesson not found", 404);
    }

    // Get user's progress for this lesson
    const progress = await db
      .select()
      .from(userProgress)
      .where(and(eq(userProgress.userId, req.user!.id), eq(userProgress.lessonId, lessonId)))
      .limit(1);

    const progressData = progress.length ? progress[0] : null;

    res.json({
      success: true,
      data: {
        lesson: lesson[0],
        progress: progressData,
      },
    });
  })
);

/**
 * @swagger
 * /api/v1/progress/update:
 *   post:
 *     summary: Update or create lesson progress
 *     tags: [Progress]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - lessonId
 *               - progressPercentage
 *             properties:
 *               lessonId:
 *                 type: integer
 *                 minimum: 1
 *                 description: ID of the lesson
 *               progressPercentage:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 100
 *                 description: Progress percentage (0-100)
 *               completed:
 *                 type: boolean
 *                 description: Whether the lesson is completed
 *     responses:
 *       200:
 *         description: Progress updated or created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         progress:
 *                           $ref: '#/components/schemas/UserProgress'
 *       400:
 *         description: Validation error
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
 */
router.post(
  "/update",
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const validatedData = updateProgressSchema.parse(req.body);
    const { lessonId, progressPercentage, completed } = validatedData;

    // Check if lesson exists
    const lesson = await db.select({ id: lessons.id }).from(lessons).where(eq(lessons.id, lessonId)).limit(1);

    if (!lesson.length) {
      throw createError("Lesson not found", 404);
    }

    // Check if progress already exists
    const existingProgress = await db
      .select()
      .from(userProgress)
      .where(and(eq(userProgress.userId, req.user!.id), eq(userProgress.lessonId, lessonId)))
      .limit(1);

    const now = new Date().toISOString();
    const completedAt = completed || progressPercentage === 100 ? now : null;

    if (existingProgress.length) {
      // Update existing progress
      const updatedProgress = await db
        .update(userProgress)
        .set({
          progressPercentage,
          isCompleted: completed || progressPercentage === 100,
          completedAt,
          lastAccessed: now,
        })
        .where(and(eq(userProgress.userId, req.user!.id), eq(userProgress.lessonId, lessonId)))
        .returning();

      // Update user stats if lesson completed
      if (completed || progressPercentage === 100) {
        await updateUserStats(req.user!.id);
        await checkAndAwardAchievements(req.user!.id);
      }

      res.json({
        success: true,
        message: "Progress updated successfully",
        data: {
          progress: updatedProgress[0],
        },
      });
    } else {
      // Create new progress
      const newProgress = await db
        .insert(userProgress)
        .values({
          userId: req.user!.id,
          lessonId,
          progressPercentage,
          isCompleted: completed || progressPercentage === 100,
          completedAt,
          lastAccessed: now,
        })
        .returning();

      // Update user stats
      await updateUserStats(req.user!.id);
      await checkAndAwardAchievements(req.user!.id);

      res.json({
        success: true,
        message: "Progress created successfully",
        data: {
          progress: newProgress[0],
        },
      });
    }
  })
);

/**
 * @swagger
 * /api/v1/progress/lesson/{lessonId}:
 *   delete:
 *     summary: Reset progress for specific lesson
 *     tags: [Progress]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: lessonId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the lesson
 *     responses:
 *       200:
 *         description: Progress reset successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
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
 *         description: Progress not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete(
  "/lesson/:lessonId",
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const lessonId = parseInt(req.params.lessonId);

    if (isNaN(lessonId)) {
      throw createError("Invalid lesson ID", 400);
    }

    // Check if progress exists
    const existingProgress = await db
      .select()
      .from(userProgress)
      .where(and(eq(userProgress.userId, req.user!.id), eq(userProgress.lessonId, lessonId)))
      .limit(1);

    if (!existingProgress.length) {
      throw createError("Progress not found", 404);
    }

    // Delete progress
    await db.delete(userProgress).where(and(eq(userProgress.userId, req.user!.id), eq(userProgress.lessonId, lessonId)));

    res.json({
      success: true,
      message: "Progress reset successfully",
    });
  })
);

// Helper function to update user stats
async function updateUserStats(userId: string) {
  // Get current stats
  const currentStats = await db.select().from(userStats).where(eq(userStats.userId, userId)).limit(1);

  // Calculate completed lessons count
  const completedLessonsResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(userProgress)
    .where(and(eq(userProgress.userId, userId), eq(userProgress.isCompleted, true)));

  const completedLessons = completedLessonsResult[0]?.count || 0;

  // Calculate points from completed lessons (100 points per completed lesson)
  const lessonPoints = completedLessons * 100;

  // Calculate points from earned achievements
  const achievementPointsResult = await db
    .select({
      totalAchievementPoints: sql<number>`COALESCE(SUM(${achievements.points}), 0)`,
    })
    .from(userAchievements)
    .innerJoin(achievements, eq(userAchievements.achievementId, achievements.id))
    .where(eq(userAchievements.userId, userId));

  const achievementPoints = achievementPointsResult[0]?.totalAchievementPoints || 0;

  // Calculate total points (lessons + achievements)
  const totalPoints = lessonPoints + achievementPoints;

  if (currentStats.length) {
    // Update existing stats
    await db
      .update(userStats)
      .set({
        lessonsCompleted: completedLessons,
        totalPoints: totalPoints,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(userStats.userId, userId));
  } else {
    // Create new stats
    await db.insert(userStats).values({
      userId,
      lessonsCompleted: completedLessons,
      totalPoints: totalPoints,
      updatedAt: new Date().toISOString(),
    });
  }
}

// Helper function to check and award achievements
async function checkAndAwardAchievements(userId: string) {
  // Get user stats
  const stats = await db.select().from(userStats).where(eq(userStats.userId, userId)).limit(1);

  if (!stats.length) return;

  const userStatsData = stats[0];

  // Get all achievements
  const allAchievements = await db.select().from(achievements);

  // Get user's current achievements
  const userCurrentAchievements = await db.select({ achievementId: userAchievements.achievementId }).from(userAchievements).where(eq(userAchievements.userId, userId));

  const earnedAchievementIds = userCurrentAchievements.map((ua) => ua.achievementId);

  // Check each achievement
  for (const achievement of allAchievements) {
    // Skip if already earned
    if (earnedAchievementIds.includes(achievement.id)) continue;

    let shouldAward = false;

    switch (achievement.conditionType) {
      case "lessons_completed":
        shouldAward = (userStatsData.lessonsCompleted || 0) >= achievement.conditionValue;
        break;
      case "streak":
        shouldAward = (userStatsData.currentStreak || 0) >= achievement.conditionValue;
        break;
      case "longest_streak":
        shouldAward = (userStatsData.longestStreak || 0) >= achievement.conditionValue;
        break;
      case "points":
        shouldAward = (userStatsData.totalPoints || 0) >= achievement.conditionValue;
        break;
      default:
        break;
    }

    // Award achievement if conditions are met
    if (shouldAward) {
      await db.insert(userAchievements).values({
        userId,
        achievementId: achievement.id,
        earnedAt: new Date().toISOString(),
      });
    }
  }
}

export default router;
