import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { 
  Shield, LogOut, Search, Key, Eye, Calendar, Power, TrendingUp, Mail, Zap 
} from "lucide-react";

export default function AdminView({ onAccessClient, onExit }) {
  const [businesses, setBusinesses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState({ revenue: 0, total: 0, premium: 0 });
  const [monthlyStats, setMonthlyStats] = useState([]);

  useEffect(() => { fetchBusinesses(); }, []);

  const fetchBusinesses = async () => {
    const { data } = await supabase.from("business_profile").select("*").order("created_at", { ascending: false });
    if (data) {
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
      
      const currentRevenue = data.reduce((acc, b) => {
          if (!b.is_active) return acc;
          const price = b.subscription_tier === 'premium' ? 99 : 29;
          const discount = b.discount_percent || 0;
          return acc + (price * (1 - discount / 100));
      }, 0);

      setStats({ 
          total: data.length, 
          premium: premiumCount, 
          revenue: Math.round(currentRevenue) 
      });

      const months = {};
      data.forEach(b => {
          if (!b.is_active) return;
          const date = new Date(b.created_at);
          const key = `${date.getMonth() + 1}/${date.getFullYear()}`;
          const price = b.subscription_tier === 'premium' ? 99 : 29;
          const finalPrice = price * (1 - (b.discount_percent || 0) / 100);
          if (!months[key]) months[key] = 0;
          months[key] += finalPrice;
      });

      const monthlyArray = Object.entries(months)
        .map(([date, amount]) => ({ date, amount: Math.round(amount) }))
        .slice(0, 6);
      setMonthlyStats(monthlyArray);
  };

  // --- GÉNÉRATEUR DÉMO SÉCURISÉ ---
  const generateDemoData = async () => {
    if(!window.confirm("Créer un compte de DÉMO ?")) return;

    // On utilise l'ID de l'admin actuel pour lier la démo
    const { data: { user } } = await supabase.auth.getUser();
    const uniqueSuffix = Date.now().toString().slice(-4);
    
    // 1. Profil Business
    const newProfile = {
        user_id: user?.id, // On lie au compte admin
        name: `DÉMO Boulangerie ${uniqueSuffix}`,
        email: `demo.${uniqueSuffix}@localboost.test`,
        city: "Paris",
        subscription_tier: "premium",
        discount_percent: 100, // Gratuit
        is_active: true,
        created_at: new Date().toISOString()
    };

    const { data: profileData, error } = await supabase.from("business_profile").insert([newProfile]).select().single();

    if (error) {
        alert("Erreur BDD : " + error.message);
        return;
    }

    // 2. Données factices
    const bId = profileData.id;
    await supabase.from("reviews").insert([
        { business_id: bId, author_name: "Client Test", rating: 5, comment: "Super !", date: new Date().toISOString() }
    ]);
    await supabase.from("customers").insert([
        { business_id: bId, name: "Jean Demo", email: "jean@demo.fr" }
    ]);

    alert("✅ Démo générée ! Cliquez sur l'œil pour voir.");
    fetchBusinesses();
  };

  const handleSwitchPlan = async (clientId, currentTier) => {
    const newTier = currentTier === 'basic' ? 'premium' : 'basic';
    const updatedList = businesses.map(b => b.id === clientId ? { ...b, subscription_tier: newTier } : b);
    setBusinesses(updatedList);
    calculateStats(updatedList);
    await supabase.from("business_profile").update({ subscription_tier: newTier }).eq("id", clientId);
  };

  const toggleClientStatus = async (client) => {
    const newStatus = !client.is_active;
    await supabase.from("business_profile").update({ is_active: newStatus }).eq("id", client.id);
    const updatedList = businesses.map(b => b.id === client.id ? { ...b, is_active: newStatus } : b);
    setBusinesses(updatedList);
    calculateStats(updatedList);
  };

  const handleDiscountChange = async (clientId, val) => {
      const percent = parseInt(val) || 0;
      await supabase.from("business_profile").update({ discount_percent: percent }).eq("id", clientId);
      const updatedList = businesses.map(b => b.id === clientId ? { ...b, discount_percent: percent } : b);
      setBusinesses(updatedList);
      calculateStats(updatedList);
  };

  const handleSendResetPassword = async (email) => { 
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin });
      if(error) alert("Erreur: " + error.message);
      else alert(`🔑 Email de réinitialisation envoyé à ${email}`);
  };
  
  const handleSendUpgradeEmail = (email) => { window.open(`mailto:${email}?subject=Fin d'essai&body=Passez Premium !`); };

  const filteredBusinesses = businesses.filter(b => 
      b.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      b.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-100 p-8 animate-in fade-in duration-300">
       <div className="flex justify-between items-center mb-8 bg-slate-900 text-white p-6 rounded-3xl shadow-xl sticky top-4 z-20">
          <div className="flex items-center gap-4">
            <div className="bg-indigo-600 p-3 rounded-xl"><Shield size={28} className="text-white" /></div>
            <div>
                <h1 className="text-3xl font-black leading-none">LocalBoost <span className="text-indigo-400">Pro</span></h1>
                <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mt-1">Master Dashboard</p>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
              <button onClick={generateDemoData} className="bg-emerald-500 hover:bg-emerald-400 text-white px-5 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-emerald-900/20 transition animate-pulse">
                <Zap size={18} fill="currentColor"/> Générer Démo
              </button>
              <div className="text-right hidden md:block border-l border-white/10 pl-6">
                  <div className="text-xs font-bold text-slate-400 uppercase">CA Mensuel</div>
                  <div className="text-2xl font-black text-emerald-400">{stats.revenue} €</div>
              </div>
              {/* Utilisation de onExit si fourni, sinon reload */}
              <button onClick={onExit || (() => window.location.reload())} className="bg-white/10 hover:bg-white/20 p-3 rounded-xl transition"><LogOut size={20}/></button>
          </div>
       </div>

       <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b flex justify-between items-center bg-slate-50/50">
              <h3 className="font-black text-xl text-slate-800">Gestion Base Clients ({filteredBusinesses.length})</h3>
              <div className="relative w-64">
                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16}/>
                   <input type="text" placeholder="Rechercher..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                   className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl font-bold outline-none focus:ring-2 ring-indigo-500"/>
               </div>
          </div>

          <div className="overflow-x-auto">
             <table className="w-full text-left">
                <thead className="bg-slate-50 text-xs font-black text-slate-400 uppercase">
                   <tr>
                      <th className="p-4">Client</th>
                      <th className="p-4">Ancienneté</th>
                      <th className="p-4">Forfait</th>
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
                                   <button onClick={() => handleSwitchPlan(b.id, b.subscription_tier)}
                                     className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase border transition w-24 text-center hover:scale-105 active:scale-95 ${
                                        b.subscription_tier === 'premium' ? 'bg-indigo-100 text-indigo-700 border-indigo-200' : 'bg-slate-100 text-slate-600 border-slate-200'
                                     }`}>
                                     {b.subscription_tier}
                                   </button>
                               </td>
                               <td className="p-4 text-center">
                                    <input type="number" min="0" max="100" value={b.discount_percent} onChange={(e) => handleDiscountChange(b.id, e.target.value)}
                                    className="w-12 text-center bg-slate-50 border rounded-lg font-bold text-slate-700"/>
                               </td>
                               <td className="p-4 text-right flex justify-end gap-2">
                                   {trialOver && <button onClick={() => handleSendUpgradeEmail(b.email)} className="p-2 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 transition" title="Relance Mail"><Mail size={16}/></button>}
                                   <button onClick={() => handleSendResetPassword(b.email)} className="p-2 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-100 transition" title="Réinitialiser MDP"><Key size={16}/></button>
                                   <button onClick={() => toggleClientStatus(b)} className={`p-2 rounded-lg transition ${b.is_active ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'bg-rose-50 text-rose-600 hover:bg-rose-100'}`} title={b.is_active ? "Désactiver" : "Réactiver"}><Power size={16}/></button>
                                   <button onClick={() => onAccessClient(b.user_id, b.email)} className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition" title="Accéder au compte"><Eye size={16}/></button>
                               </td>
                           </tr>
                       );
                   })}
                </tbody>
             </table>
             {filteredBusinesses.length === 0 && <div className="text-center p-8 text-slate-400">Aucun client trouvé.</div>}
          </div>
       </div>
    </div>
  );
}
