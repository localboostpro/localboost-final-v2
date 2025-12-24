import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Building2, Star, Users, MessageSquare, MapPin, Calendar, Plus, Crown } from 'lucide-react';

export default function Commerces() {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBusinesses();
  }, []);

  async function loadBusinesses() {
    try {
      const { data, error } = await supabase
        .from('business_profile') // ✅ CORRECTION ICI
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Load stats for each business
      const businessesWithStats = await Promise.all(
        (data || []).map(async (business) => {
          // Get reviews
          const { data: reviews } = await supabase
            .from('posts')
            .select('rating')
            .eq('business_id', business.id);

          // Get customers
          const { data: customers } = await supabase
            .from('customers')
            .select('id')
            .eq('business_id', business.id);

          const reviewCount = reviews?.length || 0;
          const averageRating = reviewCount > 0
            ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviewCount).toFixed(1)
            : 0;

          return {
            ...business,
            reviewCount,
            averageRating,
            customerCount: customers?.length || 0
          };
        })
      );

      setBusinesses(businessesWithStats);
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
          <h1 className="text-3xl font-bold text-gray-900">Commerces</h1>
          <p className="mt-2 text-gray-600">{businesses.length} commerces enregistrés</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
          <Plus className="w-5 h-5" />
          Ajouter un commerce
        </button>
      </div>

      {/* Businesses Grid */}
      {businesses.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Aucun commerce enregistré</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {businesses.map((business) => (
            <BusinessCard key={business.id} business={business} />
          ))}
        </div>
      )}
    </div>
  );
}

function BusinessCard({ business }) {
  // 🎯 Helper pour afficher le badge du forfait
  const getPlanBadge = () => {
    const planConfig = {
      premium: { label: 'Premium', color: 'bg-purple-100 text-purple-700', icon: '👑' },
      pro: { label: 'Pro', color: 'bg-blue-100 text-blue-700', icon: '⭐' },
      basic: { label: 'Basic', color: 'bg-green-100 text-green-700', icon: '✓' },
      free: { label: 'Gratuit', color: 'bg-gray-100 text-gray-700', icon: '🎁' }
    };

    const plan = business.plan || 'free';
    const config = planConfig[plan] || planConfig.free;

    return (
      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <span>{config.icon}</span>
        <span>{config.label}</span>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all group">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="p-3 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
              <Building2 className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                {business.company_name || business.name}
              </h3>
              <p className="text-sm text-gray-500">{business.type || 'Commerce'}</p>
            </div>
          </div>
          {getPlanBadge()}
        </div>
      </div>

      {/* Location */}
      {(business.city || business.location) && (
        <div className="flex items-center gap-2 text-gray-600 mb-4">
          <MapPin className="w-4 h-4 flex-shrink-0" />
          <span className="text-sm truncate">{business.city || business.location}</span>
        </div>
      )}

      {/* Subscription Price */}
      {business.subscription_price > 0 && (
        <div className="text-sm font-medium text-gray-700 mb-4">
          💰 {business.subscription_price}€/mois
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-yellow-500 mb-1">
            <Star className="w-4 h-4 fill-current" />
            <span className="font-semibold">{business.averageRating}</span>
          </div>
          <p className="text-xs text-gray-500">Note</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <MessageSquare className="w-4 h-4 text-blue-600" />
            <span className="font-semibold text-gray-900">{business.reviewCount}</span>
          </div>
          <p className="text-xs text-gray-500">Avis</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Users className="w-4 h-4 text-green-600" />
            <span className="font-semibold text-gray-900">{business.customerCount}</span>
          </div>
          <p className="text-xs text-gray-500">Clients</p>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100 text-gray-500 text-xs">
        <Calendar className="w-4 h-4" />
        Créé le {new Date(business.created_at).toLocaleDateString('fr-FR')}
      </div>
    </div>
  );
}
