import { Router, Response } from "express";
import { z } from "zod";
import { db } from "../db/connection";
import { users, userStats, userAchievements, achievements, userProgress } from "../db/schema";
import { eq, and, sql } from "drizzle-orm";
import { createError, asyncHandler } from "../middleware/errorHandling.js";
import { authenticate, AuthenticatedRequest } from "../middleware/auth";

const router = Router();

// Validation schemas
const updateProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50).optional(),
  avatarUrl: z.string().url("Invalid URL format").optional(),
});

/**
 * @swagger
 * /api/v1/user/profile:
 *   get:
 *     summary: Get user profile
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
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
 *                         user:
 *                           $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  "/profile",
  authenticate,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const user = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        avatarUrl: users.avatarUrl,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .where(eq(users.id, req.user!.id))
      .limit(1);

    if (!user.length) {
      throw createError("User not found", 404);
    }

    res.json({
      success: true,
      data: {
        user: user[0],
      },
    });
  })
);

/**
 * @swagger
 * /api/v1/user/profile:
 *   put:
 *     summary: Update user profile
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 50
 *                 description: User's full name
 *               avatarUrl:
 *                 type: string
 *                 format: uri
 *                 description: URL to user's avatar image
 *     responses:
 *       200:
 *         description: Profile updated successfully
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
 *                         user:
 *                           $ref: '#/components/schemas/User'
 *       400:
 *         description: Validation error or no fields to update
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
 */
router.put(
  "/profile",
  authenticate,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const validatedData = updateProfileSchema.parse(req.body);

    if (Object.keys(validatedData).length === 0) {
      throw createError("No valid fields to update", 400);
    }

    // Update user
    await db
      .update(users)
      .set({
        ...validatedData,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(users.id, req.user!.id));

    // Get updated user
    const updatedUser = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        avatarUrl: users.avatarUrl,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .where(eq(users.id, req.user!.id))
      .limit(1);

    res.json({
      success: true,
      message: "Profile updated successfully",
      data: {
        user: updatedUser[0],
      },
    });
  })
);

/**
 * @swagger
 * /api/v1/user/stats:
 *   get:
 *     summary: Get user statistics
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User statistics retrieved successfully
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
 *                         stats:
 *                           type: object
 *                           properties:
 *                             userId:
 *                               type: string
 *                             currentStreak:
 *                               type: integer
 *                               description: Current consecutive days streak
 *                             longestStreak:
 *                               type: integer
 *                               description: Longest consecutive days streak
 *                             updatedAt:
 *                               type: string
 *                               format: date-time
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  "/stats",
  authenticate,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const stats = await db.select().from(userStats).where(eq(userStats.userId, req.user!.id)).limit(1);

    if (!stats.length) {
      // Calculate current stats from user progress
      const completedLessonsResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(userProgress)
        .where(and(eq(userProgress.userId, req.user!.id), eq(userProgress.isCompleted, true)));

      const completedLessons = completedLessonsResult[0]?.count || 0;
      const totalPoints = completedLessons * 100;

      // Create default stats if they don't exist
      await db.insert(userStats).values({
        userId: req.user!.id,
        currentStreak: 0,
        longestStreak: 0,
        lessonsCompleted: completedLessons,
        totalPoints: totalPoints,
        updatedAt: new Date().toISOString(),
      });

      const newStats = await db.select().from(userStats).where(eq(userStats.userId, req.user!.id)).limit(1);

      res.json({
        success: true,
        data: newStats[0],
      });
      return;
    }

    res.json({
      success: true,
      data: stats[0],
    });
  })
);

/**
 * @swagger
 * /api/v1/user/achievements:
 *   get:
 *     summary: Get user achievements
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User achievements retrieved successfully
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
 *                         achievements:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: integer
 *                               name:
 *                                 type: string
 *                               description:
 *                                 type: string
 *                               icon:
 *                                 type: string
 *                               conditionType:
 *                                 type: string
 *                               conditionValue:
 *                                 type: integer
 *                               progress:
 *                                 type: integer
 *                                 minimum: 0
 *                                 maximum: 100
 *                               isEarned:
 *                                 type: boolean
 *                               earnedAt:
 *                                 type: string
 *                                 format: date-time
 *                                 nullable: true
 *                         totalAchievements:
 *                           type: integer
 *                         earnedAchievements:
 *                           type: integer
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  "/achievements",
  authenticate,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    // Get all achievements with user's earned status
    const allAchievements = await db
      .select({
        id: achievements.id,
        name: achievements.name,
        description: achievements.description,
        icon: achievements.icon,
        conditionType: achievements.conditionType,
        conditionValue: achievements.conditionValue,
        points: achievements.points,
        earnedAt: userAchievements.earnedAt,
      })
      .from(achievements)
      .leftJoin(userAchievements, and(eq(achievements.id, userAchievements.achievementId), eq(userAchievements.userId, req.user!.id)));

    // Get user stats to check achievement progress
    const stats = await db.select().from(userStats).where(eq(userStats.userId, req.user!.id)).limit(1);

    const userStatsData = stats[0] || {
      currentStreak: 0,
      longestStreak: 0,
    };

    // Format achievements with progress
    const formattedAchievements = allAchievements.map((achievement) => {
      let progress = 0;
      const isEarned = !!achievement.earnedAt;

      if (!isEarned) {
        switch (achievement.conditionType) {
          case "streak":
            progress = Math.min(((userStatsData.currentStreak || 0) / achievement.conditionValue) * 100, 100);
            break;
          case "longest_streak":
            progress = Math.min(((userStatsData.longestStreak || 0) / achievement.conditionValue) * 100, 100);
            break;
          case "lessons_completed":
            progress = Math.min(((userStatsData.lessonsCompleted || 0) / achievement.conditionValue) * 100, 100);
            break;
          default:
            progress = 0;
            break;
        }
      } else {
        progress = 100;
      }

      return {
        id: achievement.id,
        title: achievement.name,
        description: achievement.description,
        icon: achievement.icon,
        category: getAchievementCategory(achievement.conditionType),
        target: achievement.conditionValue,
        current: Math.round((progress / 100) * achievement.conditionValue),
        progress: Math.round(progress),
        unlocked: isEarned,
        points: achievement.points || 0,
        unlockedAt: achievement.earnedAt,
      };
    });

    res.json({
      success: true,
      data: {
        achievements: formattedAchievements,
        totalPoints: formattedAchievements.filter((a) => a.unlocked).reduce((sum, a) => sum + a.points, 0),
        unlockedCount: formattedAchievements.filter((a) => a.unlocked).length,
      },
    });
  })
);

/**
 * @swagger
 * /api/v1/user/account:
 *   delete:
 *     summary: Delete user account
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Account deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete(
  "/account",
  authenticate,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    // In a production app, you might want to soft delete or archive the account
    // For now, we'll just return a success message
    res.json({
      success: true,
      message: "Account deletion requested. Please contact support to complete the process.",
    });
  })
);

// Helper function to map condition type to category
function getAchievementCategory(conditionType: string): string {
  switch (conditionType) {
    case "lessons_completed":
      return "learning";
    case "streak":
    case "longest_streak":
      return "consistency";
    case "points":
      return "points";
    default:
      return "learning";
  }
}

export default router;
