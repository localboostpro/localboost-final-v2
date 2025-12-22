import React, { useState } from "react";
import { supabase } from "../lib/supabase";
import { generatePostContent } from "../lib/openai";
import canvasConfetti from "canvas-confetti";
import {
  Wand2, Instagram, Facebook, Linkedin, Trash2, Save, RefreshCw, 
  Sparkles, Palette, LayoutList, ChevronRight
} from "lucide-react";

// --- CONFIGURATION ---
const PLATFORMS = [
  { id: 'Instagram', icon: <Instagram size={18}/>, bg: 'bg-pink-50', border: 'border-pink-200' },
  { id: 'Facebook', icon: <Facebook size={18}/>, bg: 'bg-blue-50', border: 'border-blue-200' },
  { id: 'Linkedin', icon: <Linkedin size={18}/>, bg: 'bg-blue-50', border: 'border-blue-200' },
];
const SUGGESTIONS = ["🎉 Promo Flash", "🚀 Nouveau Produit", "📅 Événement", "👋 Équipe"];
const TEMPLATES = [
    { id: 'modern', name: 'Moderne', overlayColor: 'bg-black/40', textPos: 'items-end justify-start', font: 'font-sans' },
    { id: 'bold', name: 'Impact', overlayColor: 'bg-indigo-900/60', textPos: 'items-center justify-center', font: 'font-black uppercase' },
];

export default function Marketing({ posts, profile, onUpdate, onUpsert, onDelete }) {
  
  // ✅ ÉTAT LOCAL RÉINTÉGRÉ (Corrige l'erreur de crash)
  const [currentPost, setCurrentPost] = useState(null);

  const [activeTab, setActiveTab] = useState("generator");
  const [prompt, setPrompt] = useState("");
  const [activeNetwork, setActiveNetwork] = useState("Instagram");
  const [isLoading, setIsLoading] = useState(false);
  const [visualConfig, setVisualConfig] = useState({ title: "", subtitle: "", template: "modern", showLogo: true, customImage: null });

  // --- ACTIONS ---
  const handleGenerate = async () => {
    if (!prompt) return alert("Décrivez votre post !");
    setIsLoading(true);
    try {
      console.log("🟢 Lancement génération...");
      const res = await generatePostContent(prompt, profile);
      console.log("🟢 Résultat reçu:", res);

      // Sécurisation de l'image URL
      const safeKeyword = encodeURIComponent(res.image_keyword || "business");
      const ratio = activeNetwork === 'Instagram' ? '1080' : '1200';
      const img = `https://image.pollinations.ai/prompt/${safeKeyword}?width=${ratio}&height=${ratio}&nologo=true`;
      
      // Sécurisation du Titre (SANS COUPE)
      const safeTitle = String(res.title || "Nouveau post");

      const newPost = {
          id: Date.now(),
          business_id: profile?.id,
          title: safeTitle,
          content: res.content,
          image_url: img,
          networks: [activeNetwork],
          created_at: new Date().toISOString(),
          image_overlay: { ...visualConfig, title: safeTitle }
      };
      
      setCurrentPost(newPost);
      
      setVisualConfig(prev => ({ 
          ...prev, 
          customImage: img, 
          title: safeTitle, // Titre complet affiché
          subtitle: profile?.name || "" 
      }));
      
      setActiveTab("editor");
    } catch (e) { 
        console.error("❌ ERREUR DANS MARKETING:", e);
        alert("Erreur IA: " + e.message); 
    } finally { 
        setIsLoading(false); 
    }
  };

  const handleSave = async () => {
    if (!currentPost) return;
    try {
        const payload = {
            business_id: profile.id,
            title: currentPost.title,
            content: currentPost.content,
            image_url: visualConfig.customImage || currentPost.image_url,
            networks: currentPost.networks || [activeNetwork],
            status: 'draft',
            image_overlay: visualConfig
        };

        if (typeof currentPost.id === 'number') {
             const { data, error } = await supabase.from("posts").insert([payload]).select();
             if (error) throw error;
             if (onUpsert) onUpsert(data[0]);
        } else {
             const { error } = await supabase.from("posts").update(payload).eq('id', currentPost.id);
             if (error) throw error;
             if (onUpdate) onUpdate({...payload, id: currentPost.id});
        }
        canvasConfetti();
        alert("Sauvegardé !");
    } catch (e) { alert("Erreur sauvegarde: " + e.message); }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
        const fileName = `${profile.id}/${Date.now()}_${file.name}`;
        const { error } = await supabase.storage.from("user_uploads").upload(fileName, file);
        if (error) throw error;
        const { data } = supabase.storage.from("user_uploads").getPublicUrl(fileName);
        setVisualConfig(prev => ({ ...prev, customImage: data.publicUrl }));
    } catch (e) { alert("Erreur upload"); }
  };

  // --- RENDER ---
  return (
    <div className="flex flex-col lg:flex-row gap-6 h-auto lg:h-[calc(100vh-120px)] pb-20 lg:pb-4 animate-in fade-in">
      
      {/* ZONE GAUCHE (Outils) */}
      <div className="flex-1 flex flex-col gap-4">
        
        {/* Navigation */}
        <div className="bg-white p-2 rounded-2xl border border-slate-100 flex gap-1 overflow-x-auto no-scrollbar shrink-0">
            {[
                {id: 'generator', icon: <Sparkles size={16}/>, label: 'Idée & IA'},
                {id: 'editor', icon: <Palette size={16}/>, label: 'Design'},
                {id: 'history', icon: <LayoutList size={16}/>, label: 'Historique'}
            ].map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex-1 min-w-[100px] py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition ${activeTab === tab.id ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-50'}`}>
                    {tab.icon} {tab.label}
                </button>
            ))}
        </div>

        <div className="flex-1 overflow-y-visible lg:overflow-y-auto space-y-4">
            
            {/* 1. IA */}
            {activeTab === 'generator' && (
                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-6">
                    <div className="space-y-4">
                        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                            {SUGGESTIONS.map(s => <button key={s} onClick={() => setPrompt(s)} className="px-3 py-2 bg-indigo-50 text-indigo-700 rounded-lg text-[10px] font-bold border border-indigo-100 whitespace-nowrap">{s}</button>)}
                        </div>
                        <textarea value={prompt} onChange={e => setPrompt(e.target.value)} className="w-full h-32 p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm outline-none focus:border-indigo-500" placeholder="Sujet du post..."/>
                    </div>
                    <div className="flex gap-2">
                        {PLATFORMS.map(p => (
                            <button key={p.id} onClick={() => setActiveNetwork(p.id)} className={`p-2 rounded-xl border-2 transition ${activeNetwork === p.id ? `${p.border} ${p.bg}` : 'border-transparent bg-slate-50'}`}>{p.icon}</button>
                        ))}
                    </div>
                    <button onClick={handleGenerate} disabled={isLoading} className="w-full py-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-2xl font-black shadow-xl flex items-center justify-center gap-2">
                        {isLoading ? <RefreshCw className="animate-spin"/> : <Wand2/>} Générer
                    </button>
                </div>
            )}

            {/* 2. DESIGN */}
            {activeTab === 'editor' && (
                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-6">
                    <div className="flex justify-between bg-slate-50 p-2 rounded-xl">
                        <span className="text-xs font-bold text-slate-500 p-2">Image</span>
                        <div className="flex gap-2">
                             <button onClick={() => document.getElementById('file-up').click()} className="px-3 py-1 bg-white shadow rounded-lg text-[10px] font-bold">Import</button>
                             <input id="file-up" type="file" hidden onChange={handleFileUpload}/>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        {TEMPLATES.map(t => (
                            <button key={t.id} onClick={() => setVisualConfig({...visualConfig, template: t.id})} className={`p-3 rounded-xl border-2 text-left text-xs font-bold ${visualConfig.template === t.id ? 'border-indigo-600 bg-indigo-50' : 'border-slate-100'}`}>
                                {t.name}
                            </button>
                        ))}
                    </div>
                    <input value={visualConfig.title} onChange={e => setVisualConfig({...visualConfig, title: e.target.value})} placeholder="Titre sur image" className="w-full p-3 bg-slate-50 border rounded-xl text-sm font-bold"/>
                    <textarea value={currentPost?.content || ""} onChange={e => setCurrentPost({...currentPost, content: e.target.value})} className="w-full h-32 p-3 bg-slate-50 border rounded-xl text-xs"/>
                </div>
            )}

            {/* 3. HISTORIQUE */}
            {activeTab === 'history' && (
                <div className="bg-white p-4 rounded-[2rem] border border-slate-100 space-y-2">
                    {posts.map(post => (
                        <div key={post.id} onClick={() => { setCurrentPost(post); setVisualConfig(post.image_overlay || {}); setActiveTab('editor'); }} className="flex gap-3 p-2 rounded-xl hover:bg-indigo-50 cursor-pointer items-center border border-transparent hover:border-indigo-100">
                            <img src={post.image_url} className="w-10 h-10 rounded-lg object-cover bg-slate-200"/>
                            <div className="truncate text-xs font-bold text-slate-700 flex-1">{post.title || "Sans titre"}</div>
                            <ChevronRight size={14} className="text-slate-300"/>
                        </div>
                    ))}
                </div>
            )}
        </div>
      </div>

      {/* ZONE DROITE (Prévisualisation) */}
      <div className="w-full lg:w-[320px] shrink-0 flex flex-col gap-4">
          <div className="bg-slate-800 rounded-[2.5rem] p-3 border-[6px] border-slate-700 shadow-2xl relative">
             <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-5 bg-slate-700 rounded-b-xl z-20"/>
             <div className="bg-white rounded-[2rem] overflow-hidden h-[550px] flex flex-col relative">
                <div className="flex-1 overflow-y-auto no-scrollbar pb-14">
                    {/* Image & Overlay */}
                    <div className="relative aspect-square bg-slate-200">
                        {visualConfig.customImage ? (
                            <img src={visualConfig.customImage} className="w-full h-full object-cover"/>
                        ) : <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">Aperçu</div>}
                        
                        {/* Overlay Texte */}
                        <div className={`absolute inset-0 p-6 flex flex-col ${TEMPLATES.find(t=>t.id===visualConfig.template)?.overlayColor} ${TEMPLATES.find(t=>t.id===visualConfig.template)?.textPos}`}>
                            <h2 className={`text-white text-xl drop-shadow-lg leading-tight ${TEMPLATES.find(t=>t.id===visualConfig.template)?.font}`}>
                                {visualConfig.title}
                            </h2>
                        </div>
                    </div>
                    {/* Légende */}
                    <div className="p-4 text-xs text-slate-800 whitespace-pre-wrap">
                        <span className="font-bold mr-1">{profile?.name}</span>
                        {currentPost?.content}
                    </div>
                </div>
                {/* Bouton Sauvegarder */}
                <div className="absolute bottom-0 w-full p-3 bg-white/90 backdrop-blur border-t z-30 flex gap-2">
                    <button onClick={handleSave} className="flex-1 py-3 bg-slate-900 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2">
                        <Save size={14}/> SAUVEGARDER
                    </button>
                </div>
             </div>
          </div>
      </div>

    </div>
  );
}
