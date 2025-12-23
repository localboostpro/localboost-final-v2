export const PLANS = {
  basic: {
    label: "Basic",
    name: "BASIC",
    price: 29,
    color: "blue",
    features: { 
      can_access_marketing: true, 
      max_customers: 20,
      max_reviews: 50,
      analytics: false
    }
  },
  pro: {
    label: "Pro",
    name: "PRO",
    price: 59,
    color: "purple",
    features: { 
      can_access_marketing: true, 
      max_customers: 500,
      max_reviews: 200,
      analytics: true
    }
  },
  premium: {
    label: "Premium",
    name: "PREMIUM",
    price: 99,
    color: "pink",
    features: { 
      can_access_marketing: true, 
      max_customers: 1000,
      max_reviews: -1, // illimité
      analytics: true,
      priority_support: true
    }
  }
};

export function getPlanConfig(tier) {
  return PLANS[tier?.toLowerCase()] || PLANS.basic;
}

export function getPlanPrice(tier) {
  const plan = getPlanConfig(tier);
  return plan.price;
}

export function getPlanLabel(tier) {
  const plan = getPlanConfig(tier);
  return plan.label;
}

export function canAccessFeature(tier, featureName) {
  const plan = getPlanConfig(tier);
  return plan.features[featureName] || false;
}
