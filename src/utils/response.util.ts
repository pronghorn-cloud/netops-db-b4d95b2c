import { Response } from 'express';

interface SuccessResponse {
  success: boolean;
  data: any;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

interface ErrorResponse {
  success: boolean;
  error: string;
  details?: any;
}

// Success response helper
export const sendSuccess = (
  res: Response,
  statusCode: number,
  data: any,
  pagination?: any
): Response => {
  const response: SuccessResponse = {
    success: true,
    data
  };

  if (pagination) {
    response.pagination = pagination;
  }

  return res.status(statusCode).json(response);
};

// Error response helper
export const sendError = (
  res: Response,
  statusCode: number,
  error: string,
  details?: any
): Response => {
  const response: ErrorResponse = {
    success: false,
    error
  };

  if (details) {
    response.details = details;
  }

  return res.status(statusCode).json(response);
};

// Calculate pagination
export const calculatePagination = (
  page: number,
  limit: number,
  total: number
) => {
  return {
    page,
    limit,
    total,
    pages: Math.ceil(total / limit)
  };
};
