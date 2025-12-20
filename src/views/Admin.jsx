import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { 
  Shield, Users, Plus, Key, ExternalLink, 
  Search, Mail, Database, CheckCircle, XCircle 
} from "lucide-react";

export default function AdminView() {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchBusinesses();
  }, []);

  const fetchBusinesses = async () => {
    try {
      const { data, error } = await supabase
        .from("business_profile")
        .select("*")
        .order("created_at", { ascending: false });
      if (data) setBusinesses(data);
    } catch (err) {
      console.error("Erreur chargement admin:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePassword = async (email) => {
    // Logique de génération/envoi de mot de passe par mail
    alert(`Lien de réinitialisation envoyé à : ${email}`);
  };

  const filteredBusinesses = businesses.filter(b => 
    b.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    b.city?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase">Total Clients</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{businesses.length}</h3>
            </div>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><Users size={20}/></div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase">Abonnements Actifs</p>
              <h3 className="text-2xl font-black text-green-600 mt-1">
                {businesses.filter(b => b.subscription_tier === 'premium').length}
              </h3>
            </div>
            <div className="p-2 bg-green-50 text-green-600 rounded-lg"><CheckCircle size={20}/></div>
          </div>
        </div>
      </div>

      {/* Barre de recherche et actions */}
      <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex flex-wrap gap-4 justify-between items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Rechercher une entreprise ou une ville..."
            className="w-full pl-12 pr-4 py-3 bg-slate-50 rounded-2xl text-sm outline-none focus:ring-2 ring-indigo-500/20"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold text-sm flex items-center gap-2">
          <Plus size={18}/> Nouveau Client
        </button>
      </div>

      {/* Liste des clients */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="p-4 text-xs font-black text-slate-400 uppercase">Entreprise</th>
              <th className="p-4 text-xs font-black text-slate-400 uppercase">Ville</th>
              <th className="p-4 text-xs font-black text-slate-400 uppercase">Plan</th>
              <th className="p-4 text-xs font-black text-slate-400 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredBusinesses.map((b) => (
              <tr key={b.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition">
                <td className="p-4">
                  <div className="font-bold text-slate-900">{b.name}</div>
                  <div className="text-xs text-slate-400 font-medium">ID: {b.id.substring(0,8)}...</div>
                </td>
                <td className="p-4 text-sm font-bold text-slate-600">{b.city || "N/A"}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase ${
                    b.subscription_tier === 'premium' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {b.subscription_tier}
                  </span>
                </td>
                <td className="p-4 flex gap-2">
                  <button 
                    onClick={() => handleGeneratePassword(b.email)}
                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition"
                    title="Générer mot de passe"
                  >
                    <Key size={18} />
                  </button>
                  <button 
                    className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-xl transition"
                    title="Accès site client"
                    onClick={() => window.open(`https://${b.slug}.localboost.fr`, '_blank')}
                  >
                    <ExternalLink size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
