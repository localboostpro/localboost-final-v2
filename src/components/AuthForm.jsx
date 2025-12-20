import React, { useState } from "react";
import { supabase } from "../lib/supabase"; 
import { Building2, Globe, Phone, Fingerprint, ChevronRight, ChevronLeft, CheckCircle2, Star, Sparkles, Rocket } from "lucide-react";

export default function AuthForm() {
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [siret, setSiret] = useState("");
  const [website, setWebsite] = useState("");
  const [phone, setPhone] = useState("");

  // ... (Garder les fonctions handleLogin, checkSiretExists et handleSignUp du code précédent)

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      
      {/* COLONNE GAUCHE : ARGUMENTS MARKETING (Visible sur MD+) */}
      <div className="hidden md:flex md:w-1/2 bg-indigo-600 p-12 flex-col justify-between text-white">
        <div>
          <div className="flex items-center gap-3 mb-12">
             <div className="bg-white p-2 rounded-xl">
               <img src="/logo.png" alt="Logo" className="h-8 w-8" />
             </div>
             <span className="text-2xl font-black tracking-tight">LocalBoost Pro</span>
          </div>
          
          <h2 className="text-4xl font-black mb-6 leading-tight">
            Boostez votre visibilité locale en quelques clics.
          </h2>
          
          <ul className="space-y-6">
            <li className="flex items-start gap-4">
              <div className="bg-white/20 p-2 rounded-lg"><Sparkles size={20}/></div>
              <div>
                <p className="font-bold">Génération IA Intelligente</p>
                <p className="text-indigo-100 text-sm">Créez des posts captivants pour vos réseaux en 30 secondes.</p>
              </div>
            </li>
            <li className="flex items-start gap-4">
              <div className="bg-white/20 p-2 rounded-lg"><Star size={20}/></div>
              <div>
                <p className="font-bold">Gestion des Avis Centralisée</p>
                <p className="text-indigo-100 text-sm">Répondez à vos clients et améliorez votre e-réputation.</p>
              </div>
            </li>
            <li className="flex items-start gap-4">
              <div className="bg-white/20 p-2 rounded-lg"><Rocket size={20}/></div>
              <div>
                <p className="font-bold">Campagnes SMS & Promotions</p>
                <p className="text-indigo-100 text-sm">Fidélisez votre clientèle locale avec des offres ciblées.</p>
              </div>
            </li>
          </ul>
        </div>
        
        <div className="bg-indigo-700/50 p-6 rounded-3xl border border-white/10">
          <p className="italic text-indigo-50">
            "Depuis que j'utilise LocalBoost, mon salon de coiffure affiche complet tous les samedis grâce aux posts générés par l'IA."
          </p>
          <p className="mt-4 font-bold text-sm">— Sophie, gérante de Beauty</p>
        </div>
      </div>

      {/* COLONNE DROITE : FORMULAIRE */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md border border-slate-100">
          
          {/* LOGO MOBILE & TITRE */}
          <div className="text-center mb-8">
            <img src="/logo.png" alt="LocalBoost Pro" className="h-16 mx-auto mb-4 md:hidden" />
            <h1 className="text-2xl font-black text-slate-900">
              {isSignUpMode ? `Étape ${step} sur 3` : "Bon retour !"}
            </h1>
            <p className="text-slate-500 text-sm">
              {isSignUpMode ? "Commencez votre essai gratuit de 7 jours." : "Connectez-vous pour gérer votre entreprise."}
            </p>
          </div>

          {/* ... (Reste du formulaire identique au code précédent : steps 1, 2, 3 et bouton Login) */}
          
        </div>
      </div>
    </div>
  );
}
