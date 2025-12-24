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

  const planBadge = getPlanBadge(profile?.plan || "basic");

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    console.log("🔄 Début de la mise à jour...");
    console.log("📦 Données à envoyer:", formData);
    
    try {
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

        console.log("📤 Envoi vers Supabase:", updateData);

        const { data, error } = await supabase
            .from("business_profile")
            .update(updateData)
            .eq("id", profile.id)
            .select();

        if (error) {
            console.error("❌ Erreur Supabase:", error);
            throw error;
        }

        console.log("✅ Réponse Supabase:", data);

        setProfile({ ...profile, ...formData, opening_hours: JSON.stringify(hours) });
        alert("✅ Informations mises à jour avec succès !");
        
    } catch (error) { 
        console.error("❌ Erreur:", error);
        alert("Erreur : " + error.message); 
    } finally { 
        setLoading(false); 
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passData.newPassword !== passData.confirmPassword) {
      alert("Les mots de passe ne correspondent pas !");
      return;
    }
    setPassLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: passData.newPassword });
      if (error) throw error;
      alert("✅ Mot de passe modifié avec succès !");
      setPassData({ newPassword: "", confirmPassword: "" });
    } catch (error) {
      alert("Erreur : " + error.message);
    } finally {
      setPassLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("⚠️ Voulez-vous vraiment supprimer votre compte ? Cette action est irréversible !")) return;
    try {
      const { error } = await supabase.from("business_profile").delete().eq("id", profile.id);
      if (error) throw error;
      await supabase.auth.signOut();
      window.location.href = "/";
    } catch (error) {
      alert("Erreur : " + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-slate-900 mb-2">Mon Établissement</h1>
          <p className="text-slate-500">Gérez les informations de votre profil professionnel</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          
          {/* COLONNE GAUCHE - INFORMATIONS GÉNÉRALES */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* INFORMATIONS GÉNÉRALES */}
            <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-lg">
              <h2 className="text-2xl font-black mb-6 flex items-center gap-2 text-slate-900">
                <Building size={24} className="text-blue-500"/> Informations Générales
              </h2>

              <form onSubmit={handleUpdate} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-2 flex items-center gap-2">
                      <Building size={14}/> Nom de l'établissement
                    </label>
                    <input 
                      type="text" 
                      required 
                      value={formData.name} 
                      onChange={e => setFormData({...formData, name: e.target.value})} 
                      placeholder="Mon Restaurant" 
                      className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm outline-none focus:ring-2 ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-2 flex items-center gap-2">
                      <Phone size={14}/> Téléphone
                    </label>
                    <input 
                      type="tel" 
                      value={formData.phone} 
                      onChange={e => setFormData({...formData, phone: e.target.value})} 
                      placeholder="06 12 34 56 78" 
                      className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm outline-none focus:ring-2 ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2 flex items-center gap-2">
                    <MapPin size={14}/> Adresse
                  </label>
                  <input 
                    type="text" 
                    value={formData.address} 
                    onChange={e => setFormData({...formData, address: e.target.value})} 
                    placeholder="123 Rue de la Paix" 
                    className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm outline-none focus:ring-2 ring-blue-500"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-2">Ville</label>
                    <input 
                      type="text" 
                      value={formData.city} 
                      onChange={e => setFormData({...formData, city: e.target.value})} 
                      placeholder="Paris" 
                      className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm outline-none focus:ring-2 ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-2">Code Postal</label>
                    <input 
                      type="text" 
                      value={formData.zip_code} 
                      onChange={e => setFormData({...formData, zip_code: e.target.value})} 
                      placeholder="75001" 
                      className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm outline-none focus:ring-2 ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-2 flex items-center gap-2">
                      <Globe size={14}/> Site Web
                    </label>
                    <input 
                      type="url" 
                      value={formData.website} 
                      onChange={e => setFormData({...formData, website: e.target.value})} 
                      placeholder="https://mon-site.fr" 
                      className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm outline-none focus:ring-2 ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-2">SIRET</label>
                    <input 
                      type="text" 
                      value={formData.siret} 
                      onChange={e => setFormData({...formData, siret: e.target.value})} 
                      placeholder="123 456 789 00012" 
                      className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm outline-none focus:ring-2 ring-blue-500"
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={loading} 
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 rounded-xl font-bold hover:shadow-xl hover:scale-[1.02] transition flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
                >
                  <Save size={20}/> {loading ? "Enregistrement..." : "Enregistrer les modifications"}
                </button>
              </form>
            </div>

            {/* HORAIRES D'OUVERTURE */}
            <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-lg">
              <h3 className="text-2xl font-black mb-6 flex items-center gap-2 text-slate-900">
                <Clock size={24} className="text-amber-500"/> Horaires d'Ouverture
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

          </div>

          {/* COLONNE DROITE - ABONNEMENT & SÉCURITÉ */}
          <div className="space-y-6">

            {/* BADGE ABONNEMENT */}
            <div className={`p-6 rounded-[2rem] border-2 shadow-xl ${profile?.plan === 'premium' ? 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200' : 'bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200'}`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-black text-xl text-slate-900">Mon Abonnement</h3>
                {profile?.plan === 'premium' ? <Crown className="text-amber-500" size={28}/> : <Sparkles className="text-blue-500" size={28}/>}
              </div>
              
              <div className={`text-center py-4 px-6 rounded-2xl ${profile?.plan === 'premium' ? 'bg-gradient-to-r from-amber-400 to-orange-500' : 'bg-gradient-to-r from-blue-500 to-cyan-500'} text-white mb-4`}>
                <div className="text-sm font-bold opacity-90">Forfait actuel</div>
                <div className="text-3xl font-black">{planBadge?.price || "59€/mois"}</div>
              </div>

              {profile?.plan !== 'premium' && (
                <button className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white py-3 rounded-xl font-bold hover:shadow-xl transition flex items-center justify-center gap-2 mb-4">
                  <Zap size={18}/> Passer en Premium (99€/mois)
                </button>
              )}

              <button className="w-full bg-white border border-slate-200 text-slate-700 py-3 rounded-xl font-bold hover:bg-slate-50 transition text-sm">
                Résilier / Passer en Basic
              </button>
            </div>

            {/* AVANTAGES DU PLAN */}
            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-lg">
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

            {/* CHANGEMENT DE MOT DE PASSE */}
            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-lg">
              <h3 className="font-black text-lg mb-4 flex items-center gap-2 text-slate-900">
                <Lock size={20}/> Sécurité
              </h3>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2 flex items-center gap-2">
                    <Key size={14}/> Nouveau mot de passe
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
                  <label className="block text-xs font-bold text-slate-500 mb-2 flex items-center gap-2">
                    <Key size={14}/> Confirmer
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

            {/* ZONE DANGER */}
            <div className="bg-rose-50 p-6 rounded-[2rem] border border-rose-100 shadow-sm">
              <h3 className="font-black text-lg mb-4 flex items-center gap-2 text-rose-600">
                <Trash2 size={20}/> Zone de Danger
              </h3>
              <p className="text-xs text-rose-400 mb-4">
                La suppression de votre compte est irréversible. Toutes vos données seront perdues.
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
