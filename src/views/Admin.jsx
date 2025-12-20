import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { PLANS } from "../lib/plans";
import { 
  Shield, Users, ArrowLeft, Search, 
  ExternalLink, Key, CheckCircle, Database 
} from "lucide-react";

export default function AdminView({ onExit }) {
  const [businesses, setBusinesses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState({ total: 0, premium: 0, revenue: 0 });

  useEffect(() => {
    fetchBusinesses();
  }, []);

  const fetchBusinesses = async () => {
    const { data } = await supabase.from("business_profile").select("*").order("created_at", { ascending: false });
    if (data) {
      setBusinesses(data);
      calculateStats(data);
    }
  };

  const calculateStats = (data) => {
    const premiumCount = data.filter(b => b.subscription_tier === 'premium').length;
    setStats({
      total: data.length,
      premium: premiumCount,
      revenue: premiumCount * 29 // Revenu estimé
    });
  };

  // FONCTION : Changer le plan d'un client (Basic <-> Premium)
  const handleSwitchPlan = async (clientId, currentTier) => {
    const newTier = currentTier === 'basic' ? 'premium' : 'basic';
    
    // Mise à jour optimiste (affichage immédiat)
    setBusinesses(businesses.map(b => b.id === clientId ? { ...b, subscription_tier: newTier } : b));
    calculateStats(businesses.map(b => b.id === clientId ? { ...b, subscription_tier: newTier } : b));

    // Mise à jour BDD
    const { error } = await supabase
      .from("business_profile")
      .update({ subscription_tier: newTier })
      .eq("id", clientId);

    if (error) {
      alert("Erreur lors du changement de plan");
      fetchBusinesses(); // On recharge si erreur
    }
  };

  const filteredBusinesses = businesses.filter(b => 
    b.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    b.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-100 p-8 animate-in fade-in zoom-in-95 duration-300">
      
      {/* EN-TÊTE */}
      <div className="flex justify-between items-center mb-8 bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-4">
          <button onClick={onExit} className="p-3 bg-slate-100 hover:bg-slate-200 rounded-xl transition text-slate-600" title="Retour au site">
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
              <Shield className="text-rose-600" size={32}/> Master Admin
            </h1>
            <p className="text-slate-500 font-medium">Vue globale de l'activité</p>
          </div>
        </div>
        <div className="flex gap-4">
            <div className="bg-white px-6 py-3 rounded-2xl font-black text-xl flex items-center gap-3 border border-slate-200 shadow-sm">
                <span className="text-xs uppercase text-slate-400 font-bold">REVENU (EST.)</span>
                <span className="text-emerald-600">{stats.revenue} €</span>
            </div>
            <div className="bg-rose-50 text-rose-700 px-6 py-3 rounded-2xl font-black text-xl flex items-center gap-3 border border-rose-100">
                <Database size={20}/> {businesses.length} Clients
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* STATS RAPIDES (Lecture plans.js) */}
        <div className="lg:col-span-1 space-y-6">
           <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <h3 className="font-black text-slate-900 mb-4">Offres Actives</h3>
              <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                      <div>
                          <div className="font-bold text-slate-700">Premium</div>
                          <div className="text-xs text-slate-400">29,00 € / mois</div>
                      </div>
                      <div className="text-2xl font-black text-indigo-600">{stats.premium}</div>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                      <div>
                          <div className="font-bold text-slate-700">Basic</div>
                          <div className="text-xs text-slate-400">Gratuit</div>
                      </div>
                      <div className="text-2xl font-black text-slate-400">{stats.total - stats.premium}</div>
                  </div>
              </div>
           </div>
        </div>

        {/* LISTE DES CLIENTS */}
        <div className="lg:col-span-3 flex flex-col h-full">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm flex-1 overflow-hidden flex flex-col">
            
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-black text-lg text-slate-800 flex items-center gap-2"><Users size={20}/> Gestion des Comptes</h3>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16}/>
                <input 
                  type="text" 
                  placeholder="Chercher client..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-2 ring-indigo-100"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="p-4 text-xs font-black text-slate-400 uppercase">Client</th>
                    <th className="p-4 text-xs font-black text-slate-400 uppercase">Contact</th>
                    <th className="p-4 text-xs font-black text-slate-400 uppercase">Forfait (Click to switch)</th>
                    <th className="p-4 text-xs font-black text-slate-400 uppercase text-right">Accès</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredBusinesses.map((b) => (
                    <tr key={b.id} className="hover:bg-indigo-50/30 transition">
                      <td className="p-4">
                        <div className="font-bold text-slate-900">{b.name}</div>
                        <div className="text-xs text-slate-500">{b.city || "Non renseigné"}</div>
                      </td>
                      <td className="p-4 text-sm font-medium text-slate-600">
                        {b.email}
                      </td>
                      <td className="p-4">
                        {/* BOUTON SWITCH FORFAIT */}
                        <button 
                            onClick={() => handleSwitchPlan(b.id, b.subscription_tier)}
                            className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase border transition hover:scale-105 active:scale-95 ${
                            b.subscription_tier === 'premium' 
                                ? 'bg-indigo-100 text-indigo-700 border-indigo-200 hover:bg-indigo-200' 
                                : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                            }`}
                        >
                            {b.subscription_tier}
                        </button>
                      </td>
                      <td className="p-4 text-right flex justify-end gap-2">
                         {/* BOUTON VOIR SITE */}
                         <a 
                            href={`https://${b.slug || 'demo'}.localboost.vercel.app`} // Lien générique à adapter
                            target="_blank"
                            rel="noreferrer"
                            className="p-2 bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-200 rounded-xl shadow-sm transition"
                            title="Voir la page publique"
                         >
                             <ExternalLink size={16}/>
                         </a>
                         
                         <button 
                            onClick={() => alert("Email envoyé à " + b.email)} 
                            className="p-2 bg-white border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-200 rounded-xl shadow-sm transition"
                            title="Réinitialiser MDP"
                         >
                             <Key size={16}/>
                         </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
