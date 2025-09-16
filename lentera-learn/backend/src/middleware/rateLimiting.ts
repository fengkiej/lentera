import rateLimit from "express-rate-limit";
import { Request } from "express";
import { AuthenticatedRequest } from "./auth";

/**
 * Skip rate limiting for localhost development
 */
const skipLocalhost = (req: Request) => {
  const origin = req.get('origin') || req.get('referer') || '';
  const host = req.get('host') || '';
  
  // Skip rate limiting for localhost:8080 and localhost:3001
  return origin.includes('localhost:8080') || 
         origin.includes('localhost:3001') ||
         host.includes('localhost:8080') ||
         host.includes('localhost:3001') ||
         req.ip === '127.0.0.1' ||
         req.ip === '::1';
};

/**
 * General API rate limiting
 */
export const generalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: "Too many requests, please try again later",
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipLocalhost,
});

/**
 * Authentication rate limiting
 */
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  keyGenerator: (req: Request) => {
    // Use IP + email for login attempts
    const email = req.body?.email || req.body?.username;
    return `${req.ip}:${email || "unknown"}`;
  },
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: "Too many authentication attempts, please try again later",
    retryAfter: "15 minutes",
  },
  // Skip successful requests
  skipSuccessfulRequests: true,
  skip: skipLocalhost,
});

/**
 * Registration rate limiting
 */
export const registerRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 registration attempts per hour per IP
  keyGenerator: (req: Request) => req.ip || 'unknown',
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: "Too many registration attempts, please try again later",
    retryAfter: "1 hour",
  },
  skip: skipLocalhost,
});

/**
 * Practice submission rate limiting
 */
export const practiceRateLimit = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: (req: AuthenticatedRequest) => {
    // Different limits based on user role
    const user = req.user;
    if (!user) return 5; // Anonymous users

    // For traditional auth, we don't have role field yet, so use conservative limits
    return 30; // 1 per 2 seconds for authenticated users
  },
  keyGenerator: (req: AuthenticatedRequest) => {
    return req.user?.id || req.ip || 'unknown';
  },
  message: {
    success: false,
    error: "Too many practice submissions, please slow down",
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipLocalhost,
});

/**
 * Progress update rate limiting
 */
export const progressRateLimit = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: (req: AuthenticatedRequest) => {
    // Different limits based on user role
    const user = req.user;
    if (!user) return 10; // Anonymous users

    // For traditional auth, use conservative limits
    return 50; // Normal limit for authenticated users
  },
  keyGenerator: (req: AuthenticatedRequest) => {
    return req.user?.id || req.ip || 'unknown';
  },
  message: {
    success: false,
    error: "Too many progress updates, please slow down",
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipLocalhost,
});

/**
 * User-specific rate limiting (for authenticated users)
 */
export function createUserRateLimit(windowMs: number, max: number, message: string) {
  return rateLimit({
    windowMs,
    max: (req: AuthenticatedRequest) => {
      // Different limits based on user authentication status
      const user = req.user;
      if (!user) return max; // Anonymous users get base limit

      // For now, authenticated users get double the limit
      return max * 2;
    },
    message: {
      success: false,
      error: message,
    },
    keyGenerator: (req: AuthenticatedRequest) => {
      // Use user ID if authenticated, otherwise fall back to IP
      return req.user?.id || req.ip || 'unknown';
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: skipLocalhost,
  });
}