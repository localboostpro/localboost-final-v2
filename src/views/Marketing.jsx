import React, { useState } from "react";
import { supabase } from "../lib/supabase";
import { generatePostContent } from "../lib/openai";
import canvasConfetti from "canvas-confetti";
import {
  Wand2, Instagram, Facebook, Linkedin,
  Trash2, Lock, ArrowRight, Sparkles,
  Save, RefreshCw, Upload, LayoutList, Calendar as CalendarIcon, 
  Type, Move, Palette, X, Image as ImageIcon, ChevronLeft, ChevronRight
} from "lucide-react";

// Configuration Visuelle des Plateformes
const PLATFORMS = [
  { id: 'Instagram', icon: <Instagram size={18}/>, color: 'text-pink-600', bg: 'bg-pink-50', border: 'border-pink-200', ratio: 'aspect-square' },
  { id: 'Facebook', icon: <Facebook size={18}/>, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', ratio: 'aspect-video' },
  { id: 'Linkedin', icon: <Linkedin size={18}/>, color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200', ratio: 'aspect-video' },
];

const TONES = ["Professionnel", "Amical", "Drôle", "Urgent", "Luxe"];

const SUGGESTIONS = [
  "🎉 Promo Flash -20%", "🚀 Nouveau Produit", "📅 Événement Spécial", "👋 Coulisses / Équipe"
];

export default function Marketing({ posts, currentPost, setCurrentPost, profile, onUpdate }) {
  // États Principaux
  const [activeTab, setActiveTab] = useState("generator"); // 'generator', 'history', 'editor'
  const [historyView, setHistoryView] = useState("list"); // 'list' ou 'calendar'
  
  // États Générateur
  const [prompt, setPrompt] = useState("");
  const [activeNetwork, setActiveNetwork] = useState("Instagram");
  const [style, setStyle] = useState("Amical");
  const [isLoading, setIsLoading] = useState(false);
  const [imageSource, setImageSource] = useState("AI");
  const [generatedImage, setGeneratedImage] = useState("https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80");

  // États Éditeur Image (Style Canva Simple)
  const [imageOverlay, setImageOverlay] = useState({
      text: "",
      color: "#FFFFFF",
      bg: "rgba(0,0,0,0.5)",
      position: "center", // center, top, bottom
      fontSize: "normal" // small, normal, large
  });

  // --- PROTECTION BASIC ---
  if (profile?.subscription_tier === 'basic') {
    return (
      <div className="h-[calc(100vh-100px)] flex flex-col items-center justify-center text-center p-8 bg-slate-900 rounded-[2rem] text-white shadow-xl relative overflow-hidden animate-in fade-in duration-700">
         <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-600/20 to-purple-600/20 z-0"></div>
         <div className="relative z-10 max-w-lg mx-auto">
            <div className="bg-white/10 w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-8 backdrop-blur-md border border-white/10 shadow-2xl">
                <Lock size={48} className="text-indigo-400"/>
            </div>
            <h2 className="text-3xl font-black mb-4">Studio Créatif IA</h2>
            <p className="text-slate-300 mb-8">Débloquez la puissance de l'IA, le calendrier et l'éditeur d'images.</p>
            <button onClick={() => alert("Passez Premium via votre Profil !")} className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-3 mx-auto transition-all shadow-lg">
                Débloquer l'accès <ArrowRight size={20}/>
            </button>
         </div>
      </div>
    );
  }

  // --- LOGIQUE GÉNÉRALE ---

  const getCurrentRatio = () => {
      const platform = PLATFORMS.find(p => p.id === activeNetwork);
      return platform ? platform.ratio : 'aspect-square';
  };

  // --- LOGIQUE CALENDRIER ---
  const renderCalendar = () => {
      const date = new Date();
      const year = date.getFullYear();
      const month = date.getMonth();
      
      const firstDay = new Date(year, month, 1).getDay(); // Jour de la semaine du 1er (0=Dimanche)
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      
      // Ajustement pour commencer Lundi (Lundi=1 ... Dimanche=7)
      const startOffset = firstDay === 0 ? 6 : firstDay - 1; 
      
      const days = [];
      for (let i = 0; i < startOffset; i++) days.push(null); // Cases vides
      for (let i = 1; i <= daysInMonth; i++) days.push(i);

      return (
          <div className="space-y-4">
              <div className="flex justify-between items-center px-2">
                  <h3 className="font-bold text-slate-900 capitalize">{date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</h3>
                  <div className="flex gap-1">
                      <button className="p-1 hover:bg-slate-100 rounded"><ChevronLeft size={16}/></button>
                      <button className="p-1 hover:bg-slate-100 rounded"><ChevronRight size={16}/></button>
                  </div>
              </div>
              <div className="grid grid-cols-7 gap-2 text-center mb-2">
                  {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map(d => <div key={d} className="text-[10px] font-bold text-slate-400">{d}</div>)}
              </div>
              <div className="grid grid-cols-7 gap-2">
                  {days.map((day, idx) => {
                      if (!day) return <div key={idx}></div>;
                      
                      // Trouver les posts de ce jour
                      const dayPosts = posts.filter(p => {
                          const d = new Date(p.created_at);
                          return d.getDate() === day && d.getMonth() === month && d.getFullYear() === year;
                      });

                      return (
                          <div key={idx} className={`aspect-square rounded-xl border flex flex-col items-center justify-start pt-1 relative hover:border-indigo-300 transition cursor-pointer ${dayPosts.length > 0 ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-slate-100'}`}>
                              <span className={`text-[10px] font-bold ${dayPosts.length > 0 ? 'text-indigo-600' : 'text-slate-400'}`}>{day}</span>
                              <div className="flex gap-0.5 mt-1 flex-wrap justify-center px-1">
                                  {dayPosts.map(p => (
                                      <div key={p.id} onClick={() => setCurrentPost(p)} className="w-1.5 h-1.5 rounded-full bg-indigo-500" title={p.title}></div>
                                  ))}
                              </div>
                          </div>
                      );
                  })}
              </div>
          </div>
      );
  };

  // --- ACTIONS ---

  const handleGenerate = async () => {
    if (!prompt) return alert("Décrivez votre post d'abord !");
    setIsLoading(true);
    
    try {
      const fullPrompt = `
        Tu es un expert en marketing digital. Rédige un post pour le réseau social : ${activeNetwork}.
        Ton du message : ${style}.
        Sujet principal : ${prompt}.
        Ville de l'entreprise : ${profile?.city || "Inconnue"}.
        IMPORTANT :
        1. Utilise des emojis pertinents.
        2. Inclus obligatoirement une liste de 5 à 10 hashtags pertinents à la fin.
      `;
      
      const aiResult = await generatePostContent(fullPrompt, profile);
      
      if (aiResult) {
        let finalImg = generatedImage;
        if (imageSource === "AI") {
           const ratioParams = activeNetwork === 'Instagram' ? 'width=1080&height=1080' : 'width=1200&height=630';
           finalImg = `https://image.pollinations.ai/prompt/${encodeURIComponent(aiResult.image_keyword || prompt)}?${ratioParams}&nologo=true`;
        }

        const newPost = {
            id: Date.now(),
            business_id: profile?.id,
            title: aiResult.title || "Nouveau brouillon",
            content: aiResult.content,
            image_url: finalImg,
            networks: [activeNetwork],
            created_at: new Date().toISOString(),
            status: 'draft',
            image_overlay: imageOverlay // On sauvegarde aussi la config de l'image
        };
        
        setCurrentPost(newPost);
        setGeneratedImage(finalImg);
      }
    } catch (e) {
      console.error(e);
      alert("Erreur génération IA.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!currentPost || !profile?.id) return;
    try {
        const { id, status, ...postData } = currentPost;
        postData.business_id = profile.id;
        // On sauvegarde l'overlay dans le contenu si besoin, ou dans une colonne JSON dédiée (ici simplifié)
        
        const { data, error } = await supabase.from("posts").insert([postData]).select();
        if (error) throw error;
        
        if (onUpdate) onUpdate(data[0]);
        canvasConfetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        alert("✅ Post enregistré ! Retrouvez-le dans l'historique.");
    } catch (err) { alert("Erreur sauvegarde : " + err.message); }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsLoading(true);
    try {
        const fileName = `${profile.id}/${Date.now()}_${file.name}`;
        const { error } = await supabase.storage.from("user_uploads").upload(fileName, file);
        if (error) throw error;
        const { data } = supabase.storage.from("user_uploads").getPublicUrl(fileName);
        setGeneratedImage(data.publicUrl);
        setImageSource("UPLOAD");
        if(currentPost) setCurrentPost({...currentPost, image_url: data.publicUrl});
    } catch (err) { alert("Erreur upload"); } finally { setIsLoading(false); }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-120px)] pb-4 animate-in fade-in duration-500">
      
      {/* 🟢 COLONNE GAUCHE : PARAMÈTRES & OUTILS */}
      <div className="flex-1 flex flex-col gap-4 overflow-hidden">
        
        {/* Header & Onglets */}
        <div className="bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm shrink-0">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-black text-slate-900 flex items-center gap-2"><Wand2 className="text-indigo-600"/> Studio Créatif</h2>
                {activeTab === 'generator' && <button onClick={() => setPrompt("")} className="text-[10px] font-bold text-rose-500 hover:underline flex items-center gap-1"><Trash2 size={10}/> Effacer</button>}
            </div>
            
            <div className="flex p-1 bg-slate-100 rounded-xl">
                <button onClick={() => setActiveTab('generator')} className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition ${activeTab === 'generator' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}>
                    <Sparkles size={14}/> IA
                </button>
                <button onClick={() => setActiveTab('editor')} className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition ${activeTab === 'editor' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}>
                    <ImageIcon size={14}/> Visuel
                </button>
                <button onClick={() => setActiveTab('history')} className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition ${activeTab === 'history' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}>
                    <CalendarIcon size={14}/> Historique
                </button>
            </div>
        </div>

        {/* Contenu Scrollable */}
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
            
            {/* --- ONGLET GÉNÉRATEUR --- */}
            {activeTab === 'generator' && (
                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-6">
                    <div>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 block">1. Destination</label>
                        <div className="grid grid-cols-3 gap-3">
                            {PLATFORMS.map((plat) => (
                                <button key={plat.id} onClick={() => setActiveNetwork(plat.id)} className={`flex flex-col items-center justify-center gap-2 py-3 rounded-2xl border-2 transition-all duration-200 ${activeNetwork === plat.id ? `${plat.bg} ${plat.border} ${plat.color} ring-2 ring-offset-2 ring-indigo-100` : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'}`}>
                                    {plat.icon}
                                    <span className="text-xs font-bold">{plat.id}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 block">2. Ton</label>
                        <div className="flex flex-wrap gap-2">
                            {TONES.map((t) => (
                                <button key={t} onClick={() => setStyle(t)} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${style === t ? 'bg-slate-900 text-white border-slate-900 shadow-md transform scale-105' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}>{t}</button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">3. Sujet</label>
                        <div className="flex gap-2 overflow-x-auto pb-2 mb-2 no-scrollbar">
                            {SUGGESTIONS.map(sug => (
                                <button key={sug} onClick={() => setPrompt(sug)} className="whitespace-nowrap px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-bold border border-indigo-100 hover:bg-indigo-100 transition">{sug}</button>
                            ))}
                        </div>
                        <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Ex: Promotion sur les burgers..." className="w-full h-28 p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500 transition resize-none"/>
                    </div>

                    <button onClick={handleGenerate} disabled={isLoading} className="w-full py-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-2xl font-black text-lg shadow-xl shadow-indigo-200 hover:shadow-indigo-300 transition-all flex items-center justify-center gap-3">
                        {isLoading ? <RefreshCw size={24} className="animate-spin"/> : <Wand2 size={24}/>}
                        {isLoading ? "Rédaction..." : "Générer le Post"}
                    </button>
                </div>
            )}

            {/* --- ONGLET ÉDITEUR D'IMAGE (STYLE CANVA SIMPLE) --- */}
            {activeTab === 'editor' && (
                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-6">
                    <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 mb-4">
                        <h4 className="font-bold text-indigo-900 text-sm flex items-center gap-2"><ImageIcon size={16}/> Éditeur Visuel</h4>
                        <p className="text-xs text-indigo-700 mt-1">Personnalisez l'image générée.</p>
                    </div>

                    {/* Choix Image */}
                    <div className="flex gap-2 mb-4">
                        <button onClick={() => setImageSource("AI")} className={`flex-1 py-2 text-xs font-bold rounded-lg border ${imageSource === 'AI' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-500'}`}>IA</button>
                        <button onClick={() => document.getElementById('upload-input').click()} className={`flex-1 py-2 text-xs font-bold rounded-lg border ${imageSource === 'UPLOAD' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-500'}`}>Import</button>
                        <input id="upload-input" type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                    </div>

                    {/* Texte Overlay */}
                    <div>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Texte sur l'image</label>
                        <input value={imageOverlay.text} onChange={(e) => setImageOverlay({...imageOverlay, text: e.target.value})} placeholder="Ex: -50% CE SOIR !" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500"/>
                    </div>

                    {/* Couleur & Position */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Couleur</label>
                            <div className="flex gap-2">
                                {['#FFFFFF', '#000000', '#F59E0B', '#EF4444'].map(c => (
                                    <button key={c} onClick={() => setImageOverlay({...imageOverlay, color: c})} className={`w-8 h-8 rounded-full border-2 ${imageOverlay.color === c ? 'border-slate-400 scale-110' : 'border-transparent'}`} style={{backgroundColor: c}}/>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Position</label>
                            <div className="flex bg-slate-100 rounded-lg p-1">
                                {['top', 'center', 'bottom'].map(pos => (
                                    <button key={pos} onClick={() => setImageOverlay({...imageOverlay, position: pos})} className={`flex-1 py-1 rounded text-[10px] uppercase font-bold ${imageOverlay.position === pos ? 'bg-white shadow text-indigo-600' : 'text-slate-400'}`}>
                                        {pos === 'top' ? 'Haut' : pos === 'center' ? 'Milieu' : 'Bas'}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* --- ONGLET HISTORIQUE & CALENDRIER --- */}
            {activeTab === 'history' && (
                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="font-bold text-slate-900">Vos publications</h3>
                        <div className="flex bg-slate-100 rounded-lg p-1">
                            <button onClick={() => setHistoryView('list')} className={`p-1.5 rounded ${historyView === 'list' ? 'bg-white shadow' : 'text-slate-400'}`}><LayoutList size={14}/></button>
                            <button onClick={() => setHistoryView('calendar')} className={`p-1.5 rounded ${historyView === 'calendar' ? 'bg-white shadow' : 'text-slate-400'}`}><CalendarIcon size={14}/></button>
                        </div>
                    </div>

                    {historyView === 'calendar' ? renderCalendar() : (
                        <div className="space-y-2">
                            {posts.length === 0 ? <p className="text-center text-slate-400 text-xs py-8">Aucun post.</p> : 
                             posts.map(post => (
                                <div key={post.id} onClick={() => setCurrentPost(post)} className="flex gap-3 p-3 rounded-xl hover:bg-slate-50 cursor-pointer border border-transparent hover:border-slate-100 transition items-center">
                                    <img src={post.image_url} className="w-12 h-12 rounded-lg object-cover bg-slate-100"/>
                                    <div className="flex-1 overflow-hidden">
                                        <div className="font-bold text-sm truncate">{post.title || "Sans titre"}</div>
                                        <div className="text-xs text-slate-500 truncate">
                                            {new Date(post.created_at).toLocaleDateString()} • {post.networks?.[0] || 'Réseau'}
                                        </div>
                                    </div>
                                    <ArrowRight size={14} className="text-slate-300"/>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
      </div>

      {/* 🔴 COLONNE DROITE : APERÇU LIVE (IPHONE) */}
      <div className="w-full lg:w-[420px] shrink-0 h-full flex flex-col">
          <div className="bg-slate-800 rounded-[3rem] p-3 h-full flex flex-col relative shadow-2xl ring-4 ring-slate-900 border-[6px] border-slate-700">
              
              {/* Notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-7 bg-slate-900 rounded-b-2xl z-20"></div>
              <div className="h-6 text-white/50 flex justify-between items-center px-6 text-[10px] font-bold relative z-10">
                  <span>9:41</span><span>5G</span>
              </div>

              {/* Écran */}
              <div className="flex-1 bg-white rounded-[2.2rem] overflow-hidden relative flex flex-col">
                  {currentPost ? (
                      <div className="flex-1 overflow-y-auto no-scrollbar pb-16">
                        {/* Header App */}
                        <div className="px-4 py-3 flex items-center gap-3 sticky top-0 bg-white/95 backdrop-blur z-10 border-b border-slate-50">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-yellow-400 to-purple-600 p-[2px] shrink-0">
                                {profile?.logo_url ? <img src={profile.logo_url} className="w-full h-full rounded-full object-cover border-2 border-white"/> : <div className="w-full h-full bg-slate-200 rounded-full"/>}
                            </div>
                            <div className="flex-1 leading-tight">
                                <div className="text-sm font-bold text-slate-900">{profile?.name || "Mon Entreprise"}</div>
                                <div className="text-[10px] text-slate-500">Sponsorisé • {activeNetwork}</div>
                            </div>
                        </div>

                        {/* Image Post avec Overlay (Le fameux éditeur simple) */}
                        <div className={`w-full bg-slate-100 relative ${getCurrentRatio()} transition-all duration-300 overflow-hidden flex items-center justify-center`}>
                            <img src={currentPost.image_url} className="w-full h-full object-cover" alt="Post"/>
                            
                            {/* Overlay Texte (Si activé dans l'éditeur) */}
                            {imageOverlay.text && (
                                <div 
                                    className="absolute w-full text-center p-4"
                                    style={{
                                        color: imageOverlay.color,
                                        backgroundColor: imageOverlay.bg,
                                        bottom: imageOverlay.position === 'bottom' ? 0 : 'auto',
                                        top: imageOverlay.position === 'top' ? 0 : imageOverlay.position === 'center' ? '50%' : 'auto',
                                        transform: imageOverlay.position === 'center' ? 'translateY(-50%)' : 'none'
                                    }}
                                >
                                    <span className="font-black text-xl uppercase tracking-wider drop-shadow-md">{imageOverlay.text}</span>
                                </div>
                            )}
                        </div>

                        {/* Actions & Caption */}
                        <div className="p-4 space-y-3">
                            <div className="flex gap-4 text-slate-800"><span className="text-2xl">♥</span><span className="text-2xl">💬</span><span className="text-2xl">✈️</span></div>
                            <div className="text-sm font-bold">1,243 J'aime</div>
                            <div className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
                                <span className="font-bold mr-2">{profile?.name}</span>
                                {currentPost.content}
                            </div>
                        </div>
                      </div>
                  ) : (
                      <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-slate-50">
                          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm mb-4"><Sparkles size={32} className="text-indigo-400 animate-pulse"/></div>
                          <h3 className="font-bold text-slate-700 mb-2">Prêt à créer ?</h3>
                          <p className="text-xs text-slate-400">Remplissez le formulaire à gauche.</p>
                      </div>
                  )}

                  {/* Bouton Fixe */}
                  {currentPost && (
                      <div className="absolute bottom-0 left-0 w-full p-4 bg-white/80 backdrop-blur border-t border-slate-50 z-20">
                          <button onClick={handleSave} className="w-full py-3.5 bg-slate-900 text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-indigo-600 transition-colors shadow-lg">
                              <Save size={16}/> ENREGISTRER LE BROUILLON
                          </button>
                      </div>
                  )}
              </div>
          </div>
      </div>

    </div>
  );
}
