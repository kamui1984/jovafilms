import { prisma } from '../config/database';
import { CreateReviewDTO, ReviewWithUser } from '../types';
import { AppError } from '../middlewares/errorHandler';
import { logger } from '../utils/logger';

export class ReviewService {
  /**
   * Crea una nueva reseña
   */
  static async createReview(userId: number, data: CreateReviewDTO): Promise<ReviewWithUser> {
    try {
      // Verificar que la película existe
      const movie = await prisma.movie.findUnique({
        where: { id: data.movieId }
      });

      if (!movie) {
        throw new AppError(404, 'Película no encontrada');
      }

      // Validar rating
      if (data.rating < 1 || data.rating > 5) {
        throw new AppError(400, 'La calificación debe estar entre 1 y 5');
      }

      // Crear reseña (validated = false, será procesada por el batch)
      const review = await prisma.review.create({
        data: {
          userId,
          movieId: data.movieId,
          rating: data.rating,
          comment: data.comment,
          validated: false
        },
        include: {
          user: {
            select: {
              id: true,
              name: true
            }
          }
        }
      });

      logger.info(`Reseña creada por usuario ${userId} para película ${data.movieId}`);

      return {
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        validated: review.validated,
        createdAt: review.createdAt,
        user: review.user
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error(`Error al crear reseña: ${error}`);
      throw new AppError(500, 'Error al crear reseña');
    }
  }

  /**
   * Obtiene todas las reseñas de una película
   */
  static async getReviewsByMovie(movieId: number): Promise<ReviewWithUser[]> {
    try {
      const reviews = await prisma.review.findMany({
        where: { movieId },
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true
            }
          }
        }
      });

      return reviews.map(review => ({
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        validated: review.validated,
        createdAt: review.createdAt,
        user: review.user
      }));
    } catch (error) {
      logger.error(`Error al obtener reseñas: ${error}`);
      throw new AppError(500, 'Error al obtener reseñas');
    }
  }

  /**
   * Obtiene todas las reseñas de un usuario
   */
  static async getReviewsByUser(userId: number): Promise<any[]> {
    try {
      const reviews = await prisma.review.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        include: {
          movie: {
            select: {
              id: true,
              title: true,
              year: true,
              posterUrl: true
            }
          }
        }
      });

      return reviews;
    } catch (error) {
      logger.error(`Error al obtener reseñas del usuario: ${error}`);
      throw new AppError(500, 'Error al obtener reseñas del usuario');
    }
  }

  /**
   * Obtiene reseñas no validadas (para el servicio batch)
   */
  static async getUnvalidatedReviews(): Promise<any[]> {
    try {
      return await prisma.review.findMany({
        where: { validated: false },
        orderBy: { createdAt: 'asc' }
      });
    } catch (error) {
      logger.error(`Error al obtener reseñas no validadas: ${error}`);
      throw new AppError(500, 'Error al obtener reseñas no validadas');
    }
  }

  /**
   * Valida una reseña (convierte mayúsculas a minúsculas)
   */
  static async validateReview(reviewId: number, validatedComment: string): Promise<void> {
    try {
      await prisma.review.update({
        where: { id: reviewId },
        data: {
          comment: validatedComment,
          validated: true
        }
      });

      logger.info(`Reseña ${reviewId} validada`);
    } catch (error) {
      logger.error(`Error al validar reseña: ${error}`);
      throw new AppError(500, 'Error al validar reseña');
    }
  }
}
