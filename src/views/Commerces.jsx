import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
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
    caLastYear: 0
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
      console.error('Erreur:', error.message);
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

      const { data: allData } = await supabase
        .from('commerces')
        .select('chiffre_affaire, created_at');

      if (allData) {
        const totalCA = allData.reduce((sum, c) => sum + (c.chiffre_affaire || 0), 0);
        
        const caThisMonth = allData
          .filter(c => {
            const date = new Date(c.created_at);
            return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
          })
          .reduce((sum, c) => sum + (c.chiffre_affaire || 0), 0);

        const caLastMonth = allData
          .filter(c => {
            const date = new Date(c.created_at);
            return date.getMonth() === lastMonth && date.getFullYear() === lastMonthYear;
          })
          .reduce((sum, c) => sum + (c.chiffre_affaire || 0), 0);

        const caThisYear = allData
          .filter(c => new Date(c.created_at).getFullYear() === currentYear)
          .reduce((sum, c) => sum + (c.chiffre_affaire || 0), 0);

        const caLastYear = allData
          .filter(c => new Date(c.created_at).getFullYear() === currentYear - 1)
          .reduce((sum, c) => sum + (c.chiffre_affaire || 0), 0);

        setStats({ totalCA, caThisMonth, caLastMonth, caThisYear, caLastYear });
      }
    } catch (error) {
      console.error('Erreur stats:', error);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount || 0);
  };

  const calculateGrowth = (current, previous) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous * 100).toFixed(1);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Building2 className="w-8 h-8 text-blue-600" />
          Gestion des Commerces
        </h1>
        <p className="text-gray-600 mt-2">Vue d'ensemble de vos commerces et statistiques financières</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* CA Total */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <Euro className="w-8 h-8 opacity-80" />
            <DollarSign className="w-6 h-6 opacity-60" />
          </div>
          <div className="text-3xl font-bold mb-1">{formatCurrency(stats.totalCA)}</div>
          <div className="text-blue-100 text-sm">Chiffre d'affaires total</div>
        </div>

        {/* CA Mois en cours */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <Calendar className="w-8 h-8 text-green-600" />
            <div className={`text-sm font-semibold px-2 py-1 rounded ${
              calculateGrowth(stats.caThisMonth, stats.caLastMonth) >= 0 
                ? 'bg-green-100 text-green-700' 
                : 'bg-red-100 text-red-700'
            }`}>
              {calculateGrowth(stats.caThisMonth, stats.caLastMonth) >= 0 ? '+' : ''}
              {calculateGrowth(stats.caThisMonth, stats.caLastMonth)}%
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {formatCurrency(stats.caThisMonth)}
          </div>
          <div className="text-gray-600 text-sm">Ce mois-ci</div>
          <div className="text-gray-400 text-xs mt-1">
            vs {formatCurrency(stats.caLastMonth)} le mois dernier
          </div>
        </div>

        {/* CA Année en cours */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <TrendingUp className="w-8 h-8 text-purple-600" />
            <div className={`text-sm font-semibold px-2 py-1 rounded ${
              calculateGrowth(stats.caThisYear, stats.caLastYear) >= 0 
                ? 'bg-green-100 text-green-700' 
                : 'bg-red-100 text-red-700'
            }`}>
              {calculateGrowth(stats.caThisYear, stats.caLastYear) >= 0 ? '+' : ''}
              {calculateGrowth(stats.caThisYear, stats.caLastYear)}%
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {formatCurrency(stats.caThisYear)}
          </div>
          <div className="text-gray-600 text-sm">Cette année</div>
          <div className="text-gray-400 text-xs mt-1">
            vs {formatCurrency(stats.caLastYear)} l'année dernière
          </div>
        </div>

        {/* Nombre de commerces */}
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <Building2 className="w-8 h-8 opacity-80" />
            <BarChart3 className="w-6 h-6 opacity-60" />
          </div>
          <div className="text-3xl font-bold mb-1">{commerces.length}</div>
          <div className="text-orange-100 text-sm">Commerces actifs</div>
        </div>
      </div>

      {/* Liste des commerces */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Liste des commerces</h2>
        </div>

        {commerces.length === 0 ? (
          <div className="p-12 text-center">
            <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Aucun commerce enregistré</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
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
                    Date
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
