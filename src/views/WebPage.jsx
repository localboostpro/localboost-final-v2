import React, { useState } from "react";
import { supabase } from "../lib/supabase";
import { Globe, Save, Lock, ArrowRight, Clock, MapPin, Phone, Layout, AlertCircle } from "lucide-react";

export default function WebPage({ profile, setProfile }) {
  const [loading, setLoading] = useState(false);
  
  // On récupère les horaires du profil (ou un tableau vide par sécurité)
  const hours = profile?.landing_config?.hours || [];

  const defaultConfig = {
    title: profile?.name || "",
    description: "Bienvenue dans notre établissement.",
    primaryColor: "#4F46E5",
    coverImage: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=800&q=80",
    // Plus besoin de "hours" ici, on lit celles du profil
  };

  const [config, setConfig] = useState({ ...defaultConfig, ...profile?.landing_config });
  const [isPublished, setIsPublished] = useState(profile?.is_published || false);

  if (profile?.subscription_tier === 'basic') {
    return (
      <div className="h-[calc(100vh-100px)] flex flex-col items-center justify-center text-center p-8 bg-slate-900 rounded-[2rem] text-white shadow-xl relative overflow-hidden animate-in fade-in">
         <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-600/20 to-purple-600/20 z-0"></div>
         <div className="relative z-10 max-w-lg mx-auto">
            <div className="bg-white/10 w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-8 backdrop-blur-md border border-white/10">
                <Globe size={48} className="text-indigo-400"/>
            </div>
            <h2 className="text-3xl font-black mb-4">Votre Site Vitrine</h2>
            <p className="text-slate-300 mb-8">Activez votre page web optimisée pour le référencement local.</p>
            <button onClick={() => alert("Passez Premium via 'Mon Profil'")} className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-3 mx-auto transition-all shadow-lg">
                Activer ma Page <ArrowRight size={20}/>
            </button>
         </div>
      </div>
    );
  }

  const handleSave = async () => {
      setLoading(true);
      try {
          // On sauvegarde la config (sans les horaires qui sont gérés ailleurs, mais on garde le reste)
          const newLandingConfig = { 
              ...profile.landing_config, // on garde les horaires s'ils y sont
              ...config // on écrase avec les nouvelles couleurs/textes
          };

          const { error } = await supabase.from("business_profile")
            .update({ landing_config: newLandingConfig, is_published: isPublished })
            .eq("id", profile.id);
          
          if(error) throw error;
          setProfile({ ...profile, landing_config: newLandingConfig, is_published: isPublished });
          alert("✅ Design enregistré !");
      } catch (err) { alert("Erreur: " + err.message); } finally { setLoading(false); }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 pb-20 animate-in fade-in duration-500 h-full lg:h-[calc(100vh-100px)]">
      
      {/* ÉDITEUR */}
      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-6 pr-2">
          <div className="flex justify-between items-center bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
             <div>
                 <h2 className="text-xl font-black text-slate-900 flex items-center gap-2"><Layout className="text-indigo-600"/> Éditeur Web</h2>
                 <p className="text-sm text-slate-500">Personnalisez l'apparence de votre site.</p>
             </div>
             <div className="flex items-center gap-3">
                 <button onClick={() => setIsPublished(!isPublished)} className={`px-4 py-2 rounded-xl text-xs font-bold transition ${isPublished ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>
                    {isPublished ? "EN LIGNE" : "HORS LIGNE"}
                 </button>
                 <button onClick={handleSave} disabled={loading} className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-800 transition shadow-lg">
                    {loading ? "..." : <><Save size={18}/> Enregistrer</>}
                 </button>
             </div>
          </div>

          <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-6">
              <h3 className="font-bold text-lg border-b pb-4 mb-4">Design & Contenu</h3>
              
              {/* Note pour l'utilisateur */}
              <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 flex items-start gap-3">
                  <AlertCircle size={20} className="text-indigo-600 shrink-0 mt-0.5"/>
                  <div>
                      <p className="text-xs font-bold text-indigo-800 mb-1">Où sont les horaires ?</p>
                      <p className="text-xs text-indigo-600">Les horaires d'ouverture se gèrent désormais directement dans la rubrique <strong>"Mon Profil"</strong>. Ils seront automatiquement affichés sur votre site web.</p>
                  </div>
              </div>

              <div>
                  <label className="text-xs font-bold text-slate-400 uppercase ml-1 mb-2 block">Titre du site</label>
                  <input value={config.title} onChange={e => setConfig({...config, title: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl font-bold outline-none focus:ring-2 ring-indigo-500"/>
              </div>
              <div>
                  <label className="text-xs font-bold text-slate-400 uppercase ml-1 mb-2 block">Message d'accueil</label>
                  <textarea value={config.description} onChange={e => setConfig({...config, description: e.target.value})} rows={4} className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm outline-none focus:ring-2 ring-indigo-500"/>
              </div>
              <div>
                  <label className="text-xs font-bold text-slate-400 uppercase ml-1 mb-2 block">Image de couverture (Lien)</label>
                  <input value={config.coverImage} onChange={e => setConfig({...config, coverImage: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs outline-none focus:ring-2 ring-indigo-500"/>
              </div>
              <div>
                  <label className="text-xs font-bold text-slate-400 uppercase ml-1 mb-2 block">Thème couleur</label>
                  <div className="flex gap-3">
                      {["#4F46E5", "#059669", "#DC2626", "#D97706", "#000000"].map(color => (
                          <button key={color} onClick={() => setConfig({...config, primaryColor: color})} className={`w-8 h-8 rounded-full border-2 ${config.primaryColor === color ? "border-slate-900 scale-110" : "border-transparent"}`} style={{backgroundColor: color}}/>
                      ))}
                  </div>
              </div>
          </div>
      </div>

      {/* PRÉVISUALISATION */}
      <div className="w-full lg:w-[400px] bg-slate-100 rounded-[2.5rem] border p-8 flex flex-col items-center shrink-0 overflow-y-auto min-h-[600px] shadow-inner">
          <h3 className="font-black text-slate-900 mb-6 text-center">Aperçu Mobile</h3>
          <div className="w-full max-w-[320px] bg-white rounded-[2rem] border-8 border-slate-900 shadow-2xl overflow-hidden min-h-[600px] flex flex-col relative">
              <div className="h-40 bg-slate-200 relative">
                  <img src={config.coverImage} className="w-full h-full object-cover" alt="Cover"/>
                  <div className="absolute -bottom-8 left-4 w-16 h-16 rounded-xl border-4 border-white shadow-md bg-white overflow-hidden">
                      {profile?.logo_url ? <img src={profile.logo_url} className="w-full h-full object-cover" alt="Logo"/> : <div className="w-full h-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-600">{profile?.name?.[0]}</div>}
                  </div>
              </div>
              <div className="mt-10 px-4 pb-8 flex-1">
                  <h1 className="text-xl font-black text-slate-900 leading-tight mb-1">{config.title}</h1>
                  <div className="flex items-center gap-1 text-xs text-slate-500 mb-4"><MapPin size={12}/> {profile?.city || "Ville"}</div>
                  <div className="flex gap-2 mb-6">
                      <button className="flex-1 py-2 rounded-lg text-white text-xs font-bold shadow-md flex items-center justify-center gap-1" style={{backgroundColor: config.primaryColor}}><Phone size={12}/> Appeler</button>
                      <button className="flex-1 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold flex items-center justify-center gap-1"><MapPin size={12}/> Y aller</button>
                  </div>
                  <div className="mb-6"><h3 className="font-bold text-sm text-slate-900 mb-2">À propos</h3><p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">{config.description}</p></div>
                  
                  {/* AFFICHAGE DES HORAIRES DU PROFIL */}
                  <div className="bg-slate-50 rounded-xl p-4">
                      <h3 className="font-bold text-sm text-slate-900 mb-3 flex items-center gap-2"><Clock size={14}/> Horaires</h3>
                      <div className="space-y-2">
                        {hours.length > 0 ? hours.map((h, i) => (
                           <div key={i} className="flex justify-between text-xs border-b border-slate-200 pb-1 last:border-0 last:pb-0">
                               <span className="text-slate-500">{h.day.slice(0,3)}</span>
                               <span className="font-bold text-slate-800">{h.closed ? "Fermé" : `${h.open} - ${h.close}`}</span>
                           </div>
                        )) : <div className="text-xs text-slate-400 italic">Aucun horaire défini.</div>}
                      </div>
                  </div>
              </div>
              <div className="bg-slate-900 text-white p-3 text-center text-[10px] font-bold">Propulsé par LocalBoost Pro</div>
          </div>
      </div>
    </div>
  );
}
