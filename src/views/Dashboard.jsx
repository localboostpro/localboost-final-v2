import React, { useState, useEffect } from "react";
import { 
  Users, MessageSquare, TrendingUp, Calendar, ArrowRight, 
  CheckCircle, AlertCircle, Sparkles, Sun, Cloud, CloudRain, Wind 
} from "lucide-react";

export default function Dashboard({ stats, posts, onGenerate, profile }) {
  const [weather, setWeather] = useState(null);
  
  // Vérification basique des réseaux (à améliorer avec de vrais tokens plus tard)
  const socialConnected = profile?.instagram_url || profile?.facebook_url;

  // --- MÉTÉO (Open-Meteo API - Gratuit sans clé) ---
  useEffect(() => {
      // On essaye de géolocaliser, sinon Paris par défaut
      if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
              async (position) => {
                  fetchWeather(position.coords.latitude, position.coords.longitude);
              },
              () => fetchWeather(48.8566, 2.3522) // Paris si refus
          );
      } else {
          fetchWeather(48.8566, 2.3522);
      }
  }, []);

  const fetchWeather = async (lat, lon) => {
      try {
          const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&timezone=auto`);
          const data = await res.json();
          setWeather(data.current);
      } catch (e) {
          console.error("Météo HS", e);
      }
  };

  // Icône météo simple selon le code WMO
  const getWeatherIcon = (code) => {
      if (code <= 3) return <Sun className="text-amber-400" size={32}/>;
      if (code <= 60) return <Cloud className="text-slate-400" size={32}/>;
      return <CloudRain className="text-indigo-400" size={32}/>;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* EN-TÊTE + MÉTÉO */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
         <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Bonjour, {profile?.name || "Pro"} 👋</h1>
            <p className="text-slate-500 font-medium mt-2">Voici un aperçu de votre activité aujourd'hui.</p>
         </div>
         
         <div className="flex items-center gap-4">
             {/* Widget Météo */}
             {weather && (
                 <div className="hidden md:flex items-center gap-3 bg-white px-4 py-2 rounded-2xl border border-slate-100 shadow-sm">
                     {getWeatherIcon(weather.weather_code)}
                     <div>
                         <div className="text-xl font-black text-slate-800">{Math.round(weather.temperature_2m)}°C</div>
                         <div className="text-[10px] font-bold text-slate-400 uppercase">Météo locale</div>
                     </div>
                 </div>
             )}
             
             {/* Date */}
             <div className="hidden md:block">
                <span className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-sm font-bold border border-indigo-100 capitalize">
                   {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                </span>
             </div>
         </div>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Clients */}
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex items-center justify-between group hover:border-indigo-100 transition">
          <div>
            <div className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Base Clients</div>
            <div className="text-4xl font-black text-slate-900">{stats.clients}</div>
          </div>
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition">
            <Users size={24} />
          </div>
        </div>

        {/* Avis */}
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex items-center justify-between group hover:border-indigo-100 transition">
          <div>
            <div className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Avis Reçus</div>
            <div className="text-4xl font-black text-slate-900">{stats.reviews}</div>
          </div>
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition">
            <MessageSquare size={24} />
          </div>
        </div>

        {/* CTA Création */}
        <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-6 rounded-[2rem] shadow-lg shadow-indigo-200 text-white relative overflow-hidden group cursor-pointer" onClick={onGenerate}>
            <div className="relative z-10">
                <h3 className="font-black text-xl mb-2">Créer un post IA</h3>
                <p className="text-indigo-100 text-sm mb-4">Générez du contenu viral en 1 clic.</p>
                <button className="bg-white text-indigo-600 px-4 py-2 rounded-xl font-bold text-sm hover:bg-indigo-50 transition flex items-center gap-2">
                    <Sparkles size={16}/> Lancer le Studio
                </button>
            </div>
            <Sparkles className="absolute -bottom-4 -right-4 text-white/10 w-32 h-32 rotate-12 group-hover:rotate-45 transition duration-700"/>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* ACTIVITÉ RÉCENTE */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
           <div className="flex justify-between items-center mb-6">
               <h3 className="font-black text-xl text-slate-900 flex items-center gap-2"><TrendingUp className="text-indigo-600"/> Dernières Créations</h3>
               <button onClick={onGenerate} className="text-xs font-bold text-slate-400 hover:text-indigo-600 transition">Voir tout</button>
           </div>
           
           <div className="space-y-4">
              {posts.length === 0 ? (
                  <div className="text-center py-10 text-slate-400">
                      <p className="font-bold mb-1">C'est calme par ici...</p>
                      <p className="text-xs italic">Créez votre premier post pour le voir apparaître.</p>
                  </div>
              ) : (
                  posts.slice(0, 3).map(post => (
                      <div key={post.id} className="flex items-start gap-4 p-4 rounded-2xl hover:bg-slate-50 transition border border-transparent hover:border-slate-100 group cursor-pointer">
                          <img src={post.image_url} className="w-16 h-16 rounded-xl object-cover bg-slate-200 shadow-sm" alt="post"/>
                          <div className="flex-1">
                              <h4 className="font-bold text-slate-900 truncate">{post.title || "Publication sans titre"}</h4>
                              <p className="text-xs text-slate-500 line-clamp-1 mt-1">{post.content}</p>
                              <div className="flex gap-2 mt-2">
                                  {post.networks?.map(n => (
                                      <span key={n} className="text-[10px] font-bold uppercase bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-md border border-indigo-100">{n}</span>
                                  ))}
                              </div>
                          </div>
                          <div className="hidden group-hover:flex items-center justify-center w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-400">
                              <ArrowRight size={16}/>
                          </div>
                      </div>
                  ))
              )}
           </div>
        </div>

        {/* ÉTAT DES RÉSEAUX */}
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col items-center text-center justify-center relative overflow-hidden">
             {/* Fond décoratif */}
             <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-3xl -z-10"></div>

             <div className={`w-16 h-16 rounded-3xl flex items-center justify-center mb-4 shadow-sm ${socialConnected ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                 <Calendar size={32}/>
             </div>
             
             <h3 className="font-black text-lg text-slate-900 mb-1">Connexion Réseaux</h3>
             
             <p className="text-xs text-slate-500 mb-6 px-4 leading-relaxed">
                 {socialConnected 
                    ? "Vos comptes sont liés. La publication automatique est prête." 
                    : "Connectez Instagram ou Facebook pour activer le planning."}
             </p>
             
             {socialConnected ? (
                 <div className="flex items-center gap-2 text-emerald-700 font-bold bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100">
                     <CheckCircle size={16}/> Tout est actif
                 </div>
             ) : (
                 <button onClick={() => alert("Allez dans 'Mon Établissement' pour ajouter vos liens !")} className="w-full py-3 rounded-xl border-2 border-slate-100 font-bold text-slate-600 hover:border-indigo-600 hover:text-indigo-600 hover:bg-indigo-50 transition flex items-center justify-center gap-2 text-sm">
                     <AlertCircle size={16}/> Configurer
                 </button>
             )}
        </div>

      </div>
    </div>
  );
}
