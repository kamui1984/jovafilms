import { prisma } from '../config/database';
import { logger } from '../utils/logger';

/**
 * Valida reseñas pendientes
 * Convierte palabras en mayúsculas a minúsculas
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

    for (const review of unvalidatedReviews) {
      try {
        // Convertir palabras en mayúsculas a minúsculas
        const validatedComment = convertUppercaseToLowercase(review.comment);

        // Actualizar reseña
        await prisma.review.update({
          where: { id: review.id },
          data: {
            comment: validatedComment,
            validated: true
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
