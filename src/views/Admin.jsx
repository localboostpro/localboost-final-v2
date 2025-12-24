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
      
      const chartData = Array.from({ length: 12 }, (_, i) => {
        const monthData = data?.find(d => d.month === i + 1) || {};
        return {
          month: monthNames[i],
          clients: monthData.total_clients || 0,
          avis: monthData.total_reviews || 0,
          revenue: monthData.total_revenue || 0
        };
      });

      setMonthlyData(chartData);
      
    } catch (err) {
      console.error('❌ Erreur stats:', err);
    }
  };

  // ✅ MISE À JOUR DU PLAN + PRIX
  const updateSubscription = async (businessId, newPlan) => {
    try {
      const price = getPlanPrice(newPlan);
      
      const { error } = await supabase
        .from('business_profile')
        .update({ 
          plan: newPlan,
          subscription_price: price,
          subscription_status: 'active'
        })
        .eq('id', businessId);

      if (error) throw error;
      
      await fetchData();
      alert(`✅ Forfait mis à jour : ${getPlanLabel(newPlan)} - ${price}€/mois`);
      
    } catch (err) {
      console.error('❌ Erreur:', err);
      alert('❌ Erreur lors de la mise à jour du forfait');
    }
  };

  const toggleStatus = async (businessId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      
      const { error } = await supabase
        .from('business_profile')
        .update({ subscription_status: newStatus })
        .eq('id', businessId);

      if (error) throw error;
      await fetchData();
      
    } catch (err) {
      console.error('❌ Erreur:', err);
      alert('❌ Erreur lors du changement de statut');
    }
  };

  const deleteBusiness = async (businessId) => {
    if (!confirm('⚠️ Supprimer définitivement cette entreprise ?')) return;
    
    try {
      const { error } = await supabase
        .from('business_profile')
        .delete()
        .eq('id', businessId);

      if (error) throw error;
      await fetchData();
      alert('✅ Entreprise supprimée');
      
    } catch (err) {
      console.error('❌ Erreur:', err);
      alert('❌ Erreur lors de la suppression');
    }
  };

  const viewAsClient = (businessId) => {
    window.open(`/business/${businessId}`, '_blank');
  };

  const filteredBusinesses = businesses.filter(b => {
    if (filter === 'all') return true;
    if (filter === 'active') return b.subscription_status === 'active';
    if (filter === 'inactive') return b.subscription_status !== 'active';
    return b.plan === filter;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Activity className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600 font-semibold">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* 🎯 HEADER */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-indigo-600" />
            Administration LocalBoost
          </h1>
          <p className="text-slate-600 mt-2">Gestion centralisée des entreprises et abonnements</p>
        </div>

        {/* 📊 CARTES STATISTIQUES */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-indigo-500">
            <div className="flex items-center justify-between mb-2">
              <Store className="w-8 h-8 text-indigo-600" />
              <ArrowUpRight className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-sm font-medium text-slate-600">Total Entreprises</p>
            <p className="text-3xl font-bold text-slate-900 mt-1">{stats.totalBusinesses}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-8 h-8 text-green-600" />
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-sm font-medium text-slate-600">Revenus Mensuels</p>
            <p className="text-3xl font-bold text-slate-900 mt-1">{stats.totalRevenue}€</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="w-8 h-8 text-purple-600" />
              <Package className="w-5 h-5 text-purple-500" />
            </div>
            <p className="text-sm font-medium text-slate-600">Abonnements Actifs</p>
            <p className="text-3xl font-bold text-slate-900 mt-1">{stats.activeSubscriptions}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-amber-500">
            <div className="flex items-center justify-between mb-2">
              <Star className="w-8 h-8 text-amber-600" />
              <Activity className="w-5 h-5 text-amber-500" />
            </div>
            <p className="text-sm font-medium text-slate-600">Note Moyenne</p>
            <p className="text-3xl font-bold text-slate-900 mt-1">{stats.avgRating.toFixed(1)}</p>
          </div>
        </div>

        {/* 📈 GRAPHIQUES */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          
          {/* GRAPHIQUE REVENUS */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                Revenus Mensuels {selectedYear}
              </h2>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="px-3 py-1 rounded-lg border-2 border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value={2024}>2024</option>
                <option value={2025}>2025</option>
              </select>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    border: 'none', 
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  name="Revenus (€)"
                  dot={{ fill: '#10b981', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* GRAPHIQUE CLIENTS & AVIS */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600" />
              Clients & Avis {selectedYear}
            </h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    border: 'none', 
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
                <Legend />
                <Bar dataKey="clients" fill="#6366f1" name="Clients" radius={[8, 8, 0, 0]} />
                <Bar dataKey="avis" fill="#a855f7" name="Avis" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 📋 GESTION DES ENTREPRISES */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          
          {/* FILTRES */}
          <div className="p-6 border-b border-slate-200 bg-slate-50">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                  filter === 'all'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-white text-slate-700 hover:bg-slate-100'
                }`}
              >
                📊 Tous ({businesses.length})
              </button>
              <button
                onClick={() => setFilter('active')}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                  filter === 'active'
                    ? 'bg-green-600 text-white shadow-md'
                    : 'bg-white text-slate-700 hover:bg-slate-100'
                }`}
              >
                ✅ Actifs ({businesses.filter(b => b.subscription_status === 'active').length})
              </button>
              <button
                onClick={() => setFilter('inactive')}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                  filter === 'inactive'
                    ? 'bg-slate-600 text-white shadow-md'
                    : 'bg-white text-slate-700 hover:bg-slate-100'
                }`}
              >
                ⏸️ Inactifs ({businesses.filter(b => b.subscription_status !== 'active').length})
              </button>
              <button
                onClick={() => setFilter('basic')}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                  filter === 'basic'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-white text-slate-700 hover:bg-slate-100'
                }`}
              >
                🆓 Basic ({businesses.filter(b => b.plan === 'basic').length})
              </button>
              <button
                onClick={() => setFilter('pro')}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                  filter === 'pro'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'bg-white text-slate-700 hover:bg-slate-100'
                }`}
              >
                ⭐ Pro ({businesses.filter(b => b.plan === 'pro').length})
              </button>
              <button
                onClick={() => setFilter('premium')}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                  filter === 'premium'
                    ? 'bg-pink-600 text-white shadow-md'
                    : 'bg-white text-slate-700 hover:bg-slate-100'
                }`}
              >
                💎 Premium ({businesses.filter(b => b.plan === 'premium').length})
              </button>
            </div>
          </div>

          {/* TABLEAU */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-100 border-b-2 border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Entreprise
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Forfait
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Inscription
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredBusinesses.map((business) => {
                  const planConfig = getPlanConfig(business.plan);
                  const colorMap = {
                    blue: 'bg-blue-100 text-blue-800 border-blue-300',
                    purple: 'bg-purple-100 text-purple-800 border-purple-300',
                    pink: 'bg-pink-100 text-pink-800 border-pink-300'
                  };

                  return (
                    <tr key={business.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                            <Store className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{business.name || 'Sans nom'}</p>
                            <p className="text-sm text-slate-500">{business.business_type || 'Non spécifié'}</p>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <p className="text-sm text-slate-700 font-medium">{business.email || 'N/A'}</p>
                        <p className="text-sm text-slate-500">{business.phone || 'N/A'}</p>
                      </td>
                      
                      <td className="px-6 py-4">
                        <select
                          value={business.plan || 'basic'}
                          onChange={(e) => updateSubscription(business.id, e.target.value)}
                          className={`w-full px-3 py-2 rounded-lg border-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 ${colorMap[planConfig.color]}`}
                        >
                          <option value="basic">🆓 Basic - {PLANS.basic.price}€/mois</option>
                          <option value="pro">⭐ Pro - {PLANS.pro.price}€/mois</option>
                          <option value="premium">💎 Premium - {PLANS.premium.price}€/mois</option>
                        </select>
                        
                        {/* ✅ AFFICHAGE DU PRIX ACTUEL */}
                        <div className="text-xs text-slate-500 mt-1 font-semibold">
                          💰 Prix actuel : <span className="text-green-600">{business.subscription_price || 0}€/mois</span>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <button
                          onClick={() => toggleStatus(business.id, business.subscription_status)}
                          className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 transition-all ${
                            business.subscription_status === 'active'
                              ? 'bg-green-100 text-green-800 hover:bg-green-200'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {business.subscription_status === 'active' ? (
                            <>
                              <CheckCircle className="w-4 h-4" />
                              Actif
                            </>
                          ) : (
                            <>
                              <XCircle className="w-4 h-4" />
                              Inactif
                            </>
                          )}
                        </button>
                      </td>
                      
                      <td className="px-6 py-4 text-sm text-slate-600 font-medium">
                        {business.created_at 
                          ? new Date(business.created_at).toLocaleDateString('fr-FR')
                          : 'N/A'
                        }
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
