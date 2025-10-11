import { api } from './api';
import { Movie, CreateMovieDTO, PaginatedResponse, MovieSearchQuery } from '../types';

export const movieService = {
  async getAllMovies(page = 1, limit = 20): Promise<PaginatedResponse<Movie>> {
    const response = await api.get<PaginatedResponse<Movie>>('/movies', {
      params: { page, limit }
    });
    return response.data;
  },

  async getMovieById(id: number): Promise<Movie> {
    const response = await api.get<Movie>(`/movies/${id}`);
    return response.data;
  },

  async createMovie(data: CreateMovieDTO): Promise<Movie> {
    const response = await api.post<Movie>('/movies', data);
    return response.data;
  },

  async searchMovies(query: MovieSearchQuery): Promise<PaginatedResponse<Movie>> {
    const response = await api.get<PaginatedResponse<Movie>>('/movies/search', {
      params: query
    });
    return response.data;
  }
};
