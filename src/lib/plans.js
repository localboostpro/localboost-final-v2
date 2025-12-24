export const PLANS = {
  basic: {
    name: 'Basic',
    price: 29,
    trialDays: 7,
    icon: '⭐',
    color: 'blue',
    features: [
      'Collecte d\'avis illimitée',
      'QR Code personnalisé',
      'Gestion clients illimitée',
      'Analytics basiques',
      'Support Email + Chat'
    ],
    limits: {
      marketingStudio: false,
      landingPage: false,
      aiPosts: 0,
      smsPerMonth: 0
    }
  },
  pro: {
    name: 'Pro',
    price: 59,
    trialDays: 0,
    icon: '⚡',
    color: 'purple',
    features: [
      'Tout du Basic',
      '🎨 Studio Marketing complet',
      'Génération posts IA illimitée',
      'Publication auto (Facebook + Instagram)',
      '+ 50 templates professionnels',
      'Analytics avancés',
      'Support prioritaire'
    ],
    limits: {
      marketingStudio: true,
      landingPage: false,
      aiPosts: -1, // -1 = illimité
      smsPerMonth: 100
    }
  },
  premium: {
    name: 'Premium',
    price: 99,
    trialDays: 0,
    icon: '💎',
    color: 'indigo',
    features: [
      'Tout du Pro',
      '🌐 Page établissement complète',
      'Site web avec domaine personnalisé',
      'Templates premium exclusifs',
      'Widgets personnalisés (horaires, menus, galerie)',
      'SEO optimisé',
      'Analytics complets',
      'Account Manager dédié'
    ],
    limits: {
      marketingStudio: true,
      landingPage: true,
      aiPosts: -1,
      smsPerMonth: 500
    }
  }
};

// Helper : Vérifier si l'utilisateur peut accéder à une fonctionnalité
export const canAccessFeature = (userPlan, feature) => {
  const plan = PLANS[userPlan] || PLANS.basic;
  const limit = plan.limits[feature];
  return limit === true || limit === -1 || (typeof limit === 'number' && limit > 0);
};

// Helper : Obtenir le forfait requis pour une fonctionnalité
export const getRequiredPlan = (feature) => {
  if (feature === 'marketingStudio') return 'pro';
  if (feature === 'landingPage') return 'premium';
  return 'basic';
};

// Helper : Afficher le badge du forfait
export const getPlanBadge = (plan) => {
  const planData = PLANS[plan] || PLANS.basic;
  return {
    icon: planData.icon,
    name: planData.name,
    color: planData.color,
    price: planData.price
  };
};
