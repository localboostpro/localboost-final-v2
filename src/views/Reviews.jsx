import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function Reviews() {
  const [avis, setAvis] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAvis();
  }, []);

  async function loadAvis() {
    try {
      const { data, error } = await supabase
        .from('avis')
        .select(`
          *,
          commerce:commerces(nom)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAvis(data || []);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Tous les Avis</h1>
        <p className="mt-2 text-gray-600">{avis.length} avis au total</p>
      </div>

      {avis.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500">Aucun avis</p>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Commerce</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Note</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Commentaire</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {avis.map((avisItem) => (
                <tr key={avisItem.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {avisItem.commerce?.nom || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{avisItem.nom_client}</div>
                    <div className="text-sm text-gray-500">{avisItem.email_client}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-yellow-400 text-lg">{'★'.repeat(avisItem.note)}</span>
                      <span className="ml-2 text-sm text-gray-600">{avisItem.note}/5</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs truncate">
                      {avisItem.commentaire || 'Pas de commentaire'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {new Date(avisItem.created_at).toLocaleDateString('fr-FR')}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
