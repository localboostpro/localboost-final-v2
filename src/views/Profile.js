import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { Save, User, MapPin, Phone, Globe, FileText, Mail } from "lucide-react"; // ✅ Ajout de Mail

export default function Profile({ profile, setProfile }) {
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "", // ✅ Nouveau champ
    address: "",
    phone: "",
    website: "",
    description: "",
  });

  // Chargement des données
  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || "",
        email: profile.email || "", // ✅ On récupère l'email existant
        address: profile.address || "",
        phone: profile.phone || "",
        website: profile.website || "",
        description: profile.description || "",
      });
    }
  }, [profile]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from("business_profile")
        .update({
          name: formData.name,
          email: formData.email, // ✅ On envoie l'email à Supabase
          address: formData.address,
          phone: formData.phone,
          website: formData.website,
          description: formData.description,
        })
        .eq("id", profile.id)
        .select()
        .single();

      if (error) throw error;

      setProfile(data);
      alert("✅ Profil mis à jour avec succès !");
    } catch (error) {
      alert("Erreur lors de la sauvegarde : " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-black text-slate-800 mb-6">
        Paramètres du Profil
      </h2>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        <form onSubmit={handleSave} className="space-y-6">
          {/* Section Identité */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase mb-2">
                <User size={14} /> Nom de l'entreprise
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full p-3 bg-slate-50 border rounded-xl outline-none focus:border-indigo-500 focus:bg-white transition"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase mb-2">
                <Globe size={14} /> Site Web
              </label>
              <input
                type="text"
                name="website"
                value={formData.website}
                onChange={handleChange}
                placeholder="https://..."
                className="w-full p-3 bg-slate-50 border rounded-xl outline-none focus:border-indigo-500 focus:bg-white transition"
              />
            </div>
          </div>

          {/* Section Contact */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* --- NOUVEAU CHAMPS EMAIL --- */}
            <div>
              <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase mb-2">
                <Mail size={14} /> Email de contact
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="contact@entreprise.com"
                className="w-full p-3 bg-slate-50 border rounded-xl outline-none focus:border-indigo-500 focus:bg-white transition"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase mb-2">
                <Phone size={14} /> Téléphone
              </label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full p-3 bg-slate-50 border rounded-xl outline-none focus:border-indigo-500 focus:bg-white transition"
              />
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase mb-2">
              <MapPin size={14} /> Adresse complète
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full p-3 bg-slate-50 border rounded-xl outline-none focus:border-indigo-500 focus:bg-white transition"
            />
          </div>

          {/* Section Description */}
          <div>
            <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase mb-2">
              <FileText size={14} /> Description de l'activité
            </label>
            <textarea
              name="description"
              rows="4"
              value={formData.description}
              onChange={handleChange}
              className="w-full p-3 bg-slate-50 border rounded-xl outline-none focus:border-indigo-500 focus:bg-white transition"
              placeholder="Décrivez votre activité en quelques lignes..."
            />
          </div>

          <hr className="border-slate-100" />

          {/* Bouton de sauvegarde */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 disabled:opacity-50"
            >
              {loading ? (
                "Enregistrement..."
              ) : (
                <>
                  <Save size={18} /> Enregistrer les modifications
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
