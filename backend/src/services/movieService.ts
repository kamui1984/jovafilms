import { prisma } from '../config/database';
import { CreateMovieDTO, MovieSearchQuery, MovieWithRating, PaginatedResponse } from '../types';
import { AppError } from '../middlewares/errorHandler';
import { HashService } from './hashService';
import { logger } from '../utils/logger';

export class MovieService {
  /**
   * Obtiene todas las películas con paginación
   */
  static async getAllMovies(page = 1, limit = 20): Promise<PaginatedResponse<MovieWithRating>> {
    try {
      const skip = (page - 1) * limit;

      const [movies, total] = await Promise.all([
        prisma.movie.findMany({
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            reviews: {
              select: { rating: true }
            }
          }
        }),
        prisma.movie.count()
      ]);

      const moviesWithRating = movies.map(movie => this.calculateMovieRating(movie));

      return {
        data: moviesWithRating,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      logger.error(`Error al obtener películas: ${error}`);
      throw new AppError(500, 'Error al obtener películas');
    }
  }

  /**
   * Obtiene una película por ID
   */
  static async getMovieById(id: number): Promise<MovieWithRating> {
    try {
      const movie = await prisma.movie.findUnique({
        where: { id },
        include: {
          reviews: {
            select: { rating: true }
          }
        }
      });

      if (!movie) {
        throw new AppError(404, 'Película no encontrada');
      }

      return this.calculateMovieRating(movie);
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error(`Error al obtener película: ${error}`);
      throw new AppError(500, 'Error al obtener película');
    }
  }

  /**
   * Crea una nueva película
   */
  static async createMovie(data: CreateMovieDTO): Promise<MovieWithRating> {
    try {
      // Generar hash code
      const hashCode = HashService.generateMovieHash(data.title, data.year);

      // Verificar si ya existe
      const existingMovie = await prisma.movie.findUnique({
        where: { hashCode }
      });

      if (existingMovie) {
        throw new AppError(409, 'La película ya existe en el sistema');
      }

      // Crear película
      const movie = await prisma.movie.create({
        data: {
          hashCode,
          title: data.title,
          year: data.year,
          director: data.director,
          cast: JSON.stringify(data.cast),
          synopsis: data.synopsis,
          genre: data.genre,
          posterUrl: data.posterUrl
        },
        include: {
          reviews: {
            select: { rating: true }
          }
        }
      });

      logger.info(`Película creada: ${movie.title} (${movie.year})`);

      return this.calculateMovieRating(movie);
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error(`Error al crear película: ${error}`);
      throw new AppError(500, 'Error al crear película');
    }
  }

  /**
   * Busca películas por criterios
   */
  static async searchMovies(query: MovieSearchQuery): Promise<PaginatedResponse<MovieWithRating>> {
    try {
      const { title, year, director, genre, page = 1, limit = 20 } = query;
      const skip = (page - 1) * limit;

      const where: any = {};

      if (title) {
        where.title = { contains: title, mode: 'insensitive' };
      }

      if (year) {
        where.year = year;
      }

      if (director) {
        where.director = { contains: director, mode: 'insensitive' };
      }

      if (genre) {
        where.genre = { contains: genre, mode: 'insensitive' };
      }

      const [movies, total] = await Promise.all([
        prisma.movie.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            reviews: {
              select: { rating: true }
            }
          }
        }),
        prisma.movie.count({ where })
      ]);

      const moviesWithRating = movies.map(movie => this.calculateMovieRating(movie));

      return {
        data: moviesWithRating,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      logger.error(`Error en búsqueda de películas: ${error}`);
      throw new AppError(500, 'Error al buscar películas');
    }
  }

  /**
   * Calcula el rating promedio de una película
   */
  private static calculateMovieRating(movie: any): MovieWithRating {
    const ratings = movie.reviews.map((r: any) => r.rating);
    const averageRating = ratings.length > 0
      ? ratings.reduce((sum: number, rating: number) => sum + rating, 0) / ratings.length
      : 0;

    return {
      id: movie.id,
      hashCode: movie.hashCode,
      title: movie.title,
      year: movie.year,
      director: movie.director,
      cast: movie.cast,
      synopsis: movie.synopsis,
      genre: movie.genre,
      posterUrl: movie.posterUrl,
      createdAt: movie.createdAt,
      updatedAt: movie.updatedAt,
      averageRating: Math.round(averageRating * 10) / 10,
      reviewCount: ratings.length
    };
  }
}
