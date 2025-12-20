import React from "react";

export default function Settings({ profile, setProfile, onSave }) {
  return (
    <div className="max-w-xl mx-auto bg-white p-10 rounded-[40px] border shadow-sm animate-in slide-in-from-right-4">
      <h2 className="text-xl font-bold mb-8">Réglages Profil</h2>
      <div className="space-y-6">
        <div>
          <label className="text-xs font-bold text-slate-400 uppercase ml-2">
            Nom
          </label>
          <input
            className="w-full bg-slate-50 p-4 rounded-2xl border"
            value={profile.name || ""}
            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
          />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-400 uppercase ml-2">
            Métier (Clef IA)
          </label>
          <input
            className="w-full bg-slate-50 p-4 rounded-2xl border"
            value={profile.type || ""}
            onChange={(e) => setProfile({ ...profile, type: e.target.value })}
          />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-400 uppercase ml-2">
            Ville
          </label>
          <input
            className="w-full bg-slate-50 p-4 rounded-2xl border"
            value={profile.location || ""}
            onChange={(e) =>
              setProfile({ ...profile, location: e.target.value })
            }
          />
        </div>
        <button
          onClick={onSave}
          className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold shadow-lg"
        >
          Enregistrer
        </button>
      </div>
    </div>
  );
}
