import cron from 'node-cron';
import { config } from './config/env';
import { logger } from './utils/logger';
import { prisma } from './config/database';
import { validateReviewsJob } from './jobs/validateReviews';
import { blobStorageService } from './services/blobStorageService';

async function checkDatabaseConnection() {
  try {
    await prisma.$connect();
    logger.info('✅ Conexión a la base de datos establecida');
  } catch (error) {
    logger.error('❌ Error al conectar con la base de datos:', error);
    process.exit(1);
  }
}

async function initializeBlobStorage() {
  try {
    await blobStorageService.initialize();
    if (blobStorageService.isEnabled()) {
      logger.info('✅ Azure Blob Storage inicializado');
    } else {
      logger.warn('⚠️ Azure Blob Storage no configurado (modo local)');
    }
  } catch (error) {
    logger.error('❌ Error al inicializar Blob Storage:', error);
    logger.warn('⚠️ Continuando sin Blob Storage...');
  }
}

async function startBatchService() {
  try {
    await checkDatabaseConnection();
    await initializeBlobStorage();

    logger.info('🎬 JovaFilms Batch Service iniciado');
    logger.info(`⏰ Intervalo de ejecución: cada ${config.batchIntervalMinutes} minutos`);
    logger.info(`📱 Entorno: ${config.nodeEnv}`);

    // Ejecutar inmediatamente al iniciar
    logger.info('🚀 Ejecutando primera validación...');
    await validateReviewsJob();

    // Configurar cron job
    // Formato: */X * * * * (cada X minutos)
    const cronExpression = `*/${config.batchIntervalMinutes} * * * *`;
    
    cron.schedule(cronExpression, async () => {
      await validateReviewsJob();
    });

    logger.info(`✅ Cron job configurado: ${cronExpression}`);
    logger.info('⏳ Esperando próxima ejecución...');

  } catch (error) {
    logger.error('Error al iniciar el servicio batch:', error);
    process.exit(1);
  }
}

// Manejo de señales de terminación
const gracefulShutdown = async (signal: string) => {
  logger.info(`\n${signal} recibido. Cerrando servicio batch...`);
  
  await prisma.$disconnect();
  logger.info('Conexión a BD cerrada');
  
  process.exit(0);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Iniciar servicio
startBatchService();
