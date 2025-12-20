import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { PLANS } from "../lib/plans"; // On lit le fichier plans.js
import { 
  Shield, Users, Save, ArrowLeft, Search, 
  Key, Database, LayoutTemplate, DollarSign 
} from "lucide-react";

export default function AdminView({ onExit }) {
  const [businesses, setBusinesses] = useState([]);
  const [plansConfig, setPlansConfig] = useState(PLANS); // État local pour modifier les plans
  const [searchTerm, setSearchTerm] = useState("");
  
  // Ajout de prix fictifs pour l'interface car plans.js ne contient souvent que les features
  const [prices, setPrices] = useState({ basic: 0, premium: 29 });

  useEffect(() => {
    fetchBusinesses();
  }, []);

  const fetchBusinesses = async () => {
    const { data } = await supabase.from("business_profile").select("*").order("created_at", { ascending: false });
    if (data) setBusinesses(data);
  };

  const handlePlanChange = (tier, field, value) => {
    setPlansConfig(prev => ({
      ...prev,
      [tier]: {
        ...prev[tier],
        [field]: value,
        // Si on modifie les features (ex: max_customers)
        features: field === 'max_customers' 
          ? { ...prev[tier].features, max_customers: parseInt(value) } 
          : prev[tier].features
      }
    }));
  };

  const handleSavePlans = () => {
    // Note: On ne peut pas écrire physiquement dans plans.js depuis le navigateur
    // Ici on simulerait une sauvegarde en Base de Données "app_config"
    alert("Configuration des plans mise à jour (Simulation) !");
  };

  const filteredBusinesses = businesses.filter(b => 
    b.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    b.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-100 p-8 animate-in fade-in zoom-in-95 duration-300">
      
      {/* HEADER ADMIN AVEC BOUTON RETOUR */}
      <div className="flex justify-between items-center mb-8 bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-4">
          <button onClick={onExit} className="p-3 bg-slate-100 hover:bg-slate-200 rounded-xl transition text-slate-600">
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
              <Shield className="text-rose-600" size={32}/> Master Admin
            </h1>
            <p className="text-slate-500 font-medium">Configuration globale & Gestion Clients</p>
          </div>
        </div>
        <div className="bg-rose-50 text-rose-700 px-6 py-3 rounded-2xl font-black text-xl flex items-center gap-3 border border-rose-100">
          <Database size={20}/> {businesses.length} Clients
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* COLONNE GAUCHE : ÉDITEUR DE PLANS (Ce que vous avez demandé) */}
        <div className="xl:col-span-1 space-y-6">
          <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl">
             <h3 className="text-xl font-black flex items-center gap-2 mb-4">
               <LayoutTemplate className="text-indigo-400"/> Éditeur de Forfaits
             </h3>
             <p className="text-slate-400 text-sm mb-6">Modifiez les caractéristiques des offres lues depuis le système.</p>

             {/* BOUCLE SUR LES PLANS CHARGÉS DEPUIS PLANS.JS */}
             {Object.entries(plansConfig).map(([key, plan]) => (
               <div key={key} className="bg-white/5 p-5 rounded-2xl border border-white/10 mb-4">
                 <div className="flex justify-between items-center mb-3">
                   <span className="uppercase text-xs font-black tracking-widest text-indigo-400">{key}</span>
                   {key === 'premium' && <span className="bg-indigo-600 text-white text-[10px] font-bold px-2 py-1 rounded">POPULAIRE</span>}
                 </div>
                 
                 <div className="space-y-3">
                   {/* Input Nom */}
                   <div>
                     <label className="text-[10px] text-slate-500 uppercase font-bold">Nom de l'offre</label>
                     <input 
                        type="text" 
                        value={plan.label} 
                        onChange={(e) => handlePlanChange(key, 'label', e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm font-bold text-white focus:border-indigo-500 outline-none"
                     />
                   </div>

                   {/* Input Prix (Simulé via state local 'prices') */}
                   <div>
                     <label className="text-[10px] text-slate-500 uppercase font-bold">Prix Mensuel (€)</label>
                     <div className="relative">
                        <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"/>
                        <input 
                          type="number" 
                          value={prices[key]} 
                          onChange={(e) => setPrices({...prices, [key]: e.target.value})}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-8 pr-3 py-2 text-sm font-bold text-white focus:border-indigo-500 outline-none"
                        />
                     </div>
                   </div>

                   {/* Input Max Customers (Features) */}
                   <div>
                     <label className="text-[10px] text-slate-500 uppercase font-bold">Limite Clients</label>
                     <input 
                        type="number" 
                        value={plan.features.max_customers} 
                        onChange={(e) => handlePlanChange(key, 'max_customers', e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm font-bold text-white focus:border-indigo-500 outline-none"
                     />
                   </div>
                 </div>
               </div>
             ))}

             <button onClick={handleSavePlans} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-4 rounded-xl font-bold flex justify-center items-center gap-2 transition shadow-lg shadow-indigo-900/50 mt-4">
               <Save size={18}/> SAUVEGARDER LES PLANS
             </button>
          </div>
        </div>

        {/* COLONNE DROITE : LISTE CLIENTS */}
        <div className="xl:col-span-2 flex flex-col h-full">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm flex-1 overflow-hidden flex flex-col">
            
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-black text-lg text-slate-800 flex items-center gap-2"><Users size={20}/> Base Utilisateurs</h3>
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

            <div className="overflow-y-auto custom-scrollbar flex-1">
              <table className="w-full text-left">
                <thead className="bg-slate-50 sticky top-0 z-10">
                  <tr>
                    <th className="p-4 text-xs font-black text-slate-400 uppercase">Entreprise</th>
                    <th className="p-4 text-xs font-black text-slate-400 uppercase">Abonnement</th>
                    <th className="p-4 text-xs font-black text-slate-400 uppercase text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredBusinesses.map((b) => (
                    <tr key={b.id} className="hover:bg-indigo-50/30 transition group">
                      <td className="p-4">
                        <div className="font-bold text-slate-900">{b.name}</div>
                        <div className="text-xs text-slate-500">{b.email}</div>
                      </td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase border ${
                          b.subscription_tier === 'premium' 
                            ? 'bg-indigo-50 text-indigo-700 border-indigo-100' 
                            : 'bg-slate-100 text-slate-500 border-slate-200'
                        }`}>
                          {b.subscription_tier}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                         <div className="flex justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition">
                           <button onClick={() => alert("MDP envoyé à " + b.email)} className="p-2 bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-200 rounded-xl shadow-sm" title="Réinitialiser MDP">
                             <Key size={16}/>
                           </button>
                         </div>
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
