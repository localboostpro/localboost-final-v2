import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import {
  Building2,
  MapPin,
  Star,
  TrendingUp,
  Calendar,
  DollarSign,
  BarChart3,
  Euro
} from 'lucide-react';

export default function Commerces() {
  const [commerces, setCommerces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCA: 0,
    caThisMonth: 0,
    caLastMonth: 0,
    caThisYear: 0,
    caLastYear: 0,
    growthMonth: 0,
    growthYear: 0
  });

  useEffect(() => {
    fetchCommerces();
    fetchStats();
  }, []);

  const fetchCommerces = async () => {
    try {
      const { data, error } = await supabase
        .from('commerces')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCommerces(data || []);
    } catch (error) {
      console.error('Erreur chargement commerces:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

      const { data: allData, error } = await supabase
        .from('commerces')
        .select('chiffre_affaire, created_at');

      if (error) throw error;

      if (allData && allData.length > 0) {
        const totalCA = allData.reduce((sum, c) => sum + (parseFloat(c.chiffre_affaire) || 0), 0);
        
        const caThisMonth = allData
          .filter(c => {
            const date = new Date(c.created_at);
            return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
          })
          .reduce((sum, c) => sum + (parseFloat(c.chiffre_affaire) || 0), 0);

        const caLastMonth = allData
          .filter(c => {
            const date = new Date(c.created_at);
            return date.getMonth() === lastMonth && date.getFullYear() === lastMonthYear;
          })
          .reduce((sum, c) => sum + (parseFloat(c.chiffre_affaire) || 0), 0);

        const caThisYear = allData
          .filter(c => new Date(c.created_at).getFullYear() === currentYear)
          .reduce((sum, c) => sum + (parseFloat(c.chiffre_affaire) || 0), 0);

        const caLastYear = allData
          .filter(c => new Date(c.created_at).getFullYear() === currentYear - 1)
          .reduce((sum, c) => sum + (parseFloat(c.chiffre_affaire) || 0), 0);

        const growthMonth = caLastMonth > 0 
          ? ((caThisMonth - caLastMonth) / caLastMonth * 100).toFixed(1)
          : 0;

        const growthYear = caLastYear > 0 
          ? ((caThisYear - caLastYear) / caLastYear * 100).toFixed(1)
          : 0;

        setStats({
          totalCA,
          caThisMonth,
          caLastMonth,
          caThisYear,
          caLastYear,
          growthMonth: parseFloat(growthMonth),
          growthYear: parseFloat(growthYear)
        });
      }
    } catch (error) {
      console.error('Erreur calcul stats:', error.message);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  const StatCard = ({ icon: Icon, title, value, subValue, growth, color }) => (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {growth !== undefined && (
          <div className={`flex items-center gap-1 text-sm font-medium ${
            growth >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            <TrendingUp className={`w-4 h-4 ${growth < 0 ? 'rotate-180' : ''}`} />
            {growth >= 0 ? '+' : ''}{growth}%
          </div>
        )}
      </div>
      <h3 className="text-gray-600 text-sm font-medium mb-1">{title}</h3>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      {subValue && <p className="text-sm text-gray-500 mt-1">{subValue}</p>}
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des commerces...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* En-tête */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Building2 className="w-8 h-8 text-indigo-600" />
          Gestion des Commerces
        </h1>
        <p className="text-gray-600 mt-2">
          Vue d'ensemble et statistiques de tous les commerces
        </p>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={Building2}
          title="Commerces actifs"
          value={commerces.length}
          color="bg-indigo-600"
        />
        
        <StatCard
          icon={Euro}
          title="CA Total"
          value={formatCurrency(stats.totalCA)}
          color="bg-green-600"
        />
        
        <StatCard
          icon={Calendar}
          title="CA du mois"
          value={formatCurrency(stats.caThisMonth)}
          subValue={`Mois dernier: ${formatCurrency(stats.caLastMonth)}`}
          growth={stats.growthMonth}
          color="bg-blue-600"
        />
        
        <StatCard
          icon={BarChart3}
          title="CA de l'année"
          value={formatCurrency(stats.caThisYear)}
          subValue={`Année dernière: ${formatCurrency(stats.caLastYear)}`}
          growth={stats.growthYear}
          color="bg-purple-600"
        />
      </div>

      {/* Tableau des commerces */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">
            Liste des commerces ({commerces.length})
          </h2>
        </div>

        {commerces.length === 0 ? (
          <div className="text-center py-12">
            <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">Aucun commerce enregistré</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Commerce
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Localisation
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Note
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    CA
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date d'inscription
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {commerces.map((commerce) => (
                  <tr key={commerce.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{commerce.nom}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-gray-600">
                        <MapPin className="w-4 h-4 mr-1" />
                        {commerce.ville}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                        <span className="font-medium">{commerce.note || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-semibold text-green-600">
                        {formatCurrency(commerce.chiffre_affaire)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(commerce.created_at).toLocaleDateString('fr-FR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
