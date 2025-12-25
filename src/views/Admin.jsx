import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { getPlanPrice, getPlanLabel } from '../lib/plans';
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
  
  // ✅ ÉVITE LES RECHARGEMENTS MULTIPLES
  const hasLoadedRef = useRef(false);

  // ✅ CHARGE UNE SEULE FOIS AU MONTAGE
  useEffect(() => {
    if (!hasLoadedRef.current) {
      hasLoadedRef.current = true;
      fetchData();
    }
  }, []);

  // ✅ RECHARGE UNIQUEMENT SI L'ANNÉE CHANGE
  useEffect(() => {
    if (hasLoadedRef.current && !loading) {
      fetchMonthlyData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedYear]);

  const fetchData = async () => {
    try {
      console.log('📊 [Admin] Chargement des entreprises...');

      const { data: businessData, error: businessError } = await supabase
        .from('business_profile')
        .select('*')
        .order('created_at', { ascending: false });

      if (businessError) {
        console.error('❌ [Admin] Erreur business:', businessError);
        throw businessError;
      }

      console.log('✅ [Admin] Entreprises chargées:', businessData?.length);
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

      await fetchMonthlyData();

    } catch (error) {
      console.error('❌ [Admin] Erreur fetchData:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMonthlyData = async () => {
    try {
      console.log('📈 [Admin] Chargement données mensuelles...');
      
      const startDate = new Date(selectedYear, 0, 1);
      const endDate = new Date(selectedYear, 11, 31);

      const { data, error } = await supabase
        .from('business_profile')
        .select('created_at, subscription_price')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      if (error) throw error;

      const monthlyStats = Array.from({ length: 12 }, (_, i) => ({
        month: new Date(selectedYear, i).toLocaleDateString('fr-FR', { month: 'short' }),
        inscriptions: 0,
        revenue: 0
      }));

      data?.forEach(business => {
        const month = new Date(business.created_at).getMonth();
        monthlyStats[month].inscriptions += 1;
        monthlyStats[month].revenue += Number(business.subscription_price) || 0;
      });

      console.log('✅ [Admin] Données mensuelles:', monthlyStats);
      setMonthlyData(monthlyStats);

    } catch (error) {
      console.error('❌ [Admin] Erreur fetchMonthlyData:', error);
    }
  };

  const updateSubscriptionStatus = async (businessId, newStatus) => {
    try {
      const { error } = await supabase
        .from('business_profile')
        .update({ subscription_status: newStatus })
        .eq('id', businessId);

      if (error) throw error;

      setBusinesses(prev =>
        prev.map(b => b.id === businessId ? { ...b, subscription_status: newStatus } : b)
      );

      alert(`✅ Statut mis à jour : ${newStatus}`);
    } catch (error) {
      console.error('❌ Erreur updateSubscriptionStatus:', error);
      alert('❌ Erreur lors de la mise à jour');
    }
  };

  const deleteBusiness = async (businessId) => {
    if (!confirm('⚠️ Supprimer cette entreprise ? Cette action est irréversible.')) return;

    try {
      const { error } = await supabase
        .from('business_profile')
        .delete()
        .eq('id', businessId);

      if (error) throw error;

      setBusinesses(prev => prev.filter(b => b.id !== businessId));
      alert('✅ Entreprise supprimée');
    } catch (error) {
      console.error('❌ Erreur deleteBusiness:', error);
      alert('❌ Erreur lors de la suppression');
    }
  };

  const filteredBusinesses = businesses.filter(b => {
    if (filter === 'all') return true;
    if (filter === 'active') return b.subscription_status === 'active';
    if (filter === 'inactive') return b.subscription_status === 'inactive';
    if (filter === 'trial') return b.subscription_status === 'trial';
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-200 border-t-indigo-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Chargement du tableau de bord admin...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-black text-slate-900 mb-2">Administration</h1>
        <p className="text-slate-600">Gérez toutes les entreprises et visualisez les statistiques globales</p>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <Store className="w-10 h-10 text-indigo-600" />
            <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-xs font-bold">
              TOTAL
            </span>
          </div>
          <div className="text-3xl font-black text-slate-900 mb-1">{stats.totalBusinesses}</div>
          <div className="text-sm text-slate-600">Entreprises inscrites</div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <DollarSign className="w-10 h-10 text-emerald-600" />
            <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-xs font-bold">
              MRR
            </span>
          </div>
          <div className="text-3xl font-black text-slate-900 mb-1">{stats.totalRevenue.toFixed(0)}€</div>
          <div className="text-sm text-slate-600">Revenu mensuel récurrent</div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <CheckCircle className="w-10 h-10 text-blue-600" />
            <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-bold">
              ACTIFS
            </span>
          </div>
          <div className="text-3xl font-black text-slate-900 mb-1">{stats.activeSubscriptions}</div>
          <div className="text-sm text-slate-600">Abonnements actifs</div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <Star className="w-10 h-10 text-amber-600" />
            <span className="bg-amber-50 text-amber-600 px-3 py-1 rounded-full text-xs font-bold">
              NOTE
            </span>
          </div>
          <div className="text-3xl font-black text-slate-900 mb-1">{stats.avgRating.toFixed(1)}</div>
          <div className="text-sm text-slate-600">Note moyenne</div>
        </div>
      </div>

      {/* GRAPHIQUES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* INSCRIPTIONS PAR MOIS */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-black text-slate-900">Inscriptions mensuelles</h2>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value={2024}>2024</option>
              <option value={2025}>2025</option>
            </select>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip />
              <Bar dataKey="inscriptions" fill="#6366f1" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* REVENUS PAR MOIS */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <h2 className="text-xl font-black text-slate-900 mb-6">Revenus mensuels</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip />
              <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} dot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* LISTE DES ENTREPRISES */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-xl font-black text-slate-900 mb-4">Toutes les entreprises</h2>
          
          {/* FILTRES */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                filter === 'all'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Toutes ({businesses.length})
            </button>
            <button
              onClick={() => setFilter('active')}
              className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                filter === 'active'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Actives ({businesses.filter(b => b.subscription_status === 'active').length})
            </button>
            <button
              onClick={() => setFilter('trial')}
              className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                filter === 'trial'
                  ? 'bg-amber-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Essai ({businesses.filter(b => b.subscription_status === 'trial').length})
            </button>
            <button
              onClick={() => setFilter('inactive')}
              className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                filter === 'inactive'
                  ? 'bg-slate-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Inactives ({businesses.filter(b => b.subscription_status === 'inactive').length})
            </button>
          </div>
        </div>

        {/* TABLEAU */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-700 uppercase">Entreprise</th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-700 uppercase">Forfait</th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-700 uppercase">Statut</th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-700 uppercase">Inscription</th>
                <th className="px-6 py-4 text-right text-xs font-black text-slate-700 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredBusinesses.map(business => (
                <tr key={business.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-bold text-slate-900">{business.name}</div>
                      <div className="text-sm text-slate-600">{business.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900">{getPlanLabel(business.plan)}</div>
                    <div className="text-sm text-slate-600">{getPlanPrice(business.plan).value}€/mois</div>
                  </td>
                  <td className="px-6 py-4">
                    {business.subscription_status === 'active' && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold">
                        <CheckCircle className="w-3 h-3" /> Actif
                      </span>
                    )}
                    {business.subscription_status === 'trial' && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-bold">
                        <Activity className="w-3 h-3" /> Essai
                      </span>
                    )}
                    {business.subscription_status === 'inactive' && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
                        <XCircle className="w-3 h-3" /> Inactif
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {new Date(business.created_at).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => updateSubscriptionStatus(business.id, business.subscription_status === 'active' ? 'inactive' : 'active')}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                        title={business.subscription_status === 'active' ? 'Désactiver' : 'Activer'}
                      >
                        {business.subscription_status === 'active' ? (
                          <XCircle className="w-5 h-5 text-slate-600" />
                        ) : (
                          <CheckCircle className="w-5 h-5 text-slate-600" />
                        )}
                      </button>
                      <button
                        onClick={() => deleteBusiness(business.id)}
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="w-5 h-5 text-red-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
