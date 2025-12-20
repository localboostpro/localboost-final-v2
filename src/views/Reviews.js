import React, { useState } from "react";
import {
  Star,
  Check,
  Trash2,
  Filter,
  ExternalLink,
  ThumbsUp,
  AlertCircle,
  Globe,
  Facebook,
  Plus,
  X,
} from "lucide-react";

export default function Reviews({ reviews, onAdd, onDelete, onApprove }) {
  const [activeFilter, setActiveFilter] = useState("all");
  const [showPendingOnly, setShowPendingOnly] = useState(false);

  // États du formulaire
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newReview, setNewReview] = useState({
    author: "",
    text: "",
    rating: 5,
    platform: "Google",
    status: "approved",
  });

  // Calculs
  const averageRating =
    reviews.length > 0
      ? (
          reviews.reduce((acc, r) => acc + (r.rating || 0), 0) / reviews.length
        ).toFixed(1)
      : "0.0";

  // On ne compte pas les archivés dans les "à traiter"
  const pendingCount = reviews.filter(
    (r) => r.status !== "approved" && r.status !== "archived"
  ).length;

  // Filtrage
  const filteredReviews = reviews.filter((r) => {
    // 1. IMPORTANT : On masque les avis archivés (supprimés)
    if (r.status === "archived") return false;

    // 2. Filtre par source
    const platform = r.platform ? r.platform.toLowerCase() : "website";
    const matchSource =
      activeFilter === "all" || platform === activeFilter.toLowerCase();

    // 3. Filtre par statut (En attente)
    const matchStatus = showPendingOnly ? r.status !== "approved" : true;

    return matchSource && matchStatus;
  });

  // Soumission du formulaire
  const handleSubmit = () => {
    if (!newReview.author || !newReview.text)
      return alert("Nom et message obligatoires");
    onAdd(newReview);
    setIsModalOpen(false);
    setNewReview({
      author: "",
      text: "",
      rating: 5,
      platform: "Google",
      status: "approved",
    });
  };

  const getSourceBadge = (platform) => {
    const p = platform ? platform.toLowerCase() : "website";
    if (p.includes("google"))
      return (
        <span className="flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-[10px] font-black uppercase border border-blue-100">
          G Google
        </span>
      );
    if (p.includes("facebook"))
      return (
        <span className="flex items-center gap-1 px-2 py-1 bg-indigo-50 text-indigo-700 rounded-md text-[10px] font-black uppercase border border-indigo-100">
          <Facebook size={10} /> Facebook
        </span>
      );
    return (
      <span className="flex items-center gap-1 px-2 py-1 bg-emerald-50 text-emerald-700 rounded-md text-[10px] font-black uppercase border border-emerald-100">
        <Globe size={10} /> Site Web
      </span>
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in">
      {/* En-tête */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-slate-100 pb-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 mb-2">
            Gestion des Avis
          </h2>
          <div className="flex items-center gap-3 text-sm text-slate-500 font-bold">
            <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-md flex items-center gap-1">
              <Star size={14} className="fill-yellow-700" /> {averageRating} / 5
            </span>
            <span>
              • {reviews.filter((r) => r.status !== "archived").length} avis
              total
            </span>
            {pendingCount > 0 && (
              <span className="text-orange-600 bg-orange-50 px-2 py-1 rounded-md">
                • {pendingCount} à traiter
              </span>
            )}
          </div>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg hover:bg-indigo-700 transition flex items-center gap-2 text-sm"
        >
          <Plus size={18} /> Ajouter un Avis
        </button>
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap items-center gap-3 bg-white p-2 rounded-2xl border shadow-sm">
        <Filter size={16} className="text-slate-400 ml-2" />
        {["All", "Google", "Facebook", "Website"].map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f.toLowerCase())}
            className={`px-4 py-2 rounded-xl text-sm font-bold capitalize transition-all ${
              activeFilter === f.toLowerCase()
                ? "bg-slate-900 text-white"
                : "text-slate-500 hover:bg-slate-50"
            }`}
          >
            {f}
          </button>
        ))}
        <div className="w-px h-6 bg-slate-200 mx-2"></div>
        <button
          onClick={() => setShowPendingOnly(!showPendingOnly)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
            showPendingOnly
              ? "bg-orange-100 text-orange-700"
              : "bg-slate-50 text-slate-500 hover:bg-slate-100"
          }`}
        >
          <AlertCircle size={16} /> En attente
        </button>
      </div>

      {/* Liste */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredReviews.map((r) => (
          <div
            key={r.id}
            className={`bg-white p-6 rounded-[28px] border shadow-sm relative group overflow-hidden ${
              r.status !== "approved"
                ? "border-orange-200 bg-orange-50/10"
                : "border-slate-100"
            }`}
          >
            {r.status !== "approved" && (
              <div className="absolute top-0 right-0 bg-orange-100 text-orange-700 text-[10px] font-black uppercase px-3 py-1 rounded-bl-xl">
                En attente
              </div>
            )}

            <div className="flex justify-between items-start mb-3 mt-1">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-500">
                  {r.author ? r.author[0].toUpperCase() : "?"}
                </div>
                <div>
                  <div className="font-bold text-slate-900 text-sm">
                    {r.author}
                  </div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase">
                    {getSourceBadge(r.platform)}
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <div className="flex gap-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    className={`${
                      i < (r.rating || 5)
                        ? "fill-yellow-400 text-yellow-400"
                        : "fill-slate-200 text-slate-200"
                    }`}
                  />
                ))}
              </div>
              <p className="text-slate-600 text-sm font-medium leading-relaxed italic">
                "{r.text}"
              </p>
            </div>

            <div className="flex items-center gap-2 pt-4 border-t border-slate-100/50">
              {r.status !== "approved" && (
                <button
                  onClick={() => onApprove(r.id)}
                  className="flex-1 bg-green-500 text-white py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1 hover:bg-green-600 transition shadow-sm"
                >
                  <Check size={14} /> Valider
                </button>
              )}
              <button
                onClick={() => onDelete(r.id)}
                className="w-9 h-9 flex items-center justify-center bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredReviews.length === 0 && (
        <div className="p-16 text-center text-slate-400 font-bold bg-slate-50 rounded-[32px] border-2 border-dashed">
          Aucun avis trouvé.
        </div>
      )}

      {/* Modal Ajout */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-[32px] w-full max-w-lg p-8 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black text-slate-900">
                Nouvel Avis
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 bg-slate-100 rounded-full hover:bg-slate-200"
              >
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <input
                className="w-full p-4 bg-slate-50 rounded-2xl font-bold border-2 border-transparent focus:border-indigo-500 outline-none"
                placeholder="Nom du client"
                value={newReview.author}
                onChange={(e) =>
                  setNewReview({ ...newReview, author: e.target.value })
                }
              />
              <div className="grid grid-cols-2 gap-4">
                <select
                  className="w-full p-4 bg-slate-50 rounded-2xl font-bold border-none outline-none cursor-pointer"
                  value={newReview.platform}
                  onChange={(e) =>
                    setNewReview({ ...newReview, platform: e.target.value })
                  }
                >
                  <option value="Google">Google</option>
                  <option value="Facebook">Facebook</option>
                  <option value="Website">Site Web</option>
                </select>
                <div className="flex gap-1 p-4 bg-slate-50 rounded-2xl justify-center cursor-pointer">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={20}
                      className={`${
                        star <= newReview.rating
                          ? "fill-yellow-400 text-yellow-400"
                          : "fill-slate-200 text-slate-200"
                      }`}
                      onClick={() =>
                        setNewReview({ ...newReview, rating: star })
                      }
                    />
                  ))}
                </div>
              </div>
              <textarea
                className="w-full p-4 bg-slate-50 rounded-2xl font-medium border-2 border-transparent focus:border-indigo-500 outline-none resize-none h-32"
                placeholder="Message..."
                value={newReview.text}
                onChange={(e) =>
                  setNewReview({ ...newReview, text: e.target.value })
                }
              />
              <button
                onClick={handleSubmit}
                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-lg hover:bg-indigo-700 transition"
              >
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
