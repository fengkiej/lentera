import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { Express } from "express";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Lentera Backend API",
      version: "1.0.0",
      description: "API documentation for Lentera - General Learning App",
      contact: {
        name: "Lentera Team",
        email: "support@lentera.ai",
      },
      license: {
        name: "MIT",
        url: "https://opensource.org/licenses/MIT",
      },
    },
    servers: [
      {
        url: "http://localhost:3001",
        description: "Development server",
      },
      {
        url: "https://api.lentera.ai",
        description: "Production server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description: "User unique identifier",
            },
            email: {
              type: "string",
              format: "email",
              description: "User email address",
            },
            name: {
              type: "string",
              description: "User full name",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "Account creation timestamp",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              description: "Last update timestamp",
            },
          },
        },
        Lesson: {
          type: "object",
          properties: {
            id: {
              type: "integer",
              description: "Lesson unique identifier",
            },
            rootWord: {
              type: "string",
              description: "Arabic root word",
            },
            meaning: {
              type: "string",
              description: "English meaning of the word",
            },
            arabicText: {
              type: "string",
              description: "Arabic text with diacritics",
            },
            transliteration: {
              type: "string",
              description: "Romanized pronunciation",
            },
            definition: {
              type: "string",
              description: "Detailed definition",
            },
            difficulty: {
              type: "string",
              enum: ["Mudah", "Sedang", "Sulit"],
              description: "Lesson difficulty level",
            },
            orderIndex: {
              type: "integer",
              description: "Order in curriculum",
            },
            progress: {
              type: "integer",
              description: "Overall progress percentage",
            },
          },
        },
        UserProgress: {
          type: "object",
          properties: {
            id: {
              type: "integer",
              description: "Progress record ID",
            },
            userId: {
              type: "string",
              description: "User ID",
            },
            lessonId: {
              type: "integer",
              description: "Lesson ID",
            },
            progressPercentage: {
              type: "integer",
              minimum: 0,
              maximum: 100,
              description: "Progress percentage",
            },
            completedAt: {
              type: "string",
              format: "date-time",
              nullable: true,
              description: "Completion timestamp",
            },
            lastAccessed: {
              type: "string",
              format: "date-time",
              description: "Last access timestamp",
            },
          },
        },
        PracticeQuestion: {
          type: "object",
          properties: {
            id: {
              type: "integer",
              description: "Question ID",
            },
            lessonId: {
              type: "integer",
              description: "Associated lesson ID",
            },
            type: {
              type: "string",
              enum: ["guess-meaning", "arrange-words", "pronunciation", "multiple-choice"],
              description: "Question type",
            },
            question: {
              type: "string",
              description: "Question text",
            },
            arabicText: {
              type: "string",
              nullable: true,
              description: "Arabic text for the question",
            },
            transliteration: {
              type: "string",
              nullable: true,
              description: "Transliteration",
            },
            targetWord: {
              type: "string",
              nullable: true,
              description: "Target word for text input questions",
            },
            explanation: {
              type: "string",
              description: "Explanation or correct answer",
            },
          },
        },
        Error: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: false,
            },
            error: {
              type: "object",
              properties: {
                message: {
                  type: "string",
                  description: "Error message",
                },
              },
            },
          },
        },
        Success: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: true,
            },
            message: {
              type: "string",
              description: "Success message",
            },
            data: {
              type: "object",
              description: "Response data",
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./src/routes/*.ts"], // Path to the API files
};

const specs = swaggerJsdoc(options);

export const setupSwagger = (app: Express): void => {
  app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(specs, {
      explorer: true,
      customCss: ".swagger-ui .topbar { display: none }",
      customSiteTitle: "Lentera AI API Documentation",
    })
  );
};

export default specs;
