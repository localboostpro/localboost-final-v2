// src/lib/plans.js

export const PLANS = {
  basic: {
    label: "Basic",
    price: 29,
    features: {
      max_customers: 50, // Limite le nombre de clients affichés
      can_access_marketing: false, // Bloque l'onglet marketing
      can_export_data: false,
      support_priority: "standard",
    },
  },
  premium: {
    label: "Premium",
    price: 99,
    features: {
      max_customers: 99999, // Illimité
      can_access_marketing: true, // Autorise l'onglet marketing
      can_export_data: true,
      support_priority: "vip",
    },
  },
};

// Fonction utilitaire pour récupérer la config (sécurisée)
// Si le tier n'existe pas ou est null, on renvoie 'basic' par défaut
export const getPlanConfig = (tier) => {
  return PLANS[tier] || PLANS.basic;
};
