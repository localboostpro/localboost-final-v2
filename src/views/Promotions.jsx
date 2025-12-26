import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { supabase } from '../lib/supabase';
import { Tag, Plus, Trash2, Zap, Clock, X } from 'lucide-react';

export default function Promotions({ profile, promotions, setPromotions }) {
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newPromo, setNewPromo] = useState({ title: '', discount: '', end_date: '' });

  const addPromo = async (e) => {
    e.preventDefault();
    if (!profile?.id) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('promotions')
        .insert([{ ...newPromo, business_id: profile.id }])
        .select();
      
      if (error) throw error;
      setPromotions([data[0], ...promotions]);
      setIsAdding(false);
      setNewPromo({ title: '', discount: '', end_date: '' });
    } catch (err) { alert(err.message); }
    finally { setLoading(false); }
  };

  const deletePromo = async (id) => {
    if (!confirm('Supprimer cette offre ?')) return;
    try {
      const { error } = await supabase.from('promotions').delete().eq('id', id);
      if (error) throw error;
      setPromotions(promotions.filter(p => p.id !== id));
    } catch (err) { alert(err.message); }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Offres & Promos</h1>
          <p className="text-slate-500 font-medium">Gérez vos offres flash pour attirer des clients en boutique.</p>
        </div>
        {!isAdding && (
          <button onClick={() => setIsAdding(true)} className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black flex items-center gap-2 hover:scale-105 transition-transform shadow-lg shadow-indigo-100">
            <Plus size={20}/> Nouvelle Offre
          </button>
        )}
      </div>

      {isAdding && (
        <div className="bg-white p-8 rounded-[2.5rem] border-2 border-indigo-100 shadow-xl space-y-6 animate-in fade-in slide-in-from-top-4">
          <div className="flex justify-between items-center">
            <h3 className="font-black text-xl text-slate-900">Publier une nouvelle offre</h3>
            <button onClick={() => setIsAdding(false)} className="text-slate-400 hover:text-slate-600"><X size={24}/></button>
          </div>
          <form onSubmit={addPromo} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-1">
              <label className="text-xs font-black text-slate-400 uppercase ml-1">Titre de l'offre</label>
              <input type="text" placeholder="ex: Menu Midi" value={newPromo.title} onChange={e => setNewPromo({...newPromo, title: e.target.value})} className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold" required />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-black text-slate-400 uppercase ml-1">Remise / Avantage</label>
              <input type="text" placeholder="ex: -20% ou Café offert" value={newPromo.discount} onChange={e => setNewPromo({...newPromo, discount: e.target.value})} className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold" required />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-black text-slate-400 uppercase ml-1">Date d'expiration</label>
              <input type="date" value={newPromo.end_date} onChange={e => setNewPromo({...newPromo, end_date: e.target.value})} className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold" required />
            </div>
            <div className="md:col-span-3 flex justify-end">
              <button type="submit" disabled={loading} className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-black shadow-lg shadow-indigo-100">
                {loading ? 'Publication...' : 'Publier maintenant'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {promotions.length === 0 ? (
          <div className="md:col-span-2 bg-slate-50 p-20 rounded-[3rem] border-2 border-dashed border-slate-200 text-center text-slate-400 font-bold italic">
            Aucune offre en cours. Boostez votre activité en créant une promotion flash !
          </div>
        ) : (
          promotions.map(p => (
            <div key={p.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex justify-between items-center group hover:shadow-md transition-shadow">
               <div>
                 <div className="text-[10px] font-black text-indigo-500 uppercase mb-2 tracking-widest flex items-center gap-1">
                    <Zap size={12} className="fill-indigo-500"/> Offre Active
                 </div>
                 <h4 className="text-2xl font-black text-slate-900 mb-1">{p.title}</h4>
                 <div className="text-3xl font-black text-emerald-500">{p.discount}</div>
                 <div className="mt-4 flex items-center gap-2 text-slate-400 text-xs font-bold">
                    <Clock size={14}/> Jusqu'au {new Date(p.end_date).toLocaleDateString('fr-FR')}
                 </div>
               </div>
               <button onClick={() => deletePromo(p.id)} className="p-4 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all">
                  <Trash2 size={24}/>
               </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
