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
import { supabase } from "../lib/supabase";

export default function Sidebar({ profile, isAdmin, isOpen = false, onClose = () => {} }) {
  const navigate = useNavigate();

  // --- SUPPRESSION DU USEEFFECT (C'est lui qui faisait clignoter le menu) ---
  
  // Nouvelle fonction pour fermer le menu UNIQUEMENT quand on clique sur un lien
  const handleLinkClick = () => {
    if (isOpen) onClose();
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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
    window.location.reload();
  };

  return (
    <>
      {/* OVERLAY (FOND NOIR) - Z-INDEX TRÈS ÉLEVÉ */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998] md:hidden animate-in fade-in duration-200"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* SIDEBAR - Z-INDEX MAXIMUM */}
      <aside
        className={`
          fixed top-0 left-0 bottom-0 z-[9999] w-72 bg-white border-r border-slate-100 flex flex-col
          transition-transform duration-300 ease-out shadow-2xl md:shadow-none
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0 md:static md:h-screen md:z-0
        `}
      >
        {/* HEADER */}
        <div className="p-6 border-b border-slate-50 flex items-center justify-between shrink-0 h-20">
          <div className="flex items-center gap-3">
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

          {/* Bouton Fermer (Mobile) */}
          <button
            onClick={onClose}
            className="md:hidden p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* MENU */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto custom-scrollbar">
          {menuItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={handleLinkClick} // <--- C'est ICI qu'on ferme le menu maintenant
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-200 ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-200 translate-x-1"
                    : "text-slate-500 hover:bg-slate-50 hover:text-indigo-600"
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* FOOTER */}
        <div className="p-4 border-t border-slate-50 bg-slate-50/50 shrink-0 pb-8 md:pb-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-3 text-sm font-bold text-rose-500 bg-white border border-rose-100 hover:bg-rose-50 rounded-xl transition shadow-sm active:scale-95"
          >
            <LogOut size={16} />
            Déconnexion
          </button>
        </div>
      </aside>
    </>
  );
}
