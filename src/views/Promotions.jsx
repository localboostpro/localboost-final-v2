import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { Ticket, Plus, Trash2, Calendar, Loader } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Promotions() {
  const { profile, promotions, refreshPromotions, loading } = useData();
  const [showForm, setShowForm] = useState(false);
  const [newPromo, setNewPromo] = useState({
    title: '',
    description: '',
    discount_value: '',
    valid_until: '',
  });
  const [saving, setSaving] = useState(false);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!profile?.id) return;

    try {
      setSaving(true);
      const { error } = await supabase.from('promotions').insert({
        business_id: profile.id,
        title: newPromo.title,
        description: newPromo.description,
        discount_value: newPromo.discount_value,
        valid_until: newPromo.valid_until,
      });

      if (error) throw error;

      await refreshPromotions(profile.id);
      setNewPromo({ title: '', description: '', discount_value: '', valid_until: '' });
      setShowForm(false);
    } catch (e) {
      console.error('Erreur création promo:', e);
      alert('Erreur lors de la création');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (promoId) => {
    if (!confirm('Supprimer cette promotion ?')) return;

    try {
      const { error } = await supabase.from('promotions').delete().eq('id', promoId);
      if (error) throw error;
      await refreshPromotions(profile.id);
    } catch (e) {
      console.error('Erreur suppression:', e);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader className="animate-spin w-12 h-12 text-indigo-600" />
      </div>
    );
  }

  const promoList = promotions || [];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-[2.5rem] p-8 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-orange-100 p-3 rounded-xl">
                <Ticket className="w-6 h-6 text-orange-600" />
              </div>
              <h1 className="text-4xl font-black text-slate-900">Offres & Promos</h1>
            </div>
            <p className="text-slate-600 ml-16">Créez des offres attractives</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-indigo-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-indigo-700 transition-colors flex items-center gap-2"
          >
            <Plus size={18} />
            Nouvelle offre
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white rounded-[2.5rem] p-8 shadow-lg">
          <h2 className="text-2xl font-black text-slate-900 mb-6">Créer une promotion</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Titre</label>
              <input
                type="text"
                value={newPromo.title}
                onChange={(e) => setNewPromo({ ...newPromo, title: e.target.value })}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                required
                placeholder="-20% sur tous les produits"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
              <textarea
                value={newPromo.description}
                onChange={(e) => setNewPromo({ ...newPromo, description: e.target.value })}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                rows="3"
                placeholder="Détails de l'offre..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Réduction (%)</label>
                <input
                  type="number"
                  value={newPromo.discount_value}
                  onChange={(e) => setNewPromo({ ...newPromo, discount_value: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  min="0"
                  max="100"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Valable jusqu'au</label>
                <input
                  type="date"
                  value={newPromo.valid_until}
                  onChange={(e) => setNewPromo({ ...newPromo, valid_until: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                {saving ? 'Création...' : 'Créer l\'offre'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-6 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-[2.5rem] p-8 shadow-lg">
        <h2 className="text-2xl font-black text-slate-900 mb-6">Promotions actives</h2>
        {promoList.length === 0 ? (
          <p className="text-slate-500 text-center py-8">Aucune promotion pour le moment</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {promoList.map((promo) => (
              <div key={promo.id} className="border border-slate-200 rounded-xl p-6 hover:border-indigo-300 transition-colors relative">
                <button
                  onClick={() => handleDelete(promo.id)}
                  className="absolute top-4 right-4 p-2 text-rose-600 hover:bg-rose-50 rounded-lg"
                >
                  <Trash2 size={18} />
                </button>

                <div className="mb-4">
                  <span className="inline-block bg-orange-100 text-orange-700 text-xs font-bold px-3 py-1 rounded-full">
                    -{promo.discount_value}%
                  </span>
                </div>

                <h3 className="font-black text-lg text-slate-900 mb-2">{promo.title}</h3>
                {promo.description && (
                  <p className="text-sm text-slate-600 mb-3">{promo.description}</p>
                )}

                {promo.valid_until && (
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Calendar size={14} />
                    Valable jusqu'au {new Date(promo.valid_until).toLocaleDateString('fr-FR')}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
