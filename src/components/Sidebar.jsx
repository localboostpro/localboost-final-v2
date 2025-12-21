import React from "react";
import { 
  LayoutDashboard, Wand2, MessageSquare, Users, 
  Ticket, User, LogOut, X, Zap, PlusCircle, Globe
} from "lucide-react";
import { supabase } from "../lib/supabase";

export default function Sidebar({ activeTab, setActiveTab, profile, isOpen, onClose }) {
  
  // MENU EN FRANÇAIS
  const menuItems = [
    { id: "dashboard", label: "Tableau de bord", icon: <LayoutDashboard size={20} /> },
    { id: "generator", label: "Studio Créatif", icon: <Wand2 size={20} /> },
    { id: "reviews", label: "Avis Clients", icon: <MessageSquare size={20} /> },
    { id: "customers", label: "Fichier Clients", icon: <Users size={20} /> },
    { id: "webpage", label: "Ma Vitrine Web", icon: <Globe size={20} /> },
    { id: "promotions", label: "Offres & Promo", icon: <Ticket size={20} /> },
    { id: "profile", label: "Mon Établissement", icon: <User size={20} /> },
  ];

  const handleLogout = async () => {
    if(window.confirm("Voulez-vous vraiment vous déconnecter ?")) {
        await supabase.auth.signOut();
        window.location.reload();
    }
  };

  return (
    <>
      {/* OMBRE ARRIÈRE-PLAN (MOBILE) */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
      )}

      {/* LA SIDEBAR */}
      <aside className={`
        fixed top-0 left-0 z-50 w-72 bg-white border-r border-slate-100 flex flex-col transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"} 
        md:translate-x-0 md:static 
        shadow-2xl md:shadow-none
        h-[100dvh] md:h-screen
      `}>
        
        {/* EN-TÊTE */}
        <div className="p-8 flex flex-col gap-6 shrink-0 border-b border-slate-50">
          
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-slate-900 p-2 rounded-xl text-white shadow-lg shadow-slate-200">
                <Zap size={24} fill="currentColor"/>
              </div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight leading-none">
                LocalBoost <span className="text-indigo-600">Pro</span>
              </h1>
            </div>
            <button onClick={onClose} className="md:hidden p-2 text-slate-400 hover:text-rose-500 transition">
              <X size={24} />
            </button>
          </div>

          {/* Espace Client / Logo */}
          <div className="w-full">
             {profile?.logo_url ? (
                 <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    <img src={profile.logo_url} className="w-10 h-10 rounded-lg object-cover bg-white border border-slate-200" alt="Logo"/>
                    <div className="overflow-hidden">
                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Espace Pro</div>
                        <div className="font-bold text-sm text-slate-900 truncate">{profile.name}</div>
                    </div>
                 </div>
             ) : (
                 <button onClick={() => { setActiveTab("profile"); onClose(); }} className="w-full border-2 border-dashed border-slate-200 rounded-2xl p-3 flex items-center justify-center gap-2 text-xs font-bold text-slate-400 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 transition group">
                    <PlusCircle size={16} className="group-hover:scale-110 transition"/>
                    Ajouter votre logo
                 </button>
             )}
          </div>

        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id); onClose(); }}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-200 font-bold text-sm ${
                activeTab === item.id
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200 translate-x-2"
                  : "text-slate-500 hover:bg-slate-50 hover:text-indigo-600 hover:pl-8"
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        {/* PIED DE PAGE */}
        <div className="p-6 border-t border-slate-50 bg-slate-50/50 shrink-0 pb-24 md:pb-6">
           <button 
             onClick={handleLogout}
             className="w-full flex items-center justify-center gap-2 text-rose-500 font-bold text-sm bg-white border border-rose-100 py-3 rounded-xl hover:bg-rose-50 transition shadow-sm"
           >
             <LogOut size={18} /> Déconnexion
           </button>
        </div>
      </aside>
    </>
  );
}
