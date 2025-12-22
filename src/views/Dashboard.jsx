import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Icônes
import { 
  Users,
  MessageSquare,
  TrendingUp,
  Calendar,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Sun,
  Cloud,
  CloudRain
} from "lucide-react";

export default function Dashboard({ stats = { clients: 0, reviews: 0, posts: 0 }, posts = [], profile, onGenerate }) {
  const [weather, setWeather] = useState(null);
  const socialConnected = profile?.instagram_url || profile?.facebook_url;
  const navigate = useNavigate();

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          fetchWeather(position.coords.latitude, position.coords.longitude);
        },
        () => fetchWeather(48.8566, 2.3522)
      );
    } else {
      fetchWeather(48.8566, 2.3522);
    }
  }, []);

  const fetchWeather = async (lat, lon) => {
    try {
      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&timezone=auto`
      );
      const data = await res.json();
      setWeather(data.current);
    } catch (e) {
      console.error("Météo HS", e);
    }
  };

  const getWeatherIcon = (code) => {
    if (code <= 3) return <Sun className="text-amber-400" size={32} />;
    if (code <= 60) return <Cloud className="text-slate-400" size={32} />;
    return <CloudRain className="text-indigo-400" size={32} />;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* EN-TÊTE */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">
            Bonjour, {profile?.name || "Pro"} 👋
          </h1>
          <p className="text-slate-500 font-medium mt-2">
            Voici un aperçu de votre activité.
          </p>
        </div>

        <div className="flex items-center gap-4">
          {weather && (
            <div className="hidden md:flex items-center gap-3 bg-white px-4 py-2 rounded-2xl border border-slate-100 shadow-sm">
              {getWeatherIcon(weather.weather_code)}
              <div>
                <div className="text-xl font-black text-slate-800">
                  {Math.round(weather.temperature_2m)}°C
                </div>
                <div className="text-[10px] font-bold text-slate-400 uppercase">
                  Météo
                </div>
              </div>
            </div>
          )}

          <div className="hidden md:block">
            <span className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-sm font-bold border border-indigo-100 capitalize">
              {new Date().toLocaleDateString("fr-FR", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </span>
          </div>
        </div>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <div className="text-sm font-bold text-slate-400 uppercase mb-1">
              Base Clients
            </div>
            <div className="text-4xl font-black text-slate-900">
              {stats?.clients ?? 0}
            </div>
          </div>
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
            <Users size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <div className="text-sm font-bold text-slate-400 uppercase mb-1">
              Avis Reçus
            </div>
            <div className="text-4xl font-black text-slate-900">
              {stats.reviews}
            </div>
          </div>
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
            <MessageSquare size={24} />
          </div>
        </div>

        <div
          className="bg-gradient-to-br from-indigo-600 to-violet-700 p-6 rounded-[2rem] shadow-lg text-white cursor-pointer"
          onClick={onGenerate}
        >
          <h3 className="font-black text-xl mb-2">Créer un post IA</h3>
          <p className="text-indigo-100 text-sm mb-4">
            Générez du contenu viral en 1 clic.
          </p>
          <button className="bg-white text-indigo-600 px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2">
            <Sparkles size={16} /> Lancer le Studio
          </button>
        </div>
      </div>

      {/* Dernières créations */}
      <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
        <h3 className="font-black text-xl mb-6 flex items-center gap-2">
          <TrendingUp className="text-indigo-600" />
          Dernières Créations
        </h3>

        <div className="space-y-4">
          {posts.length === 0 ? (
            <div className="text-center py-10 text-slate-400">
              Aucun post pour le moment.
            </div>
          ) : (
            posts.slice(0, 3).map((post) => (
              <div
                key={post.id}
                onClick={() => navigate(`/marketing/${post.id}`)}
                className="flex items-start gap-4 p-4 rounded-2xl hover:bg-slate-50 transition cursor-pointer group"
              >
                <img
                  src={post.image_url}
                  alt=""
                  className="w-16 h-16 rounded-xl object-cover bg-slate-200"
                />
                <div className="flex-1">
                  <h4 className="font-bold text-slate-900 truncate">
                    {post.title || "Publication"}
                  </h4>
                  <p className="text-xs text-slate-500 line-clamp-1 mt-1">
                    {post.content}
                  </p>
                </div>
                <div className="hidden group-hover:flex items-center justify-center w-8 h-8 rounded-full bg-white border">
                  <ArrowRight size={16} />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
