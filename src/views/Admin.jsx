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
    
    // Écoute temps réel
    const channel = supabase
      .channel('admin-businesses')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'business_profile'
        },
        (payload) => {
          console.log('🔄 Changement détecté:', payload);
          fetchData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedYear]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Récupérer toutes les entreprises
      const { data: businessData, error: businessError } = await supabase
        .from('business_profile')
        .select('*')
        .order('created_at', { ascending: false });

      if (businessError) throw businessError;

      setBusinesses(businessData || []);

      // Calcul des stats
      const totalRevenue = businessData?.reduce((sum, b) => {
        const price = Number(b.subscription_price) || 0;
        return sum + price;
      }, 0) || 0;

      const activeCount = businessData?.filter(b => b.subscription_status === 'active').length || 0;

      const avgRating = businessData?.length > 0
        ? businessData.reduce((sum, b) => sum + (Number(b.average_rating) || 0), 0) / businessData.length
        : 0;

      setStats({
        totalBusinesses: businessData?.length || 0,
        totalRevenue: totalRevenue,
        activeSubscriptions: activeCount,
        avgRating: avgRating
      });

      // Données mensuelles
      await fetchMonthlyData();

    } catch (error) {
      console.error('❌ Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMonthlyData = async () => {
    try {
      const startDate = new Date(selectedYear, 0, 1).toISOString();
      const endDate = new Date(selectedYear, 11, 31, 23, 59, 59).toISOString();

      const { data: businessData } = await supabase
        .from('business_profile')
        .select('created_at, subscription_price')
        .gte('created_at', startDate)
        .lte('created_at', endDate);

      const { data: reviewData } = await supabase
        .from('reviews')
        .select('created_at')
        .gte('created_at', startDate)
        .lte('created_at', endDate);

      const months = [
        'Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun',
        'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'
      ];

      const monthlyStats = months.map((month, index) => {
        const monthBusinesses = businessData?.filter(b => {
          const date = new Date(b.created_at);
          return date.getMonth() === index;
        }) || [];

        const monthReviews = reviewData?.filter(r => {
          const date = new Date(r.created_at);
          return date.getMonth() === index;
        }) || [];

        const revenue = monthBusinesses.reduce((sum, b) => 
          sum + (Number(b.subscription_price) || 0), 0
        );

        return {
          month,
          'Clients': monthBusinesses.length,
          'Avis': monthReviews.length,
          'Revenus (€)': revenue
        };
      });

      setMonthlyData(monthlyStats);
    } catch (error) {
      console.error('❌ Erreur monthly data:', error);
    }
  };

const updateSubscription = async (businessId, newPlan) => {
  try {
    console.log('🔄 Mise à jour forfait:', { businessId, newPlan });
    
    // Récupérer le prix du nouveau plan
    const price = getPlanPrice(newPlan);
    console.log('💰 Prix du plan:', price);
    
    // Vérifier que le businessId existe
    if (!businessId) {
      throw new Error('ID entreprise manquant');
    }

    // Mise à jour dans Supabase
    const { data, error } = await supabase
      .from('business_profile')
      .update({ 
        plan: newPlan,
        subscription_price: price,
        subscription_status: 'active',
        updated_at: new Date().toISOString()
      })
      .eq('id', businessId)
      .select();

    if (error) {
      console.error('❌ Erreur Supabase:', error);
      throw error;
    }

    console.log('✅ Mise à jour réussie:', data);
    
    // Recharger les données
    await fetchData();
    
    alert(`✅ Forfait mis à jour : ${getPlanLabel(newPlan)} - ${price}€/mois`);
    
  } catch (err) {
    console.error('❌ Erreur complète:', err);
    alert(`❌ Erreur : ${err.message}`);
  }
};

  const deleteBusiness = async (businessId) => {
    if (!confirm('⚠️ Voulez-vous vraiment supprimer cette entreprise ?')) return;

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
    window.open(`/client/${businessId}`, '_blank');
  };

  const filteredBusinesses = businesses.filter(b => {
    if (filter === 'all') return true;
    if (filter === 'inactive') return b.subscription_status === 'inactive';
    return b.plan === filter;
  });

  const planCounts = {
    all: businesses.length,
    basic: businesses.filter(b => b.plan === 'basic').length,
    pro: businesses.filter(b => b.plan === 'pro').length,
    premium: businesses.filter(b => b.plan === 'premium').length,
    inactive: businesses.filter(b => b.subscription_status === 'inactive').length
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Chargement des données...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        
        {/* HEADER */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 rounded-2xl p-8 text-white shadow-xl">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            🎯 Administration
          </h1>
          <p className="text-indigo-100">Tableau de bord centralisé</p>
        </div>

        {/* STATS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                <Store className="w-6 h-6 text-indigo-600" />
              </div>
              <ArrowUpRight className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-3xl font-bold text-slate-900">{stats.totalBusinesses}</p>
            <p className="text-sm text-slate-500 mt-1">Entreprises inscrites</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <ArrowUpRight className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-3xl font-bold text-slate-900">{stats.totalRevenue}€</p>
            <p className="text-sm text-slate-500 mt-1">Revenus mensuels</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Activity className="w-6 h-6 text-blue-600" />
              </div>
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-3xl font-bold text-slate-900">{stats.activeSubscriptions}</p>
            <p className="text-sm text-slate-500 mt-1">Abonnements actifs</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <Star className="w-6 h-6 text-yellow-600" />
              </div>
              <span className="text-yellow-500 font-semibold">★</span>
            </div>
            <p className="text-3xl font-bold text-slate-900">{stats.avgRating.toFixed(1)}</p>
            <p className="text-sm text-slate-500 mt-1">Note moyenne</p>
          </div>
        </div>

        {/* GRAPHIQUES */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenus mensuels */}
          <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-900">📈 Revenus Mensuels {selectedYear}</h3>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="px-3 py-2 bg-slate-50 rounded-lg text-sm font-semibold border border-slate-200"
              >
                {[2024, 2025, 2026].map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#64748b" style={{ fontSize: '12px' }} />
                <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1e293b',
                    border: 'none',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Line type="monotone" dataKey="Revenus (€)" stroke="#4f46e5" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Clients & Avis */}
          <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 mb-6">👥 Clients & Avis {selectedYear}</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#64748b" style={{ fontSize: '12px' }} />
                <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1e293b',
                    border: 'none',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="Clients" fill="#6366f1" radius={[8, 8, 0, 0]} />
                <Bar dataKey="Avis" fill="#a855f7" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* FILTRES */}
        <div className="bg-white rounded-xl p-4 shadow-lg border border-slate-100">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                filter === 'all'
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              📊 Tous ({planCounts.all})
            </button>
            <button
              onClick={() => setFilter('basic')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                filter === 'basic'
                  ? 'bg-green-600 text-white shadow-lg'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              ✅ Basic ({planCounts.basic})
            </button>
            <button
              onClick={() => setFilter('pro')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                filter === 'pro'
                  ? 'bg-orange-600 text-white shadow-lg'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              ⭐ Pro ({planCounts.pro})
            </button>
            <button
              onClick={() => setFilter('premium')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                filter === 'premium'
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              💎 Premium ({planCounts.premium})
            </button>
            <button
              onClick={() => setFilter('inactive')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                filter === 'inactive'
                  ? 'bg-red-600 text-white shadow-lg'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              ❌ Inactifs ({planCounts.inactive})
            </button>
          </div>
        </div>

        {/* TABLEAU */}
        <div className="bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase">
                    Entreprise
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase">
                    Contact
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase">
                    Forfait
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase">
                    Statut
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase">
                    Inscription
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBusinesses.map((business) => {
                  const isInactive = business.subscription_status === 'inactive';

                  return (
                    <tr 
                      key={business.id}
                      className={`hover:bg-slate-50 transition-colors ${
                        isInactive ? 'opacity-60' : ''
                      }`}
                    >
                      {/* ENTREPRISE */}
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-900">{business.name || 'Sans nom'}</p>
                        <p className="text-sm text-slate-500">Non spécifié</p>
                      </td>

                      {/* CONTACT */}
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-slate-900">{business.email || 'N/A'}</p>
                        <p className="text-sm text-slate-500">{business.phone || 'N/A'}</p>
                      </td>

                      {/* FORFAIT */}
                      <td className="px-6 py-4">
                        <select
                          value={business.plan || 'basic'}
                          onChange={(e) => updateSubscription(business.id, e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="basic">⭐ Basic - 29€/mois</option>
                          <option value="pro">🌟 Pro - 59€/mois</option>
                          <option value="premium">💎 Premium - 99€/mois</option>
                        </select>
                        <div className="text-xs text-slate-500 mt-1">
                          💰 Prix actuel : <span className="font-bold text-slate-700">{business.subscription_price || 0}€/mois</span>
                        </div>
                      </td>

                      {/* STATUT */}
                      <td className="px-6 py-4">
                        {business.subscription_status === 'active' ? (
                          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 text-green-700 font-semibold text-sm">
                            <CheckCircle className="w-4 h-4" />
                            Actif
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-100 text-red-700 font-semibold text-sm">
                            <XCircle className="w-4 h-4" />
                            Inactif
                          </div>
                        )}
                      </td>

                      {/* INSCRIPTION */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Calendar className="w-4 h-4" />
                          {new Date(business.created_at).toLocaleDateString('fr-FR')}
                        </div>
                      </td>

                      {/* ACTIONS */}
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
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
