import { Request, Response, NextFunction } from "express";
import { z, ZodSchema } from "zod";

/**
 * Generic validation middleware
 */
export function validateRequest(schema: { body?: ZodSchema; query?: ZodSchema; params?: ZodSchema }) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (schema.body) {
        req.body = schema.body.parse(req.body);
      }

      if (schema.query) {
        req.query = schema.query.parse(req.query);
      }

      if (schema.params) {
        req.params = schema.params.parse(req.params);
      }

      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: "Validation failed",
          details: error.errors.map((err) => ({
            field: err.path.join("."),
            message: err.message,
          })),
        });
      }

      res.status(500).json({
        success: false,
        error: "Validation error",
      });
    }
  };
}

/**
 * Common validation schemas
 */
export const commonSchemas = {
  // ID parameters
  subjectId: z.object({
    id: z.string().min(1, "Subject ID is required"),
  }),

  topicId: z.object({
    id: z.string().min(1, "Topic ID is required"),
  }),

  lessonId: z.object({
    id: z.string().transform((val) => {
      const num = parseInt(val);
      if (isNaN(num)) throw new Error("Lesson ID must be a number");
      return num;
    }),
  }),

  // Pagination
  pagination: z.object({
    page: z
      .string()
      .optional()
      .default("1")
      .transform((val) => {
        const num = parseInt(val);
        if (isNaN(num) || num < 1) return 1;
        return num;
      }),
    limit: z
      .string()
      .optional()
      .default("10")
      .transform((val) => {
        const num = parseInt(val);
        if (isNaN(num) || num < 1) return 10;
        if (num > 100) return 100; // Max limit
        return num;
      }),
    sortBy: z.string().optional(),
    sortOrder: z.enum(["asc", "desc"]).optional().default("asc"),
  }),

  // Progress update
  progressUpdate: z.object({
    progressPercentage: z.number().min(0).max(100),
    completed: z.boolean().optional(),
    timeSpent: z.number().min(0).optional(),
  }),

  // Practice submission
  practiceSubmission: z.object({
    questionId: z.number().int().positive(),
    answer: z.string().min(1, "Answer is required"),
    timeSpent: z.number().min(0).optional(),
  }),

  // Subject creation/update
  createSubject: z.object({
    name: z.string().min(1, "Subject name is required").max(100),
    description: z.string().min(1, "Subject description is required").max(500),
    orderIndex: z.number().int().min(0).optional(),
    isActive: z.boolean().optional().default(true),
  }),

  updateSubject: z.object({
    name: z.string().min(1, "Subject name is required").max(100).optional(),
    description: z.string().min(1, "Subject description is required").max(500).optional(),
    orderIndex: z.number().int().min(0).optional(),
    isActive: z.boolean().optional(),
  }),

  // Topic creation/update
  createTopic: z.object({
    subjectId: z.number().int().positive(),
    name: z.string().min(1, "Topic name is required").max(100),
    description: z.string().min(1, "Topic description is required").max(500),
    orderIndex: z.number().int().min(0).optional(),
    estimatedDuration: z.number().int().min(1).optional(),
    difficultyLevel: z.enum(["beginner", "intermediate", "advanced"]).optional().default("beginner"),
    isActive: z.boolean().optional().default(true),
  }),

  updateTopic: z.object({
    name: z.string().min(1, "Topic name is required").max(100).optional(),
    description: z.string().min(1, "Topic description is required").max(500).optional(),
    orderIndex: z.number().int().min(0).optional(),
    estimatedDuration: z.number().int().min(1).optional(),
    difficultyLevel: z.enum(["beginner", "intermediate", "advanced"]).optional(),
    isActive: z.boolean().optional(),
  }),

  // Lesson creation/update
  createLesson: z.object({
    topicId: z.number().int().positive(),
    title: z.string().min(1, "Lesson title is required").max(200),
    content: z.string().min(1, "Lesson content is required"),
    orderIndex: z.number().int().min(0).optional(),
    estimatedDuration: z.number().int().min(1).optional(),
    difficultyLevel: z.enum(["beginner", "intermediate", "advanced"]).optional().default("beginner"),
    learningObjectives: z.array(z.string()).optional(),
    isActive: z.boolean().optional().default(true),
  }),

  updateLesson: z.object({
    title: z.string().min(1, "Lesson title is required").max(200).optional(),
    content: z.string().min(1, "Lesson content is required").optional(),
    orderIndex: z.number().int().min(0).optional(),
    estimatedDuration: z.number().int().min(1).optional(),
    difficultyLevel: z.enum(["beginner", "intermediate", "advanced"]).optional(),
    learningObjectives: z.array(z.string()).optional(),
    isActive: z.boolean().optional(),
  }),
};

/**
 * Validate numeric ID parameter
 */
export function validateNumericId(paramName: string = "id") {
  return (req: Request, res: Response, next: NextFunction) => {
    const id = req.params[paramName];
    const numericId = parseInt(id);
    
    if (isNaN(numericId) || numericId <= 0) {
      return res.status(400).json({
        success: false,
        error: `Invalid ${paramName}. Must be a positive number.`,
      });
    }
    
    // Store the numeric ID back to params for downstream use
    req.params[paramName] = numericId.toString();
    next();
  };
}

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (password.length < 6) {
    errors.push("Password must be at least 6 characters long");
  }
  
  if (password.length > 128) {
    errors.push("Password must be less than 128 characters");
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }
  
  if (!/\d/.test(password)) {
    errors.push("Password must contain at least one number");
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}