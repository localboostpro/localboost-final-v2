import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { 
  Shield, Users, CreditCard, Key, Search, 
  TrendingUp, CheckCircle, AlertCircle 
} from "lucide-react";

export default function AdminView() {
  const [businesses, setBusinesses] = useState([]);
  const [stats, setStats] = useState({ total: 0, basic: 0, premium: 0, revenue: 0 });
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Récupération de tous les clients
      const { data, error } = await supabase
        .from("business_profile")
        .select("*")
        .order("created_at", { ascending: false });

      if (data) {
        setBusinesses(data);
        
        // Calcul des stats en temps réel
        const basicCount = data.filter(b => b.subscription_tier === 'basic').length;
        const premiumCount = data.filter(b => b.subscription_tier === 'premium').length;
        // Simulation du revenu (ex: Premium à 29€)
        const estimatedRevenue = premiumCount * 29; 

        setStats({
          total: data.length,
          basic: basicCount,
          premium: premiumCount,
          revenue: estimatedRevenue
        });
      }
    } catch (err) {
      console.error("Erreur admin:", err);
    }
  };

  const handleResetPassword = (email) => {
    // Simulation d'envoi
    alert(`📧 Email de réinitialisation envoyé à ${email}`);
  };

  const filteredList = businesses.filter(b => 
    b.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    b.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      
      {/* 1. HEADER & STATS GLOBALES */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl flex flex-col justify-between">
          <div>
            <p className="text-slate-400 font-bold text-xs uppercase mb-1">Revenu Mensuel Est.</p>
            <h3 className="text-3xl font-black">{stats.revenue} €</h3>
          </div>
          <div className="flex items-center gap-2 mt-4 text-emerald-400 text-sm font-bold">
            <TrendingUp size={16}/> +12% ce mois
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-slate-400 font-bold text-xs uppercase">Total Clients</p>
            <h3 className="text-3xl font-black text-slate-900">{stats.total}</h3>
          </div>
          <div className="bg-slate-50 p-3 rounded-2xl text-slate-600"><Users size={24}/></div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-slate-400 font-bold text-xs uppercase">Forfaits Basic</p>
            <h3 className="text-3xl font-black text-slate-600">{stats.basic}</h3>
          </div>
          <div className="bg-slate-50 p-3 rounded-2xl text-slate-400"><CheckCircle size={24}/></div>
        </div>

        <div className="bg-indigo-600 text-white p-6 rounded-3xl shadow-lg shadow-indigo-200 flex items-center justify-between">
          <div>
            <p className="text-indigo-200 font-bold text-xs uppercase">Forfaits Premium</p>
            <h3 className="text-3xl font-black">{stats.premium}</h3>
          </div>
          <div className="bg-white/20 p-3 rounded-2xl text-white"><Shield size={24}/></div>
        </div>
      </div>

      {/* 2. VUE DÉTAILLÉE DES FORFAITS (Ce que vous demandiez) */}
      <h3 className="text-xl font-black text-slate-900 flex items-center gap-2 mt-8">
        <CreditCard className="text-indigo-600"/> Offres & Tarifs
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* CARTE BASIC */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10"><CheckCircle size={100}/></div>
          <div className="flex justify-between items-start relative z-10">
            <div>
              <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-black uppercase">Starter</span>
              <h4 className="text-2xl font-black text-slate-900 mt-2">Gratuit / Basic</h4>
              <p className="text-slate-500 text-sm mt-1">Accès limité (20 clients max)</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-black text-slate-900">0 €</div>
              <div className="text-xs text-slate-400 font-bold">/mois</div>
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-50 flex justify-between items-center relative z-10">
            <span className="text-sm font-bold text-slate-600">{stats.basic} utilisateurs actifs</span>
            <div className="h-2 w-24 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-slate-400" style={{ width: `${(stats.basic / stats.total) * 100}%` }}></div>
            </div>
          </div>
        </div>

        {/* CARTE PREMIUM */}
        <div className="bg-gradient-to-br from-indigo-600 to-violet-700 text-white p-6 rounded-3xl shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10"><Shield size={100}/></div>
          <div className="flex justify-between items-start relative z-10">
            <div>
              <span className="bg-white/20 text-white px-3 py-1 rounded-full text-xs font-black uppercase">Pro</span>
              <h4 className="text-2xl font-black mt-2">Premium</h4>
              <p className="text-indigo-100 text-sm mt-1">Illimité + IA avancée</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-black">29 €</div>
              <div className="text-xs text-indigo-200 font-bold">/mois</div>
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-white/10 flex justify-between items-center relative z-10">
            <span className="text-sm font-bold text-indigo-100">{stats.premium} utilisateurs actifs</span>
            <div className="h-2 w-24 bg-black/20 rounded-full overflow-hidden">
              <div className="h-full bg-white" style={{ width: `${(stats.premium / stats.total) * 100}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. GESTION DES CLIENTS (Tableau) */}
      <div className="flex justify-between items-center mt-8 mb-4">
        <h3 className="text-xl font-black text-slate-900">Base Clients</h3>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text" 
            placeholder="Rechercher..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="p-4 text-xs font-black text-slate-400 uppercase">Entreprise</th>
              <th className="p-4 text-xs font-black text-slate-400 uppercase">Contact</th>
              <th className="p-4 text-xs font-black text-slate-400 uppercase">Offre</th>
              <th className="p-4 text-xs font-black text-slate-400 uppercase text-right">Admin</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredList.map((client) => (
              <tr key={client.id} className="hover:bg-slate-50/50 transition">
                <td className="p-4">
                  <div className="font-bold text-slate-900">{client.name}</div>
                  <div className="text-xs text-slate-400">{client.city || "Ville inconnue"}</div>
                </td>
                <td className="p-4 text-sm text-slate-600 font-medium">
                  {client.email}
                </td>
                <td className="p-4">
                  {client.subscription_tier === 'premium' ? (
                    <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase border border-indigo-100">Premium</span>
                  ) : (
                    <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-lg text-[10px] font-black uppercase">Basic</span>
                  )}
                </td>
                <td className="p-4 text-right">
                  <button 
                    onClick={() => handleResetPassword(client.email)}
                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition"
                    title="Envoyer mot de passe"
                  >
                    <Key size={18}/>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredList.length === 0 && (
          <div className="p-8 text-center text-slate-400 font-bold text-sm">
            Aucun client trouvé pour "{searchTerm}"
          </div>
        )}
      </div>
    </div>
  );
}
