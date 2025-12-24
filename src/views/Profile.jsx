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
  
  let initialHours = defaultHours;
  try {
    if (profile?.opening_hours) {
      const parsed = typeof profile.opening_hours === 'string' 
        ? JSON.parse(profile.opening_hours) 
        : profile.opening_hours;
      if (Array.isArray(parsed)) initialHours = parsed;
    }
  } catch (e) {
    console.warn("Erreur parsing opening_hours:", e);
  }

  const [hours, setHours] = useState(initialHours);
  const [passData, setPassData] = useState({ newPassword: "", confirmPassword: "" });

  const creationDate = new Date(profile?.created_at || Date.now());
  const diffTime = Math.abs(Date.now() - creationDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
  const trialDaysLeft = 7 - diffDays;
  const isTrial = diffDays <= 7 && profile?.plan === 'basic';

  const currentPlan = profile?.plan || 'basic';
  const planBadge = getPlanBadge(currentPlan);

  // ✅ MISE À JOUR DES INFORMATIONS - VERSION CORRIGÉE
  const handleUpdate = async (e) => {
      e.preventDefault();
      setLoading(true);
      
      try {
          // ✅ ON N'ENVOIE QUE LES COLONNES QUI EXISTENT
          const updateData = {
              name: formData.name, 
              phone: formData.phone, 
              address: formData.address,
              city: formData.city, 
              zip_code: formData.zip_code, 
              website: formData.website,
              siret: formData.siret,
              opening_hours: JSON.stringify(hours),
              phone_center_details: profile?.phone_center_details || {}
          };

          const { data, error } = await supabase
              .from("business_profile")
              .update(updateData)
              .eq("id", profile.id)
              .select();

          if (error) throw error;

          setProfile({ ...profile, ...formData, opening_hours: JSON.stringify(hours) });
          alert("✅ Informations mises à jour avec succès !");
          
      } catch (error) { 
          console.error("❌ Erreur:", error);
          alert("Erreur : " + error.message); 
      } finally { 
          setLoading(false); 
      }
  };

  // ✅ CHANGEMENT DE MOT DE PASSE
  const handleChangePassword = async (e) => {
      e.preventDefault();
      if (passData.newPassword !== passData.confirmPassword) {
          alert("❌ Les mots de passe ne correspondent pas !");
          return;
      }
      setPassLoading(true);
      try {
          const { error } = await supabase.auth.updateUser({ password: passData.newPassword });
          if (error) throw error;
          alert("✅ Mot de passe modifié !");
          setPassData({ newPassword: "", confirmPassword: "" });
      } catch (error) {
          console.error("❌ Erreur:", error);
          alert("Erreur : " + error.message);
      } finally {
          setPassLoading(false);
      }
  };

  // ✅ SUPPRESSION DE COMPTE (RGPD)
  const handleDeleteAccount = async () => {
      const confirm1 = window.confirm("⚠️ ATTENTION : Vous êtes sur le point de supprimer votre compte définitivement.\n\nToutes vos données seront effacées.\n\nVoulez-vous continuer ?");
      if (!confirm1) return;

      const confirm2 = window.prompt("Pour confirmer, tapez le mot 'SUPPRIMER' ci-dessous :");
      if (confirm2 !== "SUPPRIMER") {
          alert("❌ Suppression annulée.");
          return;
      }

      try {
          const { error: deleteError } = await supabase.from("business_profile").delete().eq("id", profile.id);
          if (deleteError) throw deleteError;

          const { error: authError } = await supabase.auth.signOut();
          if (authError) throw authError;

          alert("✅ Votre compte a été supprimé. Au revoir.");
          window.location.href = "/";
      } catch (error) {
          console.error("❌ Erreur suppression:", error);
          alert("Erreur : " + error.message);
      }
  };

  // ✅ CHANGEMENT DE FORFAIT
  const handleChangePlan = async (newPlan) => {
      if (newPlan === currentPlan) {
          alert("✅ Vous êtes déjà sur ce forfait !");
          return;
      }

      const confirmChange = window.confirm(`Changer vers le forfait ${newPlan.toUpperCase()} ?`);
      if (!confirmChange) return;

      setSubLoading(true);
      try {
          const { error } = await supabase
              .from("business_profile")
              .update({ plan: newPlan })
              .eq("id", profile.id);

          if (error) throw error;

          setProfile({ ...profile, plan: newPlan });
          alert(`✅ Forfait changé vers ${newPlan.toUpperCase()} !`);
      } catch (error) {
          console.error("❌ Erreur changement forfait:", error);
          alert("Erreur : " + error.message);
      } finally {
          setSubLoading(false);
      }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
          
          {/* HEADER */}
          <div className="mb-8">
              <h1 className="text-4xl font-black text-slate-900 mb-2">Mon Établissement</h1>
              <p className="text-slate-500">Gérez les informations de votre profil professionnel</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">

              {/* COLONNE GAUCHE : ABONNEMENT */}
              <div className="space-y-6">

                  {/* CARTE ABONNEMENT */}
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-[2rem] shadow-xl text-white">
                      <div className="flex items-center justify-between mb-4">
                          <h3 className="font-black text-lg flex items-center gap-2">
                              <CreditCard size={20}/> Mon Abonnement
                          </h3>
                          {planBadge.icon}
                      </div>

                      <div className="mb-4">
                          <div className="text-3xl font-black mb-1">{planBadge.price}</div>
                          <div className="text-blue-100 text-sm">{planBadge.label}</div>
                      </div>

                      {isTrial && (
                          <div className="bg-white/20 backdrop-blur-sm p-4 rounded-xl mb-4">
                              <div className="flex items-center gap-2 text-sm font-bold mb-1">
                                  <Clock size={16}/> Période d'essai
                              </div>
                              <div className="text-2xl font-black">{trialDaysLeft} jours restants</div>
                          </div>
                      )}

                      {/* BOUTONS UPGRADE */}
                      {currentPlan === 'basic' && (
                          <button 
                              onClick={() => handleChangePlan('premium')}
                              disabled={subLoading}
                              className="w-full bg-white text-blue-600 py-3 rounded-xl font-bold hover:bg-blue-50 transition shadow-lg mt-4"
                          >
                              {subLoading ? "Chargement..." : "👑 Passer en Premium (99€/mois)"}
                          </button>
                      )}

                      {currentPlan === 'premium' && (
                          <button 
                              onClick={() => handleChangePlan('basic')}
                              disabled={subLoading}
                              className="w-full bg-white/20 text-white py-3 rounded-xl font-bold hover:bg-white/30 transition mt-4"
                          >
                              {subLoading ? "Chargement..." : "Résilier / Passer en Basic"}
                          </button>
                      )}
                  </div>

                  {/* AVANTAGES DU PLAN */}
                  <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                      <h3 className="font-black text-lg mb-4 text-slate-900">✨ Vos avantages</h3>
                      <ul className="space-y-3 text-sm">
                          {Array.isArray(planBadge?.features) && planBadge.features.map((feature, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                  <CheckCircle size={16} className="text-green-500 mt-0.5 flex-shrink-0"/>
                                  <span className="text-slate-700">{feature}</span>
                              </li>
                          ))}
                      </ul>
                  </div>


              {/* COLONNE DROITE : FORMULAIRE */}
              <div className="lg:col-span-2 space-y-6">

                  {/* INFORMATIONS GÉNÉRALES */}
                  <form onSubmit={handleUpdate} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
                      <h3 className="font-black text-xl mb-6 flex items-center gap-2 text-slate-900">
                          <Building size={22} className="text-blue-500"/> Informations Générales
                      </h3>

                      <div className="grid md:grid-cols-2 gap-4 mb-6">
                          
                          <div>
                              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 mb-1 block">
                                  Nom de l'établissement
                              </label>
                              <input 
                                  type="text" 
                                  required 
                                  value={formData.name} 
                                  onChange={e => setFormData({...formData, name: e.target.value})} 
                                  placeholder="Mon Entreprise" 
                                  className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm outline-none focus:ring-2 ring-blue-500"
                              />
                          </div>

                          <div>
                              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 mb-1 block">
                                  <Phone size={12} className="inline mr-1"/> Téléphone
                              </label>
                              <input 
                                  type="tel" 
                                  value={formData.phone} 
                                  onChange={e => setFormData({...formData, phone: e.target.value})} 
                                  placeholder="06 12 34 56 78" 
                                  className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm outline-none focus:ring-2 ring-blue-500"
                              />
                          </div>

                          <div className="md:col-span-2">
                              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 mb-1 block">
                                  <MapPin size={12} className="inline mr-1"/> Adresse
                              </label>
                              <input 
                                  type="text" 
                                  value={formData.address} 
                                  onChange={e => setFormData({...formData, address: e.target.value})} 
                                  placeholder="123 Rue de la Paix" 
                                  className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm outline-none focus:ring-2 ring-blue-500"
                              />
                          </div>

                          <div>
                              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 mb-1 block">Ville</label>
                              <input 
                                  type="text" 
                                  value={formData.city} 
                                  onChange={e => setFormData({...formData, city: e.target.value})} 
                                  placeholder="Paris" 
                                  className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm outline-none focus:ring-2 ring-blue-500"
                              />
                          </div>

                          <div>
                              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 mb-1 block">Code Postal</label>
                              <input 
                                  type="text" 
                                  value={formData.zip_code} 
                                  onChange={e => setFormData({...formData, zip_code: e.target.value})} 
                                  placeholder="75001" 
                                  className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm outline-none focus:ring-2 ring-blue-500"
                              />
                          </div>

                          <div>
                              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 mb-1 block">
                                  <Globe size={12} className="inline mr-1"/> Site Web
                              </label>
                              <input 
                                  type="url" 
                                  value={formData.website} 
                                  onChange={e => setFormData({...formData, website: e.target.value})} 
                                  placeholder="https://monsite.fr" 
                                  className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm outline-none focus:ring-2 ring-blue-500"
                              />
                          </div>

                          <div>
                              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 mb-1 block">SIRET</label>
                              <input 
                                  type="text" 
                                  value={formData.siret} 
                                  onChange={e => setFormData({...formData, siret: e.target.value})} 
                                  placeholder="123 456 789 00010" 
                                  className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm outline-none focus:ring-2 ring-blue-500"
                              />
                          </div>

                      </div>

                      <button 
                          type="submit" 
                          disabled={loading} 
                          className="w-full bg-blue-500 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-600 transition shadow-lg shadow-blue-200 flex items-center justify-center gap-2"
                      >
                          <Save size={20}/>
                          {loading ? "Enregistrement..." : "Enregistrer les modifications"}
                      </button>
                  </form>

{/* HORAIRES D'OUVERTURE */}
<div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
    <h3 className="font-black text-xl mb-6 flex items-center gap-2 text-slate-900">
        <Clock size={22} className="text-amber-500"/> Horaires d'Ouverture
    </h3>

    <div className="space-y-3">
        {Array.isArray(hours) && hours.map((daySchedule, index) => (
            <div key={index} className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl">
                <div className="w-28 font-bold text-sm text-slate-700">{daySchedule?.day || "Jour"}</div>
                
                <label className="flex items-center gap-2 text-xs text-slate-500 cursor-pointer">
                    <input 
                        type="checkbox" 
                        checked={daySchedule?.closed || false} 
                        onChange={e => {
                            const newHours = [...hours];
                            newHours[index].closed = e.target.checked;
                            setHours(newHours);
                        }} 
                        className="rounded"
                    />
                    Fermé
                </label>

                {!daySchedule?.closed && (
                    <>
                        <input 
                            type="time" 
                            value={daySchedule?.open || ""} 
                            onChange={e => {
                                const newHours = [...hours];
                                newHours[index].open = e.target.value;
                                setHours(newHours);
                            }} 
                            className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold outline-none focus:ring-2 ring-amber-500"
                        />
                        <span className="text-slate-400 font-bold">→</span>
                        <input 
                            type="time" 
                            value={daySchedule?.close || ""} 
                            onChange={e => {
                                const newHours = [...hours];
                                newHours[index].close = e.target.value;
                                setHours(newHours);
                            }} 
                            className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold outline-none focus:ring-2 ring-amber-500"
                        />
                    </>
                )}
            </div>
        ))}
    </div>
</div>


                  {/* EMAIL (READ-ONLY) */}
                  <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                      <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 mb-2 block">
                          Email (non modifiable)
                      </label>
                      <input 
                          type="email" 
                          value={formData.email} 
                          disabled 
                          className="w-full p-3 bg-slate-100 border border-slate-100 rounded-xl font-bold text-sm text-slate-500 cursor-not-allowed"
                      />
                      <p className="text-[10px] text-slate-400 mt-2">Contactez le support pour changer d'email.</p>
                  </div>

                  {/* CHANGEMENT DE MOT DE PASSE */}
                  <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                      <h3 className="font-black text-lg mb-4 flex items-center gap-2 text-slate-900">
                          <Key size={20} className="text-amber-500"/> Sécurité
                      </h3>
                      <form onSubmit={handleChangePassword} className="space-y-4">
                          <div>
                              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 mb-1 block">
                                  Nouveau mot de passe
                              </label>
                              <input 
                                  type="password" 
                                  required 
                                  value={passData.newPassword} 
                                  onChange={e => setPassData({...passData, newPassword: e.target.value})} 
                                  placeholder="••••••••" 
                                  className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm outline-none focus:ring-2 ring-amber-500"
                              />
                          </div>
                          <div>
                              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 mb-1 block">
                                  Confirmer
                              </label>
                              <input 
                                  type="password" 
                                  required 
                                  value={passData.confirmPassword} 
                                  onChange={e => setPassData({...passData, confirmPassword: e.target.value})} 
                                  placeholder="••••••••" 
                                  className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm outline-none focus:ring-2 ring-amber-500"
                              />
                          </div>
                          <button 
                              type="submit" 
                              disabled={passLoading} 
                              className="w-full bg-amber-500 text-white py-3 rounded-xl font-bold hover:bg-amber-600 transition shadow-lg shadow-amber-200"
                          >
                              {passLoading ? "Modification..." : "Changer le mot de passe"}
                          </button>
                      </form>
                  </div>

                  {/* ZONE DANGER (RGPD) */}
                  <div className="bg-rose-50 p-6 rounded-[2rem] border border-rose-100 shadow-sm">
                      <h3 className="font-black text-lg mb-4 flex items-center gap-2 text-rose-600">
                          <Trash2 size={20}/> Zone de Danger
                      </h3>
                      <p className="text-xs text-rose-400 mb-4">
                          La suppression de votre compte est irréversible. Toutes vos données (clients, avis, page web) seront perdues.
                      </p>
                      <button 
                          onClick={handleDeleteAccount} 
                          className="w-full bg-white border border-rose-200 text-rose-600 py-3 rounded-xl font-bold hover:bg-rose-600 hover:text-white transition shadow-sm"
                      >
                          Supprimer mon compte
                      </button>
                  </div>

              </div>
          </div>
      </div>
    </div>
  );
}
