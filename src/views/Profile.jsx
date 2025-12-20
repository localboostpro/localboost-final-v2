import React, { useState, useEffect } from "react";
import { User, MapPin, Phone, Save, Globe, Facebook, Instagram, LayoutTemplate } from "lucide-react";
import { supabase } from "../lib/supabase";

export default function Profile({ profile, setProfile }) {
  const [loading, setLoading] = useState(false);
  // Initialisation sécurisée des données
  const [formData, setFormData] = useState({
    name: "",
    city: "",
    address: "",
    phone: "",
    google_url: "",
    facebook_url: "",
    instagram_url: "",
    ...profile // On écrase avec les données existantes
  });

  // Mise à jour du formulaire si le profil change (chargement initial)
  useEffect(() => {
    if (profile) {
      setFormData(prev => ({
        ...prev,
        ...profile,
        // Sécurisation si les champs sont null en BDD
        google_url: profile.google_url || "",
        facebook_url: profile.facebook_url || "",
        instagram_url: profile.instagram_url || ""
      }));
    }
  }, [profile]);

  const handleSave = async () => {
    setLoading(true);
    try {
      // 1. Mise à jour BDD
      const { error } = await supabase
        .from("business_profile")
        .update({
          name: formData.name,
          city: formData.city,
          address: formData.address,
          phone: formData.phone,
          google_url: formData.google_url,
          facebook_url: formData.facebook_url,
          instagram_url: formData.instagram_url
        })
        .eq("id", profile.id);

      if (error) throw error;

      // 2. Mise à jour locale
      setProfile({ ...profile, ...formData });
      alert("✅ Profil et liens sauvegardés avec succès !");
    } catch (error) {
      console.error("Erreur sauvegarde:", error);
      alert("Erreur lors de la sauvegarde.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* HEADER + BOUTON SAUVEGARDER */}
      <div className="flex justify-between items-center bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm sticky top-0 z-10">
        <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <User className="text-indigo-600"/> Mon Profil Entreprise
        </h3>
        <button 
            onClick={handleSave} 
            disabled={loading}
            className="px-6 py-3 rounded-xl font-bold transition bg-indigo-600 text-white hover:bg-indigo-700 flex items-center gap-2 shadow-lg shadow-indigo-200"
        >
            <Save size={18} /> {loading ? "Enregistrement..." : "Enregistrer tout"}
        </button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* COLONNE GAUCHE : INFOS GÉNÉRALES */}
          <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
            <h4 className="font-black text-slate-900 mb-4 flex items-center gap-2"><MapPin size={18}/> Coordonnées</h4>
            
            <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase">Nom de l'entreprise</label>
                <input 
                    value={formData.name || ''} 
                    onChange={e => setFormData({...formData, name: e.target.value})} 
                    className="w-full bg-slate-50 p-3 rounded-xl font-bold text-slate-900 border-2 border-transparent focus:border-indigo-500 outline-none transition"
                />
            </div>
            
            <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase">Adresse Postale</label>
                <input 
                    value={formData.address || ''} 
                    onChange={e => setFormData({...formData, address: e.target.value})} 
                    className="w-full bg-slate-50 p-3 rounded-xl font-bold text-slate-900 border-2 border-transparent focus:border-indigo-500 outline-none transition"
                    placeholder="12 rue de la Paix..."
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase">Ville</label>
                    <input 
                        value={formData.city || ''} 
                        onChange={e => setFormData({...formData, city: e.target.value})} 
                        className="w-full bg-slate-50 p-3 rounded-xl font-bold text-slate-900 border-2 border-transparent focus:border-indigo-500 outline-none transition"
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase">Téléphone</label>
                    <input 
                        value={formData.phone || ''} 
                        onChange={e => setFormData({...formData, phone: e.target.value})} 
                        className="w-full bg-slate-50 p-3 rounded-xl font-bold text-slate-900 border-2 border-transparent focus:border-indigo-500 outline-none transition"
                    />
                </div>
            </div>
          </div>

          {/* COLONNE DROITE : LIENS SOCIAUX (Point 4) */}
          <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
             <h4 className="font-black text-slate-900 mb-4 flex items-center gap-2"><Globe size={18}/> Présence en Ligne</h4>
             
             <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2"><LayoutTemplate size={12}/> Google Business Profile</label>
                <input 
                    value={formData.google_url || ''} 
                    onChange={e => setFormData({...formData, google_url: e.target.value})} 
                    placeholder="https://g.page/..."
                    className="w-full bg-slate-50 p-3 rounded-xl font-bold text-slate-600 border-2 border-transparent focus:border-indigo-500 outline-none transition"
                />
            </div>

            <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2"><Facebook size={12}/> Page Facebook</label>
                <input 
                    value={formData.facebook_url || ''} 
                    onChange={e => setFormData({...formData, facebook_url: e.target.value})} 
                    placeholder="https://facebook.com/..."
                    className="w-full bg-slate-50 p-3 rounded-xl font-bold text-slate-600 border-2 border-transparent focus:border-indigo-500 outline-none transition"
                />
            </div>

            <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2"><Instagram size={12}/> Compte Instagram</label>
                <input 
                    value={formData.instagram_url || ''} 
                    onChange={e => setFormData({...formData, instagram_url: e.target.value})} 
                    placeholder="https://instagram.com/..."
                    className="w-full bg-slate-50 p-3 rounded-xl font-bold text-slate-600 border-2 border-transparent focus:border-indigo-500 outline-none transition"
                />
            </div>
          </div>
      </div>
    </div>
  );
}
