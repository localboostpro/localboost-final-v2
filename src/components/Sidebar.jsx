import React from "react";
import { 
  LayoutDashboard, Sparkles, MessageSquare, Users, 
  Ticket, User, LogOut, Building2, Send, Shield 
} from "lucide-react";
import { supabase } from "../lib/supabase";

export default function Sidebar({ activeTab, setActiveTab, profile }) {
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  const menuItems = [
    { id: "dashboard", label: "Tableau de bord", icon: LayoutDashboard },
    { id: "generator", label: "Générateur IA", icon: Sparkles },
    { id: "reviews", label: "Avis clients", icon: MessageSquare },
    { id: "customers", label: "Mes Clients", icon: Users },
    { id: "promotions", label: "Promotions", icon: Ticket },
    { id: "profile", label: "Mon Profil", icon: User },
  ];

  return (
    <div className="w-72 bg-white h-screen flex flex-col border-r border-slate-100 shadow-sm fixed left-0 top-0 z-40 hidden md:flex">
      <div className="p-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg">
            <Send size={20} />
          </div>
          <span className="text-xl font-black text-slate-900 tracking-tight">LocalBoost</span>
        </div>

        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-indigo-600 border border-slate-200">
              <Building2 size={16} />
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-xs font-bold text-slate-400 uppercase">
                {profile?.is_admin ? "Administrateur" : "Compte Pro"}
              </span>
              <span className="text-sm font-black text-slate-700 truncate">
                {profile?.name || "Chargement..."}
              </span>
            </div>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold transition-all ${
              activeTab === item.id
                ? "bg-indigo-50 text-indigo-600 shadow-sm"
                : "text-slate-500 hover:bg-slate-50"
            }`}
          >
            <item.icon size={20} />
            {item.label}
          </button>
        ))}

        {/* BOUTON ADMIN CONDITIONNEL */}
        {profile?.email === "admin@demo.fr" && (
          <button
            onClick={() => setActiveTab("admin")}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold transition-all mt-4 border-2 ${
              activeTab === "admin" 
                ? "bg-rose-50 text-rose-600 border-rose-100" 
                : "text-rose-500 border-transparent hover:bg-rose-50"
            }`}
          >
            <Shield size={20} /> Panel Admin
          </button>
        )}
      </nav>

      <div className="p-4 border-t border-slate-50">
        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-4 rounded-2xl font-bold text-red-500 hover:bg-red-50">
          <LogOut size={20} /> Déconnexion
        </button>
      </div>
    </div>
  );
}
