import React, { useState, useEffect } from "react";
// On garde les imports des vues
import Sidebar from "./components/Sidebar";
import Dashboard from "./views/Dashboard";
import Marketing from "./views/Marketing";
import Reviews from "./views/Reviews";
import Customers from "./views/Customers";
import Profile from "./views/Profile";
import Promotions from "./views/Promotions";
import Admin from "./views/Admin";
import AuthForm from "./components/AuthForm";

// --- DONNÉES DE SECOURS (POUR FORCER L'AFFICHAGE) ---
const MOCK_PROFILE = {
  id: 1,
  name: "Mon Entreprise (Mode Secours)",
  city: "Paris",
  subscription_tier: "premium"
};

const MOCK_PLANS = {
  basic: { label: "Starter" },
  premium: { label: "Premium" }
};

export default function App() {
  // On force l'état connecté pour tester l'interface
  const [session, setSession] = useState(true); 
  const [activeTab, setActiveTab] = useState("dashboard");
  
  // On ne met PAS de loading pour voir l'interface tout de suite
  const [loading, setLoading] = useState(false);
  
  // Données factices pour tester l'affichage
  const [profile, setProfile] = useState(MOCK_PROFILE);
  const [posts, setPosts] = useState([]);
  const [currentPost, setCurrentPost] = useState(null);

  // Fonction simplifiée pour ajouter un post localement
  const handlePostUpdate = (newPost) => {
    setPosts([newPost, ...posts]);
    alert("Post créé (Mode Local) !");
  };

  // --- RENDU DE L'INTERFACE ---
  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans text-slate-900 overflow-hidden">
      {/* Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} profile={profile} />
      
      <main className="flex-1 overflow-y-auto w-full pt-8 md:ml-72">
        <header className="px-8 pb-8 flex justify-between items-center sticky top-0 bg-[#F8FAFC]/95 z-30">
          <h2 className="text-3xl font-black text-slate-900 capitalize">{activeTab}</h2>
          <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold uppercase">
             {MOCK_PLANS[profile.subscription_tier].label}
          </span>
        </header>

        <div className="px-8 pb-12">
          {activeTab === "dashboard" && (
            <Dashboard 
              stats={{ reviews: 0, clients: 0, posts: posts.length }} 
              posts={posts} 
              onGenerate={() => setActiveTab("generator")} 
            />
          )}
          
          {activeTab === "generator" && (
            <Marketing 
              posts={posts} 
              currentPost={currentPost} 
              setCurrentPost={setCurrentPost} 
              profile={profile}
              onUpdate={handlePostUpdate}
            />
          )}

          {/* Les autres onglets sont vides pour le test */}
          {activeTab === "reviews" && <div className="p-10 text-center">Page Avis (Test)</div>}
          {activeTab === "customers" && <div className="p-10 text-center">Page Clients (Test)</div>}
          {activeTab === "profile" && <div className="p-10 text-center">Page Profil (Test)</div>}
        </div>
      </main>
    </div>
  );
}
