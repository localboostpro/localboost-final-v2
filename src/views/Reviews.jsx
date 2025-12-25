import React from 'react';
import { Star, MessageSquare, Calendar, CheckCircle } from 'lucide-react';

export default function Reviews({ reviews, profile }) {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Avis Clients</h1>
          <p className="text-slate-500">Gérez la réputation de {profile?.name}</p>
        </div>
      </div>

      <div className="grid gap-4">
        {reviews.length === 0 ? (
          <div className="bg-white p-20 text-center rounded-[2rem] border-2 border-dashed border-slate-100 text-slate-400 font-bold text-xl">
            Aucun avis pour le moment.
          </div>
        ) : (
          reviews.map(a => (
            <div key={a.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all">
              <div className="flex justify-between mb-4">
                <span className="font-bold text-slate-900 text-lg">{a.author || 'Anonyme'}</span>
                <span className="text-[10px] bg-slate-100 px-3 py-1 rounded-full font-black text-slate-400 uppercase tracking-widest">{a.platform || 'Google'}</span>
              </div>
              <div className="flex text-amber-400 mb-4">
                {[...Array(5)].map((_, i) => <Star key={i} size={16} className={i < (a.rating || 0) ? "fill-amber-400" : "text-slate-100"} />)}
              </div>
              <p className="text-slate-600 font-medium italic leading-relaxed">"{a.text || 'Pas de commentaire laissé.'}"</p>
              <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between text-[11px] font-black text-slate-300 uppercase tracking-widest">
                <div className="flex items-center gap-2"><Calendar size={14}/> {new Date(a.created_at).toLocaleDateString('fr-FR')}</div>
                <div className="text-emerald-500 flex items-center gap-1"><CheckCircle size={14}/> Avis Vérifié</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
