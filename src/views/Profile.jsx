import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { 
  Building, MapPin, Phone, Globe, Facebook, Instagram, 
  Save, Clock, Fingerprint, AlignLeft, Camera, ShieldCheck 
} from "lucide-react";

export default function Profile({ user, profile, setProfile }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "", type: "", description: "", siret: "", phone: "",
    address: "", city: "", zip_code: "", website: "",
    facebook_url: "", instagram_url: "", google_url: "",
    google_review_url: "", logo_url: ""
  });
  const [hours, setHours] = useState([]);

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
      alert("✅ Profil complet mis à jour !");
    } catch (err) { alert("❌ Erreur: " + err.message); }
    finally { setLoading(false); }
  };

  return (
    <form onSubmit={handleUpdate} className="max-w-6xl mx-auto space-y-8 pb-16">
      <div className="flex justify-between items-center bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
        <h1 className="text-3xl font-black text-slate-900">Mon Établissement</h1>
        <button type="submit" disabled={loading} className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-lg">
          <Save size={20}/> {loading ? "Enregistrement..." : "Sauvegarder tout"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
            <h3 className="text-xl font-black text-slate-900 flex items-center gap-3"><Building className="text-indigo-600" /> Identité & Légal</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase">Nom Commercial</label>
                <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold" required />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase">SIRET</label>
                <input type="text" value={formData.siret} onChange={e => setFormData({...formData, siret: e.target.value})} className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase">Description IA</label>
              <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full p-4 bg-slate-50 border-none rounded-2xl font-medium h-32" />
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
            <h3 className="text-xl font-black text-slate-900 flex items-center gap-3"><MapPin className="text-red-500" /> Adresse & Contact</h3>
            <input type="text" placeholder="Adresse" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold" />
            <div className="grid grid-cols-2 gap-4">
              <input type="text" placeholder="Ville" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold" />
              <input type="text" placeholder="Code Postal" value={formData.zip_code} onChange={e => setFormData({...formData, zip_code: e.target.value})} className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold" />
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
            <h3 className="text-xl font-black text-slate-900 flex items-center gap-3"><Globe className="text-blue-500" /> Réseaux Sociaux</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-2xl"><Facebook className="text-blue-600"/><input type="text" placeholder="Facebook" value={formData.facebook_url} onChange={e => setFormData({...formData, facebook_url: e.target.value})} className="bg-transparent border-none w-full text-sm font-bold" /></div>
              <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-2xl"><Instagram className="text-pink-600"/><input type="text" placeholder="Instagram" value={formData.instagram_url} onChange={e => setFormData({...formData, instagram_url: e.target.value})} className="bg-transparent border-none w-full text-sm font-bold" /></div>
              <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-2xl"><Globe className="text-amber-500"/><input type="text" placeholder="Lien Google" value={formData.google_review_url} onChange={e => setFormData({...formData, google_review_url: e.target.value})} className="bg-transparent border-none w-full text-sm font-bold" /></div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-4">
            <h3 className="text-xl font-black text-slate-900 flex items-center gap-3"><Clock className="text-amber-600" /> Horaires</h3>
            {hours.map((h, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 bg-slate-50 rounded-xl text-xs font-bold">
                <span>{h.day}</span>
                {!h.closed ? <span>{h.open} - {h.close}</span> : <span className="text-red-500">Fermé</span>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </form>
  );
}
