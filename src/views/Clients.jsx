import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Users, Mail, Calendar, MessageSquare } from 'lucide-react';

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadClients();
  }, []);

  async function loadClients() {
    try {
      // Récupérer tous les avis avec les infos clients
      const { data: avisData, error: avisError } = await supabase
        .from('avis')
        .select('*')
        .order('created_at', { ascending: false });

      if (avisError) throw avisError;

      // Grouper par email client
      const clientsMap = {};
      
      (avisData || []).forEach(avis => {
        const email = avis.email || 'Anonyme';
        
        if (!clientsMap[email]) {
          clientsMap[email] = {
            email: email,
            nom: avis.nom || 'Client anonyme',
            avis: [],
            total_avis: 0,
            note_moyenne: 0,
            dernier_avis: avis.created_at
          };
        }
        
        clientsMap[email].avis.push(avis);
        clientsMap[email].total_avis++;
        
        // Mettre à jour la date du dernier avis
        if (new Date(avis.created_at) > new Date(clientsMap[email].dernier_avis)) {
          clientsMap[email].dernier_avis = avis.created_at;
        }
      });

      // Calculer les moyennes
      const clientsList = Object.values(clientsMap).map(client => ({
        ...client,
        note_moyenne: (
          client.avis.reduce((sum, a) => sum + (a.note || 0), 0) / client.total_avis
        ).toFixed(1)
      }));

      // Trier par nombre d'avis décroissant
      clientsList.sort((a, b) => b.total_avis - a.total_avis);

      setClients(clientsList);
    } catch (error) {
      console.error('Erreur chargement clients:', error);
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* En-tête */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Users className="w-8 h-8 text-blue-600" />
          Clients
        </h1>
        <p className="mt-2 text-gray-600">
          {clients.length} client{clients.length > 1 ? 's' : ''} ayant laissé un avis
        </p>
      </div>

      {/* Liste des clients */}
      {clients.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">Aucun client pour le moment</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avis
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Note moyenne
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dernier avis
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {clients.map((client, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Users className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {client.nom}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {client.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-gray-900">
                        {client.total_avis} avis
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-400">★</span>
                      <span className="text-sm font-medium text-gray-900">
                        {client.note_moyenne} / 5
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
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
