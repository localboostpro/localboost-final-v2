// pages/marketing.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import {
  MessageSquare, Send, X, Paperclip, Smile,
  Mic, Settings, HelpCircle, LogOut, User,
  BarChart2, Mail, Phone, MapPin, Globe, Facebook,
  Instagram, Linkedin, Twitter, Music, Check,
  AlertTriangle, Sparkles, Trash2, Edit2, Eye
} from 'lucide-react';

const MarketingPage = () => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatStarted, setChatStarted] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [posts, setPosts] = useState([]);
  const [showSettings, setShowSettings] = useState(false);
  const messagesEndRef = useRef(null);
  const router = useRouter();

  // Exemple de données de posts
  useEffect(() => {
    // Chargement des posts depuis un API ou base de données
    const samplePosts = [
      {
        id: 1,
        title: "Promotion Été 2023",
        content: "Découvrez nos nouvelles offres spéciales pour l'été ! 🌞 Profitez de -20% sur tous nos menus jusqu'au 31 août.",
        platform: "Instagram",
        status: "published",
        date: "2023-06-15",
        metrics: { likes: 120, comments: 24, shares: 12 },
        image: "/placeholder-instagram.png"
      },
      {
        id: 2,
        title: "Nouveau produit",
        content: "Nous sommes ravis de vous présenter notre tout nouveau produit ! 🎉 Venir le découvrir en magasin.",
        platform: "Facebook",
        status: "draft",
        date: "2023-06-10",
        metrics: { likes: 0, comments: 0, shares: 0 },
        image: "/placeholder-facebook.png"
      }
    ];
    setPosts(samplePosts);
  }, []);

  // Gestion du scroll automatique
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Messages d'exemple pour le chat
  const exampleMessages = [
    {
      role: 'assistant',
      content: "Bonjour ! Je suis votre assistant marketing IA. Comment puis-je vous aider aujourd'hui à booster votre visibilité ? 😊"
    },
    {
      role: 'assistant',
      content: "Voici quelques exemples de ce que je peux faire pour vous :\n\n1. Créer des posts pour vos réseaux sociaux\n2. Générer des idées de contenu marketing\n3. Analyser vos performances actuelles\n4. Proposer des stratégies de croissance"
    }
  ];

  // Démarrer une nouvelle conversation
  const startNewChat = () => {
    setMessages(exampleMessages);
    setChatStarted(true);
  };

  // Envoyer un message
  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    setIsLoading(true);
    const userMessage = { role: 'user', content: inputValue };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');

    try {
      // Simulation d'une réponse de l'API
      const mockResponse = {
        role: 'assistant',
        content: `Voici une suggestion pour votre demande "${inputValue}" :

        **Post Instagram :**
        📢 [Nom de votre entreprise] a une offre spéciale pour vous !
        💥 ${Math.floor(Math.random() * 30) + 10}% de réduction ce week-end seulement
        📍 ${Math.random() > 0.5 ? 'En ligne' : 'En magasin'}

        #Promotion #OffreSpéciale #${Math.random() > 0.5 ? 'Soldes' : 'BonPlan'}

        **Conseil supplémentaire :**
        Postez ce contenu entre 18h et 20h pour un maximum d'engagement.`
      };

      // Dans une vraie implémentation, vous utiliseriez :
      // const response = await fetch('/api/openai', { method: 'POST', body: JSON.stringify({ message: inputValue }) });
      // const data = await response.json();

      setTimeout(() => {
        setMessages(prev => [...prev, mockResponse]);
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Erreur:", error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "Désolé, une erreur s'est produite. Veuillez réessayer plus tard."
      }]);
      setIsLoading(false);
    }
  };

  // Créer un nouveau post depuis le chat
  const createPostFromSuggestion = (content) => {
    const newPost = {
      id: posts.length + 1,
      title: `Post généré ${posts.length + 1}`,
      content: content,
      platform: "Instagram", // Par défaut
      status: "draft",
      date: new Date().toISOString().split('T')[0],
      metrics: { likes: 0, comments: 0, shares: 0 },
      image: "/placeholder-instagram.png"
    };

    setPosts([...posts, newPost]);
    setSelectedPost(newPost);

    setMessages(prev => [...prev, {
      role: 'assistant',
      content: `✅ J'ai créé un nouveau brouillon de post pour vous ! Vous pouvez le modifier et le publier depuis l'onglet "Mes Posts".`
    }]);
  };

  // Publier un post
  const publishPost = (postId) => {
    setPosts(posts.map(post =>
      post.id === postId ? { ...post, status: "published" } : post
    ));

    setMessages(prev => [...prev, {
      role: 'assistant',
      content: `🎉 Votre post a été publié avec succès ! Vous pouvez suivre ses performances dans l'onglet "Analytique".`
    }]);
  };

  // Supprimer un post
  const deletePost = (postId) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce post ?")) return;

    setPosts(posts.filter(post => post.id !== postId));
    if (selectedPost?.id === postId) setSelectedPost(null);

    setMessages(prev => [...prev, {
      role: 'assistant',
      content: `🗑️ Le post a été supprimé. Vous pouvez en créer un nouveau si besoin !`
    }]);
  };

  return (
    <>
      <Head>
        <title>LocalBoost - Marketing IA | Studio Créatif</title>
        <meta name="description" content="Boostez votre visibilité locale avec notre assistant marketing IA" />
      </Head>

      <div className="flex h-screen bg-gray-50">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h1 className="text-xl font-bold text-indigo-600">LocalBoost</h1>
            <p className="text-xs text-gray-500">Marketing IA pour les commerces locaux</p>
          </div>

          <div className="p-2">
            <button
              onClick={startNewChat}
              className="w-full bg-indigo-600 text-white py-2 px-3 rounded-lg flex items-center gap-2 text-sm font-medium hover:bg-indigo-700 transition mb-2"
            >
              <Sparkles size={16} />
              Nouveau chat IA
            </button>

            <button
              onClick={() => setShowSettings(true)}
              className="w-full bg-white text-gray-700 py-2 px-3 rounded-lg flex items-center gap-2 text-sm font-medium hover:bg-gray-50 transition border border-gray-200"
            >
              <Settings size={16} />
              Paramètres
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            <div className="mb-4">
              <h3 className="text-xs font-semibold text-gray-500 uppercase px-2 mb-2">Mes Posts</h3>
              {posts.map(post => (
                <div
                  key={post.id}
                  onClick={() => setSelectedPost(post)}
                  className={`p-3 rounded-lg mb-2 cursor-pointer flex items-center gap-3 ${selectedPost?.id === post.id ? 'bg-indigo-50 border border-indigo-200' : 'hover:bg-gray-50'}`}
                >
                  {post.platform === 'Instagram' && <Instagram size={16} className="text-pink-500" />}
                  {post.platform === 'Facebook' && <Facebook size={16} className="text-blue-600" />}
                  {post.platform === 'LinkedIn' && <Linkedin size={16} className="text-blue-700" />}
                  {post.platform === 'Twitter' && <Twitter size={16} className="text-blue-400" />}
                  {post.platform === 'TikTok' && <Music size={16} className="black" />}

                  <div className="flex-1">
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-medium truncate">{post.title}</span>
                      {post.status === 'published' && <Check size={12} className="text-green-500" />}
                    </div>
                    <p className="text-xs text-gray-500 truncate">{post.content.substring(0, 30)}...</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-auto p-2 border-t border-gray-200">
              <button className="w-full flex items-center gap-2 text-sm text-gray-600 hover:text-indigo-600 py-2 px-3 rounded-lg hover:bg-gray-100">
                <HelpCircle size={16} />
                Aide
              </button>
              <button className="w-full flex items-center gap-2 text-sm text-gray-600 hover:text-indigo-600 py-2 px-3 rounded-lg hover:bg-gray-100">
                <LogOut size={16} />
                Déconnexion
              </button>
            </div>
          </div>
        </div>

        {/* Contenu principal */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-white">
            {selectedPost ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedPost(null)}
                  className="p-1 text-gray-500 hover:text-gray-700"
                >
                  <ArrowLeft size={20} />
                </button>
                <h2 className="text-lg font-semibold">Modification du post</h2>
              </div>
            ) : chatStarted ? (
              <h2 className="text-lg font-semibold">Assistant Marketing IA</h2>
            ) : (
              <h2 className="text-lg font-semibold">Tableau de bord Marketing</h2>
            )}

            <div className="flex items-center gap-2">
              <button className="p-2 text-gray-500 hover:text-gray-700">
                <User size={18} />
              </button>
            </div>
          </div>

          {/* Contenu principal */}
          {selectedPost ? (
            <div className="flex-1 overflow-y-auto p-6">
              <PostEditor
                post={selectedPost}
                onPublish={publishPost}
                onDelete={deletePost}
                onBack={() => setSelectedPost(null)}
              />
            </div>
          ) : chatStarted ? (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Zone de chat */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {message.role !== 'user' && (
                      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                        <Sparkles size={16} className="text-indigo-600" />
                      </div>
                    }

                    <div
                      className={`max-w-[80%] p-3 rounded-lg ${message.role === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white border border-gray-200 rounded-bl-none'}`}
                    >
                      {message.role === 'assistant' && message.content.includes('**Post') ? (
                        <div className="space-y-2">
                          {message.content.split('\n\n').map((part, i) => (
                            <div key={i} className={part.startsWith('**') ? 'bg-indigo-50 p-3 rounded-lg' : ''}>
                              {part.startsWith('**Post') && (
                                <button
                                  onClick={() => createPostFromSuggestion(message.content)}
                                  className="bg-indigo-600 text-white text-xs px-2 py-1 rounded mb-2 flex items-center gap-1"
                                >
                                  <Sparkles size={12} /> Utiliser cette suggestion
                                </button>
                              )}
                              {part.split('\n').map((line, j) => (
                                <p key={j} className={line.startsWith('📢') || line.startswith('💥') ? 'font-semibold' : ''}>
                                  {line.replace(/^[★♦♣♠•·]\s?/, '')}
                                </p>
                              ))}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="whitespace-pre-wrap">{message.content}</p>
                      )}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex gap-3 justify-start">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                      <Sparkles size={16} className="text-indigo-600" />
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg p-3 rounded-bl-none max-w-[80%]">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 rounded-full bg-gray-300 animate-bounce"></div>
                        <div className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Zone de saisie */}
              <div className="p-4 border-t border-gray-200 bg-white">
                <div className="flex items-end gap-2">
                  <button className="p-2 text-gray-500 hover:text-gray-700">
                    <Paperclip size={20} />
                  </button>

                  <div className="flex-1">
                    <textarea
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          sendMessage();
                        }
                      }}
                      placeholder="Demandez à l'IA de créer un post, une campagne, ou donnez-lui des instructions..."
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 min-h-[56px] max-h-[120px] resize-none"
                      rows={1}
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span></span>
                      <span>{inputValue.length}/500</span>
                    </div>
                  </div>

                  <button
                    onClick={sendMessage}
                    disabled={isLoading || !inputValue.trim()}
                    className={`p-2 rounded-lg ${isLoading || !inputValue.trim() ? 'text-gray-300' : 'text-indigo-600 hover:bg-indigo-50'}`}
                  >
                    <Send size={20} />
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  L'IA peut faire des erreurs. Vérifiez toujours les informations importantes.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gradient-to-br from-indigo-50 to-purple-50">
              <div className="max-w-md text-center space-y-6">
                <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-white">
                  <div className="w-16 h-16 mx-auto mb-4 bg-indigo-100 rounded-full flex items-center justify-center">
                    <Sparkles size={32} className="text-indigo-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">Boostez votre visibilité</h2>
                  <p className="text-gray-600 mb-6">
                    Utilisez notre assistant IA pour créer des posts percutants, analyser vos performances et développer votre stratégie marketing.
                  </p>
                  <button
                    onClick={startNewChat}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-6 rounded-xl font-semibold transition duration-200 flex items-center justify-center gap-2 mb-4"
                  >
                    <Sparkles size={16} /> Commencer avec l'IA
                  </button>
                  <div className="text-left text-sm">
                    <p className="flex items-center gap-2 mb-1">
                      <Check size={14} className="text-green-500" /> <span>Création de posts optimisés</span>
                    </p>
                    <p className="flex items-center gap-2 mb-1">
                      <Check size={14} className="text-green-500" /> <span>Analyse de performance</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <Check size={14} className="text-green-500" /> <span>Stratégies personnalisées</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Éditeur de post */}
        {selectedPost && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-semibold">Éditeur de post</h3>
                <button
                  onClick={() => setSelectedPost(null)}
                  className="p-1 text-gray-500 hover:text-gray-700"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                <PostEditor
                  post={selectedPost}
                  onPublish={publishPost}
                  onDelete={deletePost}
                  onBack={() => setSelectedPost(null)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Paramètres */}
        {showSettings && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col">
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-semibold">Paramètres</h3>
                <button
                  onClick={() => setShowSettings(false)}
                  className="p-1 text-gray-500 hover:text-gray-700"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-6">
                <div>
                  <h4 className="font-medium mb-2">Paramètres du compte</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nom du commerce</label>
                      <input
                        type="text"
                        defaultValue="Mon Commerce Local"
                        className="w-full p-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Secteur d'activité</label>
                      <select className="w-full p-2 border border-gray-300 rounded-lg">
                        <option>Restauration</option>
                        <option>Commerce de détail</option>
                        <option>Services</option>
                        <option>Artisanat</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Réseaux sociaux connectés</h4>
                  <div className="space-y-3">
                    {[
                      { name: 'Facebook', icon: <Facebook size={16} />, connected: true },
                      { name: 'Instagram', icon: <Instagram size={16} />, connected: true },
                      { name: 'LinkedIn', icon: <Linkedin size={16} />, connected: false },
                      { name: 'Twitter', icon: <Twitter size={16} />, connected: false },
                      { name: 'TikTok', icon: <Music size={16} />, connected: false }
                    ].map((network, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-gray-100">
                            {network.icon}
                          </div>
                          <span>{network.name}</span>
                        </div>
                        <div className={`px-2 py-1 text-xs rounded-full ${network.connected ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {network.connected ? 'Connecté' : 'Déconnecté'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Préférences de l'IA</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Ton par défaut</label>
                      <select className="w-full p-2 border border-gray-300 rounded-lg">
                        <option>Professionnel</option>
                        <option>Amical</option>
                        <option>Drôle</option>
                        <option>Inspirant</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" id="auto-hashtags" className="rounded" />
                      <label htmlFor="auto-hashtags" className="text-sm">Générer automatiquement des hashtags</label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-gray-200 flex justify-end gap-2">
                <button
                  onClick={() => setShowSettings(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  onClick={() => setShowSettings(false)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700"
                >
                  Enregistrer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

// Composant PostEditor séparé pour une meilleure organisation
const PostEditor = ({ post, onPublish, onDelete, onBack }) => {
  const [editedPost, setEditedPost] = useState(post);
  const [isEditing, setIsEditing] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedPost(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        {post.platform === 'Instagram' && <Instagram size={20} className="text-pink-500" />}
        {post.platform === 'Facebook' && <Facebook size={20} className="text-blue-600" />}
        {post.platform === 'LinkedIn' && <Linkedin size={20} className="text-blue-700" />}
        {post.platform === 'Twitter' && <Twitter size={20} className="text-blue-400" />}
        {post.platform === 'TikTok' && <Music size={20} className="black" />}

        <h3 className="text-xl font-semibold">{post.title}</h3>

        <div className={`ml-auto px-2 py-1 text-xs rounded-full ${post.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
          {post.status === 'published' ? 'Publié' : 'Brouillon'}
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {/* Aperçu du post */}
        <div className="p-4">
          <div className={`max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden ${post.platform === 'TikTok' ? 'border-2 border-black' : 'border border-gray-200'}`}>
            {/* Header du post */}
            <div className="flex items-center p-3 border-b border-gray-100">
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                <User size={16} className="text-indigo-600" />
              </div>
              <div className="ml-2 text-sm font-semibold">Mon Commerce Local</div>
              <div className="ml-auto text-xs text-gray-500">✉️</div>
            </div>

            {/* Contenu du post */}
            <div className={`bg-gray-50 ${post.platform === 'TikTok' ? 'aspect-[9/16]' : 'aspect-square'} relative`}>
              <img
                src={post.image || "/placeholder-post.jpg"}
                alt="Contenu du post"
                className="w-full h-full object-cover"
              />
              {post.platform === 'TikTok' && (
                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent text-white">
                  <div className="text-sm font-medium">@moncommercelocal</div>
                  <div className="text-xs mt-1">Son original - Nom de la musique</div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="p-3 flex gap-4 text-gray-600">
              <button className="flex items-center gap-1">
                <Heart size={18} /> <span className="text-xs">Aimer</span>
              </button>
              <button className="flex items-center gap-1">
                <MessageSquare size={18} /> <span className="text-xs">Commenter</span>
              </button>
              <button className="flex items-center gap-1">
                <Send size={18} /> <span className="text-xs">Partager</span>
              </button>
            </div>

            {/* Légende */}
            <div className="p-3">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-semibold">Mon Commerce Local</span>
                <Check size={14} className="text-blue-500" />
              </div>
              {isEditing ? (
                <textarea
                  name="content"
                  value={editedPost.content}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-lg min-h-[100px]"
                />
              ) : (
                <p className="text-sm whitespace-pre-line">{post.content}</p>
              )}
            </div>
          </div>
        </div>

        {/* Métriques */}
        {post.status === 'published' && (
          <div className="p-4 border-t border-gray-200">
            <h4 className="font-medium mb-3">Performances</h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-lg font-semibold">{post.metrics?.likes || 0}</div>
                <div className="text-xs text-gray-500">J'aime</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold">{post.metrics?.comments || 0}</div>
                <div className="text-xs text-gray-500">Commentaires</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold">{post.metrics?.shares || 0}</div>
                <div className="text-xs text-gray-500">Partages</div>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="p-4 border-t border-gray-200 flex justify-end gap-2">
          {post.status !== 'published' && (
            <>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm flex items-center gap-2 hover:bg-gray-50"
              >
                <Edit2 size={16} /> {isEditing ? 'Annuler' : 'Modifier'}
              </button>
              <button
                onClick={() => onPublish(post.id)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm flex items-center gap-2 hover:bg-indigo-700"
              >
                <Send size={16} /> Publier
              </button>
            </>
          )}
          <button
            onClick={onBack}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm flex items-center gap-2 hover:bg-gray-50"
          >
            <X size={16} /> Fermer
          </button>
          <button
            onClick={() => onDelete(post.id)}
            className="px-3 py-2 border border-red-200 bg-red-50 text-red-600 rounded-lg text-sm flex items-center gap-2 hover:bg-red-100"
          >
            <Trash2 size={16} /> Supprimer
          </button>
        </div>
      </div>
    </div>
  );
};

// Fonction pour simuler l'API OpenAI (à remplacer par l'appel réel)
async function callOpenAIAPI(prompt) {
  // Dans une vraie implémentation, vous feriez :
  // const response = await fetch('/api/openai', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ prompt })
  // });
  // return await response.json();

  // Simulation pour le développement
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({
        choices: [{
          message: {
            role: 'assistant',
            content: `Voici une suggestion pour votre demande "${prompt}" :

            **Post Instagram :**
            📢 [Nom de votre entreprise] a une offre spéciale pour vous !
            💥 25% de réduction ce week-end seulement
            📍 En magasin et en ligne

            #Promotion #OffreSpéciale #Été2023

            **Conseils supplémentaires :**
            - Postez ce contenu entre 18h et 20h pour un maximum d'engagement
            - Ajoutez une photo de vos produits phares
            - Répondez rapidement aux commentaires pour booster l'algorithme`
          }
        }]
      });
    }, 1000);
  });
}

export default MarketingPage;
