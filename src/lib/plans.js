export const PLANS = {
  basic: {
    name: "Basic",
    price: "Essai 7 jours gratuit",
    priceValue: 0,
    trialDays: 7,
    features: ["✅ Essai Premium 7 jours gratuit", "✅ Page vitrine basique", "✅ Gestion des avis clients", "✅ Tableau de bord", "✅ Support email"]
  },
  pro: {
    name: "Pro",
    price: "59€/mois",
    priceValue: 59,
    trialDays: 0,
    features: ["✅ Tout du Basic", "✅ Accès Marketing Studio", "✅ Campagnes SMS automatisées", "✅ Analytics avancées", "✅ Collecte d'avis automatisée", "✅ Support prioritaire"]
  },
  premium: {
    name: "Premium", 
    price: "99€/mois",
    priceValue: 99,
    trialDays: 0,
    features: ["✅ Tout du Pro", "✅ Page établissement personnalisée", "✅ Outils marketing complets", "✅ Centre d'appels automatisé", "✅ Intégrations avancées", "✅ API complète", "✅ Support VIP 24/7"]
  }
};

export function getPlanPrice(planName) {
  const safeName = (planName || 'basic').toLowerCase();
  const plan = PLANS[safeName] || PLANS.basic;
  return { price: plan.price, value: plan.priceValue };
}

export function getPlanLabel(planName) {
  const safeName = (planName || 'basic').toLowerCase();
  return (PLANS[safeName] || PLANS.basic).name;
}

export function getPlanBadge(plan) {
  const safePlan = (plan || 'basic').toLowerCase();
  const planData = PLANS[safePlan] || PLANS.basic;
  const colors = { basic: 'bg-slate-100 text-slate-700', pro: 'bg-blue-100 text-blue-700', premium: 'bg-amber-100 text-amber-700' };
  return { ...planData, color: colors[safePlan] || colors.basic };
}
