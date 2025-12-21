// pages/marketing.jsx
import { useState, useEffect } from 'react'
import { generatePostContent } from '../lib/openai'
import {
  Instagram, Facebook, Linkedin, Twitter, Music as TikTok,
  Wand2, Send, Trash2, Edit2, Eye, Check, X, Sparkles,
  BarChart2, MessageSquare, User, Settings, HelpCircle
} from 'lucide-react'

// Configuration des plateformes avec fallback pour les icônes
const PLATFORM_CONFIG = {
  Instagram: {
    icon: Instagram,
    color: "bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600",
    textColor: "text-pink-600",
    ratio: "1:1",
    placeholder: "/placeholder-instagram.png"
  },
  Facebook: {
    icon: Facebook,
    color: "bg-blue-600",
    textColor: "text-blue-600",
    ratio: "1.91:1",
    placeholder: "/placeholder-facebook.png"
  },
  LinkedIn: {
    icon: Linkedin,
    color: "bg-blue-700",
    textColor: "text-blue-700",
    ratio: "1.91:1",
    placeholder: "/placeholder-linkedin.png"
  },
  Twitter: {
    icon: Twitter,
    color: "bg-blue-400",
    textColor: "text-blue-400",
    ratio: "16:9",
    placeholder: "/placeholder-twitter.png"
  },
  TikTok: {
    icon: TikTok,
    color: "bg-black",
    textColor: "text-black",
    ratio: "9:16",
    placeholder: "/placeholder-tiktok.png"
  }
}

export default function MarketingPage({ profile }) {
  // États avec valeurs par défaut plus sûres
  const [posts, setPosts] = useState([])
  const [currentPost, setCurrentPost] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('generator')
  const [prompt, setPrompt] = useState('')
  const [platform, setPlatform] = useState('Instagram')
  const [tone, setTone] = useState('Amical')
  const [error, setError] = useState(null)
  const [generationHistory, setGenerationHistory] = useState([])

  // Chargement initial sécurisé
  useEffect(() => {
    try {
      // Dans une vraie app, vous feriez un fetch ici
      const demoPosts = [
        {
          id: 'demo-1',
          title: "Exemple de promotion",
          content: "🌞 Profitez de -20% sur tous nos produits cet été! 🍦 Offre valable jusqu'au 31/08",
          platform: "Instagram",
          status: "published",
          hashtags: ["#promo", "#été2023", "#commerceLocal"],
          image: PLATFORM_CONFIG.Instagram.placeholder,
          metrics: { likes: 120, comments: 24 },
          createdAt: new Date(Date.now() - 86400000).toISOString()
        }
      ]
      setPosts(demoPosts)
    } catch (err) {
      console.error("Erreur de chargement initial:", err)
    }
  }, [])

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError("Veuillez décrire votre post")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const enhancedPrompt = `
      Plateforme: ${platform}
      Ton: ${tone}
      Description: ${prompt}
      ${profile?.city ? `Localisation: ${profile.city}` : ''}

      Instructions:
      - Crée un post engageant avec emojis
      - Adapte le style à la plateforme
      - Inclut 2-3 hashtags pertinents
      - Propose une idée d'image
      - Reste concis (max 280 caractères)
      `

      const result = await generatePostContent(enhancedPrompt, profile)

      const newPost = {
        id: `post-${Date.now()}`,
        title: result.title || "Nouveau post",
        content: result.content || "Contenu généré par IA",
        platform,
        status: "draft",
        hashtags: result.hashtags || ["#local", "#business"],
        image: PLATFORM_CONFIG[platform].placeholder,
        imageKeyword: result.image_keyword || "business marketing",
        tips: result.platform_tips || "Publiez aux heures d'affluence",
        createdAt: new Date().toISOString(),
        metrics: { likes: 0, comments: 0 }
      }

      setPosts([newPost, ...posts])
      setCurrentPost(newPost)
      setActiveTab('preview')
      setGenerationHistory([...generationHistory, {
        prompt,
        result: newPost.content,
        date: new Date().toISOString()
      }])

    } catch (err) {
      console.error("Erreur de génération:", err)
      setError(err.message || "Échec de la génération du contenu")
    } finally {
      setIsLoading(false)
    }
  }

  const handlePublish = (postId) => {
    setPosts(posts.map(post =>
      post.id === postId ? {
        ...post,
        status: "published",
        metrics: { ...post.metrics, likes: Math.floor(Math.random() * 100) + 20 }
      } : post
    ))
  }

  const handleDelete = (postId) => {
    if (window.confirm("Voulez-vous vraiment supprimer ce post?")) {
      setPosts(posts.filter(post => post.id !== postId))
      if (currentPost?.id === postId) setCurrentPost(null)
    }
  }

  // Composant pour l'aperçu des posts
  const PostPreview = ({ post }) => {
    if (!post) return null

    const PlatformIcon = PLATFORM_CONFIG[post.platform]?.icon || Instagram
    const platformConfig = PLATFORM_CONFIG[post.platform] || PLATFORM_CONFIG.Instagram

    return (
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex items-center gap-3">
          <button
            onClick={() => setActiveTab('generator')}
            className="p-1 text-gray-500 hover:text-gray-700"
            aria-label="Retour"
          >
            <X size={20} />
          </button>
          <h3 className="text-lg font-medium">Aperçu du post</h3>
          <div className="ml-auto flex items-center gap-2">
            <span className={`text-xs px-2 py-1 rounded-full ${post.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
              {post.status === 'published' ? 'Publié' : 'Brouillon'}
            </span>
          </div>
        </div>

        {/* Contenu */}
        <div className="p-4">
          <div className={`max-w-xs mx-auto bg-white rounded-lg shadow border border-gray-200 overflow-hidden ${post.platform === 'TikTok' ? 'aspect-[9/16]' : 'aspect-square'}`}>
            {/* Image */}
            <div className="relative bg-gray-100 h-64">
              <img
                src={post.image}
                alt="Aperçu du post"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = '/placeholder-fallback.png'
                }}
              />
              {post.platform === 'TikTok' && (
                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent text-white">
                  <div className="text-sm font-medium">@moncommercelocal</div>
                  <div className="text-xs mt-1">Son original - Nom de la musique</div>
                </div>
              )}
            </div>

            {/* Contenu textuel */}
            <div className="p-3">
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-8 h-8 rounded-full ${platformConfig.color} flex items-center justify-center`}>
                  <PlatformIcon size={16} className="text-white" />
                </div>
                <div>
                  <div className="font-medium text-sm">{profile?.name || "Mon Commerce"}</div>
                </div>
              </div>

              <div className="space-y-2">
                <p className="whitespace-pre-line break-words">{post.content}</p>
                <div className="text-indigo-600 text-sm">
                  {post.hashtags.join(' ')}
                </div>
              </div>

              {post.tips && (
                <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
                  <p className="font-medium mb-1">Conseil {post.platform}:</p>
                  <p>{post.tips}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-gray-100 flex justify-end gap-3">
          <button
            onClick={() => setActiveTab('generator')}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors"
          >
            Modifier
          </button>
          <button
            onClick={() => handlePublish(post.id)}
            disabled={post.status === 'published'}
            className={`px-4 py-2 rounded-lg text-sm flex items-center gap-2 ${post.status === 'published' ?
              'bg-gray-100 text-gray-400 cursor-not-allowed' :
              'bg-indigo-600 text-white hover:bg-indigo-700 transition-colors'}`}
          >
            <Send size={16} /> Publier
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 p-4 flex flex-col">
        <div className="mb-8">
          <h1 className="text-xl font-bold text-indigo-600">LocalBoost</h1>
          <p className="text-xs text-gray-500">Studio Marketing IA</p>
        </div>

        <nav className="space-y-1">
          <button
            onClick={() => { setActiveTab('generator'); setCurrentPost(null) }}
            className={`w-full flex items-center gap-3 p-3 rounded-lg ${activeTab === 'generator' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            <Wand2 size={18} /> Générateur IA
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`w-full flex items-center gap-3 p-3 rounded-lg ${activeTab === 'history' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            <BarChart2 size={18} /> Historique
          </button>
        </nav>

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

        {/* Générateur */}
        {activeTab === 'generator' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-lg font-medium mb-4">Créer un nouveau post</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Plateforme</label>
                  <select
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    {Object.entries(PLATFORM_CONFIG).map(([name, config]) => (
                      <option key={name} value={name}>{name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Ton</label>
                  <select
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    {['Amical', 'Professionnel', 'Drôle', 'Inspirant', 'Promotionnel'].map(t => (
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
                  className="w-full p-3 border border-gray-300 rounded-lg min-h-[120px] focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
                disabled={isLoading || !prompt.trim()}
                className={`w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 ${
                  (isLoading || !prompt.trim()) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-indigo-700'
                } transition-colors`}
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

            {generationHistory.length > 0 && (
              <div className="bg-indigo-50 p-6 rounded-xl border border-indigo-100">
                <h3 className="text-lg font-medium mb-3 text-indigo-800">Historique récent</h3>
                <div className="space-y-3">
                  {generationHistory.slice(0, 3).map((item, index) => (
                    <div key={index} className="p-3 bg-white rounded-lg border border-gray-200">
                      <p className="text-sm font-medium mb-1">{item.prompt.substring(0, 50)}...</p>
                      <p className="text-xs text-gray-600 line-clamp-2">{item.result}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Aperçu */}
        {activeTab === 'preview' && currentPost && (
          <div className="flex-1 overflow-y-auto p-6">
            <PostPreview post={currentPost} />
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
                  <p className="text-gray-500 mb-4">Aucun post généré pour le moment</p>
                  <button
                    onClick={() => setActiveTab('generator')}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700 transition-colors"
                  >
                    Créer mon premier post
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {posts.map(post => {
                    const PlatformIcon = PLATFORM_CONFIG[post.platform]?.icon || Instagram
                    const platformConfig = PLATFORM_CONFIG[post.platform] || PLATFORM_CONFIG.Instagram

                    return (
                      <div
                        key={post.id}
                        className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                      >
                        <div className="p-4">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${platformConfig.color}/10`}>
                              <PlatformIcon size={16} className={platformConfig.textColor} />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium truncate">{post.title}</h4>
                              <p className="text-sm text-gray-500 truncate">
                                {post.platform} • {new Date(post.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className={`px-2 py-1 text-xs rounded-full ${
                                post.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                              }`}>
                                {post.status === 'published' ? 'Publié' : 'Brouillon'}
                              </div>
                            </div>
                          </div>

                          <p className="mt-3 text-sm line-clamp-2">{post.content}</p>

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

                        <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                          <button
                            onClick={() => { setCurrentPost(post); setActiveTab('preview') }}
                            className="p-1.5 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
                            aria-label="Voir le post"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(post.id)}
                            className="p-1.5 text-gray-500 hover:text-red-500 rounded-full hover:bg-gray-200 transition-colors"
                            aria-label="Supprimer le post"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
