import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export default function Profile({ user }) {
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postal_code: "",
    siret: "",
    description: "",
    website: ""
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from("business_profile")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();

        if (error) throw error;
        
        if (data) {
          setProfile({
            name: data.name || "",
            email: user.email,
            phone: data.phone || "",
            address: data.address || "",
            city: data.city || "",
            postal_code: data.postal_code || "",
            siret: data.siret || "",
            description: data.description || "",
            website: data.website || ""
          });
        } else {
          setProfile(prev => ({ ...prev, email: user.email }));
        }
      } catch (err) {
        console.error("Erreur:", err);
        alert("❌ Erreur de chargement du profil");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("business_profile")
        .upsert({
          user_id: user.id,
          name: profile.name,
          phone: profile.phone,
          address: profile.address,
          city: profile.city,
          postal_code: profile.postal_code,
          siret: profile.siret,
          description: profile.description,
          website: profile.website
        });

      if (error) throw error;
      alert("✅ Profil sauvegardé avec succès !");
    } catch (err) {
      console.error("Erreur:", err);
      alert("❌ Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">⏳ Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Mon Profil</h1>
          <p className="text-gray-600 mt-2">Gérez les informations de votre établissement</p>
        </div>

        {/* Formulaire en 2 colonnes */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* COLONNE 1 */}
            <div className="space-y-6">
              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  📧 Email
                </label>
                <input 
                  type="email" 
                  value={profile.email} 
                  disabled
                  className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                />
              </div>

              {/* Nom établissement */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  🏢 Nom de l'établissement *
                </label>
                <input 
                  type="text" 
                  value={profile.name} 
                  onChange={(e) => setProfile({...profile, name: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Restaurant Chez Paul"
                  required
                />
              </div>

              {/* SIRET */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  🔢 SIRET *
                </label>
                <input 
                  type="text" 
                  value={profile.siret} 
                  onChange={(e) => setProfile({...profile, siret: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="123 456 789 00012"
                  maxLength={14}
                  required
                />
              </div>

              {/* Téléphone */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  📞 Téléphone *
                </label>
                <input 
                  type="tel" 
                  value={profile.phone} 
                  onChange={(e) => setProfile({...profile, phone: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="01 23 45 67 89"
                  required
                />
              </div>

              {/* Site Web */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  🌐 Site Web
                </label>
                <input 
                  type="url" 
                  value={profile.website} 
                  onChange={(e) => setProfile({...profile, website: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="https://www.monsite.fr"
                />
              </div>
            </div>

            {/* COLONNE 2 */}
            <div className="space-y-6">
              {/* Adresse */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  📍 Adresse *
                </label>
                <input 
                  type="text" 
                  value={profile.address} 
                  onChange={(e) => setProfile({...profile, address: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="12 Rue de la Paix"
                  required
                />
              </div>

              {/* Ville */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  🏙️ Ville *
                </label>
                <input 
                  type="text" 
                  value={profile.city} 
                  onChange={(e) => setProfile({...profile, city: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Paris"
                  required
                />
              </div>

              {/* Code Postal */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  📮 Code Postal *
                </label>
                <input 
                  type="text" 
                  value={profile.postal_code} 
                  onChange={(e) => setProfile({...profile, postal_code: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="75001"
                  maxLength={5}
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  📝 Description
                </label>
                <textarea 
                  value={profile.description} 
                  onChange={(e) => setProfile({...profile, description: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  rows={6}
                  placeholder="Présentez votre établissement en quelques lignes..."
                />
              </div>
            </div>
          </div>

          {/* Bouton Sauvegarder - Pleine largeur en bas */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <button 
              onClick={handleSave}
              disabled={saving}
              className="w-full bg-indigo-600 text-white py-4 rounded-lg font-semibold text-lg hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              {saving ? "⏳ Sauvegarde en cours..." : "💾 Sauvegarder les modifications"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
