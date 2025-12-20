import React, { useState } from "react";
import { Users, Search, Mail, Send, CheckCircle } from "lucide-react";

export default function Customers({ customers }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailContent, setEmailContent] = useState({ subject: "", body: "" });

  const handleSendCampaign = (e) => {
    e.preventDefault();
    // Simulation envoi
    alert(`Campagne envoyée à ${customers.length} clients !\nSujet: ${emailContent.subject}`);
    setShowEmailModal(false);
    setEmailContent({ subject: "", body: "" });
  };

  const filtered = customers.filter(c => c.name?.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* HEADER AVEC BOUTON ENVOI MESSAGE */}
      <div className="flex justify-between items-center bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
         <div>
            <h3 className="text-xl font-black text-slate-900 flex items-center gap-2"><Users className="text-indigo-600"/> Base Clients</h3>
            <p className="text-sm text-slate-500">{customers.length} contacts enregistrés.</p>
         </div>
         <button onClick={() => setShowEmailModal(true)} className="bg-slate-900 text-white px-5 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-slate-800 transition">
            <Mail size={18}/> Envoyer Message
         </button>
      </div>

      {/* MODALE ENVOI MESSAGE */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl animate-in zoom-in-95">
                <h3 className="text-xl font-black mb-4 flex items-center gap-2"><Send className="text-indigo-600"/> Nouvelle Campagne</h3>
                <form onSubmit={handleSendCampaign} className="space-y-4">
                    <div>
                        <label className="text-xs font-bold text-slate-400 uppercase">Sujet (Ex: Fermeture Été)</label>
                        <input required className="w-full bg-slate-50 p-3 rounded-xl border border-slate-200 outline-none focus:border-indigo-500" 
                        value={emailContent.subject} onChange={e => setEmailContent({...emailContent, subject: e.target.value})}/>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-400 uppercase">Message</label>
                        <textarea required rows="4" className="w-full bg-slate-50 p-3 rounded-xl border border-slate-200 outline-none focus:border-indigo-500" 
                        value={emailContent.body} onChange={e => setEmailContent({...emailContent, body: e.target.value})}></textarea>
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={() => setShowEmailModal(false)} className="flex-1 py-3 rounded-xl font-bold text-slate-500 bg-slate-100">Annuler</button>
                        <button type="submit" className="flex-1 py-3 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700">Envoyer à tous</button>
                    </div>
                </form>
            </div>
        </div>
      )}

      {/* LISTE CLIENTS */}
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-50">
           <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16}/>
              <input type="text" placeholder="Chercher un client..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 rounded-xl outline-none focus:ring-2 ring-indigo-100 text-sm font-bold"/>
           </div>
        </div>
        <table className="w-full text-left text-sm">
           <thead className="bg-slate-50 text-slate-400 text-xs uppercase font-black">
              <tr><th className="p-4">Nom</th><th className="p-4">Email</th><th className="p-4 text-right">Statut</th></tr>
           </thead>
           <tbody className="divide-y divide-slate-50">
              {filtered.map(c => (
                 <tr key={c.id} className="hover:bg-slate-50">
                    <td className="p-4 font-bold text-slate-700">{c.name}</td>
                    <td className="p-4 text-slate-500">{c.email}</td>
                    <td className="p-4 text-right"><span className="bg-green-100 text-green-700 px-2 py-1 rounded-lg text-[10px] font-black uppercase">Abonné</span></td>
                 </tr>
              ))}
           </tbody>
        </table>
      </div>
    </div>
  );
}
