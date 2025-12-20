import React, { useState } from "react";
import {
  Trash2,
  Plus,
  Cake,
  Mail,
  Phone,
  X,
  Search,
  Edit3,
  MessageCircle,
  Send,
  Megaphone,
  Download,
  Tag,
} from "lucide-react";

export default function Customers({ customers, onAdd, onEdit, onDelete }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTag, setFilterTag] = useState("all");

  // Formulaire étendu avec Tags
  const [formData, setFormData] = useState({
    id: null,
    name: "",
    email: "",
    phone: "",
    birthday: "",
    tags: [],
  });

  // Liste des tags disponibles (Pourrait être en BDD plus tard)
  const availableTags = ["VIP", "Nouveau", "Fidèle", "Irrégulier"];

  // Filtrage avancé
  const filteredCustomers = customers.filter((c) => {
    const matchesSearch =
      (c.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (c.email?.toLowerCase() || "").includes(searchTerm.toLowerCase());
    const matchesTag =
      filterTag === "all" || (c.tags && c.tags.includes(filterTag));
    return matchesSearch && matchesTag;
  });

  const toggleTag = (tag) => {
    const currentTags = formData.tags || [];
    if (currentTags.includes(tag)) {
      setFormData({ ...formData, tags: currentTags.filter((t) => t !== tag) });
    } else {
      setFormData({ ...formData, tags: [...currentTags, tag] });
    }
  };

  const openAddModal = () => {
    setFormData({
      id: null,
      name: "",
      email: "",
      phone: "",
      birthday: "",
      tags: [],
    });
    setIsModalOpen(true);
  };
  const openEditModal = (client) => {
    setFormData({ ...client, tags: client.tags || [] });
    setIsModalOpen(true);
  };
  const handleSubmit = () => {
    if (!formData.name) return alert("Nom obligatoire");
    if (formData.id) onEdit(formData);
    else onAdd(formData);
    setIsModalOpen(false);
  };

  // Actions (WhatsApp/Mail/CSV...) identiques à avant
  const handleWhatsApp = (phone) => {
    if (!phone) return alert("Pas de numéro.");
    let clean = phone.replace(/[^\d]/g, "");
    if (clean.length === 10 && clean.startsWith("0"))
      clean = "33" + clean.substring(1);
    window.open(`https://wa.me/${clean}`, "_blank");
  };
  const handleMail = (email) => {
    if (email) window.location.href = `mailto:${email}`;
  };
  const handleExportCSV = () => {
    /* ... Code existant export ... */
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col xl:flex-row justify-between items-end gap-6 border-b border-slate-100 pb-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 mb-2">
            Clients & CRM
          </h2>
          <p className="text-slate-400 font-bold text-sm">
            {customers.length} contacts • {filteredCustomers.length} filtrés
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExportCSV}
            className="bg-white border p-3 rounded-2xl hover:bg-slate-50"
          >
            <Download size={18} />
          </button>
          <button
            onClick={openAddModal}
            className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-indigo-700 flex gap-2"
          >
            <Plus size={18} /> Nouveau
          </button>
        </div>
      </div>

      {/* Filtres & Recherche */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            size={20}
          />
          <input
            className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl border shadow-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
          <button
            onClick={() => setFilterTag("all")}
            className={`px-4 py-2 rounded-xl font-bold whitespace-nowrap transition ${
              filterTag === "all"
                ? "bg-slate-900 text-white"
                : "bg-white border text-slate-500"
            }`}
          >
            Tous
          </button>
          {availableTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setFilterTag(tag)}
              className={`px-4 py-2 rounded-xl font-bold whitespace-nowrap transition ${
                filterTag === tag
                  ? "bg-indigo-100 text-indigo-700 border-indigo-200"
                  : "bg-white border text-slate-500"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Liste Clients */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredCustomers.map((c) => (
          <div
            key={c.id}
            className="bg-white p-6 rounded-[28px] border border-slate-100 shadow-sm hover:shadow-md transition relative flex flex-col justify-between h-full"
          >
            <div>
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center font-black text-indigo-600 text-lg">
                    {c.name?.[0].toUpperCase()}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-lg">
                      {c.name}
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {c.tags &&
                        c.tags.map((t) => (
                          <span
                            key={t}
                            className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase rounded-md"
                          >
                            {t}
                          </span>
                        ))}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => openEditModal(c)}
                  className="text-slate-300 hover:text-indigo-600"
                >
                  <Edit3 size={18} />
                </button>
              </div>

              <div className="space-y-2 mb-6">
                <div
                  onClick={() => handleMail(c.email)}
                  className="flex items-center gap-3 text-sm font-medium text-slate-600 cursor-pointer hover:text-indigo-600"
                >
                  <Mail size={16} /> {c.email || "—"}
                </div>
                <div
                  onClick={() => handleWhatsApp(c.phone)}
                  className="flex items-center gap-3 text-sm font-medium text-slate-600 cursor-pointer hover:text-green-600"
                >
                  <Phone size={16} /> {c.phone || "—"}
                </div>
                {c.birthday && (
                  <div className="flex items-center gap-3 text-sm font-bold text-pink-600">
                    <Cake size={14} />{" "}
                    {new Date(c.birthday).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2 pt-4 border-t border-slate-50">
              <button
                onClick={() => onDelete(c.id)}
                className="p-2 text-red-400 hover:bg-red-50 rounded-lg"
              >
                <Trash2 size={18} />
              </button>
              <button
                onClick={() => handleWhatsApp(c.phone)}
                className="flex-1 bg-green-50 text-green-700 py-2 rounded-xl font-bold text-xs flex justify-center items-center gap-2 hover:bg-green-100"
              >
                <MessageCircle size={16} /> WhatsApp
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Edition/Ajout */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] w-full max-w-lg p-8 shadow-2xl animate-in zoom-in-95">
            <h3 className="text-2xl font-black text-slate-900 mb-6">
              {formData.id ? "Modifier" : "Nouveau Client"}
            </h3>
            <div className="space-y-4">
              <input
                className="w-full p-4 bg-slate-50 rounded-2xl font-bold outline-none"
                placeholder="Nom complet"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  className="p-4 bg-slate-50 rounded-2xl font-bold outline-none"
                  placeholder="Email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
                <input
                  className="p-4 bg-slate-50 rounded-2xl font-bold outline-none"
                  placeholder="Téléphone"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                />
              </div>
              <input
                type="date"
                className="w-full p-4 bg-slate-50 rounded-2xl font-bold outline-none"
                value={formData.birthday}
                onChange={(e) =>
                  setFormData({ ...formData, birthday: e.target.value })
                }
              />

              {/* Selecteur de Tags */}
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase ml-2 mb-2 block">
                  Catégories
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold border transition ${
                        formData.tags?.includes(tag)
                          ? "bg-indigo-600 text-white border-indigo-600"
                          : "bg-white text-slate-500 border-slate-200"
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-4 font-bold text-slate-500"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSubmit}
                  className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-lg"
                >
                  Enregistrer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
