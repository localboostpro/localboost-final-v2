import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { getPlanBadge } from "../lib/plans";
import { 
  Building, MapPin, Phone, Globe, Facebook, Instagram, 
  Save, Clock, Fingerprint, Camera, Mail, Star
} from "lucide-react";

export default function Profile({ user, profile, setProfile }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({});
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
        email: profile.email || "",
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
      alert("✅ Profil mis à jour !");
    } catch (err) { alert("❌ Erreur: " + err.message); }
    finally { setLoading(false); }
  };

  const currentPlan = getPlanBadge(profile?.plan || 'basic');

  return (
    <form onSubmit={handleUpdate} className="max-w-6xl mx-auto space-y-8 pb-16">
      <div className="flex justify-between items-center bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm gap-6">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center border-2 border-slate-50 overflow-hidden text-slate-300">
            {formData.logo_url ? <img src={formData.logo_url} alt="Logo" className="w-full h-full object-cover" /> : <Camera size={32} />}
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900">{formData.name || "Établissement"}</h1>
            <div className={`mt-2 inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ${currentPlan.color}`}>
              {currentPlan.icon} Forfait {currentPlan.name}
            </div>
          </div>
        </div>
        <button type="submit" disabled={loading} className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-black flex items-center gap-2 hover:bg-indigo-700 shadow-lg">
          <Save size={20}/> {loading ? "Enregistrement..." : "Sauvegarder tout"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
            <h3 className="text-xl font-black flex items-center gap-3"><Building className="text-indigo-600" /> Informations Légales</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Nom Commercial</label>
                <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold focus:ring-2 ring-indigo-500" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">SIRET</label>
                <div className="relative">
                  <Fingerprint className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input type="text" value={formData.siret} onChange={e => setFormData({...formData, siret: e.target.value})} className="w-full p-4 pl-12 bg-slate-50 border-none rounded-2xl font-bold" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Type d'activité</label>
                <input type="text" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold" />
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
              <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full p-4 bg-slate-50 border-none rounded-2xl font-medium h-32 focus:ring-2 ring-indigo-500" />
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
            <h3 className="text-xl font-black flex items-center gap-3"><MapPin className="text-red-500" /> Localisation & Contact</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <input type="text" placeholder="Adresse complète" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="md:col-span-2 w-full p-4 bg-slate-50 border-none rounded-2xl font-bold" />
               <input type="text" placeholder="Ville" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold" />
               <input type="text" placeholder="Code Postal" value={formData.zip_code} onChange={e => setFormData({...formData, zip_code: e.target.value})} className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold" />
               <div className="md:col-span-2 relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input type="text" placeholder="Téléphone commercial" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full p-4 pl-12 bg-slate-50 border-none rounded-2xl font-bold" />
               </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
            <h3 className="text-xl font-black flex items-center gap-3"><Globe className="text-blue-500" /> Présence Web</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-2xl border border-slate-100">
                <div className="bg-white p-2 rounded-xl shadow-sm text-indigo-600"><Globe size={18}/></div>
                <input type="text" placeholder="Site Web" value={formData.website} onChange={e => setFormData({...formData, website: e.target.value})} className="bg-transparent border-none w-full text-sm font-bold focus:ring-0" />
              </div>
              <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-2xl border border-slate-100">
                <div className="bg-white p-2 rounded-xl shadow-sm text-blue-600"><Facebook size={18}/></div>
                <input type="text" placeholder="Facebook URL" value={formData.facebook_url} onChange={e => setFormData({...formData, facebook_url: e.target.value})} className="bg-transparent border-none w-full text-sm font-bold focus:ring-0" />
              </div>
              <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-2xl border border-slate-100">
                <div className="bg-white p-2 rounded-xl shadow-sm text-pink-600"><Instagram size={18}/></div>
                <input type="text" placeholder="Instagram URL" value={formData.instagram_url} onChange={e => setFormData({...formData, instagram_url: e.target.value})} className="bg-transparent border-none w-full text-sm font-bold focus:ring-0" />
              </div>
              <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-2xl border border-slate-100">
                <div className="bg-white p-2 rounded-xl shadow-sm text-amber-500"><Star size={18}/></div>
                <input type="text" placeholder="Lien Google Avis" value={formData.google_review_url} onChange={e => setFormData({...formData, google_review_url: e.target.value})} className="bg-transparent border-none w-full text-sm font-bold focus:ring-0" />
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-4">
            <h3 className="text-xl font-black text-amber-600 flex items-center gap-3 mb-4"><Clock size={20}/> Horaires</h3>
            <div className="space-y-3">
              {hours.map((h, idx) => (
                <div key={idx} className={`flex items-center justify-between p-3 rounded-xl transition-all ${h.closed ? 'bg-red-50 opacity-60' : 'bg-slate-50'}`}>
                  <span className="font-black text-[10px] uppercase w-16">{h.day}</span>
                  {!h.closed ? (
                    <div className="flex items-center gap-1">
                      <input type="time" value={h.open} onChange={e => { const newH = [...hours]; newH[idx].open = e.target.value; setHours(newH); }} className="p-1 rounded bg-white text-[10px] font-bold border-none" />
                      <span className="text-slate-300">-</span>
                      <input type="time" value={h.close} onChange={e => { const newH = [...hours]; newH[idx].close = e.target.value; setHours(newH); }} className="p-1 rounded bg-white text-[10px] font-bold border-none" />
                    </div>
                  ) : (
                    <span className="text-[10px] font-black text-red-500 uppercase">Fermé</span>
                  )}
                  <input type="checkbox" checked={h.closed} onChange={e => { const newH = [...hours]; newH[idx].closed = e.target.checked; setHours(newH); }} className="accent-indigo-600" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
