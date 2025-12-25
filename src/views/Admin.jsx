import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { getPlanPrice, getPlanLabel } from '../lib/plans';
import { 
  Users, Store, TrendingUp, DollarSign, Eye,
  Calendar, Star, Activity, Package, BarChart3,
  Edit, Trash2, CheckCircle, XCircle, ArrowUpRight
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function Admin() {
  const [businesses, setBusinesses] = useState([]);
  const [stats, setStats] = useState({
    totalBusinesses: 0,
    totalRevenue: 0,
    activeSubscriptions: 0,
    avgRating: 0
  });
  const [monthlyData, setMonthlyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  
  // ✅ ÉVITE LES RECHARGEMENTS MULTIPLES
  const hasLoadedRef = useRef(false);

  // ✅ CHARGE UNE SEULE FOIS AU MONTAGE
  useEffect(() => {
    if (!hasLoadedRef.current) {
      hasLoadedRef.current = true;
      fetchData();
    }
  }, []);

  // ✅ RECHARGE UNIQUEMENT SI L'ANNÉE CHANGE
  useEffect(() => {
    if (hasLoadedRef.current && !loading) {
      fetchMonthlyData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedYear]);

  const fetchData = async () => {
    try {
      console.log('📊 [Admin] Chargement des entreprises...');

      const { data: businessData, error: businessError } = await supabase
        .from('business_profile')
        .select('*')
        .order('created_at', { ascending: false });

      if (businessError) {
        console.error('❌ [Admin] Erreur business:', businessError);
        throw businessError;
      }

      console.log('✅ [Admin] Entreprises chargées:', businessData?.length);
      setBusinesses(businessData || []);

      // Calcul des stats
      const totalRevenue = businessData?.reduce((sum, b) => {
        const price = Number(b.subscription_price) || 0;
        return sum + price;
      }, 0) || 0;

      const activeCount = businessData?.filter(b => b.subscription_status === 'active').length || 0;

      const avgRating = businessData?.length > 0
        ? businessData.reduce((sum, b) => sum + (Number(b.average_rating) || 0), 0) / businessData.length
        : 0;

      setStats({
        totalBusinesses: businessData?.length || 0,
        totalRevenue: totalRevenue,
        activeSubscriptions: activeCount,
        avgRating: avgRating
      });

      await fetchMonthlyData();

    } catch (error) {
      console.error('❌ [Admin] Erreur fetchData:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMonthlyData = async () => {
    try {
      console.log('📈 [Admin] Chargement données mensuelles...');
      
      const startDate = new Date(selectedYear, 0, 1);
      const endDate = new Date(selectedYear, 11, 31);

      const { data, error } = await supabase
        .from('business_profile')
        .select('created_at, subscription_price')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      if (error) throw error;

      const monthlyStats = Array.from({ length: 12 }, (_, i) => ({
        month: new Date(selectedYear, i).toLocaleDateString('fr-FR', { month: 'short' }),
        inscriptions: 0,
        revenue: 0
      }));

      data?.forEach(business => {
        const month = new Date(business.created_at).getMonth();
        monthlyStats[month].inscriptions += 1;
        monthlyStats[month].revenue += Number(business.subscription_price) || 0;
      });

      console.log('✅ [Admin] Données mensuelles:', monthlyStats);
      setMonthlyData(monthlyStats);

    } catch (error) {
      console.error('❌ [Admin] Erreur fetchMonthlyData:', error);
    }
  };

  const updateSubscriptionStatus = async (businessId, newStatus) => {
    try {
      const { error } = await supabase
        .from('business_profile')
        .update({ subscription_status: newStatus })
        .eq('id', businessId);

      if (error) throw error;

      setBusinesses(prev =>
        prev.map(b => b.id === businessId ? { ...b, subscription_status: newStatus } : b)
      );

      alert(`✅ Statut mis à jour : ${newStatus}`);
    } catch (error) {
      console.error('❌ Erreur updateSubscriptionStatus:', error);
      alert('❌ Erreur lors de la mise à jour');
    }
  };

  const deleteBusiness = async (businessId) => {
    if (!confirm('⚠️ Supprimer cette entreprise ? Cette action est irréversible.')) return;

    try {
      const { error } = await supabase
        .from('business_profile')
        .delete()
        .eq('id', businessId);

      if (error) throw error;

      setBusinesses(prev => prev.filter(b => b.id !== businessId));
      alert('✅ Entreprise supprimée');
    } catch (error) {
      console.error('❌ Erreur deleteBusiness:', error);
      alert('❌ Erreur lors de la suppression');
    }
  };

  const filteredBusinesses = businesses.filter(b => {
    if (filter === 'all') return true;
    if (filter === 'active') return b.subscription_status === 'active';
    if (filter === 'inactive') return b.subscription_status === 'inactive';
    if (filter === 'trial') return b.subscription_status === 'trial';
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-200 border-t-indigo-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Chargement du tableau de bord admin...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-6">
      {/* RESTE DU CODE JSX IDENTIQUE... */}
      {/* (Garde tout le reste tel quel) */}
    </div>
  );
}
