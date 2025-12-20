import React from "react";
import {
  TrendingUp,
  Users,
  MessageSquare,
  ArrowRight,
  Zap,
} from "lucide-react";

export default function Dashboard({ stats, onGenerate }) {
  // Simulation de données graphiques
  const chartData = [40, 65, 50, 80, 55, 90, 100];

  return (
    <div className="space-y-8 animate-in fade-in">
      {/* SECTION 1: KPI */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600">
              <Users size={24} />
            </div>
            <span className="bg-green-100 text-green-700 px-2 py-1 rounded-lg text-xs font-bold">
              +12%
            </span>
          </div>
          <div className="text-4xl font-black text-slate-900 mb-1">
            {stats.clients}
          </div>
          <div className="text-slate-400 font-bold text-sm">Clients Actifs</div>
        </div>
        <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-pink-50 rounded-2xl text-pink-600">
              <MessageSquare size={24} />
            </div>
            <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded-lg text-xs font-bold">
              Total
            </span>
          </div>
          <div className="text-4xl font-black text-slate-900 mb-1">
            {stats.reviews}
          </div>
          <div className="text-slate-400 font-bold text-sm">Avis reçus</div>
        </div>
        <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-6 rounded-[32px] shadow-lg text-white relative overflow-hidden">
          <Zap className="absolute -right-4 -bottom-4 text-white/10 w-32 h-32" />
          <div className="relative z-10">
            <div className="font-bold text-indigo-200 mb-2">Action Rapide</div>
            <h3 className="text-2xl font-black mb-4">Besoin d'un post ?</h3>
            <button
              onClick={onGenerate}
              className="bg-white text-indigo-600 px-6 py-3 rounded-xl font-bold text-sm hover:scale-105 transition shadow-md"
            >
              ✨ Créer avec l'IA
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 2: GRAPHIQUE (CSS Only pour performance) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h3 className="text-xl font-black text-slate-900">Activité</h3>
              <p className="text-slate-400 font-medium text-sm">
                Vue d'ensemble des interactions
              </p>
            </div>
          </div>
          {/* Graphique à barres CSS */}
          <div className="flex items-end justify-between h-48 gap-2">
            {chartData.map((h, i) => (
              <div
                key={i}
                className="w-full bg-slate-100 rounded-t-xl relative group hover:bg-indigo-50 transition-colors"
              >
                <div
                  style={{ height: `${h}%` }}
                  className="absolute bottom-0 w-full bg-indigo-600 rounded-t-xl transition-all duration-500 group-hover:bg-indigo-500"
                ></div>
                <div className="absolute -bottom-6 w-full text-center text-xs font-bold text-slate-400">
                  J-{7 - i}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 3: DERNIERS POSTS */}
        <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
          <h3 className="text-xl font-black text-slate-900 mb-6">
            Derniers Posts
          </h3>
          <div className="space-y-4">
            {stats.posts > 0 ? (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="font-bold text-slate-900 mb-1">
                  Dernier post généré
                </div>
                <div className="text-xs text-slate-500">
                  Il y a quelques instants
                </div>
              </div>
            ) : (
              <div className="text-slate-400 text-center py-4 italic">
                Aucun post récent
              </div>
            )}
            <button
              onClick={onGenerate}
              className="w-full py-3 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 font-bold hover:border-indigo-400 hover:text-indigo-600 transition flex justify-center items-center gap-2"
            >
              <TrendingUp size={16} /> Voir les statistiques
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
