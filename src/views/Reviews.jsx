import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { 
  Star, MessageSquare, Calendar, CheckCircle, 
  Filter, ArrowUpRight, Search, MoreHorizontal 
} from 'lucide-react';

export default function Reviews({ user }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState({ total: 0, average: 0, pending: 0 });

  // Utilisation de useCallback pour stabiliser la fonction
  const fetchReviews = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      
      // 1. Récupération du profil (Optimisé avec maybeSingle)
      const { data: profile, error: profileError } = await supabase
        .from('business_profile')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (profileError) throw profileError;
      
      if (!profile) {
        setReviews([]);
        setLoading(false);
        return;
      }

      // 2. Récupération des avis filtrés
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('business_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setReviews(data || []);

      // 3. Calcul des stats sécurisé
      if (data?.length > 0) {
        const validRatings = data.filter(r => r.rating !== null && r.rating !== undefined);
        const avg = validRatings.length > 0 
          ? (validRatings.reduce((acc, rev) => acc + Number(rev.rating), 0) / validRatings.length).toFixed(1)
          : "0.0";

        setStats({
          total: data.length,
          average: avg,
          pending: data.filter(r => r.status === 'pending').length
        });
      }
    } catch (error) {
      console.error('Erreur:', error.message);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // Filtrage local pour le design (recherche par auteur ou texte)
  const filteredReviews = reviews.filter(r => 
    r.author?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.text?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="relative">
          <div className="h-12 w-12 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Header avec Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Avis Clients</h1>
          <p className="text-slate-500 font-medium">Analysez et gérez la réputation de votre établissement</p>
        </div>
        <button className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 active:scale-95">
          <ArrowUpRight size={18} />
          Exporter les avis
        </button>
      </div>

      {/* Stats Cards - Design épuré */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Note Globale", value: `${stats.average}/5`, icon: Star, color: "text-amber-500", bg: "bg-amber-50" },
          { label: "Total Avis", value: stats.total, icon: MessageSquare, color: "text-blue-500", bg: "bg-blue-50" },
          { label: "En attente", value: stats.pending, icon: CheckCircle, color: "text-emerald-500", bg: "bg-emerald-50" }
        ].map((s, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <div className={`w-10 h-10 ${s.bg} ${s.color} rounded-xl flex items-center justify-center mb-4`}>
              <s.icon size={20} />
            </div>
            <div className="text-2xl font-black text-slate-900">{s.value}</div>
            <div className="text-sm font-bold text-slate-400 uppercase tracking-wider">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Barre de recherche et filtres */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text"
            placeholder="Rechercher un avis ou un client..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl focus:ring-2 ring-indigo-500/20 font-medium text-slate-600"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-50 text-slate-600 rounded-xl font-bold hover:bg-slate-100 transition">
          <Filter size={18} />
          Filtres
        </button>
      </div>

      {/* Liste des Avis - Design moderne type "Feed" */}
      <div className="grid gap-4">
        {filteredReviews.length === 0 ? (
          <div className="bg-white py-20 text-center rounded-[2rem] border-2 border-dashed border-slate-100">
            <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="text-slate-300" size={30} />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Aucun avis trouvé</h3>
            <p className="text-slate-500">Essayez de modifier vos critères de recherche.</p>
          </div>
        ) : (
          filteredReviews.map((review) => (
            <div key={review.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all group">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-black shadow-inner">
                    {review.author?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 flex items-center gap-2">
                      {review.author}
                      {review.status === 'approved' && <CheckCircle size={14} className="text-blue-500" />}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex text-amber-400">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={14} className={i < (review.rating || 0) ? "fill-amber-400" : "text-slate-100"} />
                        ))}
                      </div>
                      <span className="text-[10px] font-black text-slate-300 uppercase tracking-tighter bg-slate-50 px-2 py-0.5 rounded">
                        {review.platform || 'Google'}
                      </span>
                    </div>
                  </div>
                </div>
                <button className="text-slate-300 hover:text-slate-600 p-2">
                  <MoreHorizontal size={20} />
                </button>
              </div>

              <div className="mt-4 text-slate-600 leading-relaxed font-medium">
                {review.text ? `"${review.text}"` : <span className="italic text-slate-400">L'utilisateur n'a pas laissé de commentaire.</span>}
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-slate-50 pt-4">
                <div className="flex items-center gap-4">
                   <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                     <Calendar size={14} />
                     {new Date(review.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
                   </div>
                </div>
                <button className="text-xs font-black text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition">
                  Répondre à l'avis
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
