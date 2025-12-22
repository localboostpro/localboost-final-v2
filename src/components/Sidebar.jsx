import React from "react";
import {
  LayoutDashboard,
  Wand2,
  MessageSquare,
  Users,
  Ticket,
  User,
  LogOut,
  X,
  Zap,
  PlusCircle,
  Globe
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { useNavigate, useLocation } from "react-router-dom";

export default function Sidebar({ profile, isOpen, onClose }) {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { path: "/", label: "Tableau de bord", icon: <LayoutDashboard size={20} /> },
    { path: "/marketing", label: "Studio Créatif", icon: <Wand2 size={20} /> },
    { path: "/reviews", label: "Avis Clients", icon: <MessageSquare size={20} /> },
    { path: "/customers", label: "Fichier Clients", icon: <Users size={20} /> },
    { path: "/webpage", label: "Ma Vitrine Web", icon: <Globe size={20} /> },
    { path: "/promotions", label: "Offres & Promo", icon: <Ticket size={20} /> },
    { path: "/profile", label: "Mon Établissement", icon: <User size={20} /> },
  ];

  const isActive = (path) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  const handleLogout = async () => {
    if (window.confirm("Voulez-vous vraiment vous déconnecter ?")) {
      await supabase.auth.signOut();
      window.location.href = "/";
    }
  };

  return (
    <>
      {/* Overlay mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 z-40 md:hidden backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 z-50 w-72 bg-white border-r border-slate-100 flex flex-col
          transition-transform duration-300
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0 md:static
          h-[100dvh] md:h-screen
          shadow-2xl md:shadow-none
        `}
      >
        {/* Header */}
        <div className="p-8 flex flex-col gap-6 border-b border-slate-50">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-slate-900 p-2 rounded-xl text-white">
                <Zap size={24} />
              </div>
              <h1 className="text-xl font-black text-slate-900">
                LocalBoost <span className="text-indigo-600">Pro</span>
              </h1>
            </div>
            <button onClick={onClose} className="md:hidden text-slate-400">
              <X size={24} />
            </button>
          </div>

          {/* Profil */}
          <div>
            {profile?.logo_url ? (
              <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border">
                <img
                  src={profile.logo_url}
                  className="w-10 h-10 rounded-lg object-cover"
                  alt="Logo"
                />
                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase">
                    Espace Pro
                  </div>
                  <div className="font-bold text-sm truncate">
                    {profile.name}
                  </div>
                </div>
              </div>
            ) : (
              <button
                onClick={() => {
                  navigate("/profile");
                  onClose();
                }}
                className="w-full border-2 border-dashed border-slate-200 rounded-2xl p-3 text-xs font-bold text-slate-400 hover:text-indigo-600 hover:border-indigo-200"
              >
                <PlusCircle size={16} /> Ajouter votre logo
              </button>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => {
                navigate(item.path);
                onClose();
              }}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold text-sm transition-all ${
                isActive(item.path)
                  ? "bg-indigo-600 text-white shadow-lg translate-x-2"
                  : "text-slate-500 hover:bg-slate-50 hover:text-indigo-600 hover:pl-8"
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-6 border-t bg-slate-50">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 text-rose-500 font-bold text-sm bg-white border py-3 rounded-xl"
          >
            <LogOut size={18} /> Déconnexion
          </button>
        </div>
      </aside>
    </>
  );
}
