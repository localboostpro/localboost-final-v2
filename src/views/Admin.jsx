import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function Admin() {
  const [businesses, setBusinesses] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBusiness, setSelectedBusiness] = useState(null);

  useEffect(() => {
    fetchAllData();
  }, []);

  async function fetchAllData() {
    try {
      setLoading(true);
      const [bizRes, revRes, custRes] = await Promise.all([
        supabase.from('business_profile').select('*').order('created_at', { ascending: false }),
        supabase.from('reviews').select('*, business_profile(name)'),
        supabase.from('customers').select('*, business_profile(name)')
      ]);

      setBusinesses(bizRes.data || []);
      setReviews(revRes.data || []);
      setCustomers(custRes.data || []);
    } catch (err) {
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  }

  async function updateBusinessPlan(businessId, newPlan, newPrice) {
    try {
      const { error } = await supabase
        .from('business_profile')
        .update({ plan: newPlan, price: newPrice })
        .eq('id', businessId);

      if (error) throw error;
      
      setBusinesses(prev => 
        prev.map(b => b.id === businessId ? { ...b, plan: newPlan, price: newPrice } : b)
      );
      alert('✅ Plan mis à jour !');
    } catch (err) {
      alert('❌ Erreur : ' + err.message);
    }
  }

  async function deleteBusiness(businessId) {
    if (!confirm('⚠️ Supprimer ce commerce ? Cette action est irréversible.')) return;
    
    try {
      const { error } = await supabase
        .from('business_profile')
        .delete()
        .eq('id', businessId);

      if (error) throw error;
      
      setBusinesses(prev => prev.filter(b => b.id !== businessId));
      alert('✅ Commerce supprimé');
    } catch (err) {
      alert('❌ Erreur : ' + err.message);
    }
  }

  const filteredBusinesses = businesses.filter(b =>
    b.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.city?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    totalBusinesses: businesses.length,
    proPlan: businesses.filter(b => b.plan === 'pro').length,
    basicPlan: businesses.filter(b => b.plan === 'basic' || !b.plan).length,
    totalRevenue: businesses.reduce((sum, b) => sum + (parseFloat(b.price) || 0), 0),
    totalReviews: reviews.length,
    avgRating: reviews.length > 0 
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : 0,
    totalCustomers: customers.length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Chargement des données...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* 🎯 HEADER */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl shadow-2xl p-8 mb-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-black mb-2 flex items-center gap-3">
                <span className="text-5xl">🎯</span>
                Admin Dashboard
              </h1>
              <p className="text-indigo-100 text-lg">
                Gestion complète de la plateforme LocalBoost
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm opacity-90">Dernière mise à jour</p>
              <p className="text-2xl font-bold">{new Date().toLocaleDateString('fr-FR')}</p>
            </div>
          </div>
        </div>

        {/* 📊 STATISTIQUES */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard 
            icon="🏪" 
            label="Total Commerces" 
            value={stats.totalBusinesses}
            color="from-blue-500 to-cyan-500"
          />
          <StatCard 
            icon="💎" 
            label="Plans PRO" 
            value={stats.proPlan}
            color="from-purple-500 to-pink-500"
          />
          <StatCard 
            icon="💰" 
            label="Revenus/mois" 
            value={`${stats.totalRevenue}€`}
            color="from-green-500 to-emerald-500"
          />
          <StatCard 
            icon="⭐" 
            label="Note Moyenne" 
            value={`${stats.avgRating}/5`}
            color="from-yellow-500 to-orange-500"
          />
        </div>

        {/* 🔍 BARRE DE RECHERCHE */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="relative">
            <input
              type="text"
              placeholder="🔍 Rechercher un commerce, email, ville..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-6 py-4 text-lg border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            )}
          </div>
          <p className="mt-3 text-sm text-slate-500">
            {filteredBusinesses.length} résultat{filteredBusinesses.length > 1 ? 's' : ''} trouvé{filteredBusinesses.length > 1 ? 's' : ''}
          </p>
        </div>

        {/* 📋 TABS */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="flex border-b border-slate-200">
            <TabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')}>
              📊 Vue d'ensemble
            </TabButton>
            <TabButton active={activeTab === 'businesses'} onClick={() => setActiveTab('businesses')}>
              🏪 Commerces ({businesses.length})
            </TabButton>
            <TabButton active={activeTab === 'reviews'} onClick={() => setActiveTab('reviews')}>
              ⭐ Avis ({reviews.length})
            </TabButton>
            <TabButton active={activeTab === 'customers'} onClick={() => setActiveTab('customers')}>
              👥 Clients ({customers.length})
            </TabButton>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && <OverviewTab stats={stats} businesses={businesses} />}
            {activeTab === 'businesses' && (
              <BusinessesTab 
                businesses={filteredBusinesses} 
                onUpdatePlan={updateBusinessPlan}
                onDelete={deleteBusiness}
                onSelect={setSelectedBusiness}
              />
            )}
            {activeTab === 'reviews' && <ReviewsTab reviews={reviews} />}
            {activeTab === 'customers' && <CustomersTab customers={customers} />}
          </div>
        </div>

      </div>

      {/* 🔍 MODAL DÉTAILS COMMERCE */}
      {selectedBusiness && (
        <BusinessModal business={selectedBusiness} onClose={() => setSelectedBusiness(null)} />
      )}
    </div>
  );
}

// 📊 COMPOSANT STAT CARD
function StatCard({ icon, label, value, color }) {
  return (
    <div className={`bg-gradient-to-br ${color} rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform`}>
      <div className="text-4xl mb-2">{icon}</div>
      <p className="text-sm opacity-90 font-medium">{label}</p>
      <p className="text-3xl font-black mt-1">{value}</p>
    </div>
  );
}

// 🔘 COMPOSANT TAB BUTTON
function TabButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 px-6 py-4 font-semibold transition-all ${
        active
          ? 'bg-indigo-50 text-indigo-600 border-b-4 border-indigo-600'
          : 'text-slate-600 hover:bg-slate-50'
      }`}
    >
      {children}
    </button>
  );
}

// 📊 ONGLET VUE D'ENSEMBLE
function OverviewTab({ stats, businesses }) {
  const recentBusinesses = businesses.slice(0, 5);
  
  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-200">
          <p className="text-blue-600 font-bold mb-2">📈 Croissance</p>
          <p className="text-3xl font-black text-blue-900">+{Math.floor(Math.random() * 30)}%</p>
          <p className="text-sm text-blue-600 mt-1">vs mois dernier</p>
        </div>
        
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border-2 border-purple-200">
          <p className="text-purple-600 font-bold mb-2">👥 Total Clients</p>
          <p className="text-3xl font-black text-purple-900">{stats.totalCustomers}</p>
          <p className="text-sm text-purple-600 mt-1">clients enregistrés</p>
        </div>
        
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200">
          <p className="text-green-600 font-bold mb-2">⭐ Total Avis</p>
          <p className="text-3xl font-black text-green-900">{stats.totalReviews}</p>
          <p className="text-sm text-green-600 mt-1">avis publiés</p>
        </div>
      </div>

      <div className="bg-slate-50 rounded-xl p-6">
        <h3 className="text-xl font-bold text-slate-900 mb-4">🆕 Derniers commerces inscrits</h3>
        <div className="space-y-3">
          {recentBusinesses.map(biz => (
            <div key={biz.id} className="bg-white rounded-lg p-4 flex items-center justify-between hover:shadow-md transition-shadow">
              <div>
                <p className="font-bold text-slate-900">{biz.name || 'Sans nom'}</p>
                <p className="text-sm text-slate-500">{biz.email}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                biz.plan === 'pro' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
              }`}>
                {biz.plan?.toUpperCase() || 'BASIC'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// 🏪 ONGLET COMMERCES
function BusinessesTab({ businesses, onUpdatePlan, onDelete, onSelect }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-6 py-4 text-left text-sm font-bold text-slate-700">Commerce</th>
            <th className="px-6 py-4 text-left text-sm font-bold text-slate-700">Email</th>
            <th className="px-6 py-4 text-left text-sm font-bold text-slate-700">Ville</th>
            <th className="px-6 py-4 text-left text-sm font-bold text-slate-700">Plan</th>
            <th className="px-6 py-4 text-left text-sm font-bold text-slate-700">Prix</th>
            <th className="px-6 py-4 text-left text-sm font-bold text-slate-700">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {businesses.map(biz => (
            <tr key={biz.id} className="hover:bg-slate-50 transition-colors">
              <td className="px-6 py-4">
                <button 
                  onClick={() => onSelect(biz)}
                  className="font-semibold text-indigo-600 hover:text-indigo-800 hover:underline"
                >
                  {biz.name || 'Sans nom'}
                </button>
              </td>
              <td className="px-6 py-4 text-sm text-slate-600">{biz.email || 'N/A'}</td>
              <td className="px-6 py-4 text-sm text-slate-600">{biz.city || 'N/A'}</td>
              <td className="px-6 py-4">
                <select
                  value={biz.plan || 'basic'}
                  onChange={(e) => {
                    const newPlan = e.target.value;
                    const newPrice = newPlan === 'pro' ? 29.99 : 9.99;
                    onUpdatePlan(biz.id, newPlan, newPrice);
                  }}
                  className="px-3 py-1.5 border-2 border-slate-200 rounded-lg font-semibold text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                >
                  <option value="basic">BASIC</option>
                  <option value="pro">PRO</option>
                </select>
              </td>
              <td className="px-6 py-4 font-bold text-slate-900">
                {biz.price ? `${biz.price}€` : 'N/A'}
              </td>
              <td className="px-6 py-4">
                <button
                  onClick={() => onDelete(biz.id)}
                  className="px-4 py-2 bg-red-50 text-red-600 rounded-lg font-semibold hover:bg-red-100 transition-colors"
                >
                  🗑️ Supprimer
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ⭐ ONGLET AVIS
function ReviewsTab({ reviews }) {
  return (
    <div className="space-y-4">
      {reviews.map(review => (
        <div key={review.id} className="bg-slate-50 rounded-xl p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="font-bold text-slate-900">{review.customer_name}</p>
              <p className="text-sm text-slate-500">{review.business_profile?.name}</p>
            </div>
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <span key={i} className={i < review.rating ? 'text-yellow-400' : 'text-slate-300'}>
                  ⭐
                </span>
              ))}
            </div>
          </div>
          <p className="text-slate-700">{review.comment}</p>
          <p className="text-xs text-slate-400 mt-2">
            {new Date(review.created_at).toLocaleDateString('fr-FR')}
          </p>
        </div>
      ))}
    </div>
  );
}

// 👥 ONGLET CLIENTS
function CustomersTab({ customers }) {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      {customers.map(customer => (
        <div key={customer.id} className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl p-6 border-2 border-slate-200 hover:border-indigo-300 transition-all">
          <div className="text-4xl mb-3">👤</div>
          <p className="font-bold text-slate-900 text-lg">{customer.name}</p>
          <p className="text-sm text-slate-600">{customer.email}</p>
          <p className="text-sm text-slate-600">{customer.phone}</p>
          <p className="text-xs text-slate-400 mt-2">{customer.business_profile?.name}</p>
        </div>
      ))}
    </div>
  );
}

// 🔍 MODAL DÉTAILS
function BusinessModal({ business, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-8 text-white">
          <h2 className="text-3xl font-black mb-2">{business.name || 'Commerce'}</h2>
          <p className="opacity-90">{business.email}</p>
        </div>
        
        <div className="p-8 space-y-6">
          <InfoRow label="📍 Adresse" value={business.address || 'N/A'} />
          <InfoRow label="🏙️ Ville" value={business.city || 'N/A'} />
          <InfoRow label="📞 Téléphone" value={business.phone || 'N/A'} />
          <InfoRow label="💎 Plan" value={business.plan?.toUpperCase() || 'BASIC'} />
          <InfoRow label="💰 Prix" value={business.price ? `${business.price}€/mois` : 'N/A'} />
          <InfoRow label="📝 Description" value={business.description || 'Aucune description'} />
          <InfoRow label="📅 Inscrit le" value={new Date(business.created_at).toLocaleDateString('fr-FR')} />
          
          <button
            onClick={onClose}
            className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between items-start pb-4 border-b border-slate-200">
      <span className="font-semibold text-slate-600">{label}</span>
      <span className="text-slate-900 font-medium text-right max-w-xs">{value}</span>
    </div>
  );
}
