import { Router, Response } from "express";
import { db } from "../db/connection";
import { achievements, userAchievements, userStats } from "../db/schema";
import { eq, and } from "drizzle-orm";
import { authenticate, AuthenticatedRequest } from "../middleware/auth";

const router = Router();

// Achievement with earned status
interface AchievementWithStatus {
  id: number;
  name: string;
  description: string;
  icon: string;
  points: number | null;
  conditionType: string;
  conditionValue: number;
  isEarned: boolean;
  earnedAt: string | null;
}

/**
 * @swagger
 * /api/v1/achievements:
 *   get:
 *     summary: Get all achievements with user progress
 *     tags: [Achievements]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Achievements retrieved successfully
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
 *                   example: "Achievements retrieved successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: Achievement ID
 *                       name:
 *                         type: string
 *                         description: Achievement name
 *                       description:
 *                         type: string
 *                         description: Achievement description
 *                       icon:
 *                         type: string
 *                         description: Achievement icon
 *                       points:
 *                         type: integer
 *                         nullable: true
 *                         description: Points awarded for achievement
 *                       conditionType:
 *                         type: string
 *                         description: Type of condition to earn achievement
 *                       conditionValue:
 *                         type: integer
 *                         description: Value required to earn achievement
 *                       isEarned:
 *                         type: boolean
 *                         description: Whether user has earned this achievement
 *                       earnedAt:
 *                         type: string
 *                         nullable: true
 *                         format: date-time
 *                         description: When the achievement was earned
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

    // Get all achievements with user's progress
    const allAchievements = await db
      .select({
        id: achievements.id,
        name: achievements.name,
        description: achievements.description,
        icon: achievements.icon,
        points: achievements.points,
        conditionType: achievements.conditionType,
        conditionValue: achievements.conditionValue,
        isEarned: userAchievements.earnedAt,
        earnedAt: userAchievements.earnedAt,
      })
      .from(achievements)
      .leftJoin(userAchievements, and(eq(userAchievements.achievementId, achievements.id), eq(userAchievements.userId, user.id)))
      .orderBy(achievements.conditionType, achievements.points);

    // Group achievements by condition type
    const achievementsByType: Record<string, AchievementWithStatus[]> = {};
    allAchievements.forEach((achievement) => {
      const type = achievement.conditionType;
      if (!achievementsByType[type]) {
        achievementsByType[type] = [];
      }
      achievementsByType[type].push({
        ...achievement,
        isEarned: !!achievement.isEarned,
      });
    });

    // Get user stats for total points (includes lessons + achievements)
    const userStatsResult = await db.select().from(userStats).where(eq(userStats.userId, user.id)).limit(1);
    const totalPoints = userStatsResult[0]?.totalPoints || 0;

    // Calculate summary statistics
    const totalAchievements = allAchievements.length;
    const earnedAchievements = allAchievements.filter((a) => a.isEarned).length;

    res.json({
      success: true,
      data: {
        achievements: achievementsByType,
        summary: {
          total: totalAchievements,
          earned: earnedAchievements,
          progress: totalAchievements > 0 ? (earnedAchievements / totalAchievements) * 100 : 0,
          totalPoints,
        },
      },
    });
  } catch (error) {
    console.error("Get achievements error:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
    });
  }
});

/**
 * @swagger
 * /api/v1/achievements/earned:
 *   get:
 *     summary: Get user's earned achievements
 *     tags: [Achievements]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Earned achievements retrieved successfully
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
 *                   example: "Earned achievements retrieved successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: Achievement ID
 *                       name:
 *                         type: string
 *                         description: Achievement name
 *                       description:
 *                         type: string
 *                         description: Achievement description
 *                       icon:
 *                         type: string
 *                         description: Achievement icon
 *                       points:
 *                         type: integer
 *                         nullable: true
 *                         description: Points awarded for achievement
 *                       earnedAt:
 *                         type: string
 *                         format: date-time
 *                         description: When the achievement was earned
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
router.get("/earned", authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;

    const earnedAchievements = await db
      .select({
        id: achievements.id,
        name: achievements.name,
        description: achievements.description,
        icon: achievements.icon,
        points: achievements.points,
        conditionType: achievements.conditionType,
        earnedAt: userAchievements.earnedAt,
      })
      .from(userAchievements)
      .innerJoin(achievements, eq(userAchievements.achievementId, achievements.id))
      .where(eq(userAchievements.userId, user.id))
      .orderBy(userAchievements.earnedAt);

    res.json({
      success: true,
      data: {
        achievements: earnedAchievements,
        total: earnedAchievements.length,
      },
    });
  } catch (error) {
    console.error("Get earned achievements error:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
    });
  }
});

export default router;
