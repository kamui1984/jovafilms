import { Star, User as UserIcon } from 'lucide-react';
import { Review } from '../../types';
import { formatDate } from '../../lib/utils';

interface ReviewCardProps {
  review: Review;
}

export function ReviewCard({ review }: ReviewCardProps) {
  return (
    <div className="card">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <UserIcon className="h-5 w-5 text-gray-600" />
          <span className="font-medium text-gray-900">{review.user.name}</span>
        </div>
        <div className="flex items-center space-x-1">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`h-4 w-4 ${
                i < review.rating
                  ? 'text-yellow-500 fill-yellow-500'
                  : 'text-gray-300'
              }`}
            />
          ))}
        </div>
      </div>

      <p className="text-gray-700 mb-3">{review.comment}</p>

      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>{formatDate(review.createdAt)}</span>
        {review.validated && (
          <span className="text-green-600 text-xs">✓ Validado</span>
        )}
      </div>
    </div>
  );
}
