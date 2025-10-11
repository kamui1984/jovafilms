import { Response, NextFunction } from 'express';
import { ReviewService } from '../services/reviewService';
import { AuthRequest } from '../types';
import { z } from 'zod';

// Schema de validación
export const createReviewSchema = z.object({
  movieId: z.number().int().positive(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(10, 'El comentario debe tener al menos 10 caracteres')
});

export class ReviewController {
  /**
   * POST /api/reviews
   */
  static async createReview(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = createReviewSchema.parse(req.body);
      const userId = req.user!.id;
      
      const review = await ReviewService.createReview(userId, data);
      res.status(201).json(review);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/reviews/movie/:movieId
   */
  static async getReviewsByMovie(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const movieId = parseInt(req.params.movieId);
      const reviews = await ReviewService.getReviewsByMovie(movieId);
      res.status(200).json(reviews);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/reviews/user/me
   */
  static async getMyReviews(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const reviews = await ReviewService.getReviewsByUser(userId);
      res.status(200).json(reviews);
    } catch (error) {
      next(error);
    }
  }
}
