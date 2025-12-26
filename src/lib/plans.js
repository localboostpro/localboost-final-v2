export const PLANS = {
  basic: {
    name: "Basic",
    price: "Gratuit 7 jours",
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
    price: "59€",
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
    price: "99€",
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

// Fonction utilitaire pour obtenir le plan avec fallback
export function getPlan(planName) {
  const safeName = (planName || 'basic').toLowerCase();
  return PLANS[safeName] || PLANS.basic;
}

export function getPlanPrice(planName) {
  const plan = getPlan(planName);
  return { price: plan.price, value: plan.priceValue };
}

export function getPlanLabel(planName) {
  return getPlan(planName).name;
}

// Vérifier si un plan est valide
export function isValidPlan(planName) {
  return Object.keys(PLANS).includes((planName || '').toLowerCase());
}
