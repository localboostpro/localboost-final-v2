import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Save, Globe, Facebook, Instagram, MapPin, Phone, Mail } from 'lucide-react';

export default function Profile({ user, profile, setProfile }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    phone: '',
    website: '',
    facebook_url: '',
    instagram_url: '',
    google_url: '',
    city: ''
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        description: profile.description || '',
        address: profile.address || '',
        phone: profile.phone || '',
        website: profile.website || '',
        facebook_url: profile.facebook_url || '',
        instagram_url: profile.instagram_url || '',
        google_url: profile.google_url || '',
        city: profile.city || ''
      });
    }
  }, [profile]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('business_profile')
        .update(formData)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      setProfile(data);
      alert('Profil mis à jour avec succès !');
    } catch (error) {
      alert('Erreur lors de la mise à jour : ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-10">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-black text-slate-900">Configuration du Profil</h1>
        <div className="px-4 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold uppercase tracking-widest">
          Plan : {profile?.plan || 'Gratuit'}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2 bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
          <h3 className="font-bold text-lg flex items-center gap-2 text-indigo-600">
            <Globe size={20}/> Informations Générales
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase mb-2">Nom de l'établissement</label>
              <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-3 bg-slate-50 border-none rounded-xl focus:ring-2 ring-indigo-500" required />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase mb-2">Ville</label>
              <input type="text" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="w-full p-3 bg-slate-50 border-none rounded-xl focus:ring-2 ring-indigo-500" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase mb-2">Description / Bio IA</label>
            <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full p-3 bg-slate-50 border-none rounded-xl h-32 focus:ring-2 ring-indigo-500" placeholder="Décrivez votre activité..." />
          </div>
        </div>

        {/* Réseaux Sociaux */}
        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
          <h3 className="font-bold text-lg flex items-center gap-2 text-pink-600">
            <Instagram size={20}/> Réseaux Sociaux
          </h3>
          <div className="space-y-3">
            <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl">
              <Facebook className="text-blue-600" size={18}/>
              <input type="text" placeholder="URL Facebook" value={formData.facebook_url} onChange={e => setFormData({...formData, facebook_url: e.target.value})} className="bg-transparent border-none w-full focus:ring-0 text-sm" />
            </div>
            <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl">
              <Instagram className="text-pink-600" size={18}/>
              <input type="text" placeholder="URL Instagram" value={formData.instagram_url} onChange={e => setFormData({...formData, instagram_url: e.target.value})} className="bg-transparent border-none w-full focus:ring-0 text-sm" />
            </div>
            <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl">
              <MapPin className="text-red-500" size={18}/>
              <input type="text" placeholder="Lien Google Maps (Avis)" value={formData.google_url} onChange={e => setFormData({...formData, google_url: e.target.value})} className="bg-transparent border-none w-full focus:ring-0 text-sm" />
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
          <h3 className="font-bold text-lg flex items-center gap-2 text-emerald-600">
            <Phone size={20}/> Contact & Web
          </h3>
          <div className="space-y-3">
            <input type="text" placeholder="Téléphone" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full p-3 bg-slate-50 border-none rounded-xl text-sm" />
            <input type="text" placeholder="Site Web" value={formData.website} onChange={e => setFormData({...formData, website: e.target.value})} className="w-full p-3 bg-slate-50 border-none rounded-xl text-sm" />
          </div>
        </div>

        <div className="md:col-span-2 flex justify-end">
          <button type="submit" disabled={loading} className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200">
            {loading ? 'Enregistrement...' : <><Save size={20}/> Sauvegarder les modifications</>}
          </button>
        </div>
      </form>
    </div>
  );
}
