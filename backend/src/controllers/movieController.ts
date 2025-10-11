import { Request, Response, NextFunction } from 'express';
import { MovieService } from '../services/movieService';
import { z } from 'zod';

// Schemas de validación
export const createMovieSchema = z.object({
  title: z.string().min(1, 'El título es requerido'),
  year: z.number().int().min(1888).max(new Date().getFullYear() + 5),
  director: z.string().min(1, 'El director es requerido'),
  cast: z.array(z.string()).min(1, 'Debe incluir al menos un actor'),
  synopsis: z.string().min(10, 'La sinopsis debe tener al menos 10 caracteres'),
  genre: z.string().min(1, 'El género es requerido'),
  posterUrl: z.string().url().optional()
});

export const searchMovieSchema = z.object({
  title: z.string().optional(),
  year: z.coerce.number().int().optional(),
  director: z.string().optional(),
  genre: z.string().optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional()
});

export class MovieController {
  /**
   * GET /api/movies
   */
  static async getAllMovies(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      
      const result = await MovieService.getAllMovies(page, limit);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/movies/:id
   */
  static async getMovieById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const movie = await MovieService.getMovieById(id);
      res.status(200).json(movie);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/movies
   */
  static async createMovie(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = createMovieSchema.parse(req.body);
      const movie = await MovieService.createMovie(data);
      res.status(201).json(movie);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/movies/search
   */
  static async searchMovies(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = searchMovieSchema.parse(req.query);
      const result = await MovieService.searchMovies(query);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}
