import React from 'react';
import { useData } from '../contexts/DataContext';
import { MessageSquare, Star, ThumbsUp, AlertCircle } from 'lucide-react';

export default function Reviews() {
  const { profile, reviews } = useData();

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length).toFixed(1)
    : 0;

  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: reviews.filter(r => r.rating === rating).length,
    percentage: reviews.length > 0 ? (reviews.filter(r => r.rating === rating).length / reviews.length * 100) : 0
  }));

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-[2.5rem] p-8 shadow-lg">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-green-100 p-3 rounded-xl">
            <MessageSquare className="w-6 h-6 text-green-600" />
          </div>
          <h1 className="text-4xl font-black text-slate-900">Avis Clients</h1>
        </div>
        <p className="text-slate-600 ml-16">Gérez votre e-réputation</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-[2.5rem] p-6 shadow-lg">
          <p className="text-sm font-bold text-slate-600 mb-2">Note Moyenne</p>
          <div className="flex items-center gap-2">
            <p className="text-4xl font-black text-slate-900">{avgRating}</p>
            <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
          </div>
          <p className="text-sm text-slate-500 mt-1">{reviews.length} avis</p>
        </div>

        <div className="bg-white rounded-[2.5rem] p-6 shadow-lg">
          <p className="text-sm font-bold text-slate-600 mb-2">Avis Positifs</p>
          <p className="text-4xl font-black text-green-600">
            {reviews.filter(r => r.rating >= 4).length}
          </p>
          <p className="text-sm text-slate-500 mt-1">4-5 étoiles</p>
        </div>

        <div className="bg-white rounded-[2.5rem] p-6 shadow-lg">
          <p className="text-sm font-bold text-slate-600 mb-2">À traiter</p>
          <p className="text-4xl font-black text-orange-600">
            {reviews.filter(r => r.rating <= 3).length}
          </p>
          <p className="text-sm text-slate-500 mt-1">≤ 3 étoiles</p>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] p-8 shadow-lg">
        <h2 className="text-2xl font-black text-slate-900 mb-6">Distribution des notes</h2>
        <div className="space-y-3">
          {ratingDistribution.map(({ rating, count, percentage }) => (
            <div key={rating} className="flex items-center gap-3">
              <div className="flex items-center gap-1 w-20">
                <span className="text-sm font-bold text-slate-700">{rating}</span>
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              </div>
              <div className="flex-1 bg-slate-100 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-yellow-400 h-full transition-all"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="text-sm font-bold text-slate-600 w-12">{count}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] p-8 shadow-lg">
        <h2 className="text-2xl font-black text-slate-900 mb-6">Tous les avis</h2>
        {reviews.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">Aucun avis pour le moment</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="border border-slate-200 rounded-xl p-6 hover:border-indigo-300 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-bold text-slate-900">{review.customer_name || 'Client anonyme'}</p>
                    <div className="flex items-center gap-1 mt-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-slate-400">
                    {new Date(review.created_at).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                {review.comment && (
                  <p className="text-slate-700">{review.comment}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
