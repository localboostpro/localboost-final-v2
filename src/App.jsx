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
import { Eye, LogOut } from "lucide-react"; // Nouvelle icône pour le mode espion

export default function App() {
  const [session, setSession] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  
  // États de sécurité
  const [isAdmin, setIsAdmin] = useState(false);
  const [impersonatedUserId, setImpersonatedUserId] = useState(null); // ID du client qu'on espionne

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
    
    // Si Admin pur, on va sur l'onglet Admin, sinon Dashboard
    if (isDemoAdmin && !impersonatedUserId) {
      setActiveTab("admin");
    } else {
      setActiveTab("dashboard");
    }
    
    // On charge les données de l'utilisateur connecté par défaut
    fetchAllData(session.user.id, session.user.email);
  };

  // FONCTION MAGIQUE : Charger les données de n'importe quel client
  const fetchAllData = async (targetUserId, targetUserEmail) => {
    setLoading(true);
    try {
      let { data: profileData } = await supabase.from("business_profile").select("*").eq("user_id", targetUserId).maybeSingle();
      
      // Si on est admin connecté, on enrichit le profil
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

  // ACTION : L'admin clique sur "Accéder" depuis la liste
  const handleAdminAccessClient = (clientId, clientEmail) => {
    setImpersonatedUserId(clientId); // On active le mode espion
    setActiveTab("dashboard"); // On bascule sur la vue Dashboard
    fetchAllData(clientId, clientEmail); // On charge SES données
  };

  // ACTION : Quitter le mode client pour revenir à l'admin
  const handleExitImpersonation = () => {
    setImpersonatedUserId(null);
    setActiveTab("admin");
    // On recharge les données de l'admin (qui sont vides mais c'est pas grave pour la vue admin)
    fetchAllData(session.user.id, session.user.email);
  };

  const handlePostUpdate = (newPost) => setPosts([newPost, ...posts]);

  if (loading) return <div className="h-screen flex items-center justify-center font-bold text-indigo-600">Chargement...</div>;
  if (!session) return <AuthForm />;

  const currentPlan = getPlanConfig(profile?.subscription_tier || "basic");
  const isFullPage = activeTab === "admin";

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans text-slate-900 overflow-hidden">
      
      {/* Sidebar cachée en mode Admin pur */}
      {!isFullPage && (
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} profile={profile} />
      )}
      
      <main className={`flex-1 overflow-y-auto w-full pt-8 ${!isFullPage ? 'md:ml-72' : ''}`}>
        
        {/* BANDEAU ROUGE : MODE ACCÈS CLIENT */}
        {impersonatedUserId && (
          <div className="bg-rose-600 text-white px-8 py-3 sticky top-0 z-50 flex justify-between items-center shadow-lg">
             <div className="flex items-center gap-2 font-bold animate-pulse">
               <Eye size={20}/> MODIFICATION DU COMPTE : {profile?.name}
             </div>
             <button 
               onClick={handleExitImpersonation}
               className="bg-white text-rose-600 px-4 py-1 rounded-full text-xs font-black uppercase flex items-center gap-2 hover:bg-rose-50"
             >
               <LogOut size={14}/> Revenir à l'Admin
             </button>
          </div>
        )}

        {/* Header standard (masqué en plein écran admin) */}
        {!isFullPage && !impersonatedUserId && (
          <header className="px-8 pb-8 flex justify-between items-center sticky top-0 bg-[#F8FAFC]/95 z-30">
            <h2 className="text-3xl font-black text-slate-900 capitalize">{activeTab}</h2>
            <div className="flex items-center gap-3">
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
          
          {/* On passe la fonction d'accès client au composant Admin */}
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
