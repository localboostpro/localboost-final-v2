import React, { useEffect, useMemo, useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { supabase } from "./lib/supabase";

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

export default function App() {
  const navigate = useNavigate();

  const [isMounted, setIsMounted] = useState(false); // ✅ clé du fix
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  const [profile, setProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [posts, setPosts] = useState([]);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  /* 🔐 HYDRATION FIX */
  useEffect(() => {
    setIsMounted(true);
    setIsMobileMenuOpen(false);
  }, []);

  /* ---------------- AUTH ---------------- */
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
      if (data.session) {
        fetchAllData(data.session.user.id, data.session.user.email);
      }
    });

    const { data: { subscription } } =
      supabase.auth.onAuthStateChange((_e, s) => {
        setSession(s);
        setLoading(false);
        if (s) {
          fetchAllData(s.user.id, s.user.email);
        } else {
          setProfile(null);
          setReviews([]);
          setCustomers([]);
          setPosts([]);
        }
      });

    return () => subscription.unsubscribe();
  }, []);

  const isAdmin = session?.user?.email === "admin@demo.fr";

  const fetchAllData = async (userId, email) => {
    try {
      const { data: profileData } = await supabase
        .from("business_profile")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      const finalProfile = profileData
        ? { ...profileData, email, is_admin: isAdmin }
        : { name: "Nouveau compte", email, is_admin: isAdmin };

      setProfile(finalProfile);

      if (!profileData?.id) return;

      const [r, c, p] = await Promise.all([
        supabase.from("reviews").select("*").eq("business_id", profileData.id),
        supabase.from("customers").select("*").eq("business_id", profileData.id),
        supabase
          .from("posts")
          .select("*")
          .eq("business_id", profileData.id)
          .order("created_at", { ascending: false }),
      ]);

      if (r.data) setReviews(r.data);
      if (c.data) setCustomers(c.data);
      if (p.data) setPosts(p.data);
    } catch (e) {
      console.error(e);
    }
  };

  const stats = useMemo(() => ({
    clients: customers.length,
    reviews: reviews.length,
    posts: posts.length,
  }), [customers, reviews, posts]);

  /* ⛔ STOP RENDER AVANT HYDRATION */
  if (!isMounted || loading) {
    return <div className="h-screen bg-[#F8FAFC]" />;
  }

  if (!session) return <AuthForm />;

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden">

      {/* SIDEBAR */}
      <Sidebar
        profile={profile}
        isAdmin={isAdmin}
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      {/* HEADER MOBILE */}
<button
  onClick={(e) => {
    e.stopPropagation();       // ⛔ empêche le clic de remonter
    setIsMobileMenuOpen(true);
  }}
  className="p-2 rounded-xl bg-slate-100 border shadow"
  aria-label="Ouvrir le menu"
>
  ☰
</button>
      </header>

      {/* MAIN */}
      <main className="flex-1 overflow-y-auto px-4 md:px-8 pt-14 md:pt-8 pb-10">
        <Routes>
          <Route path="/" element={
            <Dashboard
              stats={stats}
              posts={posts}
              profile={profile}
              onGenerate={() => navigate("/marketing")}
            />
          } />

          <Route path="/marketing" element={<Marketing posts={posts} profile={profile} />} />
          <Route path="/marketing/:id" element={<Marketing posts={posts} profile={profile} />} />
          <Route path="/reviews" element={<Reviews reviews={reviews} />} />
          <Route path="/customers" element={<Customers customers={customers} />} />
          <Route path="/webpage" element={<WebPage profile={profile} setProfile={setProfile} />} />
          <Route path="/profile" element={<Profile profile={profile} setProfile={setProfile} />} />
          <Route path="/promotions" element={<Promotions />} />
          <Route path="/admin" element={isAdmin ? <Admin /> : <Navigate to="/" />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  );
}
