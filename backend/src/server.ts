import app from './app';
import { config } from './config/env';
import { logger } from './utils/logger';
import { prisma } from './config/database';

const PORT = config.port;

// Verificar conexión a la base de datos
async function checkDatabaseConnection() {
  try {
    await prisma.$connect();
    logger.info('✅ Conexión a la base de datos establecida');
  } catch (error) {
    logger.error('❌ Error al conectar con la base de datos:', error);
    process.exit(1);
  }
}

// Iniciar servidor
async function startServer() {
  try {
    await checkDatabaseConnection();

    const server = app.listen(Number(PORT), '0.0.0.0', () => {
      logger.info(`🚀 Servidor corriendo en puerto ${PORT}`);
      logger.info(`📱 Entorno: ${config.nodeEnv}`);
      logger.info(`🌐 URL: http://0.0.0.0:${PORT}`);
    });

    // Manejo de señales de terminación
    const gracefulShutdown = async (signal: string) => {
      logger.info(`\n${signal} recibido. Cerrando servidor...`);
      
      server.close(async () => {
        logger.info('Servidor HTTP cerrado');
        
        await prisma.$disconnect();
        logger.info('Conexión a BD cerrada');
        
        process.exit(0);
      });

      // Forzar cierre después de 10 segundos
      setTimeout(() => {
        logger.error('Forzando cierre del servidor');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    logger.error('Error al iniciar el servidor:', error);
    process.exit(1);
  }
}

startServer();
