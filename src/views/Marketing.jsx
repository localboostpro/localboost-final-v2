import { useState, useEffect } from 'react';
import { Wand2, Send, Calendar, Image as ImageIcon, Sparkles, Save, Trash2, Clock, FileText } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useData } from '../contexts/DataContext';

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

export default function Marketing() {
  const { profile } = useData();
  const [loading, setLoading] = useState(false);
  const [posts, setPosts] = useState([]);
  const [savedDrafts, setSavedDrafts] = useState([]);
  const [activeTab, setActiveTab] = useState('create');

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
    loadPosts();
    loadDrafts();
  }, [profile]);

  const loadPosts = async () => {
    if (!profile?.id) return;
    const { data } = await supabase
      .from('posts')
      .select('*')
      .eq('business_id', profile.id)
      .order('created_at', { ascending: false });
    if (data) setPosts(data);
  };

  const loadDrafts = async () => {
    if (!profile?.id) return;
    const { data } = await supabase
      .from('post_drafts')
      .select('*')
      .eq('business_id', profile.id)
      .order('created_at', { ascending: false });
    if (data) setSavedDrafts(data);
  };

  const generateWithAI = async () => {
    if (!formData.subject) {
      alert('⚠️ Veuillez entrer un sujet');
      return;
    }

    if (!OPENAI_API_KEY) {
      alert('⚠️ Clé API OpenAI manquante. Ajoutez VITE_OPENAI_API_KEY dans votre .env');
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
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: `Tu es un expert en marketing digital pour ${profile.business_type || 'une entreprise'}. Génère du contenu engageant et optimisé pour les réseaux sociaux en français.`
            },
            {
              role: 'user',
              content: `Crée un post ${formData.tone} pour ${formData.platform} sur le sujet suivant : ${formData.subject}. Le post doit inclure des emojis pertinents et 3-5 hashtags.`
            }
          ],
          temperature: 0.8,
          max_tokens: 500
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Erreur API OpenAI');
      }

      const data = await response.json();
      const generatedContent = data.choices[0].message.content;

      setFormData(prev => ({
        ...prev,
        content: generatedContent
      }));

      alert('✅ Contenu généré avec succès !');
    } catch (error) {
      console.error('❌ Erreur génération IA:', error);
      alert(`❌ Erreur : ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const saveDraft = async () => {
    if (!profile?.id || !formData.content) return;

    try {
      const { error } = await supabase
        .from('post_drafts')
        .insert([{
          business_id: profile.id,
          subject: formData.subject,
          content: formData.content,
          platform: formData.platform,
          tone: formData.tone
        }]);

      if (error) throw error;
      alert('✅ Brouillon sauvegardé');
      loadDrafts();
    } catch (error) {
      console.error('❌ Erreur sauvegarde:', error);
      alert('❌ Erreur lors de la sauvegarde');
    }
  };

  const publishPost = async () => {
    if (!profile?.id || !formData.content) return;

    try {
      const postData = {
        business_id: profile.id,
        title: formData.subject,
        content: formData.content,
        platform: formData.platform,
        status: formData.scheduledDate ? 'scheduled' : 'published',
        scheduled_for: formData.scheduledDate && formData.scheduledTime 
          ? `${formData.scheduledDate}T${formData.scheduledTime}:00` 
          : null
      };

      const { error } = await supabase
        .from('posts')
        .insert([postData]);

      if (error) throw error;

      alert(formData.scheduledDate ? '✅ Post programmé avec succès' : '✅ Post publié avec succès');
      
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

      loadPosts();
    } catch (error) {
      console.error('❌ Erreur publication:', error);
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
      loadDrafts();
    } catch (error) {
      console.error('❌ Erreur suppression:', error);
    }
  };

  const deletePost = async (postId) => {
    if (!confirm('Supprimer ce post ?')) return;
    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId);
      if (error) throw error;
      loadPosts();
    } catch (error) {
      console.error('❌ Erreur suppression:', error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
          <Wand2 className="text-indigo-600" size={32} />
          Studio Marketing
        </h1>
        <p className="text-slate-600 mt-2">
          Créez et programmez vos publications sur les réseaux sociaux avec l'IA
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm mb-6">
        <div className="flex border-b border-slate-200">
          {[
            { id: 'create', label: 'Créer', icon: Sparkles },
            { id: 'drafts', label: 'Brouillons', icon: FileText },
            { id: 'history', label: 'Historique', icon: Clock }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-4 font-bold transition-all ${
                activeTab === tab.id
                  ? 'border-b-2 border-indigo-600 text-indigo-600'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* TAB: CRÉER */}
      {activeTab === 'create' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Formulaire */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-lg font-black text-slate-900 mb-4">Nouveau post</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Sujet / Thème
                </label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  placeholder="Ex: Nouvelle collection printemps"
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Ton
                  </label>
                  <select
                    value={formData.tone}
                    onChange={(e) => setFormData({...formData, tone: e.target.value})}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="professionnel">Professionnel</option>
                    <option value="amical">Amical</option>
                    <option value="enthousiaste">Enthousiaste</option>
                    <option value="informatif">Informatif</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Plateforme
                  </label>
                  <select
                    value={formData.platform}
                    onChange={(e) => setFormData({...formData, platform: e.target.value})}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="facebook">Facebook</option>
                    <option value="instagram">Instagram</option>
                    <option value="twitter">Twitter</option>
                    <option value="linkedin">LinkedIn</option>
                  </select>
                </div>
              </div>

              <button
                onClick={generateWithAI}
                disabled={loading || !formData.subject}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Contenu
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                  rows={8}
                  placeholder="Le contenu généré apparaîtra ici..."
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    value={formData.scheduledDate}
                    onChange={(e) => setFormData({...formData, scheduledDate: e.target.value})}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Heure
                  </label>
                  <input
                    type="time"
                    value={formData.scheduledTime}
                    onChange={(e) => setFormData({...formData, scheduledTime: e.target.value})}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={saveDraft}
                  disabled={!formData.content}
                  className="flex-1 bg-slate-200 text-slate-700 py-3 rounded-xl font-bold hover:bg-slate-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Save size={18} />
                  Brouillon
                </button>
                <button
                  onClick={publishPost}
                  disabled={!formData.content}
                  className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Send size={18} />
                  {formData.scheduledDate ? 'Programmer' : 'Publier'}
                </button>
              </div>
            </div>
          </div>

          {/* Aperçu */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-lg font-black text-slate-900 mb-4">Aperçu</h3>
            <div className="bg-slate-50 rounded-xl p-4 min-h-[400px]">
              {formData.content ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
                    <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                      {profile.business_name?.[0] || 'B'}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">{profile.business_name}</div>
                      <div className="text-xs text-slate-500">À l'instant • {formData.platform}</div>
                    </div>
                  </div>
                  <p className="text-slate-700 whitespace-pre-wrap">{formData.content}</p>
                  {formData.scheduledDate && (
                    <div className="text-xs text-slate-500 flex items-center gap-1 pt-4 border-t border-slate-200">
                      <Calendar size={14} />
                      Programmé pour le {new Date(formData.scheduledDate).toLocaleDateString('fr-FR')}
                      {formData.scheduledTime && ` à ${formData.scheduledTime}`}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-slate-400">
                  <div className="text-center">
                    <Sparkles size={48} className="mx-auto mb-4 opacity-20" />
                    <p>L'aperçu apparaîtra ici</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB: BROUILLONS */}
      {activeTab === 'drafts' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h3 className="text-lg font-black text-slate-900 mb-4">Brouillons sauvegardés</h3>
          {savedDrafts.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <FileText size={48} className="mx-auto mb-4 opacity-20" />
              <p>Aucun brouillon pour le moment</p>
            </div>
          ) : (
            <div className="space-y-4">
              {savedDrafts.map(draft => (
                <div key={draft.id} className="border border-slate-200 rounded-xl p-4 hover:border-indigo-300 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-bold text-slate-900">{draft.subject}</h4>
                      <p className="text-xs text-slate-500">{draft.platform} • {draft.tone}</p>
                    </div>
                    <button
                      onClick={() => deleteDraft(draft.id)}
                      className="text-red-500 hover:text-red-700 p-2"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  <p className="text-sm text-slate-600 line-clamp-2">{draft.content}</p>
                  <button
                    onClick={() => {
                      setFormData({
                        subject: draft.subject,
                        content: draft.content,
                        platform: draft.platform,
                        tone: draft.tone,
                        scheduledDate: '',
                        scheduledTime: '',
                        imageUrl: ''
                      });
                      setActiveTab('create');
                    }}
                    className="mt-3 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    Reprendre l'édition →
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB: HISTORIQUE */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h3 className="text-lg font-black text-slate-900 mb-4">Posts publiés</h3>
          {posts.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <Clock size={48} className="mx-auto mb-4 opacity-20" />
              <p>Aucun post publié pour le moment</p>
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map(post => (
                <div key={post.id} className="border border-slate-200 rounded-xl p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-bold text-slate-900">{post.title}</h4>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                        <span>{post.platform}</span>
                        <span>•</span>
                        <span>{new Date(post.created_at).toLocaleDateString('fr-FR')}</span>
                        {post.status === 'scheduled' && (
                          <>
                            <span>•</span>
                            <span className="text-orange-600 font-medium">Programmé</span>
                          </>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => deletePost(post.id)}
                      className="text-red-500 hover:text-red-700 p-2"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  <p className="text-sm text-slate-600">{post.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
