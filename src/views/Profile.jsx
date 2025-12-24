import React, { useState } from "react";
import { supabase } from "../lib/supabase";
import { PLANS, getPlanBadge } from "../lib/plans";
import { 
  User, MapPin, Save, Upload, FileImage, 
  Phone, Globe, Building, Lock, Key, Clock, 
  CreditCard, CheckCircle, AlertTriangle, Trash2,
  Sparkles, Zap, Crown
} from "lucide-react";

export default function Profile({ profile, setProfile }) {
  const [loading, setLoading] = useState(false);
  const [passLoading, setPassLoading] = useState(false);
  const [subLoading, setSubLoading] = useState(false);
  
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

  const defaultHours = [
      { day: "Lundi", open: "09:00", close: "18:00", closed: false },
      { day: "Mardi", open: "09:00", close: "18:00", closed: false },
      { day: "Mercredi", open: "09:00", close: "18:00", closed: false },
      { day: "Jeudi", open: "09:00", close: "18:00", closed: false },
      { day: "Vendredi", open: "09:00", close: "18:00", closed: false },
      { day: "Samedi", open: "10:00", close: "17:00", closed: false },
      { day: "Dimanche", open: "", close: "", closed: true },
  ];
  
  const initialHours = Array.isArray(profile?.landing_config?.hours) 
    ? profile.landing_config.hours 
    : defaultHours;

  const [hours, setHours] = useState(initialHours);
  const [passData, setPassData] = useState({ newPassword: "", confirmPassword: "" });

  const creationDate = new Date(profile?.created_at || Date.now());
  const diffTime = Math.abs(Date.now() - creationDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
  const trialDaysLeft = 7 - diffDays;
  const isTrial = diffDays <= 7 && profile?.plan === 'basic';

  const currentPlan = profile?.plan || 'basic';
  const planBadge = getPlanBadge(currentPlan);

  // --- SUPPRESSION DE COMPTE (RGPD) ---
  const handleDeleteAccount = async () => {
      const confirm1 = window.confirm("⚠️ ATTENTION : Vous êtes sur le point de supprimer votre compte définitivement.\n\nToutes vos données seront effacées.\n\nVoulez-vous continuer ?");
      if (!confirm1) return;

      const confirm2 = window.prompt("Pour confirmer, tapez le mot 'SUPPRIMER' ci-dessous :");
      if (confirm2 !== "SUPPRIMER") return alert("Annulé : Le mot de confirmation est incorrect.");

      try {
          const { error } = await supabase.rpc('delete_own_account');
          if (error) throw error;

          await supabase.auth.signOut();
          alert("Compte supprimé avec succès. Au revoir.");
          window.location.reload();
      } catch (error) {
          alert("Erreur lors de la suppression : " + error.message);
      }
  };

  // ✅ UPGRADE VERS UN FORFAIT SPÉCIFIQUE
  const handleUpgrade = async (targetPlan) => {
      const planData = PLANS[targetPlan];
      if(!window.confirm(`Passer au forfait ${planData.name} (${planData.price}€/mois) ?`)) return;
      
      setSubLoading(true);
      try {
          const { error } = await supabase
            .from("business_profile")
            .update({ 
              plan: targetPlan,
              subscription_price: planData.price,
              subscription_status: 'active'
            })
            .eq("id", profile.id);
          
          if (error) throw error;
          setProfile({ ...profile, plan: targetPlan, subscription_price: planData.price });
          alert(`🎉 Félicitations ! Vous êtes maintenant ${planData.name}.`);
      } catch (error) { 
        alert("Erreur : " + error.message); 
      } finally { 
        setSubLoading(false); 
      }
  };

  // ✅ DOWNGRADE / ANNULATION
  const handleDowngrade = async () => {
      if(!window.confirm("Êtes-vous sûr de vouloir repasser en Basic (29€/mois) ?")) return;
      setSubLoading(true);
      try {
          const { error } = await supabase
            .from("business_profile")
            .update({ 
              plan: 'basic',
              subscription_price: 29,
              subscription_status: 'active'
            })
            .eq("id", profile.id);
          
          if (error) throw error;
          setProfile({ ...profile, plan: 'basic', subscription_price: 29 });
          alert("Vous êtes repassé en forfait Basic.");
      } catch (error) { 
        alert("Erreur : " + error.message); 
      } finally { 
        setSubLoading(false); 
      }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
        const updatedConfig = { ...profile?.landing_config, hours: hours };
        const { error } = await supabase.from("business_profile").update({
            name: formData.name, 
            phone: formData.phone, 
            address: formData.address,
            city: formData.city, 
            zip_code: formData.zip_code, 
            website: formData.website,
            siret: formData.siret, 
            landing_config: updatedConfig 
        }).eq("id", profile.id);

        if (error) throw error;
        setProfile({ ...profile, ...formData, landing_config: updatedConfig });
        alert("✅ Informations mises à jour !");
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

  const handleChangePassword = async (e) => {
      e.preventDefault();
      if (passData.newPassword.length < 6) return alert("Le mot de passe doit faire 6 caractères min.");
      if (passData.newPassword !== passData.confirmPassword) return alert("Les mots de passe ne correspondent pas.");
      setPassLoading(true);
      try {
          const { error } = await supabase.auth.updateUser({ password: passData.newPassword });
          if (error) throw error;
          alert("🔒 Mot de passe modifié !");
          setPassData({ newPassword: "", confirmPassword: "" });
      } catch (error) { 
        alert("Erreur : " + error.message); 
      } finally { 
        setPassLoading(false); 
      }
  };

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
        alert("Erreur upload."); 
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
         <div className="ml-auto hidden md:block">
           <div className={`px-4 py-2 rounded-full font-bold text-sm flex items-center gap-2 bg-gradient-to-r ${
             planBadge.color === 'blue' ? 'from-blue-500 to-blue-600' :
             planBadge.color === 'purple' ? 'from-purple-500 to-purple-600' :
             'from-indigo-500 to-purple-600'
           } text-white shadow-lg`}>
             <span>{planBadge.icon}</span>
             <span>{planBadge.label}</span>
           </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* GAUCHE : INFOS */}
          <div className="lg:col-span-2 space-y-8">
              <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
                  <h3 className="font-black text-lg mb-6 flex items-center gap-2"><Building size={20} className="text-indigo-600"/> Informations Générales</h3>
                  
                  <form onSubmit={handleUpdate} className="space-y-6">
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                              <div className="p-2 bg-white rounded-lg shadow-sm text-indigo-600"><FileImage size={18}/></div>
                              <div><div className="font-bold text-slate-900 text-xs uppercase">Logo</div><div className="text-[10px] text-slate-400">JPG, PNG (Max 2Mo)</div></div>
                          </div>
                          <div className="relative">
                              <input type="file" onChange={handleLogoUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept="image/*"/>
                              <button type="button" className="bg-white border border-slate-200 text-slate-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:text-indigo-600 hover:border-indigo-200 transition shadow-sm flex items-center gap-2"><Upload size={12}/> {profile?.logo_url ? "Modifier" : "Ajouter"}</button>
                          </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="md:col-span-2"><label className="text-[10px] font-bold text-slate-400 uppercase ml-1 mb-1 block">Nom de l'entreprise</label><input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full pl-4 p-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm outline-none focus:ring-2 ring-indigo-500"/></div>
                          <div><label className="text-[10px] font-bold text-slate-400 uppercase ml-1 mb-1 block">SIRET</label><input value={formData.siret} onChange={e => setFormData({...formData, siret: e.target.value})} placeholder="14 chiffres" className="w-full pl-4 p-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm outline-none focus:ring-2 ring-indigo-500"/></div>
                          <div><label className="text-[10px] font-bold text-slate-400 uppercase ml-1 mb-1 block">Site Web</label><input value={formData.website} onChange={e => setFormData({...formData, website: e.target.value})} placeholder="www.monsite.fr" className="w-full pl-4 p-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm outline-none focus:ring-2 ring-indigo-500"/></div>
                      </div>

                      <hr className="border-slate-100"/>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="md:col-span-2"><label className="text-[10px] font-bold text-slate-400 uppercase ml-1 mb-1 block">Adresse postale</label><input value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} placeholder="10 rue de la République" className="w-full pl-4 p-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm outline-none focus:ring-2 ring-indigo-500"/></div>
                          <div><label className="text-[10px] font-bold text-slate-400 uppercase ml-1 mb-1 block">Code Postal</label><input value={formData.zip_code} onChange={e => setFormData({...formData, zip_code: e.target.value})} placeholder="75001" className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm outline-none focus:ring-2 ring-indigo-500"/></div>
                          <div><label className="text-[10px] font-bold text-slate-400 uppercase ml-1 mb-1 block">Ville</label><input value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} placeholder="Paris" className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm outline-none focus:ring-2 ring-indigo-500"/></div>
                          <div className="md:col-span-2"><label className="text-[10px] font-bold text-slate-400 uppercase ml-1 mb-1 block">Téléphone public</label><input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="01 23 45 67 89" className="w-full pl-4 p-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm outline-none focus:ring-2 ring-indigo-500"/></div>
                      </div>

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
                                          ) : <span className="text-slate-400 text-xs italic bg-white px-3 py-2 rounded-lg w-full text-center border border-slate-100">Fermé toute la journée</span>}
                                      </div>
                                      <button type="button" onClick={() => updateHour(index, 'closed', !h.closed)} className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition w-full sm:w-auto ${h.closed ? "bg-rose-100 text-rose-600 hover:bg-rose-200" : "bg-green-100 text-green-600 hover:bg-green-200"}`}>{h.closed ? "Fermé" : "Ouvert"}</button>
                                  </div>
                              ))}
                          </div>
                      </div>

                      <button type="submit" disabled={loading} className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-slate-800 transition flex items-center justify-center gap-2 shadow-lg">{loading ? "Enregistrement..." : <><Save size={18}/> Enregistrer les modifications</>}</button>
                  </form>
              </div>
          </div>

          {/* DROITE : ABONNEMENT & SÉCURITÉ */}
          <div className="space-y-6">
              
              {/* ABONNEMENT */}
              <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 p-6 rounded-[2rem] shadow-xl text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl"></div>
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-500/20 rounded-full blur-2xl"></div>
                  
                  <h3 className="font-black text-lg mb-4 flex items-center gap-2 relative z-10">
                    <CreditCard size={20} className="text-indigo-400"/> Mon Abonnement
                  </h3>
                  
                  <div className="mb-6 relative z-10">
                      <div className="text-sm text-slate-400 mb-1">Forfait actuel</div>
                      <div className="text-3xl font-black flex items-center gap-3 mb-2">
                          <span>{planBadge.icon}</span>
                          <span>{planBadge.label}</span>
                          {currentPlan !== 'basic' && <CheckCircle size={24} className="text-green-400"/>}
                      </div>
                      
                      {/* Prix de l'abonnement */}
                      {profile?.subscription_price > 0 && (
                        <div className="text-2xl font-bold text-indigo-300 mb-3">
                          {profile.subscription_price}€<span className="text-sm text-slate-400">/mois</span>
                        </div>
                      )}
                      
                      {/* Badge essai gratuit */}
                      {isTrial && (
                        <div className="text-xs font-bold bg-white/10 px-3 py-1.5 rounded-lg inline-flex items-center gap-2">
                          <Clock size={12}/> Essai gratuit : J-{trialDaysLeft}
                        </div>
                      )}
                  </div>
                  
                  {/* Boutons d'upgrade */}
                  <div className="relative z-10 space-y-3">
                    {/* Si Basic → Proposer Pro + Premium */}
                    {currentPlan === 'basic' && (
                      <>
                        <button 
                          onClick={() => handleUpgrade('premium')} 
                          disabled={subLoading}
                          className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white py-3 rounded-xl font-bold transition shadow-lg flex items-center justify-center gap-2"
                        >
                          <Crown size={18} />
                          💎 Passer Premium - 99€/mois
                        </button>
                        <button 
                          onClick={() => handleUpgrade('pro')} 
                          disabled={subLoading}
                          className="w-full bg-purple-600 hover:bg-purple-500 text-white py-3 rounded-xl font-bold transition shadow-lg flex items-center justify-center gap-2"
                        >
                          <Zap size={18} />
                          ⚡ Passer Pro - 59€/mois
                        </button>
                      </>
                    )}
                    
                    {/* Si Pro → Proposer Premium */}
                    {currentPlan === 'pro' && (
                      <>
                        <button 
                          onClick={() => handleUpgrade('premium')} 
                          disabled={subLoading}
                          className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white py-3 rounded-xl font-bold transition shadow-lg flex items-center justify-center gap-2"
                        >
                          <Crown size={18} />
                          💎 Passer Premium - 99€/mois
                        </button>
                        <button 
                          onClick={handleDowngrade} 
                          disabled={subLoading}
                          className="w-full bg-white/10 hover:bg-white/20 text-white py-3 rounded-xl font-bold text-xs transition"
                        >
                          Résilier / Passer en Basic
                        </button>
                      </>
                    )}
                    
                    {/* Si Premium → Proposer downgrade */}
                    {currentPlan === 'premium' && (
                      <button 
                        onClick={handleDowngrade} 
                        disabled={subLoading}
                        className="w-full bg-white/10 hover:bg-white/20 text-white py-3 rounded-xl font-bold text-xs transition"
                      >
                        Résilier / Passer en Basic
                      </button>
                    )}
                  </div>
                  
                  {/* Détails des fonctionnalités */}
                  <div className="mt-6 pt-6 border-t border-white/10 relative z-10">
                    <div className="text-xs text-slate-300 space-y-2">
                      <div className="font-bold mb-3">Votre forfait inclut :</div>
                      {PLANS[currentPlan].features.map((feature, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <CheckCircle size={14} className="text-green-400 mt-0.5 flex-shrink-0" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
              </div>

              {/* EMAIL */}
              <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm opacity-70">
                  <h3 className="font-bold text-sm mb-4 flex items-center gap-2 text-slate-500"><Lock size={16}/> Identifiant de connexion</h3>
                  <input disabled value={formData.email} className="w-full p-3 bg-slate-100 border border-slate-100 rounded-xl font-bold text-sm text-slate-500 cursor-not-allowed"/>
                  <p className="text-[10px] text-slate-400 mt-2">Contactez le support pour changer d'email.</p>
              </div>

              {/* PASSWORD */}
              <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                  <h3 className="font-black text-lg mb-4 flex items-center gap-2 text-slate-900"><Key size={20} className="text-amber-500"/> Sécurité</h3>
                  <form onSubmit={handleChangePassword} className="space-y-4">
                      <div><label className="text-[10px] font-bold text-slate-400 uppercase ml-1 mb-1 block">Nouveau mot de passe</label><input type="password" required value={passData.newPassword} onChange={e => setPassData({...passData, newPassword: e.target.value})} placeholder="••••••••" className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm outline-none focus:ring-2 ring-amber-500"/></div>
                      <div><label className="text-[10px] font-bold text-slate-400 uppercase ml-1 mb-1 block">Confirmer</label><input type="password" required value={passData.confirmPassword} onChange={e => setPassData({...passData, confirmPassword: e.target.value})} placeholder="••••••••" className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm outline-none focus:ring-2 ring-amber-500"/></div>
                      <button type="submit" disabled={passLoading} className="w-full bg-amber-500 text-white py-3 rounded-xl font-bold hover:bg-amber-600 transition shadow-lg shadow-amber-200">{passLoading ? "Modification..." : "Changer le mot de passe"}</button>
                  </form>
              </div>

              {/* ZONE DANGER (RGPD) */}
              <div className="bg-rose-50 p-6 rounded-[2rem] border border-rose-100 shadow-sm">
                  <h3 className="font-black text-lg mb-4 flex items-center gap-2 text-rose-600"><Trash2 size={20}/> Zone de Danger</h3>
                  <p className="text-xs text-rose-400 mb-4">La suppression de votre compte est irréversible. Toutes vos données (clients, avis, page web) seront perdues.</p>
                  <button onClick={handleDeleteAccount} className="w-full bg-white border border-rose-200 text-rose-600 py-3 rounded-xl font-bold hover:bg-rose-600 hover:text-white transition shadow-sm">Supprimer mon compte</button>
              </div>

          </div>
      </div>
    </div>
  );
}
