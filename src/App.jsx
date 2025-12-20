import React, { useState, useEffect } from "react";
import { supabase } from "./lib/supabase";
import Sidebar from "./components/Sidebar";
import Dashboard from "./views/Dashboard";
import Reviews from "./views/Reviews";
import Marketing from "./views/Marketing";
import Customers from "./views/Customers";
import Profile from "./views/Profile";
import Promotions from "./views/Promotions";
import Admin from "./views/Admin";
import AuthForm from "./components/AuthForm";
import ReactDOM from "react-dom/client";

// Import de Stripe
import { loadStripe } from "@stripe/stripe-js";
import { Menu, LogIn, Lock, Zap, Shield, CreditCard } from "lucide-react";
import { getPlanConfig } from "./lib/plans";

// Initialisation de Stripe avec votre clé publique test
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

export default function App() {
  // --- ÉTATS D'AUTHENTIFICATION ---
  const [session, setSession] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [impersonatedClient, setImpersonatedClient] = useState(null);

  // --- ÉTATS D'INTERFACE ---
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // --- DONNÉES MÉTIER ---
  const [profile, setProfile] = useState({});
  const [reviews, setReviews] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [currentPost, setCurrentPost] = useState(null);

  // 1. INITIALISATION & AUTHENTIFICATION
  useEffect(() => {
    if (window.location.hash.includes('type=recovery')) {
      setActiveTab("settings"); 
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) handleUserRole(session);
      else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) handleUserRole(session);
      else {
        setProfile({});
        setIsAdmin(false);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleUserRole = async (session) => {
    const userEmail = session.user.email;
    const ADMIN_EMAIL = "admin@demo.fr";

    if (userEmail === ADMIN_EMAIL) {
      setIsAdmin(true);
      setActiveTab("admin");
      setLoading(false);
    } else {
      setIsAdmin(false);
      await fetchClientData(session.user.id);
    }
  };

  const fetchClientData = async (userId, forceProfileId = null) => {
    setLoading(true);
    try {
      let profileData = null;

      if (forceProfileId) {
        const { data } = await supabase.from("business_profile").select("*").eq("id", forceProfileId).single();
        profileData = data;
      } else {
        const { data } = await supabase.from("business_profile").select("*").eq("user_id", userId).maybeSingle();
        profileData = data;
      }

      if (!profileData) {
        // Au lieu de mettre un nom fixe, on attend un peu ou on laisse l'utilisateur 
        // remplir son profil lui-même dans l'onglet Profil.
        setProfile({ 
          name: session?.user?.user_metadata?.business_name || "Chargement du profil...", 
          subscription_tier: "basic" 
        });
        setLoading(false);
        return;
      }

      setProfile(profileData);
      const businessId = profileData.id;

      const [r, c, po] = await Promise.all([
        supabase.from("reviews").select("*").eq("business_id", businessId).order("id", { ascending: false }),
        supabase.from("customers").select("*").eq("business_id", businessId).order("id", { ascending: false }),
        supabase.from("posts").select("*").eq("business_id", businessId).order("created_at", { ascending: false }),
      ]);

      if (r.data) setReviews(r.data);
      if (c.data) setCustomers(c.data);
      if (po.data) setPosts(po.data);
      
    } catch (e) {
      console.error("Erreur chargement:", e);
    } finally {
      setLoading(false);
    }
  };

  // --- FONCTION DE PAIEMENT STRIPE ---
  const handlePayment = async () => {
    const stripe = await stripePromise;
    
    // Dans une intégration réelle, vous appelleriez votre backend/Edge Function 
    // pour créer une Checkout Session. Ici nous simulons la redirection Sandbox.
    console.log("Préparation du paiement pour:", session.user.email);
    alert("Simulation Mode Sandbox : Redirection vers Stripe Checkout...");
    
    // Exemple d'URL de test (à remplacer par votre lien de produit Stripe)
    window.location.href = "https://buy.stripe.com/test_6oE7sC3pS38o6as9AA"; 
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setImpersonatedClient(null);
    window.location.reload();
  };

  const handleImpersonate = (client) => {
    setImpersonatedClient(client);
    setIsAdmin(false);
    setActiveTab("dashboard");
    fetchClientData(null, client.id);
  };

  const exitImpersonation = () => {
    setImpersonatedClient(null);
    setIsAdmin(true);
    setActiveTab("admin");
    setProfile({});
  };

  if (!session) return <AuthForm />;
  if (loading) return <div className="h-screen flex items-center justify-center bg-slate-50 text-indigo-600 font-bold">Chargement...</div>;

  // --- LOGIQUE DE VÉRIFICATION D'ACCÈS ---
  const isTrialExpired = profile?.trial_ends_at && new Date(profile.trial_ends_at) < new Date();
  const isAccountDisabled = profile?.is_active === false;
  const hasNoAccess = (isTrialExpired || isAccountDisabled) && !isAdmin;

  if (hasNoAccess) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#F8FAFC] px-4">
        <div className="max-w-md w-full bg-white p-10 rounded-3xl shadow-2xl text-center border border-slate-100">
          <div className="w-20 h-20 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6 transform rotate-3">
            <Lock size={40} />
          </div>
          <h2 className="text-3xl font-black text-slate-900 mb-4">Accès Limité 🛑</h2>
          <p className="text-slate-500 mb-8 text-lg">
            {isAccountDisabled 
              ? "Votre compte a été suspendu par l'administrateur. Veuillez nous contacter." 
              : "Votre période d'essai de 7 jours est terminée. Vos données sont conservées, choisissez un forfait pour continuer."}
          </p>
          <button 
            onClick={handlePayment}
            className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-lg hover:bg-indigo-700 transition shadow-xl shadow-indigo-100 flex items-center justify-center gap-3"
          >
            <CreditCard size={22} /> Activer mon compte (Sandbox)
          </button>
          <button onClick={handleLogout} className="mt-6 text-slate-400 font-bold text-sm hover:text-slate-600 transition">
            Se déconnecter
          </button>
        </div>
      </div>
    );
  }

  const currentPlan = getPlanConfig(profile?.subscription_tier || "basic");

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans text-slate-900 overflow-hidden relative">
      {impersonatedClient && (
        <div className="absolute top-0 left-0 right-0 bg-amber-400 text-amber-900 text-xs font-bold py-1 z-50 text-center flex justify-center items-center gap-4 shadow-sm">
          <span>⚠️ MODE ADMIN : {impersonatedClient.name} ({profile?.subscription_tier})</span>
          <button onClick={exitImpersonation} className="bg-white/50 px-2 py-0.5 rounded hover:bg-white transition">Quitter</button>
        </div>
      )}

      {isAdmin && activeTab === "admin" ? (
        <div className="w-full h-full overflow-y-auto">
          <header className="px-6 py-4 bg-white border-b flex justify-between items-center sticky top-0 z-20 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-xl flex items-center justify-center text-white shadow-sm transform -rotate-3 hover:rotate-0 transition">
                <Zap size={22} fill="currentColor" className="text-indigo-100" />
              </div>
              <div>
                <h2 className="font-black text-xl text-slate-900 leading-none flex items-center gap-2">
                  LocalBoost <span className="text-indigo-600">Pro</span>
                </h2>
                <div className="flex items-center gap-1 text-xs font-bold text-indigo-600 mt-1 bg-indigo-50 px-2 py-0.5 rounded-md w-fit">
                  <Shield size={12} /> Espace Super Admin
                </div>
              </div>
            </div>
            <button onClick={handleLogout} className="text-red-500 text-sm font-bold hover:bg-red-50 px-3 py-2 rounded-lg border border-transparent hover:border-red-100 transition">Déconnexion</button>
          </header>
          <Admin onImpersonate={handleImpersonate} />
        </div>
      ) : (
        <>
          <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} profile={profile} />
          <main className="flex-1 overflow-y-auto w-full pt-8">
            <header className="px-4 md:px-12 pb-6 flex justify-between items-center sticky top-0 bg-[#F8FAFC]/95 backdrop-blur-sm z-30">
              <div className="flex items-center gap-3 w-full">
                <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden p-2 bg-white rounded-xl shadow-sm border border-slate-200"><Menu size={20} /></button>
                <h2 className="text-xl md:text-3xl font-black text-indigo-950 truncate">{profile?.name || "Bienvenue"} 👋</h2>
              </div>
              <div className="flex items-center gap-4">
                <span className="hidden md:inline-block px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold uppercase tracking-wide">{currentPlan.label} Plan</span>
                <button onClick={handleLogout} className="hidden md:flex items-center gap-2 text-slate-400 hover:text-red-500 transition font-bold text-xs"><LogIn size={16} className="rotate-180" /> Déconnexion</button>
              </div>
            </header>

            <div className="px-4 md:px-12 pb-12">
              {activeTab === "dashboard" && <Dashboard stats={{ reviews: reviews.length, clients: customers.length, posts: posts.length }} onGenerate={() => setActiveTab("marketing")} canGeneratePost={currentPlan.features.can_access_marketing} />}
              {activeTab === "reviews" && <Reviews reviews={reviews} />}
              {activeTab === "marketing" && (currentPlan.features.can_access_marketing ? <Marketing posts={posts} currentPost={currentPost} setCurrentPost={setCurrentPost} profile={profile} /> : <div className="text-center py-24 bg-white rounded-2xl border border-slate-200">Fonctionnalité Premium 💎</div>)}
              {activeTab === "customers" && <Customers customers={customers} limit={currentPlan.features.max_customers} />}
              {activeTab === "settings" && <Profile profile={profile} setProfile={setProfile} />}
              {activeTab === "promotions" && <Promotions customers={customers} profile={profile} />}
            </div>
          </main>
        </>
      )}
    </div>
  );
}

const rootElement = document.getElementById("root");
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
