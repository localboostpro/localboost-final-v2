import React, { useState, useEffect } from "react";
import { User, MapPin, Save, Globe, Facebook, Instagram, LayoutTemplate, CreditCard, CheckCircle } from "lucide-react";
import { supabase } from "../lib/supabase";

export default function Profile({ profile, setProfile }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "", city: "", address: "", phone: "",
    google_url: "", facebook_url: "", instagram_url: "",
    ...profile
  });

  useEffect(() => {
    if (profile) setFormData(prev => ({ ...prev, ...profile }));
  }, [profile]);

  const handleSave = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.from("business_profile").update({
          name: formData.name, city: formData.city, address: formData.address, phone: formData.phone,
          google_url: formData.google_url, facebook_url: formData.facebook_url, instagram_url: formData.instagram_url
        }).eq("id", profile.id);

      if (error) throw error;
      setProfile({ ...profile, ...formData });
      alert("✅ Profil sauvegardé !");
    } catch (error) {
      console.error(error); alert("Erreur sauvegarde.");
    } finally {
      setLoading(false);
    }
  };

  // --- FONCTION DE CHANGEMENT DE FORFAIT CÔTÉ CLIENT CORRIGÉE ---
  const handleChangePlan = async (targetTier) => {
      if (profile.subscription_tier === targetTier) return; // Déjà sur ce plan

      const confirmMessage = targetTier === 'premium' 
        ? "Confirmer le passage en PREMIUM (99€/mois) ?" 
        : "Voulez-vous vraiment repasser en BASIC (Fonctions limitées) ?";
      
      if (!window.confirm(confirmMessage)) return;

      try {
          const { error } = await supabase.from("business_profile").update({ subscription_tier: targetTier }).eq("id", profile.id);
          
          if (error) throw error;
          
          setProfile({ ...profile, subscription_tier: targetTier });
          alert(`🎉 Félicitations ! Vous êtes maintenant ${targetTier.toUpperCase()}.`);
          
      } catch (err) {
          console.error("Erreur plan:", err);
          alert("Impossible de changer le forfait. Veuillez contacter le support.");
      }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="flex justify-between items-center bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm sticky top-0 z-10">
        <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <User className="text-indigo-600"/> Mon Profil
        </h3>
        <button onClick={handleSave} disabled={loading} className="px-6 py-3 rounded-xl font-bold transition bg-indigo-600 text-white hover:bg-indigo-700 flex items-center gap-2 shadow-lg shadow-indigo-200">
            <Save size={18} /> {loading ? "..." : "Enregistrer"}
        </button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Formulaire Infos */}
          <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
            <h4 className="font-black text-slate-900 mb-4 flex items-center gap-2"><MapPin size={18}/> Coordonnées</h4>
            <div className="space-y-1"><label className="text-xs font-bold text-slate-400 uppercase">Nom</label><input value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-50 p-3 rounded-xl font-bold border-2 border-transparent focus:border-indigo-500 outline-none"/></div>
            <div className="space-y-1"><label className="text-xs font-bold text-slate-400 uppercase">Adresse</label><input value={formData.address || ''} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full bg-slate-50 p-3 rounded-xl font-bold border-2 border-transparent focus:border-indigo-500 outline-none"/></div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1"><label className="text-xs font-bold text-slate-400 uppercase">Ville</label><input value={formData.city || ''} onChange={e => setFormData({...formData, city: e.target.value})} className="w-full bg-slate-50 p-3 rounded-xl font-bold border-2 border-transparent focus:border-indigo-500 outline-none"/></div>
                <div className="space-y-1"><label className="text-xs font-bold text-slate-400 uppercase">Tél</label><input value={formData.phone || ''} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-slate-50 p-3 rounded-xl font-bold border-2 border-transparent focus:border-indigo-500 outline-none"/></div>
            </div>
          </div>

          {/* Liens Sociaux */}
          <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
             <h4 className="font-black text-slate-900 mb-4 flex items-center gap-2"><Globe size={18}/> Réseaux</h4>
             <div className="space-y-1"><label className="text-xs font-bold text-slate-400 uppercase flex gap-2"><LayoutTemplate size={12}/> Google</label><input value={formData.google_url || ''} onChange={e => setFormData({...formData, google_url: e.target.value})} className="w-full bg-slate-50 p-3 rounded-xl font-bold border-2 border-transparent focus:border-indigo-500 outline-none"/></div>
             <div className="space-y-1"><label className="text-xs font-bold text-slate-400 uppercase flex gap-2"><Facebook size={12}/> Facebook</label><input value={formData.facebook_url || ''} onChange={e => setFormData({...formData, facebook_url: e.target.value})} className="w-full bg-slate-50 p-3 rounded-xl font-bold border-2 border-transparent focus:border-indigo-500 outline-none"/></div>
             <div className="space-y-1"><label className="text-xs font-bold text-slate-400 uppercase flex gap-2"><Instagram size={12}/> Instagram</label><input value={formData.instagram_url || ''} onChange={e => setFormData({...formData, instagram_url: e.target.value})} className="w-full bg-slate-50 p-3 rounded-xl font-bold border-2 border-transparent focus:border-indigo-500 outline-none"/></div>
          </div>
      </div>

      {/* SECTION ABONNEMENT */}
      <div className="bg-slate-900 text-white p-8 rounded-[2rem] shadow-xl">
        <h3 className="text-xl font-black flex items-center gap-2 mb-6"><CreditCard className="text-indigo-400"/> Mon Abonnement</h3>
        <div className="flex flex-col md:flex-row gap-6 items-center">
            {/* CARTE BASIC */}
            <div className={`flex-1 p-6 rounded-2xl border-2 transition ${profile.subscription_tier === 'basic' ? 'border-indigo-500 bg-white/10' : 'border-white/10 opacity-70 hover:opacity-100'}`}>
                <div className="flex justify-between items-center mb-2"><span className="font-black text-lg">BASIC</span>{profile.subscription_tier === 'basic' && <CheckCircle className="text-green-400"/>}</div>
                <p className="text-slate-400 text-sm mb-4">Essentiel.</p>
                <div className="text-2xl font-black mb-4">29€</div>
                {profile.subscription_tier !== 'basic' && <button onClick={() => handleChangePlan('basic')} className="w-full py-2 bg-white/10 rounded-xl font-bold text-sm hover:bg-white/20">Choisir Basic</button>}
            </div>

            {/* CARTE PREMIUM */}
            <div className={`flex-1 p-6 rounded-2xl border-2 transition ${profile.subscription_tier === 'premium' ? 'border-indigo-500 bg-indigo-600/20' : 'border-white/10 opacity-70 hover:opacity-100'}`}>
                <div className="flex justify-between items-center mb-2"><span className="font-black text-lg text-indigo-400">PREMIUM</span>{profile.subscription_tier === 'premium' && <CheckCircle className="text-green-400"/>}</div>
                <p className="text-slate-400 text-sm mb-4">Illimité + IA.</p>
                <div className="text-2xl font-black mb-4">99€</div>
                {profile.subscription_tier !== 'premium' && <button onClick={() => handleChangePlan('premium')} className="w-full py-2 bg-indigo-600 rounded-xl font-bold text-sm hover:bg-indigo-500 shadow-lg">Choisir Premium</button>}
            </div>
        </div>
      </div>
    </div>
  );
}
