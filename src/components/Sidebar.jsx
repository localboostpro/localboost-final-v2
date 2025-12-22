import React, { useMemo } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, Wand2, MessageSquare, Users, Globe, Ticket, User, Shield, LogOut, Zap } from "lucide-react";
import { supabase } from "../lib/supabase";

export default function Sidebar({ profile, isAdmin }) {
  const navigate = useNavigate();

  const menuItems = useMemo(() => {
    const items = [
      { to: "/", label: "Tableau de bord", icon: LayoutDashboard },
      { to: "/marketing", label: "Studio Marketing", icon: Wand2 },
      { to: "/reviews", label: "Avis Clients", icon: MessageSquare },
      { to: "/customers", label: "Fichier Clients", icon: Users },
      { to: "/webpage", label: "Ma Vitrine Web", icon: Globe },
      { to: "/promotions", label: "Offres & Promo", icon: Ticket },
      { to: "/profile", label: "Mon Établissement", icon: User },
    ];
    if (isAdmin) items.push({ to: "/admin", label: "Administration", icon: Shield });
    return items;
  }, [isAdmin]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
    window.location.reload();
  };

  // VERSION DESKTOP UNIQUEMENT (Hidden on Mobile)
  return (
    <aside className="hidden md:flex flex-col w-64 h-screen bg-white border-r border-slate-100 sticky top-0">
      
      {/* HEADER */}
      <div className="p-6 border-b border-slate-50 flex items-center gap-3">
        <div className="bg-slate-900 p-2 rounded-xl text-white shadow-lg"><Zap size={20} fill="currentColor"/></div>
        <div>
           <h1 className="text-lg font-black text-slate-900 leading-none">LocalBoost</h1>
           <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 truncate max-w-[120px]">{profile?.name || "Pro"}</p>
        </div>
      </div>

      {/* MENU */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto custom-scrollbar">
        {menuItems.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-200 ${isActive ? "bg-indigo-600 text-white shadow-md translate-x-1" : "text-slate-500 hover:bg-slate-50 hover:text-indigo-600"}`}>
            <Icon size={18} /> {label}
          </NavLink>
        ))}
      </nav>

      {/* FOOTER */}
      <div className="p-4 border-t border-slate-50 bg-slate-50/50 pb-4">
        <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 py-3 text-sm font-bold text-rose-500 bg-white border border-rose-100 hover:bg-rose-50 rounded-xl transition shadow-sm">
          <LogOut size={16} /> Déconnexion
        </button>
      </div>
    </aside>
  );
}
