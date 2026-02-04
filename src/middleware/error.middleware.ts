import { Request, Response, NextFunction } from 'express';

interface ErrorResponse {
  success: boolean;
  error: string;
  details?: any;
  stack?: string;
}

export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {

  let error = { ...err };
  error.message = err.message;

  // Log error for debugging
  console.error('Error:', err);

  // PostgreSQL invalid UUID format
  if (err.message && err.message.includes('invalid input syntax for type uuid')) {
    const message = 'Invalid ID format';
    error = { message, statusCode: 400 };
  }

  // PostgreSQL duplicate key (unique constraint violation)
  if (err.code === '23505') {
    const message = 'Resource already exists (duplicate key)';
    error = { message, statusCode: 400 };
  }

  // PostgreSQL foreign key constraint violation
  if (err.code === '23503') {
    const message = 'Referenced resource not found (foreign key constraint)';
    error = { message, statusCode: 400 };
  }

  // PostgreSQL not null constraint violation
  if (err.code === '23502') {
    const message = 'Required field is missing (not null constraint)';
    error = { message, statusCode: 400 };
  }

  // PostgreSQL check constraint violation
  if (err.code === '23514') {
    const message = 'Validation failed (check constraint)';
    error = { message, statusCode: 400 };
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = { message, statusCode: 401 };
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    error = { message, statusCode: 401 };
  }

  const response: ErrorResponse = {
    success: false,
    error: error.message || 'Server Error'
  };

  // Include validation details if available
  if (error.errors) {
    response.details = error.errors;
  }

  // Include stack trace in development
  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  res.status(error.statusCode || 500).json(response);
};
