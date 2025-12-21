import React, { useState } from "react";
import { supabase } from "../lib/supabase";
import { generatePostContent } from "../lib/openai";
// import canvasConfetti from "canvas-confetti"; // COMMENTÉ POUR TESTER
import {
  Wand2, Instagram, Facebook, Linkedin,
  Trash2, Lock, ArrowRight, X, LayoutList, 
  Calendar as CalendarIcon, Eye, PenTool,
  Megaphone, MapPin, Smartphone, Image as ImageIcon, Upload, Sparkles
} from "lucide-react";

export default function Marketing({ posts, currentPost, setCurrentPost, profile, onUpdate }) {
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeNetwork, setActiveNetwork] = useState("Instagram");
  const [imageSource, setImageSource] = useState("AI");
  const [style, setStyle] = useState("Professionnel");
  const [demonym, setDemonym] = useState(""); 
  const [hashtags, setHashtags] = useState([]);
  const [viewMode, setViewMode] = useState("list"); 
  const [mobileTab, setMobileTab] = useState("editor");

  const availableTones = ["Professionnel", "Amical", "Drôle", "Urgent", "Luxe"];

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

  const handleDeletePost = async (e, postId) => {
      e.stopPropagation(); 
      if(!window.confirm("Voulez-vous vraiment supprimer ce post ?")) return;
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
    if (!prompt) return alert("Veuillez décrire votre idée de post !");
    setIsLoading(true);
    if(window.innerWidth < 1024) setMobileTab("preview"); 
    try {
      const locationInfo = demonym 
        ? `Ville: ${profile?.city}. Nom des habitants: ${demonym} (Important: utilise ce terme exact).`
        : `Ville: ${profile?.city}.`;

      const fullPrompt = `Rédige un post pour ${activeNetwork}. Ton: ${style}. Sujet: ${prompt}. ${locationInfo}`;
      
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
        setHashtags(["#Local", `#${profile?.city?.replace(/\s/g,'') || 'Ville'}`]);
      }
    } catch (e) { console.error(e); alert("Erreur lors de la génération IA"); } finally { setIsLoading(false); }
  };

  const handleSave = async () => {
    if (!currentPost || !profile?.id) return alert("Profil introuvable");
    const { id, ...data } = currentPost;
    data.business_id = profile.id;
    if(typeof data.id === 'number') delete data.id;
    const { data: savedPost, error } = await supabase.from("posts").insert([data]).select();
    if (!error && onUpdate) {
      onUpdate(savedPost[0]);
      // canvasConfetti(); // COMMENTÉ AUSSI
      alert("✅ Post enregistré avec succès !");
    } else { alert("Erreur lors de la sauvegarde"); }
  };

  const renderCalendar = () => {
    const today = new Date();
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    return (
      <div className="grid grid-cols-5 gap-2 p-2">
        {days.map(day => {
          const postsForDay = posts.filter(p => { const d = new Date(p.created_at); return d.getDate() === day && d.getMonth() === today.getMonth(); });
          return (
            <div key={day} className={`aspect-square rounded-xl border flex flex-col items-center justify-start pt-1 relative ${postsForDay.length > 0 ? 'bg-indigo-50 border-indigo-200' : 'bg-slate-50 border-slate-100'}`}>
                <span className={`text-[10px] font-bold ${postsForDay.length > 0 ? 'text-indigo-600' : 'text-slate-400'}`}>{day}</span>
                {postsForDay.map(p => (<div key={p.id} onClick={() => { setCurrentPost(p); setMobileTab("preview"); }} className="w-2 h-2 mt-1 rounded-full bg-indigo-500"></div>))}
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
          <button onClick={() => setMobileTab("history")} className={`flex-1 py-2 text-xs font-bold rounded-xl flex items-center gap-2 justify-center ${mobileTab === 'history' ? 'bg-slate-900 text-white' : 'text-slate-500'}`}><History size={14}/> Historique</button>
          <button onClick={() => setMobileTab("editor")} className={`flex-1 py-2 text-xs font-bold rounded-xl flex items-center gap-2 justify-center ${mobileTab === 'editor' ? 'bg-slate-900 text-white' : 'text-slate-500'}`}><PenTool size={14}/> Éditeur</button>
          <button onClick={() => setMobileTab("preview")} className={`flex-1 py-2 text-xs font-bold rounded-xl flex items-center gap-2 justify-center ${mobileTab === 'preview' ? 'bg-indigo-600 text-white' : 'text-slate-500'}`}><Eye size={14}/> Aperçu</button>
      </div>

      {/* COLONNE GAUCHE : HISTORIQUE */}
      <div className={`${mobileTab === 'history' ? 'flex' : 'hidden'} lg:flex w-full lg:w-80 flex-col bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden shrink-0 h-[60vh] lg:h-auto`}>
        <div className="p-4 border-b bg-slate-50 flex justify-between items-center shrink-0">
            <div className="font-bold text-xs uppercase text-slate-400 flex items-center gap-2">
              {viewMode === 'list' ? <LayoutList size={14}/> : <CalendarIcon size={14}/>} {viewMode === 'list' ? "Vos Créations" : "Calendrier"}
            </div>
            <div className="flex bg-slate-200 rounded-lg p-1 gap-1">
                <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-md ${viewMode === 'list' ? 'bg-white shadow' : ''}`}><LayoutList size={14}/></button>
                <button onClick={() => setViewMode('calendar')} className={`p-1.5 rounded-md ${viewMode === 'calendar' ? 'bg-white shadow' : ''}`}><CalendarIcon size={14}/></button>
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
                   </div>
                   <button onClick={(e) => handleDeletePost(e, post.id)} className="absolute top-1 right-1 bg-white rounded-full p-1 text-slate-300 hover:text-rose-500 shadow-sm opacity-0 group-hover:opacity-100"><X size={12}/></button>
                 </div>
               ))}
               {posts.length === 0 && <div className="text-center text-slate-400 text-xs py-10">Aucun post.</div>}
             </div>
          ) : renderCalendar()}
        </div>
      </div>

      {/* COLONNE CENTRE : ÉDITEUR */}
      <div className={`${mobileTab === 'editor' ? 'flex' : 'hidden'} lg:flex flex-1 flex-col gap-4 overflow-y-auto custom-scrollbar`}>
        
        {/* EN-TÊTE */}
        <div className="flex justify-between items-center bg-white p-4 rounded-[2rem] border shadow-sm">
          <h2 className="font-black text-slate-900 text-lg flex items-center gap-2"><Sparkles className="text-indigo-600"/> Studio Créatif</h2>
          <button onClick={() => {setCurrentPost(null); setPrompt("");}} className="text-xs font-bold text-slate-400 hover:text-red-500 flex gap-1 items-center"><Trash2 size={12}/> Reset</button>
        </div>

        {/* PARAMÈTRES */}
        <div className="bg-white p-6 rounded-[2rem] border shadow-sm space-y-6">
           <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Destination</label>
              <div className="grid grid-cols-3 gap-2">
                {['Instagram', 'Facebook', 'LinkedIn'].map(net => (
                  <button key={net} onClick={() => setActiveNetwork(net)} className={`py-3 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition ${activeNetwork === net ? "bg-slate-900 text-white border-slate-900 shadow-md" : "text-slate-500 border-slate-100 hover:bg-slate-50"}`}>
                    {net === 'Instagram' ? <Instagram size={14}/> : net === 'Facebook' ? <Facebook size={14}/> : <Linkedin size={14}/>} <span className="hidden md:inline">{net}</span>
                  </button>
                ))}
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2"><Megaphone size={14}/> Ton du message</label>
                 <div className="flex flex-wrap gap-2">
                   {availableTones.map(ton => (
                     <button key={ton} onClick={() => setStyle(ton)} className={`py-2 px-3 rounded-xl border text-[10px] font-bold transition ${style === ton ? "bg-indigo-100 text-indigo-700 border-indigo-200" : "text-slate-500 border-slate-100 hover:bg-slate-50"}`}>{ton}</button>
                   ))}
                 </div>
              </div>
              
              <div>
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2"><MapPin size={14}/> Nom des habitants (Gentilé)</label>
                 <input 
                    type="text" 
                    placeholder="Ex: Toulousains (optionnel)" 
                    value={demonym}
                    onChange={(e) => setDemonym(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold outline-none focus:ring-2 ring-indigo-500"
                 />
                 <p className="text-[9px] text-slate-400 mt-1">Laissez vide si vous ne savez pas.</p>
              </div>
           </div>
        </div>

        {/* PROMPT ET GÉNÉRATION */}
        <div className="bg-white p-6 rounded-[2rem] border shadow-sm flex-1 flex flex-col">
           <div className="flex flex-wrap gap-2 mb-4 bg-slate-50 p-1.5 rounded-xl w-fit border border-slate-100">
              <button onClick={() => setImageSource("AI")} className={`px-4 py-2 text-xs font-bold rounded-lg transition flex items-center gap-2 ${imageSource === 'AI' ? 'bg-white shadow text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}>
                  <ImageIcon size={14}/> Image IA
              </button>
              <button onClick={() => document.getElementById('uploadInput').click()} className={`px-4 py-2 text-xs font-bold rounded-lg transition flex items-center gap-2 ${imageSource === 'UPLOAD' ? 'bg-white shadow text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}>
                  <Upload size={14}/> Importer
              </button>
              <input id="uploadInput" type="file" className="hidden" onChange={handleFileUpload} accept="image/*"/>
           </div>
           
           <textarea 
             value={prompt} 
             onChange={(e) => setPrompt(e.target.value)} 
             placeholder="Décrivez votre idée de post ici... (Ex: Promo -20% sur les croissants ce matin)" 
             className="w-full h-32 md:h-full bg-slate-50 rounded-2xl p-4 text-sm outline-none resize-none mb-4 focus:ring-2 ring-indigo-100 transition border border-slate-100 placeholder:text-slate-400" 
           />
           
           <button onClick={handleGenerate} disabled={isLoading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-xl font-bold shadow-lg shadow-indigo-200 flex justify-center items-center gap-2 transition mt-auto">
             {isLoading ? "L'IA rédige votre post..." : <><Wand2 size={16}/> Générer le Post</>}
           </button>
        </div>
      </div>

      {/* COLONNE DROITE : PRÉVISUALISATION */}
      <div className={`${mobileTab === 'preview' ? 'flex' : 'hidden'} lg:flex w-full lg:w-[420px] bg-slate-100 rounded-[2.5rem] border p-4 lg:p-8 flex-col items-center justify-center shrink-0 overflow-hidden relative min-h-[500px]`}>
         
         <div className="text-center mb-6 z-10">
            <h3 className="font-black text-slate-900 text-lg">Aperçu {activeNetwork}</h3>
            <p className="text-xs text-slate-500">Visualisez le rendu final.</p>
         </div>

         {/* CADRE TÉLÉPHONE */}
         <div className="relative w-full max-w-[300px] h-[550px] lg:h-[600px] bg-white rounded-[3rem] border-8 border-slate-900 shadow-2xl flex flex-col z-10 mx-auto">
            {/* Encoche */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-900 rounded-b-2xl z-30 pointer-events-none"></div>
            
            {/* Écran Scrollable */}
            <div 
                className="flex-1 overflow-y-auto bg-white rounded-[2.5rem] w-full h-full"
                style={{
                    scrollbarWidth: 'none', 
                    msOverflowStyle: 'none',
                    maskImage: 'radial-gradient(white, black)', 
                    WebkitMaskImage: '-webkit-radial-gradient(white, black)',
                    borderRadius: '2.3rem' 
                }}
            >
                {currentPost ? (
                   <>
                      {/* En-tête App */}
                      <div className="h-14 border-b flex items-center px-4 gap-3 pt-6 bg-white/95 backdrop-blur sticky top-0 z-20">
                          <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0">{profile?.name?.[0]}</div>
                          <div className="text-xs font-bold truncate">{profile?.name}</div>
                      </div>
                      
                      {/* Image */}
                      <div className="w-full bg-slate-100 aspect-square">
                          <img src={currentPost.image_url} className="w-full h-full object-cover block" alt="Post"/>
                      </div>

                      {/* Actions */}
                      <div className="px-4 py-3 flex gap-4 text-slate-800">
                          <div className="hover:text-red-500 cursor-pointer transition">♥</div>
                          <div>💬</div>
                          <div>✈️</div>
                      </div>

                      {/* Contenu */}
                      <div className="px-4 pb-20">
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
                       <p className="text-xs font-bold">Remplissez le formulaire et cliquez sur Générer.</p>
                   </div>
                )}
            </div>

            {/* Bouton Publier */}
            {currentPost && (
                <div className="absolute bottom-0 left-0 w-full p-4 bg-white/90 backdrop-blur z-30 rounded-b-[2.5rem]">
                    <button onClick={handleSave} className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold text-xs shadow-lg hover:bg-indigo-700 transition">
                        ENREGISTRER LE POST
                    </button>
                </div>
            )}
         </div>
      </div>
    </div>
  );
}
