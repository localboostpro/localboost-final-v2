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
  const [promotions, setPromotions] = useState([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isAdmin = useMemo(() => session?.user?.email === "admin@demo.fr", [session]);

  const fetchAllData = useCallback(async (userId, email) => {
    try {
      setLoading(true);
      const { data: profileData } = await supabase
        .from("business_profile")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (!profileData) {
        setProfile({ name: "Nouveau compte", email, plan: 'basic' });
        setLoading(false);
        return;
      }

      const [r, c, p, prom] = await Promise.all([
        supabase.from("reviews").select("*").eq("business_id", profileData.id).order("created_at", { ascending: false }),
        supabase.from("customers").select("*").eq("business_id", profileData.id),
        supabase.from("posts").select("*").eq("business_id", profileData.id).order("created_at", { ascending: false }),
        supabase.from("promotions").select("*").eq("business_id", profileData.id).order("created_at", { ascending: false }),
      ]);

      setProfile({ ...profileData, email });
      setReviews(r.data || []);
      setCustomers(c.data || []);
      setPosts(p.data || []);
      setPromotions(prom.data || []);
    } catch (e) {
      console.error("❌ Erreur fetchAllData:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      if (s) fetchAllData(s.user.id, s.user.email);
      else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      if (s) fetchAllData(s.user.id, s.user.email);
      else { setProfile(null); setLoading(false); }
    });
    return () => subscription.unsubscribe();
  }, [fetchAllData]);

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-slate-50">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent mx-auto"></div>
    </div>
  );

  if (!session) return <AuthForm />;

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden">
      <Sidebar profile={profile} isAdmin={isAdmin} isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
      <main className="flex-1 overflow-y-auto p-4 md:p-8 pt-20 md:pt-8 w-full">
        <Routes>
          <Route path="/" element={<Dashboard profile={profile} reviews={reviews} posts={posts} customers={customers} />} />
          <Route path="/marketing" element={<Marketing posts={posts} profile={profile} />} />
          <Route path="/reviews" element={<Reviews reviews={reviews} profile={profile} />} />
          <Route path="/customers" element={<Customers customers={customers} />} />
          <Route path="/profile" element={<Profile user={session.user} profile={profile} setProfile={setProfile} />} />
          <Route path="/promotions" element={<Promotions profile={profile} promotions={promotions} setPromotions={setPromotions} />} />
          <Route path="/admin" element={isAdmin ? <Admin /> : <Navigate to="/" />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  );
}
