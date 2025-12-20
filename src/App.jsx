import React, { useState } from "react";
// On n'importe PAS les composants cassés pour l'instant
import { LayoutDashboard } from "lucide-react";

export default function App() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center p-10 bg-white rounded-3xl shadow-xl border border-slate-200">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <LayoutDashboard size={40} />
        </div>
        <h1 className="text-3xl font-black text-slate-900 mb-2">Le site fonctionne ! 🎉</h1>
        <p className="text-slate-500 mb-6">
          Le problème venait d'un composant enfant (Sidebar ou Marketing).<br/>
          Passez maintenant à l'étape 2 pour les réparer.
        </p>
      </div>
    </div>
  );
}
