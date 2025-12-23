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
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
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
      
      alert(`✅ Plan changé vers  $ {planConfig.name} ( $ {planConfig.price}€/mois)`);
    } catch (err) {
      console.error('Erreur updateBusinessPlan:', err);
      alert('❌ Erreur : ' + err.message);
    }
  }

  async function toggleBusinessStatus(businessId, currentStatus) {
    const newStatus = !currentStatus;
    
    if (!confirm(`⚠️  $ {newStatus ? 'Réactiver' : 'Désactiver'} ce commerce ?`)) return;
    
    try {
      const { error } = await supabase
        .from('business_profile')
        .update({ is_active: newStatus })
        .eq('id', businessId);

      if (error) throw error;
      
      setBusinesses(prev => 
        prev.map(b => b.id === businessId ? { ...b, is_active: newStatus } : b)
      );
      
      alert(`✅ Commerce  $ {newStatus ? 'activé' : 'désactivé'} !`);
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

  // Calculs financiers
  const calculateRevenue = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Revenus par mois (12 derniers mois)
    const monthlyRevenue = Array.from({ length: 12 }, (_, i) => {
      const month = new Date(currentYear, currentMonth - (11 - i), 1);
      const monthStart = new Date(month.getFullYear(), month.getMonth(), 1);
      const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0);

      const revenue = businesses
        .filter(b => {
          const createdDate = new Date(b.created_at);
          return createdDate >= monthStart && 
                 createdDate <= monthEnd && 
                 b.is_active !== false;
        })
        .reduce((sum, b) => {
          const planConfig = getPlanConfig(b.plan);
          return sum + planConfig.price;
        }, 0);

      return {
        month: month.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' }),
        revenue,
        shortMonth: month.toLocaleDateString('fr-FR', { month: 'short' })
      };
    });

    // MRR actuel
    const currentMRR = businesses
      .filter(b => b.is_active !== false)
      .reduce((sum, b) => {
        const planConfig = getPlanConfig(b.plan);
        return sum + planConfig.price;
      }, 0);

    // Revenus du mois en cours
    const currentMonthRevenue = businesses
      .filter(b => {
        const createdDate = new Date(b.created_at);
        return createdDate.getMonth() === currentMonth && 
               createdDate.getFullYear() === currentYear &&
               b.is_active !== false;
      })
      .reduce((sum, b) => {
        const planConfig = getPlanConfig(b.plan);
        return sum + planConfig.price;
      }, 0);

    // Revenus annuels par année
    const yearlyRevenue = {};
    businesses.forEach(b => {
      if (b.is_active === false) return;
      
      const year = new Date(b.created_at).getFullYear();
      const planConfig = getPlanConfig(b.plan);
      
      if (!yearlyRevenue[year]) {
        yearlyRevenue[year] = 0;
      }
      yearlyRevenue[year] += planConfig.price * 12; // ARR
    });

    const yearlyData = Object.entries(yearlyRevenue)
      .sort(([a], [b]) => parseInt(a) - parseInt(b))
      .map(([year, revenue]) => ({
        year,
        revenue: Math.round(revenue)
      }));

    // Répartition par plan
    const planDistribution = [
      { name: 'BASIC', value: 0, color: '#3B82F6' },
      { name: 'PRO', value: 0, color: '#8B5CF6' },
      { name: 'PREMIUM', value: 0, color: '#EC4899' }
    ];

    businesses.forEach(b => {
      if (b.is_active === false) return;
      
      const plan = b.plan.toUpperCase();
      const planConfig = getPlanConfig(b.plan);
      const item = planDistribution.find(p => p.name === plan);
      if (item) {
        item.value += planConfig.price;
      }
    });

    return {
      monthlyRevenue,
      yearlyData,
      planDistribution: planDistribution.filter(p => p.value > 0),
      currentMRR,
      currentMonthRevenue,
      currentYearRevenue: yearlyData.find(y => y.year === currentYear.toString())?.revenue || 0
    };
  };

  const revenueData = calculateRevenue();

  const filteredBusinesses = businesses.filter(b => 
    b.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.city?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeBusinesses = businesses.filter(b => b.is_active !== false).length;
  const suspendedBusinesses = businesses.filter(b => b.is_active === false).length;
  const avgRating = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length).toFixed(1)
    : '0.0';

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 font-semibold text-lg">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* HEADER */}
      <div className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black text-slate-900 mb-1 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Dashboard Admin
              </h1>
              <p className="text-slate-500 font-medium">Gérez vos commerces, avis et clients</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-2xl font-black text-slate-900 flex items-center gap-1">
                  {revenueData.currentMRR}
                  <Euro className="w-6 h-6" />
                </div>
                <div className="text-xs text-slate-500 font-semibold">MRR Total</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard 
            icon={<Store className="w-6 h-6" />}
            label="Total Commerces" 
            value={businesses.length}
            color="blue"
            trend="+12%"
          />
          <StatCard 
            icon={<TrendingUp className="w-6 h-6" />}
            label="Actifs" 
            value={activeBusinesses}
            color="green"
            trend="Opérationnel"
          />
          <StatCard 
            icon={<Star className="w-6 h-6" />}
            label="Note Moyenne" 
            value={avgRating + '/5'}
            color="yellow"
            trend={reviews.length + " avis"}
          />
          <StatCard 
            icon={<Euro className="w-6 h-6" />}
            label="CA Mois en cours" 
            value={revenueData.currentMonthRevenue + '€'}
            color="purple"
            trend="Nouveaux clients"
          />
        </div>

        {/* SEARCH + TABS */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher un commerce, email, ville..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 border-b border-slate-200">
            <TabButton 
              label="Vue d'ensemble" 
              icon={<TrendingUp className="w-4 h-4" />}
              active={activeTab === 'overview'} 
              onClick={() => setActiveTab('overview')} 
            />
            <TabButton 
              label="Commerces" 
              icon={<Store className="w-4 h-4" />}
              count={businesses.length} 
              active={activeTab === 'businesses'} 
              onClick={() => setActiveTab('businesses')} 
            />
            <TabButton 
              label="Finances" 
              icon={<BarChart3 className="w-4 h-4" />}
              active={activeTab === 'finances'} 
              onClick={() => setActiveTab('finances')} 
            />
            <TabButton 
              label="Avis" 
              icon={<Star className="w-4 h-4" />}
              count={reviews.length} 
              active={activeTab === 'reviews'} 
              onClick={() => setActiveTab('reviews')} 
            />
            <TabButton 
              label="Clients" 
              icon={<Users className="w-4 h-4" />}
              count={customers.length} 
              active={activeTab === 'customers'} 
              onClick={() => setActiveTab('customers')} 
            />
          </div>
        </div>

        {/* CONTENT */}
        {activeTab === 'overview' && (
          <OverviewTab 
            businesses={businesses} 
            reviews={reviews} 
            customers={customers} 
            revenueData={revenueData}
            activeBusinesses={activeBusinesses}
            suspendedBusinesses={suspendedBusinesses}
          />
        )}
        
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

        {activeTab === 'finances' && (
          <FinancesTab revenueData={revenueData} businesses={businesses} />
        )}
        
        {activeTab === 'reviews' && (
          <ReviewsTab reviews={reviews} businesses={businesses} />
        )}
        
        {activeTab === 'customers' && (
          <CustomersTab customers={customers} businesses={businesses} />
        )}

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

// 📊 FINANCES TAB (NOUVEAU)
function FinancesTab({ revenueData, businesses }) {
  const COLORS = ['#3B82F6', '#8B5CF6', '#EC4899'];

  return (
    <div className="space-y-6">
      {/* CA Mensuels + Annuels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg p-6 text-white">
          <div className="flex items-center gap-3 mb-2">
            <Euro className="w-8 h-8" />
            <div className="text-sm font-semibold opacity-90">MRR Actuel</div>
          </div>
          <div className="text-4xl font-black">{revenueData.currentMRR}€</div>
          <div className="text-sm opacity-80 mt-1">Revenus mensuels récurrents</div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-8 h-8" />
            <div className="text-sm font-semibold opacity-90">CA Mois en cours</div>
          </div>
          <div className="text-4xl font-black">{revenueData.currentMonthRevenue}€</div>
          <div className="text-sm opacity-80 mt-1">Nouveaux abonnements</div>
        </div>

        <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl shadow-lg p-6 text-white">
          <div className="flex items-center gap-3 mb-2">
            <BarChart3 className="w-8 h-8" />
            <div className="text-sm font-semibold opacity-90">ARR {new Date().getFullYear()}</div>
          </div>
          <div className="text-4xl font-black">{revenueData.currentYearRevenue}€</div>
          <div className="text-sm opacity-80 mt-1">Revenus annuels récurrents</div>
        </div>
      </div>

      {/* Graphique Mensuel */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          Chiffre d'affaires mensuel (12 derniers mois)
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={revenueData.monthlyRevenue}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis 
              dataKey="shortMonth" 
              stroke="#64748B"
              style={{ fontSize: '12px', fontWeight: 600 }}
            />
            <YAxis 
              stroke="#64748B"
              style={{ fontSize: '12px', fontWeight: 600 }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1E293B', 
                border: 'none', 
                borderRadius: '12px',
                color: 'white',
                fontWeight: 'bold'
              }}
              formatter={(value) => [` $ {value}€`, 'CA']}
            />
            <Line 
              type="monotone" 
              dataKey="revenue" 
              stroke="#3B82F6" 
              strokeWidth={3}
              dot={{ fill: '#3B82F6', r: 5 }}
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Graphique Annuel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-purple-600" />
            Évolution ARR par année
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueData.yearlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis 
                dataKey="year" 
                stroke="#64748B"
                style={{ fontSize: '12px', fontWeight: 600 }}
              />
              <YAxis 
                stroke="#64748B"
                style={{ fontSize: '12px', fontWeight: 600 }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1E293B', 
                  border: 'none', 
                  borderRadius: '12px',
                  color: 'white',
                  fontWeight: 'bold'
                }}
                formatter={(value) => [` $ {value}€`, 'ARR']}
              />
              <Bar dataKey="revenue" fill="#8B5CF6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Répartition par plan */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-6">
            Répartition MRR par plan
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={revenueData.planDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => ` $ {name}  $ {(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {revenueData.planDistribution.map((entry, index) => (
                  <Cell key={`cell- $ {index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1E293B', 
                  border: 'none', 
                  borderRadius: '12px',
                  color: 'white',
                  fontWeight: 'bold'
                }}
                formatter={(value) => [` $ {value}€/mois`]}
              />
            </PieChart>
          </ResponsiveContainer>
          
          <div className="grid grid-cols-3 gap-3 mt-6">
            {revenueData.planDistribution.map((plan) => (
              <div key={plan.name} className="bg-slate-50 rounded-xl p-4 text-center border border-slate-200">
                <div 
                  className="w-4 h-4 rounded-full mx-auto mb-2" 
                  style={{ backgroundColor: plan.color }}
                />
                <div className="text-xs text-slate-500 font-semibold mb-1">{plan.name}</div>
                <div className="text-lg font-black text-slate-900">{plan.value}€</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Comparaison années */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-xl font-bold text-slate-900 mb-6">
          Comparaison annuelle
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-slate-200">
                <th className="text-left p-4 text-slate-600 font-bold">Année</th>
                <th className="text-right p-4 text-slate-600 font-bold">ARR</th>
                <th className="text-right p-4 text-slate-600 font-bold">Croissance</th>
              </tr>
            </thead>
            <tbody>
              {revenueData.yearlyData.map((year, index) => {
                const prevYear = revenueData.yearlyData[index - 1];
                const growth = prevYear 
                  ? (((year.revenue - prevYear.revenue) / prevYear.revenue) * 100).toFixed(1)
                  : null;

                return (
                  <tr key={year.year} className="border-b border-slate-100">
                    <td className="p-4 font-bold text-slate-900">{year.year}</td>
                    <td className="p-4 text-right font-bold text-slate-900">
                      {year.revenue.toLocaleString('fr-FR')}€
                    </td>
                    <td className="p-4 text-right">
                      {growth ? (
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold  $ {
                          parseFloat(growth) >= 0 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {parseFloat(growth) >= 0 ? '↗' : '↘'}
                          {Math.abs(parseFloat(growth))}%
                        </span>
                      ) : (
                        <span className="text-slate-400 text-sm font-semibold">-</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// 📊 STAT CARD
function StatCard({ icon, label, value, color, trend }) {
  const colors = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    yellow: 'from-yellow-500 to-yellow-600',
    purple: 'from-purple-500 to-purple-600'
  };

  const bgColors = {
    blue: 'bg-blue-50',
    green: 'bg-green-50',
    yellow: 'bg-yellow-50',
    purple: 'bg-purple-50'
  };

  const iconColors = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    yellow: 'text-yellow-600',
    purple: 'text-purple-600'
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-lg transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className={` $ {bgColors[color]} p-3 rounded-xl  $ {iconColors[color]}`}>
          {icon}
        </div>
        {trend && (
          <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
            {trend}
          </span>
        )}
      </div>
      <div className="text-sm font-semibold text-slate-500 mb-1">{label}</div>
      <div className="text-3xl font-black text-slate-900">{value}</div>
    </div>
  );
}

// 🔘 TAB BUTTON
function TabButton({ label, icon, count, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-5 py-3 rounded-xl font-semibold whitespace-nowrap transition-all  $ {
        active
          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/30'
          : 'text-slate-600 hover:bg-slate-50'
      }`}
    >
      {icon}
      <span>{label}</span>
      {count !== undefined && (
        <span className={`text-xs px-2 py-0.5 rounded-full  $ {
          active ? 'bg-white/20' : 'bg-slate-200'
        }`}>
          {count}
        </span>
      )}
    </button>
  );
}

// 📊 OVERVIEW TAB
function OverviewTab({ businesses, reviews, customers, revenueData, activeBusinesses, suspendedBusinesses }) {
  const recentBusinesses = businesses.slice(0, 5);
  const recentReviews = reviews.slice(0, 8);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Derniers commerces */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Store className="w-5 h-5 text-blue-600" />
            Derniers commerces
          </h2>
          <span className="text-sm text-slate-500 font-semibold">{businesses.length} total</span>
        </div>
        <div className="space-y-3">
          {recentBusinesses.map(biz => {
            const planConfig = getPlanConfig(biz.plan);
            const isActive = biz.is_active !== false;
            
            return (
              <div key={biz.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors border border-slate-100">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="font-bold text-slate-900">{biz.name || 'Sans nom'}</div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold  $ {
                      isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {isActive ? '✓ Actif' : '✕ Suspendu'}
                    </span>
                  </div>
                  <div className="text-sm text-slate-500">{biz.email}</div>
                  <div className="text-xs text-slate-400 mt-1">{biz.city || 'Ville non renseignée'}</div>
                </div>
                <div className="text-right ml-4">
                  <div className={`text-sm font-bold px-3 py-1 rounded-lg  $ {
                    planConfig.color === 'blue' ? 'bg-blue-100 text-blue-700' :
                    planConfig.color === 'purple' ? 'bg-purple-100 text-purple-700' :
                    'bg-pink-100 text-pink-700'
                  }`}>
                    {planConfig.name}
                  </div>
                  <div className="text-xs text-slate-500 mt-1 font-semibold flex items-center gap-1 justify-end">
                    {planConfig.price}
                    <Euro className="w-3 h-3" />
                    /mois
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Derniers avis */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-600" />
            Derniers avis
          </h2>
          <span className="text-sm text-slate-500 font-semibold">{reviews.length} total</span>
        </div>
        <div className="space-y-3 max-h-[600px] overflow-y-auto">
          {recentReviews.length > 0 ? (
            recentReviews.map(review => {
              const business = businesses.find(b => b.id === review.business_id);
              return (
                <div key={review.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100 hover:bg-slate-100 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-semibold text-slate-900">{review.customer_name || 'Anonyme'}</div>
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`w-4 h-4  $ {i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300'}`} 
                        />
                      ))}
                    </div>
                  </div>
                  {review.comment && (
                    <p className="text-sm text-slate-600 mb-2 line-clamp-2">{review.comment}</p>
                  )}
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="font-semibold">{business?.name || 'Commerce supprimé'}</span>
                    <span>{new Date(review.created_at).toLocaleDateString('fr-FR')}</span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-12">
              <Star className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-400 font-semibold">Aucun avis pour le moment</p>
            </div>
          )}
        </div>
      </div>

      {/* Stats supplémentaires */}
      <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg p-6 text-white">
          <div className="text-3xl font-black mb-2">{activeBusinesses}</div>
          <div className="text-blue-100 font-semibold">Commerces Actifs</div>
          <div className="text-xs text-blue-200 mt-2">En exploitation</div>
        </div>
        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl shadow-lg p-6 text-white">
          <div className="text-3xl font-black mb-2">{suspendedBusinesses}</div>
          <div className="text-red-100 font-semibold">Commerces Suspendus</div>
          <div className="text-xs text-red-200 mt-2">Non-paiement</div>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-lg p-6 text-white">
          <div className="text-3xl font-black mb-2">{customers.length}</div>
          <div className="text-green-100 font-semibold">Clients Totaux</div>
          <div className="text-xs text-green-200 mt-2">Base de données</div>
        </div>
      </div>
    </div>
  );
}

// 🏢 BUSINESSES TAB (Code identique, juste ajout symbole €)
function BusinessesTab({ businesses, reviews, customers, onUpdatePlan, onToggleStatus, onDelete, onViewDetails }) {
  if (businesses.length === 0) {
    return <EmptyState icon={<Store className="w-16 h-16" />} message="Aucun commerce trouvé" />;
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left p-4 text-slate-600 font-bold text-sm">Statut</th>
              <th className="text-left p-4 text-slate-600 font-bold text-sm">Commerce</th>
              <th className="text-left p-4 text-slate-600 font-bold text-sm">Contact</th>
              <th className="text-left p-4 text-slate-600 font-bold text-sm">Localisation</th>
              <th className="text-left p-4 text-slate-600 font-bold text-sm">Plan</th>
              <th className="text-center p-4 text-slate-600 font-bold text-sm">Avis</th>
              <th className="text-center p-4 text-slate-600 font-bold text-sm">Clients</th>
              <th className="text-center p-4 text-slate-600 font-bold text-sm">Actions</th>
            </tr>
          </thead>
          <tbody>
            {businesses.map((biz) => {
              const planConfig = getPlanConfig(biz.plan);
              const isActive = biz.is_active !== false;
              const bizReviews = reviews.filter(r => r.business_id === biz.id);
              const bizCustomers = customers.filter(c => c.business_id === biz.id);

              return (
                <tr key={biz.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold  $ {
                      isActive 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {isActive ? '✓' : '✕'}
                      {isActive ? 'Actif' : 'Suspendu'}
                    </span>
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => onViewDetails(biz)}
                      className="text-left hover:text-blue-600 transition-colors"
                    >
                      <div className="font-bold text-slate-900">{biz.name || 'Sans nom'}</div>
                      <div className="text-xs text-slate-400 mt-0.5">ID: {biz.id.slice(0, 8)}...</div>
                    </button>
                  </td>
                  <td className="p-4">
                    <div className="text-sm text-slate-900 font-medium">{biz.email}</div>
                    {biz.phone && (
                      <div className="text-xs text-slate-500 mt-0.5">{biz.phone}</div>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="text-sm text-slate-900 font-medium">{biz.city || 'N/A'}</div>
                    {biz.address && (
                      <div className="text-xs text-slate-500 mt-0.5 max-w-xs truncate">{biz.address}</div>
                    )}
                  </td>
                  <td className="p-4">
                    <select
                      value={biz.plan}
                      onChange={(e) => onUpdatePlan(biz.id, e.target.value)}
                      disabled={!isActive}
                      className={`px-3 py-2 rounded-lg text-sm font-bold border-2 cursor-pointer transition-all  $ {
                        planConfig.color === 'blue' ? 'bg-blue-50 border-blue-300 text-blue-700 hover:bg-blue-100' :
                        planConfig.color === 'purple' ? 'bg-purple-50 border-purple-300 text-purple-700 hover:bg-purple-100' :
                        'bg-pink-50 border-pink-300 text-pink-700 hover:bg-pink-100'
                      }  $ {!isActive ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <option value="basic">BASIC - 29€</option>
                      <option value="pro">PRO - 59€</option>
                      <option value="premium">PREMIUM - 99€</option>
                    </select>
                  </td>
                  <td className="p-4 text-center">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-yellow-50 rounded-lg">
                      <Star className="w-4 h-4 text-yellow-600 fill-yellow-600" />
                      <span className="text-sm font-bold text-yellow-700">{bizReviews.length}</span>
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 rounded-lg">
                      <Users className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-bold text-blue-700">{bizCustomers.length}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2 justify-center">
                      <a
                        href={`/ $ {biz.slug || biz.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors"
                        title="Voir la page"
                      >
                        <Eye className="w-4 h-4" />
                      </a>
                      <button
                        onClick={() => onToggleStatus(biz.id, isActive)}
                        className={`p-2 rounded-lg transition-colors  $ {
                          isActive 
                            ? 'bg-orange-100 hover:bg-orange-200 text-orange-700' 
                            : 'bg-green-100 hover:bg-green-200 text-green-700'
                        }`}
                        title={isActive ? 'Désactiver' : 'Activer'}
                      >
                        {isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => onDelete(biz.id)}
                        className="p-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
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

// ⭐ REVIEWS TAB (identique)
function ReviewsTab({ reviews, businesses }) {
  if (reviews.length === 0) {
    return <EmptyState icon={<Star className="w-16 h-16" />} message="Aucun avis trouvé" />;
  }

  const reviewsByBusiness = businesses.map(biz => ({
    business: biz,
    reviews: reviews.filter(r => r.business_id === biz.id)
  })).filter(item => item.reviews.length > 0);

  return (
    <div className="space-y-6">
      {reviewsByBusiness.map(({ business, reviews }) => (
        <div key={business.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-3 rounded-xl">
                <Store className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">{business.name || 'Sans nom'}</h3>
                <p className="text-sm text-slate-500">{reviews.length} avis</p>
              </div>
            </div>
            <a
              href={`/ $ {business.slug || business.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors"
            >
              <Eye className="w-4 h-4" />
              Voir la page
            </a>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reviews.map(review => (
              <div key={review.id} className="bg-slate-50 rounded-xl p-4 border border-slate-200 hover:shadow-md transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="font-bold text-slate-900">{review.customer_name || 'Anonyme'}</div>
                    <div className="text-xs text-slate-400">
                      {new Date(review.created_at).toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-4 h-4  $ {i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300'}`} 
                      />
                    ))}
                  </div>
                </div>
                {review.comment && (
                  <p className="text-sm text-slate-600 line-clamp-3">{review.comment}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// 👥 CUSTOMERS TAB (identique)
function CustomersTab({ customers, businesses }) {
  if (customers.length === 0) {
    return <EmptyState icon={<Users className="w-16 h-16" />} message="Aucun client trouvé" />;
  }

  const customersByBusiness = businesses.map(biz => ({
    business: biz,
    customers: customers.filter(c => c.business_id === biz.id)
  })).filter(item => item.customers.length > 0);

  return (
    <div className="space-y-6">
      {customersByBusiness.map(({ business, customers }) => (
        <div key={business.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 p-3 rounded-xl">
                <Store className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">{business.name || 'Sans nom'}</h3>
                <p className="text-sm text-slate-500">{customers.length} clients</p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {customers.map(customer => (
              <div key={customer.id} className="bg-slate-50 rounded-xl p-4 border border-slate-200 hover:shadow-md transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <Users className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-slate-900 truncate">{customer.name || 'Sans nom'}</div>
                  </div>
                </div>
                {customer.email && (
                  <div className="flex items-center gap-2 text-xs text-slate-600 mb-1">
                    <Mail className="w-3 h-3 text-slate-400" />
                    <span className="truncate">{customer.email}</span>
                  </div>
                )}
                {customer.phone && (
                  <div className="flex items-center gap-2 text-xs text-slate-600 mb-1">
                    <Phone className="w-3 h-3 text-slate-400" />
                    <span>{customer.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-xs text-slate-400 mt-2">
                  <Calendar className="w-3 h-3" />
                  <span>{new Date(customer.created_at).toLocaleDateString('fr-FR')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// 🔍 BUSINESS MODAL (identique avec symbole €)
function BusinessModal({ business, reviews, customers, onClose }) {
  const planConfig = getPlanConfig(business.plan);
  const isActive = business.is_active !== false;
  const avgRating = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '0.0';
  
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        {/* HEADER */}
        <div className={`bg-gradient-to-r  $ {isActive ? 'from-blue-600 to-purple-600' : 'from-gray-500 to-gray-700'} p-8 text-white rounded-t-3xl`}>
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h2 className="text-3xl font-black mb-2">{business.name || 'Commerce'}</h2>
              <p className="text-white/90 text-lg">{business.email}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`px-4 py-2 rounded-xl text-sm font-bold  $ {
                isActive ? 'bg-green-500' : 'bg-red-500'
              }`}>
                {isActive ? '✓ Actif' : '✕ Suspendu'}
              </span>
              <span className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-1  $ {
                planConfig.color === 'blue' ? 'bg-blue-700' :
                planConfig.color === 'purple' ? 'bg-purple-700' :
                'bg-pink-700'
              }`}>
                {planConfig.name} - {planConfig.price}
                <Euro className="w-4 h-4" />
                /mois
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
              <div className="text-3xl font-black">{reviews.length}</div>
              <div className="text-white/80 text-sm font-semibold">Avis</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
              <div className="text-3xl font-black">{avgRating}/5</div>
              <div className="text-white/80 text-sm font-semibold">Note</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
              <div className="text-3xl font-black">{customers.length}</div>
              <div className="text-white/80 text-sm font-semibold">Clients</div>
            </div>
          </div>
        </div>
        
        <div className="p-8">
          {/* INFOS */}
          <div className="bg-slate-50 rounded-2xl p-6 mb-6 border border-slate-200">
            <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-blue-600" />
              Informations détaillées
            </h3>
            <div className="grid grid-cols-2 gap-6">
              <InfoItem 
                icon={<MapPin className="w-4 h-4" />}
                label="Adresse" 
                value={business.address || 'Non renseignée'} 
              />
              <InfoItem 
                icon={<MapPin className="w-4 h-4" />}
                label="Ville" 
                value={business.city || 'Non renseignée'} 
              />
              <InfoItem 
                icon={<Phone className="w-4 h-4" />}
                label="Téléphone" 
                value={business.phone || 'Non renseigné'} 
              />
              <InfoItem 
                icon={<Mail className="w-4 h-4" />}
                label="Email" 
                value={business.email} 
              />
              <InfoItem 
                icon={<Calendar className="w-4 h-4" />}
                label="Inscrit le" 
                value={new Date(business.created_at).toLocaleDateString('fr-FR')} 
              />
              <InfoItem 
                label="Slug URL" 
                value={business.slug || 'Non défini'} 
              />
            </div>
          </div>

          {/* AVIS */}
          {reviews.length > 0 && (
            <div className="bg-slate-50 rounded-2xl p-6 mb-6 border border-slate-200">
              <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-600" />
                Derniers avis ({reviews.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-80 overflow-y-auto">
                {reviews.slice(0, 10).map(review => (
                  <div key={review.id} className="bg-white rounded-xl p-4 border border-slate-200">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-bold text-slate-900">{review.customer_name || 'Anonyme'}</span>
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-4 h-4  $ {i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300'}`} 
                          />
                        ))}
                      </div>
                    </div>
                    {review.comment && (
                      <p className="text-sm text-slate-600 mb-2">{review.comment}</p>
                    )}
                    <p className="text-xs text-slate-400">
                      {new Date(review.created_at).toLocaleDateString('fr-FR')}
                    </p>
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
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-80 overflow-y-auto">
                {customers.map(customer => (
                  <div key={customer.id} className="bg-white rounded-xl p-4 border border-slate-200">
                    <div className="font-bold text-slate-900 mb-1">{customer.name || 'Sans nom'}</div>
                    <div className="text-xs text-slate-600 mb-0.5">{customer.email || 'N/A'}</div>
                    <div className="text-xs text-slate-600">{customer.phone || 'N/A'}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ACTIONS */}
          <div className="flex gap-4">
            <a
              href={`/ $ {business.slug || business.id}`}
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
    <div className="bg-white rounded-2xl shadow-sm border border-slate
