import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { generatePostContent } from "../lib/openai";
import canvasConfetti from "canvas-confetti";
import {
  Wand2, Instagram, Facebook, Linkedin,
  Trash2, Lock, ArrowRight, Sparkles,
  Save, RefreshCw, LayoutList,
  Calendar as CalendarIcon,
  Image as ImageIcon,
  ChevronLeft, ChevronRight
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

/* ---------------- COMPOSANT ---------------- */

export default function Marketing({ posts = [], profile, onUpdate }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("generator");
  const [historyView, setHistoryView] = useState("list");

  const [currentPost, setCurrentPost] = useState(null);
  const [prompt, setPrompt] = useState("");
  const [activeNetwork, setActiveNetwork] = useState("Instagram");
  const [style, setStyle] = useState("Amical");
  const [isLoading, setIsLoading] = useState(false);

  const [imageOverlay, setImageOverlay] = useState({
    text: "",
    color: "#FFFFFF",
    bg: "rgba(0,0,0,0.5)",
    position: "center",
  });

  /* ---------- SYNC URL → POST ---------- */
  useEffect(() => {
    if (!id || !posts.length) return;
    const found = posts.find((p) => String(p.id) === String(id));
    if (found) {
      setCurrentPost(found);
      setPrompt(found.content || "");
      setActiveTab("generator");
    }
  }, [id, posts]);

  /* ---------- BASIC PLAN ---------- */
  if (profile?.subscription_tier === "basic") {
    return (
      <div className="h-[calc(100vh-120px)] flex items-center justify-center bg-slate-900 rounded-[2rem] text-white">
        <div className="text-center">
          <Lock size={48} className="mx-auto mb-6 text-indigo-400" />
          <h2 className="text-3xl font-black mb-3">Studio Créatif IA</h2>
          <p className="text-slate-300 mb-6">Réservé aux comptes Premium</p>
        </div>
      </div>
    );
  }

  /* ---------- UTILS ---------- */

  const getCurrentRatio = () => {
    const p = PLATFORMS.find((x) => x.id === activeNetwork);
    return p ? p.ratio : "aspect-square";
  };

  /* ---------- ACTIONS ---------- */

  const handleGenerate = async () => {
    if (!prompt) return alert("Décrivez votre post.");
    setIsLoading(true);

    try {
      const ai = await generatePostContent(prompt, profile);

      const img = `https://image.pollinations.ai/prompt/${encodeURIComponent(
        ai.image_keyword || prompt
      )}?width=1080&height=1080&nologo=true`;

      setCurrentPost({
        id: Date.now(),
        title: ai.title || "Nouveau post",
        content: ai.content,
        image_url: img,
        networks: [activeNetwork],
        created_at: new Date().toISOString(),
        status: "draft",
        image_overlay: imageOverlay,
      });
    } catch {
      alert("Erreur IA");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!currentPost || !profile?.id) return;

    const { id, ...data } = currentPost;
    data.business_id = profile.id;

    const { data: saved, error } = await supabase
      .from("posts")
      .insert([data])
      .select();

    if (!error) {
      onUpdate?.(saved[0]);
      canvasConfetti();
      navigate(`/marketing/${saved[0].id}`);
    }
  };

  const handleDelete = async (postId) => {
    if (!confirm("Supprimer ce post ?")) return;
    await supabase.from("posts").delete().eq("id", postId);
    navigate("/marketing");
    setCurrentPost(null);
  };

  /* ---------- CALENDAR ---------- */
  const renderCalendar = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    return (
      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1;
          const dayPosts = posts.filter((p) => {
            const d = new Date(p.created_at);
            return d.getDate() === day && d.getMonth() === month;
          });

          return (
            <div
              key={day}
              className={`aspect-square border rounded-xl p-1 cursor-pointer ${
                dayPosts.length ? "bg-indigo-50 border-indigo-200" : "bg-white"
              }`}
            >
              <div className="text-[10px] text-center font-bold">{day}</div>
              <div className="flex flex-wrap gap-1 justify-center mt-1">
                {dayPosts.map((p) => (
                  <span
                    key={p.id}
                    onClick={() => navigate(`/marketing/${p.id}`)}
                    className="w-2 h-2 rounded-full bg-indigo-600"
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  /* ---------------- RENDER ---------------- */

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-120px)] pb-4">

      {/* -------- COLONNE GAUCHE -------- */}
      <div className="flex-1 flex flex-col gap-4 overflow-hidden">

        {/* HEADER */}
        <div className="bg-white p-4 rounded-[2rem] border shadow-sm">
          <div className="flex justify-between mb-3">
            <h2 className="font-black text-xl flex items-center gap-2">
              <Wand2 className="text-indigo-600" /> Studio Créatif
            </h2>
          </div>

          <div className="flex p-1 bg-slate-100 rounded-xl">
            {["generator", "editor", "history"].map((t) => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={`flex-1 py-2 rounded-lg text-xs font-bold ${
                  activeTab === t
                    ? "bg-white shadow text-indigo-600"
                    : "text-slate-500"
                }`}
              >
                {t === "generator" && "IA"}
                {t === "editor" && "Visuel"}
                {t === "history" && "Historique"}
              </button>
            ))}
          </div>
        </div>

        {/* CONTENU */}
        <div className="flex-1 overflow-y-auto pr-2">

          {activeTab === "generator" && (
            <div className="bg-white p-6 rounded-[2rem] border space-y-6">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full h-28 p-4 bg-slate-50 border rounded-xl"
                placeholder="Sujet du post"
              />
              <button
                onClick={handleGenerate}
                disabled={isLoading}
                className="w-full py-4 bg-indigo-600 text-white rounded-xl font-black"
              >
                {isLoading ? "Génération…" : "Générer le post"}
              </button>
            </div>
          )}

          {activeTab === "history" && (
            <div className="bg-white p-6 rounded-[2rem] border space-y-4">
              <div className="flex justify-between">
                <h3 className="font-bold">Historique</h3>
                <div className="flex bg-slate-100 rounded-lg p-1">
                  <button onClick={() => setHistoryView("list")} className="p-1">
                    <LayoutList size={14} />
                  </button>
                  <button onClick={() => setHistoryView("calendar")} className="p-1">
                    <CalendarIcon size={14} />
                  </button>
                </div>
              </div>

              {historyView === "calendar"
                ? renderCalendar()
                : posts.map((p) => (
                    <div
                      key={p.id}
                      className="flex gap-3 p-3 rounded-xl hover:bg-slate-50 cursor-pointer"
                      onClick={() => navigate(`/marketing/${p.id}`)}
                    >
                      <img src={p.image_url} className="w-14 h-14 rounded-lg object-cover" />
                      <div className="flex-1">
                        <div className="font-bold truncate">{p.title}</div>
                        <div className="text-xs text-slate-500">
                          {new Date(p.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      <Trash2
                        size={14}
                        className="text-rose-400"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(p.id);
                        }}
                      />
                    </div>
                  ))}
            </div>
          )}
        </div>
      </div>

      {/* -------- APERÇU -------- */}
      <div className="w-full lg:w-[420px] h-full">
        <div className="bg-white h-full rounded-[2rem] border p-4">
          {currentPost ? (
            <>
              <img
                src={currentPost.image_url}
                className={`w-full ${getCurrentRatio()} object-cover rounded-xl`}
              />
              <p className="mt-4 whitespace-pre-wrap">{currentPost.content}</p>
              <button
                onClick={handleSave}
                className="mt-6 w-full py-3 bg-slate-900 text-white rounded-xl font-bold"
              >
                <Save size={16} /> Enregistrer
              </button>
            </>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400">
              Sélectionnez ou créez un post
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
