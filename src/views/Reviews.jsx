import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Star, MessageSquare, Platform, Calendar, CheckCircle, Clock } from 'lucide-react';

export default function Reviews({ user }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    average: 0,
    pending: 0
  });

  useEffect(() => {
    if (user) {
      fetchReviews();
    }
  }, [user]);

  const fetchReviews = async () => {
    try {
      setLoading(true);

      // 1. RÉCUPÉRER L'ID DU BUSINESS POUR CET UTILISATEUR
      const { data: profile, error: profileError } = await supabase
        .from('business_profile')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (profileError || !profile) throw new Error("Profil non trouvé");

      // 2. RÉCUPÉRER LES AVIS FILTRÉS PAR BUSINESS_ID
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('business_id', profile.id) // ✅ FILTRE ESSENTIEL
        .order('created_at', { ascending: false });

      if (error) throw error;

      setReviews(data || []);

      // 3. CALCULER LES STATS UNIQUEMENT POUR CE BUSINESS
      if (data && data.length > 0) {
        const avg = data.reduce((acc, rev) => acc + (rev.rating || 0), 0) / data.length;
        setStats({
          total: data.length,
          average: avg.toFixed(1),
          pending: data.filter(r => r.status === 'pending').length
        });
      }
    } catch (error) {
      console.error('Erreur lors du chargement des avis:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Chargement des avis...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-black text-slate-900 mb-2">Avis Clients</h1>
        <p className="text-slate-600">Gérez votre réputation et répondez à vos clients</p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-slate-500 text-sm font-bold mb-1">Note Moyenne</div>
          <div className="text-3xl font-black text-slate-900 flex items-center gap-2">
            {stats.average} <Star className="text-amber-400 fill-amber-400" size={24}/>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-slate-500 text-sm font-bold mb-1">Total Avis</div>
          <div className="text-3xl font-black text-slate-900">{stats.total}</div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-slate-500 text-sm font-bold mb-1">En attente</div>
          <div className="text-3xl font-black text-indigo-600">{stats.pending}</div>
        </div>
      </div>

      {/* LISTE DES AVIS */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-3xl border border-dashed border-slate-300">
            <MessageSquare className="mx-auto text-slate-300 mb-4" size={48}/>
            <p className="text-slate-500 font-medium">Aucun avis pour le moment.</p>
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-200 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center font-black text-slate-400">
                    {review.author?.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">{review.author}</div>
                    <div className="flex text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={14} className={i < review.rating ? "fill-amber-400" : "text-slate-200"} />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="text-xs font-bold px-3 py-1 bg-slate-100 text-slate-500 rounded-full">
                  {review.platform || 'Google'}
                </div>
              </div>
              <p className="text-slate-700 mb-4 italic">"{review.text}"</p>
              <div className="flex items-center justify-between text-xs text-slate-400 font-bold border-t pt-4">
                <div className="flex items-center gap-1">
                  <Calendar size={14}/>
                  {new Date(review.created_at).toLocaleDateString('fr-FR')}
                </div>
                <div className="flex items-center gap-1 text-emerald-600">
                  <CheckCircle size={14}/> Avis vérifié
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
