import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { PLANS, getPlanConfig, getPlanPrice, getPlanLabel } from '../lib/plans';
import { 
  Users, Store, TrendingUp, DollarSign, Eye,
  Calendar, Star, Activity, Package, BarChart3,
  Edit, Trash2, CheckCircle, XCircle, ArrowUpRight
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function Admin() {
  const [businesses, setBusinesses] = useState([]);
  const [stats, setStats] = useState({
    totalBusinesses: 0,
    totalRevenue: 0,
    activeSubscriptions: 0,
    avgRating: 0
  });
  const [monthlyData, setMonthlyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchData();
    fetchMonthlyStats();
    
    // ✅ ÉCOUTE EN TEMPS RÉEL DES CHANGEMENTS
    const channel = supabase
      .channel('admin_updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'business_profile'
        },
        (payload) => {
          console.log('🔄 Changement détecté:', payload);
          fetchData(); // Recharge les données
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedYear]);

  const fetchData = async () => {
    try {
      const { data: businessesData, error } = await supabase
        .from('business_profile')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const totalBusinesses = businessesData?.length || 0;
      const activeSubscriptions = businessesData?.filter(b => 
        b.plan && b.plan !== 'free' && b.subscription_status === 'active'
      ).length || 0;

      // ✅ CALCUL DES REVENUS AVEC LA COLONNE subscription_price
      const totalRevenue = businessesData?.reduce((sum, b) => {
        if (b.subscription_status !== 'active') return sum;
        return sum + (b.subscription_price || 0);
      }, 0) || 0;

      setStats({
        totalBusinesses,
        totalRevenue,
        activeSubscriptions,
        avgRating: 4.2
      });

      setBusinesses(businessesData || []);
      
    } catch (err) {
      console.error('❌ Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMonthlyStats = async () => {
    try {
      const { data, error } = await supabase
        .from('business_stats')
        .select('*')
        .eq('year', selectedYear)
        .order('month', { ascending: true });

      if (error) throw error;

      const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
      
      const formattedData = Array.from({ length: 12 }, (_, i) => {
        const monthData = data?.find(d => d.month === i + 1);
        return {
          name: monthNames[i],
          revenus: monthData?.revenue || 0,
          clients: monthData?.new_clients || 0,
          avis: monthData?.reviews_count || 0
        };
      });

      setMonthlyData(formattedData);
    } catch (err) {
      console.error('❌ Erreur stats:', err);
    }
  };

  const updateSubscription = async (businessId, newPlan) => {
    try {
      const price = getPlanPrice(newPlan);
      
      const { error } = await supabase
        .from('business_profile')
        .update({ 
          plan: newPlan,
          subscription_price: price,
          subscription_status: 'active',
          updated_at: new Date().toISOString() // ✅ FORCE LA MISE À JOUR
        })
        .eq('id', businessId);

      if (error) throw error;
      
      // ✅ RECHARGE LES DONNÉES
      await fetchData();
      
      alert(`✅ Forfait mis à jour : ${getPlanLabel(newPlan)} - ${price}€/mois`);
      
    } catch (err) {
      console.error('❌ Erreur:', err);
      alert('❌ Erreur lors de la mise à jour du forfait');
    }
  };

  const deleteBusiness = async (id) => {
    if (!confirm('⚠️ Supprimer cette entreprise ?')) return;

    try {
      const { error } = await supabase
        .from('business_profile')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchData();
      alert('✅ Entreprise supprimée');
    } catch (err) {
      console.error('❌ Erreur:', err);
      alert('❌ Erreur lors de la suppression');
    }
  };

  const viewAsClient = (id) => {
    window.open(`/business/${id}`, '_blank');
  };

  const filteredBusinesses = businesses.filter(b => {
    if (filter === 'all') return true;
    if (filter === 'actifs') return b.subscription_status === 'active';
    if (filter === 'inactifs') return b.subscription_status !== 'active';
    return b.plan === filter;
  });

  const StatCard = ({ icon: Icon, title, value, color, trend }) => (
    <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {trend && (
          <div className="flex items-center gap-1 px-3 py-1 bg-green-50 rounded-full">
            <ArrowUpRight className="w-4 h-4 text-green-600" />
            <span className="text-xs font-bold text-green-600">{trend}%</span>
          </div>
        )}
      </div>
      <h3 className="text-sm font-semibold text-slate-500 mb-1">{title}</h3>
      <p className="text-3xl font-bold text-slate-900">{value}</p>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <Activity className="w-12 h-12 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-slate-100">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        
        {/* HEADER */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black text-slate-900 mb-2">🎯 Administration</h1>
            <p className="text-slate-600 font-semibold">Gestion des entreprises et statistiques</p>
          </div>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="px-4 py-2 rounded-xl border-2 border-slate-200 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {[2023, 2024, 2025].map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>

        {/* STATISTIQUES */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={Store}
            title="Entreprises totales"
            value={stats.totalBusinesses}
            color="bg-gradient-to-br from-indigo-500 to-indigo-600"
            trend={12}
          />
          <StatCard
            icon={DollarSign}
            title="Revenus mensuels"
            value={`${stats.totalRevenue}€`}
            color="bg-gradient-to-br from-green-500 to-green-600"
            trend={8}
          />
          <StatCard
            icon={CheckCircle}
            title="Abonnements actifs"
            value={stats.activeSubscriptions}
            color="bg-gradient-to-br from-blue-500 to-blue-600"
            trend={15}
          />
          <StatCard
            icon={Star}
            title="Note moyenne"
            value={stats.avgRating}
            color="bg-gradient-to-br from-amber-500 to-amber-600"
          />
        </div>

        {/* GRAPHIQUES */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* REVENUS */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <TrendingUp className="w-6 h-6 text-green-600" />
              <h2 className="text-xl font-bold text-slate-900">Revenus Mensuels {selectedYear}</h2>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="revenus" stroke="#10b981" strokeWidth={3} name="Revenus (€)" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* CLIENTS & AVIS */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <BarChart3 className="w-6 h-6 text-indigo-600" />
              <h2 className="text-xl font-bold text-slate-900">Clients & Avis {selectedYear}</h2>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip />
                <Legend />
                <Bar dataKey="clients" fill="#6366f1" name="Clients" />
                <Bar dataKey="avis" fill="#f59e0b" name="Avis" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* FILTRES */}
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-6">
            <Package className="w-6 h-6 text-indigo-600" />
            <h2 className="text-2xl font-bold text-slate-900">Gestion des Entreprises</h2>
          </div>

          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {[
              { id: 'all', label: '🏢 Tous', count: businesses.length },
              { id: 'actifs', label: '✅ Actifs', count: businesses.filter(b => b.subscription_status === 'active').length },
              { id: 'inactifs', label: '⏸️ Inactifs', count: businesses.filter(b => b.subscription_status !== 'active').length },
              { id: 'basic', label: '⭐ Basic', count: businesses.filter(b => b.plan === 'basic').length },
              { id: 'pro', label: '🌟 Pro', count: businesses.filter(b => b.plan === 'pro').length },
              { id: 'premium', label: '💎 Premium', count: businesses.filter(b => b.plan === 'premium').length }
            ].map(({ id, label, count }) => (
              <button
                key={id}
                onClick={() => setFilter(id)}
                className={`px-4 py-2 rounded-xl font-bold text-sm whitespace-nowrap transition-all ${
                  filter === id
                    ? 'bg-indigo-600 text-white shadow-lg'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {label} <span className="ml-1.5 px-2 py-0.5 rounded-full bg-white/20">({count})</span>
              </button>
            ))}
          </div>

          {/* TABLEAU */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-slate-200">
                  <th className="text-left px-6 py-4 text-sm font-bold text-slate-600 uppercase">Entreprise</th>
                  <th className="text-left px-6 py-4 text-sm font-bold text-slate-600 uppercase">Contact</th>
                  <th className="text-left px-6 py-4 text-sm font-bold text-slate-600 uppercase">Forfait</th>
                  <th className="text-left px-6 py-4 text-sm font-bold text-slate-600 uppercase">Statut</th>
                  <th className="text-left px-6 py-4 text-sm font-bold text-slate-600 uppercase">Inscription</th>
                  <th className="text-left px-6 py-4 text-sm font-bold text-slate-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBusinesses.map((business) => {
                  const planConfig = getPlanConfig(business.plan);
                  
                  return (
                    <tr key={business.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-bold text-slate-900">{business.name || 'Sans nom'}</p>
                          <p className="text-sm text-slate-500">{business.business_type || 'Non spécifié'}</p>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <p className="font-semibold text-slate-700">{business.contact_email || 'N/A'}</p>
                          <p className="text-slate-500">{business.contact_phone || 'N/A'}</p>
                        </div>
                      </td>
                      
                    <td className="px-6 py-4">
                      <select
                        value={business.plan || 'basic'}
                        onChange={(e) => updateSubscription(business.id, e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border-2 border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      >
                        <option value="basic">⭐ Basic - 29€/mois</option>
                        <option value="pro">🌟 Pro - 59€/mois</option>
                        <option value="premium">💎 Premium - 99€/mois</option>
                      </select>
                      <div className="text-xs text-slate-500 mt-1">
                        💰 Prix actuel : <span className="font-bold text-slate-700">{business.subscription_price || 0}€/mois</span>
                      </div>
                    </td>
                      
                      <td className="px-6 py-4">
                        {business.subscription_status === 'active' ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-100 text-green-700 text-sm font-bold">
                            <CheckCircle className="w-4 h-4" />
                            Actif
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-100 text-red-700 text-sm font-bold">
                            <XCircle className="w-4 h-4" />
                            Inactif
                          </span>
                        )}
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Calendar className="w-4 h-4" />
                          {new Date(business.created_at).toLocaleDateString('fr-FR')}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => viewAsClient(business.id)}
                            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Voir comme client"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => deleteBusiness(business.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredBusinesses.length === 0 && (
            <div className="text-center py-16">
              <Store className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 font-semibold text-lg">Aucune entreprise trouvée</p>
              <p className="text-sm text-slate-400 mt-2">
                Les entreprises apparaîtront ici une fois inscrites
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
