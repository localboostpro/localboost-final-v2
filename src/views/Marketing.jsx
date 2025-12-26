import { useState, useEffect } from 'react';
import { Calendar, Image, Send, Clock, FileText, Sparkles, Save, Trash2, Eye } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useData } from '../contexts/DataContext';

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

export default function MarketingStudio() {
  const { profile } = useData();
  const [activeTab, setActiveTab] = useState('create');
  const [posts, setPosts] = useState([]);
  const [savedDrafts, setSavedDrafts] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Formulaire
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    platform: 'facebook',
    scheduledDate: '',
    scheduledTime: '',
    image: null,
    imagePreview: null,
    tone: 'professionnel',
    targetAudience: 'general'
  });

  useEffect(() => {
    loadPosts();
    loadDrafts();
  }, [profile]);

  const loadPosts = async () => {
    if (!profile?.id) return;
    
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('business_id', profile.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setPosts(data);
    }
  };

  const loadDrafts = async () => {
    if (!profile?.id) return;
    
    const { data, error } = await supabase
      .from('post_drafts')
      .select('*')
      .eq('business_id', profile.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setSavedDrafts(data);
    }
  };

  const generateWithAI = async () => {
    if (!formData.title) {
      alert('⚠️ Veuillez entrer un titre ou un sujet');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: `Tu es un expert en marketing digital pour ${profile.business_type || 'une entreprise'}. Génère du contenu engageant et optimisé pour les réseaux sociaux.`
            },
            {
              role: 'user',
              content: `Crée une publication ${formData.tone} pour ${formData.platform} sur le sujet: "${formData.title}". Public cible: ${formData.targetAudience}. Entreprise: ${profile.business_name}. Maximum 280 caractères, avec emojis pertinents.`
            }
          ],
          temperature: 0.8,
          max_tokens: 300
        })
      });

      if (!response.ok) {
        throw new Error('Erreur API OpenAI');
      }

      const data = await response.json();
      const generatedContent = data.choices[0].message.content;

      setFormData(prev => ({ ...prev, content: generatedContent }));
      alert('✅ Contenu généré avec succès !');

    } catch (error) {
      console.error('Erreur génération AI:', error);
      alert('❌ Erreur lors de la génération. Vérifiez votre clé API OpenAI.');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5000000) {
        alert('❌ Image trop volumineuse (max 5MB)');
        return;
      }
      setFormData(prev => ({
        ...prev,
        image: file,
        imagePreview: URL.createObjectURL(file)
      }));
    }
  };

  const saveDraft = async () => {
    if (!formData.title || !formData.content) {
      alert('⚠️ Titre et contenu requis');
      return;
    }

    try {
      const { error } = await supabase
        .from('post_drafts')
        .insert({
          business_id: profile.id,
          title: formData.title,
          content: formData.content,
          platform: formData.platform,
          tone: formData.tone,
          target_audience: formData.targetAudience,
          image_url: formData.imagePreview
        });

      if (error) throw error;

      alert('✅ Brouillon enregistré');
      loadDrafts();
      resetForm();

    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      alert('❌ Erreur lors de la sauvegarde');
    }
  };

  const schedulePost = async () => {
    if (!formData.title || !formData.content || !formData.scheduledDate) {
      alert('⚠️ Tous les champs sont requis');
      return;
    }

    try {
      let imageUrl = null;

      // Upload image si présente
      if (formData.image) {
        const fileExt = formData.image.name.split('.').pop();
        const fileName = `${profile.id}/${Date.now()}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('post-images')
          .upload(fileName, formData.image);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('post-images')
          .getPublicUrl(fileName);

        imageUrl = urlData.publicUrl;
      }

      const scheduledDateTime = new Date(`${formData.scheduledDate}T${formData.scheduledTime || '12:00'}`);

      const { error } = await supabase
        .from('posts')
        .insert({
          business_id: profile.id,
          title: formData.title,
          content: formData.content,
          platform: formData.platform,
          scheduled_date: scheduledDateTime.toISOString(),
          image_url: imageUrl,
          status: 'scheduled',
          tone: formData.tone,
          target_audience: formData.targetAudience
        });

      if (error) throw error;

      alert('✅ Publication programmée avec succès !');
      loadPosts();
      resetForm();
      setActiveTab('calendar');

    } catch (error) {
      console.error('Erreur programmation:', error);
      alert('❌ Erreur lors de la programmation');
    }
  };

  const publishNow = async () => {
    if (!formData.title || !formData.content) {
      alert('⚠️ Titre et contenu requis');
      return;
    }

    try {
      let imageUrl = null;

      if (formData.image) {
        const fileExt = formData.image.name.split('.').pop();
        const fileName = `${profile.id}/${Date.now()}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('post-images')
          .upload(fileName, formData.image);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('post-images')
          .getPublicUrl(fileName);

        imageUrl = urlData.publicUrl;
      }

      const { error } = await supabase
        .from('posts')
        .insert({
          business_id: profile.id,
          title: formData.title,
          content: formData.content,
          platform: formData.platform,
          image_url: imageUrl,
          status: 'published',
          published_date: new Date().toISOString(),
          tone: formData.tone,
          target_audience: formData.targetAudience
        });

      if (error) throw error;

      alert('✅ Publication immédiate réussie !');
      loadPosts();
      resetForm();
      setActiveTab('history');

    } catch (error) {
      console.error('Erreur publication:', error);
      alert('❌ Erreur lors de la publication');
    }
  };

  const deleteDraft = async (draftId) => {
    if (!confirm('Supprimer ce brouillon ?')) return;

    try {
      const { error } = await supabase
        .from('post_drafts')
        .delete()
        .eq('id', draftId);

      if (error) throw error;

      alert('✅ Brouillon supprimé');
      loadDrafts();

    } catch (error) {
      console.error('Erreur suppression:', error);
      alert('❌ Erreur lors de la suppression');
    }
  };

  const deletePost = async (postId) => {
    if (!confirm('Supprimer cette publication ?')) return;

    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;

      alert('✅ Publication supprimée');
      loadPosts();

    } catch (error) {
      console.error('Erreur suppression:', error);
      alert('❌ Erreur lors de la suppression');
    }
  };

  const loadDraft = (draft) => {
    setFormData({
      title: draft.title,
      content: draft.content,
      platform: draft.platform,
      tone: draft.tone,
      targetAudience: draft.target_audience,
      scheduledDate: '',
      scheduledTime: '',
      image: null,
      imagePreview: draft.image_url
    });
    setActiveTab('create');
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      platform: 'facebook',
      scheduledDate: '',
      scheduledTime: '',
      image: null,
      imagePreview: null,
      tone: 'professionnel',
      targetAudience: 'general'
    });
  };

  const getPlatformIcon = (platform) => {
    const icons = {
      facebook: '📘',
      instagram: '📷',
      twitter: '🐦',
      linkedin: '💼',
      tiktok: '🎵'
    };
    return icons[platform] || '📱';
  };

  const getStatusBadge = (status) => {
    const badges = {
      scheduled: 'bg-blue-100 text-blue-800',
      published: 'bg-green-100 text-green-800',
      draft: 'bg-gray-100 text-gray-800',
      failed: 'bg-red-100 text-red-800'
    };
    return badges[status] || badges.draft;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Sparkles className="text-indigo-600" size={32} />
          Studio Marketing
        </h1>
        <p className="text-gray-600 mt-2">Créez et programmez vos publications avec l'IA</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            {[
              { id: 'create', label: 'Créer', icon: FileText },
              { id: 'calendar', label: 'Calendrier', icon: Calendar },
              { id: 'history', label: 'Historique', icon: Clock },
              { id: 'drafts', label: 'Brouillons', icon: Save }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon size={18} />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Contenu des tabs */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        
        {/* TAB: CRÉER */}
        {activeTab === 'create' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Formulaire */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sujet / Titre
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="Ex: Nouvelle offre spéciale..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Plateforme
                    </label>
                    <select
                      value={formData.platform}
                      onChange={(e) => setFormData({...formData, platform: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="facebook">📘 Facebook</option>
                      <option value="instagram">📷 Instagram</option>
                      <option value="twitter">🐦 Twitter</option>
                      <option value="linkedin">💼 LinkedIn</option>
                      <option value="tiktok">🎵 TikTok</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ton
                    </label>
                    <select
                      value={formData.tone}
                      onChange={(e) => setFormData({...formData, tone: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="professionnel">Professionnel</option>
                      <option value="amical">Amical</option>
                      <option value="humoristique">Humoristique</option>
                      <option value="informatif">Informatif</option>
                      <option value="promotionnel">Promotionnel</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Public cible
                  </label>
                  <select
                    value={formData.targetAudience}
                    onChange={(e) => setFormData({...formData, targetAudience: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="general">Grand public</option>
                    <option value="jeunes">Jeunes (18-30 ans)</option>
                    <option value="adultes">Adultes (30-50 ans)</option>
                    <option value="seniors">Seniors (50+ ans)</option>
                    <option value="professionnels">Professionnels</option>
                  </select>
                </div>

                <button
                  onClick={generateWithAI}
                  disabled={loading || !formData.title}
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-lg font-medium hover:from-purple-700 hover:to-indigo-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Génération en cours...
                    </>
                  ) : (
                    <>
                      <Sparkles size={20} />
                      Générer avec l'IA
                    </>
                  )}
                </button>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contenu
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({...formData, content: e.target.value})}
                    rows={6}
                    placeholder="Le contenu sera généré automatiquement ou vous pouvez l'écrire..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  <div className="text-sm text-gray-500 mt-1">
                    {formData.content.length} / 280 caractères
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Image (optionnel)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                  {formData.imagePreview && (
                    <div className="mt-3 relative">
                      <img 
                        src={formData.imagePreview} 
                        alt="Preview" 
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <button
                        onClick={() => setFormData({...formData, image: null, imagePreview: null})}
                        className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date de programmation
                    </label>
                    <input
                      type="date"
                      value={formData.scheduledDate}
                      onChange={(e) => setFormData({...formData, scheduledDate: e.target.value})}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Heure
                    </label>
                    <input
                      type="time"
                      value={formData.scheduledTime}
                      onChange={(e) => setFormData({...formData, scheduledTime: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={saveDraft}
                    className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                  >
                    <Save size={18} />
                    Enregistrer
                  </button>
                  <button
                    onClick={publishNow}
                    className="flex-1 bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Send size={18} />
                    Publier maintenant
                  </button>
                  <button
                    onClick={schedulePost}
                    className="flex-1 bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Clock size={18} />
                    Programmer
                  </button>
                </div>
              </div>

              {/* Prévisualisation */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Eye size={20} />
                  Prévisualisation
                </h3>
                <div className="border-2 border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="bg-white rounded-lg shadow-md p-4">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                        {profile?.business_name?.charAt(0) || 'B'}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">
                          {profile?.business_name || 'Votre entreprise'}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center gap-2">
                          {getPlatformIcon(formData.platform)}
                          {formData.platform}
                          {formData.scheduledDate && (
                            <span>• Programmé le {new Date(formData.scheduledDate).toLocaleDateString('fr-FR')}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {formData.title && (
                      <h4 className="font-semibold text-lg mb-2">{formData.title}</h4>
                    )}
                    
                    {formData.content && (
                      <p className="text-gray-700 whitespace-pre-wrap mb-3">
                        {formData.content}
                      </p>
                    )}
                    
                    {formData.imagePreview && (
                      <img 
                        src={formData.imagePreview} 
                        alt="Post preview" 
                        className="w-full rounded-lg mb-3"
                      />
                    )}
                    
                    <div className="flex items-center gap-6 text-gray-500 text-sm pt-3 border-t">
                      <button className="hover:text-indigo-600">👍 J'aime</button>
                      <button className="hover:text-indigo-600">💬 Commenter</button>
                      <button className="hover:text-indigo-600">📤 Partager</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB: CALENDRIER */}
        {activeTab === 'calendar' && (
          <div>
            <h3 className="text-xl font-semibold mb-4">Publications programmées</h3>
            
            {posts.filter(p => p.status === 'scheduled').length === 0 ? (
              <div className="text-center py-12">
                <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">Aucune publication programmée</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {posts.filter(p => p.status === 'scheduled').map((post) => (
                  <div key={post.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{getPlatformIcon(post.platform)}</span>
                        <span className="font-medium">{post.platform}</span>
                      </div>
                      <button
                        onClick={() => deletePost(post.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                    
                    <h4 className="font-semibold mb-2">{post.title}</h4>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{post.content}</p>
                    
                    {post.image_url && (
                      <img src={post.image_url} alt="" className="w-full h-32 object-cover rounded mb-3" />
                    )}
                    
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Clock size={14} />
                      {new Date(post.scheduled_date).toLocaleString('fr-FR')}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB: HISTORIQUE */}
        {activeTab === 'history' && (
          <div>
            <h3 className="text-xl font-semibold mb-4">Publications passées</h3>
            
            {posts.filter(p => p.status === 'published').length === 0 ? (
              <div className="text-center py-12">
                <Clock size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">Aucune publication dans l'historique</p>
              </div>
            ) : (
              <div className="space-y-4">
                {posts.filter(p => p.status === 'published').map((post) => (
                  <div key={post.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-2xl">{getPlatformIcon(post.platform)}</span>
                          <h4 className="font-semibold">{post.title}</h4>
                          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusBadge(post.status)}`}>
                            Publié
                          </span>
                        </div>
                        
                        <p className="text-gray-600 mb-3">{post.content}</p>
                        
                        {post.image_url && (
                          <img src={post.image_url} alt="" className="w-64 h-40 object-cover rounded mb-3" />
                        )}
                        
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Clock size={14} />
                            {new Date(post.published_date).toLocaleString('fr-FR')}
                          </span>
                          <span>👁️ {post.views || 0} vues</span>
                          <span>👍 {post.likes || 0} j'aime</span>
                          <span>💬 {post.comments || 0} commentaires</span>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => deletePost(post.id)}
                        className="text-red-500 hover:text-red-700 ml-4"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB: BROUILLONS */}
        {activeTab === 'drafts' && (
          <div>
            <h3 className="text-xl font-semibold mb-4">Brouillons sauvegardés</h3>
            
            {savedDrafts.length === 0 ? (
              <div className="text-center py-12">
                <Save size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">Aucun brouillon enregistré</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {savedDrafts.map((draft) => (
                  <div key={draft.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{getPlatformIcon(draft.platform)}</span>
                        <span className="font-medium">{draft.platform}</span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => loadDraft(draft)}
                          className="text-indigo-600 hover:text-indigo-800"
                          title="Charger ce brouillon"
                        >
                          <FileText size={18} />
                        </button>
                        <button
                          onClick={() => deleteDraft(draft.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                    
                    <h4 className="font-semibold mb-2">{draft.title}</h4>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-3">{draft.content}</p>
                    
                    {draft.image_url && (
                      <img src={draft.image_url} alt="" className="w-full h-32 object-cover rounded mb-3" />
                    )}
                    
                    <div className="text-xs text-gray-500">
                      Créé le {new Date(draft.created_at).toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
