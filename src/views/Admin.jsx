import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { 
  Building2, 
  Users, 
  TrendingUp,
  Search,
  Filter,
  MoreVertical,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  Calendar,
  Mail,
  Phone,
  Globe,
  Star,
  MessageSquare
} from 'lucide-react';

export default function Admin() {
  const [activeTab, setActiveTab] = useState('overview'); // overview, businesses, clients, reviews
  const [businesses, setBusinesses] = useState([]);
  const [stats, setStats] = useState({
    totalBusinesses: 0,
    activeSubscriptions: 0,
    trialUsers: 0,
    mrr: 0,
    growth: 0
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterTier, setFilterTier] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    try {
      // Fetch businesses with their subscription info
      const { data: bizData, error: bizError } = await supabase
        .from('businesses')
        .select(`
          *,
          subscription_tier,
          subscription_status,
          subscription_start_date,
          subscription_end_date
        `)
        .order('created_at', { ascending: false });

      if (bizError) throw bizError;

      setBusinesses(bizData || []);

      // Calculate stats
      const active = bizData?.filter(b => b.subscription_status === 'active').length || 0;
      const trial = bizData?.filter(b => b.subscription_status === 'trial').length || 0;

      setStats({
        totalBusinesses: bizData?.length || 0,
        activeSubscriptions: active,
        trialUsers: trial,
        mrr: active * 49, // Simplified MRR calculation
        growth: 12 // Mock growth %
      });
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredBusinesses = businesses.filter(biz => {
    const matchesSearch = biz.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         biz.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || biz.subscription_status === filterStatus;
    const matchesTier = filterTier === 'all' || biz.subscription_tier === filterTier;
    return matchesSearch && matchesStatus && matchesTier;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Administration</h1>
        <p className="mt-2 text-gray-600">Gestion des commerces et abonnements</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <div className="flex gap-8">
          {[
            { id: 'overview', label: 'Vue d\'ensemble', icon: TrendingUp },
            { id: 'businesses', label: 'Commerces', icon: Building2 },
            { id: 'clients', label: 'Clients', icon: Users },
            { id: 'reviews', label: 'Avis', icon: MessageSquare }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 pb-4 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600 font-medium'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {activeTab === 'overview' && <OverviewTab stats={stats} />}
      {activeTab === 'businesses' && (
        <BusinessesTab
          businesses={filteredBusinesses}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
          filterTier={filterTier}
          setFilterTier={setFilterTier}
          onRefresh={fetchDashboardData}
        />
      )}
      {activeTab === 'clients' && <ClientsTab businesses={businesses} />}
      {activeTab === 'reviews' && <ReviewsTab />}
    </div>
  );
}

// Overview Tab
function OverviewTab({ stats }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        title="Total Commerces"
        value={stats.totalBusinesses}
        icon={<Building2 className="w-6 h-6" />}
        color="blue"
        trend={`+${stats.growth}%`}
      />
      <StatCard
        title="Abonnements Actifs"
        value={stats.activeSubscriptions}
        icon={<CheckCircle className="w-6 h-6" />}
        color="green"
      />
      <StatCard
        title="Utilisateurs Trial"
        value={stats.trialUsers}
        icon={<Clock className="w-6 h-6" />}
        color="yellow"
      />
      <StatCard
        title="MRR"
        value={`${stats.mrr}€`}
        icon={<DollarSign className="w-6 h-6" />}
        color="purple"
      />
    </div>
  );
}

// Businesses Tab
function BusinessesTab({ 
  businesses, 
  searchQuery, 
  setSearchQuery, 
  filterStatus, 
  setFilterStatus,
  filterTier,
  setFilterTier,
  onRefresh 
}) {
  return (
    <div>
      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher un commerce..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Tous statuts</option>
          <option value="active">Actif</option>
          <option value="trial">Trial</option>
          <option value="expired">Expiré</option>
        </select>
        <select
          value={filterTier}
          onChange={(e) => setFilterTier(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Tous forfaits</option>
          <option value="starter">Starter</option>
          <option value="pro">Pro</option>
          <option value="enterprise">Enterprise</option>
        </select>
      </div>

      {/* Businesses List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Commerce</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Forfait</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Clients</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Créé le</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {businesses.map(biz => (
              <tr key={biz.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                      {biz.name?.[0]?.toUpperCase() || 'B'}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{biz.name}</div>
                      <div className="text-sm text-gray-500">{biz.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    biz.subscription_tier === 'pro' ? 'bg-purple-100 text-purple-800' :
                    biz.subscription_tier === 'enterprise' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {biz.subscription_tier || 'Starter'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`flex items-center gap-1 w-fit px-3 py-1 rounded-full text-xs font-medium ${
                    biz.subscription_status === 'active' ? 'bg-green-100 text-green-800' :
                    biz.subscription_status === 'trial' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {biz.subscription_status === 'active' && <CheckCircle className="w-3 h-3" />}
                    {biz.subscription_status === 'trial' && <Clock className="w-3 h-3" />}
                    {biz.subscription_status === 'expired' && <XCircle className="w-3 h-3" />}
                    {biz.subscription_status || 'Trial'}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-900">{biz.customer_count || 0}</td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {new Date(biz.created_at).toLocaleDateString('fr-FR')}
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <MoreVertical className="w-4 h-4 text-gray-600" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Clients Tab
function ClientsTab({ businesses }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-bold mb-4">Liste des clients par commerce</h2>
      <p className="text-gray-600">Section en développement...</p>
    </div>
  );
}

// Reviews Tab
function ReviewsTab() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-bold mb-4">Modération des avis</h2>
      <p className="text-gray-600">Section en développement...</p>
    </div>
  );
}

// StatCard Component
function StatCard({ title, value, icon, color, trend }) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    purple: 'bg-purple-50 text-purple-600'
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
        {trend && (
          <span className="text-green-600 text-sm font-medium">{trend}</span>
        )}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}
