import React from "react";
import {
  LayoutDashboard,
  Star,
  Image,
  Users,
  UserCircle,
  LogOut,
  Megaphone,
  X,
} from "lucide-react";

export default function Sidebar({
  activeTab,
  setActiveTab,
  isOpen,
  onClose,
  profile,
}) {
  const menuItems = [
    { id: "dashboard", label: "Tableau de bord", icon: LayoutDashboard },
    { id: "reviews", label: "Avis clients", icon: Star },
    { id: "marketing", label: "Studio IA", icon: Image },
    { id: "promotions", label: "Promotions", icon: Megaphone },
    { id: "customers", label: "Clients", icon: Users },
    { id: "settings", label: "Profil", icon: UserCircle },
  ];

  // Sécurité pour l'initiale du nom (évite le crash si name est vide)
  const initial = profile?.name ? profile.name.charAt(0).toUpperCase() : "L";
  const companyName = profile?.name || "LocalBoost";

  return (
    <>
      {/* Overlay Mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-100 flex flex-col justify-between h-full transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="p-6">
          {/* EN-TÊTE : Nom de l'entreprise */}
          <div className="flex items-center justify-between mb-10 px-2">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="bg-indigo-600 text-white w-10 h-10 flex items-center justify-center rounded-xl font-black text-xl shadow-lg shadow-indigo-200 shrink-0">
                {initial}
              </div>
              <h1 className="font-black text-lg text-slate-900 tracking-tight truncate">
                {companyName}
              </h1>
            </div>
            {/* Bouton Fermer (Mobile seulement) */}
            <button
              onClick={onClose}
              className="md:hidden text-slate-400 hover:text-slate-600 p-1"
              aria-label="Fermer le menu"
            >
              <X size={24} />
            </button>
          </div>

          {/* NAVIGATION */}
          <nav className="space-y-2 px-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              // Classes conditionnelles propres
              const buttonClass = `w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group font-bold text-sm ${
                isActive
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              }`;

              const iconClass = `transition-colors ${
                isActive
                  ? "text-white"
                  : "text-slate-400 group-hover:text-indigo-500"
              }`;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    onClose();
                  }}
                  className={buttonClass}
                >
                  <Icon size={20} className={iconClass} strokeWidth={2} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* PIED DE PAGE : Déconnexion */}
        <div className="p-6 border-t border-slate-50">
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-red-500 transition-colors text-sm font-bold w-full rounded-xl hover:bg-red-50"
          >
            <LogOut size={18} /> Déconnexion
          </button>
        </div>
      </div>
    </>
  );
}
