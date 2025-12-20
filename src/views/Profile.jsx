import React, { useState } from "react";
import { User, MapPin, Phone, Building, CreditCard, CheckCircle, AlertCircle } from "lucide-react";
import { supabase } from "../lib/supabase";

export default function Profile({ profile, setProfile }) {
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ ...profile });

  const handleSave = async () => {
    // Mise à jour BDD (adresse, ville, tel...)
    const { error } = await supabase.from("business_profile").update(formData).eq("id", profile.id);
    if (!error) {
      setProfile(formData);
      setEditing(false);
      alert("Profil mis à jour !");
    }
  };

  const handleChangePlan = async (newTier) => {
    if(!window.confirm(`Voulez-vous passer au forfait ${newTier} ?`)) return;
    
    const { error } = await supabase.from("business_profile").update({ subscription_tier: newTier }).eq("id", profile.id);
    if(!error) {
        setProfile({...profile, subscription_tier: newTier});
        alert(`Félicitations ! Vous êtes maintenant ${newTier}.`);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* 2. INFOS CLIENTS ÉDITABLES */}
      <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-black text-slate-900 flex items-center gap-2"><User className="text-indigo-600"/> Informations Entreprise</h3>
          <button onClick={() => editing ? handleSave() : setEditing(true)} className={`px-4 py-2 rounded-xl font-bold transition ${editing ? 'bg-green-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
            {editing ? "Enregistrer" : "Modifier"}
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase">Nom de l'entreprise</label>
            <input disabled={!editing} value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-50 p-3 rounded-xl font-bold text-slate-900 border-transparent focus:border-indigo-500 border-2 outline-none transition"/>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase">Ville</label>
            <input disabled={!editing} value={formData.city || ''} onChange={e => setFormData({...formData, city: e.target.value})} className="w-full bg-slate-50 p-3 rounded-xl font-bold text-slate-900 border-transparent focus:border-indigo-500 border-2 outline-none transition"/>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase">Adresse</label>
            <input disabled={!editing} value={formData.address || ''} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full bg-slate-50 p-3 rounded-xl font-bold text-slate-900 border-transparent focus:border-indigo-500 border-2 outline-none transition"/>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase">Téléphone</label>
            <input disabled={!editing} value={formData.phone || ''} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-slate-50 p-3 rounded-xl font-bold text-slate-900 border-transparent focus:border-indigo-500 border-2 outline-none transition"/>
          </div>
        </div>
      </div>

      {/* 5. GESTION FORFAIT PAR LE CLIENT */}
      <div className="bg-slate-900 text-white p-8 rounded-[2rem] shadow-xl">
        <h3 className="text-xl font-black flex items-center gap-2 mb-6"><CreditCard className="text-indigo-400"/> Mon Abonnement</h3>
        
        <div className="flex flex-col md:flex-row gap-6 items-center">
            <div className={`flex-1 p-6 rounded-2xl border-2 ${profile.subscription_tier === 'basic' ? 'border-indigo-500 bg-white/10' : 'border-white/10 bg-transparent'}`}>
                <div className="flex justify-between items-center mb-2">
                    <span className="font-black text-lg">BASIC</span>
                    {profile.subscription_tier === 'basic' && <CheckCircle className="text-green-400"/>}
                </div>
                <p className="text-slate-400 text-sm mb-4">Fonctionnalités essentielles. Idéal pour démarrer.</p>
                <div className="text-2xl font-black mb-4">29€ <span className="text-sm font-normal">/mois</span></div>
                {profile.subscription_tier !== 'basic' && (
                    <button onClick={() => handleChangePlan('basic')} className="w-full py-2 bg-white/10 hover:bg-white/20 rounded-xl font-bold text-sm">Passer en Basic</button>
                )}
            </div>

            <div className={`flex-1 p-6 rounded-2xl border-2 ${profile.subscription_tier === 'premium' ? 'border-indigo-500 bg-indigo-600/20' : 'border-white/10 bg-transparent'}`}>
                <div className="flex justify-between items-center mb-2">
                    <span className="font-black text-lg text-indigo-400">PREMIUM</span>
                    {profile.subscription_tier === 'premium' && <CheckCircle className="text-green-400"/>}
                </div>
                <p className="text-slate-400 text-sm mb-4">Studio Marketing IA + Clients illimités.</p>
                <div className="text-2xl font-black mb-4">99€ <span className="text-sm font-normal">/mois</span></div>
                {profile.subscription_tier !== 'premium' && (
                    <button onClick={() => handleChangePlan('premium')} className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold text-sm shadow-lg shadow-indigo-900/50">Passer en Premium</button>
                )}
            </div>
        </div>
      </div>
    </div>
  );
}
