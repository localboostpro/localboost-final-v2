import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Star, MessageSquare, TrendingUp, Share2, PlusCircle, Zap } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard({ user }) {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({ totalReviews: 0, avgRating: 0 });

  const loadDashboardData = useCallback(async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      // Récupération du profil
      const { data: biz } = await supabase.from('business_profile').select('*').eq('user_id', user.id).maybeSingle();
      if (!biz) return;
      setProfile(biz);

      // Récupération des avis pour les stats
      const { data: revs } = await supabase.from('reviews').select('rating').eq('business_id', biz.id);
      if (revs && revs.length > 0) {
        const avg = (revs.reduce((acc, r) => acc + (r.rating || 0), 0) / revs.length).toFixed(1);
        setStats({ totalReviews: revs.length, avgRating: avg });
      }
    } catch (err) {
      console.error("Erreur Dashboard:", err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => { loadDashboardData(); }, [loadDashboardData]);

  if (loading) return <div className="flex justify-center p-20 font-bold text-indigo-600 animate-pulse">Propulsion de vos données...</div>;

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-10">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-700 p-8 rounded-[2.5rem] text-white shadow-xl shadow-indigo-100 flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h1 className="text-3xl font-black mb-1">Bonjour, {profile?.name || 'Commerçant'} 👋</h1>
          <p className="opacity-90 font-medium">Votre activité est en pleine croissance.</p>
        </div>
        <button className="bg-white/10 backdrop-blur-md px-6 py-3 rounded-2xl font-bold hover:bg-white/20 transition flex items-center gap-2 border border-white/20">
          <Share2 size={18}/> Partager mon profil
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm text-center">
          <Star className="mx-auto text-amber-500 mb-2" size={32} />
          <div className="text-3xl font-black">{stats.avgRating}/5</div>
          <div className="text-xs font-black text-slate-400 uppercase tracking-widest">Note Google</div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm text-center">
          <MessageSquare className="mx-auto text-blue-500 mb-2" size={32} />
          <div className="text-3xl font-black">{stats.totalReviews}</div>
          <div className="text-xs font-black text-slate-400 uppercase tracking-widest">Avis Clients</div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm text-center">
          <TrendingUp className="mx-auto text-emerald-500 mb-2" size={32} />
          <div className="text-3xl font-black">+12%</div>
          <div className="text-xs font-black text-slate-400 uppercase tracking-widest">Croissance</div>
        </div>
      </div>
    </div>
  );
}
