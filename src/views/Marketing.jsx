import React, { useState, useRef } from "react";
import { supabase } from "../lib/supabase";
import { generatePostContent } from "../lib/openai"; 
// import canvasConfetti from "canvas-confetti"; // <--- LIGNE SUPPRIMÉE POUR ÉVITER LE CRASH
import { Wand2, Upload, Instagram, Facebook, Linkedin, Save, Sparkles, Smartphone, Hash, Send, Trash2 } from "lucide-react";

export default function Marketing({ currentPost, setCurrentPost, profile, onUpdate }) {
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeNetwork, setActiveNetwork] = useState("Instagram"); 
  const [imageSource, setImageSource] = useState("AI");
  const [style, setStyle] = useState("Professionnel");
  const [hashtags, setHashtags] = useState([]);
  const fileInputRef = useRef(null);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      setIsLoading(true);
      const fileName = `${profile?.id}/${Date.now()}_${file.name.replace(/\s/g, '_')}`;
      const { error } = await supabase.storage.from("user_uploads").upload(fileName, file);
      if (error) throw error;
      const { data } = supabase.storage.from("user_uploads").getPublicUrl(fileName);
      setCurrentPost(prev => ({ ...prev, image_url: data.publicUrl }));
      setImageSource("UPLOAD");
    } catch (error) { alert("Erreur upload: " + error.message); } finally { setIsLoading(false); }
  };

  const handleGenerate = async () => {
    if (!prompt) return alert("Décrivez votre idée !");
    setIsLoading(true);
    try {
      const fullPrompt = `Rédige un post pour ${activeNetwork}. Ton: ${style}. Sujet: ${prompt}. Ville: ${profile?.city}.`;
      const aiResult = await generatePostContent(fullPrompt, profile);
      if (aiResult) {
        let finalImage = currentPost?.image_url;
        if (imageSource === "AI") {
          const ratio = activeNetwork === "Facebook" ? "width=1200&height=630" : "width=1080&height=1080";
          finalImage = `https://image.pollinations.ai/prompt/${encodeURIComponent(aiResult.image_keyword)}?${ratio}&nologo=true`;
        }
        setCurrentPost({ ...currentPost, business_id: profile.id, title: aiResult.title, content: aiResult.content, image_url: finalImage, networks: [activeNetwork], created_at: new Date().toISOString() });
        setHashtags([`#${profile?.city?.replace(/\s/g,'') || 'Local'}`, "#Nouveauté"]);
      }
    } catch (e) { console.error(e); } finally { setIsLoading(false); }
  };

  const handleSave = async () => {
    if (!currentPost || !profile?.id) return;
    const { id, ...data } = currentPost;
    data.business_id = profile.id;
    const { data: savedPost, error } = await supabase.from("posts").insert([data]).select();
    if (!error && onUpdate) {
      onUpdate(savedPost[0]);
      alert("Post enregistré !"); // Remplacement des confettis par une alerte simple
    }
  };

  return (
    <div className="h-[calc(100vh-100px)] flex gap-6 pb-6">
      {/* (Code identique à la version précédente mais sans confettis) */}
      <div className="flex-1 flex flex-col gap-4 overflow-y-auto">
        <div className="bg-white p-5 rounded-3xl border shadow-sm flex-1">
           <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Sujet du post..." className="w-full h-32 bg-slate-50 rounded-xl p-4 text-sm outline-none resize-none mb-4" />
           <button onClick={handleGenerate} disabled={isLoading} className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold shadow-lg flex justify-center items-center gap-2">{isLoading ? "..." : "Générer"}</button>
        </div>
      </div>
      <div className="w-[400px] bg-slate-100 rounded-[3rem] border p-6 flex flex-col items-center justify-center shrink-0">
        {currentPost ? (
          <div className="w-full bg-white rounded-3xl shadow-xl overflow-hidden">
             <img src={currentPost.image_url} className="w-full aspect-square object-cover" alt="Visuel"/>
             <div className="p-3"><p className="text-xs text-slate-600">{currentPost.content}</p></div>
             <button onClick={handleSave} className="w-full bg-slate-900 text-white py-3 font-bold text-xs">ENREGISTRER</button>
          </div>
        ) : <p className="text-slate-400 font-bold">Aperçu ici</p>}
      </div>
    </div>
  );
}
