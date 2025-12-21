import React, { useState } from "react";
import { supabase } from "../lib/supabase";
import logo from "../assets/logo.png"; // Importation du logo

import { 
  Building2, Globe, Phone, Fingerprint, ChevronRight, 
  ChevronLeft, CheckCircle2, Star, Sparkles, Rocket, Lock, Mail, KeyRound, Loader2, ArrowRight
} from "lucide-react";

export default function AuthForm() {
  const [mode, setMode] = useState("login"); // 'login', 'signup', 'forgot'
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // États du formulaire
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [siret, setSiret] = useState("");
  const [website, setWebsite] = useState("");
  const [phone, setPhone] = useState("");

  // --- LOGIQUE GÉNÉRALE (LOGIN / SIGNUP / FORGOT) ---
  const handleSubmit = async (e) => {
    e.preventDefault(); // Empêche le rechargement
    if (loading) return;
    setLoading(true);

    try {
        if (mode === "login") {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw error;
        } else if (mode === "forgot") {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: window.location.origin,
            });
            if (error) throw error;
            alert("📧 Email de réinitialisation envoyé ! Vérifiez vos spams.");
            setMode("login");
        } else if (mode === "signup") {
             // Inscription classique (étape par étape gérée ailleurs, ici c'est juste une sécurité)
             alert("Veuillez utiliser le bouton 'Finaliser' à la dernière étape.");
        }
    } catch (error) {
        alert(error.message);
    } finally {
        setLoading(false);
    }
  };

  // --- VÉRIFICATION SIRET EXISTANT ---
  const checkSiretExists = async (siretNumber) => {
    const { data } = await supabase
      .from("business_profile")
      .select("id")
      .eq("siret", siretNumber)
      .maybeSingle();
    return data !== null;
  };

  // --- LOGIQUE D'INSCRIPTION COMPLÈTE (FINALE) ---
  const handleSignUp = async () => {
    setLoading(true);

    const exists = await checkSiretExists(siret);
    if (exists) {
      alert("Ce numéro SIRET est déjà utilisé par un autre compte.");
      setLoading(false);
      return;
    }

    // 1. Inscription Auth
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

    // 2. Création du profil
    if (authData?.user) {
      const { error: profileError } = await supabase
        .from("business_profile")
        .insert([{
          user_id: authData.user.id,
          name: businessName,
          siret: siret,
          website: website,
          phone: phone,
          subscription_tier: "basic",
          is_active: true
        }]);

      if (profileError) {
        alert("Erreur profil : " + profileError.message);
      } else {
        alert("Compte créé avec succès ! Bienvenue chez LocalBoost Pro.");
        // Pas besoin de rediriger manuellement, le listener dans App.jsx le fera
      }
    }
    setLoading(false);
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  return (
    <div className="min-h-screen bg-white flex flex-col md:flex-row font-sans text-slate-900">
      
      {/* SECTION GAUCHE : MARKETING (Caché sur mobile) */}
      <div className="hidden md:flex md:w-5/12 bg-indigo-600 p-12 flex-col justify-between text-white relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
             <div className="bg-white p-2 rounded-2xl shadow-lg">
               <img src={logo} alt="Logo" className="h-10 w-10 object-contain" />
             </div>
             <span className="text-2xl font-black tracking-tight text-white">LocalBoost Pro</span>
          </div>
          
          <h2 className="text-4xl font-black mb-8 leading-tight">
            Propulsez votre <span className="text-indigo-200">visibilité locale</span> grâce à l'IA.
          </h2>
          
          <div className="space-y-8">
            <div className="flex items-start gap-4">
              <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm"><Sparkles size={24}/></div>
              <div>
                <p className="font-bold text-lg">Génération IA</p>
                <p className="text-indigo-100 opacity-80">Des posts réseaux sociaux créés sur mesure en 30 secondes.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm"><Star size={24}/></div>
              <div>
                <p className="font-bold text-lg">E-Réputation</p>
                <p className="text-indigo-100 opacity-80">Gérez vos avis clients et boostez votre note Google.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm"><Rocket size={24}/></div>
              <div>
                <p className="font-bold text-lg">Prêt en 2 min</p>
                <p className="text-indigo-100 opacity-80">Rejoignez +500 commerçants qui ont choisi la croissance.</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="relative z-10 bg-white/10 p-6 rounded-3xl border border-white/20 backdrop-blur-md">
          <p className="italic text-indigo-50">"Le gain de temps est incroyable. Mes clients voient mes nouveautés tous les jours sur Facebook sans que j'y passe mes soirées."</p>
          <p className="mt-4 font-bold text-sm">— Marc, Gérant de "Le Petit Bistro"</p>
        </div>

        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-indigo-500 rounded-full blur-3xl opacity-50"></div>
      </div>

      {/* SECTION DROITE : FORMULAIRE */}
      <div className="flex-1 flex items-center justify-center p-6 bg-slate-50">
        <div className="w-full max-w-md">
          
          {/* LOGO MOBILE */}
          <div className="flex justify-center mb-8 md:hidden">
            <img src={logo} alt="Logo" className="h-16 w-16 object-contain" />
          </div>

          <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl shadow-indigo-100/50 border border-slate-100">
            <div className="mb-10 text-center">
              <h1 className="text-3xl font-black text-slate-900 mb-2">
                {mode === "signup" ? `Étape ${step}/3` : (mode === "forgot" ? "Récupération" : "Bon retour")}
              </h1>
              <p className="text-slate-500 font-medium">
                {mode === "signup" ? "Configurez votre espace pro" : (mode === "forgot" ? "Réinitialisez votre mot de passe" : "Gérez votre activité locale")}
              </p>
            </div>

            {/* FORMULAIRE LOGIN / FORGOT */}
            {mode !== "signup" && (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="relative">
                  <Mail className="absolute left-4 top-4 text-slate-400" size={20} />
                  <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-4 pl-12 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-slate-700" required />
                </div>
                
                {mode === "login" && (
                    <div className="relative">
                    <Lock className="absolute left-4 top-4 text-slate-400" size={20} />
                    <input type="password" placeholder="Mot de passe" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-4 pl-12 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-slate-700" required />
                    </div>
                )}

                {/* LIEN MOT DE PASSE OUBLIÉ */}
                {mode === "login" && (
                    <div className="flex justify-end">
                        <button type="button" onClick={() => setMode("forgot")} className="text-xs font-bold text-slate-400 hover:text-indigo-600 transition">
                            Mot de passe oublié ?
                        </button>
                    </div>
                )}

                <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-lg hover:bg-indigo-700 transition shadow-xl shadow-indigo-200 flex items-center justify-center gap-2">
                  {loading ? <Loader2 className="animate-spin"/> : (mode === "login" ? "Se connecter" : "Envoyer le lien")}
                </button>

                {mode === "forgot" && (
                    <button type="button" onClick={() => setMode("login")} className="w-full text-center text-sm font-bold text-slate-500 hover:text-indigo-600 mt-4">
                        Retour à la connexion
                    </button>
                )}

                {mode === "login" && (
                    <p className="text-center text-slate-500 font-bold text-sm pt-4">
                    Nouveau ? <button type="button" onClick={() => setMode("signup")} className="text-indigo-600 hover:underline">Créer un compte</button>
                    </p>
                )}
              </form>
            )}

            {/* FORMULAIRE INSCRIPTION (STEPS) */}
            {mode === "signup" && (
                <>
                    {/* ÉTAPE 1 : IDENTIFIANTS */}
                    {step === 1 && (
                    <div className="space-y-5">
                        <input type="email" placeholder="Email professionnel" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-indigo-500 font-bold text-slate-700" />
                        <input type="password" placeholder="Mot de passe (6+ caractères)" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-indigo-500 font-bold text-slate-700" />
                        <button onClick={nextStep} disabled={!email || password.length < 6} className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2">
                        Suivant <ChevronRight size={20} />
                        </button>
                    </div>
                    )}

                    {/* ÉTAPE 2 : IDENTITÉ ENTREPRISE */}
                    {step === 2 && (
                    <div className="space-y-5">
                        <div className="relative">
                        <Building2 className="absolute left-4 top-4 text-slate-400" size={20} />
                        <input type="text" placeholder="Nom de l'entreprise" value={businessName} onChange={e => setBusinessName(e.target.value)} className="w-full p-4 pl-12 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-indigo-500 font-bold text-slate-700" />
                        </div>
                        <div className="relative">
                        <Fingerprint className="absolute left-4 top-4 text-slate-400" size={20} />
                        <input type="text" placeholder="Numéro SIRET" value={siret} onChange={e => setSiret(e.target.value)} className="w-full p-4 pl-12 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-indigo-500 font-bold text-slate-700" />
                        </div>
                        <div className="flex gap-3">
                        <button onClick={prevStep} className="flex-1 bg-slate-100 text-slate-600 py-4 rounded-2xl font-black">Retour</button>
                        <button onClick={nextStep} disabled={!businessName || !siret} className="flex-[2] bg-indigo-600 text-white py-4 rounded-2xl font-black">Suivant</button>
                        </div>
                    </div>
                    )}

                    {/* ÉTAPE 3 : CONTACT */}
                    {step === 3 && (
                    <div className="space-y-5">
                        <div className="relative">
                        <Globe className="absolute left-4 top-4 text-slate-400" size={20} />
                        <input type="text" placeholder="Site web (ex: www.monsite.fr)" value={website} onChange={e => setWebsite(e.target.value)} className="w-full p-4 pl-12 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-indigo-500 font-bold text-slate-700" />
                        </div>
                        <div className="relative">
                        <Phone className="absolute left-4 top-4 text-slate-400" size={20} />
                        <input type="text" placeholder="Téléphone de contact" value={phone} onChange={e => setPhone(e.target.value)} className="w-full p-4 pl-12 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-indigo-500 font-bold text-slate-700" />
                        </div>
                        <div className="flex gap-3">
                        <button onClick={prevStep} className="flex-1 bg-slate-100 text-slate-600 py-4 rounded-2xl font-black">Retour</button>
                        <button onClick={handleSignUp} disabled={loading} className="flex-[2] bg-indigo-600 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2 shadow-xl shadow-indigo-100 transition-transform active:scale-95">
                            {loading ? "Création..." : "Finaliser"} <CheckCircle2 size={20} />
                        </button>
                        </div>
                    </div>
                    )}

                    <button onClick={() => setMode("login")} className="w-full text-slate-400 text-xs font-bold mt-8 uppercase tracking-widest hover:text-indigo-600 transition-colors">
                    Déjà inscrit ? Connectez-vous
                    </button>
                </>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
