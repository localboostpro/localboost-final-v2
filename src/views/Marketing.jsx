import React, { useState, useRef } from "react";
import { supabase } from "../lib/supabase";
import { generatePostContent } from "../lib/openai"; 
import canvasConfetti from "canvas-confetti";
import {
  Wand2, Upload, Instagram, Facebook, Linkedin, 
  Save, Sparkles, Image as ImageIcon,
  Smartphone, Hash, Send, RefreshCw, Trash2, CheckCircle2
} from "lucide-react";

export default function Marketing({ currentPost, setCurrentPost, profile, onUpdate }) {
  // États du Studio
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeNetwork, setActiveNetwork] = useState("Instagram"); // Nom entier
  const [imageSource, setImageSource] = useState("AI"); // 'AI' ou 'UPLOAD'
  const [style, setStyle] = useState("Professionnel");
  const [hashtags, setHashtags] = useState([]);
  
  const fileInputRef = useRef(null);

  // --- 1. GESTION IMAGE (UPLOAD vs IA) ---
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setIsLoading(true);
      const fileName = `${profile?.id}/${Date.now()}_${file.name.replace(/\s/g, '_')}`;
      
      const { error: uploadError } = await supabase.storage
        .from("user_uploads") // Assurez-vous que ce bucket existe dans Supabase
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("user_uploads").getPublicUrl(fileName);
      
      // On met à jour le post actuel ou on en crée un nouveau
      updateCurrentPost({ image_url: data.publicUrl });
      setImageSource("UPLOAD");
      
    } catch (error) {
      alert("Erreur upload : " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // --- 2. INTELLIGENCE ARTIFICIELLE ---
  const handleGenerate = async () => {
    if (!prompt && !currentPost?.image_url) return alert("Veuillez décrire votre idée ou uploader une image.");
    setIsLoading(true);

    try {
      // Construction robuste du prompt
      const fullPrompt = `Rédige un post pour ${activeNetwork}. 
      Ton: ${style}. 
      Sujet: ${prompt}. 
      Entreprise: ${profile?.name} à ${profile?.city}.
      Inclus des emojis.`;

      const aiResult = await generatePostContent(fullPrompt, profile);

      if (aiResult) {
        let finalImage = currentPost?.image_url;

        // Si on est en mode IA, on génère l'image
        if (imageSource === "AI") {
          const ratio = activeNetwork === "Facebook" ? "width=1200&height=630" : "width=1080&height=1080";
          finalImage = `https://image.pollinations.ai/prompt/${encodeURIComponent(aiResult.image_keyword)}?${ratio}&nologo=true`;
        }

        const newPostData = {
          id: currentPost?.id || Date.now(), // On garde l'ID si on édite
          business_id: profile?.id,
          title: aiResult.title || "Nouveau Post",
          content: aiResult.content,
          image_url: finalImage,
          networks: [activeNetwork],
          created_at: new Date().toISOString(),
        };

        setCurrentPost(newPostData);
        generateHashtags(); // On génère les tags auto
      }
    } catch (error) {
      console.error("Erreur IA:", error);
      alert("L'IA n'a pas pu répondre. Vérifiez votre connexion.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- 3. UTILITAIRES ---
  const updateCurrentPost = (updates) => {
    setCurrentPost(prev => ({ ...prev, ...updates }));
  };

  const generateHashtags = () => {
    const tags = [
      `#${profile?.city?.replace(/\s/g, '') || 'Local'}`,
      `#${profile?.name?.replace(/\s/g, '') || 'Business'}`,
      "#Nouveauté", "#Promo", "#Expert"
    ];
    setHashtags(tags);
  };

  const addHashtagToContent = (tag) => {
    if (!currentPost) return;
    updateCurrentPost({ content: currentPost.content + " " + tag });
  };

  const handleSave = async () => {
    if (!currentPost || !profile?.id) return;

    try {
      // 1. Nettoyage des données pour Supabase
      const { id, ...postData } = currentPost;
      postData.business_id = profile.id; // Sécurité double
      
      // Conversion du tableau networks en format compatible si besoin (selon votre DB)
      // Ici on suppose que votre colonne networks est de type text[] ou jsonb

      const { data, error } = await supabase.from("posts").insert([postData]).select();
      
      if (error) throw error;

      // 2. Feedback utilisateur
      canvasConfetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      
      // 3. Mise à jour du Dashboard (App.jsx)
      if (onUpdate) onUpdate(data[0]);

      alert("✅ Post enregistré ! Retrouvez-le sur votre tableau de bord.");
      
    } catch (err) {
      console.error(err);
      alert("Erreur sauvegarde : " + err.message);
    }
  };

  const handleReset = () => {
    if(confirm("Tout effacer et recommencer ?")) {
      setCurrentPost(null);
      setPrompt("");
      setHashtags([]);
    }
  };

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col gap-6 animate-in fade-in pb-10">
      
      {/* HEADER DU STUDIO */}
      <div className="flex justify-between items-center bg-white p-5 rounded-2xl border border-slate-100 shadow-sm shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2.5 rounded-xl text-white">
            <Sparkles size={20} />
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-900">Studio de Création</h1>
            <p className="text-xs font-medium text-slate-500">Créez pour {profile?.name}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={handleReset} className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition">
            <Trash2 size={16} className="inline mr-1"/> Réinitialiser
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1 min-h-0">
        
        {/* --- COLONNE GAUCHE : CONFIGURATION (5/12) --- */}
        <div className="lg:col-span-5 flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
          
          {/* 1. FORMAT & RÉSEAU */}
          <section className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">1. Destination</h3>
            <div className="grid grid-cols-3 gap-2">
              {['Instagram', 'Facebook', 'LinkedIn'].map((net) => (
                <button
                  key={net}
                  onClick={() => setActiveNetwork(net)}
                  className={`py-3 px-2 rounded-xl border-2 text-xs font-bold transition-all flex flex-col items-center gap-1 ${
                    activeNetwork === net 
                    ? "border-indigo-600 bg-indigo-50 text-indigo-700" 
                    : "border-slate-50 text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  {net === 'Instagram' && <Instagram size={16}/>}
                  {net === 'Facebook' && <Facebook size={16}/>}
                  {net === 'LinkedIn' && <Linkedin size={16}/>}
                  {net}
                </button>
              ))}
            </div>
          </section>

          {/* 2. VISUEL (IA ou UPLOAD) */}
          <section className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">2. Visuel</h3>
            
            <div className="flex bg-slate-100 p-1 rounded-xl mb-4">
              <button 
                onClick={() => setImageSource("AI")}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${imageSource === "AI" ? "bg-white shadow-sm text-indigo-600" : "text-slate-500"}`}
              >
                Générer par IA
              </button>
              <button 
                onClick={() => setImageSource("UPLOAD")}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${imageSource === "UPLOAD" ? "bg-white shadow-sm text-indigo-600" : "text-slate-500"}`}
              >
                Importer ma photo
              </button>
            </div>

            {imageSource === "UPLOAD" ? (
              <div 
                onClick={() => fileInputRef.current.click()}
                className="border-2 border-dashed border-slate-200 rounded-2xl h-32 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 hover:border-indigo-300 transition group"
              >
                <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} accept="image/*" />
                <div className="bg-white p-3 rounded-full shadow-sm group-hover:scale-110 transition mb-2">
                  <Upload size={20} className="text-indigo-600" />
                </div>
                <p className="text-xs font-bold text-slate-500">Cliquez pour importer</p>
              </div>
            ) : (
               <div className="text-xs text-slate-500 bg-indigo-50 p-3 rounded-xl border border-indigo-100 flex gap-2">
                 <Wand2 size={16} className="text-indigo-600 shrink-0"/>
                 L'IA créera une image unique basée sur votre texte.
               </div>
            )}
          </section>

          {/* 3. CONTENU TEXTE */}
          <section className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex-1 flex flex-col">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">3. Brief Textuel</h3>
              <select 
                value={style} 
                onChange={(e) => setStyle(e.target.value)}
                className="text-xs font-bold bg-slate-50 border-none rounded-lg py-1 px-2 text-slate-600 outline-none cursor-pointer"
              >
                <option value="Professionnel">Ton Pro</option>
                <option value="Amical & Fun">Ton Fun</option>
                <option value="Promotionnel">Ton Vente</option>
              </select>
            </div>
            
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ex: On organise une soirée dégustation vendredi soir..."
              className="w-full flex-1 min-h-[120px] bg-slate-50 rounded-xl p-4 text-sm outline-none resize-none mb-4 focus:ring-2 focus:ring-indigo-100 transition"
            />
            
            <button 
              onClick={handleGenerate}
              disabled={isLoading}
              className="w-full bg-slate-900 text-white py-4 rounded-xl font-black shadow-lg hover:bg-slate-800 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? "Création en cours..." : (
                <>
                  <Wand2 size={18} /> 
                  {currentPost ? "Régénérer le texte" : "Générer le Post"}
                </>
              )}
            </button>
          </section>
        </div>

        {/* --- COLONNE DROITE : APERÇU LIVE (7/12) --- */}
        <div className="lg:col-span-7 bg-slate-100 rounded-[3rem] border border-slate-200 p-8 flex flex-col items-center justify-center relative">
          
          {currentPost ? (
            <div className="w-full max-w-sm animate-in zoom-in-95 duration-300">
              
              {/* MOCKUP SMARTPHONE */}
              <div className="bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-slate-100">
                {/* Header Post */}
                <div className="p-3 flex items-center justify-between border-b border-slate-50">
                   <div className="flex items-center gap-2">
                     <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-[10px] font-black">
                       {profile?.name?.[0]}
                     </div>
                     <div>
                       <p className="text-xs font-bold text-slate-900 leading-tight">{profile?.name}</p>
                       <p className="text-[9px] text-slate-400">{profile?.city || "Sponsorisé"}</p>
                     </div>
                   </div>
                   <div className="text-slate-300">•••</div>
                </div>

                {/* Image */}
                <div className={`w-full bg-slate-100 relative ${activeNetwork === 'Facebook' ? 'aspect-[1.91/1]' : 'aspect-square'}`}>
                  <img 
                    src={currentPost.image_url} 
                    className="w-full h-full object-cover"
                    alt="Post Visuel" 
                  />
                  {/* Badge Réseau */}
                  <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded-md text-[9px] font-black uppercase text-slate-800 shadow-sm">
                    {activeNetwork}
                  </div>
                </div>

                {/* Actions & Texte */}
                <div className="p-4">
                  <div className="flex gap-3 mb-3 text-slate-800">
                    <span className="font-bold text-sm">❤️</span>
                    <span className="font-bold text-sm">💬</span>
                    <span className="font-bold text-sm">🚀</span>
                  </div>
                  <div className="max-h-40 overflow-y-auto pr-1 custom-scrollbar">
                     <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">
                       <span className="font-black text-slate-900 mr-2">{profile?.name}</span>
                       {currentPost.content}
                     </p>
                  </div>
                  
                  {/* Hashtags Suggestion */}
                  {hashtags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {hashtags.map(tag => (
                        <button 
                          key={tag}
                          onClick={() => addHashtagToContent(tag)}
                          className="text-[9px] font-bold bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-md hover:bg-indigo-100 transition"
                        >
                          {tag} +
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* ACTIONS FINALES */}
              <div className="flex gap-3 mt-6">
                <button 
                  onClick={handleSave}
                  className="flex-1 bg-indigo-600 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-indigo-200 hover:scale-[1.02] transition flex items-center justify-center gap-2"
                >
                  <Save size={18} /> Enregistrer
                </button>
                <button 
                  className="flex-1 bg-white text-slate-700 border-2 border-slate-200 py-3.5 rounded-xl font-bold hover:bg-slate-50 transition flex items-center justify-center gap-2"
                  onClick={() => alert("Fonctionnalité de publication directe bientôt disponible !")}
                >
                  <Send size={18} /> Publier
                </button>
              </div>

            </div>
          ) : (
            // ÉTAT VIDE (EMPTY STATE)
            <div className="text-center max-w-xs">
              <div className="w-20 h-20 bg-white rounded-3xl shadow-sm flex items-center justify-center mx-auto mb-6 text-slate-200">
                <Smartphone size={40} strokeWidth={1.5} />
              </div>
              <h3 className="text-slate-900 font-black text-lg mb-2">Prêt à créer ?</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Configurez vos options à gauche (Image, Texte, Réseau) et cliquez sur <span className="font-bold text-slate-600">Générer</span> pour voir la magie opérer.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
