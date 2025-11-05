import { prisma } from '../config/database';
import { logger } from '../utils/logger';
import { blobStorageService } from '../services/blobStorageService';

/**
 * Valida reseñas pendientes
 * Convierte palabras en mayúsculas a minúsculas
 * Crea archivo de texto y lo sube a Azure Blob Storage
 */
export async function validateReviewsJob(): Promise<void> {
  try {
    logger.info('🔄 Iniciando validación de reseñas...');

    // Obtener reseñas no validadas
    const unvalidatedReviews = await prisma.review.findMany({
      where: { validated: false },
      orderBy: { createdAt: 'asc' }
    });

    if (unvalidatedReviews.length === 0) {
      logger.info('✅ No hay reseñas pendientes de validación');
      return;
    }

    logger.info(`📝 Encontradas ${unvalidatedReviews.length} reseñas para validar`);

    let validatedCount = 0;
    let errorCount = 0;
    let blobUploadCount = 0;

    for (const review of unvalidatedReviews) {
      try {
        let blobStoragePath: string | null = null;

        // 1. Crear archivo de texto y subir a Azure Blob Storage (si está habilitado)
        if (blobStorageService.isEnabled()) {
          try {
            // Crear contenido del archivo
            const fileContent = blobStorageService.createReviewFileContent({
              id: review.id,
              rating: review.rating,
              comment: review.comment,
              userId: review.userId,
              movieId: review.movieId,
              createdAt: review.createdAt
            });

            // Generar nombre de archivo único
            const fileName = blobStorageService.generateFileName(review.id);

            // Subir a Azure Blob Storage
            blobStoragePath = await blobStorageService.uploadTextFile(fileName, fileContent);
            blobUploadCount++;
            logger.debug(`✓ Archivo subido a Blob Storage: ${fileName}`);
          } catch (blobError) {
            logger.error(`⚠️ Error al subir a Blob Storage para reseña ${review.id}: ${blobError}`);
            // Continuar con la validación aunque falle la subida
          }
        }

        // 2. Convertir palabras en mayúsculas a minúsculas
        const validatedComment = convertUppercaseToLowercase(review.comment);

        // 3. Actualizar reseña en base de datos
        await prisma.review.update({
          where: { id: review.id },
          data: {
            comment: validatedComment,
            validated: true,
            blobStoragePath: blobStoragePath
          }
        });

        validatedCount++;
        logger.debug(`✓ Reseña ${review.id} validada`);
      } catch (error) {
        errorCount++;
        logger.error(`✗ Error al validar reseña ${review.id}: ${error}`);
      }
    }

    logger.info(`✅ Validación completada: ${validatedCount} exitosas, ${errorCount} errores`);
    if (blobStorageService.isEnabled()) {
      logger.info(`📦 Archivos subidos a Blob Storage: ${blobUploadCount}`);
    }
  } catch (error) {
    logger.error(`❌ Error en job de validación: ${error}`);
  }
}

/**
 * Convierte palabras completamente en mayúsculas a minúsculas
 * Mantiene palabras con capitalización normal
 */
function convertUppercaseToLowercase(text: string): string {
  return text
    .split(/\s+/)
    .map(word => {
      // Si la palabra está completamente en mayúsculas (más de 1 carácter)
      if (word.length > 1 && word === word.toUpperCase() && /[A-Z]/.test(word)) {
        return word.toLowerCase();
      }
      return word;
    })
    .join(' ');
}
