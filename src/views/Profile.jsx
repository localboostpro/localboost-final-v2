import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { getPlanBadge } from "../lib/plans";
import { 
  Building, MapPin, Phone, Globe, Facebook, Instagram, 
  Save, Clock, Fingerprint, Camera, Star, Briefcase, Mail
} from "lucide-react";

export default function Profile({ user, profile, setProfile }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "", type: "", description: "", siret: "", phone: "",
    address: "", city: "", zip_code: "", website: "",
    facebook_url: "", instagram_url: "", google_url: "",
    google_review_url: "", logo_url: "", category: "", email: ""
  });
  const [hours, setHours] = useState([]);

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || "",
        type: profile.type || "",
        category: profile.category || "",
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
        logo_url: profile.logo_url || "",
        email: profile.email || ""
      });
      try {
        const h = typeof profile.opening_hours === 'string' ? JSON.parse(profile.opening_hours) : profile.opening_hours;
        setHours(Array.isArray(h) ? h : []);
      } catch (e) { setHours([]); }
    }
  }, [profile]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("business_profile")
        .update({ ...formData, opening_hours: JSON.stringify(hours) })
        .eq("user_id", user.id)
        .select().single();
      if (error) throw error;
      setProfile(data);
      alert("✅ Établissement mis à jour avec succès !");
    } catch (err) { alert("❌ Erreur: " + err.message); }
    finally { setLoading(false); }
  };

  const currentPlan = getPlanBadge(profile?.plan || 'basic');

  return (
    <form onSubmit={handleUpdate} className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Header avec Badge de Forfait Restauré */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 gap-6">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center overflow-hidden border-2 border-slate-50">
            {formData.logo_url ? <img src={formData.logo_url} alt="Logo" className="w-full h-full object-cover" /> : <Camera className="text-slate-300" size={32} />}
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900">{formData.name || "Mon Établissement"}</h1>
            <div className={`mt-2 inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ${currentPlan.color}`}>
              {currentPlan.icon} Forfait {currentPlan.name}
            </div>
          </div>
        </div>
        <button type="submit" disabled={loading} className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-black flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-lg">
          <Save size={20}/> {loading ? "Enregistrement..." : "Sauvegarder tout"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Identité Complète */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
            <h3 className="text-xl font-black flex items-center gap-3"><Building className="text-indigo-600" /> Informations de l'établissement</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Nom commercial</label>
                <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Type d'activité / Catégorie</label>
                <input type="text" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">N° SIRET</label>
                <div className="relative">
                  <Fingerprint className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input type="text" value={formData.siret} onChange={e => setFormData({...formData, siret: e.target.value})} className="w-full p-4 pl-12 bg-slate-50 border-none rounded-2xl font-bold" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Email de contact</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full p-4 pl-12 bg-slate-50 border-none rounded-2xl font-bold" />
                </div>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Description / Bio IA</label>
              <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full p-4 bg-slate-50 border-none rounded-2xl font-medium h-32" />
            </div>
          </div>

          {/* Localisation Complète */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
            <h3 className="text-xl font-black flex items-center gap-3"><MapPin className="text-red-500" /> Localisation & Contact</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <input type="text" placeholder="Adresse" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="md:col-span-2 w-full p-4 bg-slate-50 border-none rounded-2xl font-bold" />
               <input type="text" placeholder="Ville" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold" />
               <input type="text" placeholder="Code Postal" value={formData.zip_code} onChange={e => setFormData({...formData, zip_code: e.target.value})} className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold" />
               <div className="md:col-span-2 relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input type="text" placeholder="Téléphone" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full p-4 pl-12 bg-slate-50 border-none rounded-2xl font-bold" />
               </div>
            </div>
          </div>
        </div>

        {/* Réseaux Sociaux & Horaires */}
        <div className="space-y-8">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
            <h3 className="text-xl font-black flex items-center gap-3"><Globe className="text-blue-500" /> Visibilité Web</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <Facebook className="text-blue-600"/><input type="text" placeholder="Facebook URL" value={formData.facebook_url} onChange={e => setFormData({...formData, facebook_url: e.target.value})} className="bg-transparent border-none w-full text-sm font-bold focus:ring-0" />
              </div>
              <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <Instagram className="text-pink-600"/><input type="text" placeholder="Instagram URL" value={formData.instagram_url} onChange={e => setFormData({...formData, instagram_url: e.target.value})} className="bg-transparent border-none w-full text-sm font-bold focus:ring-0" />
              </div>
              <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <Star className="text-amber-500"/><input type="text" placeholder="Lien Google Avis" value={formData.google_review_url} onChange={e => setFormData({...formData, google_review_url: e.target.value})} className="bg-transparent border-none w-full text-sm font-bold focus:ring-0" />
              </div>
              <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <Globe className="text-indigo-600"/><input type="text" placeholder="Site Web" value={formData.website} onChange={e => setFormData({...formData, website: e.target.value})} className="bg-transparent border-none w-full text-sm font-bold focus:ring-0" />
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-4">
            <h3 className="text-xl font-black flex items-center gap-3"><Clock className="text-amber-600" /> Horaires d'ouverture</h3>
            {hours.map((h, idx) => (
              <div key={idx} className={`flex items-center justify-between p-2.5 rounded-xl text-[10px] font-black uppercase transition-colors ${h.closed ? 'bg-red-50 text-red-500' : 'bg-slate-50 text-slate-600'}`}>
                <span className="w-16">{h.day}</span>
                {!h.closed ? (
                  <div className="flex items-center gap-1">
                    <input type="time" value={h.open} onChange={e => { const newH = [...hours]; newH[idx].open = e.target.value; setHours(newH); }} className="p-1 rounded bg-white border-none" />
                    <span>-</span>
                    <input type="time" value={h.close} onChange={e => { const newH = [...hours]; newH[idx].close = e.target.value; setHours(newH); }} className="p-1 rounded bg-white border-none" />
                  </div>
                ) : (
                  <span>Fermé</span>
                )}
                <input type="checkbox" checked={h.closed} onChange={e => { const newH = [...hours]; newH[idx].closed = e.target.checked; setHours(newH); }} className="accent-indigo-600" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </form>
  );
}
