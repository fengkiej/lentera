import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AuthenticatedRequest } from './auth.js';

// Enhanced error interface
interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
  code?: string;
}

// Create operational error
export const createError = (message: string, statusCode: number = 500, code?: string): AppError => {
  const error: AppError = new Error(message);
  error.statusCode = statusCode;
  error.isOperational = true;
  error.code = code;
  return error;
};

// Async error handler wrapper
export const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Enhanced error handler middleware
export const errorHandler = (err: AppError, req: Request, res: Response, _next: NextFunction) => {
  let error = { ...err };
  error.message = err.message;

  // Log error details
  console.error('Error Details:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: (req as AuthenticatedRequest).user?.id,
    timestamp: new Date().toISOString(),
  });

  // Zod validation errors
  if (err instanceof ZodError) {
    const message = err.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
    error = createError(`Validation Error: ${message}`, 400, 'VALIDATION_ERROR');
  }

  // Database errors
  if (err.message?.includes('UNIQUE constraint failed')) {
    error = createError('Resource already exists', 409, 'DUPLICATE_RESOURCE');
  }

  if (err.message?.includes('FOREIGN KEY constraint failed')) {
    error = createError('Referenced resource not found', 400, 'INVALID_REFERENCE');
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = createError('Invalid token', 401, 'INVALID_TOKEN');
  }

  if (err.name === 'TokenExpiredError') {
    error = createError('Token expired', 401, 'TOKEN_EXPIRED');
  }

  // Rate limiting errors
  if (err.message?.includes('Too many requests')) {
    error = createError('Rate limit exceeded', 429, 'RATE_LIMIT_EXCEEDED');
  }

  // Default to 500 server error
  const statusCode = error.statusCode || 500;
  const message = error.isOperational ? error.message : 'Internal server error';

  res.status(statusCode).json({
    success: false,
    error: message,
    code: error.code,
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
      details: err,
    }),
  });
};

// 404 handler
export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  const error = createError(`Route ${req.originalUrl} not found`, 404, 'ROUTE_NOT_FOUND');
  next(error);
};

// Validation error helper
export const validationError = (message: string) => {
  return createError(message, 400, 'VALIDATION_ERROR');
};

// Authorization error helper
export const authorizationError = (message: string = 'Access denied') => {
  return createError(message, 403, 'ACCESS_DENIED');
};

// Authentication error helper
export const authenticationError = (message: string = 'Authentication required') => {
  return createError(message, 401, 'AUTHENTICATION_REQUIRED');
};

// Not found error helper
export const notFoundError = (resource: string = 'Resource') => {
  return createError(`${resource} not found`, 404, 'RESOURCE_NOT_FOUND');
};

// Conflict error helper
export const conflictError = (message: string) => {
  return createError(message, 409, 'CONFLICT');
};