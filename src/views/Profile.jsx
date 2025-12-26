import React, { useState, useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import { User, Save, Loader } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Profile({ user }) {
  const { profile, setProfile } = useData();
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData(profile);
    }
  }, [profile]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!profile?.id) return;

    try {
      setLoading(true);
      setSuccess(false);

      const { error } = await supabase
        .from('business_profile')
        .update(formData)
        .eq('id', profile.id);

      if (error) throw error;

      setProfile({ ...formData, email: user.email });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (e) {
      console.error('Erreur mise à jour:', e);
      alert('Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-[2.5rem] p-8 shadow-lg">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-indigo-100 p-3 rounded-xl">
            <User className="w-6 h-6 text-indigo-600" />
          </div>
          <h1 className="text-4xl font-black text-slate-900">Mon Établissement</h1>
        </div>
        <p className="text-slate-600 ml-16">Gérez les informations de votre commerce</p>
      </div>

      {/* Formulaire */}
      <form onSubmit={handleSubmit} className="bg-white rounded-[2.5rem] p-8 shadow-lg space-y-6">
        {/* Informations légales */}
        <div>
          <h2 className="text-xl font-black text-slate-900 mb-4">Informations légales</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Nom de l'établissement *</label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">SIRET</label>
              <input
                type="text"
                value={formData.siret || ''}
                onChange={(e) => setFormData({ ...formData, siret: e.target.value })}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Contact */}
        <div>
          <h2 className="text-xl font-black text-slate-900 mb-4">Contact</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Téléphone</label>
              <input
                type="tel"
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Email</label>
              <input
                type="email"
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Site web</label>
              <input
                type="url"
                value={formData.website || ''}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Adresse */}
        <div>
          <h2 className="text-xl font-black text-slate-900 mb-4">Localisation</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Adresse</label>
              <input
                type="text"
                value={formData.address || ''}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Ville</label>
                <input
                  type="text"
                  value={formData.city || ''}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Code postal</label>
                <input
                  type="text"
                  value={formData.zip_code || ''}
                  onChange={(e) => setFormData({ ...formData, zip_code: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <div>
          <h2 className="text-xl font-black text-slate-900 mb-4">Présentation</h2>
          <textarea
            value={formData.description || ''}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
            rows="4"
            placeholder="Décrivez votre établissement..."
          />
        </div>

        {/* Réseaux sociaux */}
        <div>
          <h2 className="text-xl font-black text-slate-900 mb-4">Réseaux sociaux</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Facebook</label>
              <input
                type="url"
                value={formData.facebook_url || ''}
                onChange={(e) => setFormData({ ...formData, facebook_url: e.target.value })}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                placeholder="https://facebook.com/..."
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Instagram</label>
              <input
                type="url"
                value={formData.instagram_url || ''}
                onChange={(e) => setFormData({ ...formData, instagram_url: e.target.value })}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                placeholder="https://instagram.com/..."
              />
            </div>
          </div>
        </div>

        {/* Boutons */}
        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-indigo-600 text-white font-bold py-4 rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader className="animate-spin" size={18} />
                Sauvegarde...
              </>
            ) : (
              <>
                <Save size={18} />
                Enregistrer les modifications
              </>
            )}
          </button>
        </div>

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-center font-bold">
            ✅ Modifications enregistrées avec succès !
          </div>
        )}
      </form>
    </div>
  );
}
