import React from 'react';
import { Star, MessageSquare, TrendingUp, Users } from 'lucide-react';

export default function Dashboard({ profile, reviews }) {
  // Calcul de la note moyenne sécurisé
  const validRatings = reviews?.filter(r => r.rating !== null && r.rating !== undefined) || [];
  const averageRating = validRatings.length > 0
    ? (validRatings.reduce((sum, r) => sum + Number(r.rating), 0) / validRatings.length).toFixed(1)
    : "0.0";

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-8 rounded-[2.5rem] text-white shadow-xl shadow-indigo-100">
        <h1 className="text-3xl font-black mb-1">Bienvenue, {profile?.name || 'Commerçant'} 👋</h1>
        <p className="opacity-80 font-medium text-indigo-100">Voici l'état de votre établissement aujourd'hui.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm transition-transform hover:scale-[1.02]">
          <Star className="text-amber-500 mb-4" size={32} />
          <div className="text-3xl font-black text-slate-900">{averageRating}/5</div>
          <div className="text-xs font-black text-slate-400 uppercase tracking-widest">Note Moyenne</div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm transition-transform hover:scale-[1.02]">
          <MessageSquare className="text-blue-500 mb-4" size={32} />
          <div className="text-3xl font-black text-slate-900">{reviews?.length || 0}</div>
          <div className="text-xs font-black text-slate-400 uppercase tracking-widest">Avis Clients</div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm transition-transform hover:scale-[1.02]">
          <TrendingUp className="text-emerald-500 mb-4" size={32} />
          <div className="text-3xl font-black text-slate-900">+12%</div>
          <div className="text-xs font-black text-slate-400 uppercase tracking-widest">Visibilité</div>
        </div>
      </div>
    </div>
  );
}
