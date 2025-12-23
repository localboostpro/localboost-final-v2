import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function Customers() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadClients();
  }, []);

  async function loadClients() {
    try {
      const { data: avisData, error } = await supabase
        .from('avis')
        .select('nom_client, email_client, note, created_at')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Grouper par client
      const clientsMap = {};
      
      (avisData || []).forEach(avis => {
        const key = avis.email_client;
        if (!clientsMap[key]) {
          clientsMap[key] = {
            nom: avis.nom_client,
            email: avis.email_client,
            total_avis: 0,
            somme_notes: 0,
            dernier_avis: avis.created_at
          };
        }
        clientsMap[key].total_avis++;
        clientsMap[key].somme_notes += avis.note;
        if (new Date(avis.created_at) > new Date(clientsMap[key].dernier_avis)) {
          clientsMap[key].dernier_avis = avis.created_at;
        }
      });

      const clientsList = Object.values(clientsMap).map(client => ({
        ...client,
        note_moyenne: (client.somme_notes / client.total_avis).toFixed(1)
      }));

      setClients(clientsList);
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
        <h1 className="text-3xl font-bold text-gray-900">Clients Actifs</h1>
        <p className="mt-2 text-gray-600">{clients.length} clients ont laissé des avis</p>
      </div>

      {clients.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500">Aucun client</p>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nb d'avis</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Note moyenne</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dernier avis</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {clients.map((client, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{client.nom}</div>
                    <div className="text-sm text-gray-500">{client.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{client.total_avis} avis</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-yellow-400">★</span>
                      <span className="ml-1 text-sm text-gray-900">{client.note_moyenne}/5</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {new Date(client.dernier_avis).toLocaleDateString('fr-FR')}
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
