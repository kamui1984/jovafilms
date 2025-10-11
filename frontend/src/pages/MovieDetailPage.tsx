import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Calendar, User as UserIcon, Star, Loader2 } from 'lucide-react';
import { Layout } from '../components/layout/Layout';
import { ReviewCard } from '../components/reviews/ReviewCard';
import { ReviewForm } from '../components/reviews/ReviewForm';
import { movieService } from '../services/movieService';
import { reviewService } from '../services/reviewService';
import { Movie, Review } from '../types';

export function MovieDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      loadMovieData();
    }
  }, [id]);

  const loadMovieData = async () => {
    try {
      setIsLoading(true);
      setError('');
      const [movieData, reviewsData] = await Promise.all([
        movieService.getMovieById(parseInt(id!)),
        reviewService.getReviewsByMovie(parseInt(id!))
      ]);
      setMovie(movieData);
      setReviews(reviewsData);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar la película');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReviewSubmit = async (data: { rating: number; comment: string }) => {
    try {
      await reviewService.createReview({
        movieId: parseInt(id!),
        rating: data.rating,
        comment: data.comment
      });
      await loadMovieData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al crear reseña');
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-12 w-12 text-red-600 animate-spin" />
        </div>
      </Layout>
    );
  }

  if (error || !movie) {
    return (
      <Layout>
        <div className="text-center py-20">
          <p className="text-red-600 text-lg">{error || 'Película no encontrada'}</p>
        </div>
      </Layout>
    );
  }

  const cast = JSON.parse(movie.cast);

  return (
    <Layout>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="card sticky top-8">
            <div className="aspect-[2/3] mb-4 bg-gray-200 rounded-lg overflow-hidden">
              {movie.posterUrl ? (
                <img
                  src={movie.posterUrl}
                  alt={movie.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-gray-400 text-6xl">🎬</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Star className="h-6 w-6 text-yellow-500 fill-yellow-500" />
                <span className="text-2xl font-bold text-gray-900">
                  {movie.averageRating.toFixed(1)}
                </span>
              </div>
              <span className="text-gray-600">
                {movie.reviewCount} reseña{movie.reviewCount !== 1 ? 's' : ''}
              </span>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2 text-gray-700">
                <Calendar className="h-4 w-4" />
                <span>{movie.year}</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-700">
                <UserIcon className="h-4 w-4" />
                <span>{movie.director}</span>
              </div>
            </div>

            <div className="mt-4">
              <span className="inline-block px-3 py-1 text-sm font-medium bg-red-100 text-red-800 rounded-full">
                {movie.genre}
              </span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {movie.title}
            </h1>

            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Sinopsis
              </h2>
              <p className="text-gray-700 leading-relaxed">{movie.synopsis}</p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Elenco
              </h2>
              <div className="flex flex-wrap gap-2">
                {cast.map((actor: string, index: number) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                  >
                    {actor}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <ReviewForm onSubmit={handleReviewSubmit} />

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Reseñas ({reviews.length})
            </h2>
            {reviews.length === 0 ? (
              <div className="card text-center text-gray-600">
                No hay reseñas aún. ¡Sé el primero en reseñar esta película!
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <ReviewCard key={review.id} review={review} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
