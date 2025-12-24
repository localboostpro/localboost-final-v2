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

      // ✅ CALCUL DES REVENUS AVEC plans.js
      const totalRevenue = businessesData?.reduce((sum, b) => {
        if (b.subscription_status !== 'active') return sum;
        const price = getPlanPrice(b.plan);
        return sum + price;
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

      const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
      
      // Créer un tableau avec tous les mois (même vides)
      const formatted = Array.from({ length: 12 }, (_, i) => {
        const monthData = data?.find(d => d.month === i + 1);
        return {
          name: monthNames[i],
          revenus: monthData?.total_revenue || 0,
          clients: monthData?.total_clients || 0,
          avis: monthData?.total_reviews || 0
        };
      });

      setMonthlyData(formatted);
    } catch (err) {
      console.error('❌ Erreur stats:', err);
      // Si la table n'existe pas encore, créer des données par défaut
      const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
      setMonthlyData(monthNames.map(name => ({ name, revenus: 0, clients: 0, avis: 0 })));
    }
  };

  const viewAsClient = (businessId) => {
    window.open(`/dashboard?business_id=${businessId}`, '_blank');
  };

  const updateSubscription = async (businessId, newPlan) => {
    try {
      const { error } = await supabase
        .from('business_profile')
        .update({ plan: newPlan })
        .eq('id', businessId);

      if (error) throw error;
      fetchData();
      alert(`✅ Forfait mis à jour : ${getPlanLabel(newPlan)} - ${getPlanPrice(newPlan)}€/mois`);
    } catch (err) {
      alert('❌ Erreur lors de la mise à jour');
    }
  };

  const toggleStatus = async (businessId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    
    try {
      const { error } = await supabase
        .from('business_profile')
        .update({ subscription_status: newStatus })
        .eq('id', businessId);

      if (error) throw error;
      fetchData();
    } catch (err) {
      alert('❌ Erreur');
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
      fetchData();
      alert('✅ Entreprise supprimée');
    } catch (err) {
      alert('❌ Erreur');
    }
  };

  const filteredBusinesses = businesses.filter(b => {
    if (filter === 'all') return true;
    return b.plan === filter;
  });

  // ✅ BADGE DE PLAN AVEC COULEURS DE plans.js
  const PlanBadge = ({ plan }) => {
    const config = getPlanConfig(plan);
    const colorClasses = {
      blue: 'bg-blue-100 text-blue-700 border-blue-200',
      purple: 'bg-purple-100 text-purple-700 border-purple-200',
      pink: 'bg-pink-100 text-pink-700 border-pink-200'
    };

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold border-2 ${colorClasses[config.color]}`}>
        {plan === 'basic' && '🆓'}
        {plan === 'pro' && '⭐'}
        {plan === 'premium' && '💎'}
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        
        {/* En-tête */}
        <div className="mb-8 bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                <Activity className="w-8 h-8 text-indigo-600" />
                Administration
              </h1>
              <p className="text-slate-600 mt-2">
                Vue d'ensemble de la plateforme • {new Date().toLocaleDateString('fr-FR')}
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-slate-500">MRR Total</div>
              <div className="text-3xl font-bold text-indigo-600">{stats.totalRevenue}€</div>
            </div>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <Store className="w-8 h-8 opacity-80" />
              <ArrowUpRight className="w-5 h-5 opacity-60" />
            </div>
            <div className="text-sm font-medium opacity-90 mb-1">Total Entreprises</div>
            <div className="text-4xl font-bold">{stats.totalBusinesses}</div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <CheckCircle className="w-8 h-8 opacity-80" />
              <ArrowUpRight className="w-5 h-5 opacity-60" />
            </div>
            <div className="text-sm font-medium opacity-90 mb-1">Abonnements Actifs</div>
            <div className="text-4xl font-bold">{stats.activeSubscriptions}</div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <DollarSign className="w-8 h-8 opacity-80" />
              <TrendingUp className="w-5 h-5 opacity-60" />
            </div>
            <div className="text-sm font-medium opacity-90 mb-1">Revenu Mensuel</div>
            <div className="text-4xl font-bold">{stats.totalRevenue}€</div>
          </div>

          <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <Star className="w-8 h-8 opacity-80" />
              <span className="text-2xl opacity-80">⭐</span>
            </div>
            <div className="text-sm font-medium opacity-90 mb-1">Note Moyenne</div>
            <div className="text-4xl font-bold">{stats.avgRating}</div>
          </div>
        </div>

        {/* Graphiques */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          
          {/* Revenus mensuels */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-slate-900">Revenus Mensuels</h2>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm font-medium"
              >
                <option value="2024">2024</option>
                <option value="2025">2025</option>
              </select>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    border: 'none', 
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                  formatter={(value) => `${value}€`}
                />
                <Line 
                  type="monotone" 
                  dataKey="revenus" 
                  stroke="#6366f1" 
                  strokeWidth={3}
                  dot={{ fill: '#6366f1', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Clients et avis */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <h2 className="text-lg font-bold text-slate-900 mb-6">Clients & Avis</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
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
                <Bar dataKey="clients" fill="#10b981" radius={[8, 8, 0, 0]} />
                <Bar dataKey="avis" fill="#f59e0b" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Liste des entreprises */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200">
          
          {/* Filtres */}
          <div className="border-b border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-900">Gestion des Entreprises</h2>
              <div className="text-sm text-slate-500">
                {filteredBusinesses.length} résultat(s)
              </div>
            </div>
            <div className="flex gap-2">
              {['all', 'basic', 'pro', 'premium'].map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                    filter === f
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {f === 'all' ? '📊 Tous' : 
                   f === 'basic' ? '🆓 Basic' :
                   f === 'pro' ? '⭐ Pro' : '💎 Premium'}
                </button>
              ))}
            </div>
          </div>

          {/* Tableau */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
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
              <tbody className="divide-y divide-slate-100">
                {filteredBusinesses.map((business) => (
                  <tr key={business.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                          <Store className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">{business.name || 'Sans nom'}</div>
                          <div className="text-sm text-slate-500">{business.city || 'Ville inconnue'}</div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-900">{business.email || 'Non renseigné'}</div>
                      <div className="text-sm text-slate-500">{business.phone || 'Pas de téléphone'}</div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        <PlanBadge plan={business.plan || 'basic'} />
                        <select
                          value={business.plan || 'basic'}
                          onChange={(e) => updateSubscription(business.id, e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border-2 border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        >
                          <option value="basic">🆓 Basic - {PLANS.basic.price}€/mois</option>
                          <option value="pro">⭐ Pro - {PLANS.pro.price}€/mois</option>
                          <option value="premium">💎 Premium - {PLANS.premium.price}€/mois</option>
                        </select>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleStatus(business.id, business.subscription_status)}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                          business.subscription_status === 'active'
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-red-100 text-red-700 hover:bg-red-200'
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
                ))}
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
