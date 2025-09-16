import { Request, Response, NextFunction } from "express";
import { db } from "../db/connection.js";
import { subjects, topics, lessons } from "../db/schema.js";
import { eq } from "drizzle-orm";
import { AuthenticatedRequest } from "./auth.js";

// Extend Request interface to include subject, topic, and lesson info
declare module 'express-serve-static-core' {
  interface Request {
    subject?: {
      id: number;
      name: string;
      isActive: boolean | null;
    };
    topic?: {
      id: number;
      name: string;
      subjectId: number;
      isActive: boolean | null;
      };
      lesson?: {
        id: number;
        title: string;
        topicId: number;
        isActive: boolean | null;
      };
    }
  }

/**
 * Check if user has access to subject
 * For now, all subjects are public, but this can be extended
 */
export async function checkSubjectAccess(req: Request, res: Response, next: NextFunction) {
  try {
    const subjectId = parseInt(req.params.id || req.params.subjectId);

    if (!subjectId || isNaN(subjectId)) {
      return res.status(400).json({
        success: false,
        error: "Valid Subject ID required",
      });
    }

    // Check if subject exists and is active
    const subject = await db
      .select({
        id: subjects.id,
        name: subjects.name,
        isActive: subjects.isActive,
      })
      .from(subjects)
      .where(eq(subjects.id, subjectId))
      .limit(1);

    if (subject.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Subject not found",
      });
    }

    if (!subject[0].isActive) {
      return res.status(403).json({
        success: false,
        error: "Subject is not available",
      });
    }

    // Add subject info to request for downstream use
    req.subject = subject[0];

    next();
  } catch (error) {
    console.error("Subject access check error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to check subject access",
    });
  }
}

/**
 * Check if user has access to topic
 */
export async function checkTopicAccess(req: Request, res: Response, next: NextFunction) {
  try {
    const topicId = req.params.id || req.params.topicId;

    if (!topicId) {
      return res.status(400).json({
        success: false,
        error: "Topic ID required",
      });
    }

    const numericTopicId = parseInt(topicId);
    if (isNaN(numericTopicId)) {
      return res.status(400).json({
        success: false,
        error: "Invalid topic ID",
      });
    }

    // Check if topic exists and is active
    const topic = await db
      .select({
        id: topics.id,
        name: topics.name,
        subjectId: topics.subjectId,
        isActive: topics.isActive,
      })
      .from(topics)
      .where(eq(topics.id, numericTopicId))
      .limit(1);

    if (topic.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Topic not found",
      });
    }

    if (!topic[0].isActive) {
      return res.status(403).json({
        success: false,
        error: "Topic is not available",
      });
    }

    // Check if parent subject is active
    const subject = await db
      .select({
        id: subjects.id,
        isActive: subjects.isActive,
      })
      .from(subjects)
      .where(eq(subjects.id, topic[0].subjectId))
      .limit(1);

    if (subject.length === 0 || !subject[0].isActive) {
      return res.status(403).json({
        success: false,
        error: "Parent subject is not available",
      });
    }

    // Add topic info to request for downstream use
    req.topic = topic[0];

    next();
  } catch (error) {
    console.error("Topic access check error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to check topic access",
    });
  }
}

/**
 * Check if user has access to lesson
 */
export async function checkLessonAccess(req: Request, res: Response, next: NextFunction) {
  try {
    const lessonId = req.params.id || req.params.lessonId;

    if (!lessonId) {
      return res.status(400).json({
        success: false,
        error: "Lesson ID required",
      });
    }

    const numericLessonId = parseInt(lessonId);
    if (isNaN(numericLessonId)) {
      return res.status(400).json({
        success: false,
        error: "Invalid lesson ID",
      });
    }

    // Check if lesson exists and is active
    const lesson = await db
      .select({
        id: lessons.id,
        title: lessons.title,
        topicId: lessons.topicId,
        isActive: lessons.isActive,
      })
      .from(lessons)
      .where(eq(lessons.id, numericLessonId))
      .limit(1);

    if (lesson.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Lesson not found",
      });
    }

    if (!lesson[0].isActive) {
      return res.status(403).json({
        success: false,
        error: "Lesson is not available",
      });
    }

    // Check if parent topic is active
    const topic = await db
      .select({
        id: topics.id,
        subjectId: topics.subjectId,
        isActive: topics.isActive,
      })
      .from(topics)
      .where(eq(topics.id, lesson[0].topicId))
      .limit(1);

    if (topic.length === 0 || !topic[0].isActive) {
      return res.status(403).json({
        success: false,
        error: "Parent topic is not available",
      });
    }

    // Check if parent subject is active
    const subject = await db
      .select({
        id: subjects.id,
        isActive: subjects.isActive,
      })
      .from(subjects)
      .where(eq(subjects.id, topic[0].subjectId))
      .limit(1);

    if (subject.length === 0 || !subject[0].isActive) {
      return res.status(403).json({
        success: false,
        error: "Parent subject is not available",
      });
    }

    // Add lesson info to request for downstream use
    req.lesson = lesson[0];

    next();
  } catch (error) {
    console.error("Lesson access check error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to check lesson access",
    });
  }
}

/**
 * Check prerequisites for lesson access
 * For self-learning, this shows warnings but allows access
 */
export async function checkPrerequisites(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    // For now, we'll implement a simple prerequisite check
    // In a full implementation, this would check if previous lessons are completed
    
    const lessonId = req.params.id || req.params.lessonId;
    if (!lessonId) {
      return next();
    }

    const numericLessonId = parseInt(lessonId);
    if (isNaN(numericLessonId)) {
      return next();
    }

    // For self-learning approach, we don't block access but can add warnings
    // This is where you would implement prerequisite logic
    
    // Example: Check if this is the first lesson in the topic
    const lesson = await db
      .select({
        id: lessons.id,
        topicId: lessons.topicId,
        orderIndex: lessons.orderIndex,
      })
      .from(lessons)
      .where(eq(lessons.id, numericLessonId))
      .limit(1);

    if (lesson.length > 0) {
      // Check if there are previous lessons in the same topic
      const previousLessons = await db
        .select({
          id: lessons.id,
        })
        .from(lessons)
        .where(eq(lessons.topicId, lesson[0].topicId))
        .limit(10); // Get some previous lessons

      // For self-learning, we allow access but could add metadata
      // about recommended prerequisites
      if (previousLessons.length > 1) {
        // Add a header to indicate there are prerequisites
        res.setHeader('X-Prerequisites-Available', 'true');
        res.setHeader('X-Prerequisites-Count', (previousLessons.length - 1).toString());
      }
    }

    next();
  } catch (error) {
    console.error("Prerequisites check error:", error);
    // Don't block access on prerequisite check errors
    next();
  }
}

/**
 * Require admin role
 */
export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: "Authentication required",
    });
  }

  // For now, we'll use a simple check based on email domain or specific users
  // In a full implementation, you would have a role field in the user table
  const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [];
  
  if (!adminEmails.includes(req.user.email)) {
    return res.status(403).json({
      success: false,
      error: "Admin access required",
    });
  }

  next();
}

/**
 * Require teacher or admin role
 */
export function requireTeacher(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: "Authentication required",
    });
  }

  // For now, we'll use a simple check based on email domain or specific users
  const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [];
  const teacherEmails = process.env.TEACHER_EMAILS?.split(',') || [];
  
  if (!adminEmails.includes(req.user.email) && !teacherEmails.includes(req.user.email)) {
    return res.status(403).json({
      success: false,
      error: "Teacher access required",
    });
  }

  next();
}