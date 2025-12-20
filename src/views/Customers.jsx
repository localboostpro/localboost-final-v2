import React, { useState } from "react";
import { Users, Search, Mail, Plus, X, Phone, MapPin, Building } from "lucide-react";
import { supabase } from "../lib/supabase";

export default function Customers({ customers }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  
  // État enrichi avec les nouveaux champs
  const [newCustomer, setNewCustomer] = useState({ 
    name: "", 
    email: "", 
    phone: "", 
    city: "", 
    address: "" 
  });

  const handleAddCustomer = async (e) => {
    e.preventDefault();
    try {
        const { data: { user } } = await supabase.auth.getUser();
        
        // On récupère d'abord l'ID du business profile lié à l'utilisateur connecté
        const { data: profile } = await supabase.from("business_profile").select("id").eq("user_id", user.id).single();

        if (profile) {
            const { error } = await supabase.from("customers").insert([
                { 
                  ...newCustomer, 
                  business_id: profile.id 
                }
            ]);

            if (error) throw error;

            alert("✅ Client ajouté avec succès !");
            window.location.reload(); // Recharger pour voir le nouveau client
        }
    } catch (err) {
        console.error(err);
        alert("Erreur lors de l'ajout. Vérifiez que tous les champs sont corrects.");
    }
  };

  const filtered = customers.filter(c => 
    c.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.city?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* EN-TÊTE */}
      <div className="flex justify-between items-center bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
         <div>
            <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <Users className="text-indigo-600"/> Base Clients
            </h3>
            <p className="text-sm text-slate-500">{customers.length} contacts enregistrés.</p>
         </div>
         <button 
            onClick={() => setShowAddModal(true)} 
            className="bg-indigo-600 text-white px-5 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-indigo-700 transition shadow-lg shadow-indigo-200"
         >
            <Plus size={18}/> Nouveau Client
         </button>
      </div>

      {/* MODALE D'AJOUT COMPLÈTE */}
      {showAddModal && (
          <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
              <div className="bg-white p-8 rounded-[2rem] w-full max-w-lg shadow-2xl animate-in zoom-in-95">
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="font-black text-xl text-slate-900">Ajouter un Contact</h3>
                      <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition"><X size={20} className="text-slate-400"/></button>
                  </div>
                  
                  <form onSubmit={handleAddCustomer} className="space-y-4">
                      {/* Nom */}
                      <div>
                        <label className="text-xs font-bold text-slate-400 uppercase ml-1">Nom complet</label>
                        <input required placeholder="Ex: Jean Dupont" className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl font-bold outline-none focus:ring-2 ring-indigo-500" 
                        value={newCustomer.name} onChange={e => setNewCustomer({...newCustomer, name: e.target.value})}/>
                      </div>

                      {/* Email & Téléphone */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase ml-1">Email</label>
                            <input required type="email" placeholder="jean@mail.com" className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl font-bold outline-none focus:ring-2 ring-indigo-500" 
                            value={newCustomer.email} onChange={e => setNewCustomer({...newCustomer, email: e.target.value})}/>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase ml-1">Téléphone</label>
                            <input type="tel" placeholder="06..." className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl font-bold outline-none focus:ring-2 ring-indigo-500" 
                            value={newCustomer.phone} onChange={e => setNewCustomer({...newCustomer, phone: e.target.value})}/>
                        </div>
                      </div>

                      {/* Adresse & Ville */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="text-xs font-bold text-slate-400 uppercase ml-1">Adresse</label>
                            <input placeholder="10 rue de la..." className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl font-bold outline-none focus:ring-2 ring-indigo-500" 
                            value={newCustomer.address} onChange={e => setNewCustomer({...newCustomer, address: e.target.value})}/>
                        </div>
                        <div className="col-span-2">
                            <label className="text-xs font-bold text-slate-400 uppercase ml-1">Ville</label>
                            <input placeholder="Paris..." className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl font-bold outline-none focus:ring-2 ring-indigo-500" 
                            value={newCustomer.city} onChange={e => setNewCustomer({...newCustomer, city: e.target.value})}/>
                        </div>
                      </div>

                      <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-xl font-bold shadow-lg shadow-indigo-200 transition mt-4">
                        Enregistrer la fiche
                      </button>
                  </form>
              </div>
          </div>
      )}

      {/* TABLEAU DES CLIENTS */}
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-50 bg-slate-50/30">
           <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16}/>
              <input type="text" placeholder="Rechercher par nom, email ou ville..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 ring-indigo-100 text-sm font-bold"/>
           </div>
        </div>
        
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-400 text-xs uppercase font-black">
                <tr>
                    <th className="p-4">Nom / Contact</th>
                    <th className="p-4">Localisation</th>
                    <th className="p-4 text-right">Actions</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
                {filtered.map((c, i) => (
                    <tr key={c.id || i} className="hover:bg-indigo-50/30 transition">
                        <td className="p-4">
                            <div className="font-bold text-slate-900 text-base">{c.name}</div>
                            <div className="text-xs text-slate-500 flex items-center gap-2 mt-1">
                                <span className="flex items-center gap-1"><Mail size={12}/> {c.email}</span>
                                {c.phone && <span className="flex items-center gap-1 text-slate-400">| <Phone size={12}/> {c.phone}</span>}
                            </div>
                        </td>
                        <td className="p-4">
                            {c.city ? (
                                <div className="flex flex-col">
                                    <span className="font-bold text-slate-700 flex items-center gap-1"><MapPin size={14} className="text-indigo-400"/> {c.city}</span>
                                    <span className="text-xs text-slate-400 truncate max-w-[150px]">{c.address}</span>
                                </div>
                            ) : (
                                <span className="text-xs text-slate-300 italic">Non renseigné</span>
                            )}
                        </td>
                        <td className="p-4 text-right">
                            <button onClick={() => window.location.href = `mailto:${c.email}`} className="p-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition" title="Envoyer un email">
                                <Mail size={16}/>
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
