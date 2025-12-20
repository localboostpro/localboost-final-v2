export const PLANS = {
  basic: {
    label: "Starter",
    price: 0,
    features: {
      can_access_marketing: true,
      max_customers: 20,
      ai_generations: 5
    }
  },
  premium: {
    label: "Premium",
    price: 29,
    features: {
      can_access_marketing: true,
      max_customers: 1000,
      ai_generations: 100
    }
  }
};

export function getPlanConfig(tier) {
  return PLANS[tier] || PLANS.basic;
}
