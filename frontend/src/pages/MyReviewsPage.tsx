import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { reviewService } from '../services/reviewService';
import { Star, Calendar, Loader2 } from 'lucide-react';
import { formatDate } from '../lib/utils';

export function MyReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    try {
      setIsLoading(true);
      setError('');
      const data = await reviewService.getMyReviews();
      setReviews(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar reseñas');
    } finally {
      setIsLoading(false);
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

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Mis Reseñas
        </h1>
        <p className="text-gray-600">
          Todas las reseñas que has escrito
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {reviews.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-600 mb-4">
            Aún no has escrito ninguna reseña
          </p>
          <Link to="/" className="btn-primary inline-block">
            Explorar Películas
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="card">
              <div className="flex items-start space-x-4">
                <Link
                  to={`/movies/${review.movie.id}`}
                  className="flex-shrink-0"
                >
                  <div className="w-24 h-36 bg-gray-200 rounded-lg overflow-hidden">
                    {review.movie.posterUrl ? (
                      <img
                        src={review.movie.posterUrl}
                        alt={review.movie.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-gray-400 text-2xl">🎬</span>
                      </div>
                    )}
                  </div>
                </Link>

                <div className="flex-1">
                  <Link
                    to={`/movies/${review.movie.id}`}
                    className="text-xl font-semibold text-gray-900 hover:text-red-600 mb-2 block"
                  >
                    {review.movie.title} ({review.movie.year})
                  </Link>

                  <div className="flex items-center space-x-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${
                          i < review.rating
                            ? 'text-yellow-500 fill-yellow-500'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>

                  <p className="text-gray-700 mb-3">{review.comment}</p>

                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(review.createdAt)}</span>
                    </div>
                    {review.validated && (
                      <span className="text-green-600">✓ Validado</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}
