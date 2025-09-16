import { Router, Response } from "express";
import { db } from "../db/connection";
import { subjects, topics, lessons } from "../db/schema";
import { eq } from "drizzle-orm";
import { authenticate, AuthenticatedRequest } from "../middleware/auth";

const router = Router();

/**
 * @swagger
 * /api/v1/subjects:
 *   get:
 *     summary: Get all active subjects
 *     tags: [Subjects]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Subjects retrieved successfully
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
 *                     subjects:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             description: Subject ID
 *                           name:
 *                             type: string
 *                             description: Subject name
 *                           description:
 *                             type: string
 *                             description: Subject description
 *                           icon:
 *                             type: string
 *                             description: Subject icon
 *                           color:
 *                             type: string
 *                             description: Subject color
 *                           orderIndex:
 *                             type: integer
 *                             description: Display order
 *                           isActive:
 *                             type: boolean
 *                             description: Whether subject is active
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
    const allSubjects = await db
      .select({
        id: subjects.id,
        name: subjects.name,
        description: subjects.description,
        icon: subjects.icon,
        color: subjects.color,
        orderIndex: subjects.orderIndex,
        isActive: subjects.isActive,
      })
      .from(subjects)
      .where(eq(subjects.isActive, true))
      .orderBy(subjects.orderIndex);

    res.json({
      success: true,
      data: {
        subjects: allSubjects,
      },
    });
  } catch (error) {
    console.error("Get subjects error:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
    });
  }
});

/**
 * @swagger
 * /api/v1/subjects/{id}:
 *   get:
 *     summary: Get subject by ID with topics
 *     tags: [Subjects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Subject ID
 *     responses:
 *       200:
 *         description: Subject retrieved successfully
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
 *                     subject:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           description: Subject ID
 *                         name:
 *                           type: string
 *                           description: Subject name
 *                         description:
 *                           type: string
 *                           description: Subject description
 *                         icon:
 *                           type: string
 *                           description: Subject icon
 *                         color:
 *                           type: string
 *                           description: Subject color
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
 *                           orderIndex:
 *                             type: integer
 *                             description: Display order
 *       400:
 *         description: Invalid subject ID
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
 *         description: Subject not found
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
    const subjectId = parseInt(req.params.id);
    
    if (isNaN(subjectId)) {
      return res.status(400).json({
        success: false,
        message: "ID subject tidak valid",
      });
    }

    // Get subject details
    const subject = await db
      .select()
      .from(subjects)
      .where(eq(subjects.id, subjectId))
      .limit(1);

    if (subject.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Subject tidak ditemukan",
      });
    }

    // Get topics for this subject
    const subjectTopics = await db
      .select({
        id: topics.id,
        name: topics.name,
        description: topics.description,
        orderIndex: topics.orderIndex,
        estimatedDuration: topics.estimatedDuration,
        difficultyLevel: topics.difficultyLevel,
        isActive: topics.isActive,
      })
      .from(topics)
      .where(eq(topics.subjectId, subjectId))
      .orderBy(topics.orderIndex);

    res.json({
      success: true,
      data: {
        subject: subject[0],
        topics: subjectTopics,
      },
    });
  } catch (error) {
    console.error("Get subject error:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
    });
  }
});

/**
 * @swagger
 * /api/v1/subjects/{id}/topics:
 *   get:
 *     summary: Get topics by subject ID
 *     tags: [Subjects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Subject ID
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
 *                             description: Whether topic is active
 *                           lessonCount:
 *                             type: integer
 *                             description: Number of lessons in topic
 *       400:
 *         description: Invalid subject ID
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
 *         description: Subject not found
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
router.get("/:id/topics", authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const subjectId = parseInt(req.params.id);
    
    if (isNaN(subjectId)) {
      return res.status(400).json({
        success: false,
        message: "ID subject tidak valid",
      });
    }

    // Verify subject exists
    const subject = await db
      .select({ id: subjects.id })
      .from(subjects)
      .where(eq(subjects.id, subjectId))
      .limit(1);

    if (subject.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Subject tidak ditemukan",
      });
    }

    // Get topics with lesson count
    const subjectTopics = await db
      .select({
        id: topics.id,
        name: topics.name,
        description: topics.description,
        orderIndex: topics.orderIndex,
        estimatedDuration: topics.estimatedDuration,
        difficultyLevel: topics.difficultyLevel,
        isActive: topics.isActive,
      })
      .from(topics)
      .where(eq(topics.subjectId, subjectId))
      .orderBy(topics.orderIndex);

    // Get lesson count for each topic
    const topicsWithLessonCount = await Promise.all(
      subjectTopics.map(async (topic) => {
        const lessonCount = await db
          .select({ count: lessons.id })
          .from(lessons)
          .where(eq(lessons.topicId, topic.id));
        
        return {
          ...topic,
          lessonCount: lessonCount.length,
        };
      })
    );

    res.json({
      success: true,
      data: {
        topics: topicsWithLessonCount,
      },
    });
  } catch (error) {
    console.error("Get topics error:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
    });
  }
});

export default router;