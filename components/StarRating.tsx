import React, { useState } from 'react';
import { StarIcon } from './Icons';

interface StarRatingProps {
    rating: number;
    setRating: (rating: number) => void;
}

const StarRating: React.FC<StarRatingProps> = ({ rating, setRating }) => {
    const [hover, setHover] = useState(0);

    return (
        <div className="flex items-center justify-center space-x-1 rtl:space-x-reverse">
            {[...Array(5)].map((_, index) => {
                const ratingValue = index + 1;
                return (
                    <label key={ratingValue} className="cursor-pointer">
                        <input
                            type="radio"
                            name="rating"
                            value={ratingValue}
                            onClick={() => setRating(ratingValue)}
                            className="sr-only"
                        />
                        <StarIcon
                            className={`w-10 h-10 transition-colors ${
                                ratingValue <= (hover || rating) ? 'text-yellow-400' : 'text-gray-300'
                            }`}
                            onMouseEnter={() => setHover(ratingValue)}
                            onMouseLeave={() => setHover(0)}
                        />
                    </label>
                );
            })}
        </div>
    );
};

export default StarRating;
