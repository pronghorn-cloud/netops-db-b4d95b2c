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

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    message: 'NetOps API is running',
    timestamp: new Date().toISOString()
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

// Database connection
const connectDB = async (): Promise<void> => {
  try {
    await connectDatabase();
  } catch (error) {
    console.error('❌ Database connection error:', error);
    process.exit(1);
  }
};

// Start server
const startServer = async (): Promise<void> => {
  await connectDB();
  
  app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
  });
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

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  console.error('Unhandled Rejection:', err);
  process.exit(1);
});

startServer();

export default app;
