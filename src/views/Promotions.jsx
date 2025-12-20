import React, { useState } from "react";
import { Ticket, Plus, Tag, Trash2, Calendar } from "lucide-react";

export default function Promotions() {
  const [promos, setPromos] = useState([
    { id: 1, title: "Offre Bienvenue", desc: "-20% sur tout", code: "HELLO20" }
  ]);
  const [showForm, setShowForm] = useState(false);
  const [newPromo, setNewPromo] = useState({ title: "", desc: "", code: "" });

  const handleAdd = () => {
    setPromos([...promos, { id: Date.now(), ...newPromo }]);
    setShowForm(false);
    setNewPromo({ title: "", desc: "", code: "" });
  };

  const handleDelete = (id) => {
    setPromos(promos.filter(p => p.id !== id));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
        <div>
          <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Ticket className="text-indigo-600" /> Vos Promotions
          </h3>
          <p className="text-sm text-slate-500">Gérez les coupons visibles par vos clients.</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold text-sm flex items-center gap-2 hover:bg-indigo-700 transition">
          <Plus size={18} /> {showForm ? "Fermer" : "Nouvelle Promo"}
        </button>
      </div>

      {showForm && (
        <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-200 animate-in slide-in-from-top-2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <input placeholder="Titre (ex: Happy Hour)" className="p-3 rounded-xl border border-slate-300" value={newPromo.title} onChange={e => setNewPromo({...newPromo, title: e.target.value})} />
                <input placeholder="Détail (ex: -50% sur les bières)" className="p-3 rounded-xl border border-slate-300" value={newPromo.desc} onChange={e => setNewPromo({...newPromo, desc: e.target.value})} />
                <input placeholder="Code (ex: HAPPY)" className="p-3 rounded-xl border border-slate-300" value={newPromo.code} onChange={e => setNewPromo({...newPromo, code: e.target.value})} />
            </div>
            <button onClick={handleAdd} className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold">Confirmer la création</button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {promos.map((promo) => (
          <div key={promo.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm relative group">
            <div className="flex items-start gap-4">
              <div className="p-4 bg-indigo-50 rounded-2xl text-indigo-600">
                <Tag size={24} />
              </div>
              <div className="flex-1">
                <h4 className="font-black text-slate-900 text-lg">{promo.title}</h4>
                <p className="text-slate-500 text-sm">{promo.desc}</p>
                <div className="mt-3 p-2 bg-slate-50 rounded-lg border border-dashed border-slate-200 inline-block font-mono font-bold text-slate-700">
                  {promo.code}
                </div>
              </div>
              <button onClick={() => handleDelete(promo.id)} className="text-slate-300 hover:text-rose-500 transition"><Trash2 size={20}/></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
