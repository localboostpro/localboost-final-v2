import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { PLANS, getPlanConfig } from '../lib/plans';
import { 
  Store, 
  Star, 
  Users, 
  TrendingUp, 
  Search,
  Eye,
  Pause,
  Play,
  Trash2,
  DollarSign,
  MapPin,
  Mail,
  Phone,
  Calendar,
  AlertCircle,
  BarChart3,
  Euro
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

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
      
      alert(`✅ Forfait changé vers ${planConfig.name}`);
    } catch (err) {
      console.error('Erreur updateBusinessPlan:', err);
      alert('❌ Erreur : ' + err.message);
    }
  }

  async function toggleBusinessStatus(businessId, currentStatus) {
    try {
      const { error } = await supabase
        .from('business_profile')
        .update({ is_active: !currentStatus })
        .eq('id', businessId);

      if (error) throw error;
      
      setBusinesses(prev => 
        prev.map(b => b.id === businessId ? { ...b, is_active: !currentStatus } : b)
      );
      
      alert(!currentStatus ? '✅ Commerce activé' : '⏸️ Commerce désactivé');
    } catch (err) {
      console.error('Erreur toggleBusinessStatus:', err);
      alert('❌ Erreur : ' + err.message);
    }
  }

  async function deleteBusiness(businessId) {
    if (!confirm('⚠️ Supprimer ce commerce et toutes ses données ?')) return;
    
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

  // Calcul CA mensuel
  const getMonthlyRevenue = () => {
    const monthlyData = {};
    
    businesses.forEach(biz => {
      const date = new Date(biz.created_at);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const planPrice = getPlanConfig(biz.plan).price;
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = 0;
      }
      monthlyData[monthKey] += planPrice;
    });

    return Object.entries(monthlyData)
      .sort()
      .slice(-12)
      .map(([month, revenue]) => ({
        month: new Date(month + '-01').toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' }),
        revenue
      }));
  };

  // Calcul CA annuel
  const getYearlyRevenue = () => {
    const yearlyData = {};
    
    businesses.forEach(biz => {
      const year = new Date(biz.created_at).getFullYear();
      const planPrice = getPlanConfig(biz.plan).price;
      
      if (!yearlyData[year]) {
        yearlyData[year] = 0;
      }
      yearlyData[year] += planPrice * 12; // CA annuel
    });

    return Object.entries(yearlyData)
      .sort()
      .map(([year, revenue]) => ({
        year,
        revenue
      }));
  };

  const filteredBusinesses = businesses.filter(b =>
    b.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalRevenue = businesses.reduce((sum, b) => 
    sum + getPlanConfig(b.plan).price, 0
  );

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-2xl font-bold text-slate-600 animate-pulse">
          Chargement...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-4xl font-black text-slate-900 mb-2">
            🎯 Dashboard Admin
          </h1>
          <p className="text-slate-600 text-lg">
            Gérez tous vos commerces depuis un seul endroit
          </p>
        </div>

        {/* STATS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<Store className="w-8 h-8" />}
            label="Commerces"
            value={businesses.length}
            color="blue"
          />
          <StatCard
            icon={<Star className="w-8 h-8" />}
            label="Note moyenne"
            value={avgRating}
            color="yellow"
          />
          <StatCard
            icon={<Users className="w-8 h-8" />}
            label="Clients"
            value={customers.length}
            color="green"
          />
          <StatCard
            icon={<Euro className="w-8 h-8" />}
            label="CA mensuel"
            value={`${totalRevenue}€`}
            color="purple"
          />
        </div>

        {/* TABS */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 mb-6 p-2 flex gap-2">
          {[
            { id: 'overview', label: '📊 Vue d\'ensemble', icon: <TrendingUp className="w-5 h-5" /> },
            { id: 'businesses', label: '🏪 Commerces', icon: <Store className="w-5 h-5" /> },
            { id: 'finances', label: '💰 Finances', icon: <Euro className="w-5 h-5" /> },
            { id: 'reviews', label: '⭐ Avis', icon: <Star className="w-5 h-5" /> },
            { id: 'customers', label: '👥 Clients', icon: <Users className="w-5 h-5" /> }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-4 px-6 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab.icon}
              <span className="hidden md:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* SEARCH BAR */}
        {activeTab === 'businesses' && (
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher un commerce..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:outline-none text-slate-900 font-semibold"
              />
            </div>
          </div>
        )}

        {/* CONTENT */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
          {activeTab === 'overview' && (
            <OverviewTab 
              businesses={businesses}
              reviews={reviews}
              customers={customers}
            />
          )}

          {activeTab === 'businesses' && (
            <BusinessesTab
              businesses={filteredBusinesses}
              onUpdatePlan={updateBusinessPlan}
              onToggleStatus={toggleBusinessStatus}
              onDelete={deleteBusiness}
              onViewDetails={setSelectedBusiness}
              reviews={reviews}
              customers={customers}
            />
          )}

          {activeTab === 'finances' && (
            <FinancesTab
              monthlyData={getMonthlyRevenue()}
              yearlyData={getYearlyRevenue()}
              totalRevenue={totalRevenue}
              businesses={businesses}
            />
          )}

          {activeTab === 'reviews' && (
            <ReviewsTab reviews={reviews} businesses={businesses} />
          )}

          {activeTab === 'customers' && (
            <CustomersTab customers={customers} businesses={businesses} />
          )}
        </div>
      </div>

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
  );
}

// STAT CARD COMPONENT
function StatCard({ icon, label, value, color }) {
  const colors = {
    blue: 'from-blue-500 to-blue-600',
    yellow: 'from-yellow-500 to-orange-500',
    green: 'from-green-500 to-emerald-600',
    purple: 'from-purple-500 to-pink-600'
  };

  return (
    <div className={`bg-gradient-to-br ${colors[color]} rounded-2xl p-6 text-white shadow-lg`}>
      <div className="flex items-center justify-between mb-4">
        {icon}
        <div className="text-4xl font-black">{value}</div>
      </div>
      <div className="text-sm font-semibold opacity-90">{label}</div>
    </div>
  );
}

// OVERVIEW TAB
function OverviewTab({ businesses, reviews, customers }) {
  const planDistribution = businesses.reduce((acc, b) => {
    acc[b.plan] = (acc[b.plan] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black text-slate-900 mb-6">
        📊 Vue d'ensemble
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
          <div className="text-5xl font-black text-blue-600 mb-2">
            {businesses.length}
          </div>
          <div className="text-slate-600 font-semibold">Commerces actifs</div>
        </div>

        <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
          <div className="text-5xl font-black text-yellow-600 mb-2">
            {reviews.length}
          </div>
          <div className="text-slate-600 font-semibold">Avis collectés</div>
        </div>

        <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
          <div className="text-5xl font-black text-green-600 mb-2">
            {customers.length}
          </div>
          <div className="text-slate-600 font-semibold">Clients enregistrés</div>
        </div>
      </div>

      <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
        <h3 className="text-lg font-bold text-slate-900 mb-4">
          📦 Distribution des forfaits
        </h3>
        <div className="space-y-2">
          {Object.entries(planDistribution).map(([plan, count]) => {
            const config = getPlanConfig(plan);
            return (
              <div key={plan} className="flex items-center justify-between">
                <span className="font-semibold text-slate-900">{config.name}</span>
                <span className="font-bold text-blue-600">{count} commerce{count > 1 ? 's' : ''}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// BUSINESSES TAB
function BusinessesTab({ businesses, onUpdatePlan, onToggleStatus, onDelete, onViewDetails, reviews, customers }) {
  if (businesses.length === 0) {
    return (
      <EmptyState
        icon={<Store className="w-20 h-20" />}
        message="Aucun commerce trouvé"
      />
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black text-slate-900 mb-6">
        🏪 Liste des commerces ({businesses.length})
      </h2>

      <div className="grid gap-6">
        {businesses.map(business => {
          const planConfig = getPlanConfig(business.plan);
          const businessReviews = reviews.filter(r => r.business_id === business.id);
          const businessCustomers = customers.filter(c => c.business_id === business.id);
          const avgRating = businessReviews.length > 0
            ? (businessReviews.reduce((sum, r) => sum + r.rating, 0) / businessReviews.length).toFixed(1)
            : 0;

          return (
            <div key={business.id} className="bg-slate-50 rounded-2xl p-6 border-2 border-slate-200 hover:border-blue-300 transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-2xl font-black text-slate-900 mb-2">
                    {business.name || 'Sans nom'}
                  </h3>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className={`px-4 py-2 rounded-lg text-sm font-bold ${
                      business.is_active
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {business.is_active ? '✅ Actif' : '❌ Inactif'}
                    </span>
                    <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-bold">
                      {planConfig.name} - {planConfig.price}€/mois
                    </span>
                    {businessReviews.length > 0 && (
                      <span className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg text-sm font-bold flex items-center gap-1">
                        <Star className="w-4 h-4 fill-current" />
                        {avgRating} ({businessReviews.length} avis)
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {business.email && (
                      <div className="flex items-center gap-2 text-slate-600">
                        <Mail className="w-4 h-4" />
                        <span className="font-semibold">{business.email}</span>
                      </div>
                    )}
                    {business.phone && (
                      <div className="flex items-center gap-2 text-slate-600">
                        <Phone className="w-4 h-4" />
                        <span className="font-semibold">{business.phone}</span>
                      </div>
                    )}
                    {business.address && (
                      <div className="flex items-center gap-2 text-slate-600">
                        <MapPin className="w-4 h-4" />
                        <span className="font-semibold">{business.address}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-slate-600">
                      <Users className="w-4 h-4" />
                      <span className="font-semibold">{businessCustomers.length} clients</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 pt-4 border-t border-slate-200">
                <select
                  value={business.plan}
                  onChange={(e) => onUpdatePlan(business.id, e.target.value)}
                  className="px-4 py-2 bg-white border-2 border-slate-300 rounded-lg font-semibold text-slate-900 hover:border-blue-500 focus:outline-none focus:border-blue-500 transition-colors"
                >
                  {Object.values(PLANS).map(plan => (
                    <option key={plan} value={plan}>
                      {getPlanConfig(plan).name} - {getPlanConfig(plan).price}€/mois
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => onToggleStatus(business.id, business.is_active)}
                  className={`px-4 py-2 rounded-lg font-bold transition-colors flex items-center gap-2 ${
                    business.is_active
                      ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}
                >
                  {business.is_active ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  {business.is_active ? 'Désactiver' : 'Activer'}
                </button>

                <button
                  onClick={() => onViewDetails(business)}
                  className="px-4 py-2 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg font-bold transition-colors flex items-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  Détails
                </button>

                <a
                  href={`/${business.slug || business.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-purple-100 text-purple-700 hover:bg-purple-200 rounded-lg font-bold transition-colors"
                >
                  Voir la page
                </a>

                <button
                  onClick={() => onDelete(business.id)}
                  className="px-4 py-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg font-bold transition-colors flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Supprimer
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// FINANCES TAB
function FinancesTab({ monthlyData, yearlyData, totalRevenue, businesses }) {
  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-black text-slate-900 mb-6">
        💰 Finances et chiffre d'affaires
      </h2>

      {/* CA TOTAL */}
      <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-8 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold opacity-90 mb-2">Chiffre d'affaires mensuel total</div>
            <div className="text-5xl font-black">{totalRevenue}€</div>
          </div>
          <Euro className="w-20 h-20 opacity-30" />
        </div>
      </div>

      {/* GRAPHIQUE MENSUEL */}
      {monthlyData.length > 0 && (
        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
          <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            Évolution mensuelle (12 derniers mois)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="month" 
                stroke="#64748b"
                style={{ fontSize: '12px', fontWeight: 'bold' }}
              />
              <YAxis 
                stroke="#64748b"
                style={{ fontSize: '12px', fontWeight: 'bold' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1e293b',
                  border: 'none',
                  borderRadius: '12px',
                  fontWeight: 'bold',
                  color: 'white'
                }}
                formatter={(value) => [`${value}€`, 'CA']}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                name="Chiffre d'affaires"
                stroke="#3b82f6" 
                strokeWidth={3}
                dot={{ fill: '#3b82f6', r: 6 }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* GRAPHIQUE ANNUEL */}
      {yearlyData.length > 0 && (
        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
          <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-green-600" />
            Comparaison annuelle
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={yearlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="year" 
                stroke="#64748b"
                style={{ fontSize: '12px', fontWeight: 'bold' }}
              />
              <YAxis 
                stroke="#64748b"
                style={{ fontSize: '12px', fontWeight: 'bold' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1e293b',
                  border: 'none',
                  borderRadius: '12px',
                  fontWeight: 'bold',
                  color: 'white'
                }}
                formatter={(value) => [`${value}€`, 'CA annuel']}
              />
              <Legend />
              <Bar 
                dataKey="revenue" 
                name="CA annuel"
                fill="#10b981"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* DÉTAILS PAR COMMERCE */}
      <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
        <h3 className="text-xl font-bold text-slate-900 mb-4">
          📊 Détail par commerce
        </h3>
        <div className="space-y-3">
          {businesses.map(biz => {
            const planConfig = getPlanConfig(biz.plan);
            return (
              <div key={biz.id} className="flex items-center justify-between bg-white rounded-xl p-4 border border-slate-200">
                <div className="flex-1">
                  <div className="font-bold text-slate-900">{biz.name}</div>
                  <div className="text-sm text-slate-600">{planConfig.name}</div>
                </div>
                <div className="text-right">
                  <div className="font-black text-green-600 text-lg">{planConfig.price}€/mois</div>
                  <div className="text-sm text-slate-600">{planConfig.price * 12}€/an</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// REVIEWS TAB
function ReviewsTab({ reviews, businesses }) {
  if (reviews.length === 0) {
    return (
      <EmptyState
        icon={<Star className="w-20 h-20" />}
        message="Aucun avis collecté"
      />
    );
  }

  const reviewsByBusiness = reviews.reduce((acc, review) => {
    if (!acc[review.business_id]) acc[review.business_id] = [];
    acc[review.business_id].push(review);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black text-slate-900 mb-6">
        ⭐ Tous les avis ({reviews.length})
      </h2>

      {Object.entries(reviewsByBusiness).map(([businessId, businessReviews]) => {
        const business = businesses.find(b => b.id === businessId);
        if (!business) return null;

        const avgRating = (businessReviews.reduce((sum, r) => sum + r.rating, 0) / businessReviews.length).toFixed(1);

        return (
          <div key={businessId} className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-black text-slate-900">{business.name}</h3>
              <div className="flex items-center gap-2 bg-yellow-100 text-yellow-700 px-4 py-2 rounded-lg font-bold">
                <Star className="w-5 h-5 fill-current" />
                {avgRating} ({businessReviews.length} avis)
              </div>
            </div>

            <div className="grid gap-4">
              {businessReviews.map(review => (
                <div key={review.id} className="bg-white rounded-xl p-4 border border-slate-200">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="font-bold text-slate-900">{review.customer_name}</div>
                      <div className="flex gap-1 my-2">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-5 h-5 ${
                              i < review.rating
                                ? 'text-yellow-500 fill-current'
                                : 'text-slate-300'
                            }`}
                          />
                        ))}
                      </div>
                      {review.comment && (
                        <p className="text-slate-700 text-sm mt-2">{review.comment}</p>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 font-semibold">
                      {new Date(review.created_at).toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// CUSTOMERS TAB
function CustomersTab({ customers, businesses }) {
  if (customers.length === 0) {
    return (
      <EmptyState
        icon={<Users className="w-20 h-20" />}
        message="Aucun client enregistré"
      />
    );
  }

  const customersByBusiness = customers.reduce((acc, customer) => {
    if (!acc[customer.business_id]) acc[customer.business_id] = [];
    acc[customer.business_id].push(customer);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black text-slate-900 mb-6">
        👥 Tous les clients ({customers.length})
      </h2>

      {Object.entries(customersByBusiness).map(([businessId, businessCustomers]) => {
        const business = businesses.find(b => b.id === businessId);
        if (!business) return null;

        return (
          <div key={businessId} className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-black text-slate-900">{business.name}</h3>
              <div className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg font-bold">
                {businessCustomers.length} client{businessCustomers.length > 1 ? 's' : ''}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {businessCustomers.map(customer => (
                <div key={customer.id} className="bg-white rounded-xl p-4 border border-slate-200">
                  <div className="font-bold text-slate-900 mb-2">{customer.name || 'Sans nom'}</div>
                  {customer.email && (
                    <div className="flex items-center gap-2 text-sm text-slate-600 mb-1">
                      <Mail className="w-4 h-4" />
                      <span className="font-semibold">{customer.email}</span>
                    </div>
                  )}
                  {customer.phone && (
                    <div className="flex items-center gap-2 text-sm text-slate-600 mb-1">
                      <Phone className="w-4 h-4" />
                      <span className="font-semibold">{customer.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-2">
                    <Calendar className="w-4 h-4" />
                    <span>Ajouté le {new Date(customer.created_at).toLocaleDateString('fr-FR')}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// BUSINESS MODAL
function BusinessModal({ business, reviews, customers, onClose }) {
  const planConfig = getPlanConfig(business.plan);
  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          {/* HEADER */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-3xl font-black text-slate-900 mb-2">{business.name}</h2>
              <div className="flex gap-2">
                <span className={`px-3 py-1 rounded-lg text-sm font-bold ${
                  business.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {business.is_active ? '✅ Actif' : '❌ Inactif'}
                </span>
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-bold">
                  {planConfig.name} - {planConfig.price}€/mois
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* INFOS */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            <InfoItem icon={<Mail className="w-5 h-5" />} label="Email" value={business.email || 'N/A'} />
            <InfoItem icon={<Phone className="w-5 h-5" />} label="Téléphone" value={business.phone || 'N/A'} />
            <InfoItem icon={<MapPin className="w-5 h-5" />} label="Adresse" value={business.address || 'N/A'} />
            <InfoItem icon={<Calendar className="w-5 h-5" />} label="Inscrit le" value={new Date(business.created_at).toLocaleDateString('fr-FR')} />
          </div>

          {/* AVIS */}
          {reviews.length > 0 && (
            <div className="bg-slate-50 rounded-2xl p-6 mb-6 border border-slate-200">
              <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-600" />
                Avis clients ({reviews.length}) - Moyenne : {avgRating}/5
              </h3>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {reviews.map(review => (
                  <div key={review.id} className="bg-white rounded-xl p-4 border border-slate-200">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="font-bold text-slate-900">{review.customer_name}</div>
                        <div className="flex gap-1 my-2">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < review.rating ? 'text-yellow-500 fill-current' : 'text-slate-300'
                              }`}
                            />
                          ))}
                        </div>
                        {review.comment && (
                          <p className="text-slate-700 text-sm">{review.comment}</p>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 font-semibold">
                        {new Date(review.created_at).toLocaleDateString('fr-FR')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CLIENTS */}
          {customers.length > 0 && (
            <div className="bg-slate-50 rounded-2xl p-6 mb-6 border border-slate-200">
              <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                Fichier clients ({customers.length})
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-60 overflow-y-auto">
                {customers.map(customer => (
                  <div key={customer.id} className="bg-white rounded-xl p-3 border border-slate-200">
                    <div className="font-bold text-slate-900 text-sm mb-1">{customer.name || 'Sans nom'}</div>
                    <div className="text-xs text-slate-600 mb-0.5 truncate">{customer.email || 'N/A'}</div>
                    <div className="text-xs text-slate-600 truncate">{customer.phone || 'N/A'}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ACTIONS */}
          <div className="flex gap-4">
            <a
              href={`/${business.slug || business.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold hover:from-blue-700 hover:to-purple-700 transition-all text-center shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2"
            >
              <Eye className="w-5 h-5" />
              Voir la page publique
            </a>
            <button
              onClick={onClose}
              className="flex-1 py-4 bg-slate-200 text-slate-900 rounded-xl font-bold hover:bg-slate-300 transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoItem({ icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      {icon && <div className="text-blue-600 mt-1">{icon}</div>}
      <div className="flex-1">
        <div className="text-xs text-slate-500 font-semibold mb-1">{label}</div>
        <div className="text-sm text-slate-900 font-bold break-all">{value}</div>
      </div>
    </div>
  );
}

function EmptyState({ icon, message }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-16 text-center">
      <div className="text-slate-300 mb-4 flex justify-center">{icon}</div>
      <p className="text-slate-400 text-xl font-bold">{message}</p>
    </div>
  );
}
