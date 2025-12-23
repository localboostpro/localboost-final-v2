
export interface Business {
  id: string;
  business_name: string;  // ← Votre colonne
  business_type: string;  // ← Votre colonne
  city: string;
  description?: string;
  plan: 'starter' | 'pro' | 'premium';
  price: number;
  status: 'trial' | 'active' | 'inactive' | 'cancelled';
  email?: string;
  phone?: string;
  created_at: string;
  updated_at?: string;
}
