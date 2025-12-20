import React, { useState } from "react";
import { supabase } from "../lib/supabase"; // Notez le ".." pour remonter d'un dossier
import { Lock } from "lucide-react";

export default function AuthForm() {
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) alert("Erreur inscription : " + error.message);
    else alert("Compte créé ! Vous êtes connecté.");
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
            Gérez votre commerce local simplement.
          </p>
        </div>

        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
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
              ? "S'inscrire maintenant"
              : "Se connecter"}
          </button>
        </form>

        <div className="mt-6 text-center border-t pt-6">
          <button
            onClick={() => setIsSignUpMode(!isSignUpMode)}
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
