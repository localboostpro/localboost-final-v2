import React from "react";
import { Ticket, Plus, Calendar, Tag, Trash2 } from "lucide-react";

export default function Promotions() {
  // Données de démonstration pour éviter l'écran blanc si la BDD est vide
  const demoPromos = [
    { id: 1, title: "Offre de Bienvenue", discount: "-20%", code: "WELCOME20", status: "Actif" },
    { id: 2, title: "Happy Hour", discount: "1 acheté = 1 offert", code: "HAPPY", status: "Actif" }
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
        <div>
          <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Ticket className="text-indigo-600" /> Vos Offres Spéciales
          </h3>
          <p className="text-sm text-slate-500">Créez des coupons pour fidéliser vos clients.</p>
        </div>
        <button className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold text-sm flex items-center gap-2 hover:bg-indigo-700 transition shadow-lg shadow-indigo-100">
          <Plus size={18} /> Nouvelle Promo
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {demoPromos.map((promo) => (
          <div key={promo.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4">
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-[10px] font-black uppercase">
                {promo.status}
              </span>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="p-4 bg-indigo-50 rounded-2xl text-indigo-600">
                <Tag size={24} />
              </div>
              <div className="flex-1">
                <h4 className="font-black text-slate-900 text-lg">{promo.title}</h4>
                <div className="text-2xl font-black text-indigo-600 mt-1">{promo.discount}</div>
                
                <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-dashed border-slate-200 flex justify-between items-center">
                  <code className="font-mono font-bold text-slate-700">{promo.code}</code>
                  <button className="text-[10px] font-black text-indigo-600 uppercase">Copier</button>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-50 flex justify-between items-center">
              <div className="flex items-center gap-2 text-slate-400 text-xs">
                <Calendar size={14} /> Expire dans 12 jours
              </div>
              <button className="text-slate-300 hover:text-rose-500 transition">
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
