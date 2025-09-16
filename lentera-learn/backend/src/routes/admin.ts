import { Router, Request, Response } from "express";
import { db } from "../db/connection";
import { lessons, lessonExamples, practiceQuestions, questionOptions, topics, subjects, userProgress, userPracticeResults, audioFiles, type QuestionOption } from "../db/schema";
import { eq, inArray, asc, max } from "drizzle-orm";

// Interface for question option input
interface QuestionOptionInput {
  optionText: string;
  isCorrect?: boolean;
  orderIndex?: number;
}

// Interface for subject update data
interface SubjectUpdateData {
  name?: string;
  description?: string;
  icon?: string;
  color?: string;
  orderIndex?: number;
  isActive?: boolean;
  updatedAt: string;
}

// Interface for topic update data
interface TopicUpdateData {
  subjectId?: number;
  name?: string;
  description?: string;
  orderIndex?: number;
  estimatedDuration?: number;
  difficultyLevel?: string;
  isActive?: boolean;
  updatedAt: string;
}

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     CreateLessonRequest:
 *       type: object
 *       required:
 *         - topicId
 *         - title
 *         - content
 *         - summary
 *         - orderIndex
 *       properties:
 *         topicId:
 *           type: integer
 *         title:
 *           type: string
 *         content:
 *           type: string
 *         summary:
 *           type: string
 *         learningObjectives:
 *           type: string
 *           description: JSON array of learning objectives
 *         prerequisites:
 *           type: string
 *           description: JSON array of prerequisite concepts
 *         keyConcepts:
 *           type: string
 *           description: JSON array of key concepts
 *         practicalApplications:
 *           type: string
 *           description: JSON array of practical applications
 *         mediaContent:
 *           type: string
 *           description: JSON object with media URLs
 *         orderIndex:
 *           type: integer
 *         estimatedDuration:
 *           type: integer
 *           description: Duration in minutes
 *         difficultyLevel:
 *           type: string
 *           enum: [beginner, intermediate, advanced]
 *           default: beginner
 *         difficultySubLevel:
 *           type: integer
 *           minimum: 1
 *           maximum: 3
 *           default: 1
 *     CreateExampleRequest:
 *       type: object
 *       required:
 *         - lessonId
 *         - title
 *         - content
 *         - explanation
 *         - orderIndex
 *       properties:
 *         lessonId:
 *           type: integer
 *         title:
 *           type: string
 *         content:
 *           type: string
 *         explanation:
 *           type: string
 *         orderIndex:
 *           type: integer
 *         exampleType:
 *           type: string
 *           enum: [text, image, video, audio]
 *           default: text
 *         mediaUrl:
 *           type: string
 *     CreatePracticeRequest:
 *       type: object
 *       required:
 *         - lessonId
 *         - type
 *         - question
 *         - explanation
 *         - orderIndex
 *       properties:
 *         lessonId:
 *           type: integer
 *         type:
 *           type: string
 *           enum: [multiple_choice, true_false, fill_blank]
 *         question:
 *           type: string
 *         explanation:
 *           type: string
 *         difficultyLevel:
 *           type: string
 *           enum: [beginner, intermediate, advanced]
 *           default: beginner
 *         points:
 *           type: integer
 *           default: 10
 *         orderIndex:
 *           type: integer
 *         options:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               optionText:
 *                 type: string
 *               isCorrect:
 *                 type: boolean
 *               orderIndex:
 *                 type: integer
 */

// ============= TOPICS (for reference) =============

/**
 * @swagger
 * /api/v1/admin/topics:
 *   get:
 *     summary: Get all topics (Admin - No Auth)
 *     tags: [Admin]
 *     parameters:
 *       - in: query
 *         name: subjectId
 *         schema:
 *           type: integer
 *         description: Filter by subject ID
 *     responses:
 *       200:
 *         description: List of topics
 */
router.get("/topics", async (req: Request, res: Response) => {
  try {
    const { subjectId } = req.query;

    const baseQuery = db
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
        subject: {
          id: subjects.id,
          name: subjects.name,
          description: subjects.description,
          icon: subjects.icon,
          color: subjects.color,
        },
      })
      .from(topics)
      .leftJoin(subjects, eq(topics.subjectId, subjects.id))
      .orderBy(asc(topics.orderIndex));

    const topicsList = subjectId ? await baseQuery.where(eq(topics.subjectId, parseInt(subjectId as string))) : await baseQuery;

    res.json({
      success: true,
      data: {
        topics: topicsList,
        total: topicsList.length,
      },
    });
  } catch (error) {
    console.error("Error fetching topics:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch topics",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * @swagger
 * /api/v1/admin/topics:
 *   post:
 *     summary: Create a new topic (Admin - No Auth)
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - subjectId
 *               - name
 *               - description
 *               - orderIndex
 *             properties:
 *               subjectId:
 *                 type: integer
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               orderIndex:
 *                 type: integer
 *               estimatedDuration:
 *                 type: integer
 *               difficultyLevel:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Topic created successfully
 */
router.post("/topics", async (req: Request, res: Response) => {
  try {
    const { subjectId, name, description, orderIndex, estimatedDuration, difficultyLevel, isActive = true } = req.body;

    if (!subjectId || !name || !description || orderIndex === undefined) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: subjectId, name, description, orderIndex",
      });
    }

    // Validate subject exists
    const existingSubject = await db.select().from(subjects).where(eq(subjects.id, subjectId)).limit(1);

    if (existingSubject.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Subject not found",
      });
    }

    const [newTopic] = await db
      .insert(topics)
      .values({
        subjectId,
        name,
        description,
        orderIndex,
        estimatedDuration,
        difficultyLevel,
        isActive,
      })
      .returning();

    res.status(201).json({
      success: true,
      data: { topic: newTopic },
      message: "Topic created successfully",
    });
  } catch (error) {
    console.error("Error creating topic:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create topic",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * @swagger
 * /api/v1/admin/topics/{id}:
 *   put:
 *     summary: Update a topic (Admin - No Auth)
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               subjectId:
 *                 type: integer
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               orderIndex:
 *                 type: integer
 *               estimatedDuration:
 *                 type: integer
 *               difficultyLevel:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Topic updated successfully
 */
router.put("/topics/:id", async (req: Request, res: Response) => {
  try {
    const topicId = parseInt(req.params.id);
    const { subjectId, name, description, orderIndex, estimatedDuration, difficultyLevel, isActive } = req.body;

    if (isNaN(topicId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid topic ID",
      });
    }

    // Check if topic exists
    const existingTopic = await db.select().from(topics).where(eq(topics.id, topicId)).limit(1);

    if (existingTopic.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Topic not found",
      });
    }

    // Validate subject exists if subjectId is being updated
    if (subjectId) {
      const existingSubject = await db.select().from(subjects).where(eq(subjects.id, subjectId)).limit(1);

      if (existingSubject.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Subject not found",
        });
      }
    }

    const updateData: TopicUpdateData = { updatedAt: new Date().toISOString() };
    if (subjectId !== undefined) updateData.subjectId = subjectId;
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (orderIndex !== undefined) updateData.orderIndex = orderIndex;
    if (estimatedDuration !== undefined) updateData.estimatedDuration = estimatedDuration;
    if (difficultyLevel !== undefined) updateData.difficultyLevel = difficultyLevel;
    if (isActive !== undefined) updateData.isActive = isActive;

    const [updatedTopic] = await db.update(topics).set(updateData).where(eq(topics.id, topicId)).returning();

    res.json({
      success: true,
      data: { topic: updatedTopic },
      message: "Topic updated successfully",
    });
  } catch (error) {
    console.error("Error updating topic:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update topic",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * @swagger
 * /api/v1/admin/topics/{id}:
 *   delete:
 *     summary: Delete a topic (Admin - No Auth)
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Topic deleted successfully
 */
router.delete("/topics/:id", async (req: Request, res: Response) => {
  try {
    const topicId = parseInt(req.params.id);

    if (isNaN(topicId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid topic ID",
      });
    }

    // Check if topic exists
    const existingTopic = await db.select().from(topics).where(eq(topics.id, topicId)).limit(1);

    if (existingTopic.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Topic not found",
      });
    }

    // Check if topic has lessons
    const relatedLessons = await db.select().from(lessons).where(eq(lessons.topicId, topicId)).limit(1);

    if (relatedLessons.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete topic that has lessons. Delete all related lessons first.",
      });
    }

    await db.delete(topics).where(eq(topics.id, topicId));

    res.json({
      success: true,
      message: "Topic deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting topic:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete topic",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * @swagger
 * /api/v1/admin/subjects:
 *   get:
 *     summary: Get all subjects (Admin - No Auth)
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: List of subjects
 */
router.get("/subjects", async (req: Request, res: Response) => {
  try {
    const subjectsList = await db.select().from(subjects).orderBy(asc(subjects.orderIndex));

    res.json({
      success: true,
      data: {
        subjects: subjectsList,
        total: subjectsList.length,
      },
    });
  } catch (error) {
    console.error("Error fetching subjects:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch subjects",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * @swagger
 * /api/v1/admin/subjects:
 *   post:
 *     summary: Create a new subject (Admin - No Auth)
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *               - orderIndex
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               icon:
 *                 type: string
 *               color:
 *                 type: string
 *               orderIndex:
 *                 type: integer
 *               isActive:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Subject created successfully
 */
router.post("/subjects", async (req: Request, res: Response) => {
  try {
    const { name, description, icon, color, orderIndex, isActive = true } = req.body;

    if (!name || !description || orderIndex === undefined) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: name, description, orderIndex",
      });
    }

    const [newSubject] = await db
      .insert(subjects)
      .values({
        name,
        description,
        icon,
        color,
        orderIndex,
        isActive,
      })
      .returning();

    res.status(201).json({
      success: true,
      data: { subject: newSubject },
      message: "Subject created successfully",
    });
  } catch (error) {
    console.error("Error creating subject:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create subject",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * @swagger
 * /api/v1/admin/subjects/{id}:
 *   put:
 *     summary: Update a subject (Admin - No Auth)
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               icon:
 *                 type: string
 *               color:
 *                 type: string
 *               orderIndex:
 *                 type: integer
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Subject updated successfully
 */
router.put("/subjects/:id", async (req: Request, res: Response) => {
  try {
    const subjectId = parseInt(req.params.id);
    const { name, description, icon, color, orderIndex, isActive } = req.body;

    if (isNaN(subjectId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid subject ID",
      });
    }

    // Check if subject exists
    const existingSubject = await db.select().from(subjects).where(eq(subjects.id, subjectId)).limit(1);

    if (existingSubject.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Subject not found",
      });
    }

    const updateData: SubjectUpdateData = { updatedAt: new Date().toISOString() };
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (icon !== undefined) updateData.icon = icon;
    if (color !== undefined) updateData.color = color;
    if (orderIndex !== undefined) updateData.orderIndex = orderIndex;
    if (isActive !== undefined) updateData.isActive = isActive;

    const [updatedSubject] = await db.update(subjects).set(updateData).where(eq(subjects.id, subjectId)).returning();

    res.json({
      success: true,
      data: { subject: updatedSubject },
      message: "Subject updated successfully",
    });
  } catch (error) {
    console.error("Error updating subject:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update subject",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * @swagger
 * /api/v1/admin/subjects/{id}:
 *   delete:
 *     summary: Delete a subject (Admin - No Auth)
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Subject deleted successfully
 */
router.delete("/subjects/:id", async (req: Request, res: Response) => {
  try {
    const subjectId = parseInt(req.params.id);

    if (isNaN(subjectId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid subject ID",
      });
    }

    // Check if subject exists
    const existingSubject = await db.select().from(subjects).where(eq(subjects.id, subjectId)).limit(1);

    if (existingSubject.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Subject not found",
      });
    }

    // Check if subject has topics
    const relatedTopics = await db.select().from(topics).where(eq(topics.subjectId, subjectId)).limit(1);

    if (relatedTopics.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete subject that has topics. Delete all related topics first.",
      });
    }

    await db.delete(subjects).where(eq(subjects.id, subjectId));

    res.json({
      success: true,
      message: "Subject deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting subject:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete subject",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// ============= LESSONS CRUD =============

/**
 * @swagger
 * /api/v1/admin/lessons:
 *   get:
 *     summary: Get all lessons (Admin - No Auth)
 *     tags: [Admin]
 *     parameters:
 *       - in: query
 *         name: topicId
 *         schema:
 *           type: integer
 *         description: Filter by topic ID
 *     responses:
 *       200:
 *         description: List of lessons
 */
router.get("/lessons", async (req: Request, res: Response) => {
  try {
    const { topicId } = req.query;

    const baseQuery = db
      .select({
        id: lessons.id,
        topicId: lessons.topicId,
        title: lessons.title,
        content: lessons.content,
        summary: lessons.summary,
        learningObjectives: lessons.learningObjectives,
        prerequisites: lessons.prerequisites,
        keyConcepts: lessons.keyConcepts,
        practicalApplications: lessons.practicalApplications,
        mediaContent: lessons.mediaContent,
        orderIndex: lessons.orderIndex,
        estimatedDuration: lessons.estimatedDuration,
        difficultyLevel: lessons.difficultyLevel,
        difficultySubLevel: lessons.difficultySubLevel,
        isActive: lessons.isActive,
        createdAt: lessons.createdAt,
        updatedAt: lessons.updatedAt,
        topicName: topics.name,
        subjectName: subjects.name,
      })
      .from(lessons)
      .leftJoin(topics, eq(lessons.topicId, topics.id))
      .leftJoin(subjects, eq(topics.subjectId, subjects.id))
      .orderBy(asc(lessons.orderIndex));

    const result = topicId ? await baseQuery.where(eq(lessons.topicId, parseInt(topicId as string))) : await baseQuery;

    res.json({
      success: true,
      data: result,
      total: result.length,
    });
  } catch (error) {
    console.error("Error fetching lessons:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch lessons",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * @swagger
 * /api/v1/admin/lessons:
 *   post:
 *     summary: Create a new lesson (Admin - No Auth)
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateLessonRequest'
 *     responses:
 *       201:
 *         description: Lesson created successfully
 */
router.post("/lessons", async (req: Request, res: Response) => {
  try {
    const { topicId, title, content, summary, learningObjectives, prerequisites, keyConcepts, practicalApplications, mediaContent, estimatedDuration, difficultyLevel = "beginner", difficultySubLevel = 1 } = req.body;

    // Validate required fields
    if (!topicId || !title || !content || !summary) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: topicId, title, content, summary",
      });
    }

    // Check if topic exists
    const topic = await db.select().from(topics).where(eq(topics.id, topicId)).limit(1);
    if (topic.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Topic not found",
      });
    }

    // Auto-generate orderIndex by finding the max orderIndex for this topic and adding 1
    const maxOrderResult = await db
      .select({ maxOrder: max(lessons.orderIndex) })
      .from(lessons)
      .where(eq(lessons.topicId, topicId));

    const orderIndex = (maxOrderResult[0]?.maxOrder || 0) + 1;

    const [newLesson] = await db
      .insert(lessons)
      .values({
        topicId,
        title,
        content,
        summary,
        learningObjectives,
        prerequisites,
        keyConcepts,
        practicalApplications,
        mediaContent,
        orderIndex,
        estimatedDuration,
        difficultyLevel,
        difficultySubLevel,
      })
      .returning();

    res.status(201).json({
      success: true,
      message: "Lesson created successfully",
      data: newLesson,
    });
  } catch (error) {
    console.error("Error creating lesson:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create lesson",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * @swagger
 * /api/v1/admin/lessons/{id}:
 *   get:
 *     summary: Get lesson by ID (Admin - No Auth)
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lesson details
 */
router.get("/lessons/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

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

    const result = await db
      .select({
        id: lessons.id,
        topicId: lessons.topicId,
        title: lessons.title,
        content: lessons.content,
        summary: lessons.summary,
        learningObjectives: lessons.learningObjectives,
        prerequisites: lessons.prerequisites,
        keyConcepts: lessons.keyConcepts,
        practicalApplications: lessons.practicalApplications,
        mediaContent: lessons.mediaContent,
        orderIndex: lessons.orderIndex,
        estimatedDuration: lessons.estimatedDuration,
        difficultyLevel: lessons.difficultyLevel,
        difficultySubLevel: lessons.difficultySubLevel,
        isActive: lessons.isActive,
        createdAt: lessons.createdAt,
        updatedAt: lessons.updatedAt,
        topicName: topics.name,
        subjectName: subjects.name,
      })
      .from(lessons)
      .leftJoin(topics, eq(lessons.topicId, topics.id))
      .leftJoin(subjects, eq(topics.subjectId, subjects.id))
      .where(eq(lessons.id, parseInt(id)))
      .limit(1);

    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Lesson not found",
      });
    }

    // Parse JSON fields for better frontend consumption
    const lessonData = {
      ...result[0],
      learningObjectives: safeJsonParse(result[0].learningObjectives) || [],
      prerequisites: safeJsonParse(result[0].prerequisites) || [],
      keyConcepts: safeJsonParse(result[0].keyConcepts) || [],
      practicalApplications: safeJsonParse(result[0].practicalApplications) || [],
      mediaContent: safeJsonParse(result[0].mediaContent),
    };

    res.json({
      success: true,
      data: lessonData,
    });
  } catch (error) {
    console.error("Error fetching lesson:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch lesson",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * @swagger
 * /api/v1/admin/lessons/{id}:
 *   put:
 *     summary: Update lesson (Admin - No Auth)
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateLessonRequest'
 *     responses:
 *       200:
 *         description: Lesson updated successfully
 */
router.put("/lessons/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    console.log("=== LESSON UPDATE DEBUG ===");
    console.log("Lesson ID:", id);
    console.log("Request body:", JSON.stringify(updateData, null, 2));
    console.log("Request body keys:", Object.keys(updateData));

    // Check if lesson exists
    const existingLesson = await db
      .select()
      .from(lessons)
      .where(eq(lessons.id, parseInt(id)))
      .limit(1);
    if (existingLesson.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Lesson not found",
      });
    }

    // If topicId is being updated, check if topic exists
    if (updateData.topicId) {
      const topic = await db.select().from(topics).where(eq(topics.id, updateData.topicId)).limit(1);
      if (topic.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Topic not found",
        });
      }
    }

    // Filter only valid fields that exist in the database schema
    // Use the exact field names as defined in the Drizzle schema
    const validFields: Record<string, unknown> = {};

    if (updateData.topicId !== undefined) validFields.topicId = updateData.topicId;
    if (updateData.title !== undefined) validFields.title = updateData.title;
    if (updateData.content !== undefined) validFields.content = updateData.content;
    if (updateData.summary !== undefined) validFields.summary = updateData.summary;
    if (updateData.learningObjectives !== undefined) validFields.learningObjectives = updateData.learningObjectives;
    if (updateData.prerequisites !== undefined) validFields.prerequisites = updateData.prerequisites;
    if (updateData.keyConcepts !== undefined) validFields.keyConcepts = updateData.keyConcepts;
    if (updateData.practicalApplications !== undefined) validFields.practicalApplications = updateData.practicalApplications;
    if (updateData.mediaContent !== undefined) validFields.mediaContent = updateData.mediaContent;
    if (updateData.orderIndex !== undefined) validFields.orderIndex = updateData.orderIndex;
    if (updateData.estimatedDuration !== undefined) validFields.estimatedDuration = updateData.estimatedDuration;
    if (updateData.difficultyLevel !== undefined) validFields.difficultyLevel = updateData.difficultyLevel;
    if (updateData.difficultySubLevel !== undefined) validFields.difficultySubLevel = updateData.difficultySubLevel;
    if (updateData.isActive !== undefined) validFields.isActive = updateData.isActive;

    // Always update the updatedAt field
    validFields.updatedAt = new Date().toISOString();

    console.log("Valid fields to update:", JSON.stringify(validFields, null, 2));
    console.log("Valid fields keys:", Object.keys(validFields));

    const [updatedLesson] = await db
      .update(lessons)
      .set(validFields)
      .where(eq(lessons.id, parseInt(id)))
      .returning();

    res.json({
      success: true,
      message: "Lesson updated successfully",
      data: updatedLesson,
    });
  } catch (error) {
    console.error("Error updating lesson:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update lesson",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * @swagger
 * /api/v1/admin/lessons/{id}:
 *   delete:
 *     summary: Delete lesson (Admin - No Auth)
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lesson deleted successfully
 */
router.delete("/lessons/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const lessonId = parseInt(id);

    // Check if lesson exists
    const existingLesson = await db.select().from(lessons).where(eq(lessons.id, lessonId)).limit(1);
    if (existingLesson.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Lesson not found",
      });
    }

    // Delete related data first (examples, practice questions, user progress, etc.)
    // Get all practice question IDs for this lesson
    const practiceQuestionIds = await db.select({ id: practiceQuestions.id }).from(practiceQuestions).where(eq(practiceQuestions.lessonId, lessonId));

    // Delete user practice results for this lesson's questions
    if (practiceQuestionIds.length > 0) {
      await db.delete(userPracticeResults).where(
        inArray(
          userPracticeResults.questionId,
          practiceQuestionIds.map((q) => q.id)
        )
      );

      // Delete question options
      await db.delete(questionOptions).where(
        inArray(
          questionOptions.questionId,
          practiceQuestionIds.map((q) => q.id)
        )
      );
    }

    // Delete user progress for this lesson
    await db.delete(userProgress).where(eq(userProgress.lessonId, lessonId));

    // Delete audio files for this lesson
    await db.delete(audioFiles).where(eq(audioFiles.lessonId, lessonId));

    // Delete practice questions
    await db.delete(practiceQuestions).where(eq(practiceQuestions.lessonId, lessonId));

    // Delete lesson examples
    await db.delete(lessonExamples).where(eq(lessonExamples.lessonId, lessonId));

    // Finally delete the lesson
    await db.delete(lessons).where(eq(lessons.id, lessonId));

    res.json({
      success: true,
      message: "Lesson and all related data deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting lesson:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete lesson",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// ============= EXAMPLES CRUD =============

/**
 * @swagger
 * /api/v1/admin/examples:
 *   get:
 *     summary: Get all lesson examples (Admin - No Auth)
 *     tags: [Admin]
 *     parameters:
 *       - in: query
 *         name: lessonId
 *         schema:
 *           type: integer
 *         description: Filter by lesson ID
 *     responses:
 *       200:
 *         description: List of examples
 */
router.get("/examples", async (req: Request, res: Response) => {
  try {
    const { lessonId } = req.query;

    const baseQuery = db
      .select({
        id: lessonExamples.id,
        lessonId: lessonExamples.lessonId,
        title: lessonExamples.title,
        content: lessonExamples.content,
        explanation: lessonExamples.explanation,
        orderIndex: lessonExamples.orderIndex,
        exampleType: lessonExamples.exampleType,
        mediaUrl: lessonExamples.mediaUrl,
        createdAt: lessonExamples.createdAt,
        lessonTitle: lessons.title,
      })
      .from(lessonExamples)
      .leftJoin(lessons, eq(lessonExamples.lessonId, lessons.id))
      .orderBy(asc(lessonExamples.orderIndex));

    const result = lessonId ? await baseQuery.where(eq(lessonExamples.lessonId, parseInt(lessonId as string))) : await baseQuery;

    res.json({
      success: true,
      data: result,
      total: result.length,
    });
  } catch (error) {
    console.error("Error fetching examples:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch examples",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * @swagger
 * /api/v1/admin/examples:
 *   post:
 *     summary: Create a new lesson example (Admin - No Auth)
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateExampleRequest'
 *     responses:
 *       201:
 *         description: Example created successfully
 */
router.post("/examples", async (req: Request, res: Response) => {
  try {
    const { lessonId, title, content, explanation, exampleType = "text", mediaUrl } = req.body;

    // Validate required fields
    if (!lessonId || !title || !content || !explanation) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: lessonId, title, content, explanation",
      });
    }

    // Check if lesson exists
    const lesson = await db.select().from(lessons).where(eq(lessons.id, lessonId)).limit(1);
    if (lesson.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Lesson not found",
      });
    }

    // Auto-generate orderIndex by finding the max orderIndex for this lesson and adding 1
    const maxOrderResult = await db
      .select({ maxOrder: max(lessonExamples.orderIndex) })
      .from(lessonExamples)
      .where(eq(lessonExamples.lessonId, lessonId));

    const orderIndex = (maxOrderResult[0]?.maxOrder || 0) + 1;

    const [newExample] = await db
      .insert(lessonExamples)
      .values({
        lessonId,
        title,
        content,
        explanation,
        orderIndex,
        exampleType,
        mediaUrl,
      })
      .returning();

    res.status(201).json({
      success: true,
      message: "Example created successfully",
      data: newExample,
    });
  } catch (error) {
    console.error("Error creating example:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create example",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * @swagger
 * /api/v1/admin/examples/{id}:
 *   get:
 *     summary: Get example by ID (Admin - No Auth)
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Example details
 */
router.get("/examples/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await db
      .select({
        id: lessonExamples.id,
        lessonId: lessonExamples.lessonId,
        title: lessonExamples.title,
        content: lessonExamples.content,
        explanation: lessonExamples.explanation,
        orderIndex: lessonExamples.orderIndex,
        exampleType: lessonExamples.exampleType,
        mediaUrl: lessonExamples.mediaUrl,
        createdAt: lessonExamples.createdAt,
        lessonTitle: lessons.title,
      })
      .from(lessonExamples)
      .leftJoin(lessons, eq(lessonExamples.lessonId, lessons.id))
      .where(eq(lessonExamples.id, parseInt(id)))
      .limit(1);

    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Example not found",
      });
    }

    res.json({
      success: true,
      data: result[0],
    });
  } catch (error) {
    console.error("Error fetching example:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch example",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * @swagger
 * /api/v1/admin/examples/{id}:
 *   put:
 *     summary: Update example (Admin - No Auth)
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateExampleRequest'
 *     responses:
 *       200:
 *         description: Example updated successfully
 */
router.put("/examples/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Check if example exists
    const existingExample = await db
      .select()
      .from(lessonExamples)
      .where(eq(lessonExamples.id, parseInt(id)))
      .limit(1);
    if (existingExample.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Example not found",
      });
    }

    // If lessonId is being updated, check if lesson exists
    if (updateData.lessonId) {
      const lesson = await db.select().from(lessons).where(eq(lessons.id, updateData.lessonId)).limit(1);
      if (lesson.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Lesson not found",
        });
      }
    }

    const [updatedExample] = await db
      .update(lessonExamples)
      .set(updateData)
      .where(eq(lessonExamples.id, parseInt(id)))
      .returning();

    res.json({
      success: true,
      message: "Example updated successfully",
      data: updatedExample,
    });
  } catch (error) {
    console.error("Error updating example:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update example",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * @swagger
 * /api/v1/admin/examples/{id}:
 *   delete:
 *     summary: Delete example (Admin - No Auth)
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Example deleted successfully
 */
router.delete("/examples/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const exampleId = parseInt(id);

    // Check if example exists
    const existingExample = await db.select().from(lessonExamples).where(eq(lessonExamples.id, exampleId)).limit(1);
    if (existingExample.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Example not found",
      });
    }

    await db.delete(lessonExamples).where(eq(lessonExamples.id, exampleId));

    res.json({
      success: true,
      message: "Example deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting example:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete example",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// ============= PRACTICE QUESTIONS CRUD =============

/**
 * @swagger
 * /api/v1/admin/practice:
 *   get:
 *     summary: Get all practice questions with options (Admin - No Auth)
 *     tags: [Admin]
 *     parameters:
 *       - in: query
 *         name: lessonId
 *         schema:
 *           type: integer
 *         description: Filter by lesson ID
 *     responses:
 *       200:
 *         description: List of practice questions with options
 */
router.get("/practice", async (req: Request, res: Response) => {
  try {
    const { lessonId } = req.query;

    const baseQuery = db
      .select({
        id: practiceQuestions.id,
        lessonId: practiceQuestions.lessonId,
        type: practiceQuestions.type,
        question: practiceQuestions.question,
        explanation: practiceQuestions.explanation,
        difficultyLevel: practiceQuestions.difficultyLevel,
        points: practiceQuestions.points,
        orderIndex: practiceQuestions.orderIndex,
        createdAt: practiceQuestions.createdAt,
        lessonTitle: lessons.title,
      })
      .from(practiceQuestions)
      .leftJoin(lessons, eq(practiceQuestions.lessonId, lessons.id))
      .orderBy(asc(practiceQuestions.orderIndex));

    const questions = lessonId ? await baseQuery.where(eq(practiceQuestions.lessonId, parseInt(lessonId as string))) : await baseQuery;

    // Get options for each question
    const questionsWithOptions = await Promise.all(
      questions.map(async (question) => {
        const options = await db.select().from(questionOptions).where(eq(questionOptions.questionId, question.id)).orderBy(asc(questionOptions.orderIndex));

        return {
          ...question,
          options,
        };
      })
    );

    res.json({
      success: true,
      data: questionsWithOptions,
      total: questionsWithOptions.length,
    });
  } catch (error) {
    console.error("Error fetching practice questions:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch practice questions",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * @swagger
 * /api/v1/admin/practice:
 *   post:
 *     summary: Create a new practice question with options (Admin - No Auth)
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePracticeRequest'
 *     responses:
 *       201:
 *         description: Practice question created successfully
 */
router.post("/practice", async (req: Request, res: Response) => {
  try {
    const { lessonId, type, question, explanation, difficultyLevel = "beginner", points = 10, options = [] } = req.body;

    // Validate required fields
    if (!lessonId || !type || !question || !explanation) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: lessonId, type, question, explanation",
      });
    }

    // Check if lesson exists
    const lesson = await db.select().from(lessons).where(eq(lessons.id, lessonId)).limit(1);
    if (lesson.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Lesson not found",
      });
    }

    // Auto-generate orderIndex by finding the max orderIndex for this lesson and adding 1
    const maxOrderResult = await db
      .select({ maxOrder: max(practiceQuestions.orderIndex) })
      .from(practiceQuestions)
      .where(eq(practiceQuestions.lessonId, lessonId));

    const orderIndex = (maxOrderResult[0]?.maxOrder || 0) + 1;

    // Validate options for multiple choice questions
    if (type === "multiple_choice" && options.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Multiple choice questions must have options",
      });
    }

    // Create the practice question
    const [newQuestion] = await db
      .insert(practiceQuestions)
      .values({
        lessonId,
        type,
        question,
        explanation,
        difficultyLevel,
        points,
        orderIndex,
      })
      .returning();

    // Create options if provided
    let createdOptions: QuestionOption[] = [];
    if (options.length > 0) {
      const optionsToInsert = options.map((option: QuestionOptionInput, index: number) => ({
        questionId: newQuestion.id,
        optionText: option.optionText,
        isCorrect: option.isCorrect || false,
        orderIndex: option.orderIndex !== undefined ? option.orderIndex : index,
      }));

      createdOptions = await db.insert(questionOptions).values(optionsToInsert).returning();
    }

    res.status(201).json({
      success: true,
      message: "Practice question created successfully",
      data: {
        ...newQuestion,
        options: createdOptions,
      },
    });
  } catch (error) {
    console.error("Error creating practice question:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create practice question",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * @swagger
 * /api/v1/admin/practice/{id}:
 *   get:
 *     summary: Get practice question by ID with options (Admin - No Auth)
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Practice question details with options
 */
router.get("/practice/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await db
      .select({
        id: practiceQuestions.id,
        lessonId: practiceQuestions.lessonId,
        type: practiceQuestions.type,
        question: practiceQuestions.question,
        explanation: practiceQuestions.explanation,
        difficultyLevel: practiceQuestions.difficultyLevel,
        points: practiceQuestions.points,
        orderIndex: practiceQuestions.orderIndex,
        createdAt: practiceQuestions.createdAt,
        lessonTitle: lessons.title,
      })
      .from(practiceQuestions)
      .leftJoin(lessons, eq(practiceQuestions.lessonId, lessons.id))
      .where(eq(practiceQuestions.id, parseInt(id)))
      .limit(1);

    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Practice question not found",
      });
    }

    // Get options for the question
    const options = await db
      .select()
      .from(questionOptions)
      .where(eq(questionOptions.questionId, parseInt(id)))
      .orderBy(asc(questionOptions.orderIndex));

    res.json({
      success: true,
      data: {
        ...result[0],
        options,
      },
    });
  } catch (error) {
    console.error("Error fetching practice question:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch practice question",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * @swagger
 * /api/v1/admin/practice/{id}:
 *   put:
 *     summary: Update practice question with options (Admin - No Auth)
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePracticeRequest'
 *     responses:
 *       200:
 *         description: Practice question updated successfully
 */
router.put("/practice/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { options, ...updateData } = req.body;
    const questionId = parseInt(id);

    // Check if practice question exists
    const existingQuestion = await db.select().from(practiceQuestions).where(eq(practiceQuestions.id, questionId)).limit(1);
    if (existingQuestion.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Practice question not found",
      });
    }

    // If lessonId is being updated, check if lesson exists
    if (updateData.lessonId) {
      const lesson = await db.select().from(lessons).where(eq(lessons.id, updateData.lessonId)).limit(1);
      if (lesson.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Lesson not found",
        });
      }
    }

    // Filter only valid fields that exist in the database schema
    const validFields: Record<string, unknown> = {};
    
    if (updateData.lessonId !== undefined) validFields.lessonId = updateData.lessonId;
    if (updateData.type !== undefined) validFields.type = updateData.type;
    if (updateData.question !== undefined) validFields.question = updateData.question;
    if (updateData.explanation !== undefined) validFields.explanation = updateData.explanation;
    if (updateData.difficultyLevel !== undefined) validFields.difficultyLevel = updateData.difficultyLevel;
    if (updateData.points !== undefined) validFields.points = updateData.points;
    if (updateData.orderIndex !== undefined) validFields.orderIndex = updateData.orderIndex;

    // Update the practice question with only valid fields
    const [updatedQuestion] = await db.update(practiceQuestions).set(validFields).where(eq(practiceQuestions.id, questionId)).returning();

    // Update options if provided
    let updatedOptions: QuestionOption[] = [];
    if (options && Array.isArray(options)) {
      // Delete existing options
      await db.delete(questionOptions).where(eq(questionOptions.questionId, questionId));

      // Insert new options
      if (options.length > 0) {
        const optionsToInsert = options.map((option: QuestionOptionInput, index: number) => ({
          questionId: questionId,
          optionText: option.optionText,
          isCorrect: option.isCorrect || false,
          orderIndex: option.orderIndex !== undefined ? option.orderIndex : index,
        }));

        updatedOptions = await db.insert(questionOptions).values(optionsToInsert).returning();
      }
    } else {
      // Get existing options if not updating them
      updatedOptions = await db.select().from(questionOptions).where(eq(questionOptions.questionId, questionId)).orderBy(asc(questionOptions.orderIndex));
    }

    res.json({
      success: true,
      message: "Practice question updated successfully",
      data: {
        ...updatedQuestion,
        options: updatedOptions,
      },
    });
  } catch (error) {
    console.error("Error updating practice question:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update practice question",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * @swagger
 * /api/v1/admin/practice/{id}:
 *   delete:
 *     summary: Delete practice question with options (Admin - No Auth)
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Practice question deleted successfully
 */
router.delete("/practice/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const questionId = parseInt(id);

    // Check if practice question exists
    const existingQuestion = await db.select().from(practiceQuestions).where(eq(practiceQuestions.id, questionId)).limit(1);
    if (existingQuestion.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Practice question not found",
      });
    }

    // Delete options first
    await db.delete(questionOptions).where(eq(questionOptions.questionId, questionId));

    // Delete the practice question
    await db.delete(practiceQuestions).where(eq(practiceQuestions.id, questionId));

    res.json({
      success: true,
      message: "Practice question and all options deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting practice question:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete practice question",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

export default router;
