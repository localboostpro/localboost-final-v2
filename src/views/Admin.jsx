import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  AlertCircle,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Calendar,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

export default function Admin() {
  const [businesses, setBusinesses] = useState([]);
  const [stats, setStats] = useState({
    totalClients: 0,
    activeSubscriptions: 0,
    trialUsers: 0,
    mrr: 0,
    growth: 0
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterTier, setFilterTier] = useState('all');
  const [loading, setLoading] = useState(true);
  const [selectedBusiness, setSelectedBusiness] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    setLoading(true);
    
    try {
      // Récupérer tous les clients
      const { data: clientsData, error } = await supabase
        .from('businesses')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setBusinesses(clientsData || []);

      // Calculer les statistiques
      const totalClients = clientsData?.length || 0;
      const activeSubscriptions = clientsData?.filter(
        b => b.subscription_status === 'active'
      ).length || 0;
      const trialUsers = clientsData?.filter(
        b => b.subscription_status === 'trial'
      ).length || 0;
      const mrr = clientsData
        ?.filter(b => b.subscription_status === 'active')
        .reduce((sum, b) => sum + (b.monthly_price || 0), 0) || 0;

      // Calculer la croissance (simplifié - à améliorer)
      const growth = totalClients > 0 ? 12.5 : 0;

      setStats({
        totalClients,
        activeSubscriptions,
        trialUsers,
        mrr: Math.round(mrr),
        growth
      });

    } catch (error) {
      console.error('Erreur fetch données admin:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredBusinesses = businesses.filter(b => {
    const matchesSearch = 
      b.business_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.email?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || b.subscription_status === filterStatus;
    const matchesTier = filterTier === 'all' || b.subscription_tier === filterTier;
    
    return matchesSearch && matchesStatus && matchesTier;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard Admin</h1>
              <p className="text-sm text-gray-600">Gérez vos clients LocalBoost Pro</p>
            </div>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Nouveau Client
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <StatCard
            icon={<Users className="w-5 h-5 text-blue-600" />}
            label="Total Clients"
            value={stats.totalClients}
            trend={`+${stats.growth}%`}
            trendUp={true}
            bgColor="bg-blue-50"
          />
          <StatCard
            icon={<CheckCircle className="w-5 h-5 text-green-600" />}
            label="Abonnés Actifs"
            value={stats.activeSubscriptions}
            bgColor="bg-green-50"
          />
          <StatCard
            icon={<Calendar className="w-5 h-5 text-yellow-600" />}
            label="En Essai"
            value={stats.trialUsers}
            bgColor="bg-yellow-50"
          />
          <StatCard
            icon={<DollarSign className="w-5 h-5 text-purple-600" />}
            label="MRR"
            value={`${stats.mrr}€`}
            trend="+8%"
            trendUp={true}
            bgColor="bg-purple-50"
          />
          <StatCard
            icon={<TrendingUp className="w-5 h-5 text-indigo-600" />}
            label="Taux de Conversion"
            value="67%"
            trend="+5%"
            trendUp={true}
            bgColor="bg-indigo-50"
          />
        </div>

        {/* Filtres */}
        <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Recherche */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher par nom, ville, email..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Filtre statut */}
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">Tous les statuts</option>
              <option value="trial">En essai</option>
              <option value="active">Actifs</option>
              <option value="paused">En pause</option>
              <option value="cancelled">Annulés</option>
            </select>

            {/* Filtre tier */}
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={filterTier}
              onChange={(e) => setFilterTier(e.target.value)}
            >
              <option value="all">Tous les plans</option>
              <option value="free">Free</option>
              <option value="starter">Starter</option>
              <option value="pro">Pro</option>
              <option value="premium">Premium</option>
            </select>
          </div>
        </div>

        {/* Table des clients */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Commerce
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ville
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Abonnement
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Prix/mois
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Inscription
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredBusinesses.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                      <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                      <p>Aucun client trouvé</p>
                    </td>
                  </tr>
                ) : (
                  filteredBusinesses.map((business) => (
                    <tr key={business.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          {business.logo_url ? (
                            <img 
                              src={business.logo_url} 
                              alt={business.business_name}
                              className="w-10 h-10 rounded-lg object-cover mr-3" 
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center mr-3">
                              <span className="text-white font-bold text-lg">
                                {business.business_name?.[0]?.toUpperCase()}
                              </span>
                            </div>
                          )}
                          <div>
                            <div className="font-medium text-gray-900">{business.business_name}</div>
                            <div className="text-sm text-gray-500">{business.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 capitalize">
                        {business.business_type || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{business.city || '-'}</td>
                      <td className="px-6 py-4">
                        <TierBadge tier={business.subscription_tier} />
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {business.monthly_price}€
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={business.subscription_status} />
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(business.created_at).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            className="p-2 text-gray-400 hover:text-blue-600 transition"
                            title="Voir détails"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            className="p-2 text-gray-400 hover:text-gray-600 transition"
                            title="Modifier"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            className="p-2 text-gray-400 hover:text-red-600 transition"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// =====================================================
// COMPOSANTS AUXILIAIRES
// =====================================================

function StatCard({ icon, label, value, trend, trendUp, bgColor }) {
  return (
    <div className={`${bgColor} rounded-lg p-4 border border-gray-200`}>
      <div className="flex items-center justify-between mb-2">
        <div className="p-2 bg-white rounded-lg">
          {icon}
        </div>
        {trend && (
          <div className={`flex items-center text-xs font-medium ${trendUp ? 'text-green-600' : 'text-red-600'}`}>
            {trendUp ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
            {trend}
          </div>
        )}
      </div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-sm text-gray-600">{label}</div>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    trial: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    active: 'bg-green-100 text-green-800 border-green-200',
    paused: 'bg-orange-100 text-orange-800 border-orange-200',
    cancelled: 'bg-red-100 text-red-800 border-red-200'
  };

  const labels = {
    trial: 'Essai',
    active: 'Actif',
    paused: 'Pause',
    cancelled: 'Annulé'
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
      {labels[status] || status}
    </span>
  );
}

function TierBadge({ tier }) {
  const styles = {
    free: 'bg-gray-100 text-gray-800 border-gray-200',
    starter: 'bg-blue-100 text-blue-800 border-blue-200',
    pro: 'bg-purple-100 text-purple-800 border-purple-200',
    premium: 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-yellow-300'
  };

  const labels = {
    free: 'Free',
    starter: 'Starter',
    pro: 'Pro',
    premium: 'Premium'
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${styles[tier] || 'bg-gray-100 text-gray-800'}`}>
      {labels[tier] || tier}
    </span>
  );
}
