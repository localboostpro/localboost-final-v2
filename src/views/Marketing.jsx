import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { Wand2, Calendar, Image, Send, Trash2, Edit } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Marketing() {
  const { profile, posts, refreshPosts, loading } = useData();

if (loading) {
  return (
    <div className="flex items-center justify-center h-96">
      <Loader className="animate-spin w-12 h-12 text-indigo-600" />
    </div>
  );
}

const postList = posts || [];
  const [newPost, setNewPost] = useState({ content: '', platform: 'facebook', scheduled_at: '' });
  const [loading, setLoading] = useState(false);

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!profile?.id || !newPost.content) return;

    try {
      setLoading(true);
      const { error } = await supabase.from('posts').insert({
        business_id: profile.id,
        content: newPost.content,
        platform: newPost.platform,
        scheduled_at: newPost.scheduled_at || null,
        status: 'draft',
      });

      if (error) throw error;

      await refreshPosts(profile.id);
      setNewPost({ content: '', platform: 'facebook', scheduled_at: '' });
    } catch (e) {
      console.error('Erreur création post:', e);
      alert('Erreur lors de la création du post');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!confirm('Supprimer ce post ?')) return;

    try {
      const { error } = await supabase.from('posts').delete().eq('id', postId);
      if (error) throw error;
      await refreshPosts(profile.id);
    } catch (e) {
      console.error('Erreur suppression post:', e);
    }
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

      {/* Formulaire création post */}
      <div className="bg-white rounded-[2.5rem] p-8 shadow-lg">
        <h2 className="text-2xl font-black text-slate-900 mb-6">Nouvelle publication</h2>
        <form onSubmit={handleCreatePost} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Contenu</label>
            <textarea
              value={newPost.content}
              onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              rows="4"
              placeholder="Rédigez votre publication..."
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Plateforme</label>
              <select
                value={newPost.platform}
                onChange={(e) => setNewPost({ ...newPost, platform: e.target.value })}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
              >
                <option value="facebook">Facebook</option>
                <option value="instagram">Instagram</option>
                <option value="google">Google My Business</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Planification (optionnel)</label>
              <input
                type="datetime-local"
                value={newPost.scheduled_at}
                onChange={(e) => setNewPost({ ...newPost, scheduled_at: e.target.value })}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Send size={18} />
            {loading ? 'Création...' : 'Créer la publication'}
          </button>
        </form>
      </div>

      {/* Liste des posts */}
      <div className="bg-white rounded-[2.5rem] p-8 shadow-lg">
        <h2 className="text-2xl font-black text-slate-900 mb-6">Publications récentes</h2>
        {posts.length === 0 ? (
          <p className="text-slate-500 text-center py-8">Aucune publication pour le moment</p>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <div key={post.id} className="border border-slate-200 rounded-xl p-6 hover:border-indigo-300 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-bold rounded-full">
                        {post.platform}
                      </span>
                      <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                        post.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {post.status === 'published' ? 'Publié' : 'Brouillon'}
                      </span>
                    </div>
                    <p className="text-slate-700">{post.content}</p>
                    {post.scheduled_at && (
                      <p className="text-sm text-slate-500 mt-2 flex items-center gap-1">
                        <Calendar size={14} />
                        Planifié le {new Date(post.scheduled_at).toLocaleString('fr-FR')}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeletePost(post.id)}
                    className="ml-4 p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
