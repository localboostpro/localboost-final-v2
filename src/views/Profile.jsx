import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { 
  Building, MapPin, Phone, Globe, Facebook, Instagram, 
  Save, Clock, Fingerprint, AlignLeft, Link as LinkIcon, Camera 
} from "lucide-react";

export default function Profile({ user, profile, setProfile }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    description: "",
    siret: "",
    phone: "",
    address: "",
    city: "",
    zip_code: "",
    website: "",
    facebook_url: "",
    instagram_url: "",
    google_url: "",
    google_review_url: "",
    logo_url: ""
  });
  const [hours, setHours] = useState([]);

  // Synchronisation stricte avec TOUTES les données du profil
  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || "",
        type: profile.type || "",
        description: profile.description || "",
        siret: profile.siret || "",
        phone: profile.phone || "",
        address: profile.address || "",
        city: profile.city || "",
        zip_code: profile.zip_code || "",
        website: profile.website || "",
        facebook_url: profile.facebook_url || "",
        instagram_url: profile.instagram_url || "",
        google_url: profile.google_url || "",
        google_review_url: profile.google_review_url || "",
        logo_url: profile.logo_url || ""
      });

      try {
        const h = typeof profile.opening_hours === 'string' 
          ? JSON.parse(profile.opening_hours) 
          : profile.opening_hours;
        setHours(Array.isArray(h) ? h : []);
      } catch (e) {
        console.error("Erreur parsing horaires:", e);
        setHours([]);
      }
    }
  }, [profile]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const updateData = {
        ...formData,
        opening_hours: JSON.stringify(hours),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from("business_profile")
        .update(updateData)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) throw error;
      setProfile(data);
      alert("✅ Établissement mis à jour avec succès !");
    } catch (err) {
      alert("❌ Erreur lors de la sauvegarde : " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleUpdate} className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Header fixe avec bouton de sauvegarde */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Mon Établissement</h1>
          <p className="text-slate-500 font-medium">Gérez toutes les informations publiques de votre commerce.</p>
        </div>
        <button type="submit" disabled={loading} className="w-full md:w-auto bg-indigo-600 text-white px-10 py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
          <Save size={20}/> {loading ? "Enregistrement..." : "Sauvegarder tout"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Colonne Gauche : Identité & Contact */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Section 1 : Informations Légales & Identité */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
            <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
              <Building className="text-indigo-600" /> Identité de l'entreprise
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase ml-1">Nom Commercial</label>
                <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold focus:ring-2 ring-indigo-500" required />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase ml-1">Type d'activité</label>
                <input type="text" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold focus:ring-2 ring-indigo-500" placeholder="ex: Boulangerie, Restaurant..." />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase ml-1">N° SIRET</label>
                <div className="relative">
                  <Fingerprint className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input type="text" value={formData.siret} onChange={e => setFormData({...formData, siret: e.target.value})} className="w-full p-4 pl-12 bg-slate-50 border-none rounded-2xl font-medium" placeholder="123 456 789 00012" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase ml-1">Téléphone</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full p-4 pl-12 bg-slate-50 border-none rounded-2xl font-medium" />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase ml-1">Description / Bio (IA)</label>
              <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full p-4 bg-slate-50 border-none rounded-2xl font-medium h-32 focus:ring-2 ring-indigo-500" placeholder="Parlez de votre savoir-faire..." />
            </div>
          </div>

          {/* Section 2 : Localisation */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
            <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
              <MapPin className="text-red-500" /> Localisation
            </h3>
            <div className="space-y-4">
              <input type="text" placeholder="Adresse complète" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full p-4 bg-slate-50 border-none rounded-2xl font-medium" />
              <div className="grid grid-cols-2 gap-4">
                <input type="text" placeholder="Code Postal" value={formData.zip_code} onChange={e => setFormData({...formData, zip_code: e.target.value})} className="w-full p-4 bg-slate-50 border-none rounded-2xl font-medium" />
                <input type="text" placeholder="Ville" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="w-full p-4 bg-slate-50 border-none rounded-2xl font-medium" />
              </div>
            </div>
          </div>
        </div>

        {/* Colonne Droite : Web & Horaires */}
        <div className="space-y-8">
          
          {/* Section 3 : Liens Web & Réseaux Sociaux */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
            <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
              <Globe className="text-blue-500" /> Présence en ligne
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-2xl border border-slate-100">
                <div className="bg-white p-2 rounded-xl shadow-sm text-indigo-600"><Globe size={18}/></div>
                <input type="text" placeholder="Site Web" value={formData.website} onChange={e => setFormData({...formData, website: e.target.value})} className="bg-transparent border-none w-full text-sm font-bold" />
              </div>
              <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-2xl border border-slate-100">
                <div className="bg-white p-2 rounded-xl shadow-sm text-blue-600"><Facebook size={18}/></div>
                <input type="text" placeholder="URL Facebook" value={formData.facebook_url} onChange={e => setFormData({...formData, facebook_url: e.target.value})} className="bg-transparent border-none w-full text-sm font-bold" />
              </div>
              <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-2xl border border-slate-100">
                <div className="bg-white p-2 rounded-xl shadow-sm text-pink-600"><Instagram size={18}/></div>
                <input type="text" placeholder="URL Instagram" value={formData.instagram_url} onChange={e => setFormData({...formData, instagram_url: e.target.value})} className="bg-transparent border-none w-full text-sm font-bold" />
              </div>
              <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-2xl border border-slate-100">
                <div className="bg-white p-2 rounded-xl shadow-sm text-amber-500"><Camera size={18}/></div>
                <input type="text" placeholder="Lien Google Avis" value={formData.google_review_url} onChange={e => setFormData({...formData, google_review_url: e.target.value})} className="bg-transparent border-none w-full text-sm font-bold" />
              </div>
            </div>
          </div>

          {/* Section 4 : Horaires (Logique conservée) */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
            <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
              <Clock className="text-amber-600" /> Horaires
            </h3>
            <div className="space-y-3">
              {hours.map((h, idx) => (
                <div key={idx} className={`flex items-center justify-between p-3 rounded-2xl transition-all ${h.closed ? 'bg-red-50 opacity-60' : 'bg-slate-50'}`}>
                  <span className="font-black text-xs uppercase w-16">{h.day}</span>
                  {!h.closed ? (
                    <div className="flex items-center gap-2">
                      <input type="time" value={h.open} onChange={e => { const newH = [...hours]; newH[idx].open = e.target.value; setHours(newH); }} className="p-1 rounded bg-white text-[10px] font-bold border-none" />
                      <span className="text-slate-300">-</span>
                      <input type="time" value={h.close} onChange={e => { const newH = [...hours]; newH[idx].close = e.target.value; setHours(newH); }} className="p-1 rounded bg-white text-[10px] font-bold border-none" />
                    </div>
                  ) : (
                    <span className="text-[10px] font-black text-red-500 uppercase">Fermé</span>
                  )}
                  <input type="checkbox" checked={h.closed} onChange={e => { const newH = [...hours]; newH[idx].closed = e.target.checked; setHours(newH); }} className="accent-indigo-600" title="Cocher si fermé" />
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </form>
  );
}
