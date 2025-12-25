import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Star, MessageSquare, Calendar, CheckCircle } from 'lucide-react';

export default function Reviews({ user }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    average: 0,
    pending: 0
  });

  useEffect(() => {
    // Vérification que l'utilisateur est bien présent avant de charger
    if (user?.id) {
      fetchReviews();
    }
  }, [user]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      console.log("🔍 [Reviews] Début du chargement pour l'utilisateur:", user.id);

      // 1. Récupération du profil business
      const { data: profile, error: profileError } = await supabase
        .from('business_profile')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle(); // Utilisation de maybeSingle pour éviter les crashs si profil absent

      if (profileError) throw profileError;
      
      if (!profile) {
        console.warn("⚠️ [Reviews] Aucun profil business trouvé pour cet utilisateur.");
        setLoading(false);
        return;
      }

      // 2. Récupération des avis avec le filtre business_id
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('business_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      console.log("✅ [Reviews] Avis récupérés:", data?.length || 0);
      setReviews(data || []);

      // 3. Calcul des statistiques sécurisé (évite la division par zéro ou NaN)
      if (data && data.length > 0) {
        const reviewsWithRating = data.filter(r => r.rating !== null && r.rating !== undefined);
        const totalRating = reviewsWithRating.reduce((acc, rev) => acc + Number(rev.rating), 0);
        const avg = reviewsWithRating.length > 0 ? (totalRating / reviewsWithRating.length).toFixed(1) : "0.0";

        setStats({
          total: data.length,
          average: avg,
          pending: data.filter(r => r.status === 'pending').length
        });
      }

    } catch (error) {
      console.error('❌ [Reviews] Erreur critique:', error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
        <p className="text-slate-500 font-medium">Chargement de vos avis...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-black text-slate-900 mb-2">Avis Clients</h1>
        <p className="text-slate-600">Gérez votre réputation et répondez à vos clients</p>
      </div>

      {/* STATS CARDS */}
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
            <p className="text-slate-500 font-medium">Aucun avis trouvé pour votre établissement.</p>
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-200 transition-all">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center font-black text-slate-400">
                    {review.author?.charAt(0) || '?'}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">{review.author || 'Anonyme'}</div>
                    <div className="flex text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          size={14} 
                          className={i < (review.rating || 0) ? "fill-amber-400" : "text-slate-200"} 
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <span className="text-[10px] uppercase tracking-wider font-black px-2 py-1 bg-slate-100 text-slate-500 rounded">
                  {review.platform || 'Google'}
                </span>
              </div>
              <p className="text-slate-700 mb-4 italic leading-relaxed">
                {review.text ? `"${review.text}"` : "Pas de commentaire laissé."}
              </p>
              <div className="flex items-center justify-between text-[11px] text-slate-400 font-bold border-t pt-4">
                <div className="flex items-center gap-1">
                  <Calendar size={14}/>
                  {review.created_at ? new Date(review.created_at).toLocaleDateString('fr-FR') : 'Date inconnue'}
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
