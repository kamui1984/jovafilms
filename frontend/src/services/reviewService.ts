import { api } from './api';
import { Review, CreateReviewDTO } from '../types';

export const reviewService = {
  async createReview(data: CreateReviewDTO): Promise<Review> {
    const response = await api.post<Review>('/reviews', data);
    return response.data;
  },

  async getReviewsByMovie(movieId: number): Promise<Review[]> {
    const response = await api.get<Review[]>(`/reviews/movie/${movieId}`);
    return response.data;
  },

  async getMyReviews(): Promise<any[]> {
    const response = await api.get('/reviews/user/me');
    return response.data;
  }
};
