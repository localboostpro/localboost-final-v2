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

  // ✅ MISE À JOUR DES INFORMATIONS - CORRIGÉE
  const handleUpdate = async (e) => {
      e.preventDefault();
      setLoading(true);
      
      console.log("🔄 Début de la mise à jour...");
      console.log("📦 Données à envoyer:", formData);
      
      try {
          const updatedConfig = { ...profile?.landing_config, hours: hours };
          
const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
        // ✅ ENREGISTRE LES HORAIRES DANS opening_hours (colonne qui existe)
        const updateData = {
            name: formData.name, 
            phone: formData.phone, 
            address: formData.address,
            city: formData.city, 
            zip_code: formData.zip_code, 
            website: formData.website,
            siret: formData.siret,
            opening_hours: JSON.stringify(hours), // ✅ SAUVEGARDE LES HORAIRES ICI
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
          return alert("Les mots de passe ne correspondent pas.");
      }
      if (passData.newPassword.length < 6) {
          return alert("Le mot de passe doit contenir au moins 6 caractères.");
      }

      setPassLoading(true);
      try {
          const { error } = await supabase.auth.updateUser({ 
              password: passData.newPassword 
          });
          if (error) throw error;
          
          alert("✅ Mot de passe modifié avec succès !");
          setPassData({ newPassword: "", confirmPassword: "" });
      } catch (error) {
          alert("Erreur : " + error.message);
      } finally {
          setPassLoading(false);
      }
  };

  // ✅ GESTION DES HORAIRES
  const handleHourChange = (index, field, value) => {
      const newHours = [...hours];
      newHours[index][field] = value;
      setHours(newHours);
  };

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 p-6">
      <div className="max-w-6xl mx-auto">
          <div className="mb-8">
              <h1 className="text-4xl font-black text-slate-900 mb-2">Mon Établissement</h1>
              <p className="text-slate-500">Gérez les informations de votre profil professionnel</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* COLONNE 1 : INFORMATIONS PRINCIPALES */}
              <div className="lg:col-span-2 space-y-6">
                  
                  {/* FORM PRINCIPAL */}
                  <form onSubmit={handleUpdate} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-lg">
                      <h2 className="font-black text-2xl mb-6 flex items-center gap-3 text-slate-900">
                          <Building size={28} className="text-blue-500"/>
                          Informations Générales
                      </h2>

                      <div className="space-y-5">
                          {/* NOM */}
                          <div>
                              <label className="text-xs font-bold text-slate-400 uppercase ml-1 mb-2 block flex items-center gap-2">
                                  <User size={14}/> Nom de l'établissement
                              </label>
                              <input 
                                  type="text" 
                                  required
                                  value={formData.name}
                                  onChange={e => setFormData({...formData, name: e.target.value})}
                                  placeholder="Ex: Boulangerie Martin"
                                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-base outline-none focus:ring-2 ring-blue-500 transition"
                              />
                          </div>

                          {/* TÉLÉPHONE */}
                          <div>
                              <label className="text-xs font-bold text-slate-400 uppercase ml-1 mb-2 block flex items-center gap-2">
                                  <Phone size={14}/> Téléphone
                              </label>
                              <input 
                                  type="tel"
                                  value={formData.phone}
                                  onChange={e => setFormData({...formData, phone: e.target.value})}
                                  placeholder="06 12 34 56 78"
                                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-base outline-none focus:ring-2 ring-blue-500 transition"
                              />
                          </div>

                          {/* ADRESSE */}
                          <div>
                              <label className="text-xs font-bold text-slate-400 uppercase ml-1 mb-2 block flex items-center gap-2">
                                  <MapPin size={14}/> Adresse complète
                              </label>
                              <input 
                                  type="text"
                                  value={formData.address}
                                  onChange={e => setFormData({...formData, address: e.target.value})}
                                  placeholder="123 Rue de la Paix"
                                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-base outline-none focus:ring-2 ring-blue-500 transition"
                              />
                          </div>

                          {/* VILLE + CODE POSTAL */}
                          <div className="grid grid-cols-2 gap-4">
                              <div>
                                  <label className="text-xs font-bold text-slate-400 uppercase ml-1 mb-2 block">Ville</label>
                                  <input 
                                      type="text"
                                      value={formData.city}
                                      onChange={e => setFormData({...formData, city: e.target.value})}
                                      placeholder="Paris"
                                      className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-base outline-none focus:ring-2 ring-blue-500 transition"
                                  />
                              </div>
                              <div>
                                  <label className="text-xs font-bold text-slate-400 uppercase ml-1 mb-2 block">Code Postal</label>
                                  <input 
                                      type="text"
                                      value={formData.zip_code}
                                      onChange={e => setFormData({...formData, zip_code: e.target.value})}
                                      placeholder="75001"
                                      className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-base outline-none focus:ring-2 ring-blue-500 transition"
                                  />
                              </div>
                          </div>

                          {/* SITE WEB */}
                          <div>
                              <label className="text-xs font-bold text-slate-400 uppercase ml-1 mb-2 block flex items-center gap-2">
                                  <Globe size={14}/> Site Web
                              </label>
                              <input 
                                  type="url"
                                  value={formData.website}
                                  onChange={e => setFormData({...formData, website: e.target.value})}
                                  placeholder="https://monsite.fr"
                                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-base outline-none focus:ring-2 ring-blue-500 transition"
                              />
                          </div>

                          {/* SIRET */}
                          <div>
                              <label className="text-xs font-bold text-slate-400 uppercase ml-1 mb-2 block flex items-center gap-2">
                                  <FileImage size={14}/> SIRET
                              </label>
                              <input 
                                  type="text"
                                  value={formData.siret}
                                  onChange={e => setFormData({...formData, siret: e.target.value})}
                                  placeholder="123 456 789 00010"
                                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-base outline-none focus:ring-2 ring-blue-500 transition"
                              />
                          </div>

                          {/* BOUTON ENREGISTRER */}
                          <button 
                              type="submit" 
                              disabled={loading}
                              className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white py-4 rounded-2xl font-black text-lg hover:shadow-xl hover:scale-[1.02] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                          >
                              {loading ? (
                                  <>Enregistrement...</>
                              ) : (
                                  <>
                                      <Save size={20}/>
                                      Enregistrer les modifications
                                  </>
                              )}
                          </button>
                      </div>
                  </form>

                  {/* HORAIRES D'OUVERTURE */}
                  <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-lg">
                      <h3 className="font-black text-xl mb-6 flex items-center gap-3 text-slate-900">
                          <Clock size={24} className="text-green-500"/>
                          Horaires d'ouverture
                      </h3>
                      <div className="space-y-4">
                          {hours.map((h, i) => (
                              <div key={i} className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl">
                                  <div className="w-24 font-bold text-sm text-slate-700">{h.day}</div>
                                  {h.closed ? (
                                      <div className="flex-1 flex items-center justify-center">
                                          <span className="text-xs font-bold text-rose-500 bg-rose-50 px-4 py-2 rounded-full">FERMÉ</span>
                                      </div>
                                  ) : (
                                      <div className="flex-1 flex items-center gap-3">
                                          <input 
                                              type="time" 
                                              value={h.open}
                                              onChange={e => handleHourChange(i, 'open', e.target.value)}
                                              className="p-2 border border-slate-200 rounded-lg font-bold text-sm"
                                          />
                                          <span className="text-slate-400">→</span>
                                          <input 
                                              type="time" 
                                              value={h.close}
                                              onChange={e => handleHourChange(i, 'close', e.target.value)}
                                              className="p-2 border border-slate-200 rounded-lg font-bold text-sm"
                                          />
                                      </div>
                                  )}
                                  <button 
                                      type="button"
                                      onClick={() => handleHourChange(i, 'closed', !h.closed)}
                                      className={`px-4 py-2 rounded-lg text-xs font-bold transition ${h.closed ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-600'}`}
                                  >
                                      {h.closed ? 'OUVERT' : 'FERMÉ'}
                                  </button>
                              </div>
                          ))}
                      </div>
                  </div>
              </div>

              {/* COLONNE 2 : ABONNEMENT + SÉCURITÉ */}
              <div className="space-y-6">
                  
                  {/* CARTE ABONNEMENT */}
                  <div className={`relative overflow-hidden p-6 rounded-[2rem] border shadow-lg ${
                      currentPlan === 'premium' ? 'bg-gradient-to-br from-purple-600 via-purple-500 to-pink-500 border-purple-400' :
                      currentPlan === 'pro' ? 'bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-500 border-blue-400' :
                      'bg-gradient-to-br from-slate-700 via-slate-600 to-slate-500 border-slate-400'
                  }`}>
                      {/* Effet de brillance */}
                      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                      
                      <div className="relative z-10">
                          <div className="flex items-center justify-between mb-4">
                              <h3 className="font-black text-white text-lg flex items-center gap-2">
                                  <CreditCard size={20}/>
                                  Mon Abonnement
                              </h3>
                              {planBadge.icon}
                          </div>

                          <div className="bg-white/20 backdrop-blur-sm p-4 rounded-xl mb-4">
                              <div className="text-white/80 text-xs font-bold mb-1">Forfait actuel</div>
                              <div className="text-white font-black text-2xl">{planBadge.name}</div>
                              <div className="text-white/90 font-bold text-lg mt-1">{PLANS[currentPlan].price}€<span className="text-sm">/mois</span></div>
                          </div>

                          {isTrial && (
                              <div className="bg-amber-500/20 backdrop-blur-sm border border-amber-300/30 p-3 rounded-xl mb-4">
                                  <div className="flex items-center gap-2 text-amber-100 text-xs font-bold">
                                      <AlertTriangle size={14}/>
                                      <span>Période d'essai : {trialDaysLeft} jours restants</span>
                                  </div>
                              </div>
                          )}

                          {/* Boutons d'upgrade */}
                          <div className="space-y-3 mb-4">
                              {currentPlan === 'basic' && (
                                  <>
                                      <button 
                                          onClick={() => handleUpgrade('pro')} 
                                          disabled={subLoading}
                                          className="w-full bg-white text-blue-600 py-3 rounded-xl font-bold text-sm hover:bg-blue-50 transition flex items-center justify-center gap-2"
                                      >
                                          <Zap size={16}/>
                                          Passer en Pro (59€/mois)
                                      </button>
                                      <button 
                                          onClick={() => handleUpgrade('premium')} 
                                          disabled={subLoading}
                                          className="w-full bg-gradient-to-r from-amber-400 to-amber-300 text-amber-900 py-3 rounded-xl font-bold text-sm hover:shadow-lg transition flex items-center justify-center gap-2"
                                      >
                                          <Crown size={16}/>
                                          Passer en Premium (99€/mois)
                                      </button>
                                  </>
                              )}

                              {currentPlan === 'pro' && (
                                  <button 
                                      onClick={() => handleUpgrade('premium')} 
                                      disabled={subLoading}
                                      className="w-full bg-gradient-to-r from-amber-400 to-amber-300 text-amber-900 py-3 rounded-xl font-bold text-sm hover:shadow-lg transition flex items-center justify-center gap-2"
                                  >
                                      <Crown size={16}/>
                                      Passer en Premium (99€/mois)
                                  </button>
                              )}

                              {currentPlan !== 'basic' && (
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
                              <div className="text-xs text-white/90 space-y-2">
                                  <div className="font-bold mb-3">Votre forfait inclut :</div>
                                  {PLANS[currentPlan].features.map((feature, i) => (
                                      <div key={i} className="flex items-start gap-2">
                                          <CheckCircle size={14} className="text-green-300 mt-0.5 flex-shrink-0" />
                                          <span>{feature}</span>
                                      </div>
                                  ))}
                              </div>
                          </div>
                      </div>
                  </div>

                  {/* EMAIL */}
                  <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm opacity-70">
                      <h3 className="font-bold text-sm mb-4 flex items-center gap-2 text-slate-500">
                          <Lock size={16}/> Identifiant de connexion
                      </h3>
                      <input 
                          disabled 
                          value={formData.email} 
                          className="w-full p-3 bg-slate-100 border border-slate-100 rounded-xl font-bold text-sm text-slate-500 cursor-not-allowed"
                      />
                      <p className="text-[10px] text-slate-400 mt-2">Contactez le support pour changer d'email.</p>
                  </div>

                  {/* PASSWORD */}
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
