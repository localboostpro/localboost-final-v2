export const PLANS = {
  basic: {
    name: "Basic",
    price: "Essai 7 jours gratuit",
    priceValue: 0,
    trialDays: 7,
    features: [
      "✅ Essai Premium 7 jours gratuit",
      "✅ Page vitrine basique",
      "✅ Gestion des avis clients",
      "✅ Tableau de bord",
      "✅ Support email"
    ]
  },
  pro: {
    name: "Pro",
    price: "59€/mois",
    priceValue: 59,
    trialDays: 0,
    features: [
      "✅ Tout du Basic",
      "✅ Accès Marketing Studio",
      "✅ Campagnes SMS automatisées",
      "✅ Analytics avancées",
      "✅ Collecte d'avis automatisée",
      "✅ Support prioritaire"
    ]
  },
  premium: {
    name: "Premium", 
    price: "99€/mois",
    priceValue: 99,
    trialDays: 0,
    features: [
      "✅ Tout du Pro",
      "✅ Page établissement personnalisée",
      "✅ Outils marketing complets",
      "✅ Centre d'appels automatisé",
      "✅ Intégrations avancées",
      "✅ API complète",
      "✅ Support VIP 24/7"
    ]
  }
};

// ✅ FONCTION POUR OBTENIR LE BADGE DU PLAN
export function getPlanBadge(plan) {
  const planData = PLANS[plan] || PLANS.basic;
  
  const icons = {
    basic: '⭐',
    pro: '🚀',
    premium: '👑'
  };

  const colors = {
    basic: 'bg-slate-100 text-slate-700',
    pro: 'bg-blue-100 text-blue-700',
    premium: 'bg-amber-100 text-amber-700'
  };
  
  return {
    label: planData.name,
    name: planData.name,
    price: planData.price,
    priceValue: planData.priceValue,
    features: planData.features || [],
    icon: icons[plan] || '⭐',
    trialDays: planData.trialDays || 0,
    color: colors[plan] || colors.basic
  };
}

// ✅ MAPPING DES FEATURES VERS LES PLANS REQUIS
const FEATURE_PLAN_MAP = {
  'marketingStudio': 'pro',
  'landingPage': 'premium',
  'phoneCenter': 'premium',
  'advancedAnalytics': 'pro',
  'smsAutomation': 'pro',
  'apiAccess': 'premium',
  'customDomain': 'premium'
};

// ✅ FONCTION POUR VÉRIFIER SI UN UTILISATEUR PEUT ACCÉDER À UNE FEATURE
export function canAccessFeature(userPlan, feature) {
  const planHierarchy = {
    basic: 1,
    pro: 2,
    premium: 3
  };
  
  const requiredPlan = FEATURE_PLAN_MAP[feature] || 'basic';
  const userLevel = planHierarchy[userPlan] || 0;
  const requiredLevel = planHierarchy[requiredPlan] || 0;
  
  return userLevel >= requiredLevel;
}

// ✅ FONCTION POUR OBTENIR LE PLAN REQUIS POUR UNE FEATURE
export function getRequiredPlan(feature) {
  return FEATURE_PLAN_MAP[feature] || 'basic';
}

// ✅ FONCTION POUR OBTENIR LA HIÉRARCHIE DES PLANS
export function getPlanHierarchy() {
  return {
    basic: 1,
    pro: 2,
    premium: 3
  };
}

// ✅ FONCTION POUR COMPARER LES PLANS
export function isPlanHigherOrEqual(currentPlan, requiredPlan) {
  const hierarchy = getPlanHierarchy();
  return (hierarchy[currentPlan] || 0) >= (hierarchy[requiredPlan] || 0);
}

// ✅ FONCTION POUR OBTENIR LES ÉLÉMENTS DU MENU EN FONCTION DU PLAN
export function getMenuItems(plan) {
  const allItems = [
    {
      path: "/dashboard",
      label: "Tableau de bord",
      icon: "LayoutDashboard",
      plans: ["basic", "pro", "premium"]
    },
    {
      path: "/profile",
      label: "Mon Établissement",
      icon: "Building",
      plans: ["basic", "pro", "premium"]
    },
    {
      path: "/reviews",
      label: "Avis Clients",
      icon: "Star",
      plans: ["basic", "pro", "premium"]
    },
    {
      path: "/collect-reviews",
      label: "Collecter des Avis",
      icon: "MessageSquare",
      plans: ["basic", "pro", "premium"]
    },
    {
      path: "/marketing",
      label: "Studio Marketing",
      icon: "Megaphone",
      plans: ["pro", "premium"]
    },
    {
      path: "/website",
      label: "Ma Vitrine Web",
      icon: "Globe",
      plans: ["premium"]
    },
    {
      path: "/phone-center",
      label: "Centre d'Appels",
      icon: "Phone",
      plans: ["premium"]
    },
    {
      path: "/offers",
      label: "Offres & Promos",
      icon: "Tag",
      plans: ["pro", "premium"]
    }
  ];

  return allItems.filter(item => item.plans.includes(plan));
}
