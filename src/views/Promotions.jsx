import React, { useState, useEffect } from "react";
import { Ticket, Plus, Tag, Trash2, Calendar, Copy, Save, X } from "lucide-react";
import { supabase } from "../lib/supabase";

export default function Promotions() {
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  const [newPromo, setNewPromo] = useState({ 
    title: "", 
    description: "", 
    code: "",
    start_date: new Date().toISOString().split('T')[0], // Aujourd'hui par défaut
    end_date: "" 
  });

  // Charger les promos au démarrage
  useEffect(() => {
    fetchPromos();
  }, []);

  const fetchPromos = async () => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        const { data: profile } = await supabase.from("business_profile").select("id").eq("user_id", user.id).single();
        
        if (profile) {
            const { data, error } = await supabase
                .from("promotions")
                .select("*")
                .eq("business_id", profile.id)
                .order("created_at", { ascending: false });
            
            if (error) throw error;
            setPromos(data || []);
        }
    } catch (err) {
        console.error(err);
    } finally {
        setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!newPromo.title || !newPromo.code) return alert("Titre et Code obligatoires.");
    
    try {
        const { data: { user } } = await supabase.auth.getUser();
        const { data: profile } = await supabase.from("business_profile").select("id").eq("user_id", user.id).single();

        if (profile) {
            const { data, error } = await supabase.from("promotions").insert([{
                ...newPromo,
                business_id: profile.id
            }]).select();

            if (error) throw error;

            setPromos([data[0], ...promos]); // Ajout local immédiat
            setShowForm(false);
            setNewPromo({ title: "", description: "", code: "", start_date: "", end_date: "" });
            alert("✅ Promotion créée !");
        }
    } catch (err) {
        alert("Erreur création : " + err.message);
    }
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Supprimer cette promotion ?")) return;
    const { error } = await supabase.from("promotions").delete().eq("id", id);
    if (!error) {
        setPromos(promos.filter(p => p.id !== id));
    }
  };

  const copyToClipboard = (text) => {
      navigator.clipboard.writeText(text);
      alert("Code copié !");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm gap-4">
        <div>
          <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Ticket className="text-indigo-600" /> Offres & Promotions
          </h3>
          <p className="text-sm text-slate-500">Créez des coupons pour attirer vos clients.</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className={`px-6 py-3 rounded-2xl font-bold text-sm flex items-center gap-2 transition shadow-lg ${showForm ? "bg-slate-100 text-slate-600" : "bg-indigo-600 text-white hover:bg-indigo-700"}`}>
          {showForm ? <><X size={18}/> Fermer</> : <><Plus size={18}/> Nouvelle Promo</>}
        </button>
      </div>

      {/* FORMULAIRE CRÉATION */}
      {showForm && (
        <div className="bg-white p-8 rounded-[2rem] border border-indigo-100 shadow-xl animate-in slide-in-from-top-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-2 h-full bg-indigo-500"></div>
            <h4 className="font-bold text-lg mb-4 text-slate-900">Détails de l'offre</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="md:col-span-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Titre de l'offre</label>
                    <input placeholder="Ex: Happy Hour -50%" className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl font-bold outline-none focus:ring-2 ring-indigo-500" value={newPromo.title} onChange={e => setNewPromo({...newPromo, title: e.target.value})} />
                </div>
                
                <div className="md:col-span-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Description</label>
                    <input placeholder="Détails (ex: Sur toutes les pintes de 18h à 20h)" className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none focus:ring-2 ring-indigo-500" value={newPromo.description} onChange={e => setNewPromo({...newPromo, description: e.target.value})} />
                </div>

                <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Code Promo</label>
                    <div className="relative">
                        <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16}/>
                        <input placeholder="HAPPY50" className="w-full pl-10 p-3 bg-slate-50 border border-slate-100 rounded-xl font-mono font-bold outline-none focus:ring-2 ring-indigo-500 uppercase" value={newPromo.code} onChange={e => setNewPromo({...newPromo, code: e.target.value.toUpperCase()})} />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Début</label>
                        <input type="date" className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold outline-none" value={newPromo.start_date} onChange={e => setNewPromo({...newPromo, start_date: e.target.value})} />
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Fin (Optionnel)</label>
                        <input type="date" className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold outline-none" value={newPromo.end_date} onChange={e => setNewPromo({...newPromo, end_date: e.target.value})} />
                    </div>
                </div>
            </div>
            
            <button onClick={handleAdd} className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-slate-800 transition flex justify-center gap-2">
                <Save size={18}/> Créer la promotion
            </button>
        </div>
      )}

      {/* LISTE DES PROMOS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {promos.length === 0 && !loading && (
            <div className="col-span-2 text-center py-12 text-slate-400">
                <Ticket size={48} className="mx-auto mb-3 opacity-20"/>
                <p>Aucune promotion active.</p>
            </div>
        )}

        {promos.map((promo) => (
          <div key={promo.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm relative group hover:border-indigo-100 transition flex flex-col justify-between h-full">
            
            <div className="flex items-start gap-4">
              <div className="p-4 bg-indigo-50 rounded-2xl text-indigo-600 shrink-0">
                <Tag size={24} />
              </div>
              <div className="flex-1 overflow-hidden">
                <h4 className="font-black text-slate-900 text-lg truncate">{promo.title}</h4>
                <p className="text-slate-500 text-sm truncate">{promo.description}</p>
                
                {/* Dates */}
                <div className="flex items-center gap-2 mt-2 text-[10px] font-bold text-slate-400 uppercase">
                    <Calendar size={12}/> 
                    {new Date(promo.start_date).toLocaleDateString()} 
                    {promo.end_date && ` ➔ ${new Date(promo.end_date).toLocaleDateString()}`}
                </div>

                {/* Code */}
                <div className="mt-4 flex items-center gap-2">
                    <div className="px-3 py-1.5 bg-slate-900 text-white rounded-lg font-mono font-bold text-sm tracking-wider">
                        {promo.code}
                    </div>
                    <button onClick={() => copyToClipboard(promo.code)} className="p-1.5 text-slate-400 hover:text-indigo-600 transition" title="Copier">
                        <Copy size={16}/>
                    </button>
                </div>
              </div>
            </div>

            <button 
                onClick={() => handleDelete(promo.id)} 
                className="absolute top-4 right-4 text-slate-200 hover:text-rose-500 transition bg-white rounded-full p-2 hover:bg-rose-50 opacity-0 group-hover:opacity-100"
            >
                <Trash2 size={18}/>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
