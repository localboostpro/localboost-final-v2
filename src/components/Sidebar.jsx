import React, { useMemo } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Wand2,
  MessageSquare,
  Users,
  Globe,
  Ticket,
  User,
  Shield,
  LogOut,
  X,
  Zap
} from "lucide-react";
// CORRECTION IMPORTANTE DU CHEMIN (../ au lieu de ./)
import { supabase } from "../lib/supabase";

export default function Sidebar(props) {
  // On sépare complètement le rendu Mobile et Desktop pour éviter les bugs d'affichage
  return (
    <>
      {/* VUE DESKTOP (Cachée sur mobile) */}
      <div className="hidden md:block h-full">
        <DesktopSidebar {...props} />
      </div>

      {/* VUE MOBILE (Cachée sur desktop) */}
      <div className="md:hidden">
        <MobileSidebar {...props} />
      </div>
    </>
  );
}

// --- SOUS-COMPOSANT : MENU DESKTOP ---
function DesktopSidebar({ profile, isAdmin }) {
  const { menuItems, handleLogout } = useSidebarLogic(isAdmin);

  return (
    <aside className="w-72 bg-white border-r border-slate-100 flex flex-col h-screen sticky top-0">
      <div className="p-6 border-b border-slate-50 flex items-center gap-3 shrink-0 h-20">
        <div className="bg-slate-900 p-2 rounded-xl text-white shadow-lg">
          <Zap size={20} fill="currentColor" />
        </div>
        <div>
           <h1 className="text-lg font-black text-slate-900 leading-none">
             LocalBoost <span className="text-indigo-600">Pro</span>
           </h1>
           {profile?.name && (
             <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 truncate max-w-[120px]">
               {profile.name}
             </p>
           )}
        </div>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => (
          <MenuItem key={item.to} item={item} />
        ))}
      </nav>

      <div className="p-4 border-t border-slate-50 bg-slate-50/50 pb-4">
        <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 py-3 text-sm font-bold text-rose-500 bg-white border border-rose-100 hover:bg-rose-50 rounded-xl transition shadow-sm">
          <LogOut size={16} /> Déconnexion
        </button>
      </div>
    </aside>
  );
}

// --- SOUS-COMPOSANT : MENU MOBILE ---
function MobileSidebar({ profile, isAdmin, isOpen, onClose }) {
  const { menuItems, handleLogout } = useSidebarLogic(isAdmin);

  // Si fermé, on ne rend RIEN (évite le flash blanc)
  // On garde juste l'overlay pour l'animation de fermeture si besoin, 
  // mais ici on fait simple : Open = Visible, Closed = Invisible.
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex justify-start">
      {/* FOND NOIR */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* PANNEAU BLANC */}
      <aside className="relative w-72 h-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-left duration-300">
        <div className="p-6 border-b border-slate-50 flex items-center justify-between shrink-0 h-20">
          <div className="flex items-center gap-3">
            <div className="bg-slate-900 p-2 rounded-xl text-white">
              <Zap size={20} fill="currentColor" />
            </div>
            <h1 className="text-lg font-black text-slate-900">LocalBoost</h1>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-rose-500 bg-slate-50 rounded-xl">
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <MenuItem key={item.to} item={item} onClick={onClose} />
          ))}
        </nav>

        <div className="p-4 border-t border-slate-50 bg-slate-50/50 pb-8">
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 py-3 text-sm font-bold text-rose-500 bg-white border border-rose-100 hover:bg-rose-50 rounded-xl">
            <LogOut size={16} /> Déconnexion
          </button>
        </div>
      </aside>
    </div>
  );
}

// --- LOGIQUE PARTAGÉE ---
function useSidebarLogic(isAdmin) {
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

  return { menuItems, handleLogout };
}

// --- COMPOSANT LIEN ---
function MenuItem({ item, onClick }) {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.to}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-200 ${
          isActive
            ? "bg-indigo-600 text-white shadow-md shadow-indigo-200 translate-x-1"
            : "text-slate-500 hover:bg-slate-50 hover:text-indigo-600"
        }`
      }
    >
      <Icon size={18} />
      {item.label}
    </NavLink>
  );
}
