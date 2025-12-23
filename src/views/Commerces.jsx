import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import {
  Building2,
  MapPin,
  Star,
  TrendingUp,
  Calendar,
  Euro,
  Plus,
  Search
} from 'lucide-react';

export default function Commerces() {
  const navigate = useNavigate();
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchBusinesses();
  }, []);

  const fetchBusinesses = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }

      const { data, error } = await supabase
        .from('business_profile')
        .select(`
          *,
          reviews:reviews(count),
          customers:customers(count)
        `)
        .eq('user_id', user.id);

      if (error) throw error;

      // Calculer les stats pour chaque commerce
      const businessesWithStats = await Promise.all(
        (data || []).map(async (business) => {
          const { data: reviews } = await supabase
            .from('reviews')
            .select('rating')
            .eq('business_id', business.id);

          const avgRating = reviews?.length > 0
            ? reviews.reduce((acc, r) => acc + (r.rating || 0), 0) / reviews.length
            : 0;

          return {
            ...business,
            reviewCount: reviews?.length || 0,
            averageRating: avgRating.toFixed(1),
            customerCount: business.customers?.[0]?.count || 0
          };
        })
      );

      setBusinesses(businessesWithStats);
    } catch (error) {
      console.error('Erreur chargement commerces:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredBusinesses = businesses.filter(business =>
    business.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    business.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    business.type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mes Commerces</h1>
          <p className="text-gray-600 mt-2">
            Gérez vos établissements et leurs performances
          </p>
        </div>
        <button
          onClick={() => navigate('/commerces/nouveau')}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nouveau commerce
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Rechercher un commerce..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Total Commerces"
          value={businesses.length}
          icon={<Building2 className="w-6 h-6" />}
          color="blue"
        />
        <StatCard
          title="Avis Total"
          value={businesses.reduce((acc, b) => acc + (b.reviewCount || 0), 0)}
          icon={<Star className="w-6 h-6" />}
          color="yellow"
        />
        <StatCard
          title="Clients Total"
          value={businesses.reduce((acc, b) => acc + (b.customerCount || 0), 0)}
          icon={<TrendingUp className="w-6 h-6" />}
          color="green"
        />
        <StatCard
          title="MRR Total"
          value="320€"
          icon={<Euro className="w-6 h-6" />}
          color="purple"
        />
      </div>

      {/* Business List */}
      {filteredBusinesses.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Aucun commerce trouvé
          </h3>
          <p className="text-gray-600 mb-6">
            {searchTerm
              ? "Aucun résultat pour votre recherche"
              : "Commencez par créer votre premier commerce"}
          </p>
          {!searchTerm && (
            <button
              onClick={() => navigate('/commerces/nouveau')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Créer un commerce
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBusinesses.map((business) => (
            <BusinessCard
              key={business.id}
              business={business}
              onClick={() => navigate(`/commerces/${business.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function BusinessCard({ business, onClick }) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
            <Building2 className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
              {business.name}
            </h3>
            <p className="text-sm text-gray-500">{business.type || 'Restaurant'}</p>
          </div>
        </div>
      </div>

      {/* Location */}
      {business.location && (
        <div className="flex items-center gap-2 text-gray-600 mb-4">
          <MapPin className="w-4 h-4" />
          <span className="text-sm">{business.location}</span>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-yellow-500 mb-1">
            <Star className="w-4 h-4 fill-current" />
            <span className="font-semibold">{business.averageRating}</span>
          </div>
          <p className="text-xs text-gray-500">Note moyenne</p>
        </div>
        <div className="text-center">
          <p className="font-semibold text-gray-900 mb-1">{business.reviewCount}</p>
          <p className="text-xs text-gray-500">Avis</p>
        </div>
        <div className="text-center">
          <p className="font-semibold text-gray-900 mb-1">{business.customerCount}</p>
          <p className="text-xs text-gray-500">Clients</p>
        </div>
      </div>

      {/* Created Date */}
      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100 text-gray-500 text-xs">
        <Calendar className="w-4 h-4" />
        Créé le {new Date(business.created_at).toLocaleDateString('fr-FR')}
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color }) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600'
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
