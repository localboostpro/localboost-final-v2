import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Star, MessageSquare, Calendar } from 'lucide-react';

export default function Reviews({ user }) {
  const [avis, setAvis] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadAvis = useCallback(async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      // 1. Récupération de l'ID Business
      const { data: prof } = await supabase
        .from('business_profile')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!prof) return;

      // 2. Chargement des avis filtrés
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('business_id', prof.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAvis(data || []);
    } catch (e) {
      console.error("❌ Erreur Reviews:", e);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { loadAvis(); }, [loadAvis]);

  if (loading) return (
    <div className="p-20 text-center font-bold text-slate-400 animate-pulse">
      Synchronisation de vos avis...
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <h1 className="text-3xl font-black text-slate-900">Avis Clients</h1>
      <div className="grid gap-4">
        {avis.length === 0 ? (
          <div className="bg-white p-12 rounded-[2rem] text-center border-2 border-dashed border-slate-200 text-slate-400">
            Aucun avis trouvé pour le moment.
          </div>
        ) : (
          avis.map(a => (
            <div key={a.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
              <div className="flex justify-between items-center mb-3">
                <span className="font-bold text-slate-900">{a.author || 'Anonyme'}</span>
                <span className="text-[10px] bg-slate-50 px-2 py-1 rounded font-black text-slate-400 uppercase tracking-widest">
                  {a.platform || 'Google'}
                </span>
              </div>
              <div className="flex text-amber-400 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} className={i < (a.rating || 0) ? "fill-amber-400" : "text-slate-100"} />
                ))}
              </div>
              <p className="text-slate-600 font-medium italic">"{a.text || 'Pas de commentaire laissé.'}"</p>
              <div className="mt-4 pt-4 border-t border-slate-50 flex items-center gap-2 text-[10px] font-black text-slate-300 uppercase">
                <Calendar size={12}/> {new Date(a.created_at).toLocaleDateString('fr-FR')}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
