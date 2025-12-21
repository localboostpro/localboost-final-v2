import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { 
  User, MapPin, Save, Upload, Image as ImageIcon, 
  Phone, Globe, Building, Lock, Key, Clock
} from "lucide-react";

export default function Profile({ profile, setProfile }) {
  const [loading, setLoading] = useState(false);
  const [passLoading, setPassLoading] = useState(false);
  
  // Données du Profil
  const [formData, setFormData] = useState({
    name: profile?.name || "",
    email: profile?.email || "",
    phone: profile?.phone || "",
    address: profile?.address || "",
    city: profile?.city || "",
    zip_code: profile?.zip_code || "",
    website: profile?.website || "",
    siret: profile?.siret || "",
  });

  // Gestion des Horaires (Format JSON)
  // Si pas d'horaires, on met des valeurs par défaut
  const defaultHours = [
      { day: "Lundi", open: "09:00", close: "18:00", closed: false },
      { day: "Mardi", open: "09:00", close: "18:00", closed: false },
      { day: "Mercredi", open: "09:00", close: "18:00", closed: false },
      { day: "Jeudi", open: "09:00", close: "18:00", closed: false },
      { day: "Vendredi", open: "09:00", close: "18:00", closed: false },
      { day: "Samedi", open: "10:00", close: "17:00", closed: false },
      { day: "Dimanche", open: "", close: "", closed: true },
  ];
  
  // On suppose que les horaires sont stockés dans 'landing_config' pour l'instant (ou une colonne dédiée 'opening_hours')
  // Pour faire simple et compatible avec ce qu'on a fait avant, on va les stocker dans landing_config.hours
  const [hours, setHours] = useState(profile?.landing_config?.hours || defaultHours);

  // Données du Mot de Passe
  const [passData, setPassData] = useState({ newPassword: "", confirmPassword: "" });

  // --- MISE À JOUR DU PROFIL ---
  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
        // On met à jour les infos classiques ET les horaires (dans landing_config)
        const updatedConfig = { ...profile?.landing_config, hours: hours };

        const { error } = await supabase.from("business_profile").update({
            name: formData.name,
            phone: formData.phone,
            address: formData.address,
            city: formData.city,
            zip_code: formData.zip_code,
            website: formData.website,
            siret: formData.siret,
            landing_config: updatedConfig // Sauvegarde des horaires ici
        }).eq("id", profile.id);

        if (error) throw error;
        
        setProfile({ ...profile, ...formData, landing_config: updatedConfig });
        alert("✅ Informations et horaires mis à jour !");
    } catch (error) {
        alert("Erreur : " + error.message);
    } finally {
        setLoading(false);
    }
  };

  const updateHour = (index, field, value) => {
      const newHours = [...hours];
      newHours[index][field] = value;
      setHours(newHours);
  };

  // --- CHANGEMENT DE MOT DE PASSE ---
  const handleChangePassword = async (e) => {
      e.preventDefault();
      if (passData.newPassword.length < 6) return alert("Le mot de passe doit faire 6 caractères min.");
      if (passData.newPassword !== passData.confirmPassword) return alert("Les mots de passe ne correspondent pas.");

      setPassLoading(true);
      try {
          const { error } = await supabase.auth.updateUser({ password: passData.newPassword });
          if (error) throw error;
          alert("🔒 Mot de passe modifié avec succès !");
          setPassData({ newPassword: "", confirmPassword: "" });
      } catch (error) {
          alert("Erreur : " + error.message);
      } finally {
          setPassLoading(false);
      }
  };

  // --- UPLOAD LOGO ---
  const handleLogoUpload = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      try {
          setLoading(true);
          const fileName = `logos/${profile.id}_${Date.now()}`;
          const { error: uploadError } = await supabase.storage.from("user_uploads").upload(fileName, file);
          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage.from("user_uploads").getPublicUrl(fileName);
          await supabase.from("business_profile").update({ logo_url: publicUrl }).eq("id", profile.id);
          
          setProfile({ ...profile, logo_url: publicUrl });
          alert("✅ Logo ajouté !");
      } catch (error) {
          console.error(error);
          alert("Erreur lors de l'upload.");
      } finally {
          setLoading(false);
      }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      
      {/* HEADER */}
      <div className="flex items-center gap-4 bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
         <div className="w-20 h-20 rounded-2xl bg-slate-50 text-indigo-600 flex items-center justify-center font-black text-3xl border border-slate-200 shadow-inner overflow-hidden">
             {profile?.logo_url ? <img src={profile.logo_url} className="w-full h-full object-cover"/> : profile?.name?.[0]}
         </div>
         <div>
             <h2 className="text-2xl font-black text-slate-900">Mon Établissement</h2>
             <p className="text-slate-500 text-sm">Gérez votre identité commerciale et vos accès.</p>
         </div>
         <div className="ml-auto px-4 py-2 bg-indigo-50 text-indigo-700 rounded-full font-bold text-xs uppercase tracking-wide border border-indigo-100 hidden md:block">
             Compte {profile?.subscription_tier}
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* COLONNE GAUCHE : INFOS GÉNÉRALES + HORAIRES */}
          <div className="lg:col-span-2 space-y-8">
              <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
                  <h3 className="font-black text-lg mb-6 flex items-center gap-2"><Building size={20} className="text-indigo-600"/> Informations Générales</h3>
                  
                  <form onSubmit={handleUpdate} className="space-y-6">
                      
                      {/* LOGO UPLOAD */}
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                              <div className="p-2 bg-white rounded-lg shadow-sm text-indigo-600"><ImageIcon size={18}/></div>
                              <div>
                                  <div className="font-bold text-slate-900 text-xs uppercase">Logo</div>
                                  <div className="text-[10px] text-slate-400">JPG, PNG (Max 2Mo)</div>
                              </div>
                          </div>
                          <div className="relative">
                              <input type="file" onChange={handleLogoUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept="image/*"/>
                              <button type="button" className="bg-white border border-slate-200 text-slate-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:text-indigo-600 hover:border-indigo-200 transition shadow-sm flex items-center gap-2">
                                  <Upload size={12}/> {profile?.logo_url ? "Modifier" : "Ajouter"}
                              </button>
                          </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="md:col-span-2">
                              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 mb-1 block">Nom de l'entreprise</label>
                              <div className="relative">
                                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16}/>
                                  <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full pl-10 p-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm outline-none focus:ring-2 ring-indigo-500"/>
                              </div>
                          </div>
                          
                          <div>
                              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 mb-1 block">SIRET</label>
                              <div className="relative">
                                  <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16}/>
                                  <input value={formData.siret} onChange={e => setFormData({...formData, siret: e.target.value})} placeholder="14 chiffres" className="w-full pl-10 p-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm outline-none focus:ring-2 ring-indigo-500"/>
                              </div>
                          </div>

                          <div>
                              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 mb-1 block">Site Web</label>
                              <div className="relative">
                                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16}/>
                                  <input value={formData.website} onChange={e => setFormData({...formData, website: e.target.value})} placeholder="www.monsite.fr" className="w-full pl-10 p-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm outline-none focus:ring-2 ring-indigo-500"/>
                              </div>
                          </div>
                      </div>

                      <hr className="border-slate-100"/>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="md:col-span-2">
                              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 mb-1 block">Adresse postale</label>
                              <div className="relative">
                                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16}/>
                                  <input value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} placeholder="10 rue de la République" className="w-full pl-10 p-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm outline-none focus:ring-2 ring-indigo-500"/>
                              </div>
                          </div>

                          <div>
                              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 mb-1 block">Code Postal</label>
                              <input value={formData.zip_code} onChange={e => setFormData({...formData, zip_code: e.target.value})} placeholder="75001" className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm outline-none focus:ring-2 ring-indigo-500"/>
                          </div>

                          <div>
                              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 mb-1 block">Ville</label>
                              <input value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} placeholder="Paris" className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm outline-none focus:ring-2 ring-indigo-500"/>
                          </div>
                          
                          <div className="md:col-span-2">
                              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 mb-1 block">Téléphone public</label>
                              <div className="relative">
                                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16}/>
                                  <input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="01 23 45 67 89" className="w-full pl-10 p-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm outline-none focus:ring-2 ring-indigo-500"/>
                              </div>
                          </div>
                      </div>

                      {/* --- SECTION HORAIRES (AJOUTÉE) --- */}
                      <hr className="border-slate-100"/>
                      
                      <div>
                          <h4 className="font-bold text-sm text-slate-900 mb-4 flex items-center gap-2"><Clock size={16}/> Horaires d'ouverture</h4>
                          <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                              {hours.map((h, index) => (
                                  <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 text-sm">
                                      <div className="w-24 font-bold text-slate-700">{h.day}</div>
                                      <div className="flex-1 flex gap-2 items-center w-full sm:w-auto">
                                          {!h.closed ? (
                                              <>
                                                <input type="time" value={h.open} onChange={e => updateHour(index, 'open', e.target.value)} className="bg-white border rounded-lg p-2 text-xs font-bold w-full sm:w-auto"/>
                                                <span className="text-slate-400">-</span>
                                                <input type="time" value={h.close} onChange={e => updateHour(index, 'close', e.target.value)} className="bg-white border rounded-lg p-2 text-xs font-bold w-full sm:w-auto"/>
                                              </>
                                          ) : (
                                              <span className="text-slate-400 text-xs italic bg-white px-3 py-2 rounded-lg w-full text-center border border-slate-100">Fermé toute la journée</span>
                                          )}
                                      </div>
                                      <button 
                                        type="button"
                                        onClick={() => updateHour(index, 'closed', !h.closed)}
                                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition w-full sm:w-auto ${h.closed ? "bg-rose-100 text-rose-600 hover:bg-rose-200" : "bg-green-100 text-green-600 hover:bg-green-200"}`}
                                      >
                                         {h.closed ? "Fermé" : "Ouvert"}
                                      </button>
                                  </div>
                              ))}
                          </div>
                      </div>

                      <button type="submit" disabled={loading} className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-slate-800 transition flex items-center justify-center gap-2 shadow-lg">
                          {loading ? "Enregistrement..." : <><Save size={18}/> Enregistrer les modifications</>}
                      </button>
                  </form>
              </div>
          </div>

          {/* COLONNE DROITE : SÉCURITÉ */}
          <div className="space-y-6">
              <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm opacity-70">
                  <h3 className="font-bold text-sm mb-4 flex items-center gap-2 text-slate-500"><Lock size={16}/> Identifiant de connexion</h3>
                  <input disabled value={formData.email} className="w-full p-3 bg-slate-100 border border-slate-100 rounded-xl font-bold text-sm text-slate-500 cursor-not-allowed"/>
                  <p className="text-[10px] text-slate-400 mt-2">Contactez le support pour changer d'email.</p>
              </div>

              <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                  <h3 className="font-black text-lg mb-4 flex items-center gap-2 text-slate-900"><Key size={20} className="text-amber-500"/> Sécurité</h3>
                  <form onSubmit={handleChangePassword} className="space-y-4">
                      <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 mb-1 block">Nouveau mot de passe</label>
                          <input type="password" required value={passData.newPassword} onChange={e => setPassData({...passData, newPassword: e.target.value})} placeholder="••••••••" className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm outline-none focus:ring-2 ring-amber-500"/>
                      </div>
                      <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 mb-1 block">Confirmer</label>
                          <input type="password" required value={passData.confirmPassword} onChange={e => setPassData({...passData, confirmPassword: e.target.value})} placeholder="••••••••" className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm outline-none focus:ring-2 ring-amber-500"/>
                      </div>
                      <button type="submit" disabled={passLoading} className="w-full bg-amber-500 text-white py-3 rounded-xl font-bold hover:bg-amber-600 transition shadow-lg shadow-amber-200">
                          {passLoading ? "Modification..." : "Changer le mot de passe"}
                      </button>
                  </form>
              </div>
          </div>
      </div>
    </div>
  );
}
