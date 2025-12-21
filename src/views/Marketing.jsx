import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabase";
import { generatePostContent } from "../lib/openai";
import canvasConfetti from "canvas-confetti";
import {
  Wand2, Instagram, Facebook, Linkedin, Twitter, Tiktok,
  Trash2, Lock, ArrowRight, X, LayoutList, Calendar as CalendarIcon,
  Eye, PenTool, Megaphone, MapPin, Smartphone, FileImage, Upload,
  Sparkles, Heart, MessageSquare, Send, Hash, Image as ImageIcon,
  Type, Smile, Clock, Check, AlertCircle
} from "lucide-react";

export default function Marketing({ posts, currentPost, setCurrentPost, profile, onUpdate }) {
  // États existants
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeNetwork, setActiveNetwork] = useState("Instagram");
  const [imageSource, setImageSource] = useState("AI");
  const [style, setStyle] = useState("Professionnel");
  const [hashtags, setHashtags] = useState([]);
  const [viewMode, setViewMode] = useState("list");
  const [mobileTab, setMobileTab] = useState("editor");
  const [error, setError] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const confettiRef = useRef(null);

  // CORRECTION : Suppression du gentilé (demonym) comme demandé
  // CORRECTION : Ajout des réseaux sociaux manquants (Facebook, LinkedIn)
  // CORRECTION : Amélioration des icônes d'actions dans l'aperçu

  const availableTones = ["Professionnel", "Amical", "Drôle", "Urgent", "Luxe", "Inspirant"];
  const availableNetworks = [
    { name: "Instagram", icon: <Instagram size={14} />, ratio: "width=1080&height=1080" },
    { name: "Facebook", icon: <Facebook size={14} />, ratio: "width=1200&height=630" },
    { name: "LinkedIn", icon: <Linkedin size={14} />, ratio: "width=1200&height=627" },
    { name: "Twitter", icon: <Twitter size={14} />, ratio: "width=1200&height=675" },
    { name: "TikTok", icon: <Tiktok size={14} />, ratio: "width=1080&height=1920" }
  ];

  // Protection pour les utilisateurs basic
  if (profile?.subscription_tier === 'basic') {
    return (
      <div className="h-[calc(100vh-100px)] flex flex-col items-center justify-center text-center p-8 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-[2rem] text-white shadow-xl relative overflow-hidden animate-in fade-in duration-700">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="relative z-10 max-w-lg mx-auto">
          <div className="bg-white/10 w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-8 backdrop-blur-md border border-white/10 shadow-2xl">
            <Sparkles size={48} className="text-indigo-400" />
          </div>
          <h2 className="text-3xl font-black mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
            Studio Créatif IA
          </h2>
          <p className="text-slate-300 mb-8">
            Générez des posts professionnels pour vos réseaux sociaux en quelques clics avec l'IA.
          </p>
          <button
            onClick={() => alert("Passez Premium via votre Profil pour débloquer cette fonctionnalité !")}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-3 mx-auto transition-all shadow-lg hover:shadow-indigo-500/30"
          >
            Passer Premium <ArrowRight size={20} />
          </button>
        </div>
      </div>
    );
  }

  // Gestion des erreurs avec timeout
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Animation de confettis
  useEffect(() => {
    if (showConfetti && confettiRef.current) {
      canvasConfetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#4f46e5', '#7c3aed', '#ec4899', '#f59e0b'],
        scalar: 1.2
      });
      setShowConfetti(false);
    }
  }, [showConfetti]);

  const handleDeletePost = async (e, postId) => {
    e.stopPropagation();
    if (!window.confirm("Voulez-vous vraiment supprimer ce post ? Cette action est irréversible.")) return;

    try {
      const { error } = await supabase.from("posts").delete().eq("id", postId);
      if (error) throw error;
      if (onUpdate) onUpdate(null);
      setCurrentPost(null);
    } catch (error) {
      setError("Échec de la suppression. Veuillez réessayer.");
      console.error("Delete error:", error);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError("Le fichier est trop volumineux (max 5Mo)");
      return;
    }

    try {
      setIsLoading(true);
      const fileName = `${profile?.id || 'temp'}/${Date.now()}_${file.name.replace(/\s/g, '_')}`;
      const { error } = await supabase.storage.from("user_uploads").upload(fileName, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage.from("user_uploads").getPublicUrl(fileName);
      setCurrentPost({ ...currentPost, image_url: publicUrl });
      setImageSource("UPLOAD");
    } catch (error) {
      setError("Erreur lors de l'upload: " + error.message);
      console.error("Upload error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError("Veuillez décrire votre idée de post");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // CORRECTION: Suppression du gentilé (demonym) comme demandé
      const locationInfo = profile?.city
        ? `Localisation: ${profile.city}.`
        : "";

      const networkConfig = availableNetworks.find(n => n.name === activeNetwork);
      const fullPrompt = `
        Rédige un post ${style.toLowerCase()} pour ${activeNetwork}.
        Sujet: ${prompt}.
        ${locationInfo}
        Format: ${networkConfig?.ratio.includes('1080') ? 'carré' : 'paysage'}.
        Ton: ${style}.
        Inclus 2-3 hashtags pertinents en français.
        Sois concis et engageant.
      `;

      const aiResult = await generatePostContent(fullPrompt, profile);

      if (aiResult) {
        let finalImage = currentPost?.image_url;

        if (imageSource === "AI" && aiResult.image_keyword) {
          const network = availableNetworks.find(n => n.name === activeNetwork);
          finalImage = `https://image.pollinations.ai/prompt/${encodeURIComponent(aiResult.image_keyword)}?${network?.ratio}&nologo=true`;
        }

        const newPost = {
          id: currentPost?.id || Date.now(),
          business_id: profile?.id,
          title: aiResult.title || `Post ${activeNetwork} - ${new Date().toLocaleDateString()}`,
          content: aiResult.content,
          image_url: finalImage,
          networks: [activeNetwork],
          created_at: new Date().toISOString(),
          style: style,
        };

        setCurrentPost(newPost);

        // Génération automatique de hashtags
        const autoHashtags = [
          `#${profile?.city?.replace(/\s/g, '') || 'Local'}`,
          `#${style.toLowerCase()}`,
          ...(aiResult.hashtags || [])
        ].slice(0, 3);

        setHashtags(autoHashtags);

        if (window.innerWidth < 1024) {
          setMobileTab("preview");
        }
      }
    } catch (e) {
      console.error("Generation error:", e);
      setError("Échec de la génération. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!currentPost || !profile?.id) {
      setError("Aucun post à enregistrer");
      return;
    }

    try {
      setIsLoading(true);
      const postData = { ...currentPost };

      // Assure que l'ID est bien un UUID si c'est une nouvelle création
      if (typeof postData.id === 'number') {
        delete postData.id;
      }

      postData.business_id = profile.id;

      const { data: savedPost, error } = await supabase
        .from("posts")
        .upsert([postData])
        .select();

      if (error) throw error;

      if (onUpdate) {
        onUpdate(savedPost[0]);
        setShowConfetti(true);
      }
    } catch (error) {
      console.error("Save error:", error);
      setError("Échec de l'enregistrement. Veuillez vérifier votre connexion.");
    } finally {
      setIsLoading(false);
    }
  };

  const renderCalendar = () => {
    const today = new Date();
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    // Trouver le premier jour du mois pour le décalage
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).getDay();
    const offsetDays = firstDay === 0 ? 6 : firstDay - 1; // Convertir en index lundis=0

    return (
      <div className="p-2">
        {/* En-tête des jours */}
        <div className="grid grid-cols-7 gap-1 mb-2 text-center">
          {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(day => (
            <div key={day} className="text-[10px] font-bold text-slate-400">{day}</div>
          ))}
        </div>

        {/* Jours du mois */}
        <div className="grid grid-cols-7 gap-1">
          {/* Cases vides pour le décalage */}
          {Array(offsetDays).fill(null).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square"></div>
          ))}

          {/* Jours avec posts */}
          {days.map(day => {
            const postsForDay = posts.filter(p => {
              const d = new Date(p.created_at);
              return d.getDate() === day && d.getMonth() === today.getMonth();
            });

            return (
              <div
                key={day}
                onClick={() => {
                  if (postsForDay.length > 0) {
                    setCurrentPost(postsForDay[0]);
                    setMobileTab("preview");
                  }
                }}
                className={`aspect-square rounded-lg border flex flex-col items-center justify-start pt-1 relative cursor-pointer transition-all
                  ${postsForDay.length > 0
                    ? 'bg-indigo-50 border-indigo-200 hover:bg-indigo-100'
                    : 'bg-slate-50 border-slate-100 hover:bg-slate-100'}`}
              >
                <span className={`text-[10px] font-bold ${postsForDay.length > 0 ? 'text-indigo-600' : 'text-slate-400'}`}>
                  {day}
                </span>
                {postsForDay.length > 0 && (
                  <div className="w-2 h-2 mt-1 rounded-full bg-indigo-500"></div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // CORRECTION: Composant pour afficher les erreurs
  const ErrorDisplay = ({ message }) => {
    if (!message) return null;

    return (
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-red-500/90 text-white text-xs px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg z-50 animate-in fade-in slide-in-from-bottom-2">
        <AlertCircle size={14} />
        <span>{message}</span>
        <button onClick={() => setError(null)} className="ml-2 p-1">
          <X size={12} />
        </button>
      </div>
    );
  };

  return (
    <div className="flex flex-col lg:flex-row h-full gap-6 pb-20 lg:pb-6 animate-in fade-in duration-500 relative">
      <ErrorDisplay message={error} />

      {/* MENU MOBILE - Amélioration visuelle */}
      <div className="lg:hidden flex bg-white/80 backdrop-blur-md rounded-2xl p-1 mb-4 shadow-sm border border-slate-100 shrink-0 sticky top-0 z-20 mx-4 md:mx-0">
        {['history', 'editor', 'preview'].map(tab => (
          <button
            key={tab}
            onClick={() => setMobileTab(tab)}
            className={`flex-1 py-2 text-xs font-bold rounded-xl flex items-center gap-2 justify-center transition-all ${
              mobileTab === tab
                ? 'bg-slate-900 text-white shadow-md'
                : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            {tab === 'history' && <LayoutList size={14} />}
            {tab === 'editor' && <PenTool size={14} />}
            {tab === 'preview' && <Eye size={14} />}
            {tab === 'history' && 'Historique'}
            {tab === 'editor' && 'Éditeur'}
            {tab === 'preview' && 'Aperçu'}
          </button>
        ))}
      </div>

      {/* COLONNE GAUCHE : HISTORIQUE - Améliorations visuelles */}
      <div className={`${mobileTab === 'history' ? 'flex' : 'hidden'} lg:flex w-full lg:w-80 flex-col bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden shrink-0 h-[60vh] lg:h-auto`}>
        <div className="p-4 border-b bg-slate-50 flex justify-between items-center shrink-0">
          <div className="font-bold text-xs uppercase text-slate-400 flex items-center gap-2">
            {viewMode === 'list' ? <LayoutList size={14}/> : <CalendarIcon size={14}/>}
            {viewMode === 'list' ? "Vos Créations" : "Calendrier"}
          </div>
          <div className="flex bg-slate-200 rounded-lg p-1 gap-1">
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md ${viewMode === 'list' ? 'bg-white shadow' : ''}`}
              aria-label="Vue liste"
            >
              <LayoutList size={14}/>
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`p-1.5 rounded-md ${viewMode === 'calendar' ? 'bg-white shadow' : ''}`}
              aria-label="Vue calendrier"
            >
              <CalendarIcon size={14}/>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {viewMode === 'list' ? (
            <div className="p-3 space-y-2">
              {posts.length > 0 ? (
                posts.map(post => {
                  const networkIcon = availableNetworks.find(n => post.networks?.includes(n.name))?.icon || <ImageIcon size={12} />;

                  return (
                    <div
                      key={post.id}
                      onClick={() => {
                        setCurrentPost(post);
                        setMobileTab("preview");
                      }}
                      className="flex gap-3 p-2 rounded-xl hover:bg-slate-50 cursor-pointer border border-transparent hover:border-slate-100 transition group relative"
                    >
                      <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                        {post.image_url ? (
                          <img
                            src={post.image_url}
                            className="w-full h-full rounded-lg object-cover"
                            alt="Post"
                            onError={(e) => {
                              e.target.src = `/placeholder-${post.networks?.[0]?.toLowerCase() || 'generic'}.png`;
                            }}
                          />
                        ) : (
                          <div className="text-slate-400 text-[8px] text-center">Aucune image</div>
                        )}
                      </div>

                      <div className="overflow-hidden flex-1">
                        <div className="flex items-center gap-1">
                          <div className="text-[10px]">{networkIcon}</div>
                          <div className="font-bold text-xs truncate text-slate-800">{post.title || "Post sans titre"}</div>
                        </div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Clock size={10} />
                          {new Date(post.created_at).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'short'
                          })}
                        </div>
                      </div>

                      <button
                        onClick={(e) => handleDeletePost(e, post.id)}
                        className="absolute top-1 right-1 bg-white rounded-full p-1 text-slate-300 hover:text-rose-500 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label="Supprimer le post"
                      >
                        <Trash2 size={12}/>
                      </button>
                    </div>
                  );
                })
              ) : (
                <div className="text-center text-slate-400 text-xs py-10 flex flex-col items-center gap-2">
                  <FileImage size={32} className="opacity-30" />
                  <p>Aucun post créé pour le moment</p>
                  <button
                    onClick={() => setMobileTab("editor")}
                    className="bg-indigo-50 text-indigo-600 text-[10px] font-bold px-3 py-1.5 rounded-lg mt-2"
                  >
                    Créer mon premier post
                  </button>
                </div>
              )}
            </div>
          ) : renderCalendar()}
        </div>
      </div>

      {/* COLONNE CENTRE : ÉDITEUR - Refonte complète */}
      <div className={`${mobileTab === 'editor' ? 'flex' : 'hidden'} lg:flex flex-1 flex-col gap-4 overflow-y-auto custom-scrollbar`}>
        {/* EN-TÊTE */}
        <div className="flex justify-between items-center bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm">
          <h2 className="font-black text-slate-900 text-lg flex items-center gap-2">
            <Sparkles className="text-indigo-600"/> Studio Créatif
          </h2>
          {currentPost && (
            <button
              onClick={() => {
                if (window.confirm("Voulez-vous vraiment réinitialiser le post en cours ?")) {
                  setCurrentPost(null);
                  setPrompt("");
                  setImageSource("AI");
                }
              }}
              className="text-xs font-bold text-slate-400 hover:text-red-500 flex gap-1 items-center transition-colors"
            >
              <Trash2 size={12}/> Réinitialiser
            </button>
          )}
        </div>

        {/* PARAMÈTRES - Organisation améliorée */}
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-6">
          {/* Réseaux sociaux */}
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">
              RÉSEAU SOCIAL
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {availableNetworks.map(net => (
                <button
                  key={net.name}
                  onClick={() => setActiveNetwork(net.name)}
                  className={`py-3 px-2 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all ${
                    activeNetwork === net.name
                      ? "bg-slate-900 text-white border-slate-900 shadow-md"
                      : "text-slate-500 border-slate-100 hover:bg-slate-50"
                  }`}
                  aria-label={`Post pour ${net.name}`}
                >
                  <div className="text-lg">{net.icon}</div>
                  <span className="text-[9px]">{net.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Style et autres paramètres */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Ton du message */}
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <Megaphone size={14}/> TON DU MESSAGE
              </label>
              <div className="flex flex-wrap gap-2">
                {availableTones.map(ton => (
                  <button
                    key={ton}
                    onClick={() => setStyle(ton)}
                    className={`py-2 px-3 rounded-xl border text-[10px] font-bold transition-all ${
                      style === ton
                        ? "bg-indigo-100 text-indigo-700 border-indigo-200 shadow-sm"
                        : "text-slate-500 border-slate-100 hover:bg-slate-50"
                    }`}
                  >
                    {ton}
                  </button>
                ))}
              </div>
            </div>

            {/* Hashtags automatiques */}
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <Hash size={14}/> HASHTAGS SUGGÉRÉS
              </label>
              <div className="flex flex-wrap gap-2">
                {hashtags.map((tag, index) => (
                  <div
                    key={index}
                    className="bg-indigo-50 text-indigo-700 text-[10px] font-bold px-3 py-1 rounded-xl flex items-center gap-1"
                  >
                    {tag}
                    <button
                      onClick={() => setHashtags(hashtags.filter((_, i) => i !== index))}
                      className="text-indigo-400 hover:text-indigo-600"
                    >
                      <X size={10} />
                    </button>
                  </div>
                ))}
                {hashtags.length < 5 && (
                  <button
                    onClick={() => {
                      const newTag = prompt(`Ajouter un hashtag (ex: #Promo)`);
                      if (newTag && !hashtags.includes(newTag)) {
                        setHashtags([...hashtags, newTag]);
                      }
                    }}
                    className="text-[10px] text-slate-400 hover:text-indigo-600 flex items-center gap-1"
                  >
                    <Smile size={12} /> Ajouter
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* PROMPT ET GÉNÉRATION - Interface améliorée */}
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex-1 flex flex-col">
          {/* Options d'image */}
          <div className="flex flex-wrap gap-2 mb-4 bg-slate-50 p-1.5 rounded-xl w-fit border border-slate-100">
            <button
              onClick={() => setImageSource("AI")}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 ${
                imageSource === 'AI'
                  ? 'bg-white shadow text-indigo-600 border border-slate-200'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Sparkles size={14} /> Image IA
            </button>
            <button
              onClick={() => document.getElementById('uploadInput').click()}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 ${
                imageSource === 'UPLOAD'
                  ? 'bg-white shadow text-indigo-600 border border-slate-200'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Upload size={14} /> Importer
            </button>
            <input
              id="uploadInput"
              type="file"
              className="hidden"
              onChange={handleFileUpload}
              accept="image/*"
              disabled={isLoading}
            />
          </div>

          {/* Zone de texte avec suggestions */}
          <div className="relative flex-1 mb-4">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={`Exemples :
- "Promotion spéciale ce week-end : -30% sur tous les gâteaux"
- "Annonce pour notre nouvel atelier de pâtisserie le 15 juin"
- "Post pour souhaiter un joyeux anniversaire à notre commerce"`}
              className="w-full h-32 md:h-40 bg-slate-50 rounded-2xl p-4 text-sm outline-none resize-none mb-4 focus:ring-2 ring-indigo-100 transition-all border border-slate-100 placeholder:text-slate-400 placeholder:text-[11px] w-full"
            />

            {/* Suggestions de prompts */}
            <div className="grid grid-cols-2 gap-2 mt-2">
              {[
                "Promotion sur [produit]",
                "Événement spécial le [date]",
                "Nouveau produit : [description]",
                "Témoignage client satisfait",
                "Conseil du jour : [conseil]",
                "Notre histoire en bref"
              ].map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => setPrompt(suggestion)}
                  className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-600 px-2 py-1 rounded-lg truncate text-left transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>

          {/* Bouton de génération */}
          <button
            onClick={handleGenerate}
            disabled={isLoading || !prompt.trim()}
            className={`w-full py-4 rounded-xl font-bold shadow-lg flex justify-center items-center gap-2 transition-all mt-auto ${
              isLoading || !prompt.trim()
                ? "bg-indigo-300 text-white cursor-not-allowed"
                : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white hover:shadow-indigo-500/30"
            }`}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Génération en cours...
              </>
            ) : (
              <>
                <Wand2 size={16} /> Générer le Post
              </>
            )}
          </button>

          {/* Aide contextuelle */}
          {prompt.length > 0 && prompt.length < 10 && (
            <p className="text-[10px] text-slate-400 mt-2 text-center">
              <Type size={12} className="inline mr-1" />
              Votre description est un peu courte. Ajoutez plus de détails pour un meilleur résultat !
            </p>
          )}
        </div>
      </div>

      {/* COLONNE DROITE : PRÉVISUALISATION - Refonte complète */}
      <div className={`${mobileTab === 'preview' ? 'flex' : 'hidden'} lg:flex w-full lg:w-[420px] bg-gradient-to-br from-indigo-50 to-purple-50 rounded-[2.5rem] border border-slate-100 p-4 lg:p-6 flex-col items-center justify-center shrink-0 overflow-hidden relative min-h-[500px]`}>
        <div className="text-center mb-4 z-10">
          <h3 className="font-black text-slate-900 text-lg flex items-center justify-center gap-2">
            {availableNetworks.find(n => n.name === activeNetwork)?.icon}
            Aperçu {activeNetwork}
          </h3>
          <p className="text-xs text-slate-500">Prévisualisation du rendu final</p>
        </div>

        {/* CADRE TÉLÉPHONE - Amélioration visuelle */}
        <div className="relative w-full max-w-[300px] h-[550px] lg:h-[600px] bg-black rounded-[3rem] border-8 border-slate-900 shadow-2xl flex flex-col overflow-hidden z-10 mx-auto">
          {/* Encoche */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-900 rounded-b-2xl z-30 pointer-events-none">
            <div className="absolute left-3 top-1.5 w-12 h-1.5 bg-white rounded-full"></div>
            <div className="absolute right-3 top-1.5 w-2 h-1.5 bg-white rounded-full"></div>
          </div>

          {/* Écran */}
          <div
            className="flex-1 overflow-y-auto bg-white rounded-t-[2.5rem] w-full h-full pt-6"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              WebkitMaskImage: 'linear-gradient(to bottom, black 90%, transparent 100%)',
              maskImage: 'linear-gradient(to bottom, black 90%, transparent 100%)'
            }}
          >
            {currentPost ? (
              <>
                {/* En-tête du post */}
                <div className="h-14 border-b flex items-center px-4 gap-3 sticky top-0 z-20 bg-white/95 backdrop-blur">
                  <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                    {profile?.name?.[0]}
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-bold truncate">{profile?.name}</div>
                    <div className="text-[10px] text-slate-500 truncate">
                      {profile?.city ? `${profile.city}` : "Localisation non définie"}
                    </div>
                  </div>
                  <button className="text-slate-500 hover:text-slate-700">
                    <X size={16} />
                  </button>
                </div>

                {/* Image du post */}
                <div className="w-full bg-slate-100 aspect-square relative">
                  {currentPost.image_url ? (
                    <>
                      <img
                        src={currentPost.image_url}
                        className="w-full h-full object-cover block"
                        alt="Contenu du post"
                        onError={(e) => {
                          e.target.src = `/placeholder-${activeNetwork.toLowerCase()}.png`;
                        }}
                      />
                      {/* CORRECTION: Remplacement du cœur noir par des icônes plus appropriées */}
                      <div className="absolute top-2 right-2 flex gap-2">
                        {activeNetwork === 'Instagram' && (
                          <>
                            <div className="bg-white/80 backdrop-blur p-1.5 rounded-full">
                              <Heart size={16} className="text-red-500 fill-red-500" />
                            </div>
                            <div className="bg-white/80 backdrop-blur p-1.5 rounded-full">
                              <MessageSquare size={16} className="text-slate-600" />
                            </div>
                            <div className="bg-white/80 backdrop-blur p-1.5 rounded-full">
                              <Send size={16} className="text-slate-600" />
                            </div>
                          </>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-200 text-slate-400 text-xs">
                      <ImageIcon size={24} />
                    </div>
                  )}
                </div>

                {/* Actions spécifiques au réseau */}
                <div className="px-4 py-3 flex gap-4">
                  {activeNetwork === 'Instagram' && (
                    <>
                      <div className="flex items-center gap-1">
                        <Heart size={16} className="text-slate-600" />
                        <span className="text-[10px]">Aimer</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageSquare size={16} className="text-slate-600" />
                        <span className="text-[10px]">Commenter</span>
                      </div>
                      <div className="flex items-center gap-1 ml-auto">
                        <Send size={16} className="text-slate-600" />
                        <span className="text-[10px]">Partager</span>
                      </div>
                    </>
                  )}

                  {activeNetwork === 'Facebook' && (
                    <>
                      <div className="flex items-center gap-1">
                        <Heart size={16} className="text-blue-600" />
                        <span className="text-[10px]">J'aime</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageSquare size={16} className="text-blue-600" />
                        <span className="text-[10px]">Commenter</span>
                      </div>
                      <div className="flex items-center gap-1 ml-auto">
                        <Send size={16} className="text-blue-600" />
                        <span className="text-[10px]">Partager</span>
                      </div>
                    </>
                  )}
                </div>

                {/* Contenu textuel */}
                <div className="px-4 pb-20">
                  <p className="text-[11px] text-slate-800 leading-relaxed mb-2">
                    <span className="font-bold mr-1">{profile?.name}</span>
                    {currentPost.content}
                  </p>

                  {/* Hashtags */}
                  {hashtags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {hashtags.map((tag, index) => (
                        <span
                          key={index}
                          className="text-[10px] text-indigo-600 font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Date de publication simulée */}
                  <div className="text-[9px] text-slate-400 mt-3">
                    {new Date(currentPost.created_at).toLocaleString('fr-FR', {
                      weekday: 'short',
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-300 p-8 text-center">
                <Smartphone size={48} className="mb-4 opacity-50" />
                <p className="text-xs font-bold mb-2">Aucun post généré</p>
                <p className="text-[10px] mb-4">Remplissez le formulaire et cliquez sur "Générer"</p>
                <button
                  onClick={() => setMobileTab("editor")}
                  className="bg-indigo-600 text-white text-[10px] font-bold px-4 py-2 rounded-xl hover:bg-indigo-700 transition-colors"
                >
                  Créer un post maintenant
                </button>
              </div>
            )}
          </div>

          {/* Bouton d'enregistrement */}
          {currentPost && (
            <div className="absolute bottom-0 left-0 w-full p-4 bg-white/90 backdrop-blur z-30 rounded-b-[2.5rem] border-t border-slate-100">
              <button
                onClick={handleSave}
                disabled={isLoading}
                className={`w-full py-3 rounded-xl font-bold text-xs shadow-lg flex items-center justify-center gap-2 transition-all ${
                  isLoading
                    ? "bg-indigo-300 text-white cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-700 text-white hover:shadow-indigo-500/30"
                }`}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <Check size={14} /> ENREGISTRER LE POST
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
