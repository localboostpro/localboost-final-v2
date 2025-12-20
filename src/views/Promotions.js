import React, { useState } from "react";
import { Megaphone, Send, AlertTriangle, Users } from "lucide-react";

export default function Promotions({ customers, profile }) {
  const [activeTab, setActiveTab] = useState("promo");
  const [target, setTarget] = useState("all"); // 'all', 'VIP', 'Nouveau'
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  // Calcul du nombre de destinataires
  const targetCount =
    target === "all"
      ? customers.length
      : customers.filter((c) => c.tags && c.tags.includes(target)).length;

  const templates = {
    promo: `🔥 Promo Flash chez ${
      profile.name || "Nous"
    } !\n-20% pour nos clients ${
      target === "all" ? "fidèles" : target
    } !\nVenez vite !`,
    closure: `⚠️ Info : Fermeture exceptionnelle demain.\nMerci de votre compréhension.`,
  };

  const handleSend = () => {
    if (!message) return alert("Message vide !");
    if (targetCount === 0) return alert("Aucun client dans cette catégorie.");
    setIsSending(true);
    // Simulation API
    setTimeout(() => {
      setIsSending(false);
      alert(`🚀 Envoyé à ${targetCount} clients (${target}) !`);
      setMessage("");
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in">
      <h2 className="text-3xl font-black text-slate-900">
        Campagnes Marketing
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-4">
          {/* Choix du Type */}
          <button
            onClick={() => setActiveTab("promo")}
            className={`w-full text-left p-4 rounded-2xl border-2 transition ${
              activeTab === "promo"
                ? "border-indigo-600 bg-indigo-50"
                : "bg-white border-transparent"
            }`}
          >
            <div className="flex items-center gap-3 font-bold text-slate-900">
              <Megaphone className="text-indigo-600" /> Offre Promo
            </div>
          </button>
          <button
            onClick={() => setActiveTab("closure")}
            className={`w-full text-left p-4 rounded-2xl border-2 transition ${
              activeTab === "closure"
                ? "border-orange-500 bg-orange-50"
                : "bg-white border-transparent"
            }`}
          >
            <div className="flex items-center gap-3 font-bold text-slate-900">
              <AlertTriangle className="text-orange-500" /> Alerte Info
            </div>
          </button>
        </div>

        <div className="md:col-span-2 bg-white p-6 rounded-[32px] border shadow-sm flex flex-col gap-4">
          {/* CIBLAGE */}
          <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl">
            <Users className="text-slate-400" />
            <div className="flex-1">
              <label className="text-xs font-bold text-slate-400 uppercase">
                Ciblage
              </label>
              <select
                className="w-full bg-transparent font-bold outline-none"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
              >
                <option value="all">Tous les clients</option>
                <option value="VIP">Clients VIP uniquement</option>
                <option value="Nouveau">Nouveaux clients</option>
                <option value="Fidèle">Clients Fidèles</option>
              </select>
            </div>
            <div className="bg-white px-3 py-1 rounded-lg font-bold text-sm shadow-sm">
              {targetCount} contacts
            </div>
          </div>

          <textarea
            className="flex-1 w-full p-4 bg-slate-50 rounded-2xl font-medium outline-none resize-none min-h-[150px]"
            placeholder="Votre message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />

          <div className="flex justify-between items-center">
            <button
              onClick={() => setMessage(templates[activeTab])}
              className="text-xs font-bold text-indigo-600 underline"
            >
              Utiliser un modèle
            </button>
            <button
              onClick={handleSend}
              disabled={isSending || targetCount === 0}
              className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
            >
              {isSending ? (
                "Envoi..."
              ) : (
                <>
                  <Send size={18} /> Envoyer
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
