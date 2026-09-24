/**
 * ─────────────────────────────────────────────
 *  SchoolERP Backend — Express Application
 * ─────────────────────────────────────────────
 *  Configures Express middleware stack and mounts
 *  the API router. Exports the `app` instance so
 *  server.js can attach it to an HTTP server.
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

// ── API Route Loader ──────────────────────────
import apiRoutes from './routes/index.js';

// ── Import middleware ──
import { errorHandler } from './middleware/errorHandler.js';
import { notFoundHandler } from './middleware/notFoundHandler.js';

const app = express();

// ── Global Middleware ────────────────────────
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting — 100 requests per 15 min window
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use('/api', limiter);

// ── Health Check ─────────────────────────────
app.get('/api/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'SchoolERP API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// ── API Routes ───────────────────────────────
app.use('/api', apiRoutes);

// ── Error Handling ───────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
