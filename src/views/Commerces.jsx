import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Store, MapPin, Star, TrendingUp, Users } from 'lucide-react';

export default function Commerces() {
  const [commerces, setCommerces] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCommerces();
  }, []);

  async function loadCommerces() {
    try {
      // Récupérer tous les commerces
      const { data: commercesData, error: commercesError } = await supabase
        .from('commerces')
        .select('*')
        .order('created_at', { ascending: false });

      if (commercesError) throw commercesError;

      // Pour chaque commerce, récupérer ses avis
      const commercesWithStats = await Promise.all(
        (commercesData || []).map(async (commerce) => {
          const { data: avisData, error: avisError } = await supabase
            .from('avis')
            .select('*')
            .eq('commerce_id', commerce.id);

          if (avisError) {
            console.error('Erreur avis:', avisError);
            return { ...commerce, stats: { total: 0, moyenne: 0, recent: 0 } };
          }

          const total = avisData?.length || 0;
          const moyenne = total > 0
            ? (avisData.reduce((sum, a) => sum + (a.note || 0), 0) / total).toFixed(1)
            : 0;

          // Avis des 30 derniers jours
          const dateLimit = new Date();
          dateLimit.setDate(dateLimit.getDate() - 30);
          const recent = avisData?.filter(a => 
            new Date(a.created_at) > dateLimit
          ).length || 0;

          return {
            ...commerce,
            stats: { total, moyenne, recent }
          };
        })
      );

      setCommerces(commercesWithStats);
    } catch (error) {
      console.error('Erreur chargement commerces:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* En-tête */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Store className="w-8 h-8 text-blue-600" />
          Commerces Partenaires
        </h1>
        <p className="mt-2 text-gray-600">
          {commerces.length} commerce{commerces.length > 1 ? 's' : ''} inscrit{commerces.length > 1 ? 's' : ''}
        </p>
      </div>

      {/* Liste des commerces */}
      {commerces.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <Store className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">Aucun commerce inscrit pour le moment</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {commerces.map((commerce) => (
            <div
              key={commerce.id}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6"
            >
              {/* Nom et adresse */}
              <div className="mb-4">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {commerce.nom}
                </h3>
                <div className="flex items-start gap-2 text-gray-600">
                  <MapPin className="w-4 h-4 mt-1 flex-shrink-0" />
                  <span className="text-sm">{commerce.adresse}</span>
                </div>
              </div>

              {/* Statistiques */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                {/* Total avis */}
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-blue-600 mb-1">
                    <Users className="w-4 h-4" />
                    <span className="text-2xl font-bold">{commerce.stats.total}</span>
                  </div>
                  <p className="text-xs text-gray-500">Avis total</p>
                </div>

                {/* Note moyenne */}
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-yellow-500 mb-1">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="text-2xl font-bold">{commerce.stats.moyenne}</span>
                  </div>
                  <p className="text-xs text-gray-500">Moyenne</p>
                </div>

                {/* Avis récents */}
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-green-600 mb-1">
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-2xl font-bold">{commerce.stats.recent}</span>
                  </div>
                  <p className="text-xs text-gray-500">Ce mois</p>
                </div>
              </div>

              {/* Date d'inscription */}
              <div className="mt-4 pt-4 border-t">
                <p className="text-xs text-gray-400">
                  Inscrit le {new Date(commerce.created_at).toLocaleDateString('fr-FR')}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
