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

// 🚨 ON DÉFINIT LA CONFIGURATION ICI POUR ÉVITER LES ERREURS D'IMPORT
const PLANS = {
  basic: { label: "Starter", features: { can_access_marketing: true } },
  premium: { label: "Premium", features: { can_access_marketing: true } }
};

export default function App() {
  const [session, setSession] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  
  // États de données
  const [profile, setProfile] = useState({ name: "Chargement...", subscription_tier: "basic" });
  const [reviews, setReviews] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [currentPost, setCurrentPost] = useState(null);

  useEffect(() => {
    // Vérification de la session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) safeFetchData(session.user.id);
      else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) safeFetchData(session.user.id);
      else setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fonction de chargement sécurisée (qui ne plante pas l'appli)
  const safeFetchData = async (userId) => {
    try {
      setLoading(true);
      // 1. Récupération Profil
      let { data: profileData } = await supabase.from("business_profile").select("*").eq("user_id", userId).maybeSingle();
      
      // Si pas de profil, on met des données par défaut pour éviter l'écran blanc
      if (!profileData) {
        console.warn("Profil introuvable, utilisation données par défaut");
        profileData = { id: null, name: "Mon Entreprise", subscription_tier: "basic", city: "Ma Ville" };
      }
      setProfile(profileData);

      // 2. Récupération des données annexes (seulement si on a un ID business)
      if (profileData.id) {
        const p = await supabase.from("posts").select("*").eq("business_id", profileData.id).order("created_at", { ascending: false });
        if (p.data) setPosts(p.data);

        const r = await supabase.from("reviews").select("*").eq("business_id", profileData.id);
        if (r.data) setReviews(r.data);
        
        const c = await supabase.from("customers").select("*").eq("business_id", profileData.id);
        if (c.data) setCustomers(c.data);
      }

    } catch (error) {
      console.error("Erreur non bloquante:", error);
    } finally {
      setLoading(false);
    }
  };

  // Mise à jour locale des posts après création
  const handlePostUpdate = (newPost) => {
    setPosts([newPost, ...posts]);
  };

  if (loading) return <div className="h-screen flex items-center justify-center text-indigo-600 font-bold">Chargement...</div>;
  if (!session) return <AuthForm />;

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans text-slate-900 overflow-hidden">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} profile={profile} />
      
      <main className="flex-1 overflow-y-auto w-full pt-8 md:ml-72">
        <header className="px-8 pb-8 flex justify-between items-center sticky top-0 bg-[#F8FAFC]/95 z-30">
          <h2 className="text-3xl font-black text-slate-900 capitalize">{activeTab}</h2>
          <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold uppercase">
             {PLANS[profile.subscription_tier]?.label || "Starter"}
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
          {activeTab === "promotions" && <Promotions />}
          {activeTab === "admin" && <Admin />}
        </div>
      </main>
    </div>
  );
}
