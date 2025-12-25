import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Tag, Plus, Trash2, Zap } from 'lucide-react';

export default function Promotions({ profile }) {
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadPromos = useCallback(async () => {
    if (!profile?.id) return;
    const { data } = await supabase.from('promotions').select('*').eq('business_id', profile.id).order('created_at', { ascending: false });
    setPromos(data || []);
    setLoading(false);
  }, [profile?.id]);

  useEffect(() => { loadPromos(); }, [loadPromos]);

  if (loading) return <div className="p-10 text-center font-bold text-slate-400 animate-pulse">Chargement des offres...</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-black text-slate-900">Offres & Promos</h1>
        <button className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-indigo-100">
          <Plus size={20}/> Nouvelle Offre
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {promos.length === 0 ? (
          <div className="md:col-span-2 bg-white p-20 rounded-[3rem] border-2 border-dashed border-slate-100 text-center text-slate-400 font-bold italic">
            "Créez des offres flash pour attirer vos clients sur place !"
          </div>
        ) : (
          promos.map(p => (
            <div key={p.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex justify-between items-center">
              <div>
                <div className="text-[10px] font-black text-indigo-500 uppercase tracking-widest flex items-center gap-1 mb-1"><Zap size={12}/> Offre Active</div>
                <h3 className="text-xl font-black text-slate-900">{p.title}</h3>
                <p className="text-2xl font-black text-emerald-500">{p.discount}</p>
              </div>
              <button className="p-3 text-red-400 hover:bg-red-50 rounded-2xl transition-colors"><Trash2 size={22}/></button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
