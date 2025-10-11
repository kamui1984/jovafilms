import { Link } from 'react-router-dom';
import { Calendar, Star, User as UserIcon } from 'lucide-react';
import { Movie } from '../../types';
import { getStarRating } from '../../lib/utils';

interface MovieCardProps {
  movie: Movie;
}

export function MovieCard({ movie }: MovieCardProps) {
  return (
    <Link
      to={`/movies/${movie.id}`}
      className="card hover:shadow-lg transition-shadow cursor-pointer"
    >
      <div className="aspect-[2/3] mb-4 bg-gray-200 rounded-lg overflow-hidden">
        {movie.posterUrl ? (
          <img
            src={movie.posterUrl}
            alt={movie.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-gray-400 text-4xl">🎬</span>
          </div>
        )}
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
        {movie.title}
      </h3>

      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
        <div className="flex items-center space-x-1">
          <Calendar className="h-4 w-4" />
          <span>{movie.year}</span>
        </div>
        <div className="flex items-center space-x-1">
          <UserIcon className="h-4 w-4" />
          <span className="line-clamp-1">{movie.director}</span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-1">
          <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
          <span className="font-semibold text-gray-900">
            {movie.averageRating.toFixed(1)}
          </span>
        </div>
        <span className="text-sm text-gray-600">
          {movie.reviewCount} reseña{movie.reviewCount !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="mt-2">
        <span className="inline-block px-3 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
          {movie.genre}
        </span>
      </div>
    </Link>
  );
}
