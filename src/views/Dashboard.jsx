import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { canAccessFeature, getRequiredPlan, getPlanBadge } from '../lib/plans';
import UpgradeModal from '../components/UpgradeModal';
import { 
  Star, 
  TrendingUp, 
  Users, 
  MessageSquare, 
  Calendar, 
  MapPin,
  Sparkles,
  Globe,
  Megaphone,
  Lock,
  ChevronRight
} from 'lucide-react';

export default function Dashboard({ stats, posts, profile }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [upgradeModal, setUpgradeModal] = useState({ 
    isOpen: false, 
    feature: null, 
    requiredPlan: null 
  });

  // Si pas de stats passées en props, on affiche des valeurs par défaut
  const displayStats = stats || {
    clients: 0,
    reviews: 0,
    posts: 0
  };

  const recentReviews = posts?.filter(p => p.rating).slice(0, 5) || [];
  const averageRating = recentReviews.length > 0
    ? (recentReviews.reduce((sum, r) => sum + (r.rating || 0), 0) / recentReviews.length).toFixed(1)
    : 0;

  // Fonction pour gérer les clics sur les fonctionnalités premium
  const handleFeatureClick = (feature, redirectPath) => {
    if (!canAccessFeature(profile?.plan, feature)) {
      setUpgradeModal({
        isOpen: true,
        feature: feature,
        requiredPlan: getRequiredPlan(feature)
      });
      return false;
    }
    navigate(redirectPath);
    return true;
  };

  // Badge du plan actuel
  const currentPlanBadge = getPlanBadge(profile?.plan || 'basic');

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header avec badge du plan */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tableau de bord</h1>
          <p className="mt-2 text-gray-600">
            Bienvenue, {profile?.name || 'Utilisateur'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className={`px-4 py-2 rounded-full font-bold text-sm flex items-center gap-2 bg-gradient-to-r ${
            currentPlanBadge.color === 'blue' ? 'from-blue-500 to-blue-600' :
            currentPlanBadge.color === 'purple' ? 'from-purple-500 to-purple-600' :
            'from-indigo-500 to-purple-600'
          } text-white shadow-lg`}>
            <span>{currentPlanBadge.icon}</span>
            <span>{currentPlanBadge.name}</span>
          </div>
        </div>
      </div>

      {/* Business Info Card */}
      {profile && (
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-lg p-6 mb-8 text-white">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">{profile.name}</h2>
              <div className="flex items-center gap-2 text-blue-100">
                <MapPin className="w-4 h-4" />
                <span>{profile.address}</span>
              </div>
              <p className="mt-2 text-blue-100">{profile.category}</p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                <span className="text-3xl font-bold">{averageRating}</span>
              </div>
              <p className="text-blue-100 text-sm">{displayStats.reviews} avis</p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Clients"
          value={displayStats.clients}
          icon={<Users className="w-6 h-6" />}
          color="blue"
          trend="+12%"
        />
        <StatCard
          title="Note moyenne"
          value={averageRating}
          icon={<Star className="w-6 h-6" />}
          color="yellow"
          suffix="/5"
        />
        <StatCard
          title="Avis reçus"
          value={displayStats.reviews}
          icon={<MessageSquare className="w-6 h-6" />}
          color="green"
          trend="+8%"
        />
        <StatCard
          title="Publications"
          value={displayStats.posts}
          icon={<TrendingUp className="w-6 h-6" />}
          color="purple"
        />
      </div>

      {/* Actions rapides avec système de paywall */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Studio Marketing */}
        <ActionCard
          title="Studio Marketing"
          description="Créez des posts IA et publiez automatiquement"
          icon={<Megaphone className="w-6 h-6" />}
          color="purple"
          locked={!canAccessFeature(profile?.plan, 'marketingStudio')}
          badge={!canAccessFeature(profile?.plan, 'marketingStudio') ? 'PRO' : null}
          onClick={() => handleFeatureClick('marketingStudio', '/marketing')}
        />

        {/* Page Établissement */}
        <ActionCard
          title="Page Établissement"
          description="Gérez votre site web professionnel"
          icon={<Globe className="w-6 h-6" />}
          color="indigo"
          locked={!canAccessFeature(profile?.plan, 'landingPage')}
          badge={!canAccessFeature(profile?.plan, 'landingPage') ? 'PREMIUM' : null}
          onClick={() => handleFeatureClick('landingPage', '/website')}
        />
      </div>

      {/* Recent Reviews */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Avis récents</h3>
          <button 
            onClick={() => navigate('/reviews')}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
          >
            Voir tout <ChevronRight size={16} />
          </button>
        </div>

        {recentReviews.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Aucun avis pour le moment</p>
            <button 
              onClick={() => navigate('/reviews')}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
            >
              Collecter mes premiers avis
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {recentReviews.map((review) => (
              <div key={review.id} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                    {review.customer_name?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-gray-900">
                        {review.customer_name || 'Client anonyme'}
                      </span>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < (review.rating || 5)
                                ? 'text-yellow-400 fill-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm mb-2">
                      {review.text || 'Pas de commentaire'}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(review.created_at).toLocaleDateString('fr-FR')}
                      </div>
                      {review.platform && (
                        <span className="px-2 py-0.5 bg-gray-100 rounded text-gray-600">
                          {review.platform}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modale d'upgrade */}
      <UpgradeModal
        isOpen={upgradeModal.isOpen}
        onClose={() => setUpgradeModal({ isOpen: false, feature: null, requiredPlan: null })}
        requiredPlan={upgradeModal.requiredPlan}
        feature={upgradeModal.feature}
      />
    </div>
  );
}

// Composant StatCard
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

// Nouveau composant pour les actions rapides
function ActionCard({ title, description, icon, color, locked, badge, onClick }) {
  const colorClasses = {
    purple: 'from-purple-500 to-purple-600',
    indigo: 'from-indigo-500 to-indigo-600',
    blue: 'from-blue-500 to-blue-600'
  };

  return (
    <button
      onClick={onClick}
      className={`relative bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-left hover:shadow-md transition-all group ${
        locked ? 'opacity-75' : ''
      }`}
    >
      {/* Badge Premium/Pro */}
      {badge && (
        <div className="absolute top-4 right-4 px-3 py-1 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-bold rounded-full flex items-center gap-1">
          <Lock size={12} />
          {badge}
        </div>
      )}

      <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}>
        {icon}
      </div>

      <h3 className="text-lg font-bold text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>

      {locked && (
        <div className="mt-3 flex items-center gap-2 text-xs text-amber-600 font-medium">
          <Sparkles size={14} />
          <span>Cliquez pour débloquer</span>
        </div>
      )}
    </button>
  );
}
