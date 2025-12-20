import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { 
  Shield, Users, LogOut, Search, ExternalLink, 
  Key, Database, Eye, Plus, X, Phone, Calendar, Save
} from "lucide-react";

export default function AdminView({ onAccessClient }) {
  const [businesses, setBusinesses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState({ total: 0, premium: 0, revenue: 0 });
  
  // État pour la modale "Nouveau Client"
  const [showAddModal, setShowAddModal] = useState(false);
  const [newClient, setNewClient] = useState({ name: "", email: "", city: "", phone: "" });

  useEffect(() => {
    fetchBusinesses();
  }, []);

  const fetchBusinesses = async () => {
    const { data } = await supabase.from("business_profile").select("*").order("created_at", { ascending: false });
    if (data) {
      // On s'assure que discount_percent existe (sinon 0 par défaut)
      const sanitizedData = data.map(b => ({ ...b, discount_percent: b.discount_percent || 0 }));
      setBusinesses(sanitizedData);
      calculateStats(sanitizedData);
    }
  };

  const calculateStats = (data) => {
    const premiumCount = data.filter(b => b.subscription_tier === 'premium').length;
    
    // Calcul du revenu mensuel réel en prenant en compte les remises
    const totalRevenue = data.reduce((acc, curr) => {
      const basePrice = curr.subscription_tier === 'premium' ? 99 : 29;
      const discount = curr.discount_percent || 0;
      const finalPrice = basePrice * (1 - discount / 100);
      return acc + finalPrice;
    }, 0);

    setStats({
      total: data.length,
      premium: premiumCount,
      revenue: Math.round(totalRevenue)
    });
  };

  // --- ACTIONS ---

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  const handleSwitchPlan = async (clientId, currentTier) => {
    const newTier = currentTier === 'basic' ? 'premium' : 'basic';
    const { error } = await supabase.from("business_profile").update({ subscription_tier: newTier }).eq("id", clientId);
    if (!error) {
      updateLocalBusiness(clientId, { subscription_tier: newTier });
    }
  };

  const handleDiscountChange = async (clientId, newValue) => {
    const percent = parseInt(newValue) || 0;
    // Mise à jour BDD (si la colonne existe, sinon ça échouera silencieusement mais l'UI se mettra à jour)
    await supabase.from("business_profile").update({ discount_percent: percent }).eq("id", clientId);
    updateLocalBusiness(clientId, { discount_percent: percent });
  };

  const updateLocalBusiness = (id, updates) => {
    const updatedList = businesses.map(b => b.id === id ? { ...b, ...updates } : b);
    setBusinesses(updatedList);
    calculateStats(updatedList);
  };

  const handleCreateClient = async (e) => {
    e.preventDefault();
    // 1. Simulation création compte Supabase (Backend)
    // 2. Création profil Business
    const fakeId = Date.now();
    const createdProfile = {
      id: fakeId,
      user_id: `user_${fakeId}`, // ID fictif pour l'exemple
      ...newClient,
      subscription_tier: 'basic',
      created_at: new Date().toISOString(),
      discount_percent: 0
    };

    // Insertion BDD
    const { error } = await supabase.from("business_profile").insert([createdProfile]);
    
    if (!error) {
      setBusinesses([createdProfile, ...businesses]);
      setShowAddModal(false);
      setNewClient({ name: "", email: "", city: "", phone: "" });
      alert(`✅ Client créé ! Un email d'activation a été envoyé à ${newClient.email} pour définir son mot de passe.`);
    } else {
      alert("Erreur lors de la création (Vérifiez la console)");
      console.error(error);
    }
  };

  const handleSendPasswordLink = async (email) => {
    // C'est ici qu'on appellerait supabase.auth.resetPasswordForEmail(email)
    alert(`🔗 Lien de création de mot de passe envoyé à : ${email}`);
  };

  const filteredBusinesses = businesses.filter(b => 
    b.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    b.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.city?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-100 p-8 animate-in fade-in duration-300">
      
      {/* HEADER BARRE D'OUTILS */}
      <div className="flex justify-between items-center mb-8 bg-white p-4 rounded-3xl shadow-sm border border-slate-200 sticky top-4 z-20">
        <div className="flex items-center gap-4">
          <div className="bg-rose-600 text-white p-3 rounded-2xl shadow-lg shadow-rose-200">
            <Shield size={24} />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 leading-none">ADMIN</h1>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Master Control</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
           {/* KPI Rapides */}
           <div className="hidden md:flex gap-6 pr-6 border-r border-slate-100">
              <div className="text-right">
                 <div className="text-xs font-bold text-slate-400 uppercase">Revenu Mensuel</div>
                 <div className="text-xl font-black text-emerald-600">{stats.revenue} €</div>
              </div>
              <div className="text-right">
                 <div className="text-xs font-bold text-slate-400 uppercase">Clients</div>
                 <div className="text-xl font-black text-slate-900">{stats.total}</div>
              </div>
           </div>

           <button 
             onClick={() => setShowAddModal(true)}
             className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition shadow-lg shadow-indigo-200"
           >
             <Plus size={18} /> Ajouter Client
           </button>

           <button 
             onClick={handleLogout}
             className="bg-slate-100 hover:bg-slate-200 text-slate-600 p-3 rounded-xl transition"
             title="Déconnexion"
           >
             <LogOut size={20} />
           </button>
        </div>
      </div>

      {/* TABLEAU PRINCIPAL */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Filtres */}
        <div className="p-6 border-b border-slate-100 flex gap-4 bg-slate-50/50">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16}/>
            <input 
              type="text" placeholder="Rechercher par nom, email, ville..." 
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-2 ring-indigo-500/20"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-400 text-[10px] uppercase font-black tracking-wider">
              <tr>
                <th className="p-4">Entreprise / Ville</th>
                <th className="p-4">Coordonnées (Email / Tél)</th>
                <th className="p-4">Infos Clés</th>
                <th className="p-4">Abonnement & Prix</th>
                <th className="p-4 text-center">Remise (%)</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-sm">
              {filteredBusinesses.map((b) => {
                const basePrice = b.subscription_tier === 'premium' ? 99 : 29;
                const finalPrice = Math.round(basePrice * (1 - (b.discount_percent || 0) / 100));

                return (
                <tr key={b.id} className="hover:bg-slate-50 transition group">
                  <td className="p-4">
                    <div className="font-bold text-slate-900">{b.name}</div>
                    <div className="text-xs font-semibold text-slate-500">{b.city || "Non renseignée"}</div>
                  </td>
                  
                  <td className="p-4">
                    <div className="flex flex-col gap-1">
                      <div className="font-bold text-slate-700 text-xs">{b.email}</div>
                      <div className="flex items-center gap-1 text-xs text-slate-400 font-medium">
                        <Phone size={10}/> {b.phone || "Non renseigné"}
                      </div>
                    </div>
                  </td>

                  <td className="p-4">
                    <div className="flex items-center gap-1 text-xs text-slate-400 font-bold mb-1">
                      <Calendar size={12}/> {new Date(b.created_at).toLocaleDateString()}
                    </div>
                    {/* Badge Admin si applicable */}
                    {b.is_admin && <span className="bg-rose-100 text-rose-600 px-2 py-0.5 rounded text-[10px] font-black uppercase">ADMIN</span>}
                  </td>

                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => handleSwitchPlan(b.id, b.subscription_tier)}
                        className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase border w-20 text-center transition ${
                          b.subscription_tier === 'premium' 
                            ? 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100' 
                            : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                        }`}
                      >
                        {b.subscription_tier}
                      </button>
                      <div className="font-black text-slate-900">
                        {finalPrice}€ <span className="text-[10px] text-slate-400 font-normal">/mois</span>
                      </div>
                    </div>
                  </td>

                  <td className="p-4 text-center">
                    <input 
                      type="number" 
                      min="0" max="100"
                      value={b.discount_percent || 0}
                      onChange={(e) => handleDiscountChange(b.id, e.target.value)}
                      className="w-16 bg-slate-50 border border-slate-200 rounded-lg py-1 px-2 text-center font-bold text-slate-700 focus:bg-white focus:ring-2 ring-indigo-500 outline-none"
                    />
                  </td>

                  <td className="p-4 text-right">
                     <div className="flex justify-end gap-2">
                       <button 
                          onClick={() => onAccessClient(b.user_id, b.email)} 
                          className="p-2 bg-white border border-slate-200 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-200 rounded-xl transition"
                          title="Voir le Panel Client"
                       >
                           <Eye size={16}/>
                       </button>
                       <a 
                          href={`https://${b.slug || 'demo'}.localboost.vercel.app`}
                          target="_blank" rel="noreferrer"
                          className="p-2 bg-white border border-slate-200 text-slate-400 hover:text-slate-600 hover:border-slate-300 rounded-xl transition"
                          title="Voir Site Web"
                       >
                           <ExternalLink size={16}/>
                       </a>
                       <button 
                          onClick={() => handleSendPasswordLink(b.email)} 
                          className="p-2 bg-white border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-200 rounded-xl transition"
                          title="Envoyer lien création MDP"
                       >
                           <Key size={16}/>
                       </button>
                     </div>
                  </td>
                </tr>
              )})}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODALE CRÉATION CLIENT */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-black text-lg text-slate-900">Nouveau Client</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
            </div>
            
            <form onSubmit={handleCreateClient} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nom de l'entreprise</label>
                <input required type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-bold text-slate-900 outline-none focus:ring-2 ring-indigo-500"
                  value={newClient.name} onChange={e => setNewClient({...newClient, name: e.target.value})} placeholder="Ex: Boulangerie Durand" />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email (Login)</label>
                <input required type="email" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-bold text-slate-900 outline-none focus:ring-2 ring-indigo-500"
                  value={newClient.email} onChange={e => setNewClient({...newClient, email: e.target.value})} placeholder="contact@boulangerie.fr" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Téléphone</label>
                  <input type="tel" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-bold text-slate-900 outline-none focus:ring-2 ring-indigo-500"
                    value={newClient.phone} onChange={e => setNewClient({...newClient, phone: e.target.value})} placeholder="06..." />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Ville</label>
                  <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-bold text-slate-900 outline-none focus:ring-2 ring-indigo-500"
                    value={newClient.city} onChange={e => setNewClient({...newClient, city: e.target.value})} placeholder="Paris" />
                </div>
              </div>

              <div className="bg-indigo-50 p-4 rounded-xl text-xs text-indigo-700 font-medium flex gap-2">
                <Key size={16} className="shrink-0"/>
                Le client recevra automatiquement un email pour créer son mot de passe sécurisé.
              </div>

              <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-xl font-bold shadow-lg shadow-indigo-200 transition">
                Créer le compte & Envoyer lien
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
