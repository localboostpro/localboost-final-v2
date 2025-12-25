import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { Building, MapPin, Phone, Globe, Facebook, Instagram, Save, Clock, Fingerprint } from "lucide-react";

export default function Profile({ user, profile, setProfile }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({});
  const [hours, setHours] = useState([]);

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || "",
        siret: profile.siret || "",
        phone: profile.phone || "",
        address: profile.address || "",
        city: profile.city || "",
        zip_code: profile.zip_code || "",
        website: profile.website || "",
        facebook_url: profile.facebook_url || "",
        instagram_url: profile.instagram_url || "",
        google_url: profile.google_url || "",
        description: profile.description || "",
      });
      // Gestion sécurisée des horaires JSON
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
      const { data, error } = await supabase.from("business_profile").update({ ...formData, opening_hours: JSON.stringify(hours) }).eq("user_id", user.id).select().single();
      if (error) throw error;
      setProfile(data);
      alert("✅ Profil mis à jour !");
    } catch (err) { alert("❌ Erreur: " + err.message); }
    finally { setLoading(false); }
  };

  return (
    <form onSubmit={handleUpdate} className="max-w-5xl mx-auto space-y-6 pb-12">
      <div className="flex justify-between items-center bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
        <h1 className="text-2xl font-black">Mon Établissement</h1>
        <button type="submit" disabled={loading} className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2">
          <Save size={20}/> {loading ? "Enregistrement..." : "Sauvegarder"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Infos de base */}
        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 space-y-4 shadow-sm">
          <h3 className="font-black text-indigo-600 flex items-center gap-2"><Building size={20}/> Identité</h3>
          <input type="text" placeholder="Nom" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-3 bg-slate-50 border-none rounded-xl font-bold" />
          <div className="flex gap-3">
             <div className="flex-1"><Fingerprint size={14}/> <input type="text" placeholder="SIRET" value={formData.siret} onChange={e => setFormData({...formData, siret: e.target.value})} className="w-full p-3 bg-slate-50 border-none rounded-xl text-sm" /></div>
          </div>
        </div>

        {/* Réseaux Sociaux */}
        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 space-y-4 shadow-sm">
          <h3 className="font-black text-pink-600 flex items-center gap-2"><Instagram size={20}/> Visibilité Web</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl"><Facebook size={18} className="text-blue-600"/><input type="text" placeholder="Facebook URL" value={formData.facebook_url} onChange={e => setFormData({...formData, facebook_url: e.target.value})} className="bg-transparent border-none w-full text-sm" /></div>
            <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl"><Instagram size={18} className="text-pink-600"/><input type="text" placeholder="Instagram URL" value={formData.instagram_url} onChange={e => setFormData({...formData, instagram_url: e.target.value})} className="bg-transparent border-none w-full text-sm" /></div>
            <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl"><Globe size={18} className="text-indigo-600"/><input type="text" placeholder="Lien Google Avis" value={formData.google_url} onChange={e => setFormData({...formData, google_url: e.target.value})} className="bg-transparent border-none w-full text-sm" /></div>
          </div>
        </div>

        {/* Horaires (Design conservé du repo) */}
        <div className="md:col-span-2 bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
           <h3 className="font-black text-amber-600 flex items-center gap-2 mb-4"><Clock size={20}/> Horaires d'ouverture</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {hours.map((h, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                  <span className="font-bold w-20">{h.day}</span>
                  <div className="flex items-center gap-2">
                    <input type="time" value={h.open} onChange={e => { const newH = [...hours]; newH[idx].open = e.target.value; setHours(newH); }} className="p-1 rounded bg-white text-xs" />
                    <span>-</span>
                    <input type="time" value={h.close} onChange={e => { const newH = [...hours]; newH[idx].close = e.target.value; setHours(newH); }} className="p-1 rounded bg-white text-xs" />
                  </div>
                  <input type="checkbox" checked={h.closed} onChange={e => { const newH = [...hours]; newH[idx].closed = e.target.checked; setHours(newH); }} className="accent-red-500" />
                </div>
              ))}
           </div>
        </div>
      </div>
    </form>
  );
}
