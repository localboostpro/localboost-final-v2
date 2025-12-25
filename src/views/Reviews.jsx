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
      const { data: profile } = await supabase.from('business_profile').select('id').eq('user_id', user.id).maybeSingle();
      if (!profile) return;

      const { data } = await supabase.from('reviews').select('*').eq('business_id', profile.id).order('created_at', { ascending: false });
      setReviews(data || []);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  if (loading) return <div className="p-10 text-center font-bold text-slate-400 animate-pulse">Synchronisation des avis...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <h1 className="text-3xl font-black text-slate-900">Avis Clients</h1>
      <div className="grid gap-4">
        {reviews.length === 0 ? (
          <div className="bg-white p-12 rounded-[2rem] text-center border-2 border-dashed border-slate-200 text-slate-400 font-medium">
            Aucun avis trouvé pour votre établissement.
          </div>
        ) : (
          reviews.map(review => (
            <div key={review.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all">
              <div className="flex justify-between items-center mb-3">
                <span className="font-bold text-slate-900 text-lg">{review.author || 'Anonyme'}</span>
                <span className="text-[10px] bg-slate-100 px-3 py-1 rounded-full font-black text-slate-400 uppercase tracking-widest">{review.platform || 'Google'}</span>
              </div>
              <div className="flex text-amber-400 mb-4">
                {[...Array(5)].map((_, i) => <Star key={i} size={14} className={i < (review.rating || 0) ? "fill-amber-400" : "text-slate-100"} />)}
              </div>
              <p className="text-slate-600 font-medium leading-relaxed italic">"{review.text || 'Pas de commentaire laissé.'}"</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
