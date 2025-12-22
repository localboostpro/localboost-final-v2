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

const safeDate = (v) => {
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
};

const toDateTimeLocalValue = (iso) => {
  const d = safeDate(iso);
  if (!d) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
};

const fromDateTimeLocalValue = (v) => {
  if (!v) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
};

/* ---------------- COMPOSANT ---------------- */

export default function Marketing({ posts = [], profile, onUpdate }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("generator"); // generator | editor | history
  const [historyView, setHistoryView] = useState("list"); // list | calendar

  const [prompt, setPrompt] = useState("");
  const [tone, setTone] = useState("Amical");
  const [isLoading, setIsLoading] = useState(false);

  // Réseaux sélectionnés (multi)
  const [selectedNetworks, setSelectedNetworks] = useState(["Instagram"]);
  // Réseau d’aperçu (pour ratio / libellé)
  const [previewNetwork, setPreviewNetwork] = useState("Instagram");

  // Post en cours (édition/preview)
  const [currentPost, setCurrentPost] = useState(null);

  // Overlay simple (conservé, pas destructif)
  const [imageOverlay, setImageOverlay] = useState({
    text: "",
    color: "#FFFFFF",
    bg: "rgba(0,0,0,0.5)",
    position: "center", // top|center|bottom
  });

  // Mois calendrier
  const [calCursor, setCalCursor] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
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
      // mettre l’overlay si présent
      if (found.image_overlay && typeof found.image_overlay === "object") {
        setImageOverlay((prev) => ({ ...prev, ...found.image_overlay }));
      }
      // réseaux
      const nets =
        Array.isArray(found.networks) && found.networks.length
          ? found.networks
          : ["Instagram"];
      setSelectedNetworks(nets);
      setPreviewNetwork(nets[0] || "Instagram");
      setActiveTab("editor");
    }
  }, [id, posts]);

  /* ---------- AUTO “PUBLISH” des programmés ---------- */
  useEffect(() => {
    const now = Date.now();
    const due = posts.filter((p) => {
      if (p?.status !== "scheduled") return false;
      const d = safeDate(p.created_at);
      return d && d.getTime() <= now;
    });

    if (!due.length) return;

    // best-effort : on met "published" pour ceux qui sont arrivés à échéance
    (async () => {
      try {
        const ids = due.map((p) => p.id).filter(Boolean);
        if (!ids.length) return;
        await supabase.from("posts").update({ status: "published" }).in("id", ids);
        // Optionnel : prévenir le parent
        // (le parent refetch ou tu relies via realtime; ici on reste non-invasif)
      } catch {
        // silencieux : pas bloquant
      }
    })();
  }, [posts]);

  /* ---------- UTILS ---------- */
  const getRatioFor = (networkId) => {
    const p = PLATFORMS.find((x) => x.id === networkId);
    return p ? p.ratio : "aspect-square";
  };

  const toggleNetwork = (networkId) => {
    setSelectedNetworks((prev) => {
      const has = prev.includes(networkId);
      const next = has ? prev.filter((x) => x !== networkId) : [...prev, networkId];
      // toujours au moins un réseau
      const safe = next.length ? next : ["Instagram"];
      // garder previewNetwork cohérent
      if (!safe.includes(previewNetwork)) setPreviewNetwork(safe[0]);
      return safe;
    });
  };

  const isPersisted = useMemo(() => {
    if (!currentPost?.id) return false;
    if (isTempId(currentPost.id)) return false;
    // si l’id existe dans posts → c’est un enregistrement DB
    return posts.some((p) => String(p.id) === String(currentPost.id));
  }, [currentPost, posts]);

  /* ---------- ACTIONS : GENERATE ---------- */
  const handleGenerate = async () => {
    if (!prompt.trim()) return alert("Décrivez votre post.");
    setIsLoading(true);

    try {
      const ai = await generatePostContent(prompt, profile);

      const img = `https://image.pollinations.ai/prompt/${encodeURIComponent(
        ai?.image_keyword || prompt
      )}?width=1080&height=1080&nologo=true`;

      const tempPost = {
        id: `temp_${Date.now()}`,
        business_id: profile?.id,
        title: ai?.title || "Nouveau post",
        content: ai?.content || "",
        image_url: img,
        networks: selectedNetworks,
        created_at: new Date().toISOString(),
        status: "draft",
        image_overlay: imageOverlay,
      };

      setCurrentPost(tempPost);
      setActiveTab("editor");
    } catch (e) {
      alert("Erreur IA");
    } finally {
      setIsLoading(false);
    }
  };

  /* ---------- ACTIONS : SAVE / UPDATE ---------- */
  const persistPostPayload = () => {
    if (!currentPost) return null;

    const payload = {
      business_id: profile?.id,
      title: currentPost.title || "Sans titre",
      content: currentPost.content || "",
      image_url: currentPost.image_url || "",
      networks: selectedNetworks,
      status: currentPost.status || "draft",
      image_overlay: imageOverlay,
      // created_at sert de date de planification si status=scheduled (pas de nouvelle colonne)
      created_at: currentPost.created_at || new Date().toISOString(),
    };

    return payload;
  };

  const handleSaveOrUpdate = async () => {
    if (!currentPost || !profile?.id) return;

    const payload = persistPostPayload();
    if (!payload) return;

    try {
      if (isPersisted) {
        const { data, error } = await supabase
          .from("posts")
          .update(payload)
          .eq("id", currentPost.id)
          .select()
          .maybeSingle();

        if (error) throw error;
        if (data) {
          onUpdate?.(data);
          setCurrentPost(data);
          canvasConfetti({ particleCount: 80, spread: 70, origin: { y: 0.7 } });
          alert("✅ Post mis à jour");
        }
      } else {
        const { data, error } = await supabase
          .from("posts")
          .insert([payload])
          .select()
          .maybeSingle();

        if (error) throw error;
        if (data) {
          onUpdate?.(data);
          setCurrentPost(data);
          canvasConfetti({ particleCount: 100, spread: 70, origin: { y: 0.7 } });
          // route vers l’id DB
          navigate(`/marketing/${data.id}`);
        }
      }
    } catch (e) {
      alert(`Erreur sauvegarde : ${e?.message || "inconnue"}`);
    }
  };

  /* ---------- ACTIONS : DELETE ---------- */
  const handleDelete = async (postId) => {
    if (!postId) return;
    if (!confirm("Supprimer ce post ?")) return;

    try {
      // temp → juste nettoyer
      if (isTempId(postId)) {
        setCurrentPost(null);
        navigate("/marketing");
        return;
      }

      const { error } = await supabase.from("posts").delete().eq("id", postId);
      if (error) throw error;

      onUpdate?.({ id: postId, _deleted: true });
      if (String(id) === String(postId)) navigate("/marketing");
      setCurrentPost(null);
    } catch (e) {
      alert(`Erreur suppression : ${e?.message || "inconnue"}`);
    }
  };

  /* ---------- ACTIONS : DUPLICATE ---------- */
  const handleDuplicate = () => {
    if (!currentPost) return;

    const copy = {
      ...currentPost,
      id: `temp_${Date.now()}`,
      title: (currentPost.title || "Post") + " (copie)",
      status: "draft",
      created_at: new Date().toISOString(),
    };

    setCurrentPost(copy);
    setActiveTab("editor");
    navigate("/marketing");
  };

  /* ---------- PLANIFICATION (C) ---------- */
  const setSchedule = (dtLocalValue) => {
    const iso = fromDateTimeLocalValue(dtLocalValue);
    if (!iso) {
      // on retire la planif : on repasse en draft si scheduled
      setCurrentPost((prev) => {
        if (!prev) return prev;
        const next = { ...prev };
        if (next.status === "scheduled") next.status = "draft";
        // si on retire, on remet created_at "maintenant" pour éviter dates futures
        next.created_at = new Date().toISOString();
        return next;
      });
      return;
    }

    setCurrentPost((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        status: "scheduled",
        created_at: iso, // on stocke la date planifiée dans created_at
      };
    });
  };

  /* ---------- CALENDRIER (C) ---------- */
  const calendarLabel = useMemo(() => {
    return calCursor.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
  }, [calCursor]);

  const calendarDays = useMemo(() => {
    const y = calCursor.getFullYear();
    const m = calCursor.getMonth();
    const firstDay = new Date(y, m, 1).getDay(); // 0..6 (dim..sam)
    const startOffset = firstDay === 0 ? 6 : firstDay - 1; // lundi=0
    const daysInMonth = new Date(y, m + 1, 0).getDate();

    const slots = [];
    for (let i = 0; i < startOffset; i++) slots.push(null);
    for (let d = 1; d <= daysInMonth; d++) slots.push(d);
    return { y, m, slots };
  }, [calCursor]);

  const postsForDay = (day, y, m) => {
    return posts.filter((p) => {
      const d = safeDate(p.created_at);
      if (!d) return false;
      return d.getFullYear() === y && d.getMonth() === m && d.getDate() === day;
    });
  };

  /* ---------- UI HELPERS ---------- */
  const currentPreviewRatio = getRatioFor(previewNetwork);

  const statusBadge = (p) => {
    const st = p?.status || "draft";
    if (st === "published") return "bg-emerald-50 text-emerald-700 border-emerald-100";
    if (st === "scheduled") return "bg-amber-50 text-amber-700 border-amber-100";
    return "bg-slate-50 text-slate-600 border-slate-200";
  };

  /* ---------------- RENDER ---------------- */

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-120px)] pb-4">
      {/* -------- COLONNE GAUCHE -------- */}
      <div className="flex-1 flex flex-col gap-4 overflow-hidden">
        {/* HEADER */}
        <div className="bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm shrink-0">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <Wand2 className="text-indigo-600" /> Studio Marketing
            </h2>
            {currentPost?.id && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDuplicate}
                  className="text-xs font-bold text-slate-500 hover:text-indigo-600 flex items-center gap-1"
                  title="Dupliquer"
                >
                  <Copy size={14} /> Dupliquer
                </button>
                <button
                  onClick={() => handleDelete(currentPost.id)}
                  className="text-xs font-bold text-rose-500 hover:underline flex items-center gap-1"
                  title="Supprimer"
                >
                  <Trash2 size={14} /> Supprimer
                </button>
              </div>
            )}
          </div>

          <div className="flex p-1 bg-slate-100 rounded-xl">
            <button
              onClick={() => setActiveTab("generator")}
              className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition ${
                activeTab === "generator"
                  ? "bg-white shadow-sm text-indigo-600"
                  : "text-slate-500"
              }`}
            >
              <Sparkles size={14} /> IA
            </button>
            <button
              onClick={() => setActiveTab("editor")}
              className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition ${
                activeTab === "editor"
                  ? "bg-white shadow-sm text-indigo-600"
                  : "text-slate-500"
              }`}
            >
              <Pencil size={14} /> Édition
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition ${
                activeTab === "history"
                  ? "bg-white shadow-sm text-indigo-600"
                  : "text-slate-500"
              }`}
            >
              <CalendarIcon size={14} /> Historique
            </button>
          </div>
        </div>

        {/* CONTENU SCROLL */}
        <div className="flex-1 overflow-y-auto pr-2">
          {/* ---------------- ONGLET IA ---------------- */}
          {activeTab === "generator" && (
            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-6">
              {/* Réseaux (multi) */}
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 block">
                  Réseaux (multi)
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {PLATFORMS.map((plat) => {
                    const active = selectedNetworks.includes(plat.id);
                    return (
                      <button
                        key={plat.id}
                        onClick={() => toggleNetwork(plat.id)}
                        className={`flex flex-col items-center justify-center gap-2 py-3 rounded-2xl border-2 transition-all duration-200 ${
                          active
                            ? "bg-indigo-50 border-indigo-200 text-indigo-700 ring-2 ring-offset-2 ring-indigo-100"
                            : "bg-white border-slate-100 text-slate-400 hover:border-slate-200"
                        }`}
                      >
                        {plat.icon}
                        <span className="text-xs font-bold">{plat.id}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Réseau d’aperçu */}
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">
                    Aperçu :
                  </span>
                  <div className="flex gap-2">
                    {selectedNetworks.map((n) => (
                      <button
                        key={n}
                        onClick={() => setPreviewNetwork(n)}
                        className={`px-3 py-1 rounded-lg text-[10px] font-bold border ${
                          previewNetwork === n
                            ? "bg-slate-900 text-white border-slate-900"
                            : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Ton */}
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 block">
                  Ton
                </label>
                <div className="flex flex-wrap gap-2">
                  {TONES.map((t) => (
                    <button
                      key={t}
                      onClick={() => setTone(t)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                        tone === t
                          ? "bg-slate-900 text-white border-slate-900 shadow-md"
                          : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sujet */}
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">
                  Sujet
                </label>
                <div className="flex gap-2 overflow-x-auto pb-2 mb-2">
                  {SUGGESTIONS.map((sug) => (
                    <button
                      key={sug}
                      onClick={() => setPrompt(sug)}
                      className="whitespace-nowrap px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-bold border border-indigo-100 hover:bg-indigo-100 transition"
                    >
                      {sug}
                    </button>
                  ))}
                </div>

                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Ex: Promo sur les burgers ce week-end..."
                  className="w-full h-28 p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500 transition resize-none"
                />
              </div>

              <button
                onClick={handleGenerate}
                disabled={isLoading}
                className="w-full py-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-2xl font-black text-lg shadow-xl shadow-indigo-200 hover:shadow-indigo-300 transition-all flex items-center justify-center gap-3"
              >
                {isLoading ? <RefreshCw size={24} className="animate-spin" /> : <Wand2 size={24} />}
                {isLoading ? "Génération…" : "Générer le post"}
              </button>
            </div>
          )}

          {/* ---------------- ONGLET ÉDITION (B + C + D) ---------------- */}
          {activeTab === "editor" && (
            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-6">
              {!currentPost ? (
                <div className="text-center text-slate-400 text-sm py-10">
                  Sélectionne un post dans l’historique ou génère-en un.
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-[10px] font-bold text-slate-400 uppercase">
                        Statut
                      </div>
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full border text-[11px] font-black mt-1 ${statusBadge(
                          currentPost
                        )}`}
                      >
                        {(currentPost.status || "draft").toUpperCase()}
                      </span>
                    </div>

                    <button
                      onClick={handleSaveOrUpdate}
                      className="px-4 py-2 rounded-xl bg-slate-900 text-white font-black text-sm inline-flex items-center gap-2 hover:bg-indigo-600 transition"
                    >
                      <Save size={16} />
                      {isPersisted ? "Mettre à jour" : "Enregistrer"}
                    </button>
                  </div>

                  {/* Titre */}
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">
                      Titre
                    </label>
                    <input
                      value={currentPost.title || ""}
                      onChange={(e) =>
                        setCurrentPost((prev) => ({ ...prev, title: e.target.value }))
                      }
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Titre du post"
                    />
                  </div>

                  {/* Contenu */}
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">
                      Contenu
                    </label>
                    <textarea
                      value={currentPost.content || ""}
                      onChange={(e) =>
                        setCurrentPost((prev) => ({ ...prev, content: e.target.value }))
                      }
                      className="w-full h-40 p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                      placeholder="Texte de la publication..."
                    />
                  </div>

                  {/* Image URL */}
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">
                      Image URL
                    </label>
                    <input
                      value={currentPost.image_url || ""}
                      onChange={(e) =>
                        setCurrentPost((prev) => ({ ...prev, image_url: e.target.value }))
                      }
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="https://..."
                    />
                  </div>

                  {/* Réseaux (multi) */}
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 block">
                      Réseaux ciblés (multi)
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {PLATFORMS.map((plat) => {
                        const active = selectedNetworks.includes(plat.id);
                        return (
                          <button
                            key={plat.id}
                            onClick={() => toggleNetwork(plat.id)}
                            className={`flex flex-col items-center justify-center gap-2 py-3 rounded-2xl border-2 transition-all duration-200 ${
                              active
                                ? "bg-indigo-50 border-indigo-200 text-indigo-700 ring-2 ring-offset-2 ring-indigo-100"
                                : "bg-white border-slate-100 text-slate-400 hover:border-slate-200"
                            }`}
                          >
                            {plat.icon}
                            <span className="text-xs font-bold">{plat.id}</span>
                          </button>
                        );
                      })}
                    </div>

                    <div className="mt-3 flex items-center gap-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">
                        Aperçu :
                      </span>
                      <div className="flex gap-2 flex-wrap">
                        {selectedNetworks.map((n) => (
                          <button
                            key={n}
                            onClick={() => setPreviewNetwork(n)}
                            className={`px-3 py-1 rounded-lg text-[10px] font-bold border ${
                              previewNetwork === n
                                ? "bg-slate-900 text-white border-slate-900"
                                : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
                            }`}
                          >
                            {n}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Planification (C) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">
                        Planifier (optionnel)
                      </label>
                      <input
                        type="datetime-local"
                        value={toDateTimeLocalValue(
                          currentPost.status === "scheduled" ? currentPost.created_at : ""
                        )}
                        onChange={(e) => setSchedule(e.target.value)}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <div className="text-[11px] text-slate-400 mt-2">
                        Si renseigné : statut <b>scheduled</b> et affichage dans le calendrier.
                      </div>
                    </div>

                    {/* Overlay simple */}
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">
                        Texte sur l’image
                      </label>
                      <input
                        value={imageOverlay.text}
                        onChange={(e) =>
                          setImageOverlay((prev) => ({ ...prev, text: e.target.value }))
                        }
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Ex: -20% ce week-end"
                      />

                      <div className="mt-3 flex items-center gap-2">
                        {["top", "center", "bottom"].map((pos) => (
                          <button
                            key={pos}
                            onClick={() => setImageOverlay((prev) => ({ ...prev, position: pos }))}
                            className={`px-3 py-1 rounded-lg text-[10px] font-bold border ${
                              imageOverlay.position === pos
                                ? "bg-slate-900 text-white border-slate-900"
                                : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
                            }`}
                          >
                            {pos === "top" ? "Haut" : pos === "center" ? "Milieu" : "Bas"}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ---------------- ONGLET HISTORIQUE (B + C) ---------------- */}
          {activeTab === "history" && (
            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-black text-slate-900">Historique</h3>
                <div className="flex bg-slate-100 rounded-lg p-1">
                  <button
                    onClick={() => setHistoryView("list")}
                    className={`p-1.5 rounded ${historyView === "list" ? "bg-white shadow" : "text-slate-400"}`}
                    title="Liste"
                  >
                    <LayoutList size={14} />
                  </button>
                  <button
                    onClick={() => setHistoryView("calendar")}
                    className={`p-1.5 rounded ${historyView === "calendar" ? "bg-white shadow" : "text-slate-400"}`}
                    title="Calendrier"
                  >
                    <CalendarIcon size={14} />
                  </button>
                </div>
              </div>

              {historyView === "calendar" ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center px-1">
                    <h4 className="font-bold text-slate-900 capitalize">{calendarLabel}</h4>
                    <div className="flex gap-1">
                      <button
                        className="p-1 hover:bg-slate-100 rounded"
                        onClick={() =>
                          setCalCursor((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1))
                        }
                      >
                        <ChevronLeft size={16} />
                      </button>
                      <button
                        className="p-1 hover:bg-slate-100 rounded"
                        onClick={() =>
                          setCalCursor((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1))
                        }
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-7 gap-2 text-center mb-1">
                    {["L", "M", "M", "J", "V", "S", "D"].map((d) => (
                      <div key={d} className="text-[10px] font-bold text-slate-400">
                        {d}
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-7 gap-2">
                    {calendarDays.slots.map((day, idx) => {
                      if (!day) return <div key={idx} />;
                      const list = postsForDay(day, calendarDays.y, calendarDays.m);

                      return (
                        <div
                          key={idx}
                          className={`aspect-square rounded-xl border flex flex-col items-center justify-start pt-1 relative hover:border-indigo-300 transition ${
                            list.length ? "bg-indigo-50 border-indigo-200" : "bg-white border-slate-100"
                          }`}
                        >
                          <span className={`text-[10px] font-bold ${list.length ? "text-indigo-600" : "text-slate-400"}`}>
                            {day}
                          </span>

                          <div className="flex gap-0.5 mt-1 flex-wrap justify-center px-1">
                            {list.slice(0, 6).map((p) => (
                              <button
                                key={p.id}
                                onClick={() => navigate(`/marketing/${p.id}`)}
                                className="w-1.5 h-1.5 rounded-full bg-indigo-500"
                                title={p.title || "Post"}
                              />
                            ))}
                          </div>

                          {list.length > 6 && (
                            <div className="text-[9px] font-bold text-indigo-600 mt-0.5">
                              +{list.length - 6}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {posts.length === 0 ? (
                    <p className="text-center text-slate-400 text-xs py-8">Aucun post.</p>
                  ) : (
                    posts.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => navigate(`/marketing/${p.id}`)}
                        className="flex gap-3 p-3 rounded-xl hover:bg-slate-50 cursor-pointer border border-transparent hover:border-slate-100 transition items-center"
                      >
                        <img
                          src={p.image_url}
                          className="w-14 h-14 rounded-lg object-cover bg-slate-100"
                          alt=""
                        />
                        <div className="flex-1 overflow-hidden">
                          <div className="flex items-center gap-2">
                            <div className="font-bold text-sm truncate">
                              {p.title || "Sans titre"}
                            </div>
                            <span className={`px-2 py-0.5 rounded-full border text-[10px] font-black ${statusBadge(p)}`}>
                              {(p.status || "draft").toUpperCase()}
                            </span>
                          </div>
                          <div className="text-xs text-slate-500 truncate">
                            {p.created_at ? new Date(p.created_at).toLocaleString() : "Date inconnue"} •{" "}
                            {(Array.isArray(p.networks) && p.networks.join(", ")) || "Réseau"}
                          </div>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(p.id);
                          }}
                          className="p-2 rounded-lg hover:bg-rose-50 text-rose-500"
                          title="Supprimer"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* -------- COLONNE DROITE : APERÇU (D) -------- */}
      <div className="w-full lg:w-[420px] shrink-0 h-full flex flex-col">
        <div className="bg-white h-full rounded-[2rem] border border-slate-100 p-4 overflow-hidden">
          {!currentPost ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-slate-50 rounded-2xl">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                <Sparkles size={28} className="text-indigo-400" />
              </div>
              <div className="font-black text-slate-700 mb-2">Prêt à créer ?</div>
              <div className="text-xs text-slate-400">
                Génère un post, ou sélectionne-en un dans l’historique.
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs font-black text-slate-700">
                  Aperçu <span className="text-indigo-600">{previewNetwork}</span>
                </div>
                <div className="text-[10px] text-slate-400 font-bold">
                  Ratio: {currentPreviewRatio}
                </div>
              </div>

              <div className={`w-full ${currentPreviewRatio} bg-slate-100 rounded-2xl overflow-hidden relative`}>
                <img
                  src={currentPost.image_url}
                  className="w-full h-full object-cover"
                  alt="Aperçu"
                />

                {imageOverlay.text ? (
                  <div
                    className="absolute w-full text-center p-4"
                    style={{
                      color: imageOverlay.color,
                      backgroundColor: imageOverlay.bg,
                      bottom: imageOverlay.position === "bottom" ? 0 : "auto",
                      top:
                        imageOverlay.position === "top"
                          ? 0
                          : imageOverlay.position === "center"
                          ? "50%"
                          : "auto",
                      transform: imageOverlay.position === "center" ? "translateY(-50%)" : "none",
                    }}
                  >
                    <span className="font-black text-lg uppercase tracking-wider drop-shadow-md">
                      {imageOverlay.text}
                    </span>
                  </div>
                ) : null}
              </div>

              <div className="mt-4 flex-1 overflow-y-auto">
                <div className="font-black text-slate-900">{currentPost.title}</div>
                <div className="mt-2 text-sm text-slate-700 whitespace-pre-wrap">
                  {currentPost.content}
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <button
                  onClick={handleSaveOrUpdate}
                  className="py-3 rounded-xl bg-slate-900 text-white font-black text-sm hover:bg-indigo-600 transition inline-flex items-center justify-center gap-2"
                >
                  <Save size={16} />
                  {isPersisted ? "Mettre à jour" : "Enregistrer"}
                </button>
                <button
                  onClick={() => {
                    setCurrentPost(null);
                    navigate("/marketing");
                    setActiveTab("generator");
                  }}
                  className="py-3 rounded-xl bg-white border border-slate-200 text-slate-700 font-black text-sm hover:bg-slate-50 transition"
                >
                  Nouveau
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
