import React, { useMemo } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Wand2, MessageSquare, Users, Globe, Ticket, User, Shield, LogOut, X, Zap
} from "lucide-react";
// ATTENTION : Vérifiez bien que c'est deux points ci-dessous
import { supabase } from "../lib/supabase";

export default function Sidebar({ profile, isAdmin, isOpen, onClose }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
    window.location.reload();
  };

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

  // --- RENDU DES LIENS (Utilisé pour mobile et desktop) ---
  const MenuContent = ({ mobile = false }) => (
    <>
      <div className="p-6 border-b border-slate-50 flex items-center justify-between shrink-0 h-20">
        <div className="flex items-center gap-3">
          <div className="bg-slate-900 p-2 rounded-xl text-white shadow-lg"><Zap size={20} fill="currentColor"/></div>
          <div>
             <h1 className="text-lg font-black text-slate-900 leading-none">LocalBoost <span className="text-indigo-600">Pro</span></h1>
             {profile?.name && <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 truncate max-w-[120px]">{profile.name}</p>}
          </div>
        </div>
        {mobile && (
          <button onClick={onClose} className="p-2 text-slate-400 bg-slate-50 rounded-xl">
            <X size={24} />
          </button>
        )}
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {menuItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={mobile ? onClose : undefined}
            className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${isActive ? "bg-indigo-600 text-white shadow-md translate-x-1" : "text-slate-500 hover:bg-slate-50 hover:text-indigo-600"}`}
          >
            <Icon size={18} /> {label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-50 bg-slate-50/50 pb-8 md:pb-4">
        <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 py-3 text-sm font-bold text-rose-500 bg-white border border-rose-100 hover:bg-rose-50 rounded-xl shadow-sm">
          <LogOut size={16} /> Déconnexion
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* 1. SIDEBAR DESKTOP (Cachée sur mobile) */}
      <aside className="hidden md:flex flex-col w-72 bg-white border-r border-slate-100 h-screen sticky top-0 z-30">
        <MenuContent />
      </aside>

      {/* 2. SIDEBAR MOBILE (S'affiche par-dessus tout) */}
      {/* L'overlay et le menu n'existent dans le DOM que si isOpen est vrai */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex md:hidden">
          {/* FOND NOIR */}
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={onClose}
          />
          
          {/* MENU BLANC */}
          <aside className="relative w-72 h-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-left duration-300">
            <MenuContent mobile={true} />
          </aside>
        </div>
      )}
    </>
  );
}
