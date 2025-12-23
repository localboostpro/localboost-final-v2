import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { 
  Building2, 
  Users, 
  Star, 
  MessageSquare, 
  TrendingUp,
  Calendar,
  Filter,
  Download
} from 'lucide-react';

export default function Admin() {
  const [stats, setStats] = useState({
    totalBusinesses: 0,
    totalCustomers: 0,
    totalReviews: 0,
    averageRating: 0,
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d'); // 7d, 30d, 90d, all

  useEffect(() => {
    loadAdminData();
  }, [timeRange]);

  async function loadAdminData() {
    try {
      // Get all businesses
      const { data: businesses, error: bizError } = await supabase
        .from('businesses')
        .select('*');

      if (bizError) throw bizError;

      // Get all customers
      const { data: customers, error: custError } = await supabase
        .from('customers')
        .select('*');

      if (custError) throw custError;

      // Get all reviews
      const { data: reviews, error: revError } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (revError) throw revError;

      // Calculate stats
      const totalReviews = reviews?.length || 0;
      const averageRating = totalReviews > 0
        ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / totalReviews).toFixed(1)
        : 0;

      // Get recent activity (last 10 reviews)
      const recentActivity = reviews?.slice(0, 10) || [];

      setStats({
        totalBusinesses: businesses?.length || 0,
        totalCustomers: customers?.length || 0,
        totalReviews,
        averageRating,
        recentActivity
      });
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  }

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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Administration</h1>
          <p className="mt-2 text-gray-600">Vue d'ensemble de la plateforme</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="7d">7 derniers jours</option>
            <option value="30d">30 derniers jours</option>
            <option value="90d">90 derniers jours</option>
            <option value="all">Tout</option>
          </select>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Download className="w-4 h-4" />
            Exporter
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Commerces"
          value={stats.totalBusinesses}
          icon={<Building2 className="w-6 h-6" />}
          color="blue"
          trend="+12%"
        />
        <StatCard
          title="Total Clients"
          value={stats.totalCustomers}
          icon={<Users className="w-6 h-6" />}
          color="green"
          trend="+8%"
        />
        <StatCard
          title="Total Avis"
          value={stats.totalReviews}
          icon={<MessageSquare className="w-6 h-6" />}
          color="purple"
          trend="+15%"
        />
        <StatCard
          title="Note Moyenne"
          value={stats.averageRating}
          icon={<Star className="w-6 h-6" />}
          color="yellow"
          suffix="/5"
        />
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Activité Récente</h2>
          <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
            Voir tout →
          </button>
        </div>

        {stats.recentActivity.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Aucune activité récente</p>
          </div>
        ) : (
          <div className="space-y-4">
            {stats.recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                    {(activity.author || 'A')[0].toUpperCase()}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-900">
                      {activity.author || 'Anonyme'}
                    </span>
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${
                            i < (activity.rating || 5)
                              ? 'text-yellow-400 fill-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        activity.status === 'approved'
                          ? 'bg-green-100 text-green-800'
                          : activity.status === 'rejected'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {activity.status}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm line-clamp-2">
                    {activity.text || 'Pas de commentaire'}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Calendar className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-gray-500">
                      {new Date(activity.created_at).toLocaleDateString('fr-FR')}
                    </span>
                    {activity.platform && (
                      <span className="px-2 py-0.5 bg-white rounded text-xs text-gray-600 border border-gray-200">
                        {activity.platform}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color, trend, suffix = '' }) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600'
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
        {trend && (
          <span className="flex items-center gap-1 text-green-600 text-sm font-medium">
            <TrendingUp className="w-4 h-4" />
            {trend}
          </span>
        )}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
        <p className="text-3xl font-bold text-gray-900">
          {value}{suffix}
        </p>
      </div>
    </div>
  );
}
