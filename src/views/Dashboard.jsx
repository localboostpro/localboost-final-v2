import React from "react";
import { Users, MessageSquare, TrendingUp, Calendar, ArrowRight, CheckCircle, AlertCircle, Sparkles } from "lucide-react";

export default function Dashboard({ stats, posts, onGenerate, profile }) {
  // Vérification des liens sociaux
  const socialConnected = profile?.instagram_url || profile?.facebook_url;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      <div className="flex justify-between items-end">
         <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Bonjour, {profile?.name || "Pro"} 👋</h1>
            <p className="text-slate-500 font-medium mt-2">Voici ce qu'il se passe aujourd'hui.</p>
         </div>
         <div className="hidden md:block">
            <span className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-sm font-bold border border-indigo-100">
               {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
            </span>
         </div>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex items-center justify-between group hover:border-indigo-100 transition">
          <div>
            <div className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Clients Actifs</div>
            <div className="text-4xl font-black text-slate-900">{stats.clients}</div>
          </div>
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition">
            <Users size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex items-center justify-between group hover:border-indigo-100 transition">
          <div>
            <div className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Avis Récoltés</div>
            <div className="text-4xl font-black text-slate-900">{stats.reviews}</div>
          </div>
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition">
            <MessageSquare size={24} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-6 rounded-[2rem] shadow-lg shadow-indigo-200 text-white relative overflow-hidden">
            <div className="relative z-10">
                <h3 className="font-black text-xl mb-2">Besoin d'un post ?</h3>
                <p className="text-indigo-100 text-sm mb-4">L'IA rédige pour vous en 1 clic.</p>
                <button onClick={onGenerate} className="bg-white text-indigo-600 px-4 py-2 rounded-xl font-bold text-sm hover:bg-indigo-50 transition flex items-center gap-2">
                    <Sparkles size={16}/> Créer maintenant
                </button>
            </div>
            <Sparkles className="absolute -bottom-4 -right-4 text-white/10 w-32 h-32 rotate-12"/>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ACTIVITÉ RÉCENTE (Vrais Posts) */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
           <h3 className="font-black text-xl text-slate-900 mb-6 flex items-center gap-2"><TrendingUp className="text-indigo-600"/> Activité Récente</h3>
           <div className="space-y-4">
              {posts.length === 0 ? (
                  <div className="text-center py-10 text-slate-400 italic">Aucun post généré récemment.</div>
              ) : (
                  posts.slice(0, 3).map(post => (
                      <div key={post.id} className="flex items-start gap-4 p-4 rounded-2xl hover:bg-slate-50 transition border border-transparent hover:border-slate-100">
                          <img src={post.image_url} className="w-16 h-16 rounded-xl object-cover bg-slate-200" alt="post"/>
                          <div>
                              <h4 className="font-bold text-slate-900">{post.title || "Post IA"}</h4>
                              <p className="text-xs text-slate-500 line-clamp-1 mt-1">{post.content}</p>
                              <div className="flex gap-2 mt-2">
                                  {post.networks?.map(n => (
                                      <span key={n} className="text-[10px] font-bold uppercase bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-md">{n}</span>
                                  ))}
                              </div>
                          </div>
                      </div>
                  ))
              )}
           </div>
        </div>

        {/* PLANIFICATION / RÉSEAUX */}
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col items-center text-center justify-center">
             <div className={`w-16 h-16 rounded-3xl flex items-center justify-center mb-4 ${socialConnected ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                 <Calendar size={32}/>
             </div>
             <h3 className="font-black text-lg text-slate-900">Réseaux Sociaux</h3>
             <p className="text-sm text-slate-500 mb-6 px-4">
                 {socialConnected 
                    ? "Vos comptes sont connectés. La planification automatique est active." 
                    : "Connectez vos réseaux dans votre profil pour activer la planification."}
             </p>
             
             {socialConnected ? (
                 <div className="flex items-center gap-2 text-green-600 font-bold bg-green-50 px-4 py-2 rounded-xl">
                     <CheckCircle size={18}/> Connecté
                 </div>
             ) : (
                 <a href="/profile" className="w-full py-3 rounded-xl border-2 border-slate-100 font-bold text-slate-600 hover:border-indigo-600 hover:text-indigo-600 transition flex items-center justify-center gap-2">
                     <AlertCircle size={18}/> Configurer
                 </a>
             )}
        </div>
      </div>
    </div>
  );
}
