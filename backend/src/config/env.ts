import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL || '',
  jwt: {
    secret: process.env.JWT_SECRET || 'default-secret-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  },
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173'
  }
};

// Validar variables de entorno críticas
if (!process.env.DATABASE_URL) {
  console.warn('⚠️  DATABASE_URL no está configurada');
}

if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'default-secret-change-in-production') {
  console.warn('⚠️  JWT_SECRET no está configurada o usa el valor por defecto');
}
