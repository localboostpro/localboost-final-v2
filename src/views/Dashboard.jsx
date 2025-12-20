import React from "react";
import { MessageSquare, Users, TrendingUp, Plus, Calendar } from "lucide-react";

export default function Dashboard({ stats, posts, onGenerate }) {
  // On ne prend que les 3 derniers posts pour l'aperçu
  const recentPosts = posts ? posts.slice(0, 3) : [];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col justify-between h-40">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600"><Users size={24} /></div>
            <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">+12%</span>
          </div>
          <div>
            <div className="text-3xl font-black text-slate-900">{stats.clients}</div>
            <div className="text-sm font-medium text-slate-400">Clients Actifs</div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col justify-between h-40">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-rose-50 rounded-2xl text-rose-600"><MessageSquare size={24} /></div>
          </div>
          <div>
            <div className="text-3xl font-black text-slate-900">{stats.reviews}</div>
            <div className="text-sm font-medium text-slate-400">Avis Reçus</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-600 to-violet-600 p-6 rounded-[2rem] shadow-xl text-white flex flex-col justify-between h-40 relative overflow-hidden group cursor-pointer" onClick={onGenerate}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl group-hover:scale-150 transition duration-700"></div>
          <div className="relative z-10">
            <div className="text-lg font-black mb-1">Besoin d'un post ?</div>
            <div className="text-indigo-100 text-sm">L'IA rédige pour vous en 1 clic.</div>
          </div>
          <button className="relative z-10 bg-white text-indigo-600 py-3 px-4 rounded-xl font-bold text-sm flex items-center gap-2 w-fit mt-auto shadow-sm">
            <Plus size={16} /> Créer maintenant
          </button>
        </div>
      </div>

      {/* DERNIERS POSTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
          <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
            <TrendingUp size={20} className="text-indigo-600"/> Activité Récente
          </h3>
          
          {recentPosts.length > 0 ? (
            <div className="space-y-4">
              {recentPosts.map((post) => (
                <div key={post.id} className="flex gap-4 p-4 rounded-2xl border border-slate-50 hover:bg-slate-50 transition items-center">
                  <img src={post.image_url} alt="Post" className="w-16 h-16 rounded-xl object-cover shadow-sm bg-slate-200" />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-slate-900 truncate">{post.title || "Post sans titre"}</h4>
                    <p className="text-xs text-slate-500 truncate mt-1">{post.content}</p>
                    <div className="flex gap-2 mt-2">
                       {post.networks?.map(n => (
                         <span key={n} className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md uppercase">{n}</span>
                       ))}
                    </div>
                  </div>
                  <div className="text-xs font-bold text-slate-400 whitespace-nowrap">
                    {new Date(post.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-slate-400">
              <p>Aucun post généré pour le moment.</p>
              <button onClick={onGenerate} className="text-indigo-600 font-bold hover:underline mt-2">Commencer mon premier post</button>
            </div>
          )}
        </div>

        {/* CALENDRIER SIMPLIFIÉ */}
        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center mb-4">
             <Calendar size={32} />
          </div>
          <h3 className="font-black text-slate-900 mb-2">Planification</h3>
          <p className="text-sm text-slate-500 mb-6">Connectez vos réseaux pour planifier vos posts automatiquement.</p>
          <button className="w-full py-3 border-2 border-slate-100 rounded-xl font-bold text-slate-600 hover:bg-slate-50">Connecter (Bientôt)</button>
        </div>
      </div>
    </div>
  );
}
