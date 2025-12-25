import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { 
  TrendingUp, Users, Star, ArrowUpRight, 
  PlusCircle, Zap, MessageSquare, Share2 
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer 
} from 'recharts';

export default function Dashboard({ user }) {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({
    totalReviews: 0,
    avgRating: 0,
    newCustomers: 0,
    growth: 0
  });
  const [chartData, setChartData] = useState([]);

  const loadDashboardData = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);

      // 1. Récupérer le profil Business
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

      // 2. Récupérer les données en parallèle (Avis et Stats)
      const [reviewsRes] = await Promise.all([
        supabase.from('reviews').select('*').eq('business_id', bizProfile.id)
      ]);

      const reviews = reviewsRes.data || [];
      
      // 3. Calcul des statistiques
      const avg = reviews.length > 0 
        ? (reviews.reduce((acc, r) => acc + (Number(r.rating) || 0), 0) / reviews.length).toFixed(1)
        : 0;

      setStats({
        totalReviews: reviews.length,
        avgRating: avg,
        newCustomers: Math.floor(reviews.length * 0.8), // Simulation pour le design
        growth: 12.5
      });

      // 4. Données fictives pour le graphique (à remplacer par des données SQL réelles plus tard)
      setChartData([
        { name: 'Lun', val: 400 }, { name: 'Mar', val: 300 },
        { name: 'Mer', val: 600 }, { name: 'Jeu', val: 800 },
        { name: 'Ven', val: 500 }, { name: 'Sam', val: 900 },
        { name: 'Dim', val: 700 },
      ]);

    } catch (err) {
      console.error("Erreur Dashboard:", err.message);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-indigo-600"></div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-10">
      {/* Header avec Message de Bienvenue */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-indigo-600 to-purple-700 p-8 rounded-[2.5rem] text-white shadow-2xl shadow-indigo-200">
        <div>
          <h1 className="text-3xl font-black mb-1">Bonjour, {profile?.name || 'Commerçant'} 👋</h1>
          <p className="text-indigo-100 opacity-90 font-medium">Votre établissement se porte bien cette semaine.</p>
        </div>
        <div className="flex gap-2">
           <button className="bg-white/20 backdrop-blur-md px-4 py-2.5 rounded-xl font-bold hover:bg-white/30 transition flex items-center gap-2">
             <Share2 size={18}/> Partager ma page
           </button>
        </div>
      </div>

      {/* Cartes d'impact */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: "Note Google", value: `${stats.avgRating}/5`, icon: Star, color: "text-amber-500" },
          { label: "Avis Clients", value: stats.totalReviews, icon: MessageSquare, color: "text-blue-500" },
          { label: "Nouveaux Clients", value: `+${stats.newCustomers}`, icon: Users, color: "text-emerald-500" },
          { label: "Croissance", value: `+${stats.growth}%`, icon: TrendingUp, color: "text-indigo-500" },
        ].map((s, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 bg-slate-50 ${s.color}`}>
              <s.icon size={24} />
            </div>
            <div className="text-3xl font-black text-slate-900">{s.value}</div>
            <div className="text-sm font-bold text-slate-400 uppercase tracking-tighter">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Graphique de Performance & Actions Rapides */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Graphique */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-slate-900">Visibilité Locale</h3>
            <select className="bg-slate-50 border-none rounded-xl text-sm font-bold text-slate-500 p-2">
              <option>7 derniers jours</option>
              <option>30 derniers jours</option>
            </select>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 600}} dy={10} />
                <YAxis hide />
                <Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} />
                <Area type="monotone" dataKey="val" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#colorVal)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Actions Rapides */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <h3 className="text-xl font-black text-slate-900 mb-6">Actions Rapides</h3>
          <div className="space-y-4">
            <button className="w-full flex items-center gap-4 p-4 bg-slate-50 rounded-2xl hover:bg-indigo-50 group transition">
              <div className="bg-white p-3 rounded-xl shadow-sm text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition">
                <PlusCircle size={20}/>
              </div>
              <div className="text-left">
                <div className="font-bold text-slate-900">Nouveau Post</div>
                <div className="text-xs text-slate-500">Générer un post IA</div>
              </div>
            </button>

            <button className="w-full flex items-center gap-4 p-4 bg-slate-50 rounded-2xl hover:bg-amber-50 group transition">
              <div className="bg-white p-3 rounded-xl shadow-sm text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition">
                <Zap size={20}/>
              </div>
              <div className="text-left">
                <div className="font-bold text-slate-900">Boost Promotion</div>
                <div className="text-xs text-slate-500">Lancer une campagne SMS</div>
              </div>
            </button>

            <button className="w-full flex items-center gap-4 p-4 bg-slate-50 rounded-2xl hover:bg-blue-50 group transition">
              <div className="bg-white p-3 rounded-xl shadow-sm text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition">
                <ArrowUpRight size={20}/>
              </div>
              <div className="text-left">
                <div className="font-bold text-slate-900">Demander Avis</div>
                <div className="text-xs text-slate-500">Envoyer un lien Google</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
