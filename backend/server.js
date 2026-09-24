/**
 * ─────────────────────────────────────────────
 *  SchoolERP Backend — Server Entry Point
 * ─────────────────────────────────────────────
 *  Loads environment variables, connects to MongoDB,
 *  and starts the Express HTTP server.
 */

import dotenv from 'dotenv';
dotenv.config();

import app from './src/app.js';
import { connectDB } from './src/config/db.js';
import { authService } from './src/services/auth.service.js';
import { settingsRepository } from './src/repositories/settings.repository.js';

const PORT = process.env.PORT || 5000;

// ── Bootstrap ────────────────────────────────
const startServer = async () => {
  try {
    await connectDB();

    // Seed default admin if no users exist
    await authService.seedAdmin();

    // Seed default school settings if not configured
    await settingsRepository.seedDefaults();

    app.listen(PORT, () => {
      console.log(`\n🚀  SchoolERP API server running on port ${PORT}`);
      console.log(`📄  Environment : ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗  http://localhost:${PORT}/api\n`);
    });
  } catch (error) {
    console.error('❌  Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
