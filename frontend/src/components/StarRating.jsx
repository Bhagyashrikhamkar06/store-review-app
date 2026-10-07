import React, { useState } from 'react';
import { Star } from 'lucide-react';

const StarRating = ({
  rating = 0,
  maxRating = 5,
  onRatingChange,
  readOnly = false,
  size = 18,
  showLabel = true,
  count = null
}) => {
  const [hoverRating, setHoverRating] = useState(0);

  const displayRating = hoverRating > 0 ? hoverRating : rating;

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
      <div style={{ display: 'flex', gap: '3px', cursor: readOnly ? 'default' : 'pointer' }}>
        {Array.from({ length: maxRating }, (_, index) => {
          const starValue = index + 1;
          const isFilled = starValue <= displayRating;
          const isHalf = !isFilled && starValue - 0.5 <= displayRating;

          return (
            <button
              type="button"
              key={starValue}
              disabled={readOnly}
              onClick={() => onRatingChange && onRatingChange(starValue)}
              onMouseEnter={() => !readOnly && setHoverRating(starValue)}
              onMouseLeave={() => !readOnly && setHoverRating(0)}
              style={{
                background: 'none',
                border: 'none',
                padding: '2px',
                cursor: readOnly ? 'default' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'transform 0.15s ease',
                transform: !readOnly && hoverRating === starValue ? 'scale(1.2)' : 'scale(1)'
              }}
              title={readOnly ? `${rating} stars` : `Rate ${starValue} star${starValue > 1 ? 's' : ''}`}
            >
              <Star
                size={size}
                fill={isFilled ? '#F59E0B' : isHalf ? '#FDE68A' : 'transparent'}
                color={isFilled || isHalf ? '#D97706' : '#CBD5E1'}
                strokeWidth={isFilled ? 0.5 : 1.5}
                style={{
                  transition: 'all 0.15s ease'
                }}
              />
            </button>
          );
        })}
      </div>

      {showLabel && (
        <span
          style={{
            fontSize: '0.85rem',
            fontWeight: 600,
            color: rating > 0 ? '#B45309' : 'var(--text-muted)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          {Number(rating) > 0 ? Number(rating).toFixed(1) : 'No rating'}
          {count !== null && (
            <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '0.8rem' }}>
              ({count} {count === 1 ? 'review' : 'reviews'})
            </span>
          )}
        </span>
      )}
    </div>
  );
};

export default StarRating;
