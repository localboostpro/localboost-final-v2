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
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      console.log('🔄 Chargement des entreprises...');

      // ✅ UTILISER business_profile (ta vraie table)
      const { data: businessesData, error: businessesError } = await supabase
        .from('business_profile')
        .select('*')
        .order('created_at', { ascending: false });

      if (businessesError) {
        console.error('❌ Erreur Supabase:', businessesError);
        throw businessesError;
      }

      console.log('✅ Données reçues:', businessesData);

      // Calculer les stats
      const totalBusinesses = businessesData?.length || 0;
      
      const activeSubscriptions = businessesData?.filter(b => 
        b.plan && b.plan !== 'free' && b.subscription_status === 'active'
      ).length || 0;

      const totalRevenue = businessesData?.reduce((sum, b) => {
        if (b.subscription_status !== 'active') return sum;
        const price = b.plan === 'pro' ? 29 : 
                     b.plan === 'premium' ? 99 : 0;
        return sum + price;
      }, 0) || 0;

      setStats({
        totalBusinesses,
        totalRevenue,
        activeSubscriptions,
        avgRating: 0 // Pas de reviews pour l'instant
      });

      setBusinesses(businessesData || []);
      
    } catch (err) {
      console.error('❌ Erreur complète:', err);
      alert('❌ Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const updateSubscription = async (businessId, newPlan) => {
    try {
      const { error } = await supabase
        .from('business_profile')
        .update({ plan: newPlan })
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
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    
    try {
      const { error } = await supabase
        .from('business_profile')
        .update({ subscription_status: newStatus })
        .eq('id', businessId);

      if (error) throw error;
      
      fetchData();
      alert('✅ Statut mis à jour');
    } catch (err) {
      console.error('Erreur:', err);
      alert('❌ Erreur lors de la mise à jour du statut');
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
      console.error('Erreur:', err);
      alert('❌ Erreur lors de la suppression');
    }
  };

  const filteredBusinesses = businesses.filter(b => {
    if (filter === 'all') return true;
    return b.plan === filter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* En-tête */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
          📊 Administration
        </h1>
        <p className="text-slate-600 mt-2">
          Gérez toutes les entreprises inscrites
        </p>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-slate-600">Total Entreprises</h3>
            <Store className="w-5 h-5 text-indigo-600" />
          </div>
          <p className="text-3xl font-bold text-slate-900">{stats.totalBusinesses}</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-slate-600">Abonnements Actifs</h3>
            <Users className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-slate-900">{stats.activeSubscriptions}</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-slate-600">Revenu Mensuel</h3>
            <DollarSign className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-3xl font-bold text-slate-900">{stats.totalRevenue}€</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-slate-600">Note Moyenne</h3>
            <Star className="w-5 h-5 text-yellow-500" />
          </div>
          <p className="text-3xl font-bold text-slate-900">{stats.avgRating.toFixed(1)}</p>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 mb-6">
        <div className="flex gap-2 p-4 border-b border-slate-200">
          {['all', 'free', 'pro', 'premium'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                filter === f
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {f === 'all' ? 'Tous' : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Tableau */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">
                  Entreprise
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">
                  Type
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">
                  Email
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">
                  Forfait
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">
                  Statut
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">
                  Inscription
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBusinesses.map((business) => (
                <tr key={business.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900">{business.name || 'Sans nom'}</div>
                    <div className="text-sm text-slate-500">{business.city || 'Ville inconnue'}</div>
                  </td>
                  
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {business.type || 'Non spécifié'}
                  </td>
                  
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {business.email || 'Non renseigné'}
                  </td>
                  
                  <td className="px-6 py-4">
                    <select
                      value={business.plan || 'free'}
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
                      onClick={() => toggleStatus(business.id, business.subscription_status)}
                      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium ${
                        business.subscription_status === 'active'
                          ? 'bg-green-50 text-green-700'
                          : 'bg-red-50 text-red-700'
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
                  
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {business.created_at 
                      ? new Date(business.created_at).toLocaleDateString('fr-FR')
                      : 'N/A'
                    }
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
