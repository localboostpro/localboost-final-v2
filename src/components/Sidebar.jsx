import React, { useMemo } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Wand2, MessageSquare, Users, Globe, Ticket, User, Shield, LogOut, X, Zap
} from "lucide-react";
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

  const MenuContent = ({ mobile = false }) => (
    <div className="flex flex-col h-full bg-white">
      {/* HEADER AVEC LOGO */}
      <div className="p-6 border-b border-slate-100 flex items-center justify-between h-20 shrink-0">
        <div className="flex items-center gap-3">
          {/* LOGIQUE LOGO : Si image, on affiche l'image, sinon l'icône */}
          {profile?.logo_url ? (
            <img 
              src={profile.logo_url} 
              alt="Logo" 
              className="w-10 h-10 rounded-xl object-cover border border-slate-200"
            />
          ) : (
            <div className="bg-slate-900 p-2 rounded-xl text-white">
              <Zap size={20} fill="currentColor"/>
            </div>
          )}
          
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
        
        {mobile && (
          <button onClick={onClose} className="p-2 bg-slate-100 rounded-lg text-slate-600 hover:bg-slate-200">
            <X size={24} />
          </button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto p-4 space-y-2">
        {menuItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={mobile ? onClose : undefined}
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

      <div className="p-4 border-t border-slate-100 bg-slate-50">
        <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 py-3 text-sm font-bold text-rose-600 bg-white border border-rose-200 rounded-xl hover:bg-rose-50">
          <LogOut size={16} /> Déconnexion
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* BUREAU */}
      <aside className="hidden md:flex h-screen w-72 flex-col border-r border-slate-200 sticky top-0 bg-white z-30">
        <MenuContent />
      </aside>

      {/* MOBILE */}
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex md:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
          <aside className="relative w-[85%] max-w-sm h-full shadow-2xl bg-white animate-in slide-in-from-left duration-200">
            <MenuContent mobile={true} />
          </aside>
        </div>
      )}
    </>
  );
}
