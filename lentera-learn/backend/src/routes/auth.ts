import { Router, Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import { db } from "../db/connection";
import { users, userStats } from "../db/schema";
import { eq } from "drizzle-orm";
import { authRateLimit, registerRateLimit } from "../middleware/rateLimiting.js";
import { validateRequest } from "../middleware/validation.js";
import { asyncHandler } from "../middleware/errorHandling.js";

const router = Router();

// Validation schemas
const registerSchema = z.object({
  name: z.string().min(2, "Nama harus minimal 2 karakter").max(50),
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(6, "Password harus minimal 6 karakter"),
});

const loginSchema = z.object({
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(1, "Password harus diisi"),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Password saat ini harus diisi"),
  newPassword: z.string().min(6, "Password baru harus minimal 6 karakter"),
});

/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 50
 *                 description: User's full name
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 description: User's password
 *     responses:
 *       201:
 *         description: User registered successfully
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
 *                   example: "User registered successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *                     token:
 *                       type: string
 *                       description: JWT authentication token
 *       400:
 *         description: Validation error or user already exists
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
router.post(
  "/register",
  registerRateLimit,
  validateRequest({ body: registerSchema }),
  asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    try {
      const validatedData = registerSchema.parse(req.body);
      const { email, password, name } = validatedData;

      // Check if user already exists
      const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);

      if (existingUser.length > 0) {
        res.status(400).json({
          success: false,
          message: "Email sudah terdaftar",
        });
        return;
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const userId = uuidv4();
      await db.insert(users).values({
        id: userId,
        email,
        passwordHash: hashedPassword,
        name,
        avatarUrl: null,
      });

      // Create user stats
      await db.insert(userStats).values({
        userId,
        totalStudyTime: 0,
        currentStreak: 0,
        longestStreak: 0,
        totalPoints: 0,
        lessonsCompleted: 0,
        practiceQuestionsAnswered: 0,
        correctAnswers: 0,
        lastStudyDate: null,
      });

      // Generate JWT token
      const token = jwt.sign({ userId, email }, process.env.JWT_SECRET || "lentera-secret-key", { expiresIn: "7d" });

      res.status(201).json({
        success: true,
        message: "Akun berhasil dibuat",
        data: {
          user: {
            id: userId,
            email,
            name,
            avatarUrl: null,
          },
          token,
        },
      });
    } catch (error) {
      console.error("Register error:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          message: "Data tidak valid",
          errors: error.errors,
        });
        return;
      }
      res.status(500).json({
        success: false,
        message: "Terjadi kesalahan server",
      });
    }
  })
);

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *               password:
 *                 type: string
 *                 description: User's password
 *     responses:
 *       200:
 *         description: Login successful
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
 *                   example: "Login successful"
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *                     token:
 *                       type: string
 *                       description: JWT authentication token
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Invalid credentials
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
router.post(
  "/login",
  authRateLimit,
  validateRequest({ body: loginSchema }),
  asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    try {
      const validatedData = loginSchema.parse(req.body);
      const { email, password } = validatedData;

      // Find user
      const user = await db.select().from(users).where(eq(users.email, email)).limit(1);

      if (user.length === 0) {
        res.status(401).json({
          success: false,
          message: "Email atau password salah",
        });
        return;
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user[0].passwordHash!);
      if (!isValidPassword) {
        res.status(401).json({
          success: false,
          message: "Email atau password salah",
        });
        return;
      }

      // Generate JWT token
      const token = jwt.sign({ userId: user[0].id, email: user[0].email }, process.env.JWT_SECRET || "lentera-secret-key", { expiresIn: "7d" });

      res.json({
        success: true,
        message: "Login berhasil",
        data: {
          user: {
            id: user[0].id,
            email: user[0].email,
            name: user[0].name,
            avatarUrl: user[0].avatarUrl,
          },
          token,
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          message: "Data tidak valid",
          errors: error.errors,
        });
        return;
      }
      res.status(500).json({
        success: false,
        message: "Terjadi kesalahan server",
      });
    }
  })
);

/**
 * @swagger
 * /api/v1/auth/me:
 *   get:
 *     summary: Get current user profile
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
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
 *                   example: "User profile retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized - Token missing or invalid
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
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/me", async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({
        success: false,
        message: "Token tidak ditemukan",
      });
      return;
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "lentera-secret-key") as { userId: string; email: string };

    const user = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        avatarUrl: users.avatarUrl,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, decoded.userId))
      .limit(1);

    if (user.length === 0) {
      res.status(404).json({
        success: false,
        message: "User tidak ditemukan",
      });
      return;
    }

    res.json({
      success: true,
      data: {
        user: user[0],
      },
    });
  } catch (error) {
    console.error("Profile error:", error);
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        success: false,
        message: "Token tidak valid",
      });
      return;
    }
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
    });
  }
});

/**
 * @swagger
 * /api/v1/auth/change-password:
 *   post:
 *     summary: Change user password
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 description: Current password
 *               newPassword:
 *                 type: string
 *                 minLength: 6
 *                 description: New password
 *     responses:
 *       200:
 *         description: Password changed successfully
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
 *                   example: "Password berhasil diubah"
 *       400:
 *         description: Validation error or incorrect current password
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized - Token missing or invalid
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
router.post(
  "/change-password",
  authRateLimit,
  validateRequest({ body: changePasswordSchema }),
  asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({
        success: false,
        message: "Token tidak ditemukan",
      });
      return;
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "lentera-secret-key") as { userId: string; email: string };

    const validatedData = changePasswordSchema.parse(req.body);
    const { currentPassword, newPassword } = validatedData;

    // Get current user
    const user = await db
      .select({
        id: users.id,
        passwordHash: users.passwordHash,
      })
      .from(users)
      .where(eq(users.id, decoded.userId))
      .limit(1);

    if (user.length === 0) {
      res.status(404).json({
        success: false,
        message: "User tidak ditemukan",
      });
      return;
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user[0].passwordHash);

    if (!isCurrentPasswordValid) {
      res.status(400).json({
        success: false,
        message: "Password saat ini tidak benar",
      });
      return;
    }

    // Hash new password
    const saltRounds = 12;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password in database
    await db
      .update(users)
      .set({
        passwordHash: hashedNewPassword,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(users.id, decoded.userId));

    res.json({
      success: true,
      message: "Password berhasil diubah",
    });
  })
);

export default router;
