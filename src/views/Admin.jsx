import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { 
  Users, Store, TrendingUp, DollarSign, 
  Calendar, Star, Activity, Package, 
  Edit, Trash2, CheckCircle, XCircle 
} from 'lucide-react';

export default function Admin() {
  const [businesses, setBusinesses] = useState([]);
  const [stats, setStats] = useState({
    totalBusinesses: 0,
    totalRevenue: 0,
    activeSubscriptions: 0,
    avgRating: 0
  });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, free, pro, premium

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Récupérer toutes les entreprises
      const { data: businessesData, error: businessesError } = await supabase
        .from('businesses')
        .select(`
          *,
          reviews(rating)
        `)
        .order('created_at', { ascending: false });

      if (businessesError) throw businessesError;

      // Calculer les stats
      const totalBusinesses = businessesData?.length || 0;
      const activeSubscriptions = businessesData?.filter(b => 
        b.subscription_plan !== 'free'
      ).length || 0;

      const totalRevenue = businessesData?.reduce((sum, b) => {
        const price = b.subscription_plan === 'pro' ? 29 : 
                     b.subscription_plan === 'premium' ? 99 : 0;
        return sum + price;
      }, 0) || 0;

      const avgRating = businessesData?.reduce((sum, b) => {
        const avg = b.reviews?.length > 0 
          ? b.reviews.reduce((s, r) => s + r.rating, 0) / b.reviews.length 
          : 0;
        return sum + avg;
      }, 0) / (businessesData?.length || 1) || 0;

      setStats({
        totalBusinesses,
        totalRevenue,
        activeSubscriptions,
        avgRating
      });

      setBusinesses(businessesData || []);
    } catch (err) {
      console.error('Erreur:', err);
      alert('❌ Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const updateSubscription = async (businessId, newPlan) => {
    try {
      const { error } = await supabase
        .from('businesses')
        .update({ subscription_plan: newPlan })
        .eq('id', businessId);

      if (error) throw error;
      
      fetchData();
      alert('✅ Forfait mis à jour avec succès');
    } catch (err) {
      console.error('Erreur:', err);
      alert('❌ Erreur lors de la mise à jour');
    }
  };

  const toggleStatus = async (businessId, currentStatus) => {
    try {
      const { error } = await supabase
        .from('businesses')
        .update({ is_active: !currentStatus })
        .eq('id', businessId);

      if (error) throw error;
      
      fetchData();
      alert(`✅ Statut ${!currentStatus ? 'activé' : 'désactivé'}`);
    } catch (err) {
      console.error('Erreur:', err);
      alert('❌ Erreur lors du changement de statut');
    }
  };

  const deleteBusiness = async (businessId) => {
    if (!confirm('⚠️ Êtes-vous sûr de vouloir supprimer cette entreprise ?')) return;

    try {
      const { error } = await supabase
        .from('businesses')
        .delete()
        .eq('id', businessId);

      if (error) throw error;
      
      fetchData();
      alert('✅ Entreprise supprimée');
    } catch (err) {
      console.error('Erreur:', err);
      alert('❌ Erreur lors de la suppression');
    }
  };

  const filteredBusinesses = businesses.filter(b => {
    if (filter === 'all') return true;
    return b.subscription_plan === filter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">🔐 Administration</h1>
          <p className="text-slate-600 mt-1">Gérez toutes les entreprises inscrites</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm">Total Entreprises</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">{stats.totalBusinesses}</p>
            </div>
            <div className="bg-indigo-50 p-3 rounded-lg">
              <Store className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm">Abonnements Actifs</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">{stats.activeSubscriptions}</p>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <Users className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm">Revenu Mensuel</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">{stats.totalRevenue}€</p>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm">Note Moyenne</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">{stats.avgRating.toFixed(1)}</p>
            </div>
            <div className="bg-yellow-50 p-3 rounded-lg">
              <Star className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex gap-2">
        {['all', 'free', 'pro', 'premium'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filter === f
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {f === 'all' ? 'Tous' : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Entreprise
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Forfait
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Inscription
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredBusinesses.map(business => (
                <tr key={business.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                        <Store className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900">
                          {business.name || 'Sans nom'}
                        </div>
                        <div className="text-sm text-slate-500">
                          {business.category || 'Non défini'}
                        </div>
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {business.email || 'N/A'}
                  </td>
                  
                  <td className="px-6 py-4">
                    <select
                      value={business.subscription_plan || 'free'}
                      onChange={(e) => updateSubscription(business.id, e.target.value)}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="free">Free</option>
                      <option value="pro">Pro (29€)</option>
                      <option value="premium">Premium (99€)</option>
                    </select>
                  </td>
                  
                  <td className="px-6 py-4">
                    <button
                      onClick={() => toggleStatus(business.id, business.is_active)}
                      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium ${
                        business.is_active
                          ? 'bg-green-50 text-green-700'
                          : 'bg-red-50 text-red-700'
                      }`}
                    >
                      {business.is_active ? (
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
                  
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {new Date(business.created_at).toLocaleDateString('fr-FR')}
                  </td>
                  
                  <td className="px-6 py-4">
                    <button
                      onClick={() => deleteBusiness(business.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredBusinesses.length === 0 && (
          <div className="text-center py-12">
            <Store className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">Aucune entreprise trouvée</p>
            <p className="text-sm text-slate-400 mt-1">
              Les entreprises apparaîtront ici une fois inscrites
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

