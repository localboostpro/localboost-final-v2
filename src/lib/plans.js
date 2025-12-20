export const PLANS = {
  basic: {
    label: "Starter",
    features: { can_access_marketing: true, max_customers: 20 }
  },
  premium: {
    label: "Premium",
    features: { can_access_marketing: true, max_customers: 1000 }
  }
};

export function getPlanConfig(tier) {
  return PLANS[tier] || PLANS.basic;
}
