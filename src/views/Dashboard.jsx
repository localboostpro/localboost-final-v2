import React from 'react';
import { Star, MessageSquare, Users, TrendingUp } from 'lucide-react';

export default function Dashboard({ profile, reviews, customers, posts }) {
  const avgRating = reviews?.length > 0 
    ? (reviews.reduce((acc, r) => acc + (Number(r.rating) || 0), 0) / reviews.length).toFixed(1) 
    : "0.0";

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-8 rounded-[2rem] text-white shadow-xl">
        <h1 className="text-3xl font-black">Ravi de vous revoir, {profile?.name} 👋</h1>
        <p className="opacity-80 font-medium">Votre visibilité locale est stable aujourd'hui.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <Star className="text-amber-500 mb-2" size={28} />
          <div className="text-3xl font-black text-slate-900">{avgRating}/5</div>
          <div className="text-xs font-bold text-slate-400 uppercase">Note Moyenne</div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <MessageSquare className="text-blue-500 mb-2" size={28} />
          <div className="text-3xl font-black text-slate-900">{reviews?.length || 0}</div>
          <div className="text-xs font-bold text-slate-400 uppercase">Avis Reçus</div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <Users className="text-emerald-500 mb-2" size={28} />
          <div className="text-3xl font-black text-slate-900">{customers?.length || 0}</div>
          <div className="text-xs font-bold text-slate-400 uppercase">Clients</div>
        </div>
      </div>
    </div>
  );
}
