import React, { useState, useEffect } from "react";
import { supabase } from "./lib/supabase";
import Sidebar from "./components/Sidebar";
import Dashboard from "./views/Dashboard";
import Marketing from "./views/Marketing";
// ... autres imports (Reviews, Customers, etc. ne changent pas)
import Reviews from "./views/Reviews";
import Customers from "./views/Customers";
import Profile from "./views/Profile";
import Promotions from "./views/Promotions";
import Admin from "./views/Admin";
import AuthForm from "./components/AuthForm";
import { loadStripe } from "@stripe/stripe-js";
import { getPlanConfig } from "./lib/plans";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

export default function App() {
  const [session, setSession] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Données
  const [profile, setProfile] = useState({});
  const [reviews, setReviews] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [currentPost, setCurrentPost] = useState(null);

  // ... (Gardez vos useEffect et handleUserRole identiques) ...
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchClientData(session.user.id);
      else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchClientData(session.user.id);
      else setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  const fetchClientData = async (userId) => {
    setLoading(true);
    try {
      const { data: profileData } = await supabase.from("business_profile").select("*").eq("user_id", userId).maybeSingle();
      
      if (profileData) {
        setProfile(profileData);
        // On récupère TOUTES les données liées à ce business
        const [r, c, po] = await Promise.all([
          supabase.from("reviews").select("*").eq("business_id", profileData.id).order("id", { ascending: false }),
          supabase.from("customers").select("*").eq("business_id", profileData.id).order("id", { ascending: false }),
          supabase.from("posts").select("*").eq("business_id", profileData.id).order("created_at", { ascending: false }), // IMPORTANT: Tri par date
        ]);
        if (r.data) setReviews(r.data);
        if (c.data) setCustomers(c.data);
        if (po.data) setPosts(po.data); // On stocke les posts ici
      }
    } catch (e) {
      console.error("Erreur chargement:", e);
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour mettre à jour la liste des posts immédiatement après création
  const handlePostUpdate = (newPost) => {
    setPosts([newPost, ...posts]);
    setActiveTab("dashboard"); // Optionnel : retourne au dashboard ou reste sur marketing
  };

  if (!session) return <AuthForm />;
  if (loading) return <div className="h-screen flex items-center justify-center font-bold text-indigo-600">Chargement LocalBoost...</div>;

  const currentPlan = getPlanConfig(profile?.subscription_tier || "basic");

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans text-slate-900 overflow-hidden">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} profile={profile} />
      
      <main className="flex-1 overflow-y-auto w-full pt-8 md:ml-72">
        <header className="px-8 pb-8 flex justify-between items-center sticky top-0 bg-[#F8FAFC]/95 z-30">
          <h2 className="text-3xl font-black text-slate-900 capitalize">{activeTab.replace('-', ' ')}</h2>
          <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold uppercase">{currentPlan.label}</span>
        </header>

        <div className="px-8 pb-12">
          {activeTab === "dashboard" && (
            <Dashboard 
              stats={{ reviews: reviews.length, clients: customers.length, posts: posts.length }} 
              posts={posts} /* <--- LA CLÉ MANQUANTE ÉTAIT ICI */
              onGenerate={() => setActiveTab("generator")} 
            />
          )}
          
          {activeTab === "generator" && (
            <Marketing 
              posts={posts} /* On passe l'historique au studio */
              currentPost={currentPost} 
              setCurrentPost={setCurrentPost} 
              profile={profile}
              onUpdate={handlePostUpdate} /* Pour mettre à jour la liste sans recharger */
            />
          )}

          {activeTab === "reviews" && <Reviews reviews={reviews} />}
          {activeTab === "customers" && <Customers customers={customers} />}
          {activeTab === "profile" && <Profile profile={profile} setProfile={setProfile} />}
        </div>
      </main>
    </div>
  );
}
