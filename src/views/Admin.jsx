import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { PLANS, getPlanConfig } from '../lib/plans';

export default function Admin() {
  const [businesses, setBusinesses] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('businesses');
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
    const action = newStatus ? 'activé' : 'désactivé';
    
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
      
      alert(`✅ Commerce ${action} avec succès !`);
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

  const filteredReviews = reviews.filter(r =>
    r.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.comment?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCustomers = customers.filter(c =>
    c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalRevenue = businesses.reduce((sum, b) => {
    const planConfig = getPlanConfig(b.plan);
    return sum + (b.is_active ? planConfig.price : 0);
  }, 0);

  const activeBusinesses = businesses.filter(b => b.is_active).length;
  const suspendedBusinesses = businesses.filter(b => !b.is_active).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-2xl font-bold animate-pulse">⏳ Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 mb-8 border border-white/20 shadow-2xl">
          <h1 className="text-5xl font-black text-white mb-2 tracking-tight">
            🎯 Admin Dashboard
          </h1>
          <p className="text-white/70 text-lg">Gérez vos commerces, avis et clients</p>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <StatCard icon="🏪" label="Total Commerces" value={businesses.length} color="blue" />
          <StatCard icon="✅" label="Actifs" value={activeBusinesses} color="green" />
          <StatCard icon="🔴" label="Suspendus" value={suspendedBusinesses} color="red" />
          <StatCard icon="⭐" label="Avis" value={reviews.length} color="yellow" />
          <StatCard icon="💰" label="Revenus MRR" value={`${totalRevenue}€`} color="purple" />
        </div>

        {/* SEARCH BAR */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 mb-8 border border-white/20">
          <input
            type="text"
            placeholder="🔍 Rechercher un commerce, email, ville..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-6 py-4 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 text-lg"
          />
        </div>

        {/* TABS */}
        <div className="flex gap-4 mb-8">
          <TabButton label="🏢 Commerces" count={businesses.length} active={activeTab === 'businesses'} onClick={() => setActiveTab('businesses')} />
          <TabButton label="⭐ Avis" count={reviews.length} active={activeTab === 'reviews'} onClick={() => setActiveTab('reviews')} />
          <TabButton label="👥 Clients" count={customers.length} active={activeTab === 'customers'} onClick={() => setActiveTab('customers')} />
        </div>

        {/* CONTENT */}
        {activeTab === 'businesses' && <BusinessesTab businesses={filteredBusinesses} onUpdatePlan={updateBusinessPlan} onToggleStatus={toggleBusinessStatus} onDelete={deleteBusiness} onViewDetails={setSelectedBusiness} />}
        {activeTab === 'reviews' && <ReviewsTab reviews={filteredReviews} />}
        {activeTab === 'customers' && <CustomersTab customers={filteredCustomers} />}

        {/* MODAL */}
        {selectedBusiness && <BusinessModal business={selectedBusiness} onClose={() => setSelectedBusiness(null)} />}
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
    <div className={`bg-gradient-to-br ${colors[color]} rounded-2xl p-6 shadow-xl border border-white/20`}>
      <div className="text-4xl mb-2">{icon}</div>
      <div className="text-white/80 text-sm font-medium mb-1">{label}</div>
      <div className="text-3xl font-black text-white">{value}</div>
    </div>
  );
}

// 🔘 TAB BUTTON
function TabButton({ label, count, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-6 py-4 rounded-xl font-bold transition-all ${
        active
          ? 'bg-white text-slate-900 shadow-xl scale-105'
          : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
      }`}
    >
      {label} <span className="ml-2 opacity-70">({count})</span>
    </button>
  );
}

// 🏢 BUSINESSES TAB
function BusinessesTab({ businesses, onUpdatePlan, onToggleStatus, onDelete, onViewDetails }) {
  if (businesses.length === 0) {
    return <EmptyState message="Aucun commerce trouvé" />;
  }

  return (
    <div className="bg-white/10 backdrop-blur-xl rounded-2xl overflow-hidden border border-white/20 shadow-2xl">
      <table className="w-full">
        <thead className="bg-white/20 border-b border-white/20">
          <tr>
            <th className="text-left p-6 text-white font-bold">Statut</th>
            <th className="text-left p-6 text-white font-bold">Commerce</th>
            <th className="text-left p-6 text-white font-bold">Email</th>
            <th className="text-left p-6 text-white font-bold">Ville</th>
            <th className="text-left p-6 text-white font-bold">Plan</th>
            <th className="text-left p-6 text-white font-bold">Prix/mois</th>
            <th className="text-center p-6 text-white font-bold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {businesses.map((biz) => {
            const planConfig = getPlanConfig(biz.plan);
            const isActive = biz.is_active !== false; // Par défaut true si non défini

            return (
              <tr key={biz.id} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                <td className="p-6">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    isActive ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
                  }`}>
                    {isActive ? '✅ Actif' : '🔴 Suspendu'}
                  </span>
                </td>
                <td className="p-6">
                  <button
                    onClick={() => onViewDetails(biz)}
                    className="text-white font-bold hover:text-purple-300 transition-colors text-left"
                  >
                    {biz.name || 'Sans nom'}
                  </button>
                </td>
                <td className="p-6 text-white/70">{biz.email}</td>
                <td className="p-6 text-white/70">{biz.city || 'N/A'}</td>
                <td className="p-6">
                  <select
                    value={biz.plan}
                    onChange={(e) => onUpdatePlan(biz.id, e.target.value)}
                    disabled={!isActive}
                    className={`px-3 py-1 rounded-lg text-xs font-bold border-2 ${
                      planConfig.color === 'blue' ? 'bg-blue-500/20 border-blue-500 text-blue-300' :
                      planConfig.color === 'purple' ? 'bg-purple-500/20 border-purple-500 text-purple-300' :
                      'bg-pink-500/20 border-pink-500 text-pink-300'
                    } ${!isActive ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <option value="basic">BASIC</option>
                    <option value="pro">PRO</option>
                    <option value="premium">PREMIUM</option>
                  </select>
                </td>
                <td className="p-6">
                  <span className="font-bold text-green-400">{planConfig.price}€</span>
                </td>
                <td className="p-6">
                  <div className="flex gap-2 justify-center">
                    <a
                      href={`/${biz.slug || biz.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold transition-colors"
                      title="Voir la page client"
                    >
                      👁️ Voir
                    </a>
                    <button
                      onClick={() => onToggleStatus(biz.id, isActive)}
                      className={`px-4 py-2 ${
                        isActive ? 'bg-orange-600 hover:bg-orange-700' : 'bg-green-600 hover:bg-green-700'
                      } text-white rounded-lg text-sm font-bold transition-colors`}
                      title={isActive ? 'Désactiver' : 'Activer'}
                    >
                      {isActive ? '⏸️' : '▶️'}
                    </button>
                    <button
                      onClick={() => onDelete(biz.id)}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-bold transition-colors"
                      title="Supprimer"
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
  );
}

// ⭐ REVIEWS TAB
function ReviewsTab({ reviews }) {
  if (reviews.length === 0) {
    return <EmptyState message="Aucun avis trouvé" />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {reviews.map((review) => (
        <div key={review.id} className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-xl">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-white font-bold text-lg">{review.customer_name || 'Anonyme'}</h3>
              <p className="text-white/50 text-sm">{new Date(review.created_at).toLocaleDateString('fr-FR')}</p>
            </div>
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <span key={i} className={i < review.rating ? 'text-yellow-400' : 'text-white/20'}>⭐</span>
              ))}
            </div>
          </div>
          <p className="text-white/80">{review.comment || 'Aucun commentaire'}</p>
        </div>
      ))}
    </div>
  );
}

// 👥 CUSTOMERS TAB
function CustomersTab({ customers }) {
  if (customers.length === 0) {
    return <EmptyState message="Aucun client trouvé" />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {customers.map((customer) => (
        <div key={customer.id} className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-xl">
          <h3 className="text-white font-bold text-lg mb-2">{customer.name || 'Sans nom'}</h3>
          <p className="text-sm text-white/60">{customer.email || 'N/A'}</p>
          <p className="text-sm text-white/60">{customer.phone || 'N/A'}</p>
          <p className="text-xs text-white/40 mt-4">
            Inscrit le {new Date(customer.created_at).toLocaleDateString('fr-FR')}
          </p>
        </div>
      ))}
    </div>
  );
}

// 🔍 MODAL DÉTAILS
function BusinessModal({ business, onClose }) {
  const planConfig = getPlanConfig(business.plan);
  const isActive = business.is_active !== false;
  
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className={`bg-gradient-to-r ${isActive ? 'from-indigo-600 to-purple-600' : 'from-gray-600 to-gray-800'} p-8 text-white`}>
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
        
        <div className="p-8 space-y-6">
          <InfoRow label="📍 Adresse" value={business.address || 'N/A'} />
          <InfoRow label="🏙️ Ville" value={business.city || 'N/A'} />
          <InfoRow label="📞 Téléphone" value={business.phone || 'N/A'} />
          <InfoRow label="💎 Plan" value={`${planConfig.name} (${planConfig.price}€/mois)`} />
          <InfoRow label="🔗 Slug" value={business.slug || 'Non défini'} />
          <InfoRow label="🆔 ID" value={business.id} />
          <InfoRow label="📝 Description" value={business.description || 'Aucune description'} />
          <InfoRow label="📅 Inscrit le" value={new Date(business.created_at).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })} />
          
          <div className="flex gap-4">
            <a
              href={`/${business.slug || business.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors text-center"
            >
              👁️ Voir la page publique
            </a>
            <button
              onClick={onClose}
              className="flex-1 py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between items-start pb-4 border-b border-slate-200">
      <span className="font-semibold text-slate-600">{label}</span>
      <span className="text-slate-900 font-medium text-right max-w-xs break-all">{value}</span>
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-12 text-center border border-white/20">
      <div className="text-6xl mb-4">🔍</div>
      <p className="text-white text-xl font-bold">{message}</p>
    </div>
  );
}
