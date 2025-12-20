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
import { Eye, LogOut, Menu } from "lucide-react"; // Ajout de l'icône Menu

export default function App() {
  const [session, setSession] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  
  // NOUVEAU : État pour le menu mobile
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // États de sécurité
  const [isAdmin, setIsAdmin] = useState(false);
  const [impersonatedUserId, setImpersonatedUserId] = useState(null); 

  // Données
  const [profile, setProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [currentPost, setCurrentPost] = useState(null);

  useEffect(() => {
    // Sécurité : On force la fin du chargement après 3 secondes max
    const safetyTimer = setTimeout(() => setLoading(false), 3000);

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

    return () => {
      subscription.unsubscribe();
      clearTimeout(safetyTimer);
    };
  }, []);

  const checkUser = (session) => {
    const isDemoAdmin = session.user.email === "admin@demo.fr";
    setIsAdmin(isDemoAdmin);
    
    // Redirection intelligente
    if (isDemoAdmin && !impersonatedUserId) {
      setActiveTab("admin");
    } else if (!impersonatedUserId && activeTab === "admin") {
      setActiveTab("dashboard");
    }
    
    fetchAllData(session.user.id, session.user.email);
  };

  const fetchAllData = async (targetUserId, targetUserEmail) => {
    try {
      let { data: profileData } = await supabase.from("business_profile").select("*").eq("user_id", targetUserId).maybeSingle();
      
      const isActualAdmin = session?.user?.email === "admin@demo.fr";
      
      const enrichedProfile = profileData 
        ? { ...profileData, email: targetUserEmail, is_admin: isActualAdmin }
        : { name: "Nouveau Compte", email: targetUserEmail, is_admin: isActualAdmin, subscription_tier: "basic" };

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

  const handleAdminAccessClient = (clientId, clientEmail) => {
    setImpersonatedUserId(clientId);
    setActiveTab("dashboard");
    fetchAllData(clientId, clientEmail);
  };

  const handleExitImpersonation = () => {
    setImpersonatedUserId(null);
    setActiveTab("admin");
    if(session) fetchAllData(session.user.id, session.user.email);
  };

  const handlePostUpdate = (newPost) => setPosts([newPost, ...posts]);

  // ÉCRAN DE CHARGEMENT
  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <div className="font-bold text-indigo-600 animate-pulse">Chargement LocalBoost...</div>
      </div>
    </div>
  );

  if (!session) return <AuthForm />;

  const currentPlan = getPlanConfig(profile?.subscription_tier || "basic");
  const isFullPage = activeTab === "admin";

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans text-slate-900 overflow-hidden">
      
      {!isFullPage && (
        <Sidebar 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
            profile={profile} 
            // Props pour le mobile
            isOpen={isMobileMenuOpen}
            onClose={() => setIsMobileMenuOpen(false)}
        />
      )}
      
      {/* Ajustement des marges pour le mobile (pt-4) et desktop (md:pt-8) */}
      <main className={`flex-1 overflow-y-auto w-full pt-4 md:pt-8 transition-all ${!isFullPage ? 'md:ml-0' : ''}`}>
        
        {/* BANDEAU ROUGE MODE ESPION */}
        {impersonatedUserId && (
          <div className="bg-rose-600 text-white px-4 md:px-8 py-3 sticky top-0 z-50 flex justify-between items-center shadow-lg animate-in slide-in-from-top">
             <div className="flex items-center gap-2 font-bold animate-pulse text-xs md:text-sm">
               <Eye size={20}/> MODIFICATION DU COMPTE : {profile?.name}
             </div>
             <button onClick={handleExitImpersonation} className="bg-white text-rose-600 px-3 md:px-4 py-1 rounded-full text-xs font-black uppercase flex items-center gap-2 hover:bg-rose-50">
               <LogOut size={14}/> Retour Admin
             </button>
          </div>
        )}

        {/* HEADER CLASSIQUE (Sauf en admin plein écran) */}
        {!isFullPage && !impersonatedUserId && (
          <header className="px-4 md:px-8 pb-6 flex justify-between items-center sticky top-0 bg-[#F8FAFC]/95 z-30 pt-2">
            <div className="flex items-center gap-3">
                {/* BOUTON HAMBURGER MOBILE */}
                <button 
                    onClick={() => setIsMobileMenuOpen(true)}
                    className="md:hidden p-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:text-indigo-600 shadow-sm active:scale-95 transition"
                >
                    <Menu size={24}/>
                </button>

                <h2 className="text-2xl md:text-3xl font-black text-slate-900 capitalize truncate max-w-[200px] md:max-w-none">
                    {activeTab === 'dashboard' ? 'Tableau de bord' : activeTab}
                </h2>
            </div>

            <div className="flex items-center gap-3">
              <span className="hidden md:inline-block px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold uppercase">
                 {currentPlan.label}
              </span>
              {/* Pastille mobile simple */}
              <span className={`md:hidden w-3 h-3 rounded-full ${profile?.subscription_tier === 'premium' ? 'bg-indigo-500' : 'bg-slate-300'}`}></span>
            </div>
          </header>
        )}

        <div className={`pb-20 md:pb-12 ${isFullPage ? 'px-0' : 'px-4 md:px-8'}`}>
          {activeTab === "dashboard" && (
            <Dashboard 
                stats={{ reviews: reviews.length, clients: customers.length, posts: posts.length }} 
                posts={posts} 
                profile={profile} 
                onGenerate={() => setActiveTab("generator")} 
            />
          )}
          
          {activeTab === "generator" && <Marketing posts={posts} currentPost={currentPost} setCurrentPost={setCurrentPost} profile={profile} onUpdate={handlePostUpdate} />}
          {activeTab === "reviews" && <Reviews reviews={reviews} />}
          {activeTab === "customers" && <Customers customers={customers} />}
          {activeTab === "profile" && <Profile profile={profile} setProfile={setProfile} />}
          {activeTab === "promotions" && <Promotions />}
          
          {activeTab === "admin" && (
            <Admin 
              onExit={() => setActiveTab("dashboard")} 
              onAccessClient={handleAdminAccessClient} 
            />
          )}
        </div>
      </main>
    </div>
  );
}
