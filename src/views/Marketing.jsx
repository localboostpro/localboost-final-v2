import React, { useState, useMemo, useRef } from "react";
import { supabase } from "../lib/supabase";
import { generatePostContent } from "../lib/openai"; 
import canvasConfetti from "canvas-confetti"; // Assurez-vous d'avoir installé 'canvas-confetti'
import {
  Wand2, Trash2, Share2, Plus, Instagram, Facebook, 
  Save, Link as LinkIcon, Bold, List, Smile, Upload, Image as ImageIcon
} from "lucide-react";

export default function Marketing({ posts, currentPost, setCurrentPost, profile }) {
  const [prompt, setPrompt] = useState("");
  const [imageSearchTerm, setImageSearchTerm] = useState("");
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  // --- 1. LOGIQUE D'UPLOAD PHOTO ---
  const handleFileUpload = async (event) => {
    try {
      const file = event.target.files[0];
      if (!file) return;
      setIsUploading(true);

      const fileName = `${profile?.id || "guest"}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9]/g, "")}`;
      const { data, error } = await supabase.storage.from("user_uploads").upload(fileName, file);
      if (error) throw error;

      const { data: publicUrlData } = supabase.storage.from("user_uploads").getPublicUrl(fileName);
      updateField("image_url", publicUrlData.publicUrl);
    } catch (error) {
      console.error("Erreur upload:", error);
      alert("Erreur lors de l'import de l'image.");
    } finally {
      setIsUploading(false);
    }
  };

  const sortedPosts = useMemo(() => {
    if (!posts) return [];
    return [...posts].sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
  }, [posts]);

  // --- 2. LOGIQUE IA (CORRECTIF BUSINESS_ID) ---
  const handleSmartGenerate = async () => {
    if (!prompt.trim()) return;
    setIsLoadingAI(true);

    const localPrompt = `${prompt} (Localisation : ${profile?.city || "Ma Ville"})`;
    const aiResult = await generatePostContent(localPrompt, profile);

    if (aiResult) {
      const { title, content, image_keyword } = aiResult;
      setImageSearchTerm(image_keyword);

      const generatedImage = `https://image.pollinations.ai/prompt/${encodeURIComponent(
        image_keyword + " professional photography, 4k"
      )}?width=800&height=800&nologo=true`;

      const newPost = {
        id: Date.now() + Math.random(),
        business_id: profile?.id, // CORRECTIF : On lie immédiatement au profil
        title: title,
        content: content,
        type: "IA",
        image_url: generatedImage,
        format: "post",
        networks: ["IG", "FB"],
        link_url: "",
        scheduled_at: null,
        created_at: new Date().toISOString(),
      };

      setCurrentPost(newPost);
      setPrompt("");
    }
    setIsLoadingAI(false);
  };

  // --- 3. SAUVEGARDE & CONFETTIS ---
  const handleSave = async () => {
    if (!currentPost) return;
    if (!profile?.id) return alert("Erreur: Profil non identifié.");

    const postToSave = { ...currentPost };
    const { id, ...cleanData } = postToSave;

    // On force l'ID business pour éviter le NULL en base
    cleanData.business_id = profile.id; 

    if (!cleanData.scheduled_at || cleanData.scheduled_at === "") {
      cleanData.scheduled_at = null;
    }

    const isCreation = typeof id === "number" && id > 1000000;

    try {
      if (isCreation) {
        const { error } = await supabase.from("posts").insert([cleanData]);
        if (error) throw error;
        
        // Effet Confettis !
        canvasConfetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#4F46E5', '#818CF8', '#C7D2FE']
        });

      } else {
        const { error } = await supabase.from("posts").update(cleanData).eq("id", id);
        if (error) throw error;
      }
      
      setTimeout(() => window.location.reload(), 1500); // Laisse le temps aux confettis
    } catch (err) {
      console.error(err);
      alert("Erreur : " + err.message);
    }
  };

  const updateField = (field, value) => {
    if (!currentPost) return;
    setCurrentPost({ ...currentPost, [field]: value });
  };

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col gap-6 animate-in fade-in">
      {/* HEADER */}
      <div className="flex justify-between items-end border-b pb-4 shrink-0">
        <div>
          <h2 className="text-3xl font-black text-slate-900">Studio Marketing</h2>
          <p className="text-slate-400 text-sm italic">Créez du contenu qui booste votre SEO local à {profile?.city || "proximité"}.</p>
        </div>
        <button onClick={() => setCurrentPost(null)} className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 shadow-lg hover:bg-indigo-700 transition">
          <Plus size={18} /> Nouveau Post
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
        {/* ZONE ÉDITION (8/12) */}
        <div className="lg:col-span-8 flex flex-col h-full bg-white rounded-[32px] border shadow-sm overflow-hidden relative">
          {currentPost ? (
            <div className="flex flex-col md:flex-row h-full">
              {/* Preview Visuelle */}
              <div className="w-full md:w-1/2 bg-slate-50 border-r p-6 flex flex-col overflow-y-auto">
                <div className="bg-white p-4 rounded-2xl border shadow-sm mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-black text-xs uppercase">
                      {profile?.name ? profile.name.substring(0,2) : "LB"}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-slate-900 leading-none">{profile?.name || "Mon Business"}</p>
                      <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider font-bold">Sponsorisé • {profile?.city}</p>
                    </div>
                  </div>
                  <p className="text-sm text-slate-700 mb-4 whitespace-pre-wrap leading-relaxed">{currentPost.content}</p>
                  <div className="rounded-xl overflow-hidden border bg-slate-200 aspect-square group relative">
                    <img src={currentPost.image_url} className="w-full h-full object-cover" alt="Preview" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                       <button onClick={() => fileInputRef.current.click()} className="bg-white text-slate-900 px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 shadow-xl">
                         <Upload size={14} /> Changer l'image
                       </button>
                    </div>
                  </div>
                </div>
                <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*" />
              </div>

              {/* Éditeur de texte */}
              <div className="w-full md:w-1/2 p-6 flex flex-col gap-5 bg-white">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Titre Interne</label>
                  <input className="w-full text-lg font-black outline-none border-b focus:border-indigo-500 transition-colors pb-1" value={currentPost.title || ""} onChange={(e) => updateField("title", e.target.value)} placeholder="Nom de la campagne..." />
                </div>
                
                <div className="flex-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Message Social</label>
                  <textarea className="w-full h-64 bg-slate-50 p-4 rounded-2xl outline-none resize-none text-sm leading-relaxed text-slate-600 font-medium focus:ring-2 focus:ring-indigo-100" value={currentPost.content || ""} onChange={(e) => updateField("content", e.target.value)} />
                </div>

                <div className="pt-4 border-t">
                  <button onClick={handleSave} className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition flex items-center justify-center gap-3">
                    <Save size={20} /> Enregistrer le post
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* ÉCRAN DE GÉNÉRATION */
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center max-w-xl mx-auto">
              <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center mb-6 rotate-3">
                <Wand2 size={40} className="text-indigo-600" />
              </div>
              <h3 className="text-3xl font-black text-slate-900 mb-3">Quoi de neuf chez {profile?.name || "vous"} ?</h3>
              <p className="text-slate-500 mb-8 leading-relaxed font-medium">L'IA va rédiger un post captivant et trouver une image professionnelle adaptée à votre ville.</p>
              
              <textarea 
                value={prompt} 
                onChange={(e) => setPrompt(e.target.value)} 
                placeholder="Ex: On organise un déstockage ce samedi avec -30% sur tout !" 
                className="w-full bg-white border-2 border-slate-100 rounded-3xl p-6 min-h-[150px] outline-none focus:border-indigo-500 text-slate-700 shadow-sm mb-6"
              />
              
              <button 
                onClick={handleSmartGenerate} 
                disabled={!prompt.trim() || isLoadingAI} 
                className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black text-xl hover:bg-indigo-700 transition disabled:opacity-50 shadow-2xl shadow-indigo-100 flex items-center justify-center gap-3"
              >
                {isLoadingAI ? "L'IA réfléchit..." : "Générer avec l'IA ✨"}
              </button>
            </div>
          )}
        </div>

        {/* HISTORIQUE (4/12) */}
        <div className="lg:col-span-4 bg-white rounded-[32px] border shadow-sm flex flex-col h-full overflow-hidden">
          <div className="p-5 border-b font-black text-xs uppercase tracking-widest text-slate-400 bg-slate-50/50">Historique des posts</div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {sortedPosts.map((post) => (
              <div key={post.id} onClick={() => setCurrentPost(post)} className={`flex gap-4 p-3 rounded-2xl border cursor-pointer transition-all ${currentPost?.id === post.id ? "bg-indigo-50 border-indigo-200 scale-105" : "bg-white border-slate-100 hover:border-indigo-100"}`}>
                <img src={post.image_url} className="w-16 h-16 rounded-xl object-cover shrink-0 bg-slate-100" alt="" />
                <div className="overflow-hidden flex flex-col justify-center">
                  <p className="font-black text-sm text-slate-900 truncate">{post.title || "Sans titre"}</p>
                  <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase">{new Date(post.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
