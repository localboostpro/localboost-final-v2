import React, { useState, useMemo, useRef } from "react";
import { supabase } from "../lib/supabase";
import { generatePostContent } from "../lib/openai"; 
import canvasConfetti from "canvas-confetti";
import {
  Wand2, Plus, Instagram, Facebook, Linkedin, 
  Save, Link as LinkIcon, Upload, 
  Sparkles, Megaphone, Briefcase, Info, 
  Smartphone, Hash, Send
} from "lucide-react";

export default function Marketing({ posts, currentPost, setCurrentPost, profile, onUpdate }) {
  const [prompt, setPrompt] = useState("");
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [style, setStyle] = useState("professionnel"); 
  const [selectedNetworks, setSelectedNetworks] = useState(["IG", "FB"]);
  const fileInputRef = useRef(null);

  const handleSmartGenerate = async () => {
    if (!prompt.trim()) return;
    setIsLoadingAI(true);

    // Injection du style et de la ville pour un SEO local optimisé
    const fullPrompt = `Style: ${style}. Sujet: ${prompt}. Ville: ${profile?.city || "locale"}.`;
    const aiResult = await generatePostContent(fullPrompt, profile);

    if (aiResult) {
      const generatedImage = `https://image.pollinations.ai/prompt/${encodeURIComponent(
        aiResult.image_keyword + " professional social media photography"
      )}?width=1080&height=1080&nologo=true`;

      setCurrentPost({
        id: Date.now() + Math.random(),
        business_id: profile?.id,
        title: aiResult.title,
        content: aiResult.content,
        image_url: generatedImage,
        networks: selectedNetworks,
        created_at: new Date().toISOString(),
      });
      setPrompt("");
    }
    setIsLoadingAI(false);
  };

  const handleSave = async () => {
    if (!currentPost || !profile?.id) return;
    const { id, ...cleanData } = currentPost;
    cleanData.business_id = profile.id;

    try {
      const { data, error } = await supabase.from("posts").insert([cleanData]).select();
      if (error) throw error;
      
      canvasConfetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
      if (onUpdate) onUpdate(data[0]);
    } catch (err) {
      alert("Erreur: " + err.message);
    }
  };

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col gap-6 animate-in fade-in">
      {/* HEADER AMÉLIORÉ */}
      <div className="flex justify-between items-center bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
            <Sparkles size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Studio Créatif Pro</h2>
            <p className="text-slate-400 font-medium text-sm">IA Marketing de précision pour {profile?.name}</p>
          </div>
        </div>
        <button onClick={() => setCurrentPost(null)} className="flex items-center gap-2 bg-slate-100 text-slate-600 px-6 py-3 rounded-2xl font-bold hover:bg-slate-200 transition">
          <Plus size={18} /> Nouveau projet
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
        
        {/* CONFIGURATION (5/12) */}
        <div className="lg:col-span-5 space-y-6 overflow-y-auto pr-2 custom-scrollbar">
          
          {/* ÉTAPE 1 : TONALITÉ */}
          <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-[10px] font-black">1</span>
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Choisir le ton</label>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'professionnel', icon: Briefcase, label: 'Pro', color: 'indigo' },
                { id: 'festif', icon: Sparkles, label: 'Fun', color: 'purple' },
                { id: 'promo', icon: Megaphone, label: 'Offre', color: 'orange' },
              ].map((t) => (
                <button 
                  key={t.id}
                  onClick={() => setStyle(t.id)}
                  className={`flex flex-col items-center p-4 rounded-3xl border-2 transition-all ${style === t.id ? "border-indigo-600 bg-indigo-50 text-indigo-600 shadow-md" : "border-slate-50 text-slate-400 hover:border-slate-200"}`}
                >
                  <t.icon size={22} className="mb-2" />
                  <span className="text-xs font-bold">{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* ÉTAPE 2 : RÉSEAUX CIBLES */}
          <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-[10px] font-black">2</span>
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Canaux de diffusion</label>
            </div>
            <div className="flex gap-3">
              {[
                { id: 'IG', icon: Instagram, label: 'Instagram' },
                { id: 'FB', icon: Facebook, label: 'Facebook' },
                { id: 'LI', icon: Linkedin, label: 'LinkedIn' }
              ].map(net => (
                <button 
                  key={net.id}
                  onClick={() => setSelectedNetworks(prev => prev.includes(net.id) ? prev.filter(n => n !== net.id) : [...prev, net.id])}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl border-2 transition-all ${selectedNetworks.includes(net.id) ? "border-slate-900 bg-slate-900 text-white" : "border-slate-50 text-slate-400"}`}
                >
                  <net.icon size={18} />
                  <span className="text-[10px] font-black">{net.id}</span>
                </button>
              ))}
            </div>
          </div>

          {/* ÉTAPE 3 : BRIEF IA */}
          <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-[10px] font-black">3</span>
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Votre idée de post</label>
            </div>
            <textarea 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Décrivez votre actualité (ex: Nouvelle terrasse ouverte !)"
              className="w-full h-32 p-5 bg-slate-50 rounded-[24px] outline-none focus:ring-4 focus:ring-indigo-50 border-none resize-none text-sm font-medium"
            />
            <button 
              onClick={handleSmartGenerate}
              disabled={isLoadingAI || !prompt}
              className="w-full mt-6 bg-indigo-600 text-white py-5 rounded-[24px] font-black shadow-xl shadow-indigo-100 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
            >
              {isLoadingAI ? "L'IA conçoit votre post..." : <><Wand2 size={20}/> Générer avec l'IA</>}
            </button>
          </div>
        </div>

        {/* PREVIEW (7/12) */}
        <div className="lg:col-span-7 bg-slate-100 rounded-[40px] border-2 border-dashed border-slate-200 p-8 flex flex-col items-center justify-center overflow-hidden">
          {currentPost ? (
            <div className="w-full max-w-sm animate-in slide-in-from-bottom-4 duration-500">
              {/* MOCKUP SMARTPHONE */}
              <div className="bg-white rounded-[32px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] overflow-hidden border border-slate-100">
                <div className="p-4 flex items-center justify-between border-b border-slate-50">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-indigo-600 rounded-full flex items-center justify-center text-white text-[10px] font-black">
                      {profile?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-black text-xs text-slate-900">{profile?.name || "Votre Business"}</p>
                      <p className="text-[10px] text-slate-400 font-bold tracking-tight">Publicité locale • {profile?.city}</p>
                    </div>
                  </div>
                  <Info size={16} className="text-slate-300" />
                </div>
                
                <img src={currentPost.image_url} className="w-full aspect-square object-cover" alt="IA" />
                
                <div className="p-5 space-y-3 bg-white">
                  <div className="flex justify-between items-center">
                    <div className="flex gap-4">
                      <Instagram size={22} className="text-slate-800" />
                      <Facebook size={22} className="text-slate-800" />
                      <Linkedin size={22} className="text-slate-800" />
                    </div>
                    <LinkIcon size={20} className="text-slate-300" />
                  </div>
                  <div className="max-h-32 overflow-y-auto custom-scrollbar">
                    <p className="text-sm text-slate-700 leading-relaxed">
                      <span className="font-black mr-2">@{profile?.name?.toLowerCase().replace(/\s/g, '')}</span>
                      {currentPost.content}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-4 mt-8">
                <button onClick={handleSave} className="flex-1 bg-white border-2 border-slate-200 text-slate-700 py-4 rounded-3xl font-black flex items-center justify-center gap-2 hover:bg-slate-50 transition shadow-sm">
                  <Save size={20} /> Sauvegarder
                </button>
                <button className="flex-1 bg-indigo-600 text-white py-4 rounded-3xl font-black flex items-center justify-center gap-2 hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition">
                  <Send size={20} /> Publier Direct
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center group">
              <div className="w-24 h-24 bg-white rounded-[32px] shadow-sm flex items-center justify-center mx-auto mb-6 text-slate-200 group-hover:scale-110 transition-transform">
                <Smartphone size={48} />
              </div>
              <h4 className="text-slate-400 font-black text-lg">Prêt à créer ?</h4>
              <p className="text-slate-300 font-medium">L'aperçu de votre futur post apparaîtra ici.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
