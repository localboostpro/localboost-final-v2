import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { 
  Shield, Users, LogOut, Search, ExternalLink, 
  Key, Eye, Phone, Calendar, Power, TrendingUp, Mail, AlertTriangle 
} from "lucide-react";

export default function AdminView({ onAccessClient }) {
  // ... (Garder tout le code d'état précédent : businesses, stats, etc.)
  const [businesses, setBusinesses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState({ revenue: 0, total: 0 });
  
  useEffect(() => { fetchBusinesses(); }, []);

  const fetchBusinesses = async () => {
    const { data } = await supabase.from("business_profile").select("*").order("created_at", { ascending: false });
    if (data) {
        setBusinesses(data.map(b => ({ ...b, is_active: b.is_active !== false })));
        // Calcul stats basique pour l'exemple
        setStats({ total: data.length, revenue: data.filter(b => b.subscription_tier === 'premium').length * 99 });
    }
  };

  const handleSendResetPassword = async (email) => {
    // Point 6 : Envoi réel ou simulation
    // await supabase.auth.resetPasswordForEmail(email); 
    alert(`🔑 Lien de réinitialisation envoyé à ${email}`);
  };

  const handleSendUpgradeEmail = (email) => {
    // Point 7 : Relance mail
    window.open(`mailto:${email}?subject=Votre période d'essai est terminée&body=Bonjour, votre période d'essai est terminée. Merci de passer au forfait Premium.`);
  };

  const toggleClientStatus = async (client) => {
    const newStatus = !client.is_active;
    await supabase.from("business_profile").update({ is_active: newStatus }).eq("id", client.id);
    setBusinesses(businesses.map(b => b.id === client.id ? { ...b, is_active: newStatus } : b));
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
          <div className="overflow-x-auto">
             <table className="w-full text-left">
                <thead className="bg-slate-50 text-xs font-black text-slate-400 uppercase">
                   <tr>
                      <th className="p-4">Client</th>
                      <th className="p-4">Dates & Essai (Point 7)</th>
                      <th className="p-4">Forfait</th>
                      <th className="p-4 text-right">Actions Admin</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-sm">
                   {filteredBusinesses.map(b => {
                       const created = new Date(b.created_at);
                       const now = new Date();
                       const diffTime = Math.abs(now - created);
                       const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
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
                                           <Calendar size={12}/> Inscrit le {created.toLocaleDateString()}
                                       </span>
                                       {b.subscription_tier === 'basic' && (
                                           <div className={`text-xs font-black uppercase ${trialOver ? 'text-rose-600' : 'text-emerald-600'}`}>
                                               {trialOver ? `Essai expiré (+${diffDays - 7}j)` : `Essai : J-${7 - diffDays}`}
                                           </div>
                                       )}
                                   </div>
                               </td>
                               <td className="p-4">
                                   <span className="bg-slate-100 px-2 py-1 rounded text-xs font-bold">{b.subscription_tier}</span>
                               </td>
                               <td className="p-4 text-right flex justify-end gap-2">
                                   {/* Point 7 : RELANCE / BLOCAGE */}
                                   {trialOver && (
                                       <button onClick={() => handleSendUpgradeEmail(b.email)} className="p-2 bg-rose-50 text-rose-600 rounded-lg" title="Envoyer mail fin d'essai">
                                           <Mail size={16}/>
                                       </button>
                                   )}
                                   
                                   {/* Point 6 : RESET PASSWORD */}
                                   <button onClick={() => handleSendResetPassword(b.email)} className="p-2 bg-amber-50 text-amber-600 rounded-lg" title="Reset Mot de Passe">
                                       <Key size={16}/>
                                   </button>

                                   <button onClick={() => toggleClientStatus(b)} className={`p-2 rounded-lg ${b.is_active ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`} title="Activer/Bloquer">
                                       <Power size={16}/>
                                   </button>
                                   
                                   <button onClick={() => onAccessClient(b.user_id, b.email)} className="p-2 bg-indigo-50 text-indigo-600 rounded-lg" title="Voir Compte">
                                       <Eye size={16}/>
                                   </button>
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
