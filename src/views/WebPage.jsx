import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { 
  Globe, Save, Smartphone, Lock, ArrowRight, Eye, 
  Clock, MapPin, Phone, Image as ImageIcon, Layout
} from "lucide-react";

export default function WebPage({ profile, setProfile }) {
  const [loading, setLoading] = useState(false);
  
  // Configuration par défaut
  const defaultConfig = {
    title: profile?.name || "",
    description: "Bienvenue dans notre établissement. Découvrez nos produits et services de qualité.",
    primaryColor: "#4F46E5", // Indigo par défaut
    coverImage: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=800&q=80", // Image par défaut
    showReviews: true,
    hours: [
      { day: "Lundi", open: "09:00", close: "18:00", closed: false },
      { day: "Mardi", open: "09:00", close: "18:00", closed: false },
      { day: "Mercredi", open: "09:00", close: "18:00", closed: false },
      { day: "Jeudi", open: "09:00", close: "18:00", closed: false },
      { day: "Vendredi", open: "09:00", close: "18:00", closed: false },
      { day: "Samedi", open: "10:00", close: "17:00", closed: false },
      { day: "Dimanche", open: "", close: "", closed: true },
    ]
  };

  // On fusionne la config existante avec celle par défaut
  const [config, setConfig] = useState({ ...defaultConfig, ...profile?.landing_config });
  const [isPublished, setIsPublished] = useState(profile?.is_published || false);

  // --- PROTECTION PREMIUM ---
  if (profile?.subscription_tier === 'basic') {
    return (
      <div className="h-[calc(100vh-100px)] flex flex-col items-center justify-center text-center p-8 bg-slate-900 rounded-[2rem] text-white shadow-xl relative overflow-hidden animate-in fade-in">
         <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-600/20 to-purple-600/20 z-0"></div>
         <div className="relative z-10 max-w-lg mx-auto">
            <div className="bg-white/10 w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-8 backdrop-blur-md border border-white/10">
                <Globe size={48} className="text-indigo-400"/>
            </div>
            <h2 className="text-3xl font-black mb-4">Votre Site Web Vitrine</h2>
            <p className="text-slate-300 mb-8">
                Boostez votre référencement local avec une page optimisée pour Google.
                Inclus : Horaires, Contact, Avis, et Design Pro.
            </p>
            <button onClick={() => alert("Passez Premium !")} className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-3 mx-auto transition-all shadow-lg">
                Activer ma Page Web <ArrowRight size={20}/>
            </button>
         </div>
      </div>
    );
  }

  // --- SAUVEGARDE ---
  const handleSave = async () => {
      setLoading(true);
      try {
          const { error } = await supabase.from("business_profile")
            .update({ 
                landing_config: config,
                is_published: isPublished 
            })
            .eq("id", profile.id);

          if(error) throw error;
          
          // Mise à jour locale
          setProfile({ ...profile, landing_config: config, is_published: isPublished });
          alert("✅ Modifications enregistrées !");
      } catch (err) {
          alert("Erreur: " + err.message);
      } finally {
          setLoading(false);
      }
  };

  // --- GESTION HORAIRES ---
  const updateHour = (index, field, value) => {
      const newHours = [...config.hours];
      newHours[index][field] = value;
      setConfig({ ...config, hours: newHours });
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 pb-20 animate-in fade-in duration-500 h-[calc(100vh-100px)]">
      
      {/* --- COLONNE GAUCHE : ÉDITEUR --- */}
      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-6 pr-2">
          
          {/* Header Éditeur */}
          <div className="flex justify-between items-center bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
             <div>
                 <h2 className="text-xl font-black text-slate-900 flex items-center gap-2"><Layout className="text-indigo-600"/> Éditeur Web</h2>
                 <p className="text-sm text-slate-500">Configurez votre vitrine digitale.</p>
             </div>
             <div className="flex items-center gap-3">
                 <div className="flex items-center gap-2 mr-4">
                     <span className={`text-xs font-bold ${isPublished ? "text-green-600" : "text-slate-400"}`}>
                        {isPublished ? "EN LIGNE" : "HORS LIGNE"}
                     </span>
                     <button 
                        onClick={() => setIsPublished(!isPublished)}
                        className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${isPublished ? "bg-green-500" : "bg-slate-200"}`}
                     >
                        <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ${isPublished ? "translate-x-6" : "translate-x-0"}`}></div>
                     </button>
                 </div>
                 <button onClick={handleSave} disabled={loading} className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-800 transition shadow-lg">
                    {loading ? "..." : <><Save size={18}/> Enregistrer</>}
                 </button>
             </div>
          </div>

          {/* Formulaire Informations */}
          <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-6">
              <h3 className="font-bold text-lg border-b pb-4 mb-4">Informations principales</h3>
              
              <div>
                  <label className="text-xs font-bold text-slate-400 uppercase ml-1 mb-2 block">Titre de la page</label>
                  <input 
                    value={config.title} 
                    onChange={e => setConfig({...config, title: e.target.value})}
                    className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl font-bold outline-none focus:ring-2 ring-indigo-500"
                  />
              </div>

              <div>
                  <label className="text-xs font-bold text-slate-400 uppercase ml-1 mb-2 block">Description / À propos</label>
                  <textarea 
                    value={config.description} 
                    onChange={e => setConfig({...config, description: e.target.value})}
                    rows={4}
                    className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm outline-none focus:ring-2 ring-indigo-500"
                  />
              </div>

              <div>
                  <label className="text-xs font-bold text-slate-400 uppercase ml-1 mb-2 block">Image de couverture (URL)</label>
                  <div className="flex gap-2">
                    <input 
                        value={config.coverImage} 
                        onChange={e => setConfig({...config, coverImage: e.target.value})}
                        className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs outline-none focus:ring-2 ring-indigo-500"
                        placeholder="https://..."
                    />
                    <div className="w-12 h-12 rounded-lg bg-slate-100 shrink-0 overflow-hidden border border-slate-200">
                        <img src={config.coverImage} className="w-full h-full object-cover" alt="Cover"/>
                    </div>
                  </div>
              </div>

              <div>
                  <label className="text-xs font-bold text-slate-400 uppercase ml-1 mb-2 block">Couleur principale</label>
                  <div className="flex gap-3">
                      {["#4F46E5", "#059669", "#DC2626", "#D97706", "#000000"].map(color => (
                          <button 
                            key={color}
                            onClick={() => setConfig({...config, primaryColor: color})}
                            className={`w-8 h-8 rounded-full border-2 ${config.primaryColor === color ? "border-slate-900 scale-110" : "border-transparent"}`}
                            style={{backgroundColor: color}}
                          />
                      ))}
                      <input 
                        type="color" 
                        value={config.primaryColor}
                        onChange={e => setConfig({...config, primaryColor: e.target.value})}
                        className="w-8 h-8 rounded-full overflow-hidden cursor-pointer border-none"
                      />
                  </div>
              </div>
          </div>

          {/* Formulaire Horaires */}
          <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
              <h3 className="font-bold text-lg border-b pb-4 mb-4 flex items-center gap-2"><Clock size={18}/> Horaires d'ouverture</h3>
              <div className="space-y-3">
                  {config.hours.map((h, index) => (
                      <div key={index} className="flex items-center gap-4 text-sm">
                          <div className="w-24 font-bold text-slate-700">{h.day}</div>
                          <div className="flex-1 flex gap-2 items-center">
                              {!h.closed ? (
                                  <>
                                    <input type="time" value={h.open} onChange={e => updateHour(index, 'open', e.target.value)} className="bg-slate-50 border rounded-lg p-1 text-xs font-bold"/>
                                    <span className="text-slate-400">-</span>
                                    <input type="time" value={h.close} onChange={e => updateHour(index, 'close', e.target.value)} className="bg-slate-50 border rounded-lg p-1 text-xs font-bold"/>
                                  </>
                              ) : (
                                  <span className="text-slate-400 text-xs italic bg-slate-50 px-3 py-1 rounded-lg w-full text-center">Fermé</span>
                              )}
                          </div>
                          <button 
                            onClick={() => updateHour(index, 'closed', !h.closed)}
                            className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase transition ${h.closed ? "bg-rose-100 text-rose-600" : "bg-green-100 text-green-600"}`}
                          >
                             {h.closed ? "Fermé" : "Ouvert"}
                          </button>
                      </div>
                  ))}
              </div>
          </div>
      </div>

      {/* --- COLONNE DROITE : PRÉVISUALISATION --- */}
      <div className="w-full lg:w-[400px] bg-slate-100 rounded-[2.5rem] border p-8 flex flex-col items-center justify-start shrink-0 overflow-y-auto min-h-[600px] shadow-inner">
          <h3 className="font-black text-slate-900 mb-6 text-center">Aperçu Mobile</h3>
          
          {/* CADRE TÉLÉPHONE */}
          <div className="w-full max-w-[320px] bg-white rounded-[2rem] border-8 border-slate-900 shadow-2xl overflow-hidden min-h-[600px] flex flex-col relative">
              
              {/* HEADER IMAGE */}
              <div className="h-40 bg-slate-200 relative">
                  <img src={config.coverImage} className="w-full h-full object-cover" alt="Cover"/>
                  <div className="absolute -bottom-8 left-4 w-16 h-16 rounded-xl border-4 border-white shadow-md bg-white overflow-hidden">
                      {profile?.logo_url ? <img src={profile.logo_url} className="w-full h-full object-cover"/> : <div className="w-full h-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-600">{profile?.name?.[0]}</div>}
                  </div>
              </div>

              {/* CONTENU */}
              <div className="mt-10 px-4 pb-8 flex-1">
                  <h1 className="text-xl font-black text-slate-900 leading-tight mb-1">{config.title}</h1>
                  <div className="flex items-center gap-1 text-xs text-slate-500 mb-4">
                      <MapPin size={12}/> {profile?.city || "Ville non renseignée"}
                  </div>

                  {/* ACTION BAR */}
                  <div className="flex gap-2 mb-6">
                      <button className="flex-1 py-2 rounded-lg text-white text-xs font-bold shadow-md flex items-center justify-center gap-1" style={{backgroundColor: config.primaryColor}}>
                          <Phone size={12}/> Appeler
                      </button>
                      <button className="flex-1 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold flex items-center justify-center gap-1">
                          <MapPin size={12}/> Y aller
                      </button>
                  </div>

                  {/* DESCRIPTION */}
                  <div className="mb-6">
                      <h3 className="font-bold text-sm text-slate-900 mb-2">À propos</h3>
                      <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">{config.description}</p>
                  </div>

                  {/* HORAIRES */}
                  <div className="bg-slate-50 rounded-xl p-4">
                      <h3 className="font-bold text-sm text-slate-900 mb-3 flex items-center gap-2"><Clock size={14}/> Horaires</h3>
                      <div className="space-y-2">
                        {config.hours.map((h, i) => (
                           <div key={i} className="flex justify-between text-xs border-b border-slate-200 pb-1 last:border-0 last:pb-0">
                               <span className="text-slate-500">{h.day.slice(0,3)}</span>
                               <span className="font-bold text-slate-800">{h.closed ? "Fermé" : `${h.open} - ${h.close}`}</span>
                           </div>
                        ))}
                      </div>
                  </div>
              </div>

              {/* FOOTER */}
              <div className="bg-slate-900 text-white p-3 text-center text-[10px] font-bold">
                  Propulsé par LocalBoost Pro
              </div>

          </div>
      </div>

    </div>
  );
}
