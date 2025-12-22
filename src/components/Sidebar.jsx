import React, { useEffect, useMemo } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
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
} from "lucide-react";
import { supabase } from "../lib/supabase";

export default function Sidebar({ profile, isAdmin, isOpen = false, onClose = () => {} }) {
  const navigate = useNavigate();
  const location = useLocation();

  // Ferme le menu mobile quand on change de page (évite les états “bizarres”)
  useEffect(() => {
    onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

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
      {/* OVERLAY (mobile uniquement) */}
      <div
        className={[
          "fixed inset-0 bg-black/40 transition-opacity md:hidden",
          "z-[60]",
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
        ].join(" ")}
        onClick={onClose}
      />

      {/* SIDEBAR */}
      <aside
        className={[
          // Mobile: panneau coulissant
          "fixed top-0 left-0 h-full w-72 bg-white border-r border-slate-100",
          "transform transition-transform duration-300 ease-out",
          "z-[70]",
          isOpen ? "translate-x-0" : "-translate-x-full",

          // Desktop: sidebar fixe dans le layout
          "md:relative md:translate-x-0 md:w-64 md:flex md:flex-col md:h-screen",
          "flex flex-col",
        ].join(" ")}
        role="dialog"
        aria-modal="true"
        aria-hidden={!isOpen ? "true" : "false"}
        onClick={(e) => e.stopPropagation()} // empêche la fermeture si clic dans le panneau
      >
        {/* HEADER */}
        <div className="p-6 border-b flex items-center justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-xl font-black text-slate-900">
              LocalBoost <span className="text-indigo-600">Pro</span>
            </h1>
            {profile?.name && (
              <p className="text-xs text-slate-500 mt-1 truncate">{profile.name}</p>
            )}
          </div>

          {/* Close (mobile) */}
          <button
            type="button"
            onClick={onClose}
            className="md:hidden p-2 rounded-xl hover:bg-slate-100"
            aria-label="Fermer le menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* MENU */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                [
                  "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold transition",
                  isActive
                    ? "bg-indigo-600 text-white shadow"
                    : "text-slate-500 hover:bg-slate-50",
                ].join(" ")
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* FOOTER */}
        <div className="p-4 border-t">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2 text-sm font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition"
          >
            <LogOut size={16} />
            Déconnexion
          </button>
        </div>
      </aside>
    </>
  );
}
