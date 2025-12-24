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
          website: profile.website,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      alert("✅ Profil sauvegardé avec succès !");
    } catch (err) {
      console.error("Erreur:", err);
      alert("❌ Erreur lors de la sauvegarde : " + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Mon Profil</h1>
      
      <div className="bg-white rounded-lg shadow p-6 space-y-6">
        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <input 
            type="email" 
            value={profile.email} 
            disabled
            className="w-full p-3 border rounded-lg bg-gray-100 cursor-not-allowed"
          />
        </div>

        {/* Nom de l'établissement */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nom de l'établissement *
          </label>
          <input 
            type="text" 
            value={profile.name} 
            onChange={(e) => setProfile({...profile, name: e.target.value})}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            placeholder="Mon Restaurant"
          />
        </div>

        {/* SIRET */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            SIRET *
          </label>
          <input 
            type="text" 
            value={profile.siret} 
            onChange={(e) => setProfile({...profile, siret: e.target.value})}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            placeholder="123 456 789 00012"
            maxLength={14}
          />
        </div>

        {/* Téléphone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Téléphone *
          </label>
          <input 
            type="tel" 
            value={profile.phone} 
            onChange={(e) => setProfile({...profile, phone: e.target.value})}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            placeholder="01 23 45 67 89"
          />
        </div>

        {/* Adresse */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Adresse *
          </label>
          <input 
            type="text" 
            value={profile.address} 
            onChange={(e) => setProfile({...profile, address: e.target.value})}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            placeholder="123 rue de la Paix"
          />
        </div>

        {/* Ville et Code Postal */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ville *
            </label>
            <input 
              type="text" 
              value={profile.city} 
              onChange={(e) => setProfile({...profile, city: e.target.value})}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder="Paris"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Code Postal *
            </label>
            <input 
              type="text" 
              value={profile.postal_code} 
              onChange={(e) => setProfile({...profile, postal_code: e.target.value})}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder="75001"
              maxLength={5}
            />
          </div>
        </div>

        {/* Site Web */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Site Web
          </label>
          <input 
            type="url" 
            value={profile.website} 
            onChange={(e) => setProfile({...profile, website: e.target.value})}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            placeholder="https://www.monsite.fr"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea 
            value={profile.description} 
            onChange={(e) => setProfile({...profile, description: e.target.value})}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            rows={4}
            placeholder="Décrivez votre établissement..."
          />
        </div>

        {/* Bouton Sauvegarder */}
        <button 
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? "⏳ Sauvegarde..." : "💾 Sauvegarder"}
        </button>
      </div>
    </div>
  );
}
