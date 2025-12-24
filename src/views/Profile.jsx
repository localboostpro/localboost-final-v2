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
  if (profile?.opening_hours) {
    try {
      const parsed = typeof profile.opening_hours === 'string' 
        ? JSON.parse(profile.opening_hours) 
        : profile.opening_hours;
      if (Array.isArray(parsed) && parsed.length === 7) {
        initialHours = parsed;
      }
    } catch (e) {
      console.error("Erreur parsing opening_hours:", e);
    }
  }

  const [openingHours, setOpeningHours] = useState(initialHours);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(profile?.logo_url || null);

  const [passwordData, setPasswordData] = useState({
    newPassword: "",
    confirmPassword: ""
  });

  // Récupérer les infos du plan
  const planBadge = getPlanBadge(profile?.plan || "basic");

  // GESTION DU LOGO
  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Le fichier doit faire moins de 2MB");
        return;
      }
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const uploadLogo = async () => {
    if (!logoFile) return profile?.logo_url;

    const fileExt = logoFile.name.split('.').pop();
    const fileName = `${profile.id}_${Date.now()}.${fileExt}`;
    const filePath = `logos/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('user_uploads')
      .upload(filePath, logoFile, { upsert: true });

    if (uploadError) {
      console.error("Erreur upload logo:", uploadError);
      return profile?.logo_url;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('user_uploads')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  // SAUVEGARDE DU PROFIL
  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const logoUrl = await uploadLogo();

      const { error } = await supabase
        .from("business_profile")
        .update({
          ...formData,
          opening_hours: openingHours,
          logo_url: logoUrl,
          updated_at: new Date().toISOString()
        })
        .eq("id", profile.id);

      if (error) throw error;

      setProfile({ ...profile, ...formData, opening_hours: openingHours, logo_url: logoUrl });
      alert("✅ Profil mis à jour avec succès !");
    } catch (error) {
      console.error("Erreur:", error);
      alert("❌ Erreur lors de la mise à jour");
    } finally {
      setLoading(false);
    }
  };

  // CHANGEMENT DE MOT DE PASSE
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("❌ Les mots de passe ne correspondent pas");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      alert("❌ Le mot de passe doit faire au moins 6 caractères");
      return;
    }

    setPassLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });

      if (error) throw error;

      alert("✅ Mot de passe changé avec succès !");
      setPasswordData({ newPassword: "", confirmPassword: "" });
    } catch (error) {
      console.error("Erreur changement mot de passe:", error);
      alert("❌ Erreur lors du changement de mot de passe");
    } finally {
      setPassLoading(false);
    }
  };

  // SUPPRESSION DU COMPTE
  const handleDeleteAccount = async () => {
    if (!window.confirm("⚠️ Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.")) {
      return;
    }

    if (!window.confirm("🚨 DERNIÈRE CONFIRMATION : Toutes vos données seront perdues définitivement.")) {
      return;
    }

    try {
      // Supprimer le profil business
      const { error: deleteError } = await supabase
        .from("business_profile")
        .delete()
        .eq("id", profile.id);

      if (deleteError) throw deleteError;

      // Déconnecter l'utilisateur
      await supabase.auth.signOut();
      
      alert("✅ Compte supprimé avec succès");
      window.location.href = "/";
    } catch (error) {
      console.error("Erreur suppression:", error);
      alert("❌ Erreur lors de la suppression du compte");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER AVEC PLAN */}
        <div className="bg-white p-8 rounded-[3rem] shadow-2xl border border-slate-100 mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-[2rem] shadow-xl">
                <User className="text-white" size={32} />
              </div>
              <div>
                <h1 className="text-4xl font-black bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  Mon Profil
                </h1>
                <p className="text-slate-400 font-medium mt-1">
                  Gérez les informations de votre établissement
                </p>
              </div>
            </div>

            {/* BADGE PLAN */}
            <div className={`px-6 py-3 rounded-[2rem] font-bold flex items-center gap-2 shadow-lg ${planBadge.color}`}>
              <span className="text-2xl">{planBadge.icon}</span>
              <div>
                <div className="text-sm opacity-70">Plan {planBadge.label}</div>
                <div className="text-lg font-black">{planBadge.price}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* COLONNE GAUCHE - INFOS */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* LOGO */}
            <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-slate-100">
              <h2 className="font-black text-2xl mb-6 flex items-center gap-3">
                <FileImage className="text-blue-500" size={28} />
                Logo de l'établissement
              </h2>
              
              <div className="flex items-center gap-6">
                <div className="w-32 h-32 bg-slate-100 rounded-[2rem] flex items-center justify-center overflow-hidden shadow-inner">
                  {logoPreview ? (
                    <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    <Building className="text-slate-300" size={48} />
                  )}
                </div>
                
                <div className="flex-1">
                  <label className="cursor-pointer bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl font-bold inline-flex items-center gap-2 shadow-lg hover:shadow-xl transition">
                    <Upload size={20} />
                    Choisir un logo
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleLogoChange} 
                      className="hidden" 
                    />
                  </label>
                  <p className="text-xs text-slate-400 mt-3">
                    Format JPG, PNG ou SVG. Max 2MB.
                  </p>
                </div>
              </div>
            </div>

            {/* FORMULAIRE INFOS */}
            <form onSubmit={handleSave} className="bg-white p-8 rounded-[3rem] shadow-xl border border-slate-100">
              <h2 className="font-black text-2xl mb-6 flex items-center gap-3">
                <Building className="text-blue-500" size={28} />
                Informations Générales
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-600 mb-2">
                    Nom de l'établissement
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm outline-none focus:ring-2 ring-blue-500"
                    placeholder="Boulangerie Martin"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-600 mb-2 flex items-center gap-2">
                    <Phone size={16} /> Téléphone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm outline-none focus:ring-2 ring-blue-500"
                    placeholder="06 12 34 56 78"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-600 mb-2 flex items-center gap-2">
                    <MapPin size={16} /> Adresse
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm outline-none focus:ring-2 ring-blue-500"
                    placeholder="123 Rue de la Paix"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-600 mb-2">
                    Ville
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm outline-none focus:ring-2 ring-blue-500"
                    placeholder="Paris"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-600 mb-2">
                    Code Postal
                  </label>
                  <input
                    type="text"
                    value={formData.zip_code}
                    onChange={(e) => setFormData({...formData, zip_code: e.target.value})}
                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm outline-none focus:ring-2 ring-blue-500"
                    placeholder="75001"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-600 mb-2 flex items-center gap-2">
                    <Globe size={16} /> Site Web
                  </label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({...formData, website: e.target.value})}
                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm outline-none focus:ring-2 ring-blue-500"
                    placeholder="https://mon-site.fr"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-slate-600 mb-2">
                    SIRET
                  </label>
                  <input
                    type="text"
                    value={formData.siret}
                    onChange={(e) => setFormData({...formData, siret: e.target.value})}
                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm outline-none focus:ring-2 ring-blue-500"
                    placeholder="123 456 789 00012"
                  />
                </div>
              </div>

              {/* HORAIRES */}
              <div className="mt-8">
                <h3 className="font-black text-lg mb-4 flex items-center gap-2">
                  <Clock size={20} className="text-blue-500" />
                  Horaires d'Ouverture
                </h3>
                
                <div className="space-y-3">
                  {openingHours.map((hour, idx) => (
                    <div key={idx} className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                      <div className="w-28 font-bold text-sm text-slate-600">
                        {hour.day}
                      </div>
                      
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={hour.closed}
                          onChange={(e) => {
                            const newHours = [...openingHours];
                            newHours[idx].closed = e.target.checked;
                            setOpeningHours(newHours);
                          }}
                          className="w-5 h-5 rounded accent-blue-500"
                        />
                        <span className="text-sm font-medium text-slate-500">Fermé</span>
                      </label>

                      {!hour.closed && (
                        <>
                          <input
                            type="time"
                            value={hour.open}
                            onChange={(e) => {
                              const newHours = [...openingHours];
                              newHours[idx].open = e.target.value;
                              setOpeningHours(newHours);
                            }}
                            className="p-2 bg-white border border-slate-200 rounded-lg text-sm font-bold outline-none focus:ring-2 ring-blue-500"
                          />
                          <span className="text-slate-400 font-bold">→</span>
                          <input
                            type="time"
                            value={hour.close}
                            onChange={(e) => {
                              const newHours = [...openingHours];
                              newHours[idx].close = e.target.value;
                              setOpeningHours(newHours);
                            }}
                            className="p-2 bg-white border border-slate-200 rounded-lg text-sm font-bold outline-none focus:ring-2 ring-blue-500"
                          />
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full mt-8 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4 rounded-xl font-black text-lg hover:shadow-2xl transition flex items-center justify-center gap-3"
              >
                {loading ? "Enregistrement..." : (
                  <>
                    <Save size={24} />
                    Enregistrer les modifications
                  </>
                )}
              </button>
            </form>
          </div>

          {/* COLONNE DROITE - SÉCURITÉ */}
          <div className="space-y-6">
            
            {/* PLAN ACTUEL */}
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-8 rounded-[3rem] shadow-2xl text-white">
              <div className="text-center mb-6">
                <div className="text-6xl mb-4">{planBadge.icon}</div>
                <h3 className="font-black text-2xl mb-2">Plan {planBadge.label}</h3>
                <div className="text-3xl font-black mb-1">{planBadge.price}</div>
                {planBadge.trialDays > 0 && (
                  <div className="text-sm opacity-90">
                    🎁 Essai {planBadge.trialDays} jours gratuit
                  </div>
                )}
              </div>

              <div className="space-y-3 mb-6">
                {planBadge.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-sm">
                    <CheckCircle size={16} className="mt-0.5 flex-shrink-0" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              <button className="w-full bg-white text-blue-600 py-3 rounded-xl font-bold hover:shadow-xl transition">
                Changer de plan
              </button>
            </div>

            {/* MOT DE PASSE */}
            <div className="bg-white p-6 rounded-[3rem] shadow-xl border border-slate-100">
              <h3 className="font-black text-lg mb-4 flex items-center gap-2">
                <Key size={20} className="text-amber-500" />
                Changer le mot de passe
              </h3>
              
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-2">
                    Nouveau mot de passe
                  </label>
                  <input 
                    type="password" 
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})} 
                    placeholder="••••••••" 
                    className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm outline-none focus:ring-2 ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-2">
                    Confirmer le mot de passe
                  </label>
                  <input 
                    type="password" 
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})} 
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
