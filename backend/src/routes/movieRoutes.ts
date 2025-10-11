import { Router } from 'express';
import { MovieController } from '../controllers/movieController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

/**
 * @route   GET /api/movies/search
 * @desc    Buscar películas por criterios
 * @access  Private
 */
router.get('/search', authMiddleware, MovieController.searchMovies);

/**
 * @route   GET /api/movies
 * @desc    Obtener todas las películas (paginado)
 * @access  Private
 */
router.get('/', authMiddleware, MovieController.getAllMovies);

/**
 * @route   GET /api/movies/:id
 * @desc    Obtener película por ID
 * @access  Private
 */
router.get('/:id', authMiddleware, MovieController.getMovieById);

/**
 * @route   POST /api/movies
 * @desc    Crear nueva película
 * @access  Private
 */
router.post('/', authMiddleware, MovieController.createMovie);

export default router;
