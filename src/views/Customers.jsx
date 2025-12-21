import React, { useState } from "react";
import { Users, Search, Mail, Phone, Plus, X, MapPin, Edit2, Save, Trash2, MessageCircle } from "lucide-react";
import { supabase } from "../lib/supabase";

export default function Customers({ customers }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const [formData, setFormData] = useState({ 
    id: null, name: "", email: "", phone: "", city: "", address: "" 
  });

  const openAdd = () => {
      setFormData({ id: null, name: "", email: "", phone: "", city: "", address: "" });
      setIsEditing(false);
      setShowModal(true);
  };

  const openEdit = (client) => {
      setFormData(client);
      setIsEditing(true);
      setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        if (isEditing) {
            const { error } = await supabase
                .from("customers")
                .update({
                    name: formData.name, email: formData.email, 
                    phone: formData.phone, city: formData.city, address: formData.address
                })
                .eq("id", formData.id);
            if (error) throw error;
            alert("✅ Client modifié !");
        } else {
            const { data: { user } } = await supabase.auth.getUser();
            const { data: profile } = await supabase.from("business_profile").select("id").eq("user_id", user.id).single();
            
            if (profile) {
                const { id, ...dataToInsert } = formData;
                const { error } = await supabase.from("customers").insert([{ ...dataToInsert, business_id: profile.id }]);
                if (error) throw error;
                alert("✅ Client ajouté !");
            }
        }
        window.location.reload();
    } catch (err) {
        console.error(err);
        alert("Erreur lors de l'enregistrement.");
    }
  };

  const handleDelete = async (id) => {
      if(!window.confirm("Voulez-vous vraiment supprimer ce client ?")) return;
      const { error } = await supabase.from("customers").delete().eq("id", id);
      if(!error) window.location.reload();
  };

  const sendEmail = (email) => window.open(`mailto:${email}`);
  const callPhone = (phone) => window.open(`tel:${phone}`);

  const filtered = customers.filter(c => c.name?.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* HEADER CORRIGÉ & TRADUIT */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm gap-4">
         <div>
            <h3 className="text-xl font-black text-slate-900 flex items-center gap-2"><Users className="text-indigo-600"/> Fichier Clients</h3>
            <p className="text-sm text-slate-500">{customers.length} contacts enregistrés.</p>
         </div>
         <button onClick={openAdd} className="bg-indigo-600 text-white px-5 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-indigo-700 transition shadow-lg shadow-indigo-200">
            <Plus size={18}/> Nouveau Client
         </button>
      </div>

      {showModal && (
          <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
              <div className="bg-white p-8 rounded-[2rem] w-full max-w-lg shadow-2xl animate-in zoom-in-95">
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="font-black text-xl text-slate-900">{isEditing ? "Modifier la fiche" : "Ajouter un Contact"}</h3>
                      <button onClick={() => setShowModal(false)}><X size={20} className="text-slate-400"/></button>
                  </div>
                  <form onSubmit={handleSubmit} className="space-y-4">
                      <div><label className="text-xs font-bold text-slate-400 uppercase ml-1">Nom complet</label><input required className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl font-bold outline-none focus:ring-2 ring-indigo-500" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}/></div>
                      <div className="grid grid-cols-2 gap-4">
                        <div><label className="text-xs font-bold text-slate-400 uppercase ml-1">Email</label><input required type="email" className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl font-bold outline-none focus:ring-2 ring-indigo-500" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}/></div>
                        <div><label className="text-xs font-bold text-slate-400 uppercase ml-1">Téléphone</label><input type="tel" className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl font-bold outline-none focus:ring-2 ring-indigo-500" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})}/></div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2"><label className="text-xs font-bold text-slate-400 uppercase ml-1">Adresse</label><input className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl font-bold outline-none focus:ring-2 ring-indigo-500" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})}/></div>
                        <div className="col-span-2"><label className="text-xs font-bold text-slate-400 uppercase ml-1">Ville</label><input className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl font-bold outline-none focus:ring-2 ring-indigo-500" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})}/></div>
                      </div>
                      <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-xl font-bold shadow-lg shadow-indigo-200 transition mt-4 flex justify-center gap-2">
                        <Save size={18}/> {isEditing ? "Enregistrer" : "Créer le client"}
                      </button>
                  </form>
              </div>
          </div>
      )}

      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-50 bg-slate-50/30">
           <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16}/>
              <input type="text" placeholder="Rechercher un nom, un email..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 ring-indigo-100 text-sm font-bold"/>
           </div>
        </div>

        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-400 text-xs uppercase font-black">
                <tr>
                    <th className="p-4 pl-6">Nom / Contact</th>
                    <th className="p-4">Localisation</th>
                    <th className="p-4 text-right pr-6">Actions</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
                {filtered.map((c) => (
                    <tr key={c.id} className="hover:bg-indigo-50/30 transition group">
                        <td className="p-4 pl-6">
                            <div className="font-bold text-slate-900 text-base">{c.name}</div>
                            <div className="flex gap-2 mt-1">
                                {c.email && (
                                    <button onClick={() => sendEmail(c.email)} className="text-xs text-slate-500 hover:text-indigo-600 flex items-center gap-1 transition bg-slate-100 px-2 py-1 rounded-md">
                                        <Mail size={10}/> {c.email}
                                    </button>
                                )}
                                {c.phone && (
                                    <button onClick={() => callPhone(c.phone)} className="text-xs text-slate-500 hover:text-emerald-600 flex items-center gap-1 transition bg-slate-100 px-2 py-1 rounded-md">
                                        <Phone size={10}/> {c.phone}
                                    </button>
                                )}
                            </div>
                        </td>
                        <td className="p-4">
                            {c.city ? (
                                <div className="flex flex-col">
                                    <span className="font-bold text-slate-700 flex items-center gap-1"><MapPin size={14} className="text-indigo-400"/> {c.city}</span>
                                    <span className="text-xs text-slate-400 truncate max-w-[150px]">{c.address}</span>
                                </div>
                            ) : <span className="text-xs text-slate-300 italic">Non renseigné</span>}
                        </td>
                        <td className="p-4 text-right pr-6 flex justify-end gap-2">
                            <button onClick={() => openEdit(c)} className="p-2 bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-200 rounded-xl transition shadow-sm" title="Modifier">
                                <Edit2 size={16}/>
                            </button>
                            <button onClick={() => handleDelete(c.id)} className="p-2 bg-white border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-200 rounded-xl transition shadow-sm" title="Supprimer">
                                <Trash2 size={16}/>
                            </button>
                        </td>
                    </tr>
                ))}
                {filtered.length === 0 && (
                    <tr>
                        <td colSpan="3" className="p-8 text-center text-slate-400 italic">Aucun client trouvé.</td>
                    </tr>
                )}
            </tbody>
            </table>
        </div>
      </div>
    </div>
  );
}
