import { Router } from 'express';
import { ReviewController } from '../controllers/reviewController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

/**
 * @route   POST /api/reviews
 * @desc    Crear nueva reseña
 * @access  Private
 */
router.post('/', authMiddleware, ReviewController.createReview);

/**
 * @route   GET /api/reviews/movie/:movieId
 * @desc    Obtener reseñas de una película
 * @access  Private
 */
router.get('/movie/:movieId', authMiddleware, ReviewController.getReviewsByMovie);

/**
 * @route   GET /api/reviews/user/me
 * @desc    Obtener mis reseñas
 * @access  Private
 */
router.get('/user/me', authMiddleware, ReviewController.getMyReviews);

export default router;
