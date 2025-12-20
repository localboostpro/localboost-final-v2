export const PLANS = {
  basic: {
    label: "Basic",
    price: 29,
    features: { can_access_marketing: true, max_customers: 20 }
  },
  premium: {
    label: "Premium",
    price: 99,
    features: { can_access_marketing: true, max_customers: 1000 }
  }
};

export function getPlanConfig(tier) {
  return PLANS[tier] || PLANS.basic;
}
