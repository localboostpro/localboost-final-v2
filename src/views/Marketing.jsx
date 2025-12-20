import React, { useState, useRef } from "react";
import { supabase } from "../lib/supabase";
import { generatePostContent } from "../lib/openai"; 
import canvasConfetti from "canvas-confetti";
import {
  Wand2, Upload, Instagram, Facebook, Linkedin, 
  Save, Sparkles, Image as ImageIcon, History,
  Smartphone, Hash, Send, Trash2, CheckCircle2
} from "lucide-react";

export default function Marketing({ posts, currentPost, setCurrentPost, profile, onUpdate }) {
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeNetwork, setActiveNetwork] = useState("Instagram"); 
  const [imageSource, setImageSource] = useState("AI");
  const [style, setStyle] = useState("Professionnel");
  const [hashtags, setHashtags] = useState([]);
  
  const fileInputRef = useRef(null);

  // --- LOGIQUE METIER ---
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      setIsLoading(true);
      const fileName = `${profile?.id}/${Date.now()}_${file.name.replace(/\s/g, '_')}`;
      const { error } = await supabase.storage.from("user_uploads").upload(fileName, file);
      if (error) throw error;
      const { data } = supabase.storage.from("user_uploads").getPublicUrl(fileName);
      setCurrentPost(prev => ({ ...prev, image_url: data.publicUrl }));
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

        setCurrentPost({
          ...currentPost,
          business_id: profile.id,
          title: aiResult.title,
          content: aiResult.content,
          image_url: finalImage,
          networks: [activeNetwork],
          created_at: new Date().toISOString(),
        });
        
        // Génération Tags
        setHashtags([`#${profile?.city?.replace(/\s/g,'')}`, `#${profile?.name?.replace(/\s/g,'')}`, "#Nouveauté", "#Local"]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!currentPost || !profile?.id) return;
    const { id, ...data } = currentPost;
    data.business_id = profile.id;
    
    const { data: savedPost, error } = await supabase.from("posts").insert([data]).select();
    if (!error && onUpdate) {
      onUpdate(savedPost[0]);
      canvasConfetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    }
  };

  return (
    <div className="h-[calc(100vh-100px)] flex gap-6 pb-6">
      
      {/* 1. HISTORIQUE (GAUCHE - NOUVEAU) */}
      <div className="w-64 flex flex-col bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden shrink-0 hidden lg:flex">
        <div className="p-4 border-b bg-slate-50 font-bold text-xs uppercase text-slate-400 flex items-center gap-2">
          <History size={14}/> Vos précédents posts
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
          {posts && posts.map(post => (
             <div key={post.id} onClick={() => setCurrentPost(post)} className="flex gap-3 p-2 rounded-xl hover:bg-slate-50 cursor-pointer border border-transparent hover:border-slate-100 transition">
               <img src={post.image_url} className="w-10 h-10 rounded-lg object-cover bg-slate-200" alt="mini"/>
               <div className="overflow-hidden">
                 <div className="font-bold text-xs truncate text-slate-800">{post.title || "Post"}</div>
                 <div className="text-[10px] text-slate-400">{new Date(post.created_at).toLocaleDateString()}</div>
               </div>
             </div>
          ))}
        </div>
      </div>

      {/* 2. CONFIGURATEUR (CENTRE) */}
      <div className="flex-1 flex flex-col gap-4 overflow-y-auto custom-scrollbar">
        {/* Header simple */}
        <div className="flex justify-between items-center bg-white p-4 rounded-2xl border shadow-sm">
          <h2 className="font-black text-slate-900 text-lg flex items-center gap-2"><Sparkles className="text-indigo-600"/> Studio Créatif</h2>
          <button onClick={() => setCurrentPost(null)} className="text-xs font-bold text-slate-400 hover:text-indigo-600">Nouveau</button>
        </div>

        {/* Choix Réseau */}
        <div className="bg-white p-5 rounded-3xl border shadow-sm">
           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Destination</label>
           <div className="grid grid-cols-3 gap-2">
             {['Instagram', 'Facebook', 'LinkedIn'].map(net => (
               <button key={net} onClick={() => setActiveNetwork(net)} className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 ${activeNetwork === net ? "bg-slate-900 text-white border-slate-900" : "text-slate-500 border-slate-100"}`}>
                 {net === 'Instagram' ? <Instagram size={14}/> : net === 'Facebook' ? <Facebook size={14}/> : <Linkedin size={14}/>} {net}
               </button>
             ))}
           </div>
        </div>

        {/* Prompt & Bouton */}
        <div className="bg-white p-5 rounded-3xl border shadow-sm flex-1">
           <div className="flex gap-2 mb-3 bg-slate-100 p-1 rounded-lg w-fit">
              <button onClick={() => setImageSource("AI")} className={`px-3 py-1 text-xs font-bold rounded-md ${imageSource === 'AI' ? 'bg-white shadow text-indigo-600' : 'text-slate-500'}`}>Image IA</button>
              <button onClick={() => document.getElementById('uploadInput').click()} className={`px-3 py-1 text-xs font-bold rounded-md ${imageSource === 'UPLOAD' ? 'bg-white shadow text-indigo-600' : 'text-slate-500'}`}>Importer</button>
              <input id="uploadInput" type="file" className="hidden" onChange={handleFileUpload} accept="image/*"/>
           </div>

           <textarea 
             value={prompt} 
             onChange={(e) => setPrompt(e.target.value)} 
             placeholder="Sujet du post..." 
             className="w-full h-32 bg-slate-50 rounded-xl p-4 text-sm outline-none resize-none mb-4"
           />
           
           <button onClick={handleGenerate} disabled={isLoading} className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold shadow-lg flex justify-center items-center gap-2">
             {isLoading ? "Génération..." : <><Wand2 size={16}/> Générer le post</>}
           </button>
        </div>
      </div>

      {/* 3. PREVIEW (DROITE) */}
      <div className="w-[400px] bg-slate-100 rounded-[3rem] border p-6 flex flex-col items-center justify-center shrink-0">
        {currentPost ? (
          <div className="w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 animate-in zoom-in-95">
             <div className="p-3 border-b flex items-center gap-2">
               <div className="w-6 h-6 bg-indigo-600 rounded-full text-white text-[8px] font-black flex items-center justify-center">{profile?.name?.[0]}</div>
               <span className="text-[10px] font-bold">{profile?.name}</span>
             </div>
             <div className={`w-full bg-slate-100 relative ${activeNetwork === 'Facebook' ? 'aspect-video' : 'aspect-square'}`}>
               <img src={currentPost.image_url} className="w-full h-full object-cover" alt="Visuel"/>
             </div>
             <div className="p-3">
               <div className="text-[10px] text-slate-600 leading-relaxed mb-2">{currentPost.content}</div>
               <div className="flex flex-wrap gap-1">
                 {hashtags.map(tag => <span key={tag} className="text-[8px] font-bold text-indigo-600 bg-indigo-50 px-1.5 rounded">{tag}</span>)}
               </div>
             </div>
             <button onClick={handleSave} className="w-full bg-slate-900 text-white py-3 font-bold text-xs hover:bg-slate-800 transition">ENREGISTRER</button>
          </div>
        ) : (
          <div className="text-center text-slate-400">
            <Smartphone size={48} className="mx-auto mb-2 opacity-50"/>
            <p className="text-xs font-bold">Aperçu en attente</p>
          </div>
        )}
      </div>

    </div>
  );
}
