import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export default function Profile({ user }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

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
        setProfile(data || { name: "Nouveau compte", email: user.email });
      } catch (err) {
        console.error("Erreur:", err);
        alert("Erreur de chargement du profil");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user]);

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
      
      <div className="bg-white rounded-lg shadow p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input 
              type="email" 
              value={user?.email || ""} 
              disabled
              className="w-full p-3 border rounded-lg bg-gray-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nom de l'établissement
            </label>
            <input 
              type="text" 
              value={profile?.name || ""} 
              onChange={(e) => setProfile({...profile, name: e.target.value})}
              className="w-full p-3 border rounded-lg"
              placeholder="Mon Restaurant"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Téléphone
            </label>
            <input 
              type="tel" 
              value={profile?.phone || ""} 
              onChange={(e) => setProfile({...profile, phone: e.target.value})}
              className="w-full p-3 border rounded-lg"
              placeholder="01 23 45 67 89"
            />
          </div>

          <button 
            onClick={async () => {
              try {
                const { error } = await supabase
                  .from("business_profile")
                  .upsert({
                    user_id: user.id,
                    name: profile.name,
                    phone: profile.phone,
                    email: user.email
                  });

                if (error) throw error;
                alert("✅ Profil sauvegardé !");
              } catch (err) {
                console.error(err);
                alert("❌ Erreur lors de la sauvegarde");
              }
            }}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition"
          >
            💾 Sauvegarder
          </button>
        </div>
      </div>
    </div>
  );
}
