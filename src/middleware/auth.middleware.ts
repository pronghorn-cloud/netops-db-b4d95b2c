import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User.model';
import { jwtConfig } from '../config/jwt';

// Extend Express Request type to include user
export interface AuthRequest extends Request {
  user?: IUser;
}

export const protect = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token: string | undefined;

    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Check if token exists
    if (!token) {
      res.status(401).json({
        success: false,
        error: 'Authentication required. Please provide a valid token.'
      });
      return;
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, jwtConfig.secret) as { id: string };

      // Get user from token (without password)
      const user = await User.findById(decoded.id, false);

      if (!user) {
        res.status(401).json({
          success: false,
          error: 'User not found. Token is invalid.'
        });
        return;
      }

      // Attach user to request
      req.user = user;
      next();
    } catch (error) {
      res.status(401).json({
        success: false,
        error: 'Invalid or expired token. Please login again.'
      });
      return;
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Authentication error'
    });
    return;
  }
};

// Authorize specific roles
export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: `Insufficient permissions. ${roles.join(' or ')} access required.`
      });
      return;
    }
};

    next();
  };
};
