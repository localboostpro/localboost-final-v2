import React, { useState, useMemo, useRef } from "react";
import { supabase } from "../lib/supabase";
import { generatePostContent } from "../lib/openai"; 
import canvasConfetti from "canvas-confetti";
import {
  Wand2, Plus, Instagram, Facebook, Linkedin, 
  Save, Link as LinkIcon, Bold, List, Smile, Upload, 
  Send, Sparkles, Megaphone, Briefcase
} from "lucide-react";

export default function Marketing({ posts, currentPost, setCurrentPost, profile, onUpdate }) {
  const [prompt, setPrompt] = useState("");
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [style, setStyle] = useState("professionnel"); // Style par défaut
  const [selectedNetworks, setSelectedNetworks] = useState(["IG", "FB"]);
  const fileInputRef = useRef(null);

  // --- LOGIQUE IA AVEC STYLE ---
  const handleSmartGenerate = async () => {
    if (!prompt.trim()) return;
    setIsLoadingAI(true);

    const fullPrompt = `Style: ${style}. Sujet: ${prompt}. Ville: ${profile?.city || "locale"}. Inclus des hashtags locaux.`;
    const aiResult = await generatePostContent(fullPrompt, profile);

    if (aiResult) {
      const generatedImage = `https://image.pollinations.ai/prompt/${encodeURIComponent(
        aiResult.image_keyword + " professional social media post photography"
      )}?width=800&height=800&nologo=true`;

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
      alert("✅ Post enregistré dans votre historique !");
    } catch (err) {
      alert("Erreur: " + err.message);
    }
  };

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col gap-6 animate-in fade-in">
      {/* HEADER */}
      <div className="flex justify-between items-center border-b pb-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Studio Créatif <span className="text-indigo-600">Pro</span></h2>
          <p className="text-slate-400 font-medium">Générez, prévisualisez et publiez vos contenus.</p>
        </div>
        <button onClick={() => setCurrentPost(null)} className="bg-slate-100 text-slate-600 px-4 py-2 rounded-xl font-bold hover:bg-slate-200 transition">
          Nouveau projet
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1 min-h-0">
        
        {/* COLONNE GAUCHE : ÉDITEUR & TOOLS (5/12) */}
        <div className="lg:col-span-5 space-y-6 overflow-y-auto pr-2">
          
          {/* SÉLECTEUR DE STYLE */}
          <div className="bg-white p-6 rounded-[24px] border shadow-sm">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 block">1. Choisir le ton</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'professionnel', icon: Briefcase, label: 'Pro' },
                { id: 'festif', icon: Sparkles, label: 'Fun' },
                { id: 'promo', icon: Megaphone, label: 'Offre' },
              ].map((t) => (
                <button 
                  key={t.id}
                  onClick={() => setStyle(t.id)}
                  className={`flex flex-col items-center p-3 rounded-2xl border-2 transition-all ${style === t.id ? "border-indigo-600 bg-indigo-50 text-indigo-600" : "border-slate-50 text-slate-400"}`}
                >
                  <t.icon size={20} className="mb-1" />
                  <span className="text-xs font-bold">{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* INPUT PROMPT */}
          <div className="bg-white p-6 rounded-[24px] border shadow-sm">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 block">2. Votre idée</label>
            <textarea 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ex: On offre le café demain pour l'ouverture !"
              className="w-full h-32 p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-100 border-none resize-none text-sm font-medium"
            />
            <button 
              onClick={handleSmartGenerate}
              disabled={isLoadingAI || !prompt}
              className="w-full mt-4 bg-indigo-600 text-white py-4 rounded-2xl font-black shadow-lg shadow-indigo-200 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              {isLoadingAI ? "L'IA travaille..." : <><Wand2 size={18}/> Générer le contenu</>}
            </button>
          </div>
        </div>

        {/* COLONNE DROITE : PREVIEW RÉSEAU SOCIAL (7/12) */}
        <div className="lg:col-span-7 bg-slate-50 rounded-[32px] border border-dashed border-slate-200 p-8 flex flex-col items-center justify-center relative overflow-hidden">
          {currentPost ? (
            <div className="w-full max-w-sm animate-in zoom-in duration-300">
              {/* MOCKUP INSTAGRAM */}
              <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border">
                <div className="p-4 flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-tr from-yellow-400 to-purple-600 rounded-full flex items-center justify-center text-white text-[10px] font-bold">
                    {profile?.name?.charAt(0)}
                  </div>
                  <span className="font-bold text-xs">{profile?.name || "Votre Business"}</span>
                </div>
                <img src={currentPost.image_url} className="w-full aspect-square object-cover" alt="AI Generated" />
                <div className="p-4 space-y-2">
                  <div className="flex gap-3 mb-2">
                    <Instagram size={20} className="text-slate-700" />
                    <Facebook size={20} className="text-slate-700" />
                    <Linkedin size={20} className="text-slate-700" />
                  </div>
                  <p className="text-xs text-slate-800 leading-relaxed">
                    <span className="font-bold mr-2">{profile?.name?.toLowerCase().replace(/\s/g, '')}</span>
                    {currentPost.content}
                  </p>
                </div>
              </div>
              
              {/* ACTIONS BOUTONS */}
              <div className="flex gap-3 mt-6">
                <button onClick={handleSave} className="flex-1 bg-white border-2 border-slate-200 text-slate-700 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-50 transition">
                  <Save size={18} /> Sauvegarder
                </button>
                <button className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition">
                  <Send size={18} /> Publier <span className="text-[10px] bg-white/20 px-1 rounded">Bêta</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-4 text-slate-300">
                <Instagram size={32} />
              </div>
              <p className="text-slate-400 font-bold">L'aperçu de votre post apparaîtra ici</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
