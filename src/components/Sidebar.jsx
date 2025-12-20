import React from "react";
import { 
  LayoutDashboard, 
  Send, 
  Calendar, 
  User, 
  LogOut, 
  Sparkles,
  Building2 
} from "lucide-react";
import { supabase } from "../lib/supabase";

export default function Sidebar({ activeTab, setActiveTab, profile }) {
  
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error("Erreur déconnexion:", error.message);
  };

  const menuItems = [
    { id: "dashboard", label: "Tableau de bord", icon: LayoutDashboard },
    { id: "generator", label: "Générateur IA", icon: Sparkles },
    { id: "planner", label: "Planificateur", icon: Calendar },
    { id: "profile", label: "Mon Profil", icon: User },
  ];

  return (
    <div className="w-72 bg-white h-screen flex flex-col border-r border-slate-100 shadow-sm fixed left-0 top-0">
      {/* SECTION LOGO & NOM DYNAMIQUE */}
      <div className="p-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
            <Send size={20} />
          </div>
          <span className="text-xl font-black text-slate-900 tracking-tight">LocalBoost</span>
        </div>

        {/* Badge Entreprise Dynamique */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-indigo-600 border border-slate-200 shadow-sm">
              <Building2 size={16} />
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Compte Pro</span>
              <span className="text-sm font-black text-slate-700 truncate">
                {profile?.name || "Chargement..."}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* NAVIGATION */}
      <nav className="flex-1 px-4 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-4 rounded-2xl font-bold transition-all duration-200 ${
              activeTab === item.id
                ? "bg-indigo-50 text-indigo-600 shadow-sm shadow-indigo-50"
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
            }`}
          >
            <item.icon size={20} className={activeTab === item.id ? "text-indigo-600" : "text-slate-400"} />
            {item.label}
          </button>
        ))}
      </nav>

      {/* PIED DE LA SIDEBAR : DÉCONNEXION */}
      <div className="p-4 border-t border-slate-50">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-4 rounded-2xl font-bold text-red-500 hover:bg-red-50 transition-colors"
        >
          <LogOut size={20} />
          Déconnexion
        </button>
        
        {/* Statut de l'abonnement */}
        <div className="mt-4 px-4 py-3 bg-indigo-600 rounded-2xl text-white">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">Abonnement</span>
            <span className="text-[10px] font-black bg-white/20 px-2 py-0.5 rounded-full uppercase">
              {profile?.subscription_tier || "Basic"}
            </span>
          </div>
          <p className="text-[11px] font-medium leading-tight">
            {profile?.subscription_tier === 'premium' 
              ? "Accès illimité activé" 
              : "Passez au Premium pour l'IA"}
          </p>
        </div>
      </div>
    </div>
  );
}
