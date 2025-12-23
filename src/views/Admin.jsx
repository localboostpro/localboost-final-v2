import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { PLANS, getPlanConfig } from '../lib/plans';

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
      
      const { data: bizData, error: bizError } = await supabase
        .from('business_profile')
        .select('*')
        .order('created_at', { ascending: false });

      if (bizError) throw bizError;

      const { data: revData } = await supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false });

      const { data: custData } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });

      setBusinesses(bizData || []);
      setReviews(revData || []);
      setCustomers(custData || []);
    } catch (err) {
      console.error('Erreur fetchAllData:', err);
      alert('❌ Erreur : ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  async function updateBusinessPlan(businessId, newPlan) {
    try {
      const planConfig = getPlanConfig(newPlan);
      
      const { error } = await supabase
        .from('business_profile')
        .update({ plan: newPlan })
        .eq('id', businessId);

      if (error) throw error;
      
      setBusinesses(prev => 
        prev.map(b => b.id === businessId ? { ...b, plan: newPlan } : b)
      );
      
      alert(`✅ Plan changé vers ${planConfig.name} (${planConfig.price}€/mois)`);
    } catch (err) {
      console.error('Erreur updateBusinessPlan:', err);
      alert('❌ Erreur : ' + err.message);
    }
  }

  async function toggleBusinessStatus(businessId, currentStatus) {
    const newStatus = !currentStatus;
    
    if (!confirm(`⚠️ ${newStatus ? 'Réactiver' : 'Désactiver'} ce commerce ?`)) return;
    
    try {
      const { error } = await supabase
        .from('business_profile')
        .update({ is_active: newStatus })
        .eq('id', businessId);

      if (error) throw error;
      
      setBusinesses(prev => 
        prev.map(b => b.id === businessId ? { ...b, is_active: newStatus } : b)
      );
      
      alert(`✅ Commerce ${newStatus ? 'activé' : 'désactivé'} !`);
    } catch (err) {
      console.error('Erreur toggleBusinessStatus:', err);
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
      console.error('Erreur deleteBusiness:', err);
      alert('❌ Erreur : ' + err.message);
    }
  }

  const filteredBusinesses = businesses.filter(b => 
    b.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.city?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalRevenue = businesses.reduce((sum, b) => {
    const planConfig = getPlanConfig(b.plan);
    return sum + (b.is_active !== false ? planConfig.price : 0);
  }, 0);

  const activeBusinesses = businesses.filter(b => b.is_active !== false).length;
  const suspendedBusinesses = businesses.filter(b => b.is_active === false).length;
  const avgRating = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length).toFixed(1)
    : '0.0';

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-2xl font-bold animate-pulse">⏳ Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* HEADER */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 shadow-xl">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <h1 className="text-4xl font-black text-white mb-2">🎯 Admin Dashboard</h1>
          <p className="text-blue-100">Gérez vos commerces, avis et clients</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <StatCard icon="🏪" label="Total Commerces" value={businesses.length} color="blue" />
          <StatCard icon="✅" label="Actifs" value={activeBusinesses} color="green" />
          <StatCard icon="🔴" label="Suspendus" value={suspendedBusinesses} color="red" />
          <StatCard icon="⭐" label="Note Moy." value={avgRating + '/5'} color="yellow" />
          <StatCard icon="💰" label="MRR" value={totalRevenue + '€'} color="purple" />
        </div>

        {/* SEARCH + TABS */}
        <div className="bg-slate-800 rounded-xl p-6 mb-6">
          <input
            type="text"
            placeholder="🔍 Rechercher un commerce, email, ville..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-6 py-4 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg mb-6"
          />

          <div className="flex gap-3 overflow-x-auto pb-2">
            <TabButton label="📊 Vue d'ensemble" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
            <TabButton label="🏢 Commerces" count={businesses.length} active={activeTab === 'businesses'} onClick={() => setActiveTab('businesses')} />
            <TabButton label="⭐ Avis" count={reviews.length} active={activeTab === 'reviews'} onClick={() => setActiveTab('reviews')} />
            <TabButton label="👥 Clients" count={customers.length} active={activeTab === 'customers'} onClick={() => setActiveTab('customers')} />
          </div>
        </div>

        {/* CONTENT */}
        {activeTab === 'overview' && <OverviewTab businesses={businesses} reviews={reviews} customers={customers} totalRevenue={totalRevenue} />}
        {activeTab === 'businesses' && (
          <BusinessesTab 
            businesses={filteredBusinesses} 
            reviews={reviews}
            customers={customers}
            onUpdatePlan={updateBusinessPlan} 
            onToggleStatus={toggleBusinessStatus} 
            onDelete={deleteBusiness} 
            onViewDetails={setSelectedBusiness} 
          />
        )}
        {activeTab === 'reviews' && <ReviewsTab reviews={reviews} businesses={businesses} />}
        {activeTab === 'customers' && <CustomersTab customers={customers} businesses={businesses} />}

        {/* MODAL */}
        {selectedBusiness && (
          <BusinessModal 
            business={selectedBusiness} 
            reviews={reviews.filter(r => r.business_id === selectedBusiness.id)}
            customers={customers.filter(c => c.business_id === selectedBusiness.id)}
            onClose={() => setSelectedBusiness(null)} 
          />
        )}
      </div>
    </div>
  );
}

// 📊 STAT CARD
function StatCard({ icon, label, value, color }) {
  const colors = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    red: 'from-red-500 to-red-600',
    yellow: 'from-yellow-500 to-yellow-600',
    purple: 'from-purple-500 to-purple-600'
  };

  return (
    <div className={`bg-gradient-to-br ${colors[color]} rounded-xl p-6 shadow-lg`}>
      <div className="text-3xl mb-2">{icon}</div>
      <div className="text-white/80 text-sm font-medium mb-1">{label}</div>
      <div className="text-2xl font-black text-white">{value}</div>
    </div>
  );
}

// 🔘 TAB BUTTON
function TabButton({ label, count, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-6 py-3 rounded-lg font-semibold whitespace-nowrap transition-all ${
        active
          ? 'bg-blue-600 text-white shadow-lg'
          : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
      }`}
    >
      {label} {count !== undefined && <span className="ml-2 opacity-70">({count})</span>}
    </button>
  );
}

// 📊 OVERVIEW TAB
function OverviewTab({ businesses, reviews, customers, totalRevenue }) {
  const recentBusinesses = businesses.slice(0, 5);
  const recentReviews = reviews.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Derniers commerces */}
      <div className="bg-slate-800 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">🏪 Derniers commerces inscrits</h2>
        <div className="space-y-3">
          {recentBusinesses.map(biz => {
            const planConfig = getPlanConfig(biz.plan);
            return (
              <div key={biz.id} className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
                <div>
                  <div className="text-white font-semibold">{biz.name || 'Sans nom'}</div>
                  <div className="text-slate-400 text-sm">{biz.email}</div>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-bold ${planConfig.color === 'blue' ? 'text-blue-400' : planConfig.color === 'purple' ? 'text-purple-400' : 'text-pink-400'}`}>
                    {planConfig.name}
                  </div>
                  <div className="text-slate-400 text-sm">{planConfig.price}€/mois</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Derniers avis */}
      <div className="bg-slate-800 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">⭐ Derniers avis</h2>
        <div className="space-y-3">
          {recentReviews.length > 0 ? (
            recentReviews.map(review => (
              <div key={review.id} className="p-4 bg-slate-700 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-white font-semibold">{review.customer_name || 'Anonyme'}</div>
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={i < review.rating ? 'text-yellow-400' : 'text-slate-600'}>★</span>
                    ))}
                  </div>
                </div>
                <p className="text-slate-300 text-sm">{review.comment || 'Aucun commentaire'}</p>
                <p className="text-slate-500 text-xs mt-2">{new Date(review.created_at).toLocaleDateString('fr-FR')}</p>
              </div>
            ))
          ) : (
            <p className="text-slate-400 text-center py-8">Aucun avis pour le moment</p>
          )}
        </div>
      </div>
    </div>
  );
}

// 🏢 BUSINESSES TAB
function BusinessesTab({ businesses, reviews, customers, onUpdatePlan, onToggleStatus, onDelete, onViewDetails }) {
  if (businesses.length === 0) {
    return <EmptyState message="Aucun commerce trouvé" />;
  }

  return (
    <div className="bg-slate-800 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-700">
            <tr>
              <th className="text-left p-4 text-slate-300 font-semibold">Statut</th>
              <th className="text-left p-4 text-slate-300 font-semibold">Commerce</th>
              <th className="text-left p-4 text-slate-300 font-semibold">Email</th>
              <th className="text-left p-4 text-slate-300 font-semibold">Ville</th>
              <th className="text-left p-4 text-slate-300 font-semibold">Plan</th>
              <th className="text-left p-4 text-slate-300 font-semibold">Avis</th>
              <th className="text-left p-4 text-slate-300 font-semibold">Clients</th>
              <th className="text-center p-4 text-slate-300 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {businesses.map((biz) => {
              const planConfig = getPlanConfig(biz.plan);
              const isActive = biz.is_active !== false;
              const bizReviews = reviews.filter(r => r.business_id === biz.id);
              const bizCustomers = customers.filter(c => c.business_id === biz.id);

              return (
                <tr key={biz.id} className="border-b border-slate-700 hover:bg-slate-700/50 transition-colors">
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      isActive ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
                    }`}>
                      {isActive ? '✅ Actif' : '🔴 Suspendu'}
                    </span>
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => onViewDetails(biz)}
                      className="text-white font-semibold hover:text-blue-400 transition-colors text-left"
                    >
                      {biz.name || 'Sans nom'}
                    </button>
                  </td>
                  <td className="p-4 text-slate-400">{biz.email}</td>
                  <td className="p-4 text-slate-400">{biz.city || 'N/A'}</td>
                  <td className="p-4">
                    <select
                      value={biz.plan}
                      onChange={(e) => onUpdatePlan(biz.id, e.target.value)}
                      disabled={!isActive}
                      className={`px-3 py-1 rounded-lg text-sm font-bold border-2 ${
                        planConfig.color === 'blue' ? 'bg-blue-500/20 border-blue-500 text-blue-300' :
                        planConfig.color === 'purple' ? 'bg-purple-500/20 border-purple-500 text-purple-300' :
                        'bg-pink-500/20 border-pink-500 text-pink-300'
                      } ${!isActive ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer bg-slate-700'}`}
                    >
                      <option value="basic">BASIC - 29€</option>
                      <option value="pro">PRO - 59€</option>
                      <option value="premium">PREMIUM - 99€</option>
                    </select>
                  </td>
                  <td className="p-4 text-center">
                    <span className="text-yellow-400 font-bold">{bizReviews.length}</span>
                  </td>
                  <td className="p-4 text-center">
                    <span className="text-blue-400 font-bold">{bizCustomers.length}</span>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2 justify-center">
                      <a
                        href={`/${biz.slug || biz.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors"
                      >
                        👁️
                      </a>
                      <button
                        onClick={() => onToggleStatus(biz.id, isActive)}
                        className={`px-3 py-2 ${
                          isActive ? 'bg-orange-600 hover:bg-orange-700' : 'bg-green-600 hover:bg-green-700'
                        } text-white rounded-lg text-sm font-semibold transition-colors`}
                      >
                        {isActive ? '⏸️' : '▶️'}
                      </button>
                      <button
                        onClick={() => onDelete(biz.id)}
                        className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition-colors"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ⭐ REVIEWS TAB
function ReviewsTab({ reviews, businesses }) {
  if (reviews.length === 0) {
    return <EmptyState message="Aucun avis trouvé" />;
  }

  // Grouper par commerce
  const reviewsByBusiness = businesses.map(biz => ({
    business: biz,
    reviews: reviews.filter(r => r.business_id === biz.id)
  })).filter(item => item.reviews.length > 0);

  return (
    <div className="space-y-6">
      {reviewsByBusiness.map(({ business, reviews }) => (
        <div key={business.id} className="bg-slate-800 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">
            🏪 {business.name || 'Sans nom'} 
            <span className="ml-3 text-sm text-slate-400">({reviews.length} avis)</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reviews.map(review => (
              <div key={review.id} className="bg-slate-700 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="text-white font-semibold">{review.customer_name || 'Anonyme'}</div>
                    <div className="text-slate-400 text-xs">{new Date(review.created_at).toLocaleDateString('fr-FR')}</div>
                  </div>
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={i < review.rating ? 'text-yellow-400' : 'text-slate-600'}>★</span>
                    ))}
                  </div>
                </div>
                <p className="text-slate-300 text-sm">{review.comment || 'Aucun commentaire'}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// 👥 CUSTOMERS TAB
function CustomersTab({ customers, businesses }) {
  if (customers.length === 0) {
    return <EmptyState message="Aucun client trouvé" />;
  }

  // Grouper par commerce
  const customersByBusiness = businesses.map(biz => ({
    business: biz,
    customers: customers.filter(c => c.business_id === biz.id)
  })).filter(item => item.customers.length > 0);

  return (
    <div className="space-y-6">
      {customersByBusiness.map(({ business, customers }) => (
        <div key={business.id} className="bg-slate-800 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">
            🏪 {business.name || 'Sans nom'}
            <span className="ml-3 text-sm text-slate-400">({customers.length} clients)</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {customers.map(customer => (
              <div key={customer.id} className="bg-slate-700 rounded-lg p-4">
                <div className="text-white font-semibold mb-1">{customer.name || 'Sans nom'}</div>
                <div className="text-slate-400 text-sm">{customer.email || 'N/A'}</div>
                <div className="text-slate-400 text-sm">{customer.phone || 'N/A'}</div>
                <div className="text-slate-500 text-xs mt-2">
                  Inscrit le {new Date(customer.created_at).toLocaleDateString('fr-FR')}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// 🔍 MODAL DÉTAILS
function BusinessModal({ business, reviews, customers, onClose }) {
  const planConfig = getPlanConfig(business.plan);
  const isActive = business.is_active !== false;
  
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-slate-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className={`bg-gradient-to-r ${isActive ? 'from-blue-600 to-purple-600' : 'from-gray-600 to-gray-800'} p-8 text-white`}>
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-3xl font-black mb-2">{business.name || 'Commerce'}</h2>
              <p className="opacity-90">{business.email}</p>
            </div>
            <span className={`px-4 py-2 rounded-full text-sm font-bold ${
              isActive ? 'bg-green-500' : 'bg-red-500'
            }`}>
              {isActive ? '✅ Actif' : '🔴 Suspendu'}
            </span>
          </div>
        </div>
        
        <div className="p-8">
          {/* Infos générales */}
          <div className="bg-slate-700 rounded-xl p-6 mb-6">
            <h3 className="text-xl font-bold text-white mb-4">📋 Informations</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <InfoItem label="📍 Adresse" value={business.address || 'N/A'} />
              <InfoItem label="🏙️ Ville" value={business.city || 'N/A'} />
              <InfoItem label="📞 Téléphone" value={business.phone || 'N/A'} />
              <InfoItem label="💎 Plan" value={`${planConfig.name} (${planConfig.price}€/mois)`} />
              <InfoItem label="🔗 Slug" value={business.slug || 'Non défini'} />
              <InfoItem label="📅 Inscrit le" value={new Date(business.created_at).toLocaleDateString('fr-FR')} />
            </div>
          </div>

          {/* Avis */}
          <div className="bg-slate-700 rounded-xl p-6 mb-6">
            <h3 className="text-xl font-bold text-white mb-4">⭐ Avis ({reviews.length})</h3>
            {reviews.length > 0 ? (
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {reviews.map(review => (
                  <div key={review.id} className="bg-slate-600 rounded-lg p-3">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-white font-semibold">{review.customer_name || 'Anonyme'}</span>
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className={i < review.rating ? 'text-yellow-400' : 'text-slate-500'}>★</span>
                        ))}
                      </div>
                    </div>
                    <p className="text-slate-300 text-sm">{review.comment || 'Aucun commentaire'}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-400 text-center py-4">Aucun avis</p>
            )}
          </div>

          {/* Clients */}
          <div className="bg-slate-700 rounded-xl p-6 mb-6">
            <h3 className="text-xl font-bold text-white mb-4">👥 Clients ({customers.length})</h3>
            {customers.length > 0 ? (
              <div className="grid grid-cols-2 gap-3 max-h-60 overflow-y-auto">
                {customers.map(customer => (
                  <div key={customer.id} className="bg-slate-600 rounded-lg p-3">
                    <div className="text-white font-semibold">{customer.name || 'Sans nom'}</div>
                    <div className="text-slate-400 text-xs">{customer.email || 'N/A'}</div>
                    <div className="text-slate-400 text-xs">{customer.phone || 'N/A'}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-400 text-center py-4">Aucun client</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <a
              href={`/${business.slug || business.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors text-center"
            >
              👁️ Voir la page publique
            </a>
            <button
              onClick={onClose}
              className="flex-1 py-3 bg-slate-600 text-white rounded-xl font-bold hover:bg-slate-500 transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoItem({ label, value }) {
  return (
    <div>
      <div className="text-slate-400 text-xs mb-1">{label}</div>
      <div className="text-white font-semibold">{value}</div>
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <div className="bg-slate-800 rounded-xl p-12 text-center">
      <div className="text-6xl mb-4">🔍</div>
      <p className="text-slate-400 text-xl font-semibold">{message}</p>
    </div>
  );
}
