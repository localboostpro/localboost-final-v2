// pages/Marketing.jsx
import { useState, useEffect, useRef } from 'react';
import { generatePostContent } from '../lib/openai';
import {
  Instagram, Facebook, Linkedin, Twitter, Music as TikTok,
  Wand2, Send, Trash2, Edit2, Eye, Check, X, Sparkles,
  BarChart2, MessageSquare, User, Settings, HelpCircle
} from 'lucide-react';

const PLATFORM_CONFIG = {
  Instagram: { icon: Instagram, color: "text-pink-500", ratio: "1:1" },
  Facebook: { icon: Facebook, color: "text-blue-600", ratio: "1.91:1" },
  LinkedIn: { icon: Linkedin, color: "text-blue-700", ratio: "1.91:1" },
  Twitter: { icon: Twitter, color: "text-blue-400", ratio: "16:9" },
  TikTok: { icon: TikTok, color: "text-black", ratio: "9:16" }
};

export default function MarketingStudio({ profile }) {
  // États principaux
  const [posts, setPosts] = useState([]);
  const [currentPost, setCurrentPost] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('generator');
  const [prompt, setPrompt] = useState('');
  const [platform, setPlatform] = useState('Instagram');
  const [tone, setTone] = useState('Amical');
  const [error, setError] = useState(null);

  // Chargement des posts existants
  useEffect(() => {
    // Dans une vraie app: fetch('/api/posts')
    const demoPosts = [
      {
        id: 1,
        title: "Promo Été",
        content: "🌞 Profitez de -20% sur nos glaces artisanales! 🍦 Offre valable jusqu'au 31/08",
        platform: "Instagram",
        status: "published",
        image: "/placeholder-instagram.png",
        metrics: { likes: 120, comments: 24 },
        createdAt: "2023-06-15"
      }
    ];
    setPosts(demoPosts);
  }, []);

  // Génération de post avec votre API
  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError("Veuillez entrer une description pour votre post");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const locationInfo = profile?.city ?
        `Localisation: ${profile.city}. Utilise des références locales.` :
        "Localisation non spécifiée";

      const fullPrompt = `
      Plateforme: ${platform}
      Ton: ${tone}
      Sujet: ${prompt}
      ${locationInfo}
      Instructions supplémentaires:
      - Utilise des emojis pertinents
      - Reste concis (max 280 caractères)
      - Propose 2-3 hashtags en français`;

      const result = await generatePostContent(fullPrompt, profile);

      const newPost = {
        id: Date.now(),
        title: result.title,
        content: result.content,
        platform: platform,
        status: "draft",
        hashtags: result.hashtags || ["#Local", "#Business"],
        imageKeyword: result.image_keyword,
        tips: result.platform_tips,
        createdAt: new Date().toISOString(),
        image: getPlatformPlaceholder(platform)
      };

      setPosts([newPost, ...posts]);
      setCurrentPost(newPost);
      setActiveTab('preview');

    } catch (err) {
      console.error("Génération échouée:", err);
      setError(err.message || "Échec de la génération");
    } finally {
      setIsLoading(false);
    }
  };

  // Publier un post
  const handlePublish = (postId) => {
    setPosts(posts.map(post =>
      post.id === postId ? { ...post, status: "published" } : post
    ));
  };

  // Supprimer un post
  const handleDelete = (postId) => {
    if (window.confirm("Supprimer ce post?")) {
      setPosts(posts.filter(post => post.id !== postId));
      if (currentPost?.id === postId) setCurrentPost(null);
    }
  };

  // Helper pour les images placeholder
  const getPlatformPlaceholder = (platform) => {
    return `/placeholder-${platform.toLowerCase()}.png`;
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 p-4 flex flex-col">
        <div className="mb-8">
          <h1 className="text-xl font-bold text-indigo-600">LocalBoost</h1>
          <p className="text-xs text-gray-500">Studio Marketing IA</p>
        </div>

        <button
          onClick={() => { setActiveTab('generator'); setCurrentPost(null) }}
          className={`w-full flex items-center gap-3 p-3 rounded-lg mb-2 ${activeTab === 'generator' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-100'}`}
        >
          <Wand2 size={18} /> Générateur IA
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`w-full flex items-center gap-3 p-3 rounded-lg ${activeTab === 'history' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-100'}`}
        >
          <BarChart2 size={18} /> Historique
        </button>

        <div className="mt-auto pt-4 border-t border-gray-200">
          <button className="w-full flex items-center gap-3 p-3 rounded-lg text-gray-600 hover:bg-gray-100">
            <Settings size={18} /> Paramètres
          </button>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 bg-white">
          <h2 className="text-lg font-semibold">
            {activeTab === 'generator' ? 'Générateur de Posts' :
             activeTab === 'preview' ? 'Aperçu' : 'Historique'}
          </h2>
        </div>

        {/* Générateur de posts */}
        {activeTab === 'generator' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-lg font-medium mb-4">Créer un nouveau post</h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Plateforme</label>
                  <select
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  >
                    {Object.keys(PLATFORM_CONFIG).map(plat => (
                      <option key={plat} value={plat}>{plat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Ton</label>
                  <select
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  >
                    {['Amical', 'Professionnel', 'Drôle', 'Inspirant'].map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Description du post</label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Ex: Promotion sur nos nouveaux produits, événement spécial, etc."
                  className="w-full p-3 border border-gray-300 rounded-lg min-h-[120px] focus:ring-2 focus:ring-indigo-500"
                  maxLength={300}
                />
                <p className="text-xs text-gray-500 mt-1 text-right">{prompt.length}/300</p>
              </div>

              {error && (
                <div className="p-3 bg-red-50 text-red-600 rounded-lg mb-4 text-sm">
                  {error}
                </div>
              )}

              <button
                onClick={handleGenerate}
                disabled={isLoading}
                className={`w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-indigo-700'}`}
              >
                {isLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Génération en cours...
                  </>
                ) : (
                  <>
                    <Sparkles size={18} /> Générer avec l'IA
                  </>
                )}
              </button>
            </div>

            <div className="bg-indigo-50 p-6 rounded-xl border border-indigo-100">
              <h3 className="text-lg font-medium mb-3 text-indigo-800">Conseils</h3>
              <ul className="space-y-2 text-sm text-indigo-700">
                <li className="flex items-start gap-2">
                  <Check size={16} className="text-green-500 shrink-0 mt-0.5" />
                  Soyez précis dans votre description pour des résultats optimaux
                </li>
                <li className="flex items-start gap-2">
                  <Check size={16} className="text-green-500 shrink-0 mt-0.5" />
                  L'IA adapte le contenu selon la plateforme sélectionnée
                </li>
                <li className="flex items-start gap-2">
                  <Check size={16} className="text-green-500 shrink-0 mt-0.5" />
                  Vous pourrez modifier le résultat avant publication
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* Aperçu du post */}
        {activeTab === 'preview' && currentPost && (
          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-2xl mx-auto">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Header */}
                <div className="p-4 border-b border-gray-100 flex items-center gap-3">
                  <button
                    onClick={() => setActiveTab('generator')}
                    className="p-1 text-gray-500 hover:text-gray-700"
                  >
                    <X size={20} />
                  </button>
                  <h3 className="text-lg font-medium">Aperçu du post</h3>
                  <div className="ml-auto flex items-center gap-4">
                    <button
                      onClick={() => setCurrentPost(null)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                {/* Contenu */}
                <div className="p-4">
                  {/* Simulation du post selon la plateforme */}
                  <div className={`max-w-md mx-auto bg-white rounded-lg shadow border border-gray-200 overflow-hidden ${currentPost.platform === 'TikTok' ? 'aspect-[9/16]' : 'aspect-square'}`}>
                    {/* Image */}
                    <div className="relative bg-gray-100">
                      <img
                        src={currentPost.image}
                        alt="Post content"
                        className="w-full h-full object-cover"
                      />
                      {currentPost.platform === 'TikTok' && (
                        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent text-white">
                          <div className="text-sm font-medium">@moncommercelocal</div>
                          <div className="text-xs mt-1">Son original - Nom de la musique</div>
                        </div>
                      )}
                    </div>

                    {/* Contenu textuel */}
                    <div className="p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                          <User size={16} className="text-indigo-600" />
                        </div>
                        <div>
                          <div className="font-medium text-sm">{profile?.name || "Mon Commerce"}</div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <p className="whitespace-pre-line">{currentPost.content}</p>
                        <div className="text-indigo-600 text-sm">
                          {currentPost.hashtags.join(' ')}
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
                        <p className="font-medium mb-1">Conseil pour {currentPost.platform}:</p>
                        <p>{currentPost.tips || "Publiez aux heures où votre audience est active"}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="p-4 border-t border-gray-100 flex justify-end gap-3">
                  <button
                    onClick={() => setActiveTab('generator')}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
                  >
                    Modifier
                  </button>
                  <button
                    onClick={() => handlePublish(currentPost.id)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 flex items-center gap-2"
                  >
                    <Send size={16} /> Publier sur {currentPost.platform}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Historique */}
        {activeTab === 'history' && (
          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-4xl mx-auto">
              <h3 className="text-lg font-medium mb-6">Historique des posts</h3>

              {posts.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                  <Wand2 size={48} className="text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Aucun post généré pour le moment</p>
                  <button
                    onClick={() => setActiveTab('generator')}
                    className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700"
                  >
                    Créer mon premier post
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {posts.map(post => (
                    <div
                      key={post.id}
                      className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                    >
                      <div className="p-4">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${PLATFORM_CONFIG[post.platform].color}/10`}>
                            {React.createElement(PLATFORM_CONFIG[post.platform].icon, {
                              size: 16,
                              className: PLATFORM_CONFIG[post.platform].color
                            })}
                          </div>
                          <div>
                            <h4 className="font-medium">{post.title}</h4>
                            <p className="text-sm text-gray-500">{post.platform} • {new Date(post.createdAt).toLocaleDateString()}</p>
                          </div>
                          <div className="ml-auto flex items-center gap-2">
                            <div className={`px-2 py-1 text-xs rounded-full ${post.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                              {post.status === 'published' ? 'Publié' : 'Brouillon'}
                            </div>
                            <button
                              onClick={() => { setCurrentPost(post); setActiveTab('preview') }}
                              className="p-1 text-gray-500 hover:text-gray-700"
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(post.id)}
                              className="p-1 text-gray-500 hover:text-red-500"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>

                        {post.status === 'published' && (
                          <div className="mt-3 flex gap-4 text-sm">
                            <div className="text-center">
                              <div className="font-medium">{post.metrics?.likes || 0}</div>
                              <div className="text-gray-500 text-xs">J'aime</div>
                            </div>
                            <div className="text-center">
                              <div className="font-medium">{post.metrics?.comments || 0}</div>
                              <div className="text-gray-500 text-xs">Commentaires</div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
