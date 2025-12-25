import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { TrendingUp, Users, Star, MessageSquare, Share2, PlusCircle, Zap } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard({ user }) {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({ totalReviews: 0, avgRating: 0, growth: 12.5 });
  const [chartData, setChartData] = useState([]);

  const loadDashboardData = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      
      // 1. Récupérer le profil Business (colonne 'plan')
      const { data: bizProfile, error: profileError } = await supabase
        .from('business_profile')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (profileError) throw profileError;
      if (!bizProfile) {
        setLoading(false);
        return;
      }
      setProfile(bizProfile);

      // 2. Récupérer les avis pour ce business_id
      const { data: reviews, error: reviewsError } = await supabase
        .from('reviews')
        .select('rating')
        .eq('business_id', bizProfile.id);

      if (reviewsError) throw reviewsError;
      
      // 3. Calcul sécurisé des stats
      const validRatings = reviews?.filter(r => r.rating !== null) || [];
      const avg = validRatings.length > 0 
        ? (validRatings.reduce((acc, r) => acc + Number(r.rating), 0) / validRatings.length).toFixed(1)
        : 0;

      setStats(prev => ({
        ...prev,
        totalReviews: reviews?.length || 0,
        avgRating: avg
      }));

      // Données de démo pour le design
      setChartData([
        { name: 'Lun', val: 400 }, { name: 'Mar', val: 300 },
        { name: 'Mer', val: 600 }, { name: 'Jeu', val: 800 },
        { name: 'Ven', val: 500 }
      ]);

    } catch (err) {
      console.error("Erreur de chargement:", err.message);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-indigo-600"></div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-10">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-700 p-8 rounded-[2.5rem] text-white shadow-xl shadow-indigo-100">
        <h1 className="text-3xl font-black mb-1">Tableau de Bord 👋</h1>
        <p className="opacity-90 font-medium">{profile?.name || 'Établissement'}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm text-center">
          <Star className="mx-auto text-amber-500 mb-2" size={32} />
          <div className="text-3xl font-black">{stats.avgRating}/5</div>
          <div className="text-xs font-bold text-slate-400 uppercase">Note Moyenne</div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm text-center">
          <MessageSquare className="mx-auto text-blue-500 mb-2" size={32} />
          <div className="text-3xl font-black">{stats.totalReviews}</div>
          <div className="text-xs font-bold text-slate-400 uppercase">Avis reçus</div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm text-center">
          <TrendingUp className="mx-auto text-emerald-500 mb-2" size={32} />
          <div className="text-3xl font-black">+{stats.growth}%</div>
          <div className="text-xs font-bold text-slate-400 uppercase">Croissance</div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm h-[350px]">
        <h3 className="text-xl font-black mb-6">Activité de la semaine</h3>
        <ResponsiveContainer width="100%" height="80%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} />
            <Tooltip />
            <Area type="monotone" dataKey="val" stroke="#6366f1" strokeWidth={3} fill="url(#colorVal)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
