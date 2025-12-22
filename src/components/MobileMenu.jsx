import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Wand2, MessageSquare, Users, Globe, Ticket, User, Shield, LogOut, X, Zap
} from "lucide-react";
import { supabase } from "../lib/supabase";

export default function MobileMenu({ isOpen, onClose, profile, isAdmin }) {
  const navigate = useNavigate();

  if (!isOpen) return null; // Si fermé, il n'existe même pas dans le DOM.

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
    window.location.reload();
  };

  const menuItems = [
    { to: "/", label: "Tableau de bord", icon: LayoutDashboard },
    { to: "/marketing", label: "Studio Marketing", icon: Wand2 },
    { to: "/reviews", label: "Avis Clients", icon: MessageSquare },
    { to: "/customers", label: "Fichier Clients", icon: Users },
    { to: "/webpage", label: "Ma Vitrine Web", icon: Globe },
    { to: "/promotions", label: "Offres & Promo", icon: Ticket },
    { to: "/profile", label: "Mon Établissement", icon: User },
  ];
  if (isAdmin) menuItems.push({ to: "/admin", label: "Administration", icon: Shield });

  return (
    <div className="fixed inset-0 z-[9999] flex justify-start">
      
      {/* 1. L'Overlay (Fond Noir) */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
      />

      {/* 2. Le Panneau Blanc */}
      <aside className="relative w-72 h-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-left duration-300">
        
        {/* Header du Menu */}
        <div className="p-6 border-b flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-slate-900 p-2 rounded-xl text-white"><Zap size={20} fill="currentColor"/></div>
            <div>
               <h1 className="text-lg font-black text-slate-900">LocalBoost</h1>
               <p className="text-[10px] text-slate-400 font-bold uppercase truncate max-w-[120px]">{profile?.name || "Pro"}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 bg-slate-100 rounded-full text-slate-500 hover:bg-rose-100 hover:text-rose-500 transition">
            <X size={20}/>
          </button>
        </div>

        {/* Liens */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {menuItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose} // Ferme le menu au clic sur un lien
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                  isActive ? "bg-indigo-600 text-white shadow-md" : "text-slate-500 hover:bg-slate-50"
                }`
              }
            >
              <Icon size={18} /> {label}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t bg-slate-50">
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 py-3 text-sm font-bold text-rose-500 bg-white border border-rose-200 rounded-xl shadow-sm">
            <LogOut size={16}/> Déconnexion
          </button>
        </div>

      </aside>
    </div>
  );
}
