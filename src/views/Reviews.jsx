import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Star, MessageSquare, Calendar, CheckCircle } from 'lucide-react';

export default function Reviews({ user }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = useCallback(async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      
      // 1. Trouver le business_id de cet utilisateur
      const { data: profile } = await supabase
        .from('business_profile')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!profile) return;

      // 2. Filtrer les avis pour ce business précis
      const { data } = await supabase
        .from('reviews')
        .select('*')
        .eq('business_id', profile.id)
        .order('created_at', { ascending: false });

      setReviews(data || []);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  if (loading) return <div className="p-10 text-center font-bold">Chargement des avis...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <h1 className="text-3xl font-black">Avis Clients</h1>
      <div className="grid gap-4">
        {reviews.length === 0 ? (
          <div className="bg-white p-10 rounded-3xl text-center border-2 border-dashed border-slate-100 text-slate-400">
            Aucun avis pour le moment.
          </div>
        ) : (
          reviews.map(review => (
            <div key={review.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <div className="flex justify-between mb-2">
                <span className="font-bold text-slate-900">{review.author}</span>
                <span className="text-xs bg-slate-50 px-2 py-1 rounded font-bold text-slate-400 uppercase">{review.platform || 'Google'}</span>
              </div>
              <div className="flex text-amber-400 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} className={i < (review.rating || 0) ? "fill-amber-400" : "text-slate-100"} />
                ))}
              </div>
              <p className="text-slate-600 italic">"{review.text || 'Pas de commentaire'}"</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
