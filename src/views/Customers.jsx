import { useState, useEffect } from 'react';
import { Users, Mail, Phone, Star, Calendar, Plus, Edit2, Trash2, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useData } from '../contexts/DataContext';

export default function Customers() {
  const { profile } = useData();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    notes: '',
    tags: '',
    total_spent: 0,
    visit_count: 0
  });

  useEffect(() => {
    if (profile?.id) {
      loadCustomers();
    }
  }, [profile]);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('business_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setCustomers(data || []);
    } catch (error) {
      console.error('❌ Erreur chargement clients:', error);
      alert('Erreur lors du chargement des clients');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (customer = null) => {
    if (customer) {
      setEditingCustomer(customer);
      setFormData({
        name: customer.name || '',
        email: customer.email || '',
        phone: customer.phone || '',
        address: customer.address || '',
        notes: customer.notes || '',
        tags: customer.tags || '',
        total_spent: customer.total_spent || 0,
        visit_count: customer.visit_count || 0
      });
    } else {
      setEditingCustomer(null);
      setFormData({
        name: '',
        email: '',
        phone: '',
        address: '',
        notes: '',
        tags: '',
        total_spent: 0,
        visit_count: 0
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingCustomer(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      notes: '',
      tags: '',
      total_spent: 0,
      visit_count: 0
    });
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.email) {
      alert('⚠️ Nom et email obligatoires');
      return;
    }

    try {
      setLoading(true);

      if (editingCustomer) {
        // Mise à jour
        const { error } = await supabase
          .from('customers')
          .update({
            ...formData,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingCustomer.id);

        if (error) throw error;
        alert('✅ Client modifié avec succès');
      } else {
        // Création
        const { error } = await supabase
          .from('customers')
          .insert([{
            ...formData,
            business_id: profile.id
          }]);

        if (error) throw error;
        alert('✅ Client ajouté avec succès');
      }

      closeModal();
      loadCustomers();
    } catch (error) {
      console.error('❌ Erreur sauvegarde client:', error);
      alert('❌ Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (customerId) => {
    if (!confirm('⚠️ Supprimer ce client ?')) return;

    try {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', customerId);

      if (error) throw error;

      alert('✅ Client supprimé');
      loadCustomers();
    } catch (error) {
      console.error('❌ Erreur suppression:', error);
      alert('❌ Erreur lors de la suppression');
    }
  };

  if (loading && customers.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
            <Users className="text-indigo-600" size={32} />
            Fichier Clients
          </h1>
          <p className="text-slate-600 mt-2">
            Gérez votre base de données clients
          </p>
        </div>
        <button
          onClick={() => openModal()}
          className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-lg"
        >
          <Plus size={20} />
          Nouveau client
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-3 rounded-xl">
              <Users className="text-blue-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-600">Total clients</p>
              <p className="text-2xl font-black text-slate-900">{customers.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 p-3 rounded-xl">
              <Star className="text-green-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-600">Clients actifs</p>
              <p className="text-2xl font-black text-slate-900">
                {customers.filter(c => c.visit_count > 0).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center gap-3">
            <div className="bg-purple-100 p-3 rounded-xl">
              <Calendar className="text-purple-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-600">Ce mois-ci</p>
              <p className="text-2xl font-black text-slate-900">
                {customers.filter(c => {
                  const createdAt = new Date(c.created_at);
                  const now = new Date();
                  return createdAt.getMonth() === now.getMonth() && 
                         createdAt.getFullYear() === now.getFullYear();
                }).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Liste des clients */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {customers.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <Users size={48} className="mx-auto mb-4 opacity-20" />
            <p className="text-lg font-bold">Aucun client pour le moment</p>
            <p className="text-sm mt-2">Ajoutez votre premier client pour commencer</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase">Client</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase">Contact</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase">Visites</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase">Dépenses</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-slate-700 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {customers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                          <span className="text-indigo-600 font-bold">
                            {customer.name?.[0]?.toUpperCase() || '?'}
                          </span>
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{customer.name}</div>
                          {customer.tags && (
                            <div className="flex gap-1 mt-1">
                              {customer.tags.split(',').map((tag, i) => (
                                <span key={i} className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                                  {tag.trim()}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <Mail size={14} className="text-slate-400" />
                          <span className="text-slate-700">{customer.email}</span>
                        </div>
                        {customer.phone && (
                          <div className="flex items-center gap-2 text-sm">
                            <Phone size={14} className="text-slate-400" />
                            <span className="text-slate-700">{customer.phone}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-slate-900 font-medium">{customer.visit_count || 0}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-slate-900 font-bold">{customer.total_spent || 0}€</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openModal(customer)}
                          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(customer.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Ajout/Modification */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black text-slate-900">
                {editingCustomer ? 'Modifier le client' : 'Nouveau client'}
              </h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Nom complet *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Jean Dupont"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="jean@exemple.fr"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="06 12 34 56 78"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Adresse
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="123 Rue Example"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Nombre de visites
                  </label>
                  <input
                    type="number"
                    value={formData.visit_count}
                    onChange={(e) => setFormData({...formData, visit_count: parseInt(e.target.value) || 0})}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Total dépensé (€)
                  </label>
                  <input
                    type="number"
                    value={formData.total_spent}
                    onChange={(e) => setFormData({...formData, total_spent: parseFloat(e.target.value) || 0})}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Tags (séparés par des virgules)
                  </label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({...formData, tags: e.target.value})}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="VIP, Régulier, Premium"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    rows={3}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Informations complémentaires..."
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={closeModal}
                  className="flex-1 bg-slate-200 text-slate-700 py-3 rounded-xl font-bold hover:bg-slate-300 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
