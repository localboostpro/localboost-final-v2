import React, { useState } from "react";
import { MessageSquare, Star, Plus, X } from "lucide-react";
import { supabase } from "../lib/supabase";

export default function Reviews({ reviews }) {
  const [showAdd, setShowAdd] = useState(false);
  const [newReview, setNewReview] = useState({ author_name: "", rating: 5, comment: "" });

  const handleAddReview = async (e) => {
    e.preventDefault();
    try {
        // Récupération de l'ID business via session ou props
        const { data: { user } } = await supabase.auth.getUser();
        if(!user) throw new Error("Non connecté");

        // On cherche le business_id associé au user
        const { data: profile } = await supabase.from("business_profile").select("id").eq("user_id", user.id).single();
        
        if(profile) {
            await supabase.from("reviews").insert([{
                business_id: profile.id,
                ...newReview,
                date: new Date().toISOString()
            }]);
            alert("Avis ajouté !");
            window.location.reload(); // Simple reload pour rafraichir
        }
    } catch (err) {
        console.error(err);
        alert("Erreur lors de l'ajout (Vérifiez la connexion)");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
         <div>
            <h3 className="text-xl font-black text-slate-900 flex items-center gap-2"><MessageSquare className="text-indigo-600"/> Avis Clients</h3>
            <p className="text-sm text-slate-500">Gérez votre e-réputation.</p>
         </div>
         <button onClick={() => setShowAdd(true)} className="bg-indigo-600 text-white px-5 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-indigo-700 transition">
            <Plus size={18}/> Ajouter un Avis
         </button>
      </div>

      {showAdd && (
          <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
              <div className="bg-white p-6 rounded-3xl w-full max-w-md shadow-2xl animate-in zoom-in-95">
                  <div className="flex justify-between items-center mb-4">
                      <h3 className="font-black text-lg">Saisir un avis manuellement</h3>
                      <button onClick={() => setShowAdd(false)}><X size={20} className="text-slate-400"/></button>
                  </div>
                  <form onSubmit={handleAddReview} className="space-y-4">
                      <input required placeholder="Nom du client" className="w-full p-3 bg-slate-50 rounded-xl font-bold" value={newReview.author_name} onChange={e => setNewReview({...newReview, author_name: e.target.value})}/>
                      <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-500">Note :</span>
                          <input type="number" min="1" max="5" className="w-20 p-3 bg-slate-50 rounded-xl font-bold" value={newReview.rating} onChange={e => setNewReview({...newReview, rating: e.target.value})}/>
                          <Star className="text-yellow-400 fill-yellow-400" size={20}/>
                      </div>
                      <textarea placeholder="Commentaire..." className="w-full p-3 bg-slate-50 rounded-xl font-bold" rows="3" value={newReview.comment} onChange={e => setNewReview({...newReview, comment: e.target.value})}/>
                      <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold">Enregistrer</button>
                  </form>
              </div>
          </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reviews.map((review, i) => (
          <div key={review.id || i} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
            <div className="flex justify-between items-start mb-2">
                <span className="font-bold text-slate-900">{review.author_name}</span>
                <div className="flex text-yellow-400"><Star size={16} fill="currentColor"/> <span className="text-slate-900 ml-1 text-xs font-black">{review.rating}</span></div>
            </div>
            <p className="text-slate-500 text-sm italic">"{review.comment}"</p>
          </div>
        ))}
      </div>
    </div>
  );
}
