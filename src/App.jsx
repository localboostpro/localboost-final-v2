import React, { useState, useEffect } from "react";
import { supabase } from "./lib/supabase";
import Sidebar from "./components/Sidebar";
import Dashboard from "./views/Dashboard";
import Marketing from "./views/Marketing";
import Reviews from "./views/Reviews";
import Customers from "./views/Customers";
import Profile from "./views/Profile";
import Promotions from "./views/Promotions";
import Admin from "./views/Admin";
import AuthForm from "./components/AuthForm";

// --- CONFIGURATION DIRECTE (Pour éviter le crash d'import) ---
const PLANS = {
  basic: { label: "Starter", features: { can_access_marketing: true, max_customers: 20 } },
  premium: { label: "Premium", features: { can_access_marketing: true, max_customers: 1000 } }
};

export default function App() {
  const [session, setSession] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  
  // Données
  const [profile, setProfile] = useState({});
  const [reviews, setReviews] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [currentPost, setCurrentPost] = useState(null);

  // Initialisation Session
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

  // Récupération Données
  const fetchClientData = async (userId) => {
    setLoading(true);
    try {
      // 1. Profil
      let { data: profileData } = await supabase.from("business_profile").select("*").eq("user_id", userId).maybeSingle();
      
      // Si pas de profil, on utilise des données par défaut pour éviter l'écran blanc
      if (!profileData) {
         profileData = { name: "Mon Entreprise", subscription_tier: "basic", city: "Ma Ville" };
      }
      setProfile(profileData);

      // 2. Données liées (Avis, Clients, Posts)
      // On utilise Promise.allSettled pour qu'une erreur sur une table ne bloque pas tout
      const results = await Promise.allSettled([
        supabase.from("reviews").select("*").eq("business_id", profileData.id),
        supabase.from("customers").select("*").eq("business_id", profileData.id),
        supabase.from("posts").select("*").eq("business_id", profileData.id).order("created_at", { ascending: false })
      ]);

      if (results[0].status === 'fulfilled' && results[0].value.data) setReviews(results[0].value.data);
      if (results[1].status === 'fulfilled' && results[1].value.data) setCustomers(results[1].value.data);
      if (results[2].status === 'fulfilled' && results[2].value.data) setPosts(results[2].value.data);

    } catch (e) {
      console.error("Erreur critique:", e);
    } finally {
      setLoading(false);
    }
  };

  const handlePostUpdate = (newPost) => {
    setPosts([newPost, ...posts]);
    // On reste sur l'onglet pour voir le résultat, ou on bascule sur dashboard :
    // setActiveTab("dashboard"); 
  };

  if (!session) return <AuthForm />;
  if (loading) return <div className="h-screen flex items-center justify-center font-bold text-indigo-600">Chargement...</div>;

  // Calcul sécurisé du plan
  const userTier = profile?.subscription_tier || "basic";
  const currentPlan = PLANS[userTier] || PLANS.basic;

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans text-slate-900 overflow-hidden">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} profile={profile} />
      
      <main className="flex-1 overflow-y-auto w-full pt-8 md:ml-72">
        <header className="px-8 pb-8 flex justify-between items-center sticky top-0 bg-[#F8FAFC]/95 z-30">
          <h2 className="text-3xl font-black text-slate-900 capitalize">{activeTab.replace('-', ' ')}</h2>
          <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold uppercase">
             {currentPlan.label}
          </span>
        </header>

        <div className="px-8 pb-12">
          {activeTab === "dashboard" && (
            <Dashboard 
              stats={{ reviews: reviews.length, clients: customers.length, posts: posts.length }} 
              posts={posts} 
              onGenerate={() => setActiveTab("generator")} 
            />
          )}
          
          {activeTab === "generator" && (
            <Marketing 
              posts={posts} 
              currentPost={currentPost} 
              setCurrentPost={setCurrentPost} 
              profile={profile}
              onUpdate={handlePostUpdate}
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
