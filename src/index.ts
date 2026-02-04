import express, { Application, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';

import { connectDatabase, disconnectDatabase } from './config/database';
import { errorHandler } from './middleware/error.middleware';
import authRoutes from './routes/auth.routes';
import siteRoutes from './routes/site.routes';
import containerRoutes from './routes/container.routes';
import deviceRoutes from './routes/device.routes';

// Load environment variables
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;

// Track database connection status
let dbConnected = false;
let dbError: string | null = null;

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api', limiter);

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Health check endpoint - always responds even if DB is down
app.get('/health', (_req: Request, res: Response) => {
  const status = dbConnected ? 'ok' : 'degraded';
  const statusCode = dbConnected ? 200 : 503;
  
  res.status(statusCode).json({
    status,
    message: 'NetOps API is running',
    database: dbConnected ? 'connected' : 'disconnected',
    dbError: dbError,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/sites', siteRoutes);
app.use('/api/containers', containerRoutes);
app.use('/api/devices', deviceRoutes);

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    error: 'Route not found'
  });
});

// Error handler (must be last)
app.use(errorHandler);

// Database connection - non-blocking
const connectDB = async (): Promise<void> => {
  try {
    await connectDatabase();
    dbConnected = true;
    dbError = null;
    console.log('✅ Database connected successfully');
  } catch (error) {
    dbConnected = false;
    dbError = error instanceof Error ? error.message : 'Unknown database error';
    console.error('❌ Database connection error:', error);
    // Don't exit - let the server run so health checks work
  }
};

// Start server - start HTTP first, then connect to DB
const startServer = async (): Promise<void> => {
  // Start listening immediately so health checks work
  app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
  });
  
  // Then attempt database connection
  await connectDB();
};

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server');
  await disconnectDatabase();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT signal received: closing HTTP server');
  await disconnectDatabase();
  process.exit(0);
});

// Handle unhandled promise rejections - log but don't crash
process.on('unhandledRejection', (err: Error) => {
  console.error('Unhandled Rejection:', err);
  // Don't exit - let the server continue running
});

startServer();

export default app;
