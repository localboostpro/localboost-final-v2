import React, { useState, useRef } from "react";
import { supabase } from "../lib/supabase";
import { generatePostContent } from "../lib/openai";
import canvasConfetti from "canvas-confetti";
import {
  Wand2, Upload, Instagram, Facebook, Linkedin,
  Save, Sparkles, Smartphone, History, Trash2,
  Lock, ArrowRight, X // J'ai ajouté X ici
} from "lucide-react";

export default function Marketing({ posts, currentPost, setCurrentPost, profile, onUpdate }) {
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeNetwork, setActiveNetwork] = useState("Instagram");
  const [imageSource, setImageSource] = useState("AI");
  const [style, setStyle] = useState("Professionnel");
  const [hashtags, setHashtags] = useState([]);
  
  const fileInputRef = useRef(null);

  // --- 1. PROTECTION BASIC (Point #6) ---
  if (profile?.subscription_tier === 'basic') {
    return (
      <div className="h-[calc(100vh-100px)] flex flex-col items-center justify-center text-center p-8 bg-slate-900 rounded-[2rem] text-white shadow-xl relative overflow-hidden animate-in fade-in duration-700">
         <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-600/20 to-purple-600/20 z-0"></div>
         <div className="absolute -top-20 -right-20 w-64 h-64 bg-indigo-500/30 rounded-full blur-3xl"></div>
         <div className="relative z-10 max-w-lg mx-auto">
            <div className="bg-white/10 w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-8 backdrop-blur-md border border-white/10 shadow-2xl shadow-indigo-500/20">
                <Lock size={48} className="text-indigo-400"/>
            </div>
            <h2 className="text-4xl font-black mb-4 tracking-tight">Studio Marketing IA</h2>
            <p className="text-slate-300 mb-8 text-lg leading-relaxed">
                Débloquez la puissance de l'Intelligence Artificielle pour générer vos posts et visuels en un clic.
                <br/><br/>
                <span className="bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-lg text-sm font-bold border border-indigo-500/30">
                  Fonctionnalité réservée aux membres Premium
                </span>
            </p>
            <button onClick={() => alert("Rendez-vous dans l'onglet 'Mon Profil' pour passer en Premium !")} className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-3 mx-auto transition-all hover:scale-105 shadow-lg shadow-indigo-900/50">
                Débloquer maintenant <ArrowRight size={20}/>
            </button>
         </div>
      </div>
    );
  }

  // --- NOUVELLE FONCTION SUPPRESSION ---
  const handleDeletePost = async (e, postId) => {
      e.stopPropagation(); // Empêche de cliquer sur le post pour l'ouvrir
      if(!window.confirm("Voulez-vous vraiment supprimer ce post de l'historique ?")) return;
      
      const { error } = await supabase.from("posts").delete().eq("id", postId);
      if(!error) {
          // On recharge la page pour mettre à jour la liste simplement
          window.location.reload(); 
      } else {
          alert("Erreur lors de la suppression");
      }
  };

  // --- 2. LOGIQUE STANDARD ---

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      setIsLoading(true);
      const fileName = `${profile?.id || 'temp'}/${Date.now()}_${file.name.replace(/\s/g, '_')}`;
      const { error } = await supabase.storage.from("user_uploads").upload(fileName, file);
      if (error) throw error;
      const { data } = supabase.storage.from("user_uploads").getPublicUrl(fileName);
      
      const newPost = { ...currentPost, image_url: data.publicUrl };
      setCurrentPost(newPost);
      setImageSource("UPLOAD");
    } catch (error) {
      alert("Erreur upload: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!prompt) return alert("Décrivez votre idée de post !");
    setIsLoading(true);
    try {
      const fullPrompt = `Rédige un post pour ${activeNetwork}. Ton: ${style}. Sujet: ${prompt}. Ville: ${profile?.city}.`;
      const aiResult = await generatePostContent(fullPrompt, profile);

      if (aiResult) {
        let finalImage = currentPost?.image_url;
        if (imageSource === "AI") {
          const ratio = activeNetwork === "Facebook" ? "width=1200&height=630" : "width=1080&height=1080";
          finalImage = `https://image.pollinations.ai/prompt/${encodeURIComponent(aiResult.image_keyword)}?${ratio}&nologo=true`;
        }
        
        const newPost = {
            id: currentPost?.id || Date.now(),
            business_id: profile?.id,
            title: aiResult.title,
            content: aiResult.content,
            image_url: finalImage,
            networks: [activeNetwork],
            created_at: new Date().toISOString(),
        };
        setCurrentPost(newPost);
        setHashtags([`#${profile?.city?.replace(/\s/g,'') || 'Local'}`, "#Nouveauté", "#Promo"]);
      }
    } catch (e) {
      console.error(e);
      alert("Erreur IA");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!currentPost || !profile?.id) return alert("Profil introuvable");
    const { id, ...data } = currentPost;
    data.business_id = profile.id;
    
    // Nettoyage pour Supabase
    if(typeof data.id === 'number') delete data.id;

    const { data: savedPost, error } = await supabase.from("posts").insert([data]).select();
    
    if (!error && onUpdate) {
      onUpdate(savedPost[0]);
      canvasConfetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
      alert("✅ Post enregistré !");
    } else {
      console.error(error);
      alert("Erreur sauvegarde");
    }
  };

  return (
    <div className="h-[calc(100vh-100px)] flex gap-6 pb-6 animate-in fade-in duration-500">
      
      {/* Historique AVEC SUPPRESSION */}
      <div className="w-64 flex flex-col bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden shrink-0 hidden lg:flex">
        <div className="p-4 border-b bg-slate-50 font-bold text-xs uppercase text-slate-400 flex items-center gap-2">
          <History size={14}/> Historique
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
          {posts.map(post => (
             <div key={post.id} onClick={() => setCurrentPost(post)} className="flex gap-3 p-2 rounded-xl hover:bg-slate-50 cursor-pointer border border-transparent hover:border-slate-100 transition group relative">
               <img src={post.image_url} className="w-10 h-10 rounded-lg object-cover bg-slate-200" alt="mini"/>
               <div className="overflow-hidden flex-1">
                 <div className="font-bold text-xs truncate text-slate-800">{post.title || "Post"}</div>
                 <div className="text-[10px] text-slate-400">{new Date(post.created_at).toLocaleDateString()}</div>
               </div>
               {/* BOUTON SUPPRESSION AJOUTÉ ICI */}
               <button 
                  onClick={(e) => handleDeletePost(e, post.id)} 
                  className="absolute top-1 right-1 bg-white rounded-full p-1 text-slate-300 hover:text-rose-500 shadow-sm opacity-0 group-hover:opacity-100 transition"
                  title="Supprimer"
               >
                   <X size={12}/>
               </button>
             </div>
          ))}
        </div>
      </div>

      {/* Éditeur */}
      <div className="flex-1 flex flex-col gap-4 overflow-y-auto custom-scrollbar">
        <div className="flex justify-between items-center bg-white p-4 rounded-[2rem] border shadow-sm">
          <h2 className="font-black text-slate-900 text-lg flex items-center gap-2"><Sparkles className="text-indigo-600"/> Studio Créatif</h2>
          <button onClick={() => {setCurrentPost(null); setPrompt("");}} className="text-xs font-bold text-slate-400 hover:text-red-500 flex gap-1 items-center"><Trash2 size={12}/> Réinitialiser</button>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border shadow-sm">
           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Destination</label>
           <div className="grid grid-cols-3 gap-2">
             {['Instagram', 'Facebook', 'LinkedIn'].map(net => (
               <button key={net} onClick={() => setActiveNetwork(net)} className={`py-3 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition ${activeNetwork === net ? "bg-slate-900 text-white border-slate-900 shadow-md" : "text-slate-500 border-slate-100 hover:bg-slate-50"}`}>
                 {net === 'Instagram' ? <Instagram size={14}/> : net === 'Facebook' ? <Facebook size={14}/> : <Linkedin size={14}/>} {net}
               </button>
             ))}
           </div>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border shadow-sm flex-1 flex flex-col">
           <div className="flex gap-2 mb-4 bg-slate-50 p-1.5 rounded-xl w-fit border border-slate-100">
              <button onClick={() => setImageSource("AI")} className={`px-4 py-2 text-xs font-bold rounded-lg transition ${imageSource === 'AI' ? 'bg-white shadow text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}>Image IA</button>
              <button onClick={() => document.getElementById('uploadInput').click()} className={`px-4 py-2 text-xs font-bold rounded-lg transition ${imageSource === 'UPLOAD' ? 'bg-white shadow text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}>Importer</button>
              <input id="uploadInput" type="file" className="hidden" onChange={handleFileUpload} accept="image/*"/>
           </div>

           <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Décrivez votre idée de post (ex: Promo spéciale été sur les croissants...)" className="w-full h-32 bg-slate-50 rounded-2xl p-4 text-sm outline-none resize-none mb-4 focus:ring-2 ring-indigo-100 transition border border-slate-100" />
           
           <button onClick={handleGenerate} disabled={isLoading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-xl font-bold shadow-lg shadow-indigo-200 flex justify-center items-center gap-2 transition mt-auto">
             {isLoading ? "L'IA travaille..." : <><Wand2 size={16}/> Générer le post</>}
           </button>
        </div>
      </div>

      {/* Preview */}
      <div className="w-[400px] bg-slate-100 rounded-[2rem] border p-6 flex flex-col items-center justify-center shrink-0">
        {currentPost ? (
          <div className="w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-300">
             <div className="p-3 border-b flex items-center gap-2">
               <div className="w-8 h-8 bg-indigo-600 rounded-full text-white text-[10px] font-black flex items-center justify-center shadow-md">{profile?.name?.[0]}</div>
               <span className="text-xs font-bold text-slate-900">{profile?.name}</span>
             </div>
             <div className={`w-full bg-slate-100 relative ${activeNetwork === 'Facebook' ? 'aspect-video' : 'aspect-square'}`}>
               <img src={currentPost.image_url} className="w-full h-full object-cover" alt="Visuel"/>
             </div>
             <div className="p-4">
               <div className="text-xs text-slate-600 leading-relaxed mb-3 whitespace-pre-wrap">{currentPost.content}</div>
               <div className="flex flex-wrap gap-1">{hashtags.map(tag => <span key={tag} className="text-[9px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">{tag}</span>)}</div>
             </div>
             <button onClick={handleSave} className="w-full bg-slate-900 text-white py-4 font-bold text-xs hover:bg-slate-800 transition">ENREGISTRER</button>
          </div>
        ) : (
          <div className="text-center text-slate-400">
            <Smartphone size={64} className="mx-auto mb-4 opacity-20"/>
            <p className="text-sm font-bold opacity-50">Aperçu en attente</p>
          </div>
        )}
      </div>
    </div>
  );
}
