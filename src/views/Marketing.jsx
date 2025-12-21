import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabase";
import { generatePostContent } from "../lib/openai";
import canvasConfetti from "canvas-confetti";
import {
  Wand2, Instagram, Facebook, Linkedin, Twitter,
  Trash2, Lock, ArrowRight, X, LayoutList,
  Calendar as CalendarIcon, Eye, PenTool, Megaphone,
  MapPin, Smartphone, FileImage, Upload, Sparkles,
  Heart, MessageSquare, Send, Hash, Image as ImageIcon,
  Type, Smile, Clock, Check, AlertCircle, Music
} from "lucide-react";

// Composant personnalisé pour TikTok
const TikTokIcon = ({ size = 24, color = "currentColor" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={color}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M16.09 0C14.26 0 12.51.94 11.4 2.37L6.8 11.62H2.4V12.4h4.4l4.6 9.25c.63 1.15 1.68 1.87 2.85 1.87.53 0 1.05-.17 1.53-.48l5.1-10.2c.52-1.03.79-2.17.79-3.35v-1.1c0-1.18-.27-2.32-.79-3.35l-5.1-10.2C17.14.17 16.62 0 16.09 0zm-4.55 6.27c-.8 0-1.45.65-1.45 1.45v7.9c0 .8.65 1.45 1.45 1.45s1.45-.65 1.45-1.45v-7.9c0-.8-.65-1.45-1.45-1.45z"/>
  </svg>
);

export default function Marketing({ posts, currentPost, setCurrentPost, profile, onUpdate }) {
  // États
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

  // CORRECTION: Réseaux sociaux avec tous les réseaux demandés
  const availableNetworks = [
    { name: "Instagram", icon: <Instagram size={16} />, ratio: "1:1", placeholder: "/placeholder-instagram.png" },
    { name: "Facebook", icon: <Facebook size={16} />, ratio: "1.91:1", placeholder: "/placeholder-facebook.png" },
    { name: "LinkedIn", icon: <Linkedin size={16} />, ratio: "1.91:1", placeholder: "/placeholder-linkedin.png" },
    { name: "Twitter", icon: <Twitter size={16} />, ratio: "16:9", placeholder: "/placeholder-twitter.png" },
    { name: "TikTok", icon: <TikTokIcon size={16} />, ratio: "9:16", placeholder: "/placeholder-tiktok.png" }
  ];

  const availableTones = ["Professionnel", "Amical", "Drôle", "Urgent", "Luxe", "Inspirant"];

  // Protection pour les utilisateurs basic
  if (profile?.subscription_tier === 'basic') {
    return (
      <div className="h-[calc(100vh-100px)] flex flex-col items-center justify-center text-center p-8 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-[2rem] shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-600/20 to-purple-600/20"></div>
        <div className="relative z-10 max-w-lg mx-auto">
          <div className="bg-white/10 w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-8 backdrop-blur-md border border-white/10 shadow-2xl">
            <Lock size={48} className="text-indigo-400"/>
          </div>
          <h2 className="text-3xl font-black mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
            Studio Créatif IA
          </h2>
          <p className="text-slate-300 mb-8">Débloquez la puissance de l'IA pour vos réseaux sociaux et bien plus.</p>
          <button
            onClick={() => alert("Passez Premium via votre Profil !")}
            className="group relative bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-3 mx-auto transition-all shadow-lg hover:shadow-indigo-500/30"
          >
            <span className="absolute inset-0 rounded-2xl border-2 border-indigo-400 opacity-0 group-hover:opacity-100 transition"></span>
            <span className="relative">Débloquer l'accès</span>
            <ArrowRight size={20} className="relative transition-transform group-hover:translate-x-1"/>
          </button>
        </div>
      </div>
    );
  }

  // CORRECTION: Fonction de suppression avec gestion d'erreur
  const handleDeletePost = async (e, postId) => {
    e.stopPropagation();
    if (!window.confirm("Voulez-vous vraiment supprimer ce post ?")) return;

    try {
      setIsLoading(true);
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId)
        .eq('business_id', profile.id);

      if (error) throw error;

      // Mise à jour locale
      setCurrentPost(null);
      onUpdate();
      canvasConfetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // CORRECTION: Génération de contenu avec gestion d'erreur améliorée
  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError("Veuillez entrer une description pour générer du contenu");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const generated = await generatePostContent({
        prompt,
        tone: style,
        platform: activeNetwork,
        businessType: profile.business_type,
        location: profile.city,
        hashtags: hashtags.join(', ')
      });

      if (generated.error) {
        throw new Error(generated.error);
      }

      setCurrentPost({
        ...currentPost,
        content: generated.content,
        image_prompt: generated.imagePrompt,
        hashtags: generated.hashtags
      });

      setHashtags(generated.hashtags);
      setShowConfetti(true);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // CORRECTION: Sauvegarde du post avec validation
  const handleSave = async () => {
    if (!currentPost?.content) {
      setError("Le contenu du post ne peut pas être vide");
      return;
    }

    try {
      setIsLoading(true);
      const postData = {
        ...currentPost,
        business_id: profile.id,
        network: activeNetwork,
        status: "draft",
        scheduled_at: new Date().toISOString(),
        tone: style
      };

      let result;
      if (currentPost.id) {
        // Update existing post
        ({ data: result, error } = await supabase
          .from('posts')
          .update(postData)
          .eq('id', currentPost.id));
      } else {
        // Create new post
        ({ data: result, error } = await supabase
          .from('posts')
          .insert(postData)
          .select());
      }

      if (error) throw error;

      setCurrentPost(result[0]);
      onUpdate();
      canvasConfetti({ particleCount: 200, spread: 100 });
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // CORRECTION: Aperçu du post avec tous les réseaux sociaux
  const renderPostPreview = () => {
    if (!currentPost) return null;

    const networkConfig = availableNetworks.find(n => n.name === activeNetwork) || availableNetworks[0];

    return (
      <div className={`bg-white rounded-[2rem] shadow-xl overflow-hidden border border-gray-100 ${networkConfig.name === 'TikTok' ? 'max-w-[320px]' : 'max-w-[400px]'}`}>
        {/* Header */}
        <div className="flex items-center p-3 border-b border-gray-100">
          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
            {profile?.logo_url ? (
              <img src={profile.logo_url} alt="Logo" className="w-full h-full rounded-full object-cover"/>
            ) : (
              <span className="text-xs font-bold text-indigo-600">{profile?.name?.[0]}</span>
            )}
          </div>
          <div className="ml-2 text-sm font-semibold">{profile?.name}</div>
          <div className="ml-auto text-xs text-gray-500">
            {networkConfig.name === 'TikTok' ? '🎵 Son original' : '✉️'}
          </div>
        </div>

        {/* Image/Video */}
        <div className={`bg-gray-100 ${networkConfig.ratio === '9:16' ? 'aspect-[9/16]' : 'aspect-square'} relative`}>
          {currentPost.image_url ? (
            <img
              src={currentPost.image_url}
              className="w-full h-full object-cover"
              alt="Contenu du post"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <ImageIcon size={48}/>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-3 flex gap-4 text-gray-600">
          <button className="flex items-center gap-1 text-red-500">
            <Heart size={18}/> <span className="text-xs">Aimer</span>
          </button>
          <button className="flex items-center gap-1">
            <MessageSquare size={18}/> <span className="text-xs">Commenter</span>
          </button>
          <button className="flex items-center gap-1">
            <Send size={18}/> <span className="text-xs">Partager</span>
          </button>
          {networkConfig.name === 'Instagram' && (
            <button className="ml-auto">
              <Hash size={18}/>
            </button>
          )}
        </div>

        {/* Contenu */}
        <div className="p-3 pb-4">
          <div className="flex items-center mb-2">
            <span className="text-sm font-semibold mr-2">{profile?.name}</span>
            {profile?.verified && (
              <Check size={14} className="text-blue-500"/>
            )}
          </div>
          <p className="text-sm text-gray-800 mb-3 whitespace-pre-line">
            {currentPost.content}
          </p>
          <div className="flex flex-wrap gap-2">
            {hashtags.map((tag, index) => (
              <span key={index} className="text-xs text-indigo-600 font-medium">
                #{tag}
              </span>
            ))}
          </div>
          {networkConfig.name === 'TikTok' && (
            <div className="mt-2 text-xs text-gray-500 flex items-center gap-1">
              <Music size={12}/> Son original - Nom de la musique
            </div>
          )}
        </div>
      </div>
    );
  };

  // CORRECTION: Interface utilisateur complète
  return (
    <div className="h-[calc(100vh-80px)] flex flex-col md:flex-row bg-gray-50 rounded-[2rem] shadow-md overflow-hidden">
      {/* Sidebar gauche - Liste des posts */}
      <div className={`w-full md:w-64 bg-white border-r border-gray-100 ${viewMode === 'list' ? 'block' : 'hidden md:block'}`}>
        <div className="p-4 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-bold text-gray-800">Mes Posts</h3>
          <button
            onClick={() => setViewMode(viewMode === 'list' ? 'calendar' : 'list')}
            className="p-1 text-gray-600 hover:bg-gray-100 rounded-md"
          >
            {viewMode === 'list' ? <CalendarIcon size={18}/> : <LayoutList size={18}/>}
          </button>
        </div>

        <div className="p-2">
          <button className="w-full bg-indigo-50 text-indigo-600 py-2 px-3 rounded-lg flex items-center gap-2 text-sm font-medium hover:bg-indigo-100 transition">
            <Sparkles size={16}/> Nouveau post IA
          </button>
        </div>

        <div className="h-[calc(100vh-250px)] overflow-y-auto p-2">
          {posts.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <FileImage size={32} className="mx-auto mb-2"/>
              <p className="text-sm">Aucun post encore</p>
              <p className="text-xs mt-1">Créez votre premier post avec l'IA</p>
            </div>
          ) : (
            <div className="space-y-2">
              {posts.map((post) => (
                <div
                  key={post.id}
                  onClick={() => setCurrentPost(post)}
                  className={`p-3 rounded-xl cursor-pointer border ${currentPost?.id === post.id ? 'border-indigo-500 bg-indigo-50' : 'border-transparent hover:bg-gray-50'}`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-lg ${post.network === 'TikTok' ? 'bg-black' : 'bg-gray-100'} flex items-center justify-center`}>
                      {post.network === 'Instagram' && <Instagram size={16} className="text-pink-500"/>}
                      {post.network === 'Facebook' && <Facebook size={16} className="text-blue-600"/>}
                      {post.network === 'LinkedIn' && <Linkedin size={16} className="text-blue-700"/>}
                      {post.network === 'Twitter' && <Twitter size={16} className="text-blue-400"/>}
                      {post.network === 'TikTok' && <Music size={16} className="text-white"/>}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-medium truncate">{post.title || 'Sans titre'}</span>
                        {post.status === 'published' && (
                          <Check size={14} className="text-green-500"/>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 truncate mt-0.5">{post.content?.substring(0, 50)}...</p>
                      <div className="flex gap-2 mt-1">
                        {post.hashtags?.slice(0, 2).map((tag, i) => (
                          <span key={i} className="text-xs text-indigo-500">#{tag}</span>
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={(e) => handleDeletePost(e, post.id)}
                      className="text-gray-400 hover:text-red-500 p-1"
                    >
                      <Trash2 size={16}/>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Contenu principal - Éditeur */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header mobile */}
        <div className="md:hidden p-3 border-b border-gray-100 flex justify-between items-center">
          <button onClick={() => setViewMode('list')} className="p-1">
            <X size={20}/>
          </button>
          <h3 className="font-bold">Éditeur de post</h3>
          <div className="w-8"></div>
        </div>

        {/* Onglets mobile */}
        <div className="md:hidden flex border-b border-gray-100">
          {['editor', 'preview'].map(tab => (
            <button
              key={tab}
              onClick={() => setMobileTab(tab)}
              className={`flex-1 p-3 text-center ${mobileTab === tab ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600'}`}
            >
              {tab === 'editor' ? <PenTool size={16}/> : <Eye size={16}/>}
            </button>
          ))}
        </div>

        {/* Contenu principal */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          {mobileTab === 'editor' && (
            <div className="max-w-2xl mx-auto">
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description du post</label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={`Décrivez le contenu que vous voulez créer pour ${activeNetwork}.
Par exemple: "Promotion de notre nouveau menu été avec des couleurs vives et un ton enthousiaste"`}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 min-h-[120px] resize-y"
                />
                <div className="mt-1 text-xs text-gray-500 flex justify-between">
                  <span>{prompt.length}/500 caractères</span>
                  {error && <span className="text-red-500 flex items-center"><AlertCircle size={12} className="mr-1"/>{error}</span>}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Réseau</label>
                  <select
                    value={activeNetwork}
                    onChange={(e) => setActiveNetwork(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-indigo-500"
                  >
                    {availableNetworks.map(network => (
                      <option key={network.name} value={network.name}>
                        {network.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Style</label>
                  <select
                    value={style}
                    onChange={(e) => setStyle(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-indigo-500"
                  >
                    {availableTones.map(tone => (
                      <option key={tone} value={tone}>{tone}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Source image</label>
                  <select
                    value={imageSource}
                    onChange={(e) => setImageSource(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-indigo-500"
                  >
                    <option value="AI">Générer avec IA</option>
                    <option value="upload">Uploader une image</option>
                    <option value="none">Pas d'image</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hashtags</label>
                  <div className="flex flex-wrap gap-2">
                    {hashtags.map((tag, index) => (
                      <span key={index} className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full flex items-center">
                        #{tag}
                        <button
                          onClick={() => setHashtags(hashtags.filter((_, i) => i !== index))}
                          className="ml-1 hover:text-red-500"
                        >
                          <X size={12}/>
                        </button>
                      </span>
                    ))}
                    {hashtags.length < 5 && (
                      <button
                        onClick={() => {
                          const newTag = prompt.match(/#(\w+)/)?.[1] || '';
                          if (newTag && !hashtags.includes(newTag)) {
                            setHashtags([...hashtags, newTag]);
                          } else {
                            const userTag = window.prompt("Ajouter un hashtag:");
                            if (userTag && !hashtags.includes(userTag)) {
                              setHashtags([...hashtags, userTag]);
                            }
                          }
                        }}
                        className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200"
                      >
                        <Hash size={14}/>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {imageSource === 'upload' && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Uploader une image</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-indigo-500 transition">
                    <Upload size={24} className="mx-auto text-gray-400 mb-2"/>
                    <p className="text-sm text-gray-500">Glissez-déposez une image ou <button className="text-indigo-600 font-medium">parcourez</button></p>
                    <input type="file" className="hidden" />
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={handleGenerate}
                  disabled={isLoading || !prompt.trim()}
                  className="flex-1 bg-indigo-600 text-white py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      Génération...
                    </>
                  ) : (
                    <>
                      <Sparkles size={16}/> GÉNÉRER AVEC IA
                    </>
                  )}
                </button>

                {currentPost && (
                  <button
                    onClick={() => setMobileTab('preview')}
                    className="flex-1 bg-white border border-gray-300 py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-gray-50 transition"
                  >
                    <Eye size={16}/> APERÇU
                  </button>
                )}
              </div>
            </div>
          )}

          {mobileTab === 'preview' && (
            <div className="flex flex-col items-center justify-center h-full p-4">
              {renderPostPreview()}
              <div className="mt-6 w-full max-w-sm">
                <button
                  onClick={handleSave}
                  disabled={isLoading || !currentPost?.content}
                  className="w-full bg-indigo-600 text-white py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      Sauvegarde...
                    </>
                  ) : (
                    <>
                      <Upload size={16}/> ENREGISTRER LE POST
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Aperçu desktop */}
        <div className="hidden md:block w-80 border-l border-gray-100 p-4 bg-gray-50">
          <div className="sticky top-0 space-y-4">
            <h3 className="font-bold text-gray-800 mb-4">Aperçu</h3>
            {currentPost ? (
              <>
                {renderPostPreview()}
                <div className="mt-4">
                  <button
                    onClick={handleSave}
                    disabled={isLoading}
                    className="w-full bg-indigo-600 text-white py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        En cours...
                      </>
                    ) : (
                      <>
                        <Upload size={14}/> ENREGISTRER
                      </>
                    )}
                  </button>
                </div>
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 p-8">
                <Smartphone size={48} className="mb-4"/>
                <p className="text-sm font-medium text-center">Générez un post pour voir l'aperçu</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
