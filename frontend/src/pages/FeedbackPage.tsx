import React, { useState, useEffect } from 'react';
import { useLocalization } from '../hooks/useLocalization';
import StarRating from '../components/StarRating';
import { addReview, getReviewByOrderId, getOrderById } from '../api';
import type { Language } from '../types';

interface FeedbackPageProps {
  language: Language;
  navigate: (path: string) => void;
}

const FeedbackPage: React.FC<FeedbackPageProps> = ({ language, navigate }) => {
  const { t } = useLocalization(language);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkOrderAndReview = async () => {
        const hash = window.location.hash;
        const searchPart = hash.substring(hash.indexOf('?'));
        const params = new URLSearchParams(searchPart);
        const id = params.get('id');

        if (!id) {
            setError(t('orderNotFound'));
            setIsLoading(false);
            return;
        }

        try {
            await getOrderById(id); // Check if order exists
            const existingReview = await getReviewByOrderId(id);
            if (existingReview) {
                setError(t('reviewAlreadySubmitted'));
                setSubmitted(true); // Prevent form submission
            }
            setOrderId(id);
        } catch (err) {
            setError(t('orderNotFound'));
        } finally {
            setIsLoading(false);
        }
    };
    checkOrderAndReview();
  }, [t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId || submitted) return;

    if (rating === 0) {
      alert('Please select a rating.');
      return;
    }
    
    try {
        await addReview({ orderId, rating, comment });
        setSubmitted(true);
    } catch (error) {
        alert("Failed to submit review. Please try again.");
    }
  };

  if (isLoading) {
      return <div className="text-center py-20">Loading...</div>;
  }

  if (error && !submitted) {
    return (
        <div className="text-center py-20">
            <h1 className="text-2xl font-bold text-red-600">{error}</h1>
             <button onClick={() => navigate('/')} className="mt-4 px-6 py-2 bg-primary text-white font-bold rounded-lg hover:bg-primary-focus transition-colors">
                {t('backToHome')}
            </button>
        </div>
    )
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-lg mx-auto bg-white p-8 rounded-xl shadow-lg">
        {submitted ? (
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">{t('feedbackSubmitted')}</h1>
            <p className="mt-4 text-gray-600">
                Your feedback helps us improve. You can now close this page or return home.
            </p>
            <button onClick={() => navigate('/')} className="mt-6 px-6 py-2 bg-primary text-white font-bold rounded-lg hover:bg-primary-focus transition-colors">
                {t('backToHome')}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <h1 className="text-3xl font-bold text-center text-gray-900">{t('leaveAReview')}</h1>
            <p className="mt-2 text-center text-gray-600">{t('howWasYourExperience')}</p>
            <p className="mt-1 text-center text-sm text-primary font-semibold">Order #{orderId}</p>

            <div className="my-8">
              <label className="block text-center text-lg font-medium text-gray-700 mb-3">{t('rating')}</label>
              <StarRating rating={rating} setRating={setRating} />
            </div>

            <div className="my-8">
              <label htmlFor="comment" className="block text-lg font-medium text-gray-700 mb-3">{t('comments')}</label>
              <textarea
                id="comment" value={comment} onChange={(e) => setComment(e.target.value)}
                placeholder="Tell us more..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
                rows={4}
              />
            </div>

            <button type="submit" className="w-full bg-primary text-white font-bold text-lg py-3 px-4 rounded-lg hover:bg-primary-focus focus:outline-none focus:ring-4 focus:ring-primary/50 transition-colors">
              {t('submitFeedback')}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default FeedbackPage;
