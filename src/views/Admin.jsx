import React from "react";
// Assurez-vous qu'aucun de ces imports ne s'appelle "Admin"
import { Shield, Database, Users, Settings, AlertTriangle } from "lucide-react";

export default function AdminView() { // On renomme la fonction interne en AdminView
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-slate-900 text-white p-8 rounded-[2rem] shadow-xl">
        <h3 className="text-2xl font-black flex items-center gap-3">
          <Shield className="text-indigo-400" /> Panneau de Contrôle Master
        </h3>
        <p className="text-slate-400 mt-2">Gestion globale de la plateforme LocalBoost.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
          <div className="p-3 bg-amber-50 text-amber-600 w-fit rounded-xl mb-4">
            <Database size={24} />
          </div>
          <div className="text-2xl font-black text-slate-900">128</div>
          <div className="text-sm font-bold text-slate-400">Entreprises totales</div>
        </div>
        
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
          <div className="p-3 bg-indigo-50 text-indigo-600 w-fit rounded-xl mb-4">
            <Users size={24} />
          </div>
          <div className="text-2xl font-black text-slate-900">1,042</div>
          <div className="text-sm font-bold text-slate-400">Utilisateurs actifs</div>
        </div>

        <div className="bg-rose-50 p-6 rounded-[2rem] border border-rose-100">
          <div className="p-3 bg-white text-rose-600 w-fit rounded-xl mb-4 shadow-sm">
            <AlertTriangle size={24} />
          </div>
          <div className="text-lg font-black text-rose-900">Maintenance</div>
          <button className="mt-2 text-xs font-bold bg-rose-600 text-white px-3 py-1.5 rounded-lg uppercase">
            Activer
          </button>
        </div>
      </div>
    </div>
  );
}
