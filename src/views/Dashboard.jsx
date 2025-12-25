import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { 
  TrendingUp, Users, Star, MessageSquare, 
  Share2, PlusCircle, Zap, ArrowUpRight 
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer 
} from 'recharts';

export default function Dashboard({ user }) {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({ totalReviews: 0, avgRating: 0, growth: 12.5 });
  const [chartData, setChartData] = useState([]);

  const loadData = useCallback(async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      // Récupération du profil (On cible la colonne 'plan')
      const { data: biz } = await supabase.from('business_profile').select('*').eq('user_id', user.id).maybeSingle();
      if (!biz) return;
      setProfile(biz);

      // Récupération des avis
      const { data: revs } = await supabase.from('reviews').select('rating').eq('business_id', biz.id);
      
      if (revs) {
        const valid = revs.filter(r => r.rating);
        const avg = valid.length > 0 ? (valid.reduce((acc, r) => acc + Number(r.rating), 0) / valid.length).toFixed(1) : 0;
        setStats(prev => ({ ...prev, totalReviews: revs.length, avgRating: avg }));
      }

      setChartData([{ name: 'Lun', val: 400 }, { name: 'Mar', val: 700 }, { name: 'Mer', val: 500 }, { name: 'Jeu', val: 900 }, { name: 'Ven', val: 600 }]);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => { loadData(); }, [loadData]);

  if (loading) return <div className="flex justify-center p-20 animate-pulse text-slate-400 font-bold text-xl">Propulsion de vos données...</div>;

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-10">
      {/* Welcome Card */}
      <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-8 rounded-[2.5rem] text-white shadow-2xl shadow-indigo-100 flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h1 className="text-3xl font-black mb-2">Bienvenue, {profile?.name || 'Commerçant'} !</h1>
          <p className="text-indigo-100 font-medium opacity-80">Votre visibilité locale est en progression constante.</p>
        </div>
        <button className="bg-white/10 backdrop-blur-md px-6 py-3 rounded-2xl font-bold hover:bg-white/20 transition flex items-center gap-2 border border-white/20">
          <Share2 size={18}/> Partager mon profil
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: "Note Globale", val: `${stats.avgRating}/5`, icon: Star, color: "text-amber-500", bg: "bg-amber-50" },
          { label: "Avis Clients", val: stats.totalReviews, icon: MessageSquare, color: "text-blue-500", bg: "bg-blue-50" },
          { label: "Nouveaux Clients", val: "+24", icon: Users, color: "text-emerald-500", bg: "bg-emerald-50" },
          { label: "Performance", val: `+${stats.growth}%`, icon: TrendingUp, color: "text-indigo-500", bg: "bg-indigo-50" },
        ].map((s, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:translate-y-[-4px] transition-transform">
            <div className={`w-12 h-12 ${s.bg} ${s.color} rounded-2xl flex items-center justify-center mb-4`}><s.icon size={24}/></div>
            <div className="text-3xl font-black text-slate-900">{s.val}</div>
            <div className="text-xs font-black text-slate-400 uppercase tracking-widest">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Graphique */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <h3 className="text-xl font-black text-slate-900 mb-8">Flux de visibilité</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 700}} />
                <Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} />
                <Area type="monotone" dataKey="val" stroke="#6366f1" strokeWidth={4} fill="url(#colorVal)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <h3 className="text-xl font-black text-slate-900 mb-6">Actions Flash</h3>
          <div className="space-y-4">
            <button className="w-full flex items-center gap-4 p-4 bg-slate-50 rounded-2xl hover:bg-indigo-600 hover:text-white transition group font-bold">
              <PlusCircle className="text-indigo-600 group-hover:text-white" /> Créer un post IA
            </button>
            <button className="w-full flex items-center gap-4 p-4 bg-slate-50 rounded-2xl hover:bg-emerald-600 hover:text-white transition group font-bold">
              <Zap className="text-emerald-600 group-hover:text-white" /> Campagne SMS
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
