import React, { useState, useEffect, useRef } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { supabase } from "./lib/supabase";
import { getPlanConfig } from "./lib/plans";

import Sidebar from "./components/Sidebar";
import Dashboard from "./views/Dashboard";
import Marketing from "./views/Marketing";
import Reviews from "./views/Reviews";
import Customers from "./views/Customers";
import WebPage from "./views/WebPage";
import Profile from "./views/Profile";
import Promotions from "./views/Promotions";
import Admin from "./views/Admin";
import AuthForm from "./components/AuthForm";

import { Eye, LogOut, Menu } from "lucide-react";

/* ---------------- ROUTE WRAPPER ---------------- */

function AppLayout() {
  const navigate = useNavigate();

  const [session, setSession] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [isAdmin, setIsAdmin] = useState(false);
  const [impersonatedUserId, setImpersonatedUserId] = useState(null);

  const [profile, setProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [currentPost, setCurrentPost] = useState(null);

  const timerRef = useRef(null);

  const resetTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (session) {
        alert("🔒 Session expirée. Reconnexion requise.");
        supabase.auth.signOut();
        setSession(null);
      }
    }, 15 * 60 * 1000);
  };

  useEffect(() => {
    if (session) {
      ["mousemove", "keydown", "click", "scroll"].forEach(e =>
        window.addEventListener(e, resetTimer)
      );
      resetTimer();
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      ["mousemove", "keydown", "click", "scroll"].forEach(e =>
        window.removeEventListener(e, resetTimer)
      );
    };
  }, [session]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchAllData(session.user.id, session.user.email);
      else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setSession(session);
      if (session) fetchAllData(session.user.id, session.user.email);
      else setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchAllData = async (userId, email) => {
    try {
      const { data: profileData } = await supabase
        .from("business_profile")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      const enriched = profileData
        ? { ...profileData, email }
        : { name: "Nouveau Compte", email, subscription_tier: "basic" };

      setProfile(enriched);

      if (enriched.id) {
        const [r, c, p] = await Promise.all([
          supabase.from("reviews").select("*").eq("business_id", enriched.id),
          supabase.from("customers").select("*").eq("business_id", enriched.id),
          supabase.from("posts").select("*").eq("business_id", enriched.id).order("created_at", { ascending: false }),
        ]);
        if (r.data) setReviews(r.data);
        if (c.data) setCustomers(c.data);
        if (p.data) setPosts(p.data);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        Chargement…
      </div>
    );
  }

  if (!session) return <AuthForm />;

  const currentPlan = getPlanConfig(profile?.subscription_tier || "basic");

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        profile={profile}
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      <main className="flex-1 overflow-y-auto px-4 md:px-8">
        {activeTab === "dashboard" && (
          <Dashboard
            stats={{ reviews: reviews.length, clients: customers.length, posts: posts.length }}
            posts={posts}
            profile={profile}
            onGenerate={() => setActiveTab("generator")}
          />
        )}

        {activeTab === "generator" && (
          <Marketing
            posts={posts}
            currentPost={currentPost}
            setCurrentPost={setCurrentPost}
            profile={profile}
          />
        )}

        {activeTab === "reviews" && <Reviews reviews={reviews} />}
        {activeTab === "customers" && <Customers customers={customers} />}
        {activeTab === "webpage" && <WebPage profile={profile} setProfile={setProfile} />}
        {activeTab === "profile" && <Profile profile={profile} setProfile={setProfile} />}
        {activeTab === "promotions" && <Promotions />}
        {activeTab === "admin" && <Admin />}
      </main>
    </div>
  );
}

/* ---------------- ROUTES ---------------- */

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<AppLayout />} />
      <Route path="/marketing/:id" element={<Marketing />} />
    </Routes>
  );
}
