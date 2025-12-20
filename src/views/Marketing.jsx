import React, { useState, useRef } from "react";
import { supabase } from "../lib/supabase";
import { generatePostContent } from "../lib/openai"; 
import canvasConfetti from "canvas-confetti";
import {
  Wand2, Plus, Instagram, Facebook, Linkedin, 
  Save, Sparkles, Megaphone, Briefcase, 
  Smartphone, Hash, Send, ChevronRight, Copy
} from "lucide-react";

export default function Marketing({ posts, currentPost, setCurrentPost, profile, onUpdate }) {
  const [prompt, setPrompt] = useState("");
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [style, setStyle] = useState("professionnel"); 
  const [activePreview, setActivePreview] = useState("IG"); // IG, FB, ou LI
  const [hashtags, setHashtags] = useState([]);

  // --- LOGIQUE GÉNÉRATION HASHTAGS ---
  const generateHashtags = () => {
    const localTags = [`#${profile?.city || 'Local'}`, `#${profile?.name?.replace(/\s/g, '') || 'Business'}`];
    const smartTags = ["#Expertise", "#Proximité", "#ServiceClient", "#OffreDuMoment"];
    setHashtags([...localTags, ...smartTags]);
    canvasConfetti({ particleCount: 40, spread: 50, origin: { y: 0.8 } });
  };

  const handleSmartGenerate = async () => {
    if (!prompt.trim()) return;
    setIsLoadingAI(true);
    const aiResult = await generatePostContent(`Style: ${style}. Sujet: ${prompt}. Ville: ${profile?.city}. Format cible: ${activePreview}`, profile);

    if (aiResult) {
      // Ajustement auto du ratio image selon le réseau
      const ratio = activePreview === "FB" ? "width=1200&height=630" : "width=1080&height=1080";
      
      setCurrentPost({
        id: Date.now() + Math.random(),
        business_id: profile?.id,
        title: aiResult.title,
        content: aiResult.content,
        image_url: `https://image.pollinations.ai/prompt/${encodeURIComponent(aiResult.image_keyword)}?${ratio}&nologo=true`,
        networks: [activePreview],
        created_at: new Date().toISOString(),
      });
    }
    setIsLoadingAI(false);
  };

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col gap-6">
      {/* HEADER */}
      <div className="flex justify-between items-center bg-white p-5 rounded-3xl border shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg">
            <Sparkles size={20} />
          </div>
          <h2 className="text-xl font-black text-slate-900">Studio Marketing Multi-Format</h2>
        </div>
        <button onClick={() => setCurrentPost(null)} className="text-sm font-bold text-slate-400 hover:text-indigo-600 transition">Effacer le projet</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
        {/* ÉDITEUR (5/12) */}
        <div className="lg:col-span-5 space-y-4 overflow-y-auto pr-2 custom-scrollbar">
          
          {/* SÉLECTEUR DE RÉSEAU (Crucial pour le format) */}
          <div className="bg-white p-5 rounded-[28px] border shadow-sm">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block text-center">Format du post</label>
            <div className="flex gap-2">
              {[
                { id: 'IG', icon: Instagram, label: 'Carré (1:1)' },
                { id: 'FB', icon: Facebook, label: 'Paysage (1.9:1)' },
                { id: 'LI', icon: Linkedin, label: 'Pro (4:5)' }
              ].map(net => (
                <button 
                  key={net.id}
                  onClick={() => setActivePreview(net.id)}
                  className={`flex-1 py-3 rounded-2xl border-2 transition-all flex flex-col items-center gap-1 ${activePreview === net.id ? "border-indigo-600 bg-indigo-50 text-indigo-600 shadow-sm" : "border-slate-50 text-slate-400"}`}
                >
                  <net.icon size={18} />
                  <span className="text-[9px] font-black uppercase">{net.id}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-[28px] border shadow-sm space-y-4 text-center">
            <div className="grid grid-cols-3 gap-2">
              {['Pro', 'Fun', 'Offre'].map(t => (
                <button key={t} onClick={() => setStyle(t.toLowerCase())} className={`py-2 rounded-xl text-xs font-bold border ${style === t.toLowerCase() ? "bg-slate-900 text-white" : "text-slate-500 border-slate-100"}`}>{t}</button>
              ))}
            </div>
            <textarea 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Décrivez votre idée..."
              className="w-full h-28 p-4 bg-slate-50 rounded-2xl outline-none text-sm font-medium border-none"
            />
            <button 
              onClick={handleSmartGenerate}
              disabled={isLoadingAI || !prompt}
              className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
            >
              {isLoadingAI ? "Adaptation du format..." : <><Wand2 size={18}/> Générer pour {activePreview}</>}
            </button>
          </div>
        </div>

        {/* PREVIEW DYNAMIQUE (7/12) */}
        <div className="lg:col-span-7 bg-slate-50 rounded-[40px] border-2 border-dashed border-slate-200 p-6 flex flex-col items-center justify-center overflow-hidden">
          {currentPost ? (
            <div className="w-full max-w-lg space-y-6">
              {/* MOCKUP QUI S'ADAPTE AU RÉSEAU */}
              <div className={`bg-white rounded-3xl shadow-xl overflow-hidden border mx-auto transition-all duration-500 ${activePreview === 'FB' ? 'w-full aspect-[1.91/1]' : 'max-w-xs aspect-square'}`}>
                <div className="p-3 flex items-center gap-2 border-b bg-white">
                  <div className="w-6 h-6 bg-slate-900 rounded-full text-white flex items-center justify-center text-[8px] font-black">{profile?.name?.charAt(0)}</div>
                  <span className="text-[10px] font-black">{profile?.name} • {activePreview}</span>
                </div>
                <img src={currentPost.image_url} className="w-full h-full object-cover" alt="Visuel IA" />
              </div>

              {/* GÉNÉRATEUR DE HASHTAGS [Nouveauté] */}
              <div className="bg-white p-4 rounded-2xl border shadow-sm">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1"><Hash size={12}/> SEO Local</span>
                  <button onClick={generateHashtags} className="text-[10px] font-bold text-indigo-600 hover:underline">Générer tags</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {hashtags.length > 0 ? hashtags.map(tag => (
                    <span key={tag} className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-1 rounded-lg font-bold">{tag}</span>
                  )) : <p className="text-[10px] text-slate-300 italic">Cliquez pour ajouter des hashtags SEO</p>}
                </div>
              </div>

              <div className="flex gap-4">
                <button className="flex-1 bg-white border-2 border-slate-200 text-slate-700 py-4 rounded-2xl font-black flex items-center justify-center gap-2"><Save size={18} /> Sauvegarder</button>
                <button className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2"><Send size={18} /> Publier sur {activePreview}</button>
              </div>
            </div>
          ) : (
            <div className="text-center opacity-30">
              <Smartphone size={60} className="mx-auto mb-4" />
              <p className="font-black uppercase tracking-tighter text-2xl italic">Studio Ready</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
