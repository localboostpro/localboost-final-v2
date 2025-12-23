import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function Admin() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('business_profile')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (err) {
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateSubscription = async (userId, newPlan) => {
    try {
      const { error } = await supabase
        .from('business_profile')
        .update({ subscription_plan: newPlan })
        .eq('user_id', userId);

      if (error) throw error;
      
      // Rafraîchir la liste
      fetchUsers();
      alert('✅ Forfait mis à jour');
    } catch (err) {
      console.error('Erreur:', err);
      alert('❌ Erreur lors de la mise à jour');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">🔐 Administration</h1>
      
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Nom</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Forfait</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {users.map(user => (
              <tr key={user.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 text-sm">{user.name || 'Sans nom'}</td>
                <td className="px-6 py-4 text-sm">{user.email || 'N/A'}</td>
                <td className="px-6 py-4 text-sm">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    user.subscription_plan === 'pro' ? 'bg-purple-100 text-purple-700' :
                    user.subscription_plan === 'premium' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {user.subscription_plan || 'free'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm">
                  <select
                    value={user.subscription_plan || 'free'}
                    onChange={(e) => updateSubscription(user.user_id, e.target.value)}
                    className="border rounded px-2 py-1 text-sm"
                  >
                    <option value="free">Free</option>
                    <option value="pro">Pro</option>
                    <option value="premium">Premium</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {users.length === 0 && (
        <div className="text-center py-12 text-slate-500">
          Aucun utilisateur trouvé
        </div>
      )}
    </div>
  );
}
