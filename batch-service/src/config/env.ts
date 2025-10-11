import dotenv from 'dotenv';

dotenv.config();

export const config = {
  databaseUrl: process.env.DATABASE_URL || '',
  batchIntervalMinutes: parseInt(process.env.BATCH_INTERVAL_MINUTES || '5'),
  nodeEnv: process.env.NODE_ENV || 'development'
};

if (!process.env.DATABASE_URL) {
  console.warn('⚠️  DATABASE_URL no está configurada');
}
