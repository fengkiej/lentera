import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.js';

// Request logging interface
interface LogEntry {
  timestamp: string;
  method: string;
  url: string;
  ip: string;
  userAgent?: string;
  userId?: string;
  statusCode?: number;
  responseTime?: number;
  error?: string;
}

// Enhanced request logger
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  const timestamp = new Date().toISOString();
  
  // Log request details
  const logEntry: LogEntry = {
    timestamp,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip || 'unknown',
    userAgent: req.get('User-Agent'),
    userId: (req as AuthenticatedRequest).user?.id,
  };

  // Log incoming request
  console.log('📥 Incoming Request:', {
    method: logEntry.method,
    url: logEntry.url,
    ip: logEntry.ip,
    userId: logEntry.userId,
    timestamp: logEntry.timestamp,
  });

  // Override res.end to capture response details
  const originalEnd = res.end;
  res.end = function(chunk?: unknown, encoding?: unknown, cb?: () => void) {
    const responseTime = Date.now() - startTime;
    
    // Complete log entry
    const completeLogEntry: LogEntry = {
      ...logEntry,
      statusCode: res.statusCode,
      responseTime,
    };

    // Log response
    const statusEmoji = res.statusCode >= 400 ? '❌' : '✅';
    console.log(`${statusEmoji} Response:`, {
      method: completeLogEntry.method,
      url: completeLogEntry.url,
      statusCode: completeLogEntry.statusCode,
      responseTime: `${completeLogEntry.responseTime}ms`,
      userId: completeLogEntry.userId,
    });

    // Call original end method and return its result
    return originalEnd.call(this, chunk, encoding, cb);
  };

  next();
};

// Security event logger
export const securityLogger = {
  logFailedAuth: (req: Request, reason: string) => {
    console.warn('🔒 Authentication Failed:', {
      ip: req.ip,
      url: req.originalUrl,
      userAgent: req.get('User-Agent'),
      reason,
      timestamp: new Date().toISOString(),
    });
  },

  logSuspiciousActivity: (req: Request, activity: string, details?: Record<string, unknown>) => {
    console.warn('⚠️ Suspicious Activity:', {
      ip: req.ip,
      url: req.originalUrl,
      userAgent: req.get('User-Agent'),
      activity,
      details,
      timestamp: new Date().toISOString(),
    });
  },

  logRateLimitExceeded: (req: Request, limit: string) => {
    console.warn('🚫 Rate Limit Exceeded:', {
      ip: req.ip,
      url: req.originalUrl,
      userAgent: req.get('User-Agent'),
      limit,
      userId: (req as AuthenticatedRequest).user?.id,
      timestamp: new Date().toISOString(),
    });
  },

  logUnauthorizedAccess: (req: Request, resource: string) => {
    console.warn('🚨 Unauthorized Access Attempt:', {
      ip: req.ip,
      url: req.originalUrl,
      userAgent: req.get('User-Agent'),
      resource,
      userId: (req as AuthenticatedRequest).user?.id,
      timestamp: new Date().toISOString(),
    });
  },
};

// Database operation logger
export const dbLogger = {
  logQuery: (operation: string, table: string, userId?: string) => {
    console.log('🗄️ Database Operation:', {
      operation,
      table,
      userId,
      timestamp: new Date().toISOString(),
    });
  },

  logError: (operation: string, table: string, error: string, userId?: string) => {
    console.error('💥 Database Error:', {
      operation,
      table,
      error,
      userId,
      timestamp: new Date().toISOString(),
    });
  },
};

// Performance logger
export const performanceLogger = {
  logSlowQuery: (query: string, duration: number, userId?: string) => {
    console.warn('🐌 Slow Query Detected:', {
      query: query.substring(0, 100) + (query.length > 100 ? '...' : ''),
      duration: `${duration}ms`,
      userId,
      timestamp: new Date().toISOString(),
    });
  },

  logHighMemoryUsage: (usage: number) => {
    console.warn('📈 High Memory Usage:', {
      usage: `${usage}MB`,
      timestamp: new Date().toISOString(),
    });
  },
};

// User activity logger
export const userActivityLogger = {
  logLogin: (userId: string, ip: string) => {
    console.log('👤 User Login:', {
      userId,
      ip,
      timestamp: new Date().toISOString(),
    });
  },

  logLogout: (userId: string, ip: string) => {
    console.log('👋 User Logout:', {
      userId,
      ip,
      timestamp: new Date().toISOString(),
    });
  },

  logLessonAccess: (userId: string, lessonId: number, action: string) => {
    console.log('📚 Lesson Activity:', {
      userId,
      lessonId,
      action,
      timestamp: new Date().toISOString(),
    });
  },

  logPracticeSubmission: (userId: string, questionId: number, isCorrect: boolean) => {
    console.log('✏️ Practice Submission:', {
      userId,
      questionId,
      isCorrect,
      timestamp: new Date().toISOString(),
    });
  },

  logProgressUpdate: (userId: string, lessonId: number, progressPercentage: number) => {
    console.log('📊 Progress Update:', {
      userId,
      lessonId,
      progressPercentage,
      timestamp: new Date().toISOString(),
    });
  },
};