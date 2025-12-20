import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { PLANS } from "../lib/plans";
import {
  Users,
  TrendingUp,
  Euro,
  Mail,
  Plus,
  AlertCircle,
  Power,
  RefreshCw,
  X,
  Save,
  Calendar,
  Trash2,
  Key, // ✅ Ajout de Key
} from "lucide-react";

export default function Admin({ onImpersonate }) {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    mrr: 0,
    arr: 0,
    active: 0,
    expiringSoon: 0,
  });

  // --- ÉTAT DU FORMULAIRE D'AJOUT ---
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newClient, setNewClient] = useState({
    name: "",
    email: "",
    plan: "basic",
  });

  // --- 1. CHARGEMENT & CALCULS ---
  useEffect(() => {
    fetchBusinesses();
  }, []);

  const fetchBusinesses = async () => {
    const { data, error } = await supabase
      .from("business_profile")
      .select("*")
      .order("id", { ascending: false });

    if (data) {
      setBusinesses(data);
      calculateStats(data);
    }
    setLoading(false);
  };

  const calculateStats = (data) => {
    const now = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(now.getDate() + 7);

    const stats = data.reduce(
      (acc, curr) => {
        if (curr.status === "active") {
          acc.active += 1;
          acc.mrr += curr.mrr || 0;
        }
        acc.total += 1;
        if (curr.renewal_date) {
          const renewal = new Date(curr.renewal_date);
          if (renewal > now && renewal < nextWeek) acc.expiringSoon += 1;
        }
        return acc;
      },
      { total: 0, mrr: 0, arr: 0, active: 0, expiringSoon: 0 }
    );

    stats.arr = stats.mrr * 12;
    setStats(stats);
  };

  // --- 2. ACTIONS MÉTIER ---

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    const selectedPlan = PLANS[newClient.plan];

    const { error } = await supabase
      .from("business_profile")
      .insert([
        {
          name: newClient.name,
          user_id: null,
          email: newClient.email,
          subscription_tier: newClient.plan,
          mrr: selectedPlan.price,
          status: "active",
          renewal_date: new Date(
            new Date().setMonth(new Date().getMonth() + 1)
          ),
        },
      ])
      .select();

    if (error) {
      alert("Erreur lors de la création : " + error.message);
    } else {
      alert("✅ Client ajouté avec succès !");
      setIsAddModalOpen(false);
      setNewClient({ name: "", email: "", plan: "basic" });
      fetchBusinesses();
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Supprimer définitivement "${name}" ?`)) {
      const { error } = await supabase
        .from("business_profile")
        .delete()
        .eq("id", id);
      if (error) alert("Erreur : " + error.message);
      else fetchBusinesses();
    }
  };

  const handleToggleStatus = async (client) => {
    const newStatus = client.status === "active" ? "suspended" : "active";
    const { error } = await supabase
      .from("business_profile")
      .update({ status: newStatus })
      .eq("id", client.id);
    if (!error) fetchBusinesses();
  };

  const handleChangePlan = async (client) => {
    const targetPlanKey =
      client.subscription_tier === "basic" ? "premium" : "basic";
    const targetPlanData = PLANS[targetPlanKey];
    if (
      window.confirm(
        `Passer ${client.name} en ${targetPlanData.label} (${targetPlanData.price}€) ?`
      )
    ) {
      const { error } = await supabase
        .from("business_profile")
        .update({ subscription_tier: targetPlanKey, mrr: targetPlanData.price })
        .eq("id", client.id);
      if (!error) fetchBusinesses();
    }
  };

  const handleSendReminder = (client) => {
    const subject = `Renouvellement abonnement ${client.name}`;
    const body = `Bonjour,\n\nVotre abonnement ${
      client.subscription_tier
    } arrive à échéance le ${new Date(
      client.renewal_date
    ).toLocaleDateString()}.\nMerci de régulariser.\n\nCordialement.`;
    window.location.href = `mailto:${
      client.email || ""
    }?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  // ✅ NOUVELLE FONCTION : Réinitialisation mot de passe
  const handleResetPassword = async (client) => {
    if (!client.email) {
      alert(
        "⚠️ Aucun email n'est renseigné dans le profil de ce client. Impossible d'envoyer le lien."
      );
      return;
    }

    if (
      window.confirm(
        `Envoyer un email de réinitialisation de mot de passe à ${client.email} ?`
      )
    ) {
      // Supabase envoie l'email standard de "Password Recovery"
      const { error } = await supabase.auth.resetPasswordForEmail(
        client.email,
        {
          redirectTo: window.location.origin, // Redirige vers la page d'accueil après le clic
        }
      );

      if (error) {
        alert("Erreur : " + error.message);
      } else {
        alert(
          `✅ Email de réinitialisation envoyé avec succès à ${client.email} !`
        );
      }
    }
  };

  // --- 3. UTILITAIRES ---
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("fr-FR");
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 relative">
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900">
            Dashboard Admin
          </h1>
          <p className="text-slate-500">
            Supervision financière et gestion des comptes
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-indigo-700 transition shadow-lg shadow-indigo-200"
        >
          <Plus size={20} /> Ajouter un client
        </button>
      </div>

      {/* --- MODAL D'AJOUT CLIENT --- */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-black text-slate-800">
                Nouveau Client
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-red-500"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase ml-1">
                  Nom de l'entreprise
                </label>
                <input
                  type="text"
                  required
                  value={newClient.name}
                  onChange={(e) =>
                    setNewClient({ ...newClient, name: e.target.value })
                  }
                  className="w-full p-3 bg-slate-50 border rounded-xl outline-none focus:border-indigo-500"
                  placeholder="Ex: Boulangerie Ducoin"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase ml-1">
                  Email de contact
                </label>
                <input
                  type="email"
                  value={newClient.email}
                  onChange={(e) =>
                    setNewClient({ ...newClient, email: e.target.value })
                  }
                  className="w-full p-3 bg-slate-50 border rounded-xl outline-none focus:border-indigo-500"
                  placeholder="contact@client.com"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase ml-1">
                  Forfait de départ
                </label>
                <div className="grid grid-cols-2 gap-3 mt-1">
                  {Object.entries(PLANS).map(([key, plan]) => (
                    <div
                      key={key}
                      onClick={() => setNewClient({ ...newClient, plan: key })}
                      className={`cursor-pointer p-3 rounded-xl border-2 transition text-center ${
                        newClient.plan === key
                          ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                          : "border-slate-100 hover:border-slate-300"
                      }`}
                    >
                      <div className="font-bold text-sm">{plan.label}</div>
                      <div className="text-xs opacity-75">
                        {plan.price}€/mois
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition flex justify-center items-center gap-2 mt-4"
              >
                <Save size={18} /> Créer le profil client
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- STATS --- */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase">
                Total Clients
              </p>
              <h3 className="text-3xl font-black text-slate-800">
                {stats.total}
              </h3>
            </div>
            <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
              <Users size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs font-bold text-green-600 gap-1">
            <TrendingUp size={14} /> {stats.active} actifs
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase">
                Revenu (MRR)
              </p>
              <h3 className="text-3xl font-black text-slate-800">
                {stats.mrr} €
              </h3>
            </div>
            <div className="p-2 bg-green-100 rounded-lg text-green-600">
              <Euro size={20} />
            </div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase">
                Projection Annuelle
              </p>
              <h3 className="text-3xl font-black text-slate-800">
                {stats.arr} €
              </h3>
            </div>
            <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
              <TrendingUp size={20} />
            </div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border shadow-sm flex flex-col justify-between bg-gradient-to-br from-slate-800 to-slate-900 text-white">
          <div>
            <p className="text-xs font-bold text-slate-300 uppercase">
              Renouvellements (7j)
            </p>
            <h3 className="text-3xl font-bold mt-1">{stats.expiringSoon}</h3>
          </div>
          <AlertCircle className="text-slate-500 self-end" size={24} />
        </div>
      </div>

      {/* --- TABLEAU --- */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="font-bold text-lg text-slate-800">
            Gestion des Abonnements
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase font-bold text-slate-500">
              <tr>
                <th className="px-6 py-4">Client</th>
                <th className="px-6 py-4">Dates Clés</th>
                <th className="px-6 py-4">Statut</th>
                <th className="px-6 py-4">Offre</th>
                <th className="px-6 py-4">Prix</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {businesses.map((biz) => {
                const isActive = biz.status === "active";
                return (
                  <tr
                    key={biz.id}
                    className={`transition ${
                      !isActive ? "bg-red-50" : "hover:bg-slate-50"
                    }`}
                  >
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{biz.name}</div>
                      <div className="text-xs text-slate-400 font-mono mt-0.5">
                        ID: {String(biz.id).substring(0, 8)}
                      </div>
                      {/* Affichage de l'email s'il existe */}
                      {biz.email && (
                        <div className="text-xs text-indigo-600 mt-1 flex items-center gap-1">
                          <Mail size={10} /> {biz.email}
                        </div>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <div className="text-xs text-slate-500 flex items-center gap-1">
                          <span className="opacity-50">Début:</span>{" "}
                          {formatDate(biz.created_at)}
                        </div>
                        <div className="text-xs font-bold text-slate-700 flex items-center gap-1">
                          <Calendar size={10} /> Fin:{" "}
                          {formatDate(biz.renewal_date)}
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${
                          isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {isActive ? "Actif" : "Suspendu"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="capitalize font-medium">
                          {biz.subscription_tier}
                        </span>
                        <button
                          onClick={() => handleChangePlan(biz)}
                          className="text-slate-400 hover:text-indigo-600 transition"
                        >
                          <RefreshCw size={14} />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold font-mono text-slate-700">
                      {biz.mrr} €
                    </td>
                    <td className="px-6 py-4 flex justify-end gap-2 items-center">
                      {/* BOUTON RESET PASSWORD */}
                      <button
                        onClick={() => handleResetPassword(biz)}
                        title="Envoyer un lien de réinitialisation de mot de passe"
                        className="p-2 hover:bg-amber-50 text-amber-500 rounded-lg transition"
                      >
                        <Key size={18} />
                      </button>

                      <button
                        onClick={() => handleToggleStatus(biz)}
                        title={isActive ? "Suspendre" : "Réactiver"}
                        className={`p-2 rounded-lg transition ${
                          isActive
                            ? "hover:bg-red-100 text-slate-400 hover:text-red-600"
                            : "bg-green-100 text-green-700 hover:bg-green-200"
                        }`}
                      >
                        <Power size={18} />
                      </button>

                      <button
                        onClick={() => handleDelete(biz.id, biz.name)}
                        className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition"
                      >
                        <Trash2 size={18} />
                      </button>

                      <div className="w-px h-6 bg-slate-200 mx-1"></div>

                      <button
                        onClick={() => onImpersonate(biz)}
                        className="px-3 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-indigo-600 transition"
                      >
                        Voir
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
