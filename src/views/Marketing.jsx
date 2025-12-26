import { useState, useEffect } from 'react';
import { Wand2, Send, Calendar, Image as ImageIcon, Sparkles, Save, Trash2, Clock, FileText, Loader } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useData } from '../contexts/DataContext';

export default function Marketing() {
  const { profile } = useData();
  const [loading, setLoading] = useState(false);
  const [posts, setPosts] = useState([]);
  const [savedDrafts, setSavedDrafts] = useState([]);
  const [activeTab, setActiveTab] = useState('create');
  const [generatedContent, setGeneratedContent] = useState('');

  const [formData, setFormData] = useState({
    subject: '',
    tone: 'professionnel',
    platform: 'facebook',
    content: '',
    scheduledDate: '',
    scheduledTime: '',
    imageUrl: ''
  });

  useEffect(() => {
    if (profile?.id) {
      loadPosts();
      loadDrafts();
    }
  }, [profile]);

  const loadPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('business_id', profile.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Erreur chargement posts:', error);
    }
  };

  const loadDrafts = async () => {
    try {
      const { data, error } = await supabase
        .from('post_drafts')
        .select('*')
        .eq('business_id', profile.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setSavedDrafts(data || []);
    } catch (error) {
      console.error('Erreur chargement brouillons:', error);
    }
  };

  const generateWithAI = async () => {
    if (!formData.subject.trim()) {
      alert('⚠️ Veuillez entrer un sujet pour générer du contenu');
      return;
    }

    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    
    if (!apiKey) {
      alert('⚠️ Clé API OpenAI manquante. Ajoutez VITE_OPENAI_API_KEY dans votre fichier .env');
      return;
    }

    setLoading(true);
    setGeneratedContent('');

    try {
      console.log('🚀 Génération IA en cours...');
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: `Tu es un expert en marketing digital pour les commerces locaux. 
Crée un post ${formData.platform} ${formData.tone} et engageant.
Utilise des emojis appropriés et un appel à l'action clair.
Le ton doit être ${formData.tone}.
Ne dépasse pas 280 caractères pour Twitter, 500 pour les autres plateformes.`
            },
            {
              role: 'user',
              content: `Entreprise: ${profile.business_name || 'Commerce local'}
Sujet: ${formData.subject}
Plateforme: ${formData.platform}
Ton: ${formData.tone}`
            }
          ],
          temperature: 0.8,
          max_tokens: 500
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || `Erreur API: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0].message.content.trim();
      
      setGeneratedContent(content);
      setFormData(prev => ({ ...prev, content }));
      
      console.log('✅ Contenu généré avec succès');
      alert('✅ Contenu généré avec succès !');
      
    } catch (error) {
      console.error('❌ Erreur génération IA:', error);
      alert(`❌ Erreur : ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const saveDraft = async () => {
    if (!formData.content.trim()) {
      alert('⚠️ Veuillez entrer du contenu avant de sauvegarder');
      return;
    }

    try {
      const { error } = await supabase
        .from('post_drafts')
        .insert({
          business_id: profile.id,
          subject: formData.subject,
          content: formData.content,
          platform: formData.platform,
          tone: formData.tone
        });

      if (error) throw error;

      alert('✅ Brouillon sauvegardé !');
      loadDrafts();
      
    } catch (error) {
      console.error('❌ Erreur sauvegarde:', error);
      alert('❌ Erreur lors de la sauvegarde');
    }
  };

  const publishPost = async () => {
    if (!formData.content.trim()) {
      alert('⚠️ Veuillez entrer du contenu avant de publier');
      return;
    }

    try {
      const scheduledFor = formData.scheduledDate && formData.scheduledTime
        ? new Date(`${formData.scheduledDate}T${formData.scheduledTime}`).toISOString()
        : null;

      const { error } = await supabase
        .from('posts')
        .insert({
          business_id: profile.id,
          title: formData.subject || 'Publication',
          content: formData.content,
          platform: formData.platform,
          status: scheduledFor ? 'scheduled' : 'published',
          scheduled_for: scheduledFor,
          image_url: formData.imageUrl || null,
          published_at: scheduledFor ? null : new Date().toISOString()
        });

      if (error) throw error;

      alert(scheduledFor ? '✅ Publication planifiée !' : '✅ Publication créée !');
      
      // Réinitialiser le formulaire
      setFormData({
        subject: '',
        tone: 'professionnel',
        platform: 'facebook',
        content: '',
        scheduledDate: '',
        scheduledTime: '',
        imageUrl: ''
      });
      setGeneratedContent('');
      
      loadPosts();
      setActiveTab('history');
      
    } catch (error) {
      console.error('❌ Erreur publication:', error);
      alert('❌ Erreur lors de la publication');
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
      console.error('❌ Erreur suppression:', error);
      alert('❌ Erreur lors de la suppression');
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
      console.error('❌ Erreur suppression:', error);
      alert('❌ Erreur lors de la suppression');
    }
  };

  const loadDraft = (draft) => {
    setFormData({
      subject: draft.subject || '',
      content: draft.content || '',
      platform: draft.platform || 'facebook',
      tone: draft.tone || 'professionnel',
      scheduledDate: '',
      scheduledTime: '',
      imageUrl: ''
    });
    setActiveTab('create');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-[2.5rem] p-8 shadow-lg">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-purple-100 p-3 rounded-xl">
            <Wand2 className="w-6 h-6 text-purple-600" />
          </div>
          <h1 className="text-4xl font-black text-slate-900">Studio Marketing</h1>
        </div>
        <p className="text-slate-600 ml-16">Créez et planifiez vos publications</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-white p-2 rounded-2xl shadow-sm">
        <button
          onClick={() => setActiveTab('create')}
          className={`flex-1 px-6 py-3 rounded-xl font-bold transition ${
            activeTab === 'create'
              ? 'bg-indigo-600 text-white'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Sparkles className="inline mr-2" size={18} />
          Créer
        </button>
        <button
          onClick={() => setActiveTab('drafts')}
          className={`flex-1 px-6 py-3 rounded-xl font-bold transition ${
            activeTab === 'drafts'
              ? 'bg-indigo-600 text-white'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <FileText className="inline mr-2" size={18} />
          Brouillons ({savedDrafts.length})
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 px-6 py-3 rounded-xl font-bold transition ${
            activeTab === 'history'
              ? 'bg-indigo-600 text-white'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Clock className="inline mr-2" size={18} />
          Historique ({posts.length})
        </button>
      </div>

      {/* Content */}
      {activeTab === 'create' && (
        <div className="bg-white rounded-[2.5rem] p-8 shadow-lg space-y-6">
          {/* Paramètres */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Plateforme
              </label>
              <select
                value={formData.platform}
                onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
              >
                <option value="facebook">Facebook</option>
                <option value="instagram">Instagram</option>
                <option value="twitter">Twitter</option>
                <option value="linkedin">LinkedIn</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Ton
              </label>
              <select
                value={formData.tone}
                onChange={(e) => setFormData({ ...formData, tone: e.target.value })}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
              >
                <option value="professionnel">Professionnel</option>
                <option value="amical">Amical</option>
                <option value="promotionnel">Promotionnel</option>
                <option value="informatif">Informatif</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Sujet
              </label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="Ex: Nouvelle offre de saison"
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Génération IA */}
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-6 rounded-2xl border border-purple-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles className="text-purple-600" size={20} />
                  Génération IA
                </h3>
                <p className="text-sm text-slate-600 mt-1">
                  Laissez l'IA créer un contenu engageant pour vous
                </p>
              </div>
              <button
                onClick={generateWithAI}
                disabled={loading || !formData.subject}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-bold hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader className="animate-spin" size={18} />
                    Génération...
                  </>
                ) : (
                  <>
                    <Wand2 size={18} />
                    Générer
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Contenu */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Contenu
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 min-h-[200px]"
              placeholder="Rédigez votre publication ou utilisez la génération IA..."
            />
            <div className="text-sm text-slate-500 mt-2">
              {formData.content.length} caractères
            </div>
          </div>

          {/* Planification */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                <Calendar className="inline mr-1" size={16} />
                Date de publication (optionnel)
              </label>
              <input
                type="date"
                value={formData.scheduledDate}
                onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                <Clock className="inline mr-1" size={16} />
                Heure
              </label>
              <input
                type="time"
                value={formData.scheduledTime}
                onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Image */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              <ImageIcon className="inline mr-1" size={16} />
              URL de l'image (optionnel)
            </label>
            <input
              type="url"
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              placeholder="https://exemple.com/image.jpg"
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4 border-t">
            <button
              onClick={saveDraft}
              disabled={!formData.content.trim()}
              className="flex-1 px-6 py-4 border-2 border-slate-300 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Save size={20} />
              Sauvegarder en brouillon
            </button>
            <button
              onClick={publishPost}
              disabled={!formData.content.trim()}
              className="flex-1 px-6 py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Send size={20} />
              {formData.scheduledDate ? 'Planifier' : 'Publier'}
            </button>
          </div>
        </div>
      )}

      {/* Brouillons */}
      {activeTab === 'drafts' && (
        <div className="bg-white rounded-[2.5rem] p-8 shadow-lg">
          <h2 className="text-2xl font-black text-slate-900 mb-6">Brouillons sauvegardés</h2>
          
          {savedDrafts.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto text-slate-300 mb-4" size={48} />
              <p className="text-slate-500">Aucun brouillon sauvegardé</p>
            </div>
          ) : (
            <div className="space-y-4">
              {savedDrafts.map((draft) => (
                <div key={draft.id} className="border border-slate-200 rounded-xl p-6 hover:shadow-md transition">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-slate-900">{draft.subject || 'Sans titre'}</h3>
                      <p className="text-sm text-slate-500 mt-1">
                        {new Date(draft.created_at).toLocaleDateString('fr-FR')} • {draft.platform}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => loadDraft(draft)}
                        className="px-4 py-2 bg-indigo-100 text-indigo-600 rounded-lg font-medium hover:bg-indigo-200 transition"
                      >
                        Charger
                      </button>
                      <button
                        onClick={() => deleteDraft(draft.id)}
                        className="px-4 py-2 bg-red-100 text-red-600 rounded-lg font-medium hover:bg-red-200 transition"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <p className="text-slate-700 line-clamp-3">{draft.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Historique */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-[2.5rem] p-8 shadow-lg">
          <h2 className="text-2xl font-black text-slate-900 mb-6">Historique des publications</h2>
          
          {posts.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="mx-auto text-slate-300 mb-4" size={48} />
              <p className="text-slate-500">Aucune publication pour le moment</p>
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <div key={post.id} className="border border-slate-200 rounded-xl p-6 hover:shadow-md transition">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-slate-900">{post.title}</h3>
                      <div className="flex items-center gap-3 mt-2">
                        <span className={`px-3 py-1 rounded-lg text-xs font-bold ${
                          post.status === 'published' ? 'bg-green-100 text-green-700' :
                          post.status === 'scheduled' ? 'bg-blue-100 text-blue-700' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {post.status === 'published' ? '✓ Publié' : 
                           post.status === 'scheduled' ? '⏰ Planifié' : 
                           '📝 Brouillon'}
                        </span>
                        <span className="text-sm text-slate-500">
                          {post.published_at 
                            ? new Date(post.published_at).toLocaleDateString('fr-FR')
                            : post.scheduled_for
                            ? `Planifié le ${new Date(post.scheduled_for).toLocaleDateString('fr-FR')}`
                            : new Date(post.created_at).toLocaleDateString('fr-FR')}
                        </span>
                        <span className="text-sm text-slate-500">• {post.platform}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => deletePost(post.id)}
                      className="px-4 py-2 bg-red-100 text-red-600 rounded-lg font-medium hover:bg-red-200 transition"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <p className="text-slate-700">{post.content}</p>
                  {post.image_url && (
                    <img 
                      src={post.image_url} 
                      alt="Post" 
                      className="mt-4 rounded-lg max-h-48 object-cover"
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
