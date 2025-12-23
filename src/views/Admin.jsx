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
  MoreVertical,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw
} from 'lucide-react';

export default function AdminDashboard() {
  const [businesses, setBusinesses] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    revenue: 0,
    growth: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Charger les données
  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);

      // Récupérer les commerces avec leurs stats
      const { data: businessData, error: bizError } = await supabase
        .from('businesses')
        .select(`
          *,
          business_stats(posts_generated, images_generated, engagement_rate)
        `)
        .order('created_at', { ascending: false });

      if (bizError) throw bizError;

      setBusinesses(businessData || []);

      // Calculer les statistiques
      const total = businessData?.length || 0;
      const active = businessData?.filter(b => b.status === 'active').length || 0;
      const revenue = businessData?.reduce((sum, b) => sum + (parseFloat(b.price) || 0), 0);

      setStats({
        total,
        active,
        revenue,
        growth: total > 0 ? ((active / total) * 100).toFixed(1) : 0
      });

    } catch (error) {
      console.error('Erreur chargement admin:', error);
      alert('Erreur: ' + error.message);
    } finally {
      setLoading(false);
    }
  }

  // Filtrer les commerces
  const filteredBusinesses = businesses.filter(biz => {
    const matchSearch = biz.business_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       biz.city?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === 'all' || biz.status === filterStatus;
    return matchSearch && matchStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Gestion des commerces et abonnements</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={<Users className="w-6 h-6" />}
          title="Total Commerces"
          value={stats.total}
          trend={`${stats.growth}%`}
          trendUp={stats.growth > 50}
          color="blue"
        />
        <StatCard
          icon={<CheckCircle className="w-6 h-6" />}
          title="Actifs"
          value={stats.active}
          trend={`${((stats.active / stats.total) * 100).toFixed(0)}%`}
          trendUp={true}
          color="green"
        />
        <StatCard
          icon={<DollarSign className="w-6 h-6" />}
          title="Revenus Mensuels"
          value={`${stats.revenue.toFixed(2)}€`}
          trend="+12%"
          trendUp={true}
          color="purple"
        />
        <StatCard
          icon={<TrendingUp className="w-6 h-6" />}
          title="Taux de conversion"
          value="68%"
          trend="+5%"
          trendUp={true}
          color="orange"
        />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un commerce ou une ville..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tous les statuts</option>
            <option value="active">Actifs</option>
            <option value="trial">Essai</option>
            <option value="inactive">Inactifs</option>
          </select>
          <button
            onClick={fetchData}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Actualiser
          </button>
        </div>
      </div>

      {/* Businesses Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Commerce
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ville
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Plan
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Statut
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stats
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Prix
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredBusinesses.map((biz) => (
              <tr key={biz.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-bold text-sm">
                        {biz.business_name?.charAt(0)}
                      </span>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {biz.business_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {biz.business_type}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {biz.city}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <PlanBadge plan={biz.plan} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge status={biz.status} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {biz.business_stats?.[0] ? (
                    <div className="flex gap-4">
                      <span>📝 {biz.business_stats[0].posts_generated}</span>
                      <span>🖼️ {biz.business_stats[0].images_generated}</span>
                    </div>
                  ) : (
                    <span className="text-gray-400">Aucune stats</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {biz.price}€/mois
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button className="text-gray-400 hover:text-gray-600">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredBusinesses.length === 0 && (
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Aucun commerce trouvé</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Composants auxiliaires
function StatCard({ icon, title, value, trend, trendUp, color }) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600'
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
        <div className={`flex items-center text-sm font-medium ${trendUp ? 'text-green-600' : 'text-red-600'}`}>
          {trendUp ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
          {trend}
        </div>
      </div>
      <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
      <p className="text-sm text-gray-600 mt-1">{title}</p>
    </div>
  );
}

function PlanBadge({ plan }) {
  const styles = {
    starter: 'bg-blue-100 text-blue-800 border-blue-200',
    pro: 'bg-purple-100 text-purple-800 border-purple-200',
    premium: 'bg-yellow-100 text-yellow-800 border-yellow-200'
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${styles[plan] || 'bg-gray-100 text-gray-800'}`}>
      {plan?.toUpperCase()}
    </span>
  );
}

function StatusBadge({ status }) {
  const styles = {
    active: 'bg-green-100 text-green-800 border-green-200',
    trial: 'bg-blue-100 text-blue-800 border-blue-200',
    inactive: 'bg-gray-100 text-gray-800 border-gray-200',
    cancelled: 'bg-red-100 text-red-800 border-red-200'
  };

  const labels = {
    active: 'Actif',
    trial: 'Essai',
    inactive: 'Inactif',
    cancelled: 'Annulé'
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
      {labels[status] || status}
    </span>
  );
}
