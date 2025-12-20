import React, { useState, useRef } from "react";
import { supabase } from "../lib/supabase";
import { generatePostContent } from "../lib/openai";
import canvasConfetti from "canvas-confetti";
import {
  Wand2, Upload, Instagram, Facebook, Linkedin,
  Save, Sparkles, Smartphone, History, Trash2,
  Lock, ArrowRight, X, LayoutList, Calendar as CalendarIcon, Eye, PenTool,
  Megaphone // Nouvelle icône pour le Ton
} from "lucide-react";

export default function Marketing({ posts, currentPost, setCurrentPost, profile, onUpdate }) {
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeNetwork, setActiveNetwork] = useState("Instagram");
  const [imageSource, setImageSource] = useState("AI");
  
  // NOUVEAU : État pour le Ton (par défaut "Professionnel")
  const [style, setStyle] = useState("Professionnel");
  
  const [hashtags, setHashtags] = useState([]);
  const [viewMode, setViewMode] = useState("list"); 
  const [mobileTab, setMobileTab] = useState("editor");
  const fileInputRef = useRef(null);

  // Liste des tons disponibles
  const availableTones = ["Professionnel", "Amical", "Drôle", "Urgent", "Luxe"];

  const hideScrollbarStyle = {
    scrollbarWidth: 'none',
    msOverflowStyle: 'none'
  };

  // --- PROTECTION BASIC ---
  if (profile?.subscription_tier === 'basic') {
    return (
      <div className="h-[calc(100vh-100px)] flex flex-col items-center justify-center text-center p-8 bg-slate-900 rounded-[2rem] text-white shadow-xl relative overflow-hidden animate-in fade-in duration-700">
         <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-600/20 to-purple-600/20 z-0"></div>
         <div className="absolute -top-20 -right-20 w-64 h-64 bg-indigo-500/30 rounded-full blur-3xl"></div>
         <div className="relative z-10 max-w-lg mx-auto">
            <div className="bg-white/10 w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-8 backdrop-blur-md border border-white/10 shadow-2xl shadow-indigo-500/20">
                <Lock size={48} className="text-indigo-400"/>
            </div>
            <h2 className="text-2xl md:text-4xl font-black mb-4 tracking-tight">Studio Marketing IA</h2>
            <p className="text-slate-300 mb-8 text-sm md:text-lg leading-relaxed px-4">
                Débloquez la puissance de l'Intelligence Artificielle pour générer vos posts et visuels en un clic.
            </p>
            <button onClick={() => alert("Passez en Premium via 'Mon Profil'")} className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-3 mx-auto transition-all shadow-lg shadow-indigo-900/50 text-sm md:text-base">
                Débloquer maintenant <ArrowRight size={20}/>
            </button>
         </div>
      </div>
    );
  }

  const handleDeletePost = async (e, postId) => {
      e.stopPropagation(); 
      if(!window.confirm("Supprimer ce post ?")) return;
      const { error } = await supabase.from("posts").delete().eq("id", postId);
      if(!error) window.location.reload(); 
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      setIsLoading(true);
      const fileName = `${profile?.id || 'temp'}/${Date.now()}_${file.name.replace(/\s/g, '_')}`;
      const { error } = await supabase.storage.from("user_uploads").upload(fileName, file);
      if (error) throw error;
      const { data } = supabase.storage.from("user_uploads").getPublicUrl(fileName);
      setCurrentPost({ ...currentPost, image_url: data.publicUrl });
      setImageSource("UPLOAD");
    } catch (error) { alert("Erreur upload: " + error.message); } finally { setIsLoading(false); }
  };

  const handleGenerate = async () => {
    if (!prompt) return alert("Décrivez votre idée !");
    setIsLoading(true);
    if(window.innerWidth < 1024) setMobileTab("preview"); 
    try {
      // L'IA utilise maintenant la variable 'style' sélectionnée
      const fullPrompt = `Rédige un post pour ${activeNetwork}. Ton: ${style}. Sujet: ${prompt}. Ville: ${profile?.city}.`;
      const aiResult = await generatePostContent(fullPrompt, profile);
      if (aiResult) {
        let finalImage = currentPost?.image_url;
        if (imageSource === "AI") {
          const ratio = activeNetwork === "Facebook" ? "width=1200&height=630" : "width=1080&height=1080";
          finalImage = `https://image.pollinations.ai/prompt/${encodeURIComponent(aiResult.image_keyword)}?${ratio}&nologo=true`;
        }
        setCurrentPost({
            id: currentPost?.id || Date.now(),
            business_id: profile?.id,
            title: aiResult.title,
            content: aiResult.content,
            image_url: finalImage,
            networks: [activeNetwork],
            created_at: new Date().toISOString(),
        });
        setHashtags(["#Local", "#Nouveauté", "#Promo"]);
      }
    } catch (e) { console.error(e); alert("Erreur IA"); } finally { setIsLoading(false); }
  };

  const handleSave = async () => {
    if (!currentPost || !profile?.id) return alert("Profil introuvable");
    const { id, ...data } = currentPost;
    data.business_id = profile.id;
    if(typeof data.id === 'number') delete data.id;
    const { data: savedPost, error } = await supabase.from("posts").insert([data]).select();
    if (!error && onUpdate) {
      onUpdate(savedPost[0]);
      canvasConfetti();
      alert("✅ Post enregistré !");
    } else { alert("Erreur sauvegarde"); }
  };

  const renderCalendar = () => {
    const today = new Date();
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    return (
      <div className="grid grid-cols-5 gap-2 p-2">
        {days.map(day => {
          const postsForDay = posts.filter(p => {
            const d = new Date(p.created_at);
            return d.getDate() === day && d.getMonth() === today.getMonth();
          });
          return (
            <div key={day} className={`aspect-square rounded-xl border flex flex-col items-center justify-start pt-1 relative ${postsForDay.length > 0 ? 'bg-indigo-50 border-indigo-200' : 'bg-slate-50 border-slate-100'}`}>
                <span className={`text-[10px] font-bold ${postsForDay.length > 0 ? 'text-indigo-600' : 'text-slate-400'}`}>{day}</span>
                {postsForDay.map(p => (
                   <div key={p.id} onClick={() => { setCurrentPost(p); setMobileTab("preview"); }} className="w-3 h-3 md:w-4 md:h-4 mt-1 rounded-full bg-indigo-500 border-2 border-white cursor-pointer hover:scale-110 transition"></div>
                ))}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex flex-col lg:flex-row h-full gap-6 pb-20 lg:pb-6 animate-in fade-in duration-500 relative">
      
      {/* MENU MOBILE */}
      <div className="lg:hidden flex bg-white rounded-2xl p-1 mb-4 shadow-sm border border-slate-100 shrink-0 sticky top-0 z-20 mx-4 md:mx-0">
          <button onClick={() => setMobileTab("history")} className={`flex-1 py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition ${mobileTab === 'history' ? 'bg-slate-900 text-white shadow' : 'text-slate-500'}`}>
              <History size={14}/> Historique
          </button>
          <button onClick={() => setMobileTab("editor")} className={`flex-1 py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition ${mobileTab === 'editor' ? 'bg-slate-900 text-white shadow' : 'text-slate-500'}`}>
              <PenTool size={14}/> Éditeur
          </button>
          <button onClick={() => setMobileTab("preview")} className={`flex-1 py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition ${mobileTab === 'preview' ? 'bg-indigo-600 text-white shadow' : 'text-slate-500'}`}>
              <Eye size={14}/> Aperçu
          </button>
      </div>

      {/* HISTORIQUE */}
      <div className={`${mobileTab === 'history' ? 'flex' : 'hidden'} lg:flex w-full lg:w-80 flex-col bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden shrink-0 h-[60vh] lg:h-auto`}>
        <div className="p-4 border-b bg-slate-50 flex justify-between items-center shrink-0">
            <div className="font-bold text-xs uppercase text-slate-400 flex items-center gap-2">
              {viewMode === 'list' ? <LayoutList size={14}/> : <CalendarIcon size={14}/>} 
              {viewMode === 'list' ? "Vos Créations" : "Ce mois-ci"}
            </div>
            <div className="flex bg-slate-200 rounded-lg p-1 gap-1">
                <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-md transition ${viewMode === 'list' ? 'bg-white text-indigo-600 shadow' : 'text-slate-500'}`}><LayoutList size={14}/></button>
                <button onClick={() => setViewMode('calendar')} className={`p-1.5 rounded-md transition ${viewMode === 'calendar' ? 'bg-white text-indigo-600 shadow' : 'text-slate-500'}`}><CalendarIcon size={14}/></button>
            </div>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {viewMode === 'list' ? (
             <div className="p-3 space-y-2">
               {posts.map(post => (
                 <div key={post.id} onClick={() => { setCurrentPost(post); setMobileTab("preview"); }} className="flex gap-3 p-2 rounded-xl hover:bg-slate-50 cursor-pointer border border-transparent hover:border-slate-100 transition group relative">
                   <img src={post.image_url} className="w-12 h-12 rounded-lg object-cover bg-slate-200" alt="mini"/>
                   <div className="overflow-hidden flex-1">
                     <div className="font-bold text-xs truncate text-slate-800">{post.title || "Post"}</div>
                     <div className="text-[10px] text-slate-400">{new Date(post.created_at).toLocaleDateString()}</div>
                     <div className="flex gap-1 mt-1">{post.networks?.map(n => <span key={n} className="text-[8px] bg-indigo-50 text-indigo-600 px-1 rounded">{n[0]}</span>)}</div>
                   </div>
                   <button onClick={(e) => handleDeletePost(e, post.id)} className="absolute top-1 right-1 bg-white rounded-full p-1 text-slate-300 hover:text-rose-500 shadow-sm opacity-0 group-hover:opacity-100 transition"><X size={12}/></button>
                 </div>
               ))}
               {posts.length === 0 && <div className="text-center text-slate-400 text-xs py-10">Aucun post.</div>}
             </div>
          ) : renderCalendar()}
        </div>
      </div>

      {/* ÉDITEUR */}
      <div className={`${mobileTab === 'editor' ? 'flex' : 'hidden'} lg:flex flex-1 flex-col gap-4 overflow-y-auto custom-scrollbar`}>
        <div className="flex justify-between items-center bg-white p-4 rounded-[2rem] border shadow-sm">
          <h2 className="font-black text-slate-900 text-lg flex items-center gap-2"><Sparkles className="text-indigo-600"/> Studio Créatif</h2>
          <button onClick={() => {setCurrentPost(null); setPrompt("");}} className="text-xs font-bold text-slate-400 hover:text-red-500 flex gap-1 items-center"><Trash2 size={12}/> Réinitialiser</button>
        </div>

        {/* SÉLECTEUR DE RÉSEAU */}
        <div className="bg-white p-6 rounded-[2rem] border shadow-sm">
           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Réseau Social</label>
           <div className="grid grid-cols-3 gap-2">
             {['Instagram', 'Facebook', 'LinkedIn'].map(net => (
               <button key={net} onClick={() => setActiveNetwork(net)} className={`py-3 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition ${activeNetwork === net ? "bg-slate-900 text-white border-slate-900 shadow-md" : "text-slate-500 border-slate-100 hover:bg-slate-50"}`}>
                 {net === 'Instagram' ? <Instagram size={14}/> : net === 'Facebook' ? <Facebook size={14}/> : <Linkedin size={14}/>} <span className="hidden md:inline">{net}</span>
               </button>
             ))}
           </div>
        </div>

        {/* NOUVEAU : SÉLECTEUR DE TON */}
        <div className="bg-white p-6 rounded-[2rem] border shadow-sm">
           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
             <Megaphone size={14} className="text-indigo-600"/> Ton de la communication
           </label>
           <div className="flex flex-wrap gap-2">
             {availableTones.map(ton => (
               <button key={ton} onClick={() => setStyle(ton)} className={`py-2 px-4 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition ${style === ton ? "bg-indigo-100 text-indigo-700 border-indigo-200" : "text-slate-500 border-slate-100 hover:bg-slate-50"}`}>
                 {ton}
               </button>
             ))}
           </div>
        </div>

        {/* ZONE DE TEXTE ET IMAGE */}
        <div className="bg-white p-6 rounded-[2rem] border shadow-sm flex-1 flex flex-col">
           <div className="flex flex-wrap gap-2 mb-4 bg-slate-50 p-1.5 rounded-xl w-fit border border-slate-100">
              <button onClick={() => setImageSource("AI")} className={`px-4 py-2 text-xs font-bold rounded-lg transition ${imageSource === 'AI' ? 'bg-white shadow text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}>Image IA</button>
              <button onClick={() => document.getElementById('uploadInput').click()} className={`px-4 py-2 text-xs font-bold rounded-lg transition ${imageSource === 'UPLOAD' ? 'bg-white shadow text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}>Importer</button>
              <input id="uploadInput" type="file" className="hidden" onChange={handleFileUpload} accept="image/*"/>
           </div>

           <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Décrivez votre idée (ex: Promotion -20% sur toute la boutique ce week-end...)" className="w-full h-32 md:h-full bg-slate-50 rounded-2xl p-4 text-sm outline-none resize-none mb-4 focus:ring-2 ring-indigo-100 transition border border-slate-100" />
           
           <button onClick={handleGenerate} disabled={isLoading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-xl font-bold shadow-lg shadow-indigo-200 flex justify-center items-center gap-2 transition mt-auto">
             {isLoading ? "L'IA réfléchit..." : <><Wand2 size={16}/> Générer avec l'IA</>}
           </button>
        </div>
      </div>

      {/* PRÉVISUALISATION SMARTPHONE */}
      <div className={`${mobileTab === 'preview' ? 'flex' : 'hidden'} lg:flex w-full lg:w-[420px] bg-slate-100 rounded-[2.5rem] border p-4 lg:p-8 flex-col items-center justify-center shrink-0 overflow-hidden relative min-h-[500px]`}>
         <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none" style={{backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '20px 20px'}}></div>
         
         <div className="text-center mb-6 z-10">
            <h3 className="font-black text-slate-900 text-lg">Aperçu {activeNetwork}</h3>
            <p className="text-xs text-slate-500">Tel que vos clients le verront.</p>
         </div>

         <div className="relative w-full max-w-[300px] h-[550px] lg:h-[600px] bg-white rounded-[3rem] border-8 border-slate-900 shadow-2xl overflow-hidden flex flex-col z-10 animate-in zoom-in-95 duration-500 mx-auto">
            {/* Notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-900 rounded-b-2xl z-20"></div>
            
            {/* Contenu Écran - CORRECTION BUG ARRONDI : ajout de rounded-t-[2.5rem] */}
            <div className="flex-1 overflow-y-auto bg-white rounded-t-[2.5rem]" style={hideScrollbarStyle}>
                {currentPost ? (
                   <>
                      <div className="h-14 border-b flex items-center px-4 gap-3 pt-6 bg-white/90 backdrop-blur sticky top-0 z-10">
                          <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold">{profile?.name?.[0]}</div>
                          <div className="text-xs font-bold truncate">{profile?.name}</div>
                      </div>
                      
                      <div className="w-full aspect-square bg-slate-100 overflow-hidden">
                          <img src={currentPost.image_url} className="w-full h-full object-cover" alt="Post"/>
                      </div>

                      <div className="px-4 py-3 flex gap-4 text-slate-800">
                          <div className="hover:text-red-500 cursor-pointer">♥</div>
                          <div>💬</div>
                          <div>✈️</div>
                      </div>

                      <div className="px-4 pb-8">
                          <p className="text-[11px] text-slate-800 leading-relaxed">
                            <span className="font-bold mr-1">{profile?.name}</span>
                            {currentPost.content}
                          </p>
                          <div className="flex flex-wrap gap-1 mt-2">
                             {hashtags.map(t => <span key={t} className="text-[10px] text-indigo-600 font-medium">{t}</span>)}
                          </div>
                      </div>
                   </>
                ) : (
                   <div className="h-full flex flex-col items-center justify-center text-slate-300 p-8 text-center">
                       <Smartphone size={48} className="mb-4 opacity-50"/>
                       <p className="text-xs font-bold">Générez un post pour voir l'aperçu ici.</p>
                   </div>
                )}
            </div>

            {currentPost && (
                <div className="p-3 bg-white border-t z-20">
                    <button onClick={handleSave} className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold text-xs shadow-lg hover:bg-indigo-700 transition">
                        PUBLIER
                    </button>
                </div>
            )}
         </div>

      </div>
    </div>
  );
}
