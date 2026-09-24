/**
 * ─────────────────────────────────────────────
 *  Database Configuration — MongoDB via Mongoose
 * ─────────────────────────────────────────────
 */

import mongoose from 'mongoose';

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error('❌  MONGODB_URI is not defined in environment variables.');
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(uri);
    console.log(`✅  MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌  MongoDB connection error: ${error.message}`);
    process.exit(1);
  }

  mongoose.connection.on('error', (err) => {
    console.error(`❌  MongoDB runtime error: ${err.message}`);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('⚠️   MongoDB disconnected');
  });
};

export default connectDB;
