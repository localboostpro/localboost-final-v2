import React, { useEffect, useState, useMemo } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { supabase } from "./lib/supabase";
import { DataProvider } from "./contexts/DataContext";
import Sidebar from "./components/Sidebar";
import Dashboard from "./views/Dashboard";
import Marketing from "./views/Marketing";
import Reviews from "./views/Reviews";
import Customers from "./views/Customers";
import Profile from "./views/Profile";
import Promotions from "./views/Promotions";
import Admin from "./views/Admin";
import AuthForm from "./components/AuthForm";

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isAdmin = useMemo(
    () => session?.user?.email === "admin@demo.fr",
    [session]
  );

  useEffect(() => {
    let cancelled = false;

    // 🔹 Récupération session initiale
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      if (!cancelled) {
        setSession(s);
        setLoading(false);
      }
    });

    // 🔹 Écoute des changements d'auth (avec filtrage événements)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, s) => {
      if (cancelled) return;

      if (event === "SIGNED_IN" || event === "INITIAL_SESSION") {
        setSession(s);
      } else if (event === "SIGNED_OUT") {
        setSession(null);
      } else if (event === "TOKEN_REFRESHED") {
        setSession(s); // ✅ Juste update session, pas de refetch
      }
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent mx-auto"></div>
      </div>
    );
  }

  if (!session) {
    return <AuthForm />;
  }

  return (
    <DataProvider session={session}>
      <div className="flex h-screen bg-[#F8FAFC] overflow-hidden">
        <Sidebar
          isAdmin={isAdmin}
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
        />
        <main className="flex-1 overflow-y-auto p-4 md:p-8 pt-20 md:pt-8 w-full">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/marketing" element={<Marketing />} />
            <Route path="/reviews" element={<Reviews />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/profile" element={<Profile user={session.user} />} />
            <Route path="/promotions" element={<Promotions />} />
            <Route
              path="/admin"
              element={isAdmin ? <Admin /> : <Navigate to="/" />}
            />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </DataProvider>
  );
}
