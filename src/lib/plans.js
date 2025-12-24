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
    price: planData.price,
    priceValue: planData.priceValue,
    features: planData.features || [],
    icon: icons[plan] || '⭐',
    trialDays: planData.trialDays || 0,
    color: colors[plan] || colors.basic
  };
}

export function hasFeature(plan, feature) {
  const hierarchy = {
    basic: ['basic'],
    pro: ['basic', 'pro'],
    premium: ['basic', 'pro', 'premium']
  };
  
  return hierarchy[plan]?.includes(feature) || false;
}

// ✅ FONCTION MANQUANTE POUR LE MENU
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
      path: "/establishment-page",
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
