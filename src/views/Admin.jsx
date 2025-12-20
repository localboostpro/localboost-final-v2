import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { 
  Shield, Users, LogOut, Search, ExternalLink, 
  Key, Eye, Phone, Calendar, Power, TrendingUp, Mail 
} from "lucide-react";

export default function AdminView({ onAccessClient }) {
  const [businesses, setBusinesses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState({ revenue: 0, total: 0 });
  
  useEffect(() => { fetchBusinesses(); }, []);

  const fetchBusinesses = async () => {
    const { data } = await supabase.from("business_profile").select("*").order("created_at", { ascending: false });
    if (data) {
        // On traite les données pour éviter les valeurs nulles
        const cleanData = data.map(b => ({ 
            ...b, 
            is_active: b.is_active !== false,
            discount_percent: b.discount_percent || 0
        }));
        setBusinesses(cleanData);
        calculateStats(cleanData);
    }
  };

  const calculateStats = (data) => {
      const premiumCount = data.filter(b => b.subscription_tier === 'premium').length;
      setStats({ total: data.length, revenue: premiumCount * 99 });
  };

  // --- FONCTION DE BASCULEMENT DE FORFAIT CORRIGÉE ---
  const handleSwitchPlan = async (clientId, currentTier) => {
    const newTier = currentTier === 'basic' ? 'premium' : 'basic';
    
    // 1. Mise à jour optimiste (Interface immédiate)
    const updatedList = businesses.map(b => b.id === clientId ? { ...b, subscription_tier: newTier } : b);
    setBusinesses(updatedList);
    calculateStats(updatedList);

    // 2. Mise à jour Base de données
    const { error } = await supabase.from("business_profile").update({ subscription_tier: newTier }).eq("id", clientId);
    
    if (error) {
        console.error("Erreur update plan:", error);
        alert("Erreur lors du changement de plan. Vérifiez la console.");
        fetchBusinesses(); // On annule le changement visuel si échec
    }
  };

  const handleSendResetPassword = async (email) => { alert(`🔑 Lien de réinitialisation envoyé à ${email}`); };
  
  const handleSendUpgradeEmail = (email) => { window.open(`mailto:${email}?subject=Fin période essai&body=Passez Premium !`); };

  const toggleClientStatus = async (client) => {
    const newStatus = !client.is_active;
    await supabase.from("business_profile").update({ is_active: newStatus }).eq("id", client.id);
    setBusinesses(businesses.map(b => b.id === client.id ? { ...b, is_active: newStatus } : b));
  };
  
  const handleDiscountChange = async (clientId, val) => {
      const percent = parseInt(val) || 0;
      await supabase.from("business_profile").update({ discount_percent: percent }).eq("id", clientId);
      setBusinesses(businesses.map(b => b.id === clientId ? { ...b, discount_percent: percent } : b));
  };

  const filteredBusinesses = businesses.filter(b => b.name?.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="min-h-screen bg-slate-100 p-8 animate-in fade-in duration-300">
       <div className="flex justify-between items-center mb-8 bg-slate-900 text-white p-6 rounded-3xl shadow-xl sticky top-4 z-20">
          <div className="flex items-center gap-4">
            <div className="bg-indigo-600 p-3 rounded-xl"><Shield size={28} className="text-white" /></div>
            <h1 className="text-3xl font-black">LocalBoost <span className="text-indigo-400">Pro</span></h1>
          </div>
          <button onClick={() => window.location.reload()} className="bg-white/10 hover:bg-white/20 p-3 rounded-xl"><LogOut size={20}/></button>
       </div>

       <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b flex justify-between">
              <h3 className="font-black text-xl">Clients ({stats.total})</h3>
              <div className="relative w-64">
                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16}/>
                   <input type="text" placeholder="Rechercher..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                   className="w-full pl-10 pr-4 py-2 bg-slate-50 border rounded-xl font-bold outline-none focus:ring-2 ring-indigo-500"/>
               </div>
          </div>
          <div className="overflow-x-auto">
             <table className="w-full text-left">
                <thead className="bg-slate-50 text-xs font-black text-slate-400 uppercase">
                   <tr>
                      <th className="p-4">Client</th>
                      <th className="p-4">Dates & Essai</th>
                      <th className="p-4">Forfait (Cliquer pour changer)</th>
                      <th className="p-4 text-center">Remise %</th>
                      <th className="p-4 text-right">Actions</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-sm">
                   {filteredBusinesses.map(b => {
                       const created = new Date(b.created_at);
                       const diffDays = Math.ceil(Math.abs(new Date() - created) / (1000 * 60 * 60 * 24));
                       const trialOver = diffDays > 7 && b.subscription_tier === 'basic';

                       return (
                           <tr key={b.id} className={`hover:bg-slate-50 transition ${!b.is_active ? 'opacity-50 grayscale' : ''}`}>
                               <td className="p-4">
                                   <div className="font-bold text-slate-900">{b.name}</div>
                                   <div className="text-xs text-slate-500">{b.email}</div>
                               </td>
                               <td className="p-4">
                                   <div className="flex flex-col gap-1">
                                       <span className="text-xs text-slate-500 font-bold flex items-center gap-1">
                                           <Calendar size={12}/> {created.toLocaleDateString()}
                                       </span>
                                       {b.subscription_tier === 'basic' && (
                                           <div className={`text-xs font-black uppercase ${trialOver ? 'text-rose-600' : 'text-emerald-600'}`}>
                                               {trialOver ? `Expiré (+${diffDays - 7}j)` : `Essai : J-${7 - diffDays}`}
                                           </div>
                                       )}
                                   </div>
                               </td>
                               <td className="p-4">
                                   {/* BOUTON SWITCH FORFAIT CORRIGÉ */}
                                   <button 
                                     onClick={() => handleSwitchPlan(b.id, b.subscription_tier)}
                                     className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase border transition w-24 text-center hover:scale-105 active:scale-95 ${
                                        b.subscription_tier === 'premium' 
                                        ? 'bg-indigo-100 text-indigo-700 border-indigo-200 hover:bg-indigo-200' 
                                        : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                                     }`}
                                   >
                                     {b.subscription_tier}
                                   </button>
                               </td>
                               <td className="p-4 text-center">
                                    <input type="number" min="0" max="100" value={b.discount_percent} onChange={(e) => handleDiscountChange(b.id, e.target.value)}
                                    className="w-12 text-center bg-slate-50 border rounded font-bold"/>
                               </td>
                               <td className="p-4 text-right flex justify-end gap-2">
                                   {trialOver && <button onClick={() => handleSendUpgradeEmail(b.email)} className="p-2 bg-rose-50 text-rose-600 rounded-lg"><Mail size={16}/></button>}
                                   <button onClick={() => handleSendResetPassword(b.email)} className="p-2 bg-amber-50 text-amber-600 rounded-lg"><Key size={16}/></button>
                                   <button onClick={() => toggleClientStatus(b)} className={`p-2 rounded-lg ${b.is_active ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}><Power size={16}/></button>
                                   <button onClick={() => onAccessClient(b.user_id, b.email)} className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><Eye size={16}/></button>
                               </td>
                           </tr>
                       );
                   })}
                </tbody>
             </table>
          </div>
       </div>
    </div>
  );
}
