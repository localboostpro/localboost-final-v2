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

import { loadStripe } from "@stripe/stripe-js";
import { Menu, LogIn, Lock, Zap, Shield, CreditCard } from "lucide-react";
import { getPlanConfig } from "./lib/plans";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

export default function App() {
  const [session, setSession] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [impersonatedClient, setImpersonatedClient] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({});
  const [reviews, setReviews] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [currentPost, setCurrentPost] = useState(null);

  useEffect(() => {
    if (window.location.hash.includes('type=recovery')) {
      setActiveTab("profile"); 
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
    if (userEmail === "admin@demo.fr") {
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
        setProfile({ 
          name: session?.user?.user_metadata?.business_name || "Nouveau compte", 
          subscription_tier: "basic" 
        });
      } else {
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
      }
    } catch (e) {
      console.error("Erreur chargement:", e);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    alert("Simulation Mode Sandbox : Redirection vers Stripe Checkout...");
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

  if (!session) return <AuthForm />;
  if (loading) return <div className="h-screen flex items-center justify-center bg-slate-50 text-indigo-600 font-bold italic">Synchronisation...</div>;

  const isTrialExpired = profile?.trial_ends_at && new Date(profile.trial_ends_at) < new Date();
  const isAccountDisabled = profile?.is_active === false;
  if ((isTrialExpired || isAccountDisabled) && !isAdmin) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#F8FAFC] px-4">
        <div className="max-w-md w-full bg-white p-10 rounded-3xl shadow-2xl text-center border">
          <Lock className="mx-auto mb-6 text-red-600" size={48} />
          <h2 className="text-2xl font-black mb-4 tracking-tight text-slate-900">Accès Limité 🛑</h2>
          <p className="text-slate-500 mb-8">{isAccountDisabled ? "Compte suspendu." : "Essai de 7 jours terminé."}</p>
          <button onClick={handlePayment} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-xl flex items-center justify-center gap-3">
            <CreditCard size={22} /> Activer mon compte
          </button>
        </div>
      </div>
    );
  }

  const currentPlan = getPlanConfig(profile?.subscription_tier || "basic");

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans text-slate-900 overflow-hidden relative">
      {impersonatedClient && (
        <div className="absolute top-0 left-0 right-0 bg-amber-400 text-amber-900 text-xs font-bold py-1 z-50 text-center flex justify-center items-center gap-4">
          <span>⚠️ MODE ADMIN : {impersonatedClient.name}</span>
          <button onClick={() => { setImpersonatedClient(null); setIsAdmin(true); setActiveTab("admin"); }} className="bg-white/50 px-2 rounded hover:bg-white">Quitter</button>
        </div>
      )}

      {isAdmin && activeTab === "admin" ? (
        <div className="w-full h-full overflow-y-auto">
          <header className="px-6 py-4 bg-white border-b flex justify-between items-center sticky top-0 z-20">
            <div className="flex items-center gap-3">
              <Zap size={22} className="text-indigo-600" />
              <h2 className="font-black text-xl text-slate-900">LocalBoost <span className="text-indigo-600">Pro</span></h2>
            </div>
            <button onClick={handleLogout} className="text-red-500 text-sm font-bold">Déconnexion</button>
          </header>
          <Admin onImpersonate={handleImpersonate} />
        </div>
      ) : (
        <>
          <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} profile={profile} />
          <main className="flex-1 overflow-y-auto w-full pt-8 md:ml-72 transition-all">
            <header className="px-4 md:px-12 pb-6 flex justify-between items-center sticky top-0 bg-[#F8FAFC]/95 backdrop-blur-sm z-30">
              <h2 className="text-xl md:text-3xl font-black text-indigo-950 truncate">{profile?.name || "Bienvenue"} 👋</h2>
              <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold uppercase">{currentPlan.label} Plan</span>
            </header>

            <div className="px-4 md:px-12 pb-12">
              {activeTab === "dashboard" && <Dashboard stats={{ reviews: reviews.length, clients: customers.length, posts: posts.length }} onGenerate={() => setActiveTab("generator")} canGeneratePost={currentPlan.features.can_access_marketing} />}
              {activeTab === "generator" && <Marketing posts={posts} currentPost={currentPost} setCurrentPost={setCurrentPost} profile={profile} />}
              {activeTab === "reviews" && <Reviews reviews={reviews} />}
              {activeTab === "customers" && <Customers customers={customers} limit={currentPlan.features.max_customers} />}
              {activeTab === "profile" && <Profile profile={profile} setProfile={setProfile} />}
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
  ReactDOM.createRoot(rootElement).render(<React.StrictMode><App /></React.StrictMode>);
}
