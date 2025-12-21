import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { generatePostContent } from "../lib/openai";
import canvasConfetti from "canvas-confetti";
import {
  Wand2, Instagram, Facebook, Linkedin,
  Trash2, Lock, ArrowRight, Sparkles,
  Save, RefreshCw, Upload, LayoutList, Calendar as CalendarIcon, 
  Type, Image as ImageIcon, ChevronLeft, ChevronRight, Palette, Layers, MousePointer2
} from "lucide-react";

// --- CONFIGURATION ---
const PLATFORMS = [
  { id: 'Instagram', icon: <Instagram size={18}/>, color: 'text-pink-600', bg: 'bg-pink-50', border: 'border-pink-200', ratio: 'aspect-square' },
  { id: 'Facebook', icon: <Facebook size={18}/>, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', ratio: 'aspect-video' },
  { id: 'Linkedin', icon: <Linkedin size={18}/>, color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200', ratio: 'aspect-video' },
];

const TONES = ["Professionnel", "Amical", "Drôle", "Urgent", "Luxe"];

const TEMPLATES = [
    { id: 'modern', name: 'Moderne', overlayColor: 'bg-black/40', textPos: 'items-end justify-start', textAlign: 'text-left', font: 'font-sans' },
    { id: 'bold', name: 'Impact', overlayColor: 'bg-indigo-900/60', textPos: 'items-center justify-center', textAlign: 'text-center', font: 'font-black uppercase tracking-widest' },
    { id: 'elegant', name: 'Élégant', overlayColor: 'bg-stone-900/30', textPos: 'items-center justify-center', textAlign: 'text-center', font: 'font-serif italic' },
    { id: 'minimal', name: 'Minimal', overlayColor: 'bg-gradient-to-t from-black/80 to-transparent', textPos: 'items-end justify-start', textAlign: 'text-left', font: 'font-mono text-xs' },
];

export default function Marketing({ posts, currentPost, setCurrentPost, profile, onUpdate }) {
  // États de l'interface
  const [activeTab, setActiveTab] = useState("generator"); 
  const [historyView, setHistoryView] = useState("list");
  
  // États du contenu
  const [prompt, setPrompt] = useState("");
  const [activeNetwork, setActiveNetwork] = useState("Instagram");
  const [style, setStyle] = useState("Amical");
  const [isLoading, setIsLoading] = useState(false);
  const [imageSource, setImageSource] = useState("AI");
  
  // États de l'Éditeur Visuel (Le "Canva" interne)
  const [visualConfig, setVisualConfig] = useState({
      title: "",
      subtitle: "",
      template: "modern",
      showLogo: true,
      customImage: null
  });

  // --- LOGIQUE METIER ---

  const handleGenerate = async () => {
    if (!prompt) return alert("Décrivez votre post d'abord !");
    setIsLoading(true);
    
    try {
      const aiResult = await generatePostContent(prompt, profile); // Appel simplifié vers notre garde-fou
      
      if (aiResult) {
        // Image par défaut (IA ou Placeholder)
        let finalImg = visualConfig.customImage;
        if (imageSource === "AI") {
           const ratioParams = activeNetwork === 'Instagram' ? 'width=1080&height=1080' : 'width=1200&height=630';
           finalImg = `https://image.pollinations.ai/prompt/${encodeURIComponent(aiResult.image_keyword)}?${ratioParams}&nologo=true`;
        }

        const newPost = {
            id: Date.now(), // ID Temp
            business_id: profile?.id,
            title: aiResult.title,
            content: aiResult.content,
            image_url: finalImg,
            networks: [activeNetwork],
            created_at: new Date().toISOString(),
            status: 'draft',
            image_overlay: { ...visualConfig, title: aiResult.title } // On pré-remplit le titre visuel
        };
        
        setCurrentPost(newPost);
        // On met à jour l'éditeur visuel avec les données générées
        setVisualConfig(prev => ({ 
            ...prev, 
            customImage: finalImg, 
            title: "NOUVEAUTÉ", // Titre accrocheur par défaut
            subtitle: profile?.name || ""
        }));
        
        setActiveTab("editor"); // On envoie l'utilisateur directement vers l'éditeur pour peaufiner
      }
    } catch (e) {
      console.error(e);
      alert("Erreur IA");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!currentPost || !profile?.id) return;
    try {
        const { id, ...postData } = currentPost;
        
        // On nettoie l'objet avant envoi BDD
        const payload = {
            business_id: profile.id,
            title: postData.title,
            content: postData.content,
            image_url: visualConfig.customImage || postData.image_url,
            networks: postData.networks,
            status: 'draft',
            image_overlay: visualConfig // On sauvegarde la config visuelle
        };

        // Si le post a un ID numérique (créé localement), c'est un INSERT, sinon UPDATE
        let error;
        if (typeof currentPost.id === 'number') {
             const { data, error: err } = await supabase.from("posts").insert([payload]).select();
             error = err;
             if(data && onUpdate) onUpdate(data[0]);
        } else {
             const { error: err } = await supabase.from("posts").update(payload).eq('id', currentPost.id);
             error = err;
        }

        if (error) throw error;
        
        canvasConfetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        alert("✅ Post sauvegardé !");
        // Recharger la liste si nécessaire (via props ou reload)
    } catch (err) { alert("Erreur sauvegarde : " + err.message); }
  };

  const handleDelete = async () => {
      if(!currentPost?.id || typeof currentPost.id === 'number') {
          setCurrentPost(null); 
          return;
      }
      if(!window.confirm("Supprimer définitivement ce post ?")) return;
      
      const { error } = await supabase.from("posts").delete().eq("id", currentPost.id);
      if(!error) {
          alert("Post supprimé.");
          setCurrentPost(null);
          window.location.reload(); // Simple refresh pour mettre à jour la liste
      }
  };

  const loadPostFromHistory = (post) => {
      setCurrentPost(post);
      // Charger la config visuelle du post
      if (post.image_overlay) {
          setVisualConfig(post.image_overlay);
      } else {
          // Fallback pour vieux posts
          setVisualConfig({
              title: "", subtitle: "", template: "modern", showLogo: true, customImage: post.image_url
          });
      }
      setActiveTab("editor"); // Aller direct à l'édition
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
        setVisualConfig(prev => ({ ...prev, customImage: data.publicUrl }));
        setImageSource("UPLOAD");
    } catch (err) { alert("Erreur upload"); } finally { setIsLoading(false); }
  };

  // --- RENDERERS ---

  const renderPhonePreview = () => {
      const currentTemplate = TEMPLATES.find(t => t.id === visualConfig.template) || TEMPLATES[0];
      const ratio = PLATFORMS.find(p => p.id === activeNetwork)?.ratio || 'aspect-square';

      return (
        <div className="bg-slate-800 rounded-[3rem] p-3 h-full flex flex-col relative shadow-2xl ring-4 ring-slate-900 border-[6px] border-slate-700">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-7 bg-slate-900 rounded-b-2xl z-20"></div>
            <div className="h-6 flex justify-between px-6 text-white/50 text-[10px] font-bold z-10 items-center"><span>9:41</span><span>5G</span></div>
            
            <div className="flex-1 bg-white rounded-[2.2rem] overflow-hidden relative flex flex-col">
                <div className="flex-1 overflow-y-auto no-scrollbar pb-20">
                    {/* Header App */}
                    <div className="px-4 py-3 flex items-center gap-3 sticky top-0 bg-white/95 backdrop-blur z-10 border-b border-slate-50">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 to-purple-600 p-[2px] shrink-0">
                            {profile?.logo_url ? <img src={profile.logo_url} className="w-full h-full rounded-full object-cover border-2 border-white"/> : <div className="w-full h-full bg-slate-200 rounded-full"/>}
                        </div>
                        <div className="flex-1 leading-tight">
                            <div className="text-xs font-bold text-slate-900">{profile?.name || "Mon Entreprise"}</div>
                            <div className="text-[10px] text-slate-500">Sponsorisé • {activeNetwork}</div>
                        </div>
                    </div>

                    {/* VISUEL GÉNÉRÉ (LE COEUR DU SYSTÈME) */}
                    <div className={`w-full relative ${ratio} overflow-hidden group`}>
                        <img src={visualConfig.customImage || currentPost?.image_url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Visuel"/>
                        
                        {/* THE SMART OVERLAY */}
                        <div className={`absolute inset-0 ${currentTemplate.overlayColor} flex flex-col p-6 ${currentTemplate.textPos} transition-all duration-300`}>
                            <div className={`${currentTemplate.textAlign} w-full`}>
                                {visualConfig.showLogo && profile?.logo_url && (
                                    <img src={profile.logo_url} className="w-12 h-12 object-contain mb-4 inline-block drop-shadow-lg"/>
                                )}
                                {visualConfig.title && (
                                    <h2 className={`text-white text-2xl drop-shadow-md mb-2 leading-tight ${currentTemplate.font}`}>{visualConfig.title}</h2>
                                )}
                                {visualConfig.subtitle && (
                                    <p className="text-white/90 text-xs font-medium tracking-wide backdrop-blur-sm bg-black/10 inline-block px-2 py-1 rounded">{visualConfig.subtitle}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Actions & Texte */}
                    <div className="p-4 space-y-3">
                        <div className="flex gap-4 text-slate-800"><span className="text-xl">♥</span><span className="text-xl">💬</span><span className="text-xl">✈️</span></div>
                        <div className="text-sm font-bold">1,243 J'aime</div>
                        {currentPost?.content ? (
                            <div className="text-xs text-slate-800 leading-relaxed whitespace-pre-wrap">
                                <span className="font-bold mr-2">{profile?.name}</span>
                                {currentPost.content}
                            </div>
                        ) : <div className="h-4 w-3/4 bg-slate-100 rounded animate-pulse"/>}
                    </div>
                </div>

                {/* Barre d'action flottante */}
                <div className="absolute bottom-0 left-0 w-full p-4 bg-white/90 backdrop-blur border-t border-slate-50 z-30 flex gap-2">
                    <button onClick={handleDelete} className="p-3 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100 transition"><Trash2 size={18}/></button>
                    <button onClick={handleSave} className="flex-1 py-3 bg-slate-900 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-indigo-600 transition shadow-lg">
                        <Save size={16}/> SAUVEGARDER
                    </button>
                </div>
            </div>
        </div>
      );
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-120px)] pb-4 animate-in fade-in duration-500">
      
      {/* 🟢 COLONNE GAUCHE : OUTILS */}
      <div className="flex-1 flex flex-col gap-4 overflow-hidden">
        
        {/* Navigation Onglets */}
        <div className="bg-white p-2 rounded-2xl border border-slate-100 shadow-sm flex gap-1 shrink-0">
            {[
                {id: 'generator', icon: <Sparkles size={16}/>, label: '1. Idée & IA'},
                {id: 'editor', icon: <Palette size={16}/>, label: '2. Design'},
                {id: 'history', icon: <LayoutList size={16}/>, label: 'Historique'}
            ].map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex-1 py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition ${activeTab === tab.id ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}>
                    {tab.icon} {tab.label}
                </button>
            ))}
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-4">
            
            {/* 1. GÉNÉRATEUR IA */}
            {activeTab === 'generator' && (
                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-6">
                    <div className="space-y-4">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-wider block">Sujet du post</label>
                        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                            {SUGGESTIONS.map(s => <button key={s} onClick={() => setPrompt(s)} className="px-3 py-2 bg-indigo-50 text-indigo-700 rounded-lg text-[10px] font-bold border border-indigo-100 whitespace-nowrap">{s}</button>)}
                        </div>
                        <textarea value={prompt} onChange={e => setPrompt(e.target.value)} className="w-full h-32 p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm outline-none focus:border-indigo-500 transition" placeholder="Quoi de neuf aujourd'hui ?"/>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-black text-slate-400 uppercase tracking-wider block mb-2">Réseau</label>
                            <div className="flex gap-2">
                                {PLATFORMS.map(p => (
                                    <button key={p.id} onClick={() => setActiveNetwork(p.id)} className={`p-2 rounded-xl border-2 transition ${activeNetwork === p.id ? `${p.border} ${p.bg}` : 'border-transparent bg-slate-50'}`}>{p.icon}</button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-black text-slate-400 uppercase tracking-wider block mb-2">Ton</label>
                            <select value={style} onChange={e => setStyle(e.target.value)} className="w-full p-2 bg-slate-50 rounded-xl text-xs font-bold border-2 border-slate-100 outline-none">
                                {TONES.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                    </div>

                    <button onClick={handleGenerate} disabled={isLoading} className="w-full py-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-2xl font-black shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all flex items-center justify-center gap-2">
                        {isLoading ? <RefreshCw className="animate-spin"/> : <Wand2/>} Générer le concept
                    </button>
                </div>
            )}

            {/* 2. ÉDITEUR VISUEL (SMART LAYERS) */}
            {activeTab === 'editor' && (
                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-6">
                    {/* Choix Image */}
                    <div className="flex items-center justify-between bg-slate-50 p-2 rounded-xl border border-slate-100">
                        <span className="text-xs font-bold text-slate-500 ml-2">Image de fond</span>
                        <div className="flex gap-2">
                            <button onClick={() => setImageSource("AI")} className={`px-3 py-1.5 rounded-lg text-[10px] font-bold ${imageSource === 'AI' ? 'bg-white shadow text-indigo-600' : 'text-slate-400'}`}>IA</button>
                            <button onClick={() => document.getElementById('u-input').click()} className={`px-3 py-1.5 rounded-lg text-[10px] font-bold ${imageSource === 'UPLOAD' ? 'bg-white shadow text-indigo-600' : 'text-slate-400'}`}>Import</button>
                            <input id="u-input" type="file" className="hidden" accept="image/*" onChange={handleFileUpload}/>
                        </div>
                    </div>

                    {/* Templates */}
                    <div>
                        <label className="text-xs font-black text-slate-400 uppercase tracking-wider block mb-3">Style Graphique</label>
                        <div className="grid grid-cols-2 gap-3">
                            {TEMPLATES.map(t => (
                                <button key={t.id} onClick={() => setVisualConfig({...visualConfig, template: t.id})} className={`p-3 rounded-xl border-2 text-left transition ${visualConfig.template === t.id ? 'border-indigo-600 bg-indigo-50' : 'border-slate-100 hover:border-slate-200'}`}>
                                    <div className="font-bold text-xs text-slate-900">{t.name}</div>
                                    <div className="h-1 w-8 bg-current mt-1 rounded-full opacity-20"/>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Textes Overlay */}
                    <div className="space-y-3">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-wider block">Textes sur image</label>
                        <input value={visualConfig.title} onChange={e => setVisualConfig({...visualConfig, title: e.target.value})} placeholder="Titre principal (ex: PROMO)" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-indigo-500"/>
                        <input value={visualConfig.subtitle} onChange={e => setVisualConfig({...visualConfig, subtitle: e.target.value})} placeholder="Sous-titre (ex: -20% ce soir)" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-indigo-500"/>
                    </div>

                    {/* Logo Toggle */}
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-600">Afficher mon logo</span>
                        <button onClick={() => setVisualConfig({...visualConfig, showLogo: !visualConfig.showLogo})} className={`w-10 h-6 rounded-full p-1 transition ${visualConfig.showLogo ? 'bg-indigo-600' : 'bg-slate-200'}`}>
                            <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${visualConfig.showLogo ? 'translate-x-4' : ''}`}/>
                        </button>
                    </div>

                    {/* Édition Texte du Post */}
                    <div className="pt-4 border-t border-slate-100">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-wider block mb-2">Légende du post</label>
                        <textarea value={currentPost?.content || ""} onChange={e => setCurrentPost({...currentPost, content: e.target.value})} className="w-full h-32 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs leading-relaxed outline-none focus:border-indigo-500 resize-none"/>
                    </div>
                </div>
            )}

            {/* 3. HISTORIQUE */}
            {activeTab === 'history' && (
                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="font-bold text-slate-900">Bibliothèque</h3>
                        <div className="flex bg-slate-100 rounded-lg p-1">
                            <button onClick={() => setHistoryView('list')} className={`p-1.5 rounded ${historyView === 'list' ? 'bg-white shadow' : 'text-slate-400'}`}><LayoutList size={14}/></button>
                            <button onClick={() => setHistoryView('calendar')} className={`p-1.5 rounded ${historyView === 'calendar' ? 'bg-white shadow' : 'text-slate-400'}`}><CalendarIcon size={14}/></button>
                        </div>
                    </div>

                    {historyView === 'calendar' ? renderCalendar() : (
                        <div className="space-y-2">
                            {posts.length === 0 ? <p className="text-center text-slate-400 text-xs py-8">Vide.</p> : 
                             posts.map(post => (
                                <div key={post.id} onClick={() => loadPostFromHistory(post)} className="flex gap-3 p-2 rounded-xl hover:bg-indigo-50 border border-transparent hover:border-indigo-100 transition items-center cursor-pointer group">
                                    <img src={post.image_url} className="w-12 h-12 rounded-lg object-cover bg-slate-200"/>
                                    <div className="flex-1 overflow-hidden">
                                        <div className="font-bold text-sm truncate text-slate-900">{post.title || "Brouillon"}</div>
                                        <div className="text-[10px] text-slate-500 flex gap-2">
                                            <span>{new Date(post.created_at).toLocaleDateString()}</span>
                                            <span className={`px-1.5 rounded text-[9px] uppercase ${post.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>{post.status === 'published' ? 'Publié' : 'Brouillon'}</span>
                                        </div>
                                    </div>
                                    <ChevronRight size={16} className="text-slate-300 group-hover:text-indigo-600"/>
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
          {currentPost ? renderPhonePreview() : (
              <div className="bg-slate-100 rounded-[3rem] p-8 h-full flex flex-col items-center justify-center text-center border-4 border-slate-200 border-dashed">
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm mb-4"><Wand2 size={32} className="text-slate-300"/></div>
                  <h3 className="font-bold text-slate-500 mb-2">Commencez ici</h3>
                  <p className="text-xs text-slate-400 max-w-[200px]">Utilisez le générateur ou sélectionnez un post dans l'historique.</p>
              </div>
          )}
      </div>

    </div>
  );
}
