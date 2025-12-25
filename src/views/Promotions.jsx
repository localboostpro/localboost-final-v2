import React, { useState } from 'react';
import { Tag, Plus, Trash2, Calendar, Zap } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Promotions({ profile }) {
  const [promos, setPromos] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newPromo, setNewPromo] = useState({ title: '', discount: '', end_date: '' });

  const addPromo = async () => {
    if (!profile?.id) return alert("Profil non chargé");
    const { data, error } = await supabase
      .from('promotions')
      .insert([{ ...newPromo, business_id: profile.id }])
      .select();
    
    if (!error) {
      setPromos([data[0], ...promos]);
      setIsAdding(false);
      setNewPromo({ title: '', discount: '', end_date: '' });
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-black text-slate-900">Offres & Promos</h1>
        <button onClick={() => setIsAdding(true)} className="bg-indigo-600 text-white p-3 rounded-2xl flex items-center gap-2 font-bold hover:scale-105 transition-transform">
          <Plus size={20}/> Nouvelle Offre
        </button>
      </div>

      {isAdding && (
        <div className="bg-white p-6 rounded-3xl border-2 border-indigo-100 shadow-xl space-y-4 animate-in fade-in slide-in-from-top-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input type="text" placeholder="Titre (ex: Menu Midi)" value={newPromo.title} onChange={e => setNewPromo({...newPromo, title: e.target.value})} className="p-3 bg-slate-50 rounded-xl border-none font-medium" />
            <input type="text" placeholder="Remise (ex: -20%)" value={newPromo.discount} onChange={e => setNewPromo({...newPromo, discount: e.target.value})} className="p-3 bg-slate-50 rounded-xl border-none font-medium" />
            <input type="date" value={newPromo.end_date} onChange={e => setNewPromo({...newPromo, end_date: e.target.value})} className="p-3 bg-slate-50 rounded-xl border-none font-medium" />
          </div>
          <div className="flex justify-end gap-3">
            <button onClick={() => setIsAdding(false)} className="text-slate-400 font-bold px-4">Annuler</button>
            <button onClick={addPromo} className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold">Publier l'offre</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {promos.length === 0 ? (
          <div className="md:col-span-2 bg-slate-50 p-20 rounded-[3rem] border-2 border-dashed border-slate-200 text-center text-slate-400 font-bold italic">
            "Attirez plus de clients en créant votre première promotion flash !"
          </div>
        ) : (
          promos.map(p => (
            <div key={p.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex justify-between items-center">
               <div>
                 <div className="text-xs font-black text-indigo-500 uppercase mb-1 tracking-widest flex items-center gap-1"><Zap size={12}/> Offre Active</div>
                 <h4 className="text-xl font-black text-slate-900">{p.title}</h4>
                 <div className="text-2xl font-black text-emerald-500">{p.discount}</div>
               </div>
               <button className="text-red-400 p-2 hover:bg-red-50 rounded-xl transition-colors"><Trash2 size={20}/></button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
