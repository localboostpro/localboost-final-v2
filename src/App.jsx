import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { supabase } from "./lib/supabase";

import Sidebar from "./components/Sidebar";
import Dashboard from "./views/Dashboard";
import Marketing from "./views/Marketing";
import Reviews from "./views/Reviews";
import Customers from "./views/Customers";
import WebPage from "./views/WebPage";
import Profile from "./views/Profile";
import Admin from "./views/Admin";
import AuthForm from "./components/AuthForm";

export default function App() {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isAdmin = useMemo(() => {
    return session?.user?.email === "admin@demo.fr";
  }, [session]);

  const fetchAllData = useCallback(async (userId, email) => {
    try {
      // 1. Profil (Harmonisé sur la colonne 'plan')
      const { data: profileData } = await supabase
        .from("business_profile")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      const userIsAdmin = email === "admin@demo.fr";
      const finalProfile = profileData 
        ? { ...profileData, email, is_admin: userIsAdmin } 
        : { name: "Nouveau compte", email, is_admin: userIsAdmin };
      
      setProfile(finalProfile);
      
      if (!profileData?.id) return;

      // 2. Avis (Chargement depuis la table 'reviews')
      const { data: reviewsData } = await supabase
        .from("reviews")
        .select("*")
        .eq("business_id", profileData.id)
        .order("created_at", { ascending: false });

      if (reviewsData) setReviews(reviewsData);
    } catch (e) { 
      console.error("❌ Erreur fetchAllData:", e); 
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session) {
        fetchAllData(data.session.user.id, data.session.user.email);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      if (s) { 
        fetchAllData(s.user.id, s.user.email); 
      } else { 
        setProfile(null); 
        setReviews([]); 
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchAllData]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!session) return <AuthForm />;

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden">
      <Sidebar profile={profile} isAdmin={isAdmin} isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
      <main className="flex-1 overflow-y-auto p-4 md:p-8 pt-20 md:pt-8 w-full">
        <Routes>
          <Route path="/" element={<Dashboard profile={profile} reviews={reviews} />} />
          <Route path="/reviews" element={<Reviews user={session.user} />} />
          <Route path="/profile" element={<Profile user={session.user} profile={profile} setProfile={setProfile} />} />
          <Route path="/admin" element={isAdmin ? <Admin /> : <Navigate to="/" />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  );
}
