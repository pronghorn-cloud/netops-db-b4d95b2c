import { Request, Response, NextFunction } from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';
import User from '../models/User.model';
import { jwtConfig } from '../config/jwt';
import { sendSuccess, sendError } from '../utils/response.util';
import { AuthRequest } from '../middleware/auth.middleware';

// Generate JWT token
const generateToken = (userId: string): string => {
  return jwt.sign(
    { id: userId },
    jwtConfig.secret,
    { expiresIn: jwtConfig.expiresIn } as SignOptions
  );
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {

  try {
    const { username, email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findByEmailOrUsername(email, username);
    if (existingUser) {
      sendError(res, 400, 'User already exists with this email or username');
      return;
    }

    // Create user
    const user = await User.create({
      username,
      email,
      password,
      role: role || 'user'
    });

    // Generate token
    const token = generateToken(user.id);

    sendSuccess(res, 201, {
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Check if user exists (include password for verification)
    const user = await User.findByEmail(email, true);
    if (!user) {
      sendError(res, 401, 'Invalid credentials');
      return;
    }

    // Verify password
    const isPasswordValid = await User.comparePassword(password, user.password);
    if (!isPasswordValid) {
      sendError(res, 401, 'Invalid credentials');
      return;
    }

    // Generate token
    const token = generateToken(user.id);

    sendSuccess(res, 200, {
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 401, 'User not authenticated');
      return;
    }

    sendSuccess(res, 200, {
      id: req.user.id,
      username: req.user.username,
      email: req.user.email,
      role: req.user.role,
      createdAt: req.user.createdAt
    });
  } catch (error) {
    next(error);
  }
};
