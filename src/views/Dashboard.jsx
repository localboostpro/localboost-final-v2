import React from 'react';
import { Star, MessageSquare, Users, TrendingUp, ArrowRight, Zap } from 'lucide-react';

export default function Dashboard({ profile, reviews, customers, posts }) {
  // Calculs automatiques
  const avgRating = reviews?.length > 0 
    ? (reviews.reduce((acc, r) => acc + (Number(r.rating) || 0), 0) / reviews.length).toFixed(1) 
    : "0.0";

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Welcome Hero */}
      <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-8 rounded-[2rem] text-white shadow-2xl">
        <h1 className="text-3xl font-black mb-2">Bonjour, {profile?.name} 👋</h1>
        <p className="opacity-80 font-medium">Votre établissement attire de nouveaux clients grâce à l'IA.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <Star className="text-amber-500 mb-2" size={32} />
          <div className="text-3xl font-black text-slate-900">{avgRating}/5</div>
          <div className="text-xs font-black text-slate-400 uppercase tracking-widest">Note Moyenne</div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <MessageSquare className="text-blue-500 mb-2" size={32} />
          <div className="text-3xl font-black text-slate-900">{reviews?.length}</div>
          <div className="text-xs font-black text-slate-400 uppercase tracking-widest">Avis Reçus</div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <Users className="text-emerald-500 mb-2" size={32} />
          <div className="text-3xl font-black text-slate-900">{customers?.length}</div>
          <div className="text-xs font-black text-slate-400 uppercase tracking-widest">Clients Fidélisés</div>
        </div>
      </div>

      {/* Actions Rapides */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <h3 className="text-xl font-black text-slate-900 mb-6">Prêt à booster votre visibilité ?</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl hover:bg-indigo-600 hover:text-white transition-all group font-bold">
            <span>Générer un Post IA</span>
            <Zap className="text-indigo-600 group-hover:text-white" />
          </button>
          <button className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl hover:bg-emerald-600 hover:text-white transition-all group font-bold">
            <span>Lancer une Campagne Avis</span>
            <ArrowRight className="text-emerald-600 group-hover:text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
