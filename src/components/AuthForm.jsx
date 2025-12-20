import React, { useState } from "react";
import { supabase } from "../lib/supabase"; 
import { Lock, Building2, Globe, Phone, Fingerprint, ChevronRight, ChevronLeft, CheckCircle2 } from "lucide-react";

export default function AuthForm() {
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // États du formulaire
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [siret, setSiret] = useState("");
  const [website, setWebsite] = useState("");
  const [phone, setPhone] = useState("");

  const handleLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert("Erreur connexion : " + error.message);
    setLoading(false);
  };

  const checkSiretExists = async (siretNumber) => {
    const { data, error } = await supabase
      .from("business_profile")
      .select("id")
      .eq("siret", siretNumber)
      .maybeSingle();
    return data !== null;
  };

  const handleSignUp = async () => {
    setLoading(true);

    // Vérification finale du SIRET
    const exists = await checkSiretExists(siret);
    if (exists) {
      alert("Ce numéro SIRET est déjà enregistré sur notre plateforme.");
      setLoading(false);
      return;
    }

    // 1. Création du compte Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({ 
      email, 
      password,
      options: { data: { business_name: businessName } }
    });

    if (authError) {
      alert("Erreur : " + authError.message);
      setLoading(false);
      return;
    }

    // 2. Création du profil complet
    if (authData?.user) {
      const { error: profileError } = await supabase
        .from("business_profile")
        .insert([{
          user_id: authData.user.id,
          name: businessName,
          siret: siret,
          website: website,
          phone: phone,
          subscription_tier: "basic"
        }]);

      if (profileError) {
        alert("Erreur profil : " + profileError.message);
      } else {
        alert("Bienvenue " + businessName + " ! Votre essai de 7 jours est activé.");
      }
    }
    setLoading(false);
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  if (!isSignUpMode) {
    // Rendu mode Connexion (Simplifié)
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md border border-slate-100">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-indigo-600 rounded-2xl mx-auto flex items-center justify-center text-white mb-4 shadow-lg shadow-indigo-200">
              <Lock size={32} />
            </div>
            <h1 className="text-2xl font-black text-slate-900">Connexion Pro</h1>
          </div>
          <div className="space-y-4">
            <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-4 bg-slate-50 border rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition" />
            <input type="password" placeholder="Mot de passe" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-4 bg-slate-50 border rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition" />
            <button onClick={handleLogin} disabled={loading} className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black hover:bg-indigo-700 transition shadow-lg">Se connecter</button>
            <button onClick={() => setIsSignUpMode(true)} className="w-full text-slate-500 text-sm font-bold mt-4">Pas encore de compte ? Créer un compte</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md border border-slate-100">
        {/* Barre de progression */}
        <div className="flex justify-between mb-8 px-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className={`h-2 flex-1 rounded-full mx-1 ${step >= i ? 'bg-indigo-600' : 'bg-slate-100'}`} />
          ))}
        </div>

        <div className="text-center mb-8">
          <h1 className="text-2xl font-black text-slate-900">Étape {step} sur 3</h1>
          <p className="text-slate-500">Configurons votre espace professionnel.</p>
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <input type="email" placeholder="Email professionnel" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-4 bg-slate-50 border rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500" />
            <input type="password" placeholder="Mot de passe (6+ caractères)" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-4 bg-slate-50 border rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500" />
            <button onClick={nextStep} disabled={!email || password.length < 6} className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2">Suivant <ChevronRight size={20} /></button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="relative">
              <Building2 className="absolute left-4 top-4 text-slate-400" size={20} />
              <input type="text" placeholder="Nom de l'entreprise" value={businessName} onChange={e => setBusinessName(e.target.value)} className="w-full p-4 pl-12 bg-slate-50 border rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div className="relative">
              <Fingerprint className="absolute left-4 top-4 text-slate-400" size={20} />
              <input type="text" placeholder="Numéro SIRET" value={siret} onChange={e => setSiret(e.target.value)} className="w-full p-4 pl-12 bg-slate-50 border rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div className="flex gap-2">
              <button onClick={prevStep} className="flex-1 bg-slate-100 text-slate-600 py-4 rounded-2xl font-black">Retour</button>
              <button onClick={nextStep} disabled={!businessName || !siret} className="flex-[2] bg-indigo-600 text-white py-4 rounded-2xl font-black">Continuer</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div className="relative">
              <Globe className="absolute left-4 top-4 text-slate-400" size={20} />
              <input type="text" placeholder="Site web (ex: www.beauty.fr)" value={website} onChange={e => setWebsite(e.target.value)} className="w-full p-4 pl-12 bg-slate-50 border rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div className="relative">
              <Phone className="absolute left-4 top-4 text-slate-400" size={20} />
              <input type="text" placeholder="Téléphone de contact" value={phone} onChange={e => setPhone(e.target.value)} className="w-full p-4 pl-12 bg-slate-50 border rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div className="flex gap-2">
              <button onClick={prevStep} className="flex-1 bg-slate-100 text-slate-600 py-4 rounded-2xl font-black">Retour</button>
              <button onClick={handleSignUp} disabled={loading} className="flex-[2] bg-indigo-600 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2 italic text-lg shadow-xl shadow-indigo-100">
                {loading ? "Création..." : "C'est parti !"} <CheckCircle2 size={20} />
              </button>
            </div>
          </div>
        )}

        <button onClick={() => setIsSignUpMode(false)} className="w-full text-slate-400 text-xs font-bold mt-8 uppercase tracking-widest">Retour à la connexion</button>
      </div>
    </div>
  );
}
