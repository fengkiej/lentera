import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { createError, asyncHandler } from "./errorHandling.js";
import { db } from "../db/connection";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
  };
  auth?: {
    userId: string;
    sessionId?: string;
  };
  clerkUserId?: string;
}

export interface JWTPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

export const authenticate = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  let token: string | undefined;

  // Get token from header
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  // Check if token exists
  if (!token) {
    throw createError("Access denied. No token provided.", 401);
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;

    // Get user from database
    const user = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
      })
      .from(users)
      .where(eq(users.id, decoded.userId))
      .limit(1);

    if (!user.length) {
      throw createError("User not found", 401);
    }

    // Add user to request object
    req.user = user[0];
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw createError("Invalid token", 401);
    }
    if (error instanceof jwt.TokenExpiredError) {
      throw createError("Token expired", 401);
    }
    throw error;
  }
});

// Optional authentication - doesn't throw error if no token
export const optionalAuth = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  let token: string | undefined;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;

      const user = await db
        .select({
          id: users.id,
          email: users.email,
          name: users.name,
        })
        .from(users)
        .where(eq(users.id, decoded.userId))
        .limit(1);

      if (user.length) {
        req.user = user[0];
      }
    } catch (error) {
      // Silently ignore token errors for optional auth
    }
  }

  next();
});

// Hybrid authentication - tries Clerk first, then JWT
export const hybridAuthenticate = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  // JWT authentication
  let token: string | undefined;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    throw createError("Access denied. No valid authentication provided.", 401);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;

    const user = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
      })
      .from(users)
      .where(eq(users.id, decoded.userId))
      .limit(1);

    if (!user.length) {
      throw createError("User not found", 401);
    }

    req.user = user[0];
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw createError("Invalid token", 401);
    }
    if (error instanceof jwt.TokenExpiredError) {
      throw createError("Token expired", 401);
    }
    throw error;
  }
});

// JWT optional authentication
export const hybridOptionalAuth = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  // Try JWT authentication
  let token: string | undefined;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;

      const user = await db
        .select({
          id: users.id,
          email: users.email,
          name: users.name,
        })
        .from(users)
        .where(eq(users.id, decoded.userId))
        .limit(1);

      if (user.length) {
        req.user = user[0];
      }
    } catch (error) {
      // Silently ignore JWT errors for optional auth
    }
  }

  next();
});
