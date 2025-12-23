import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Star, TrendingUp, Users, MessageSquare, Calendar, MapPin } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalReviews: 0,
    averageRating: 0,
    totalCustomers: 0,
    recentReviews: []
  });
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      // ✅ GET USER FROM SESSION
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Load user profile
      const { data: profileData, error: profileError } = await supabase
        .from('business_profile')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);

      // Load reviews
      const { data: reviews, error: reviewsError } = await supabase
        .from('posts')
        .select('*')
        .eq('business_id', profileData.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (reviewsError) throw reviewsError;

      // Calculate stats
      const totalReviews = reviews.length;
      const averageRating = totalReviews > 0
        ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / totalReviews).toFixed(1)
        : 0;

      // Get unique customers
      const { data: customers } = await supabase
        .from('customers')
        .select('id')
        .eq('business_id', profileData.id);

      setStats({
        totalReviews,
        averageRating,
        totalCustomers: customers?.length || 0,
        recentReviews: reviews
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Tableau de bord</h1>
        <p className="mt-2 text-gray-600">
          Bienvenue, {profile?.name || 'Utilisateur'}
        </p>
      </div>

      {/* Business Info Card */}
      {profile && (
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-lg p-6 mb-8 text-white">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">{profile.name}</h2>
              {profile.location && (
                <div className="flex items-center gap-2 text-blue-100">
                  <MapPin className="w-4 h-4" />
                  <span>{profile.location}</span>
                </div>
              )}
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{stats.averageRating}</div>
              <div className="text-blue-100 text-sm">Note moyenne</div>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Total Avis"
          value={stats.totalReviews}
          icon={<MessageSquare className="w-6 h-6" />}
          color="blue"
          trend="+12%"
        />
        <StatCard
          title="Note Moyenne"
          value={stats.averageRating}
          icon={<Star className="w-6 h-6" />}
          color="yellow"
          suffix="/5"
        />
        <StatCard
          title="Total Clients"
          value={stats.totalCustomers}
          icon={<Users className="w-6 h-6" />}
          color="green"
          trend="+8%"
        />
      </div>

      {/* Recent Reviews */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Avis Récents</h2>
          <a
            href="/reviews"
            className="text-blue-600 hover:text-blue-700 font-medium text-sm"
          >
            Voir tous →
          </a>
        </div>

        {stats.recentReviews.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Aucun avis pour le moment</p>
          </div>
        ) : (
          <div className="space-y-4">
            {stats.recentReviews.map((review) => (
              <div
                key={review.id}
                className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                    {(review.author || 'A')[0].toUpperCase()}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-900">
                      {review.author || 'Anonyme'}
                    </span>
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${
                            i < (review.rating || 5)
                              ? 'text-yellow-400 fill-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm line-clamp-2">
                    {review.text || 'Pas de commentaire'}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Calendar className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-gray-500">
                      {new Date(review.created_at).toLocaleDateString('fr-FR')}
                    </span>
                    {review.platform && (
                      <span className="px-2 py-0.5 bg-white rounded text-xs text-gray-600 border border-gray-200">
                        {review.platform}
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
