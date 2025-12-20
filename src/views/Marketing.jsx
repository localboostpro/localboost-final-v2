import React, { useState, useMemo, useEffect, useRef } from "react";
import { supabase } from "../lib/supabase";
import { generatePostContent } from "../lib/openai"; // On garde votre fichier openai.js actuel
import {
  Wand2,
  Trash2,
  Share2,
  RefreshCw,
  Smartphone,
  Monitor,
  LayoutTemplate,
  Plus,
  Clock,
  Instagram,
  Facebook,
  Linkedin,
  Save,
  Link as LinkIcon,
  Bold,
  List,
  Smile,
  Settings,
  X,
  Upload,
  Image as ImageIcon,
} from "lucide-react";

export default function Marketing({
  posts,
  currentPost,
  setCurrentPost,
  onUpdate,
  onDelete,
  profile,
}) {
  const [prompt, setPrompt] = useState("");
  const [imageSearchTerm, setImageSearchTerm] = useState("");
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null); // Pour le bouton upload caché

  // --- 1. LOGIQUE D'UPLOAD PHOTO ---
  const handleFileUpload = async (event) => {
    try {
      const file = event.target.files[0];
      if (!file) return;

      setIsUploading(true);

      // Nom de fichier unique : id_client / timestamp_nom
      const fileName = `${
        profile?.id || "guest"
      }/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9]/g, "")}`;

      const { data, error } = await supabase.storage
        .from("user_uploads")
        .upload(fileName, file);

      if (error) throw error;

      // Récupération de l'URL publique
      const { data: publicUrlData } = supabase.storage
        .from("user_uploads")
        .getPublicUrl(fileName);

      // Mise à jour du post avec la NOUVELLE image
      updateField("image_url", publicUrlData.publicUrl);
      alert("✅ Image importée avec succès !");
    } catch (error) {
      console.error("Erreur upload:", error);
      alert("Erreur lors de l'import de l'image.");
    } finally {
      setIsUploading(false);
    }
  };

  const sortedPosts = useMemo(() => {
    if (!posts) return [];
    return [...posts].sort(
      (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)
    );
  }, [posts]);

  // --- 2. LOGIQUE IA (SEO LOCAL AMÉLIORÉ) ---
  const handleSmartGenerate = async () => {
    if (!prompt.trim()) return;
    setIsLoadingAI(true);

    // On injecte la ville pour le SEO local
    const localPrompt = `${prompt} (Localisation : ${
      profile?.city || "Ma Ville"
    })`;

    const aiResult = await generatePostContent(localPrompt, profile);

    if (aiResult) {
      const { title, content, image_keyword } = aiResult;
      setImageSearchTerm(image_keyword);

      // Par défaut on génère une image IA, mais l'utilisateur pourra la changer
      const generatedImage = `https://image.pollinations.ai/prompt/${encodeURIComponent(
        image_keyword + " professional photography, 4k"
      )}?width=800&height=800&nologo=true`;

      const newPost = {
        id: Date.now() + Math.random(),
        title: title,
        content: content,
        type: "IA",
        image_url: generatedImage,
        format: "post",
        networks: ["IG", "FB"],
        link_url: "",
        scheduled_at: "",
        created_at: new Date().toISOString(),
      };

      setCurrentPost(newPost);
      setPrompt("");
    }
    setIsLoadingAI(false);
  };

  // --- SAUVEGARDE & UPDATE (CORRIGÉE) ---
  const handleSave = async () => {
    if (!currentPost) return;

    // 1. Préparation des données (Nettoyage)
    // On copie les données pour ne pas modifier l'affichage actuel
    const postToSave = { ...currentPost };
    const { id, ...cleanData } = postToSave;

    // 🚨 LE CORRECTIF EST ICI :
    // Si la date est vide (""), on la force à NULL pour que la base de données l'accepte
    if (!cleanData.scheduled_at || cleanData.scheduled_at === "") {
      cleanData.scheduled_at = null;
    }

    const isCreation = typeof id === "number" && id > 1000000;

    try {
      if (isCreation) {
        // Création
        const { error } = await supabase.from("posts").insert([cleanData]);
        if (error) throw error;
        alert("✅ Post sauvegardé avec succès !");
      } else {
        // Mise à jour
        const { error } = await supabase
          .from("posts")
          .update(cleanData)
          .eq("id", id);
        if (error) throw error;
        alert("💾 Modifications enregistrées.");
      }
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert("Erreur technique : " + err.message);
    }
  };

  const updateField = (field, value) => {
    if (!currentPost) return;
    setCurrentPost({ ...currentPost, [field]: value });
  };

  const addFormat = (tag) => {
    const current = currentPost.content || "";
    if (tag === "bold") updateField("content", current + "**gras** ");
    if (tag === "list") updateField("content", current + "\n• ");
  };

  // Fonction pour switcher entre IA et Upload
  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  // Fonction pour regénérer l'image IA uniquement
  const forceUpdateAIImage = () => {
    if (!imageSearchTerm) return;
    const seed = Math.floor(Math.random() * 1000);
    const newUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(
      imageSearchTerm
    )}?width=800&height=800&nologo=true&seed=${seed}`;
    updateField("image_url", newUrl);
  };

  const renderCleanText = (text) => {
    if (!text)
      return (
        <span className="text-slate-400 italic">
          Le contenu apparaîtra ici...
        </span>
      );
    return text.split("\n").map((line, i) => (
      <p key={i} className="min-h-[1rem] mb-2">
        {line.split(/(\*\*.*?\*\*)/).map((part, j) => {
          if (part.startsWith("**") && part.endsWith("**")) {
            return (
              <strong key={j} className="font-bold text-slate-900">
                {part.slice(2, -2)}
              </strong>
            );
          }
          return part;
        })}
      </p>
    ));
  };

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col gap-6 animate-in fade-in relative">
      {/* INPUT FILE CACHÉ POUR L'UPLOAD */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        className="hidden"
        accept="image/*"
      />

      {/* HEADER */}
      <div className="flex justify-between items-end border-b pb-4 shrink-0">
        <div>
          <h2 className="text-3xl font-black text-slate-900">
            Studio Marketing
          </h2>
          <p className="text-slate-400 text-sm">
            Créez du contenu local engageant.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentPost(null)}
            className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 shadow-lg hover:bg-indigo-700 transition"
          >
            <Plus size={18} /> Nouveau Post
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
        {/* ESPACE DE TRAVAIL */}
        <div className="lg:col-span-8 flex flex-col h-full min-h-0 bg-white rounded-[32px] border shadow-sm overflow-hidden relative">
          {currentPost ? (
            <div className="flex flex-col md:flex-row h-full">
              {/* --- COLONNE GAUCHE : VISUEL & UPLOAD --- */}
              <div className="w-full md:w-1/2 bg-slate-50 border-r p-4 flex flex-col overflow-y-auto">
                {/* Preview Post */}
                <div className="bg-white p-4 rounded-xl border shadow-sm mb-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold">
                      {profile?.name ? profile.name[0] : "M"}
                    </div>
                    <div>
                      <div className="font-bold text-sm text-slate-900">
                        {profile?.name || "Mon Entreprise"}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {profile?.city
                          ? `📍 ${profile.city}`
                          : "Commerce local"}
                      </div>
                    </div>
                  </div>

                  <div className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed mb-3">
                    {renderCleanText(currentPost.content)}
                  </div>

                  <div className="rounded-lg overflow-hidden border bg-slate-100 relative group">
                    <img
                      src={currentPost.image_url}
                      className="w-full h-auto object-cover max-h-80"
                      alt="Aperçu"
                      onError={(e) =>
                        (e.target.src =
                          "https://placehold.co/800x800?text=Aperçu")
                      }
                    />
                    {/* Overlay au survol pour changer l'image */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-4">
                      <button
                        onClick={triggerFileInput}
                        className="bg-white text-slate-900 px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2 hover:bg-slate-100"
                      >
                        <Upload size={16} /> Importer ma photo
                      </button>
                    </div>
                  </div>
                </div>

                {/* Barre d'outils Images */}
                <div className="bg-white p-3 rounded-xl border shadow-sm">
                  <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block">
                    Source de l'image
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={triggerFileInput}
                      className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition"
                    >
                      {isUploading ? (
                        "Import en cours..."
                      ) : (
                        <>
                          <Upload size={14} /> Ma Photo
                        </>
                      )}
                    </button>
                    <button
                      onClick={forceUpdateAIImage}
                      className="flex-1 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition"
                    >
                      <Wand2 size={14} /> Régénérer IA
                    </button>
                  </div>
                </div>
              </div>

              {/* --- COLONNE DROITE : ÉDITEUR TEXTE --- */}
              <div className="w-full md:w-1/2 p-6 flex flex-col gap-4 overflow-y-auto bg-white">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase">
                    Titre Campagne
                  </label>
                  <input
                    className="text-lg font-black outline-none w-full border-b border-transparent focus:border-indigo-100 transition"
                    value={currentPost.title || ""}
                    onChange={(e) => updateField("title", e.target.value)}
                    placeholder="Titre interne..."
                  />
                </div>

                <div className="flex gap-2 border-b border-slate-100 pb-2 items-center">
                  <button
                    onClick={() => addFormat("bold")}
                    className="p-1.5 hover:bg-slate-100 rounded text-slate-500"
                    title="Gras"
                  >
                    <Bold size={16} />
                  </button>
                  <button
                    onClick={() => addFormat("list")}
                    className="p-1.5 hover:bg-slate-100 rounded text-slate-500"
                    title="Liste"
                  >
                    <List size={16} />
                  </button>
                  <button
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="p-1.5 hover:bg-slate-100 rounded text-indigo-500 flex gap-1"
                  >
                    <Smile size={16} />
                  </button>
                </div>

                {showEmojiPicker && (
                  <div className="grid grid-cols-6 gap-2 p-3 bg-slate-50 rounded-xl border">
                    {[
                      "🔥",
                      "✨",
                      "🚀",
                      "❤️",
                      "📍",
                      "👋",
                      "🥐",
                      "☕️",
                      "💶",
                      "🎉",
                    ].map((em) => (
                      <button
                        key={em}
                        onClick={() => {
                          updateField(
                            "content",
                            (currentPost.content || "") + em
                          );
                          setShowEmojiPicker(false);
                        }}
                        className="hover:bg-slate-100 rounded text-xl"
                      >
                        {em}
                      </button>
                    ))}
                  </div>
                )}

                <div className="flex-1 flex flex-col space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase">
                    Message
                  </label>
                  <textarea
                    className="flex-1 w-full bg-slate-50 p-4 rounded-xl outline-none resize-none text-sm text-slate-700 font-medium focus:ring-2 focus:ring-indigo-500/10 transition leading-relaxed"
                    value={currentPost.content || ""}
                    onChange={(e) => updateField("content", e.target.value)}
                  />
                </div>

                {/* Lien & Programmation */}
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block flex items-center gap-1">
                      <LinkIcon size={12} /> Lien (Site web, Réservation)
                    </label>
                    <input
                      type="text"
                      placeholder="https://..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-600 outline-none"
                      value={currentPost.link_url || ""}
                      onChange={(e) => updateField("link_url", e.target.value)}
                    />
                  </div>
                </div>

                <div className="border-t pt-4 mt-auto">
                  <button
                    onClick={handleSave}
                    className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 flex justify-center items-center gap-2 shadow-lg mb-4"
                  >
                    <Save size={18} /> Sauvegarder
                  </button>
                  <div className="text-center">
                    <button
                      onClick={async () => {
                        if (window.confirm("Supprimer ?")) {
                          await supabase
                            .from("posts")
                            .delete()
                            .eq("id", currentPost.id);
                          window.location.reload();
                        }
                      }}
                      className="text-red-400 text-xs font-bold hover:underline"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // ACCUEIL (PROMPT)
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center gap-8 max-w-lg mx-auto w-full">
              <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mb-2">
                <Wand2 size={32} className="text-indigo-600" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-slate-900">
                  Quoi de neuf à {profile?.city || "votre boutique"} ?
                </h3>
                <p className="text-slate-500 text-sm">
                  Décrivez votre actualité. L'IA optimise le texte pour votre
                  ville.
                </p>
              </div>
              <div className="w-full relative">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Ex: Arrivée de la collection hiver, on est ouverts ce dimanche..."
                  className="w-full bg-white border-2 border-slate-200 rounded-2xl p-5 min-h-[120px] outline-none focus:border-indigo-500 text-slate-700 font-medium resize-none shadow-sm"
                />
              </div>
              <button
                onClick={handleSmartGenerate}
                disabled={!prompt.trim() || isLoadingAI}
                className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 transition disabled:opacity-50 shadow-xl flex items-center justify-center gap-2"
              >
                {isLoadingAI ? "Rédaction..." : "Générer le post"}
              </button>
            </div>
          )}
        </div>

        {/* HISTORIQUE (4/12) */}
        <div className="lg:col-span-4 bg-white rounded-[32px] border shadow-sm flex flex-col h-full overflow-hidden">
          <div className="p-4 border-b font-bold text-sm text-slate-900 bg-slate-50">
            Historique
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {sortedPosts.map((post) => (
              <div
                key={post.id}
                onClick={() => setCurrentPost(post)}
                className={`flex gap-3 p-2 rounded-xl border cursor-pointer transition ${
                  currentPost?.id === post.id
                    ? "bg-indigo-50 border-indigo-200"
                    : "bg-white border-slate-50 hover:bg-slate-50"
                }`}
              >
                <img
                  src={post.image_url}
                  className="w-14 h-14 rounded-lg object-cover bg-slate-200 shrink-0"
                  onError={(e) =>
                    (e.target.src = "https://placehold.co/100x100?text=IMG")
                  }
                  alt=""
                />
                <div className="overflow-hidden flex flex-col justify-center flex-1 min-w-0">
                  <div className="font-bold text-xs truncate text-slate-900">
                    {post.title || "Sans titre"}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5 truncate">
                    {new Date(post.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
