import { X, Zap, Sparkles } from 'lucide-react';
import { PLANS } from '../lib/plans';

export default function UpgradeModal({ isOpen, onClose, requiredPlan, feature }) {
  if (!isOpen) return null;

  const plan = PLANS[requiredPlan];
  const featureNames = {
    marketingStudio: 'Studio Marketing',
    landingPage: 'Page Établissement',
    aiPosts: 'Génération de posts IA'
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-8 relative animate-in fade-in zoom-in duration-300">
        {/* Bouton fermer */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X size={24} />
        </button>

        {/* Icône */}
        <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-3xl mb-4">
          {plan.icon}
        </div>

        {/* Titre */}
        <h3 className="text-2xl font-black text-gray-900 mb-2">
          Fonctionnalité {plan.name}
        </h3>

        {/* Message */}
        <p className="text-gray-600 mb-6">
          <strong className="text-indigo-600">{featureNames[feature]}</strong> est disponible 
          à partir du forfait <strong>{plan.name}</strong>.
        </p>

        {/* Avantages */}
        <div className="bg-indigo-50 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="text-indigo-600" size={20} />
            <span className="font-bold text-indigo-900">Ce que vous débloquez :</span>
          </div>
          <ul className="space-y-2 text-sm text-indigo-700">
            {plan.features.slice(0, 4).map((feat, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-indigo-500 mt-0.5">✓</span>
                <span>{feat}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Prix */}
        <div className="flex items-baseline justify-center gap-2 mb-6">
          <span className="text-4xl font-black text-gray-900">{plan.price}€</span>
          <span className="text-gray-500">/mois</span>
        </div>

        {/* Boutons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-xl font-bold text-gray-700 hover:bg-gray-50 transition"
          >
            Annuler
          </button>
          <button
            onClick={() => {
              // TODO: Rediriger vers la page de paiement
              window.location.href = '/profile?upgrade=' + requiredPlan;
            }}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold hover:shadow-lg transition flex items-center justify-center gap-2"
          >
            <Zap size={18} />
            Passer {plan.name}
          </button>
        </div>
      </div>
    </div>
  );
}

