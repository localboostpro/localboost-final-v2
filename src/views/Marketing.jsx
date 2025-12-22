import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { generatePostContent } from "../lib/openai";
import canvasConfetti from "canvas-confetti";
import {
  Wand2,
  Instagram,
  Facebook,
  Linkedin,
  Trash2,
  Lock,
  ArrowRight,
  Sparkles,
  Save,
  RefreshCw,
  LayoutList,
  Calendar as CalendarIcon,
  Image as ImageIcon,
  Upload,
  ImageOff,
  ChevronLeft,
  ChevronRight,
  Copy,
  Pencil,
} from "lucide-react";

/* ---------------- CONSTANTES ---------------- */

const PLATFORMS = [
  { id: "Instagram", icon: <Instagram size={18} />, ratio: "aspect-square" },
  { id: "Facebook", icon: <Facebook size={18} />, ratio: "aspect-video" },
  { id: "Linkedin", icon: <Linkedin size={18} />, ratio: "aspect-video" },
];

const TONES = ["Professionnel", "Amical", "Drôle", "Urgent", "Luxe"];

const SUGGESTIONS = [
  "🎉 Promo Flash -20%",
  "🚀 Nouveau Produit",
  "📅 Événement Spécial",
  "👋 Coulisses / Équipe",
];

const isTempId = (v) => String(v || "").startsWith("temp_");

/* ---------------- COMPOSANT ---------------- */

export default function Marketing({ posts = [], profile, onUpdate }) {
  const { id } = useParams();
  const navigate = useNavigate();

  /* ---------- STATES ---------- */
  const [activeTab, setActiveTab] = useState("generator");
  const [historyView, setHistoryView] = useState("list");

  const [prompt, setPrompt] = useState("");
  const [tone, setTone] = useState("Amical");
  const [isLoading, setIsLoading] = useState(false);

  const [currentPost, setCurrentPost] = useState(null);

  const [selectedNetworks, setSelectedNetworks] = useState(["Instagram"]);
  const [previewNetwork, setPreviewNetwork] = useState("Instagram");

  const [imageMode, setImageMode] = useState("upload"); // upload | ai
  const [imagePrompt, setImagePrompt] = useState("");

  const [imageOverlay, setImageOverlay] = useState({
    text: "",
    color: "#FFFFFF",
    bg: "rgba(0,0,0,0.5)",
    position: "center",
  });

  /* ---------- BASIC PLAN ---------- */
  if (profile?.subscription_tier === "basic") {
    return (
      <div className="h-[calc(100vh-120px)] flex items-center justify-center bg-slate-900 rounded-[2rem] text-white">
        <div className="text-center max-w-md px-6">
          <Lock size={48} className="mx-auto mb-6 text-indigo-400" />
          <h2 className="text-3xl font-black mb-3">Studio Créatif IA</h2>
          <p className="text-slate-300 mb-6">
            Fonction réservée aux comptes Premium.
          </p>
          <button className="bg-indigo-600 px-6 py-3 rounded-xl font-bold inline-flex items-center gap-2">
            Passer Premium <ArrowRight size={18} />
          </button>
        </div>
      </div>
    );
  }

  /* ---------- SYNC URL → POST ---------- */
  useEffect(() => {
    if (!id) return;
    const found = posts.find((p) => String(p.id) === String(id));
    if (found) {
      setCurrentPost(found);
      setSelectedNetworks(found.networks || ["Instagram"]);
      setPreviewNetwork(found.networks?.[0] || "Instagram");
      setActiveTab("editor");
    }
  }, [id, posts]);

  /* ---------- UTILS ---------- */
  const getRatioFor = (networkId) =>
    PLATFORMS.find((p) => p.id === networkId)?.ratio || "aspect-square";

  const toggleNetwork = (networkId) => {
    setSelectedNetworks((prev) =>
      prev.includes(networkId)
        ? prev.filter((n) => n !== networkId)
        : [...prev, networkId]
    );
  };

  /* ---------- IMAGE UPLOAD (SUPABASE) ---------- */
  const handleImageUpload = async (file) => {
    if (!file || !profile?.id) return;

    try {
      const ext = file.name.split(".").pop();
      const fileName = `${profile.id}/${Date.now()}.${ext}`;

      const { error } = await supabase.storage
        .from("post_images")
        .upload(fileName, file, { upsert: false });

      if (error) throw error;

      const { data } = supabase.storage
        .from("post_images")
        .getPublicUrl(fileName);

      setCurrentPost((prev) => ({
        ...prev,
        image_url: data.publicUrl,
      }));
    } catch (e) {
      alert("Erreur upload image");
      console.error(e);
    }
  };

  /* ---------- IMAGE IA (POLLINATIONS) ---------- */
  const handleGenerateImageAI = () => {
    if (!imagePrompt) return alert("Décris l’image à générer");

    const ratio =
      previewNetwork === "Instagram" ? "1080x1080" : "1200x630";

    const finalPrompt = `
      ${imagePrompt},
      professional photography,
      studio lighting,
      high detail,
      sharp focus,
      no text,
      no watermark
    `;

    const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(
      finalPrompt
    )}?width=${ratio.split("x")[0]}&height=${
      ratio.split("x")[1]
    }&nologo=true&seed=${Date.now()}`;

    setCurrentPost((prev) => ({
      ...prev,
      image_url: url,
    }));
  };

  /* ---------- IA TEXTE ---------- */
  const handleGenerate = async () => {
    if (!prompt.trim()) return alert("Décris ton post.");
    setIsLoading(true);

    try {
      const ai = await generatePostContent(prompt, profile);

      setCurrentPost({
        id: `temp_${Date.now()}`,
        business_id: profile.id,
        title: ai.title || "Nouveau post",
        content: ai.content || "",
        image_url: "",
        networks: selectedNetworks,
        created_at: new Date().toISOString(),
        status: "draft",
      });

      setActiveTab("editor");
    } catch {
      alert("Erreur génération texte");
    } finally {
      setIsLoading(false);
    }
  };

  /* ---------- SAVE / UPDATE ---------- */
  const handleSave = async () => {
    if (!currentPost || !profile?.id) return;

    const payload = {
      ...currentPost,
      business_id: profile.id,
      networks: selectedNetworks,
    };

    try {
      if (isTempId(currentPost.id)) {
        const { data } = await supabase
          .from("posts")
          .insert([payload])
          .select()
          .single();

        onUpdate?.(data);
        navigate(`/marketing/${data.id}`);
      } else {
        const { data } = await supabase
          .from("posts")
          .update(payload)
          .eq("id", currentPost.id)
          .select()
          .single();

        onUpdate?.(data);
      }

      canvasConfetti();
      alert("Post enregistré");
    } catch (e) {
      alert("Erreur sauvegarde");
    }
  };

  /* ---------------- RENDER ---------------- */

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-120px)] pb-4">

      {/* -------- COLONNE GAUCHE -------- */}
      <div className="flex-1 flex flex-col gap-4 overflow-hidden">

        {/* HEADER */}
        <div className="bg-white p-4 rounded-[2rem] border shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-black flex items-center gap-2">
              <Wand2 className="text-indigo-600" /> Studio Marketing
            </h2>
          </div>

          <div className="flex p-1 bg-slate-100 rounded-xl">
            <button onClick={() => setActiveTab("generator")} className={`flex-1 py-2 rounded-lg text-xs font-bold ${activeTab === "generator" ? "bg-white shadow text-indigo-600" : "text-slate-500"}`}>
              IA
            </button>
            <button onClick={() => setActiveTab("editor")} className={`flex-1 py-2 rounded-lg text-xs font-bold ${activeTab === "editor" ? "bg-white shadow text-indigo-600" : "text-slate-500"}`}>
              Édition
            </button>
            <button onClick={() => setActiveTab("history")} className={`flex-1 py-2 rounded-lg text-xs font-bold ${activeTab === "history" ? "bg-white shadow text-indigo-600" : "text-slate-500"}`}>
              Historique
            </button>
          </div>
        </div>

        {/* CONTENU */}
        <div className="flex-1 overflow-y-auto pr-2">

          {/* IA TEXTE */}
          {activeTab === "generator" && (
            <div className="bg-white p-6 rounded-[2rem] border space-y-4">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Sujet du post…"
                className="w-full h-28 p-4 bg-slate-50 border rounded-xl"
              />
              <button onClick={handleGenerate} disabled={isLoading} className="w-full py-4 bg-indigo-600 text-white rounded-xl font-black">
                {isLoading ? "Génération…" : "Générer le texte"}
              </button>
            </div>
          )}

          {/* ÉDITION */}
          {activeTab === "editor" && currentPost && (
            <div className="bg-white p-6 rounded-[2rem] border space-y-6">

              {/* MODE IMAGE */}
              <div className="flex bg-slate-100 rounded-xl p-1 w-fit">
                <button onClick={() => setImageMode("upload")} className={`px-4 py-2 rounded-lg text-xs font-bold ${imageMode === "upload" ? "bg-white shadow text-indigo-600" : "text-slate-500"}`}>
                  📤 Image client
                </button>
                <button onClick={() => setImageMode("ai")} className={`px-4 py-2 rounded-lg text-xs font-bold ${imageMode === "ai" ? "bg-white shadow text-indigo-600" : "text-slate-500"}`}>
                  🤖 Image IA
                </button>
              </div>

              {/* IMAGE CLIENT */}
              {imageMode === "upload" && (
                <label className="cursor-pointer block">
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e.target.files[0])} />
                  <div className="p-4 border-2 border-dashed rounded-xl text-center text-slate-500 hover:border-indigo-400">
                    <Upload size={18} /> Importer une image
                  </div>
                </label>
              )}

              {/* IMAGE IA */}
              {imageMode === "ai" && (
                <>
                  <textarea
                    value={imagePrompt}
                    onChange={(e) => setImagePrompt(e.target.value)}
                    placeholder="Décris l’image à générer…"
                    className="w-full h-24 p-3 bg-slate-50 border rounded-xl"
                  />
                  <button onClick={handleGenerateImageAI} className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold">
                    Générer l’image IA
                  </button>
                </>
              )}

              {/* SAVE */}
              <button onClick={handleSave} className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold">
                <Save size={16} /> Enregistrer le post
              </button>
            </div>
          )}
        </div>
      </div>

      {/* -------- APERÇU -------- */}
      <div className="w-full lg:w-[420px] h-full">
        <div className="bg-white h-full rounded-[2rem] border p-4">
          {currentPost?.image_url ? (
            <img src={currentPost.image_url} className={`w-full ${getRatioFor(previewNetwork)} object-cover rounded-xl`} alt="" />
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400">
              Aucune image
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
