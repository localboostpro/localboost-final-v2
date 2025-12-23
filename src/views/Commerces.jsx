import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function Commerces() {
  const [commerces, setCommerces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadCommerces();
  }, []);

  async function loadCommerces() {
    try {
      console.log('Chargement des commerces...');
      
      const { data, error } = await supabase
        .from('commerces')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur Supabase:', error);
        setError(error.message);
        return;
      }

      console.log('Commerces chargés:', data);
      setCommerces(data || []);
    } catch (err) {
      console.error('Erreur:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des commerces...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-red-800 font-bold text-xl mb-2">Erreur</h2>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Commerces Partenaires
        </h1>
        <p className="mt-2 text-gray-600">
          {commerces.length} commerce{commerces.length > 1 ? 's' : ''} inscrit{commerces.length > 1 ? 's' : ''}
        </p>
      </div>

      {commerces.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500 text-lg">Aucun commerce inscrit pour le moment</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {commerces.map((commerce) => (
            <div
              key={commerce.id}
              className="bg-white rounded-lg shadow-md p-6"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {commerce.nom}
              </h3>
              <p className="text-sm text-gray-600">{commerce.adresse}</p>
              <p className="text-xs text-gray-400 mt-4">
                Inscrit le {new Date(commerce.created_at).toLocaleDateString('fr-FR')}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
