import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  ShoppingBag, 
  Star,
  Calendar,
  DollarSign
} from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({
    totalReviews: 0,
    averageRating: 0,
    totalRevenue: 0,
    totalCustomers: 0,
    recentReviews: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }

      const { data: profileData } = await supabase
        .from('business_profile')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profileData) {
        setProfile(profileData);

        const { data: reviews } = await supabase
          .from('reviews')
          .select('*')
          .eq('business_id', profileData.id)
          .order('created_at', { ascending: false })
          .limit(5);

        const { data: customers } = await supabase
          .from('customers')
          .select('*')
          .eq('business_id', profileData.id);

        const avgRating = reviews?.length > 0
          ? reviews.reduce((acc, r) => acc + (r.rating || 0), 0) / reviews.length
          : 0;

        setStats({
          totalReviews: reviews?.length || 0,
          averageRating: avgRating.toFixed(1),
          totalRevenue: 320,
          totalCustomers: customers?.length || 0,
          recentReviews: reviews || []
        });
      }
    } catch (error) {
      console.error('Erreur chargement dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Admin</h1>
        <p className="text-gray-600 mt-2">
          Gérez vos commerces, avis et clients
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Avis Total"
          value={stats.totalReviews}
          icon={<Star className="w-6 h-6" />}
          color="blue"
        />
        <StatCard
          title="Note Moyenne"
          value={`${stats.averageRating}/5`}
          icon={<TrendingUp className="w-6 h-6" />}
          color="green"
        />
        <StatCard
          title="Clients"
          value={stats.totalCustomers}
          icon={<Users className="w-6 h-6" />}
          color="purple"
        />
        <StatCard
          title="MRR Total"
          value={`${stats.totalRevenue}€`}
          icon={<DollarSign className="w-6 h-6" />}
          color="orange"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-blue-600" />
          Vue d'ensemble
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => navigate('/commerces')}
            className="flex items-center gap-3 p-4 rounded-lg border-2 border-blue-100 hover:border-blue-300 hover:bg-blue-50 transition-all"
          >
            <ShoppingBag className="w-8 h-8 text-blue-600" />
            <div className="text-left">
              <div className="font-semibold text-gray-900">Commerces</div>
              <div className="text-sm text-gray-500">{stats.totalReviews} avis</div>
            </div>
          </button>

          <button
            onClick={() => navigate('/avis-clients')}
            className="flex items-center gap-3 p-4 rounded-lg border-2 border-green-100 hover:border-green-300 hover:bg-green-50 transition-all"
          >
            <Star className="w-8 h-8 text-green-600" />
            <div className="text-left">
              <div className="font-semibold text-gray-900">Avis</div>
              <div className="text-sm text-gray-500">Gérer les avis</div>
            </div>
          </button>

          <button
            onClick={() => navigate('/fichier-clients')}
            className="flex items-center gap-3 p-4 rounded-lg border-2 border-purple-100 hover:border-purple-300 hover:bg-purple-50 transition-all"
          >
            <Users className="w-8 h-8 text-purple-600" />
            <div className="text-left">
              <div className="font-semibold text-gray-900">Clients</div>
              <div className="text-sm text-gray-500">{stats.totalCustomers} clients</div>
            </div>
          </button>
        </div>
      </div>

      {/* Recent Reviews */}
      {stats.recentReviews.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            Derniers avis
          </h2>
          <div className="space-y-4">
            {stats.recentReviews.map((review) => (
              <div key={review.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Star className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{review.customer_name}</span>
                    <span className="text-yellow-500">{'★'.repeat(review.rating)}</span>
                  </div>
                  <p className="text-gray-600 text-sm">{review.comment}</p>
                  <span className="text-xs text-gray-400 mt-1">
                    {new Date(review.created_at).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value, icon, color }) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600'
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
