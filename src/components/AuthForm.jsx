import React, { useState } from "react";
import { supabase } from "../lib/supabase"; 
import { Lock, Building2 } from "lucide-react";

export default function AuthForm() {
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [businessName, setBusinessName] = useState(""); // Nouvel état pour le nom

  const handleLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) alert("Erreur connexion : " + error.message);
    setLoading(false);
  };

  const handleSignUp = async () => {
    if (isSignUpMode && !businessName) {
      alert("Veuillez entrer le nom de votre entreprise.");
      return;
    }

    setLoading(true);
    
    // 1. Création du compte utilisateur
    const { data: authData, error: authError } = await supabase.auth.signUp({ 
      email, 
      password 
    });

    if (authError) {
      alert("Erreur inscription : " + authError.message);
      setLoading(false);
      return;
    }

    // 2. Création immédiate du profil business si l'utilisateur est créé
    if (authData?.user) {
      const { error: profileError } = await supabase
        .from("business_profile")
        .insert([
          {
            user_id: authData.user.id,
            name: businessName,
            subscription_tier: "basic",
            // is_active et trial_ends_at sont gérés par les défauts Supabase
          },
        ]);

      if (profileError) {
        console.error("Erreur profil:", profileError.message);
      } else {
        alert("Compte créé avec succès ! Votre essai de 7 jours commence maintenant.");
      }
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl mx-auto flex items-center justify-center text-white mb-4 shadow-lg shadow-indigo-200">
            <Lock size={32} />
          </div>
          <h1 className="text-2xl font-black text-slate-900">
            {isSignUpMode ? "Créer un compte" : "Connexion Pro"}
          </h1>
          <p className="text-slate-500">
            {isSignUpMode ? "Commencez votre essai gratuit de 7 jours." : "Gérez votre commerce local simplement."}
          </p>
        </div>

        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          {/* CHAMP NOM DE L'ENTREPRISE (Visible uniquement en inscription) */}
          {isSignUpMode && (
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase ml-1">
                Nom de l'entreprise
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full p-3 pl-10 bg-slate-50 border rounded-xl outline-none focus:border-indigo-500 transition"
                  placeholder="Ex: Ma Boulangerie"
                  required
                />
                <Building2 className="absolute left-3 top-3.5 text-slate-400" size={18} />
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase ml-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 bg-slate-50 border rounded-xl outline-none focus:border-indigo-500 transition"
              placeholder="votre@email.com"
              required
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase ml-1">
              Mot de passe
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 bg-slate-50 border rounded-xl outline-none focus:border-indigo-500 transition"
              placeholder="•••••••• (6 char min)"
              required
            />
          </div>

          <button
            onClick={isSignUpMode ? handleSignUp : handleLogin}
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg disabled:opacity-50"
          >
            {loading
              ? "Chargement..."
              : isSignUpMode
              ? "Démarrer l'essai gratuit"
              : "Se connecter"}
          </button>
        </form>

        <div className="mt-6 text-center border-t pt-6">
          <button
            onClick={() => {
              setIsSignUpMode(!isSignUpMode);
              setBusinessName(""); // Réinitialise le nom
            }}
            className="text-slate-500 text-sm font-medium hover:text-indigo-600 transition"
          >
            {isSignUpMode
              ? "Vous avez déjà un compte ? Se connecter"
              : "Pas encore de compte ? Créer un compte"}
          </button>
        </div>
      </div>
    </div>
  );
}
