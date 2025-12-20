import React, { useState } from "react";
import { MessageSquare, Star, Plus, X, Trash2 } from "lucide-react";
import { supabase } from "../lib/supabase";

export default function Reviews({ reviews }) {
  const [showAdd, setShowAdd] = useState(false);
  const [newReview, setNewReview] = useState({ author_name: "", rating: 5, comment: "" });

  const handleAddReview = async (e) => {
    e.preventDefault();
    try {
        const { data: { user } } = await supabase.auth.getUser();
        const { data: profile } = await supabase.from("business_profile").select("id").eq("user_id", user.id).single();
        
        if(profile) {
            await supabase.from("reviews").insert([{ business_id: profile.id, ...newReview, date: new Date().toISOString() }]);
            alert("✅ Avis ajouté !");
            window.location.reload();
        }
    } catch (err) { console.error(err); alert("Erreur ajout avis"); }
  };

  const handleDelete = async (id) => {
      if(!window.confirm("Supprimer cet avis ?")) return;
      await supabase.from("reviews").delete().eq("id", id);
      window.location.reload();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
         <div>
            <h3 className="text-xl font-black text-slate-900 flex items-center gap-2"><MessageSquare className="text-indigo-600"/> Avis Clients</h3>
            <p className="text-sm text-slate-500">Gérez votre e-réputation ({reviews.length} avis).</p>
         </div>
         <button onClick={() => setShowAdd(true)} className="bg-indigo-600 text-white px-5 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-indigo-700 transition shadow-lg shadow-indigo-200">
            <Plus size={18}/> Ajouter un Avis
         </button>
      </div>

      {showAdd && (
          <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
              <div className="bg-white p-8 rounded-[2rem] w-full max-w-md shadow-2xl animate-in zoom-in-95">
                  <div className="flex justify-between items-center mb-6"><h3 className="font-black text-xl">Nouvel Avis</h3><button onClick={() => setShowAdd(false)}><X size={20} className="text-slate-400"/></button></div>
                  <form onSubmit={handleAddReview} className="space-y-4">
                      <div><label className="text-xs font-bold text-slate-400 uppercase ml-1">Client</label><input required placeholder="Nom du client" className="w-full p-3 bg-slate-50 rounded-xl font-bold border border-slate-100 outline-none focus:ring-2 ring-indigo-500" value={newReview.author_name} onChange={e => setNewReview({...newReview, author_name: e.target.value})}/></div>
                      <div>
                          <label className="text-xs font-bold text-slate-400 uppercase ml-1 block mb-2">Note</label>
                          <div className="flex gap-2">
                            {[1,2,3,4,5].map(star => (
                                <button type="button" key={star} onClick={() => setNewReview({...newReview, rating: star})} className="transition hover:scale-110">
                                    <Star size={32} className={star <= newReview.rating ? "fill-yellow-400 text-yellow-400" : "text-slate-200 fill-slate-200"}/>
                                </button>
                            ))}
                          </div>
                      </div>
                      <div><label className="text-xs font-bold text-slate-400 uppercase ml-1">Commentaire</label><textarea placeholder="Expérience du client..." className="w-full p-3 bg-slate-50 rounded-xl font-bold border border-slate-100 outline-none focus:ring-2 ring-indigo-500" rows="3" value={newReview.comment} onChange={e => setNewReview({...newReview, comment: e.target.value})}/></div>
                      <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold shadow-lg">Publier l'avis</button>
                  </form>
              </div>
          </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reviews.length === 0 && <div className="col-span-2 text-center text-slate-400 italic py-10">Aucun avis pour le moment.</div>}
        {reviews.map((review) => (
          <div key={review.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col justify-between group">
            <div>
                <div className="flex justify-between items-start mb-3">
                    <span className="font-bold text-slate-900 text-lg">{review.author_name}</span>
                    <div className="flex text-yellow-400 gap-1">{[...Array(review.rating)].map((_,i)=><Star key={i} size={16} fill="currentColor"/>)}</div>
                </div>
                <p className="text-slate-600 text-sm leading-relaxed">"{review.comment}"</p>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-50 flex justify-between items-center text-xs text-slate-400">
                <span>{new Date(review.date).toLocaleDateString()}</span>
                <button onClick={() => handleDelete(review.id)} className="text-rose-300 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition"><Trash2 size={16}/></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
