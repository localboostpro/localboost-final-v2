import React, { useState, useEffect } from "react";
import { supabase } from "./lib/supabase";
import { getPlanConfig } from "./lib/plans";
import Sidebar from "./components/Sidebar";
import Dashboard from "./views/Dashboard";
import Marketing from "./views/Marketing";
import Reviews from "./views/Reviews";
import Customers from "./views/Customers";
import Profile from "./views/Profile";
import Promotions from "./views/Promotions";
import Admin from "./views/Admin";
import AuthForm from "./components/AuthForm";

export default function App() {
  const [session, setSession] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false); // État pour gérer les droits admin
  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  
  // Données
  const [profile, setProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [currentPost, setCurrentPost] = useState(null);

  useEffect(() => {
    // Initialisation de la session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        // Identification immédiate du compte admin démo
        const isDemoAdmin = session.user.email === "admin@demo.fr";
        setIsAdmin(isDemoAdmin);
        fetchAllData(session.user.id, session.user.email);
      } else {
        setLoading(false);
      }
    });

    // Écoute des changements d'état (connexion/déconnexion)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        const isDemoAdmin = session.user.email === "admin@demo.fr";
        setIsAdmin(isDemoAdmin);
        fetchAllData(session.user.id, session.user.email);
      } else {
        setLoading(false);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const fetchAllData = async (userId, userEmail) => {
    setLoading(true);
    try {
      // 1. Récupération du Profil Business
      let { data: profileData } = await supabase.from("business_profile").select("*").eq("user_id", userId).maybeSingle();
      
      // Enrichissement du profil avec l'email et le rôle admin pour la Sidebar
      const enrichedProfile = profileData 
        ? { ...profileData, email: userEmail, is_admin: userEmail === "admin@demo.fr" }
        : { name: "Admin LocalBoost", email: userEmail, is_admin: true, subscription_tier: "premium" };
      
      setProfile(enrichedProfile);

      // 2. Données liées (si le profil possède un ID business valide)
      if (enrichedProfile.id) {
        const [r, c, p] = await Promise.all([
          supabase.from("reviews").select("*").eq("business_id", enrichedProfile.id),
          supabase.from("customers").select("*").eq("business_id", enrichedProfile.id),
          supabase.from("posts").select("*").eq("business_id", enrichedProfile.id).order("created_at", { ascending: false })
        ]);
        if (r.data) setReviews(r.data);
        if (c.data) setCustomers(c.data);
        if (p.data) setPosts(p.data);
      }
    } catch (error) {
      console.error("Erreur chargement des données:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePostUpdate = (newPost) => {
    setPosts([newPost, ...posts]);
  };

  if (loading) return <div className="h-screen flex items-center justify-center font-bold text-indigo-600 tracking-widest animate-pulse">CHARGEMENT LOCALBOOST...</div>;
  if (!session) return <AuthForm />;

  const currentPlan = getPlanConfig(profile?.subscription_tier || "basic");

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans text-slate-900 overflow-hidden">
      {/* Passage du profil enrichi à la Sidebar pour afficher le bouton Admin */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} profile={profile} />
      
      <main className="flex-1 overflow-y-auto w-full pt-8 md:ml-72">
        <header className="px-8 pb-8 flex justify-between items-center sticky top-0 bg-[#F8FAFC]/95 z-30">
          <h2 className="text-3xl font-black text-slate-900 capitalize tracking-tight">
            {activeTab.replace('-', ' ')}
          </h2>
          <div className="flex items-center gap-3">
            {isAdmin && <span className="px-3 py-1 bg-rose-100 text-rose-600 rounded-full text-[10px] font-black uppercase">ADMIN</span>}
            <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold uppercase">
               {currentPlan.label}
            </span>
          </div>
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
