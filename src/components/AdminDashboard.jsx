import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function AdminDashboard({ user }) {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    loadBusinesses();
  }, []);

  async function loadBusinesses() {
    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Erreur:', error);
    } else {
      setBusinesses(data || []);
    }
    setLoading(false);
  }

  async function handleDelete(id) {
    if (!confirm('Supprimer cette entreprise ?')) return;
    
    const { error } = await supabase
      .from('businesses')
      .delete()
      .eq('id', id);
    
    if (error) {
      alert('Erreur: ' + error.message);
    } else {
      loadBusinesses();
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Admin Dashboard
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Connecté: {user.email}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
              >
                ➕ Ajouter une entreprise
              </button>
              <button
                onClick={() => supabase.auth.signOut()}
                className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold"
              >
                Se déconnecter
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-500 text-sm font-medium">Total Entreprises</h3>
            <p className="text-3xl font-bold text-blue-600 mt-2">{businesses.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-500 text-sm font-medium">Actives</h3>
            <p className="text-3xl font-bold text-green-600 mt-2">
              {businesses.filter(b => b.status === 'active').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-500 text-sm font-medium">En attente</h3>
            <p className="text-3xl font-bold text-orange-600 mt-2">
              {businesses.filter(b => b.status === 'pending').length}
            </p>
          </div>
        </div>

        {/* Liste des entreprises */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Entreprise
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Catégorie
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Ville
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {businesses.map((business) => (
                <tr key={business.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{business.name}</div>
                    <div className="text-sm text-gray-500">{business.phone}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {business.category}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {business.city}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      business.status === 'active' 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-orange-100 text-orange-800'
                    }`}>
                      {business.status === 'active' ? 'Active' : 'En attente'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm space-x-2">
                    <button className="text-blue-600 hover:text-blue-800 font-medium">
                      Modifier
                    </button>
                    <button 
                      onClick={() => handleDelete(business.id)}
                      className="text-red-600 hover:text-red-800 font-medium"
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {businesses.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">Aucune entreprise pour le moment</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
