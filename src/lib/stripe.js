import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

export const redirectToCheckout = async (priceId, userEmail) => {
  // Dans un vrai projet, vous créeriez une session Checkout via une Edge Function ou un Backend.
  // Pour la démo, nous simulons l'appel.
  alert("Redirection vers Stripe Checkout pour l'offre : " + priceId);
  
  // Note : Pour une automatisation complète, il faudra configurer un Webhook Stripe
  // qui mettra à jour la colonne 'subscription_tier' dans Supabase après le succès.
};
