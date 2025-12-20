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
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  
  // Données
  const [profile, setProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [currentPost, setCurrentPost] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) checkUser(session);
      else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) checkUser(session);
      else setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  const checkUser = (session) => {
    const isDemoAdmin = session.user.email === "admin@demo.fr";
    setIsAdmin(isDemoAdmin);
    
    // REDIRECTION AUTOMATIQUE SI ADMIN
    if (isDemoAdmin) {
      setActiveTab("admin");
    }
    
    fetchAllData(session.user.id, session.user.email);
  };

  const fetchAllData = async (userId, userEmail) => {
    setLoading(true);
    try {
      let { data: profileData } = await supabase.from("business_profile").select("*").eq("user_id", userId).maybeSingle();
      
      const enrichedProfile = profileData 
        ? { ...profileData, email: userEmail, is_admin: userEmail === "admin@demo.fr" }
        : { name: "Admin", email: userEmail, is_admin: true, subscription_tier: "premium" };

      setProfile(enrichedProfile);

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
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handlePostUpdate = (newPost) => setPosts([newPost, ...posts]);

  if (loading) return <div className="h-screen flex items-center justify-center font-bold text-indigo-600">Chargement...</div>;
  if (!session) return <AuthForm />;

  const currentPlan = getPlanConfig(profile?.subscription_tier || "basic");
  
  // Si l'onglet est 'admin', on passe en mode plein écran
  const isFullPage = activeTab === "admin";

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans text-slate-900 overflow-hidden">
      
      {/* LA SIDEBAR DISPARAIT SI ON EST SUR LA PAGE ADMIN */}
      {!isFullPage && (
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} profile={profile} />
      )}
      
      {/* LE MAIN PREND TOUTE LA LARGEUR SI ADMIN */}
      <main className={`flex-1 overflow-y-auto w-full pt-8 ${!isFullPage ? 'md:ml-72' : ''}`}>
        
        {/* Header standard (caché en admin car l'admin a son propre header) */}
        {!isFullPage && (
          <header className="px-8 pb-8 flex justify-between items-center sticky top-0 bg-[#F8FAFC]/95 z-30">
            <h2 className="text-3xl font-black text-slate-900 capitalize">{activeTab}</h2>
            <div className="flex items-center gap-3">
              {isAdmin && <span className="px-3 py-1 bg-rose-100 text-rose-600 rounded-full text-[10px] font-black uppercase">ADMIN</span>}
              <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold uppercase">
                 {currentPlan.label}
              </span>
            </div>
          </header>
        )}

        <div className={`pb-12 ${isFullPage ? 'px-0' : 'px-8'}`}>
          {activeTab === "dashboard" && <Dashboard stats={{ reviews: reviews.length, clients: customers.length, posts: posts.length }} posts={posts} onGenerate={() => setActiveTab("generator")} />}
          {activeTab === "generator" && <Marketing posts={posts} currentPost={currentPost} setCurrentPost={setCurrentPost} profile={profile} onUpdate={handlePostUpdate} />}
          {activeTab === "reviews" && <Reviews reviews={reviews} />}
          {activeTab === "customers" && <Customers customers={customers} />}
          {activeTab === "profile" && <Profile profile={profile} setProfile={setProfile} />}
          {activeTab === "promotions" && <Promotions />}
          
          {/* Passage d'une fonction pour revenir au Dashboard si besoin */}
          {activeTab === "admin" && <Admin onExit={() => setActiveTab("dashboard")} />}
        </div>
      </main>
    </div>
  );
}
