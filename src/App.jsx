import React, { useState, useEffect } from "react";
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

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  const [profile, setProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [posts, setPosts] = useState([]);

  /* ---------- AUTH ---------- */
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
      if (data.session) {
        fetchAllData(data.session.user.id, data.session.user.email);
      }
    });

    const { data: { subscription } } =
      supabase.auth.onAuthStateChange((_e, session) => {
        setSession(session);
        setLoading(false);
        if (session) {
          fetchAllData(session.user.id, session.user.email);
        }
      });

    return () => subscription.unsubscribe();
  }, []);

  /* ---------- DATA ---------- */
  const fetchAllData = async (userId, email) => {
    try {
      // Profil
      const { data: profileData } = await supabase
        .from("business_profile")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      const finalProfile = profileData
        ? { ...profileData, email }
        : { name: "Nouveau compte", email };

      setProfile(finalProfile);

      if (!profileData?.id) return;

      // Données liées au business
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
      console.error("Erreur chargement données", e);
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

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden">

      <Sidebar profile={profile} />

      <main className="flex-1 overflow-y-auto px-4 md:px-8">
        <Routes>

          <Route
            path="/"
            element={
              <Dashboard
                stats={{
                  clients: customers.length,
                  reviews: reviews.length,
                  posts: posts.length,
                }}
                posts={posts}
                profile={profile}
                onGenerate={() => navigate("/marketing")}
              />
            }
          />

          <Route
            path="/marketing"
            element={<Marketing posts={posts} profile={profile} />}
          />

          <Route
            path="/marketing/:id"
            element={<Marketing posts={posts} profile={profile} />}
          />

          <Route path="/reviews" element={<Reviews reviews={reviews} />} />
          <Route path="/customers" element={<Customers customers={customers} />} />
          <Route path="/webpage" element={<WebPage profile={profile} setProfile={setProfile} />} />
          <Route path="/profile" element={<Profile profile={profile} setProfile={setProfile} />} />
          <Route path="/promotions" element={<Promotions />} />
          <Route path="/admin" element={<Admin />} />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  );
}
