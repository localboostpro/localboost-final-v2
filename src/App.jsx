import React, { useState, useEffect, useRef } from "react";
import { Routes, Route, useNavigate, useParams } from "react-router-dom";
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

/* ---------------- MARKETING ROUTE WRAPPER ---------------- */

function MarketingRoute(props) {
  const { id } = useParams();
  return <Marketing {...props} postId={id} />;
}

/* ---------------- MAIN APP ---------------- */

export default function App() {
  const [session, setSession] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [profile, setProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [currentPost, setCurrentPost] = useState(null);

  /* ---------- AUTH ---------- */

useEffect(() => {
  let mounted = true;

  supabase.auth.getSession().then(({ data: { session } }) => {
    if (!mounted) return;
    setSession(session);
    setLoading(false);
  });

  const { data: { subscription } } =
    supabase.auth.onAuthStateChange((_e, session) => {
      if (!mounted) return;
      setSession(session);
      setLoading(false);
    });

  return () => {
    mounted = false;
    subscription.unsubscribe();
  };
}, []);


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
      
      {/* MENU TOUJOURS PRÉSENT */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        profile={profile}
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      <main className="flex-1 overflow-y-auto px-4 md:px-8">
        <Routes>

          <Route
            path="/"
            element={
              <Dashboard
                stats={{ reviews: reviews.length, clients: customers.length, posts: posts.length }}
                posts={posts}
                profile={profile}
                onGenerate={() => setActiveTab("generator")}
              />
            }
          />

          <Route
            path="/marketing/:id"
            element={
              <MarketingRoute
                posts={posts}
                currentPost={currentPost}
                setCurrentPost={setCurrentPost}
                profile={profile}
              />
            }
          />

          <Route path="/reviews" element={<Reviews reviews={reviews} />} />
          <Route path="/customers" element={<Customers customers={customers} />} />
          <Route path="/webpage" element={<WebPage profile={profile} setProfile={setProfile} />} />
          <Route path="/profile" element={<Profile profile={profile} setProfile={setProfile} />} />
          <Route path="/promotions" element={<Promotions />} />
          <Route path="/admin" element={<Admin />} />

        </Routes>
      </main>
    </div>
  );
}
