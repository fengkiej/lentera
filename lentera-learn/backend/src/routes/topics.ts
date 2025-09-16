import { Router, Response } from "express";
import { db } from "../db/connection";
import { topics, lessons, subjects } from "../db/schema";
import { eq } from "drizzle-orm";
import { authenticate, AuthenticatedRequest } from "../middleware/auth";

const router = Router();

/**
 * @swagger
 * /api/v1/topics:
 *   get:
 *     summary: Get all topics with subject information
 *     tags: [Topics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Topics retrieved successfully
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
 *                     topics:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             description: Topic ID
 *                           name:
 *                             type: string
 *                             description: Topic name
 *                           description:
 *                             type: string
 *                             description: Topic description
 *                           estimatedDuration:
 *                             type: integer
 *                             description: Estimated duration in minutes
 *                           difficultyLevel:
 *                             type: string
 *                             description: Difficulty level
 *                           orderIndex:
 *                             type: integer
 *                             description: Display order
 *                           subjectName:
 *                             type: string
 *                             description: Subject name
 *                           subjectColor:
 *                             type: string
 *                             description: Subject color
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
    // Get all topics with subject information
    const allTopics = await db
      .select({
        id: topics.id,
        subjectId: topics.subjectId,
        name: topics.name,
        description: topics.description,
        orderIndex: topics.orderIndex,
        estimatedDuration: topics.estimatedDuration,
        difficultyLevel: topics.difficultyLevel,
        isActive: topics.isActive,
        createdAt: topics.createdAt,
        updatedAt: topics.updatedAt,
        subjectName: subjects.name,
        subjectColor: subjects.color,
      })
      .from(topics)
      .innerJoin(subjects, eq(topics.subjectId, subjects.id))
      .where(eq(topics.isActive, true))
      .orderBy(topics.orderIndex);

    res.json({
      success: true,
      data: {
        topics: allTopics,
      },
    });
  } catch (error) {
    console.error("Get all topics error:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
    });
  }
});

/**
 * @swagger
 * /api/v1/topics/{id}:
 *   get:
 *     summary: Get topic by ID with lessons
 *     tags: [Topics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Topic ID
 *     responses:
 *       200:
 *         description: Topic retrieved successfully
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
 *                     topic:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           description: Topic ID
 *                         name:
 *                           type: string
 *                           description: Topic name
 *                         description:
 *                           type: string
 *                           description: Topic description
 *                         estimatedDuration:
 *                           type: integer
 *                           description: Estimated duration in minutes
 *                         difficultyLevel:
 *                           type: string
 *                           description: Difficulty level
 *                         orderIndex:
 *                           type: integer
 *                           description: Display order
 *                     lessons:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Lesson'
 *       400:
 *         description: Invalid topic ID
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
 *         description: Topic not found
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
    const topicId = parseInt(req.params.id);

    if (isNaN(topicId)) {
      return res.status(400).json({
        success: false,
        message: "ID topic tidak valid",
      });
    }

    // Get topic details
    const topic = await db.select().from(topics).where(eq(topics.id, topicId)).limit(1);

    if (topic.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Topic tidak ditemukan",
      });
    }

    // Get lessons for this topic
    const topicLessons = await db
      .select({
        id: lessons.id,
        title: lessons.title,
        content: lessons.content,
        summary: lessons.summary,
        orderIndex: lessons.orderIndex,
        estimatedDuration: lessons.estimatedDuration,
        difficultyLevel: lessons.difficultyLevel,
        isActive: lessons.isActive,
      })
      .from(lessons)
      .where(eq(lessons.topicId, topicId))
      .orderBy(lessons.orderIndex);

    res.json({
      success: true,
      data: {
        topic: topic[0],
        lessons: topicLessons,
      },
    });
  } catch (error) {
    console.error("Get topic error:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
    });
  }
});

/**
 * @swagger
 * /api/v1/topics/{id}/lessons:
 *   get:
 *     summary: Get lessons for a specific topic
 *     tags: [Topics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Topic ID
 *     responses:
 *       200:
 *         description: Lessons retrieved successfully
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
 *                             description: Lesson ID
 *                           title:
 *                             type: string
 *                             description: Lesson title
 *                           content:
 *                             type: string
 *                             description: Lesson content
 *                           orderIndex:
 *                             type: integer
 *                             description: Display order
 *                           estimatedDuration:
 *                             type: integer
 *                             description: Estimated duration in minutes
 *                           difficultyLevel:
 *                             type: string
 *                             description: Difficulty level
 *                           isActive:
 *                             type: boolean
 *                             description: Whether lesson is active
 *       400:
 *         description: Invalid topic ID
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
 *         description: Topic not found
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
router.get("/:id/lessons", authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const topicId = parseInt(req.params.id);

    if (isNaN(topicId)) {
      return res.status(400).json({
        success: false,
        message: "ID topic tidak valid",
      });
    }

    // Verify topic exists
    const topic = await db.select({ id: topics.id }).from(topics).where(eq(topics.id, topicId)).limit(1);

    if (topic.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Topic tidak ditemukan",
      });
    }

    // Get lessons
    const topicLessons = await db
      .select({
        id: lessons.id,
        title: lessons.title,
        content: lessons.content,
        summary: lessons.summary,
        orderIndex: lessons.orderIndex,
        estimatedDuration: lessons.estimatedDuration,
        difficultyLevel: lessons.difficultyLevel,
        isActive: lessons.isActive,
        createdAt: lessons.createdAt,
      })
      .from(lessons)
      .where(eq(lessons.topicId, topicId))
      .orderBy(lessons.orderIndex);

    res.json({
      success: true,
      data: {
        lessons: topicLessons,
      },
    });
  } catch (error) {
    console.error("Get lessons error:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
    });
  }
});

export default router;
