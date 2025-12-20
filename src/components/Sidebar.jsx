import React from "react";
import { 
  LayoutDashboard, Wand2, MessageSquare, Users, 
  Ticket, User, LogOut, X, Zap 
} from "lucide-react";
import { supabase } from "../lib/supabase";

export default function Sidebar({ activeTab, setActiveTab, profile, isOpen, onClose }) {
  
  const menuItems = [
    { id: "dashboard", label: "Tableau de bord", icon: <LayoutDashboard size={20} /> },
    { id: "generator", label: "Générateur IA", icon: <Wand2 size={20} /> },
    { id: "reviews", label: "Avis clients", icon: <MessageSquare size={20} /> },
    { id: "customers", label: "Mes Clients", icon: <Users size={20} /> },
    { id: "promotions", label: "Promotions", icon: <Ticket size={20} /> },
    { id: "profile", label: "Mon Profil", icon: <User size={20} /> },
  ];

  const handleLogout = async () => {
    if(window.confirm("Se déconnecter ?")) {
        await supabase.auth.signOut();
        window.location.reload();
    }
  };

  return (
    <>
      {/* OMBRE ARRIÈRE-PLAN (MOBILE SEULEMENT) */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
      )}

      {/* LA SIDEBAR */}
      <aside className={`
        fixed top-0 left-0 z-50 h-screen w-72 bg-white border-r border-slate-100 flex flex-col transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"} 
        md:translate-x-0 md:static md:h-screen shadow-2xl md:shadow-none
      `}>
        
        {/* LOGO + BOUTON FERMER (MOBILE) */}
        <div className="p-8 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-xl text-white">
              <Zap size={24} fill="currentColor"/>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">LocalBoost</h1>
          </div>
          {/* Croix de fermeture visible uniquement sur mobile */}
          <button onClick={onClose} className="md:hidden p-2 text-slate-400 hover:text-rose-500 transition">
            <X size={24} />
          </button>
        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 px-4 space-y-2 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id); onClose(); }} // onClose ferme le menu sur mobile après clic
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-200 font-bold text-sm ${
                activeTab === item.id
                  ? "bg-slate-900 text-white shadow-lg shadow-slate-900/20 translate-x-2"
                  : "text-slate-500 hover:bg-slate-50 hover:text-indigo-600 hover:pl-8"
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        {/* PIED DE PAGE : PROFIL & DÉCONNEXION */}
        <div className="p-6 border-t border-slate-50 bg-slate-50/50">
           {profile && (
               <div className="flex items-center gap-3 mb-4 px-2">
                   <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-black text-sm border-2 border-white shadow-sm">
                       {profile.name?.[0] || "P"}
                   </div>
                   <div className="overflow-hidden">
                       <div className="font-bold text-sm text-slate-900 truncate">{profile.name}</div>
                       <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{profile.subscription_tier}</div>
                   </div>
               </div>
           )}
           
           <button 
             onClick={handleLogout}
             className="w-full flex items-center justify-center gap-2 text-rose-500 font-bold text-sm bg-rose-50 py-3 rounded-xl hover:bg-rose-100 transition"
           >
             <LogOut size={18} /> Déconnexion
           </button>
        </div>
      </aside>
    </>
  );
}
