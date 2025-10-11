import { Request } from 'express';

// Tipos de usuario
export interface UserPayload {
  id: number;
  email: string;
  name: string;
}

// Extender Request de Express para incluir usuario autenticado
export interface AuthRequest extends Request {
  user?: UserPayload;
}

// DTOs para Auth
export interface RegisterDTO {
  email: string;
  password: string;
  name: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: number;
    email: string;
    name: string;
  };
}

// DTOs para Movies
export interface CreateMovieDTO {
  title: string;
  year: number;
  director: string;
  cast: string[];
  synopsis: string;
  genre: string;
  posterUrl?: string;
}

export interface MovieSearchQuery {
  title?: string;
  year?: number;
  director?: string;
  genre?: string;
  page?: number;
  limit?: number;
}

export interface MovieWithRating {
  id: number;
  hashCode: string;
  title: string;
  year: number;
  director: string;
  cast: string;
  synopsis: string;
  genre: string;
  posterUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
  averageRating: number;
  reviewCount: number;
}

// DTOs para Reviews
export interface CreateReviewDTO {
  movieId: number;
  rating: number;
  comment: string;
}

export interface ReviewWithUser {
  id: number;
  rating: number;
  comment: string;
  validated: boolean;
  createdAt: Date;
  user: {
    id: number;
    name: string;
  };
}

// Respuestas paginadas
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Respuestas de error
export interface ErrorResponse {
  error: string;
  message: string;
  statusCode: number;
  details?: any;
}
