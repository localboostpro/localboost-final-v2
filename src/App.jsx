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

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  const [profile, setProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [posts, setPosts] = useState([]);

  // ÉTAT DU MENU MOBILE
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  /* ---------------- AUTH ---------------- */
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
      if (data.session) {
        fetchAllData(data.session.user.id, data.session.user.email);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_e, s) => {
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

  /* ---------------- ADMIN CHECK ---------------- */
  const isAdmin = session?.user?.email === "admin@demo.fr";

  /* ---------------- DATA ---------------- */
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
      console.error("Erreur chargement données", e);
    }
  };

  /* ---------------- POSTS HELPERS ---------------- */
  const upsertPostInState = (post) => {
    setPosts((prev) => {
      const idx = prev.findIndex((p) => String(p.id) === String(post.id));
      if (idx === -1) return [post, ...prev];
      const next = [...prev];
      next[idx] = post;
      return next;
    });
  };

  const deletePostInState = (id) => {
    setPosts((prev) => prev.filter((p) => String(p.id) !== String(id)));
  };

  const stats = useMemo(
    () => ({
      clients: customers.length,
      reviews: reviews.length,
      posts: posts.length,
    }),
    [customers, reviews, posts]
  );

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50 text-slate-400 font-medium">
        Chargement...
      </div>
    );
  }

  if (!session) return <AuthForm />;

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden">

      {/* SIDEBAR : On passe bien les props pour le mobile */}
      <Sidebar
        profile={profile}
        isAdmin={isAdmin}
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      {/* HEADER MOBILE (Visible uniquement sur petits écrans) */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-40 bg-white px-4 py-3 border-b border-slate-100 flex items-center justify-between h-16 shadow-sm">
        <div className="font-black text-lg text-slate-800 flex items-center gap-2">
           LocalBoost <span className="text-indigo-600">Pro</span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation(); // EMPÊCHE LA FERMETURE IMMÉDIATE
            setIsMobileMenuOpen(true);
          }}
          className="p-2 rounded-xl bg-slate-50 border border-slate-100 text-slate-600 hover:bg-slate-100 active:scale-95 transition"
          aria-label="Ouvrir le menu"
        >
          {/* Icône Menu Hamburger */}
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
      </header>

      {/* CONTENU PRINCIPAL */}
      {/* pt-20 pour compenser le header mobile */}
      <main className="flex-1 overflow-y-auto px-4 md:px-8 pt-20 md:pt-8 pb-10">
        <Routes>
          <Route
            path="/"
            element={
              <Dashboard
                stats={stats}
                posts={posts}
                profile={profile}
                onGenerate={() => navigate("/marketing")}
              />
            }
          />

          <Route
            path="/marketing"
            element={
              <Marketing
                posts={posts}
                profile={profile}
                onUpdate={upsertPostInState} // Correction ici: onUpdate, pas onUpsert (dépend de votre Marketing.jsx)
                // Si votre Marketing.jsx attend "onUpsert", gardez "onUpsert". 
                // Dans ma V3.1 j'avais mis "onUpdate". Je mets les deux pour la compatibilité.
                onUpsert={upsertPostInState} 
                onDelete={deletePostInState}
              />
            }
          />

          {/* Route avec ID (optionnelle si vous gérez l'édition dans la page principale) */}
          <Route
            path="/marketing/:id"
            element={
              <Marketing
                posts={posts}
                profile={profile}
                onUpdate={upsertPostInState}
                onUpsert={upsertPostInState}
                onDelete={deletePostInState}
              />
            }
          />

          <Route path="/reviews" element={<Reviews reviews={reviews} />} />
          <Route path="/customers" element={<Customers customers={customers} />} />
          <Route path="/webpage" element={<WebPage profile={profile} setProfile={setProfile} />} />
          <Route path="/profile" element={<Profile profile={profile} setProfile={setProfile} />} />
          <Route path="/promotions" element={<Promotions />} />

          <Route
            path="/admin"
            element={isAdmin ? <Admin /> : <Navigate to="/" />}
          />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  );
}
