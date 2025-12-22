import React from "react";
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
} from "lucide-react";
import { supabase } from "../lib/supabase";

export default function Sidebar({ profile, isAdmin }) {
  const navigate = useNavigate();

  const menuItems = [
    { to: "/", label: "Tableau de bord", icon: LayoutDashboard },
    { to: "/marketing", label: "Studio Marketing", icon: Wand2 },
    { to: "/reviews", label: "Avis Clients", icon: MessageSquare },
    { to: "/customers", label: "Fichier Clients", icon: Users },
    { to: "/webpage", label: "Ma Vitrine Web", icon: Globe },
    { to: "/promotions", label: "Offres & Promo", icon: Ticket },
    { to: "/profile", label: "Mon Établissement", icon: User },
  ];

  if (isAdmin) {
    menuItems.push({
      to: "/admin",
      label: "Administration",
      icon: Shield,
    });
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
    window.location.reload();
  };

  return (
    <aside className="w-64 shrink-0 bg-white border-r border-slate-100 flex flex-col h-screen">
      {/* HEADER */}
      <div className="p-6 border-b">
        <h1 className="text-xl font-black text-slate-900">
          LocalBoost <span className="text-indigo-600">Pro</span>
        </h1>
        {profile?.name && (
          <p className="text-xs text-slate-500 mt-1 truncate">
            {profile.name}
          </p>
        )}
      </div>

      {/* MENU */}
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold transition ${
                isActive
                  ? "bg-indigo-600 text-white shadow"
                  : "text-slate-500 hover:bg-slate-50"
              }`
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
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-2 text-sm font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition"
        >
          <LogOut size={16} />
          Déconnexion
        </button>
      </div>
    </aside>
  );
}
