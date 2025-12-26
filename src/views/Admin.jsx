import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { getPlanPrice, getPlanLabel } from '../lib/plans';
import { 
  Store, DollarSign, CheckCircle, Star, Activity, Trash2, XCircle
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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
  
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    if (!hasLoadedRef.current) {
      hasLoadedRef.current = true;
      fetchData();
    }
  }, []);

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

      setBusinesses(businessData || []);

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

      setMonthlyData(monthlyStats);
    } catch (error) {
      console.error('❌ [Admin] Erreur fetchMonthlyData:', error);
    }
  };

  // ✅ MISE À JOUR DU STATUT (Actif/Inactif)
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

  // ✅ NOUVELLE FONCTION : MISE À JOUR DU FORFAIT (Basic/Pro/Premium)
  const updateBusinessPlan = async (businessId, newPlan) => {
    try {
      // On récupère le prix pour mettre à jour aussi la colonne subscription_price
      const planPrice = getPlanPrice(newPlan).value;

      const { error } = await supabase
        .from('business_profile')
        .update({ 
          plan: newPlan,
          subscription_price: planPrice 
        })
        .eq('id', businessId);

      if (error) throw error;

      setBusinesses(prev =>
        prev.map(b => b.id === businessId ? { ...b, plan: newPlan, subscription_price: planPrice } : b)
      );
      
      alert(`✅ Forfait passé en : ${newPlan.toUpperCase()}`);
    } catch (error) {
      console.error('❌ Erreur updateBusinessPlan:', error);
      alert('❌ Erreur lors du changement de forfait');
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
            <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-xs font-bold">TOTAL</span>
          </div>
          <div className="text-3xl font-black text-slate-900 mb-1">{stats.totalBusinesses}</div>
          <div className="text-sm text-slate-600">Entreprises inscrites</div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <DollarSign className="w-10 h-10 text-emerald-600" />
            <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-xs font-bold">MRR</span>
          </div>
          <div className="text-3xl font-black text-slate-900 mb-1">{stats.totalRevenue.toFixed(0)}€</div>
          <div className="text-sm text-slate-600">Revenu mensuel récurrent</div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <CheckCircle className="w-10 h-10 text-blue-600" />
            <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-bold">ACTIFS</span>
          </div>
          <div className="text-3xl font-black text-slate-900 mb-1">{stats.activeSubscriptions}</div>
          <div className="text-sm text-slate-600">Abonnements actifs</div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <Star className="w-10 h-10 text-amber-600" />
            <span className="bg-amber-50 text-amber-600 px-3 py-1 rounded-full text-xs font-bold">NOTE</span>
          </div>
          <div className="text-3xl font-black text-slate-900 mb-1">{stats.avgRating.toFixed(1)}</div>
          <div className="text-sm text-slate-600">Note moyenne</div>
        </div>
      </div>

      {/* GRAPHIQUES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-black text-slate-900">Inscriptions mensuelles</h2>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-indigo-500"
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
          <div className="flex gap-2">
            {['all', 'active', 'trial', 'inactive'].map(status => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                  filter === status ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

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
            // Dans votre composant Admin
<tbody className="divide-y divide-slate-200">
  {businesses.map((business) => (
    <tr key={business.id} className="hover:bg-slate-50">
      <td className="px-6 py-4 text-sm font-medium text-gray-900">
        {business.business_name || business.name || 'N/A'}
      </td>
      <td className="px-6 py-4 text-sm text-gray-500">
        {business.business_type || business.category || 'N/A'}
      </td>
      <td className="px-6 py-4 text-sm text-gray-500">
        {business.city || 'N/A'}
      </td>
      <td className="px-6 py-4">
        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
          business.subscription_status === 'active' 
            ? 'bg-green-100 text-green-800'
            : business.subscription_status === 'trial'
            ? 'bg-blue-100 text-blue-800'
            : 'bg-orange-100 text-orange-800'
        }`}>
          {business.subscription_status === 'active' ? 'Actif' : 
           business.subscription_status === 'trial' ? 'Essai' : 'En attente'}
        </span>
      </td>
      <td className="px-6 py-4 text-sm font-semibold text-gray-900">
        {business.subscription_price ? `${business.subscription_price}€/mois` : 'Gratuit'}
      </td>
      <td className="px-6 py-4 text-sm space-x-2">
        <button 
          onClick={() => handleEdit(business)}
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          Modifier
        </button>
        <button 
          onClick={() => handleDelete(business.id)}
          className="text-red-600 hover:text-red-800 font-medium"
        >
          Supprimer
        </button>
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
