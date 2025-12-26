import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

const DataContext = createContext();

export const DataProvider = ({ children, session }) => {
  const [profile, setProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 🔹 Chargement initial des données
  const loadAllData = useCallback(async (userId, email) => {
    try {
      setLoading(true);
      setError(null);

      // 1️⃣ Récupération du profil business
      const { data: profileData, error: profileError } = await supabase
        .from("business_profile")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (profileError) throw profileError;

      // Si pas de profil, créer un profil par défaut
      if (!profileData) {
        setProfile({ name: "Nouveau compte", email, plan: 'basic', user_id: userId });
        setLoading(false);
        return;
      }

      // 2️⃣ Chargement des données associées en parallèle
      const [reviewsRes, customersRes, postsRes, promotionsRes] = await Promise.all([
        supabase
          .from("reviews")
          .select("*")
          .eq("business_id", profileData.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("customers")
          .select("*")
          .eq("business_id", profileData.id),
        supabase
          .from("posts")
          .select("*")
          .eq("business_id", profileData.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("promotions")
          .select("*")
          .eq("business_id", profileData.id)
          .order("created_at", { ascending: false }),
      ]);

      // 3️⃣ Mise à jour des états
      setProfile({ ...profileData, email });
      setReviews(reviewsRes.data || []);
      setCustomers(customersRes.data || []);
      setPosts(postsRes.data || []);
      setPromotions(promotionsRes.data || []);

    } catch (e) {
      console.error("❌ Erreur loadAllData:", e);
      setError("Impossible de charger les données. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  }, []);

  // 🔹 Rechargement des avis
  const refreshReviews = useCallback(async (businessId) => {
    try {
      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .eq("business_id", businessId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setReviews(data || []);
    } catch (e) {
      console.error("❌ Erreur refreshReviews:", e);
    }
  }, []);

  // 🔹 Rechargement des posts
  const refreshPosts = useCallback(async (businessId) => {
    try {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("business_id", businessId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (e) {
      console.error("❌ Erreur refreshPosts:", e);
    }
  }, []);

  // 🔹 Rechargement des promotions
  const refreshPromotions = useCallback(async (businessId) => {
    try {
      const { data, error } = await supabase
        .from("promotions")
        .select("*")
        .eq("business_id", businessId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPromotions(data || []);
    } catch (e) {
      console.error("❌ Erreur refreshPromotions:", e);
    }
  }, []);

  // 🔹 Rechargement des clients
  const refreshCustomers = useCallback(async (businessId) => {
    try {
      const { data, error } = await supabase
        .from("customers")
        .select("*")
        .eq("business_id", businessId);

      if (error) throw error;
      setCustomers(data || []);
    } catch (e) {
      console.error("❌ Erreur refreshCustomers:", e);
    }
  }, []);

  // 🔹 Rechargement complet de toutes les données
  const refreshAllData = useCallback(async () => {
    if (profile?.id) {
      await Promise.all([
        refreshReviews(profile.id),
        refreshCustomers(profile.id),
        refreshPosts(profile.id),
        refreshPromotions(profile.id),
      ]);
    }
  }, [profile?.id, refreshReviews, refreshCustomers, refreshPosts, refreshPromotions]);

  // 🔹 Chargement automatique au montage ou changement de session
  useEffect(() => {
    if (session?.user) {
      loadAllData(session.user.id, session.user.email);
    } else {
      // Reset si déconnexion
      setProfile(null);
      setReviews([]);
      setCustomers([]);
      setPosts([]);
      setPromotions([]);
      setLoading(false);
    }
  }, [session, loadAllData]);

  const value = {
    // États
    profile,
    reviews,
    customers,
    posts,
    promotions,
    loading,
    error,

    // Setters (pour updates locaux)
    setProfile,
    setReviews,
    setCustomers,
    setPosts,
    setPromotions,

    // Actions de refresh
    refreshReviews,
    refreshPosts,
    refreshPromotions,
    refreshCustomers,
    refreshAllData,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

// 🔹 Hook personnalisé pour consommer le contexte
export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData doit être utilisé à l\'intérieur de DataProvider');
  }
  return context;
};
📄 3. src/views/Dashboard.jsx (Refactorisé)
import React, { useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import { Star, TrendingUp, Users, MessageSquare } from 'lucide-react';

export default function Dashboard() {
  const { profile, reviews, posts, customers, loading } = useData();

  // 🔹 Calcul des KPIs avec useMemo pour optimisation
  const stats = useMemo(() => {
    const avgRating = reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length).toFixed(1)
      : "N/A";

    return {
      avgRating,
      totalReviews: reviews.length,
      totalPosts: posts.length,
      totalCustomers: customers.length,
    };
  }, [reviews, posts, customers]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-[2.5rem] p-8 shadow-lg">
        <h1 className="text-4xl font-black text-slate-900">
          Tableau de bord
        </h1>
        <p className="text-slate-600 mt-2">
          Bienvenue {profile?.name || 'Utilisateur'} 👋
        </p>
        <div className="mt-4">
          <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-indigo-100 text-indigo-700">
            Plan {profile?.plan || 'Basic'}
          </span>
        </div>
      </div>

      {/* Grille de KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Note Moyenne */}
        <div className="bg-white rounded-[2.5rem] p-6 shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium">Note Moyenne</p>
              <p className="text-3xl font-black text-slate-900 mt-2">
                {stats.avgRating}
              </p>
            </div>
            <div className="bg-yellow-100 p-4 rounded-[1.5rem]">
              <Star className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        {/* Total Avis */}
        <div className="bg-white rounded-[2.5rem] p-6 shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium">Avis Clients</p>
              <p className="text-3xl font-black text-slate-900 mt-2">
                {stats.totalReviews}
              </p>
            </div>
            <div className="bg-green-100 p-4 rounded-[1.5rem]">
              <MessageSquare className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        {/* Total Clients */}
        <div className="bg-white rounded-[2.5rem] p-6 shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium">Clients</p>
              <p className="text-3xl font-black text-slate-900 mt-2">
                {stats.totalCustomers}
              </p>
            </div>
            <div className="bg-blue-100 p-4 rounded-[1.5rem]">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Total Posts */}
        <div className="bg-white rounded-[2.5rem] p-6 shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium">Publications</p>
              <p className="text-3xl font-black text-slate-900 mt-2">
                {stats.totalPosts}
              </p>
            </div>
            <div className="bg-purple-100 p-4 rounded-[1.5rem]">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Derniers avis */}
      <div className="bg-white rounded-[2.5rem] p-8 shadow-lg">
        <h2 className="text-2xl font-black text-slate-900 mb-6">
          Derniers Avis
        </h2>
        {reviews.length === 0 ? (
          <p className="text-slate-500 text-center py-8">
            Aucun avis pour le moment
          </p>
        ) : (
          <div className="space-y-4">
            {reviews.slice(0, 5).map((review) => (
              <div
                key={review.id}
                className="border border-slate-200 rounded-[1.5rem] p-4 hover:border-indigo-300 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-slate-900">
                        {review.customer_name || 'Client anonyme'}
                      </p>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < review.rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-slate-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-slate-600 mt-2 text-sm">
                      {review.comment || 'Pas de commentaire'}
                    </p>
                  </div>
                  <p className="text-xs text-slate-400">
                    {new Date(review.created_at).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
