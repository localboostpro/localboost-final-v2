import React, { useState, useEffect } from "react"; // CORRECTION CRITIQUE : React importé explicitement
import { supabase } from "../lib/supabase";
import { generatePostContent } from "../lib/openai";
import canvasConfetti from "canvas-confetti";
import {
  Wand2, Instagram, Facebook, Linkedin, Twitter,
  Trash2, Lock, ArrowRight, X, LayoutList, 
  Calendar as CalendarIcon, Eye, PenTool,
  Megaphone, MapPin, Smartphone, Image as ImageIcon, Upload, Sparkles,
  Save, Copy, RefreshCw, CheckCircle2
} from "lucide-react";

// Configuration Visuelle des Plateformes
const PLATFORMS = [
  { id: 'Instagram', icon: <Instagram size={18}/>, color: 'text-pink-600', bg: 'bg-pink-50', border: 'border-pink-200' },
  { id: 'Facebook', icon: <Facebook size={18}/>, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
  { id: 'Linkedin', icon: <Linkedin size={18}/>, color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200' },
];

const TONES = ["Professionnel", "Amical", "Drôle", "Urgent", "Luxe"];

const SUGGESTIONS = [
  "🎉 Promo Flash -20%",
  "🚀 Nouveau Produit",
  "📅 Événement Spécial",
  "👋 Coulisses / Équipe"
];

export default function Marketing({ posts, currentPost, setCurrentPost, profile, onUpdate }) {
  // États
  const [prompt, setPrompt] = useState("");
  const [activeNetwork, setActiveNetwork] = useState("Instagram");
  const [style, setStyle] = useState("Amical");
  const [isLoading, setIsLoading] = useState(false);
  const [imageSource, setImageSource] = useState("AI");
  const [generatedImage, setGeneratedImage] = useState("https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80"); // Placeholder par défaut

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
            <p className="text-slate-300 mb-8">Débloquez la puissance de l'IA pour vos réseaux sociaux.</p>
            <button onClick={() => alert("Passez Premium via votre Profil !")} className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-3 mx-auto transition-all shadow-lg">
                Débloquer l'accès <ArrowRight size={20}/>
            </button>
         </div>
      </div>
    );
  }

  // --- LOGIQUE ---

  const handleGenerate = async () => {
    if (!prompt) return alert("Décrivez votre post d'abord !");
    setIsLoading(true);
    
    try {
      // Construction du prompt enrichi
      const fullPrompt = `Rédige un post pour ${activeNetwork}. Ton: ${style}. Sujet: ${prompt}. Ville: ${profile?.city || "Locale"}. Ajoute des emojis et des hashtags.`;
      
      // Appel IA (Simulé ou Réel selon votre openai.js)
      const aiResult = await generatePostContent(fullPrompt, profile);
      
      if (aiResult) {
        // Gestion de l'image
        let finalImg = generatedImage;
        if (imageSource === "AI") {
           // On utilise un service d'image placeholder dynamique basé sur les mots clés pour simuler l'IA Image
           finalImg = `https://image.pollinations.ai/prompt/${encodeURIComponent(aiResult.image_keyword || prompt)}?width=1080&height=1080&nologo=true`;
        }

        const newPost = {
            id: Date.now(), // ID temporaire
            business_id: profile?.id,
            title: aiResult.title,
            content: aiResult.content,
            image_url: finalImg,
            networks: [activeNetwork],
            created_at: new Date().toISOString(),
            status: 'draft'
        };
        
        setCurrentPost(newPost);
        setGeneratedImage(finalImg);
      }
    } catch (e) {
      console.error(e);
      alert("Erreur lors de la génération.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!currentPost || !profile?.id) return;
    try {
        const { id, status, ...postData } = currentPost; // On retire l'ID temporaire et le status local
        postData.business_id = profile.id;
        
        const { data, error } = await supabase.from("posts").insert([postData]).select();
        
        if (error) throw error;
        
        if (onUpdate) onUpdate(data[0]);
        canvasConfetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        alert("✅ Post enregistré dans l'historique !");
    } catch (err) {
        alert("Erreur sauvegarde : " + err.message);
    }
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
        
    } catch (err) {
        alert("Erreur upload");
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 h-[calc(100vh-100px)] pb-10 animate-in fade-in duration-500">
      
      {/* 🟢 COLONNE GAUCHE : LE CERVEAU (Paramètres) */}
      <div className="flex-1 flex flex-col gap-6 overflow-y-auto custom-scrollbar pr-2">
        
        {/* Header Carte */}
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2 mb-1">
                <Wand2 className="text-indigo-600"/> Studio Créatif
            </h2>
            <p className="text-sm text-slate-500">Configurez votre assistant marketing intelligent.</p>
        </div>

        {/* Configuration */}
        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-8">
            
            {/* 1. Plateforme */}
            <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 block">1. Destination</label>
                <div className="grid grid-cols-3 gap-3">
                    {PLATFORMS.map((plat) => (
                        <button 
                            key={plat.id}
                            onClick={() => setActiveNetwork(plat.id)}
                            className={`flex flex-col items-center justify-center gap-2 py-4 rounded-2xl border-2 transition-all duration-200 ${activeNetwork === plat.id ? `${plat.bg} ${plat.border} ${plat.color} ring-2 ring-offset-2 ring-indigo-100` : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'}`}
                        >
                            {plat.icon}
                            <span className="text-xs font-bold">{plat.id}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* 2. Ton */}
            <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 block">2. Ton du message</label>
                <div className="flex flex-wrap gap-2">
                    {TONES.map((t) => (
                        <button 
                            key={t} 
                            onClick={() => setStyle(t)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${style === t ? 'bg-slate-900 text-white border-slate-900 shadow-md transform scale-105' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}
                        >
                            {t}
                        </button>
                    ))}
                </div>
            </div>

            {/* 3. Contenu */}
            <div>
                <div className="flex justify-between items-center mb-3">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">3. Sujet du post</label>
                    <button onClick={() => setPrompt("")} className="text-[10px] font-bold text-rose-500 hover:underline flex items-center gap-1"><Trash2 size={10}/> Effacer</button>
                </div>
                
                {/* Suggestions Rapides */}
                <div className="flex gap-2 overflow-x-auto pb-2 mb-2 no-scrollbar">
                    {SUGGESTIONS.map(sug => (
                        <button key={sug} onClick={() => setPrompt(sug)} className="whitespace-nowrap px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-bold border border-indigo-100 hover:bg-indigo-100 transition">
                            {sug}
                        </button>
                    ))}
                </div>

                <textarea 
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Ex: Nous lançons notre nouveau burger truffe ce week-end..."
                    className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500 transition resize-none placeholder:text-slate-400"
                />
            </div>

            {/* 4. Image Source */}
            <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 block">4. Visuel</label>
                <div className="flex bg-slate-100 p-1 rounded-xl w-fit">
                    <button onClick={() => setImageSource("AI")} className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${imageSource === 'AI' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}>
                        <Sparkles size={14}/> IA Générative
                    </button>
                    <button onClick={() => document.getElementById('upload-input').click()} className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${imageSource === 'UPLOAD' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}>
                        <Upload size={14}/> Importer
                    </button>
                    <input id="upload-input" type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                </div>
            </div>

            <button 
                onClick={handleGenerate} 
                disabled={isLoading}
                className="w-full py-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-2xl font-black text-lg shadow-xl shadow-indigo-200 hover:shadow-indigo-300 transition-all transform hover:-translate-y-1 flex items-center justify-center gap-3"
            >
                {isLoading ? <RefreshCw size={24} className="animate-spin"/> : <Wand2 size={24}/>}
                {isLoading ? "L'IA travaille..." : "Générer le Post"}
            </button>

        </div>
      </div>

      {/* 🔴 COLONNE DROITE : LE RENDU (Aperçu Réaliste) */}
      <div className="w-full lg:w-[450px] shrink-0 flex flex-col h-full">
          <div className="bg-slate-100 border border-slate-200 rounded-[2.5rem] p-8 h-full flex flex-col items-center justify-center relative overflow-hidden shadow-inner">
              
              <div className="text-center mb-6 z-10">
                  <h3 className="font-black text-slate-900 text-lg">Aperçu Live</h3>
                  <p className="text-xs text-slate-500">Tel que vos clients le verront.</p>
              </div>

              {/* IPHONE MOCKUP */}
              <div className="relative w-[320px] h-[640px] bg-white rounded-[3rem] border-[8px] border-slate-800 shadow-2xl flex flex-col overflow-hidden z-10">
                  
                  {/* Notch & StatusBar */}
                  <div className="absolute top-0 w-full h-8 bg-white z-20 flex justify-between items-center px-6">
                      <span className="text-[10px] font-bold">9:41</span>
                      <div className="flex gap-1">
                          <div className="w-3 h-3 bg-slate-800 rounded-full opacity-20"></div>
                          <div className="w-3 h-3 bg-slate-800 rounded-full opacity-20"></div>
                      </div>
                  </div>
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-800 rounded-b-xl z-30"></div>

                  {/* Contenu Scrollable */}
                  <div className="flex-1 overflow-y-auto pt-10 no-scrollbar bg-white">
                      {currentPost ? (
                          <>
                            {/* Header App */}
                            <div className="px-4 py-2 flex items-center gap-3 border-b border-slate-50">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 to-purple-600 p-[2px]">
                                    <div className="w-full h-full rounded-full bg-white p-[2px]">
                                        {profile?.logo_url ? <img src={profile.logo_url} className="w-full h-full rounded-full object-cover"/> : <div className="w-full h-full bg-slate-100 rounded-full"/>}
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <div className="text-xs font-bold text-slate-900">{profile?.name || "Mon Entreprise"}</div>
                                    <div className="text-[10px] text-slate-400">{profile?.city}</div>
                                </div>
                                <div className="text-slate-900 font-bold">...</div>
                            </div>

                            {/* Image Post */}
                            <div className="w-full aspect-square bg-slate-100 relative">
                                <img src={currentPost.image_url} className="w-full h-full object-cover" alt="Post"/>
                            </div>

                            {/* Actions Bar */}
                            <div className="px-4 py-3 flex gap-4">
                                <div className="text-slate-800"><span className="text-xl">♥</span></div>
                                <div className="text-slate-800"><span className="text-xl">💬</span></div>
                                <div className="text-slate-800"><span className="text-xl">✈️</span></div>
                                <div className="ml-auto text-slate-800"><span className="text-xl">🔖</span></div>
                            </div>

                            {/* Caption */}
                            <div className="px-4 pb-8">
                                <div className="text-xs font-bold text-slate-900 mb-1">1,243 J'aime</div>
                                <div className="text-xs text-slate-800 leading-relaxed">
                                    <span className="font-bold mr-1">{profile?.name}</span>
                                    {currentPost.content}
                                </div>
                                <div className="text-[10px] text-slate-400 mt-2 uppercase">Il y a 2 heures</div>
                            </div>
                          </>
                      ) : (
                          <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-50">
                              <Smartphone size={48} className="text-slate-300 mb-4"/>
                              <p className="text-xs font-bold text-slate-400">Remplissez le formulaire à gauche pour voir la magie opérer ✨</p>
                          </div>
                      )}
                  </div>

                  {/* Bottom Action Bar (Sur le téléphone) */}
                  {currentPost && (
                      <div className="absolute bottom-0 w-full p-4 bg-white/90 backdrop-blur border-t border-slate-100 z-40">
                          <button onClick={handleSave} className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-slate-800 transition">
                              <Save size={14}/> ENREGISTRER
                          </button>
                      </div>
                  )}
              </div>

          </div>
      </div>

    </div>
  );
}
