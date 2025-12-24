export const PLANS = {
  basic: {
    name: 'Basic',
    price: 29,
    trial_days: 7,
    features: [
      'Collecte d\'avis illimitée',
      'QR Code personnalisé',
      'Gestion clients illimitée',
      'Analytics basiques',
      'Support Email + Chat'
    ],
    limits: {
      marketing_studio: false,
      landing_page: false,
      ai_posts: 0
    }
  },
  pro: {
    name: 'Pro',
    price: 59,
    trial_days: 0,
    features: [
      'Tout du Basic +',
      '🎨 Studio Marketing complet',
      'Génération posts IA illimitée',
      'Publication auto (Facebook + Instagram)',
      '+ 50 templates professionnels',
      'Analytics avancés',
      'Support prioritaire'
    ],
    limits: {
      marketing_studio: true,
      landing_page: false,
      ai_posts: -1 // -1 = illimité
    }
  },
  premium: {
    name: 'Premium',
    price: 99,
    trial_days: 0,
    features: [
      'Tout du Pro +',
      '🌐 Page établissement complète',
      'Site web avec domaine personnalisé',
      'Templates premium exclusifs',
      'Widgets personnalisés',
      'SEO optimisé',
      'Analytics complets',
      'Account Manager dédié'
    ],
    limits: {
      marketing_studio: true,
      landing_page: true,
      ai_posts: -1
    }
  }
};

// Helper pour vérifier les accès
export const canAccessFeature = (userPlan, feature) => {
  const plan = PLANS[userPlan] || PLANS.basic;
  return plan.limits[feature] === true || plan.limits[feature] === -1;
};

// Helper pour afficher le badge
export const getPlanBadge = (plan) => {
  const badges = {
    basic: { icon: '⭐', label: 'Basic', color: 'amber' },
    pro: { icon: '⚡', label: 'Pro', color: 'blue' },
    premium: { icon: '💎', label: 'Premium', color: 'purple' }
  };
  return badges[plan] || badges.basic;
};
