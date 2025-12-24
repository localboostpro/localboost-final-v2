// src/lib/plans.js

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
      aiPosts: -1,
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
      'Widgets personnalisés (horaires, menus, galeries)',
      'SEO optimisé + Analytics Google',
      'SMS illimités',
      'Support VIP 24/7'
    ],
    limits: {
      marketingStudio: true,
      landingPage: true,
      aiPosts: -1,
      smsPerMonth: -1
    }
  }
};

// ✅ Vérifier si un utilisateur peut accéder à une fonctionnalité
export function canAccessFeature(userPlan, feature) {
  const plan = PLANS[userPlan] || PLANS.basic;
  
  switch(feature) {
    case 'marketingStudio':
      return plan.limits.marketingStudio;
    case 'landingPage':
      return plan.limits.landingPage;
    case 'aiPosts':
      return plan.limits.aiPosts !== 0;
    default:
      return true;
  }
}

// ✅ Obtenir le forfait requis pour une fonctionnalité
export function getRequiredPlan(feature) {
  switch(feature) {
    case 'marketingStudio':
      return 'pro';
    case 'landingPage':
      return 'premium';
    default:
      return 'basic';
  }
}

// ✅ Obtenir le badge visuel d'un forfait
export function getPlanBadge(planKey) {
  const plan = PLANS[planKey] || PLANS.basic;
  return {
    label: plan.name,
    icon: plan.icon,
    color: plan.color
  };
}

// ✅ Obtenir le prix d'un forfait
export function getPlanPrice(planKey) {
  const plan = PLANS[planKey] || PLANS.basic;
  return plan.price;
}

// ✅ Obtenir le label/nom d'un forfait (FONCTION MANQUANTE)
export function getPlanLabel(planKey) {
  const plan = PLANS[planKey] || PLANS.basic;
  return plan.name;
}

// ✅ Obtenir le nom d'une fonctionnalité en français
export function getFeatureName(feature) {
  const names = {
    'marketingStudio': 'Studio Marketing',
    'landingPage': 'Page Établissement',
    'aiPosts': 'Posts IA illimités'
  };
  return names[feature] || feature;
}

// ✅ Obtenir tous les forfaits (pour affichage de pricing)
export function getAllPlans() {
  return Object.entries(PLANS).map(([key, plan]) => ({
    id: key,
    ...plan
  }));
}

// ✅ Obtenir les détails complets d'un forfait
export function getPlanDetails(planKey) {
  return PLANS[planKey] || PLANS.basic;
}
