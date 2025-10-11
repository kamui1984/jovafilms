// Types para la aplicación JovaFilms

export type User = {
  id: number;
  email: string;
  name: string;
};

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Movie {
  id: number;
  hashCode: string;
  title: string;
  year: number;
  director: string;
  cast: string;
  synopsis: string;
  genre: string;
  posterUrl: string | null;
  createdAt: string;
  updatedAt: string;
  averageRating: number;
  reviewCount: number;
}

export interface Review {
  id: number;
  rating: number;
  comment: string;
  validated: boolean;
  createdAt: string;
  user: {
    id: number;
    name: string;
  };
}

export interface CreateMovieDTO {
  title: string;
  year: number;
  director: string;
  cast: string[];
  synopsis: string;
  genre: string;
  posterUrl?: string;
}

export interface CreateReviewDTO {
  movieId: number;
  rating: number;
  comment: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface MovieSearchQuery {
  title?: string;
  year?: number;
  director?: string;
  genre?: string;
  page?: number;
  limit?: number;
}
