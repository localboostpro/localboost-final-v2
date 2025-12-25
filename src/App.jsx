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
  
  // Données
  const [profile, setProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [posts, setPosts] = useState([]);
  
  // ÉTAT DU MENU MOBILE
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // ✅ STABILISER isAdmin AVEC useMemo (ne change que si l'email change)
  const isAdmin = useMemo(() => {
    return session?.user?.email === "admin@demo.fr";
  }, [session?.user?.email]);

  // ✅ FONCTION fetchAllData (SANS isAdmin dans les dépendances)
  const fetchAllData = async (userId, email) => {
    try {
      const { data: profileData } = await supabase
        .from("business_profile")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      // ✅ Calcul direct de is_admin (pas de dépendance externe)
      const userIsAdmin = email === "admin@demo.fr";

      const finalProfile = profileData 
        ? { ...profileData, email, is_admin: userIsAdmin } 
        : { name: "Nouveau compte", email, is_admin: userIsAdmin };
      
      setProfile(finalProfile);
      
      if (!profileData?.id) return;

      const [r, c, p] = await Promise.all([
        supabase.from("reviews").select("*").eq("business_id", profileData.id),
        supabase.from("customers").select("*").eq("business_id", profileData.id),
        supabase.from("posts").select("*").eq("business_id", profileData.id).order("created_at", { ascending: false }),
      ]);

      if (r.data) setReviews(r.data);
      if (c.data) setCustomers(c.data);
      if (p.data) setPosts(p.data);
    } catch (e) { 
      console.error("❌ Erreur fetchAllData:", e); 
    }
  };

  // ✅ AUTH (CHARGE UNE SEULE FOIS)
  useEffect(() => {
    let isMounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!isMounted) return;
      
      setSession(data.session);
      setLoading(false);
      
      if (data.session) {
        fetchAllData(data.session.user.id, data.session.user.email);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => {
      if (!isMounted) return;
      
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

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []); // ← Dépendances VIDES = 1 seul chargement

  const upsertPostInState = (post) => {
    setPosts((prev) => {
      const idx = prev.findIndex((p) => String(p.id) === String(post.id));
      if (idx === -1) return [post, ...prev];
      const next = [...prev]; 
      next[idx] = post; 
      return next;
    });
  };

  const deletePostInState = (id) => setPosts((prev) => prev.filter((p) => String(p.id) !== String(id)));

  const stats = useMemo(() => ({ 
    clients: customers.length, 
    reviews: reviews.length, 
    posts: posts.length 
  }), [customers.length, reviews.length, posts.length]); // ✅ Dépendances optimisées

  // ✅ LOADING
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-200 border-t-indigo-600 mx-auto"></div>
          <p className="mt-6 text-slate-600 font-semibold">Chargement de votre espace...</p>
        </div>
      </div>
    );
  }

  // ✅ PAS DE SESSION
  if (!session) return <AuthForm />;

  // ✅ COMPOSANT PROTÉGÉ ADMIN
  const ProtectedAdmin = () => {
    if (!isAdmin) {
      return <Navigate to="/" replace />;
    }
    return <Admin />;
  };

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
      <header className="md:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-slate-200 px-4 h-16 flex items-center justify-between shadow-sm">
        <div className="font-black text-lg text-slate-900 flex items-center gap-2">
          LocalBoost <span className="text-indigo-600 text-xs bg-indigo-50 px-2 py-0.5 rounded">PRO</span>
        </div>
        
        <button 
          onClick={(e) => {
            e.stopPropagation();
            setIsMobileMenuOpen(true);
          }}
          className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 active:scale-95 transition-transform"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="4" x2="20" y1="12" y2="12"/>
            <line x1="4" x2="20" y1="6" y2="6"/>
            <line x1="4" x2="20" y1="18" y2="18"/>
          </svg>
        </button>
      </header>

      {/* CONTENU PRINCIPAL */}
      <main className="flex-1 overflow-y-auto px-4 md:px-8 pt-20 md:pt-8 pb-10 w-full">
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
                onUpdate={upsertPostInState} 
                onUpsert={upsertPostInState} 
                onDelete={deletePostInState} 
              />
            } 
          />
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
          <Route 
            path="/profile" 
            element={<Profile user={session?.user} profile={profile} setProfile={setProfile} />} 
          />
          <Route path="/promotions" element={<Promotions />} />
          <Route path="/admin" element={<ProtectedAdmin />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
