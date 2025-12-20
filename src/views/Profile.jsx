import React, { useState } from "react";
import { supabase } from "../lib/supabase";
import { User, MapPin, Save, Upload, Image as ImageIcon } from "lucide-react";

export default function Profile({ profile, setProfile }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: profile?.name || "",
    city: profile?.city || "",
    email: profile?.email || "",
  });

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
        const { error } = await supabase.from("business_profile").update({
            name: formData.name,
            city: formData.city
        }).eq("id", profile.id);

        if (error) throw error;
        
        // Mise à jour locale immédiate
        setProfile({ ...profile, ...formData });
        alert("✅ Profil mis à jour !");
    } catch (error) {
        alert("Erreur : " + error.message);
    } finally {
        setLoading(false);
    }
  };

  // Fonction spécifique pour l'upload du LOGO
  const handleLogoUpload = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      try {
          setLoading(true);
          const fileName = `logos/${profile.id}_${Date.now()}`;
          const { error: uploadError } = await supabase.storage.from("user_uploads").upload(fileName, file);
          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage.from("user_uploads").getPublicUrl(fileName);

          // Sauvegarde de l'URL dans le profil
          await supabase.from("business_profile").update({ logo_url: publicUrl }).eq("id", profile.id);
          
          setProfile({ ...profile, logo_url: publicUrl });
          alert("✅ Logo ajouté avec succès !");
      } catch (error) {
          console.error(error);
          alert("Erreur lors de l'upload du logo.");
      } finally {
          setLoading(false);
      }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
      
      {/* HEADER */}
      <div className="flex items-center gap-4 bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
         <div className="w-16 h-16 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-black text-2xl border-4 border-white shadow-lg">
             {profile?.logo_url ? <img src={profile.logo_url} className="w-full h-full object-cover rounded-full"/> : profile?.name?.[0]}
         </div>
         <div>
             <h2 className="text-2xl font-black text-slate-900">Mon Profil</h2>
             <p className="text-slate-500">Gérez les informations de votre entreprise.</p>
         </div>
         <div className="ml-auto px-4 py-2 bg-indigo-50 text-indigo-700 rounded-full font-bold text-xs uppercase tracking-wide">
             {profile?.subscription_tier}
         </div>
      </div>

      {/* FORMULAIRE */}
      <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
          <form onSubmit={handleUpdate} className="space-y-6">
              
              {/* SECTION LOGO */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                      <div className="p-3 bg-white rounded-xl shadow-sm text-indigo-600"><ImageIcon size={20}/></div>
                      <div>
                          <div className="font-bold text-slate-900 text-sm">Logo de l'entreprise</div>
                          <div className="text-xs text-slate-400">Affiché dans le menu latéral</div>
                      </div>
                  </div>
                  <div className="relative">
                      <input type="file" onChange={handleLogoUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept="image/*"/>
                      <button type="button" className="bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-xl text-xs font-bold hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition shadow-sm flex items-center gap-2">
                          <Upload size={14}/> {profile?.logo_url ? "Changer" : "Importer"}
                      </button>
                  </div>
              </div>

              <div className="space-y-4">
                  <div>
                      <label className="text-xs font-bold text-slate-400 uppercase ml-1 block mb-2">Nom de l'entreprise</label>
                      <div className="relative">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
                          <input 
                            value={formData.name} 
                            onChange={e => setFormData({...formData, name: e.target.value})}
                            className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-xl font-bold text-slate-900 outline-none focus:ring-2 ring-indigo-500 transition"
                          />
                      </div>
                  </div>

                  <div>
                      <label className="text-xs font-bold text-slate-400 uppercase ml-1 block mb-2">Ville (pour l'IA)</label>
                      <div className="relative">
                          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
                          <input 
                            value={formData.city} 
                            onChange={e => setFormData({...formData, city: e.target.value})}
                            className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-xl font-bold text-slate-900 outline-none focus:ring-2 ring-indigo-500 transition"
                          />
                      </div>
                  </div>

                  <div className="opacity-50 pointer-events-none">
                      <label className="text-xs font-bold text-slate-400 uppercase ml-1 block mb-2">Email (Non modifiable)</label>
                      <input disabled value={formData.email} className="w-full px-4 py-4 bg-slate-100 border border-slate-100 rounded-xl font-bold text-slate-500"/>
                  </div>
              </div>

              <button type="submit" disabled={loading} className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-slate-800 transition flex items-center justify-center gap-2 shadow-lg">
                  {loading ? "Enregistrement..." : <><Save size={18}/> Enregistrer les modifications</>}
              </button>
          </form>
      </div>
    </div>
  );
}
