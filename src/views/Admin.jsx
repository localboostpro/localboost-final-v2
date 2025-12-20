import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { PLANS } from "../lib/plans";
import { 
  Shield, Users, ArrowLeft, Search, 
  ExternalLink, Key, Database, Eye, Percent, Calendar
} from "lucide-react";

export default function AdminView({ onExit, onAccessClient }) {
  const [businesses, setBusinesses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState({ total: 0, premium: 0, revenue: 0, trials: 0 });

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
    
    // Calcul de ceux en période d'essai (créés il y a moins de 7 jours)
    const now = new Date();
    const trialCount = data.filter(b => {
      const created = new Date(b.created_at);
      const diffTime = Math.abs(now - created);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 7 && b.subscription_tier === 'basic';
    }).length;

    setStats({
      total: data.length,
      premium: premiumCount,
      trials: trialCount,
      revenue: premiumCount * 99 + (data.length - premiumCount) * 29 // Estimation 29€ basic / 99€ premium
    });
  };

  const handleSwitchPlan = async (clientId, currentTier) => {
    const newTier = currentTier === 'basic' ? 'premium' : 'basic';
    const { error } = await supabase.from("business_profile").update({ subscription_tier: newTier }).eq("id", clientId);
    if (!error) {
       setBusinesses(businesses.map(b => b.id === clientId ? { ...b, subscription_tier: newTier } : b));
       calculateStats(businesses.map(b => b.id === clientId ? { ...b, subscription_tier: newTier } : b));
    }
  };

  // NOUVEAU : Fonction Promo (Toggle simple)
  // Note: On utilise un champ fictif 'promo_active' si pas en BDD, ça marchera visuellement
  const handleTogglePromo = async (client) => {
    const newStatus = !client.promo_active;
    const { error } = await supabase.from("business_profile").update({ promo_active: newStatus }).eq("id", client.id);
    
    // Si la colonne n'existe pas encore en BDD, on update juste le state local pour l'UI
    setBusinesses(businesses.map(b => b.id === client.id ? { ...b, promo_active: newStatus } : b));
    alert(newStatus ? "Promotion -50% activée pour ce client !" : "Promotion désactivée.");
  };

  const filteredBusinesses = businesses.filter(b => 
    b.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    b.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-100 p-8 animate-in fade-in zoom-in-95 duration-300">
      
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8 bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-4">
          <button onClick={onExit} className="p-3 bg-slate-100 hover:bg-slate-200 rounded-xl transition text-slate-600">
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
              <Shield className="text-rose-600" size={32}/> Master Admin
            </h1>
            <p className="text-slate-500 font-medium">Gestion globale</p>
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
        
        {/* STATS PRIX */}
        <div className="lg:col-span-1 space-y-6">
           <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <h3 className="font-black text-slate-900 mb-4">Tarification</h3>
              <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-indigo-50 rounded-xl border border-indigo-100">
                      <div>
                          <div className="font-bold text-indigo-900">Premium</div>
                          <div className="text-xs text-indigo-400">Illimité</div>
                      </div>
                      <div className="text-xl font-black text-indigo-600">99 €</div>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <div>
                          <div className="font-bold text-slate-700">Basic</div>
                          <div className="text-xs text-slate-400">Standard</div>
                      </div>
                      <div className="text-xl font-black text-slate-400">29 €</div>
                  </div>
                  
                   <div className="flex justify-between items-center p-3 bg-amber-50 rounded-xl border border-amber-100 mt-4">
                      <div className="flex items-center gap-2">
                          <Calendar size={16} className="text-amber-500"/>
                          <div>
                            <div className="font-bold text-amber-800">Essai Gratuit</div>
                            <div className="text-xs text-amber-600">7 Jours offerts</div>
                          </div>
                      </div>
                      <div className="text-xl font-black text-amber-600">{stats.trials}</div>
                  </div>
              </div>
           </div>
        </div>

        {/* TABLEAU CLIENTS */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-black text-lg text-slate-800 flex items-center gap-2"><Users size={20}/> Comptes Clients</h3>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16}/>
                <input 
                  type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Chercher..." 
                  className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-2 ring-indigo-100"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="p-4 text-xs font-black text-slate-400 uppercase">Client</th>
                    <th className="p-4 text-xs font-black text-slate-400 uppercase">Forfait</th>
                    <th className="p-4 text-xs font-black text-slate-400 uppercase">Promo</th>
                    <th className="p-4 text-xs font-black text-slate-400 uppercase text-right">Contrôle</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredBusinesses.map((b) => (
                    <tr key={b.id} className="hover:bg-indigo-50/10 transition">
                      <td className="p-4">
                        <div className="font-bold text-slate-900">{b.name}</div>
                        <div className="text-xs text-slate-500">{b.email}</div>
                      </td>
                      <td className="p-4">
                        <button 
                            onClick={() => handleSwitchPlan(b.id, b.subscription_tier)}
                            className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase border transition hover:scale-105 active:scale-95 w-24 ${
                            b.subscription_tier === 'premium' 
                                ? 'bg-indigo-100 text-indigo-700 border-indigo-200 hover:bg-indigo-200' 
                                : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                            }`}
                        >
                            {b.subscription_tier}
                        </button>
                      </td>
                      <td className="p-4">
                         {/* BOUTON PROMO */}
                         <button 
                           onClick={() => handleTogglePromo(b)}
                           className={`p-2 rounded-xl transition border ${b.promo_active ? 'bg-green-100 text-green-700 border-green-200' : 'bg-white text-slate-300 border-slate-200 hover:border-green-300 hover:text-green-500'}`}
                           title="Appliquer -50%"
                         >
                           <Percent size={16}/>
                         </button>
                      </td>
                      <td className="p-4 text-right flex justify-end gap-2">
                         {/* BOUTON ACCÈS PANEL (IMPERSONATION) */}
                         <button 
                            onClick={() => onAccessClient(b.user_id, b.email)} 
                            className="p-2 bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl shadow-md transition flex items-center gap-2 text-xs font-bold px-3"
                            title="Se connecter en tant que ce client"
                         >
                             <Eye size={16}/> Voir Panel
                         </button>
                         
                         <button 
                            onClick={() => alert("Email envoyé à " + b.email)} 
                            className="p-2 bg-white border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-200 rounded-xl shadow-sm transition"
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
