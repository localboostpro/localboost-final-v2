import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { Building2, Globe, Phone, Fingerprint, Save, CheckCircle2 } from "lucide-react";

export default function Profile({ profile, setProfile }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // États locaux pour le formulaire
  const [formData, setFormData] = useState({
    name: "",
    siret: "",
    website: "",
    phone: "",
    address: "",
    description: ""
  });

  // Synchronisation des données reçues du profil
  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || "",
        siret: profile.siret || "",
        website: profile.website || "",
        phone: profile.phone || "",
        address: profile.address || "",
        description: profile.description || ""
      });
    }
  }, [profile]);

  const handleSave = async () => {
    setLoading(true);
    setSuccess(false);

    const { error } = await supabase
      .from("business_profile")
      .update({
        name: formData.name,
        siret: formData.siret,
        website: formData.website,
        phone: formData.phone,
        address: formData.address,
        description: formData.description
      })
      .eq("id", profile.id);

    if (error) {
      alert("Erreur lors de la mise à jour : " + error.message);
    } else {
      setSuccess(true);
      setProfile({ ...profile, ...formData }); // Mise à jour de l'état global
      setTimeout(() => setSuccess(false), 3000);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-black text-slate-900">Paramètres du Profil</h2>
            <p className="text-slate-500 text-sm">Gérez les informations publiques de votre entreprise.</p>
          </div>
          {success && (
            <div className="flex items-center gap-2 text-green-600 font-bold bg-green-50 px-4 py-2 rounded-xl animate-bounce">
              <CheckCircle2 size={20} /> Enregistré !
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* NOM DE L'ENTREPRISE */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase ml-1 flex items-center gap-2">
              <Building2 size={14} /> Nom de l'entreprise
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition"
              placeholder="Ex: Beauty Coiffure"
            />
          </div>

          {/* SIRET */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase ml-1 flex items-center gap-2">
              <Fingerprint size={14} /> Numéro SIRET
            </label>
            <input
              type="text"
              value={formData.siret}
              disabled // On bloque le SIRET car c'est une clé unique officielle
              className="w-full p-4 bg-slate-100 border border-slate-200 rounded-2xl text-slate-500 cursor-not-allowed"
            />
          </div>

          {/* SITE WEB */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase ml-1 flex items-center gap-2">
              <Globe size={14} /> Site Web
            </label>
            <input
              type="text"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition"
              placeholder="https://..."
            />
          </div>

          {/* TÉLÉPHONE */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase ml-1 flex items-center gap-2">
              <Phone size={14} /> Téléphone
            </label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition"
              placeholder="06 00 00 00 00"
            />
          </div>
        </div>

        {/* DESCRIPTION */}
        <div className="mt-6 space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase ml-1">Description de l'activité</label>
          <textarea
            rows="4"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition"
            placeholder="Décrivez votre activité pour aider l'IA à générer vos posts..."
          />
        </div>

        {/* BOUTON SAUVEGARDE */}
        <div className="mt-8 flex justify-end">
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex items-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black hover:bg-indigo-700 transition shadow-lg shadow-indigo-100 disabled:opacity-50"
          >
            {loading ? "Enregistrement..." : <><Save size={20} /> Enregistrer les modifications</>}
          </button>
        </div>
      </div>
    </div>
  );
}
