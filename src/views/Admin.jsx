import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { 
  Shield, Users, LogOut, Search, ExternalLink, 
  Key, Eye, Plus, X, Phone, Calendar, Power, TrendingUp 
} from "lucide-react";

export default function AdminView({ onAccessClient }) {
  const [businesses, setBusinesses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState({ total: 0, premium: 0, revenue: 0 });
  const [monthlyStats, setMonthlyStats] = useState([]); // Pour le CA mois par mois
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [newClient, setNewClient] = useState({ name: "", email: "", city: "", phone: "" });

  useEffect(() => {
    fetchBusinesses();
  }, []);

  const fetchBusinesses = async () => {
    const { data } = await supabase.from("business_profile").select("*").order("created_at", { ascending: false });
    if (data) {
      // On s'assure que les champs existent
      const sanitizedData = data.map(b => ({ 
        ...b, 
        discount_percent: b.discount_percent || 0,
        is_active: b.is_active !== false // Par défaut true si indéfini
      }));
      setBusinesses(sanitizedData);
      calculateStats(sanitizedData);
      calculateMonthlyRevenue(sanitizedData);
    }
  };

  const calculateStats = (data) => {
    const premiumCount = data.filter(b => b.subscription_tier === 'premium').length;
    const totalRevenue = data.reduce((acc, curr) => {
      if (!curr.is_active) return acc; // On ne compte pas les inactifs
      const basePrice = curr.subscription_tier === 'premium' ? 99 : 29;
      const discount = curr.discount_percent || 0;
      return acc + (basePrice * (1 - discount / 100));
    }, 0);

    setStats({
      total: data.length,
      premium: premiumCount,
      revenue: Math.round(totalRevenue)
    });
  };

  // Calcul du CA mois par mois (basé sur la date de création pour l'exemple)
  const calculateMonthlyRevenue = (data) => {
    const months = {};
    data.forEach(b => {
      if (!b.is_active) return;
      const date = new Date(b.created_at);
      const key = `${date.getMonth() + 1}/${date.getFullYear()}`;
      const price = (b.subscription_tier === 'premium' ? 99 : 29) * (1 - (b.discount_percent || 0)/100);
      
      if (!months[key]) months[key] = 0;
      months[key] += price;
    });
    setMonthlyStats(Object.entries(months).map(([k, v]) => ({ date: k, amount: Math.round(v) })));
  };

  const toggleClientStatus = async (client) => {
    const newStatus = !client.is_active;
    const { error } = await supabase.from("business_profile").update({ is_active: newStatus }).eq("id", client.id);
    if (!error) {
      const updatedList = businesses.map(b => b.id === client.id ? { ...b, is_active: newStatus } : b);
      setBusinesses(updatedList);
      calculateStats(updatedList); // Recalculer le CA sans ce client s'il est désactivé
    }
  };

  // ... (Garder handleSwitchPlan, handleDiscountChange, handleCreateClient, etc. du code précédent)
  // Je remets les fonctions essentielles pour que le code soit complet
  const handleSwitchPlan = async (clientId, currentTier) => {
    const newTier = currentTier === 'basic' ? 'premium' : 'basic';
    const { error } = await supabase.from("business_profile").update({ subscription_tier: newTier }).eq("id", clientId);
    if (!error) {
       const updated = businesses.map(b => b.id === clientId ? { ...b, subscription_tier: newTier } : b);
       setBusinesses(updated);
       calculateStats(updated);
    }
  };

  const handleDiscountChange = async (clientId, val) => {
      const percent = parseInt(val) || 0;
      await supabase.from("business_profile").update({ discount_percent: percent }).eq("id", clientId);
      const updated = businesses.map(b => b.id === clientId ? { ...b, discount_percent: percent } : b);
      setBusinesses(updated);
      calculateStats(updated);
  };

  const handleLogout = async () => { await supabase.auth.signOut(); window.location.reload(); };

  const filteredBusinesses = businesses.filter(b => 
    b.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    b.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-100 p-8 animate-in fade-in duration-300">
      
      {/* 1. LOGO LOCALBOOST PRO */}
      <div className="flex justify-between items-center mb-8 bg-slate-900 text-white p-6 rounded-3xl shadow-xl sticky top-4 z-20">
        <div className="flex items-center gap-4">
          <div className="bg-indigo-600 p-3 rounded-xl">
            <Shield size={28} className="text-white" />
          </div>
          <h1 className="text-3xl font-black tracking-tight">LocalBoost <span className="text-indigo-400">Pro</span></h1>
        </div>
        
        <div className="flex items-center gap-4">
            <div className="text-right mr-4">
                <div className="text-xs font-bold text-slate-400 uppercase">Revenu Mensuel Actif</div>
                <div className="text-2xl font-black text-emerald-400">{stats.revenue} €</div>
            </div>
            <button onClick={handleLogout} className="bg-white/10 hover:bg-white/20 p-3 rounded-xl transition"><LogOut size={20}/></button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-8">
        {/* 3. STATS DÉTAILLÉES (CA MOIS PAR MOIS) */}
        <div className="lg:col-span-1 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <h3 className="font-black text-slate-900 flex items-center gap-2 mb-4">
                <TrendingUp className="text-indigo-600"/> Performance
            </h3>
            <div className="space-y-3">
                <div className="flex justify-between text-xs font-bold text-slate-400 uppercase border-b pb-2">
                    <span>Période</span>
                    <span>CA</span>
                </div>
                {monthlyStats.length > 0 ? monthlyStats.map((stat, idx) => (
                    <div key={idx} className="flex justify-between items-center font-medium text-sm">
                        <span className="text-slate-600">{stat.date}</span>
                        <span className="font-bold text-slate-900">{stat.amount} €</span>
                    </div>
                )) : <div className="text-sm text-slate-400">Pas encore de données.</div>}
            </div>
        </div>

        {/* TABLEAU CLIENTS */}
        <div className="lg:col-span-3 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
               <h3 className="font-black text-lg text-slate-900">Clients ({stats.total})</h3>
               <div className="relative w-64">
                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16}/>
                   <input type="text" placeholder="Rechercher..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                   className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-2 ring-indigo-500"/>
               </div>
            </div>
            
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 text-xs font-black text-slate-400 uppercase">
                        <tr>
                            <th className="p-4">Client</th>
                            <th className="p-4">Statut</th>
                            <th className="p-4">Forfait</th>
                            <th className="p-4 text-center">Remise (%)</th>
                            <th className="p-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 text-sm">
                        {filteredBusinesses.map(b => (
                            <tr key={b.id} className={`hover:bg-slate-50 transition ${!b.is_active ? 'opacity-50 grayscale' : ''}`}>
                                <td className="p-4">
                                    <div className="font-bold text-slate-900">{b.name}</div>
                                    <div className="text-xs text-slate-500">{b.city || "Ville ?"} • {b.phone || "Tél ?"}</div>
                                </td>
                                <td className="p-4">
                                    {/* 4. OPTION DÉSACTIVER CLIENT */}
                                    <button 
                                        onClick={() => toggleClientStatus(b)}
                                        className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase border ${
                                            b.is_active 
                                            ? 'bg-emerald-100 text-emerald-700 border-emerald-200' 
                                            : 'bg-rose-100 text-rose-700 border-rose-200'
                                        }`}
                                    >
                                        <Power size={10}/> {b.is_active ? "Actif" : "Suspendu"}
                                    </button>
                                </td>
                                <td className="p-4">
                                    <button onClick={() => handleSwitchPlan(b.id, b.subscription_tier)} className="px-2 py-1 bg-slate-100 rounded text-xs font-bold hover:bg-slate-200">
                                        {b.subscription_tier}
                                    </button>
                                </td>
                                <td className="p-4 text-center">
                                    <input type="number" min="0" max="100" value={b.discount_percent} onChange={(e) => handleDiscountChange(b.id, e.target.value)}
                                    className="w-12 text-center bg-slate-50 border rounded font-bold"/>
                                </td>
                                <td className="p-4 text-right flex justify-end gap-2">
                                    <button onClick={() => onAccessClient(b.user_id, b.email)} className="p-2 text-indigo-600 bg-indigo-50 rounded-lg" title="Voir Compte"><Eye size={16}/></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
      </div>
    </div>
  );
}
