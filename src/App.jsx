import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { supabase } from './lib/supabase';

// Pages
import AuthForm from './components/AuthForm';
import Dashboard from './views/Dashboard';
import Marketing from './views/Marketing';
import Reviews from './views/Reviews';
import Customers from './views/Customers';
import Profile from './views/Profile';
import WebPage from './views/WebPage';
import Promotions from './views/Promotions';
import Admin from './views/Admin';
import Commerces from './views/Commerces';

// Components
import Sidebar from './components/Sidebar';

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

function AppContent() {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Data states
  const [customers, setCustomers] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    // Check session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        loadUserData(session.user);
      } else {
        setLoading(false);
      }
    });

    // Listen to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        loadUserData(session.user);
      } else {
        setProfile(null);
        setIsAdmin(false);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function loadUserData(user) {
    try {
      // Load profile
      const { data: profileData, error: profileError } = await supabase
        .from('business_profile')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profileError) throw profileError;
      
      setProfile(profileData);
      setIsAdmin(profileData?.role === 'admin');

      // Load customers
      const { data: customersData } = await supabase
        .from('customers')
        .select('*')
        .eq('business_id', profileData.id);
      
      setCustomers(customersData || []);

      // Load reviews
      const { data: reviewsData } = await supabase
        .from('posts')
        .select('*')
        .eq('business_id', profileData.id)
        .order('created_at', { ascending: false });
      
      setReviews(reviewsData || []);

      // Load posts
      const { data: postsData } = await supabase
        .from('posts')
        .select('*')
        .eq('business_id', profileData.id)
        .order('created_at', { ascending: false });
      
      setPosts(postsData || []);

    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }

  const upsertPostInState = (post) => {
    setPosts((prev) => {
      const exists = prev.find((p) => String(p.id) === String(post.id));
      if (exists) {
        return prev.map((p) => (String(p.id) === String(post.id) ? post : p));
      }
      return [post, ...prev];
    });
  };

  const deletePostInState = (id) => {
    setPosts((prev) => prev.filter((p) => String(p.id) !== String(id)));
  };

  // Loading screen
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!session) {
    return <AuthForm />;
  }

  // Stats
  const stats = {
    clients: customers.length,
    reviews: reviews.length,
    posts: posts.length
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      
      {/* SIDEBAR */}
      <Sidebar 
        profile={profile} 
        isAdmin={isAdmin} 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
      />

      {/* HEADER MOBILE */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200 px-4 h-16 flex items-center justify-between shadow-sm">
        <div className="font-bold text-lg text-gray-900">
          LocalBoost
        </div>
        
        <button 
          onClick={() => setIsMobileMenuOpen(true)}
          className="p-2 bg-gray-100 rounded-lg"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="4" x2="20" y1="12" y2="12"/>
            <line x1="4" x2="20" y1="6" y2="6"/>
            <line x1="4" x2="20" y1="18" y2="18"/>
          </svg>
        </button>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto px-4 md:px-8 pt-20 md:pt-8 pb-10">
        <Routes>
          <Route 
            path="/" 
            element={
              <Dashboard 
                stats={stats} 
                posts={posts} 
                profile={profile} 
              />
            } 
          />
          <Route 
            path="/marketing" 
            element={
              <Marketing 
                posts={posts} 
                profile={profile} 
                onUpdate={upsertPostInState} 
                onUpsert={upsertPostInState} 
                onDelete={deletePostInState} 
              />
            } 
          />
          <Route 
            path="/marketing/:id" 
            element={
              <Marketing 
                posts={posts} 
                profile={profile} 
                onUpdate={upsertPostInState} 
                onUpsert={upsertPostInState} 
                onDelete={deletePostInState} 
              />
            } 
          />
          <Route path="/reviews" element={<Reviews reviews={reviews} />} />
          <Route path="/customers" element={<Customers customers={customers} />} />
          <Route path="/webpage" element={<WebPage profile={profile} setProfile={setProfile} />} />
          <Route path="/profile" element={<Profile profile={profile} setProfile={setProfile} />} />
          <Route path="/promotions" element={<Promotions />} />
          
          {/* Admin routes */}
          <Route 
            path="/admin" 
            element={isAdmin ? <Admin /> : <Navigate to="/" replace />} 
          />
          <Route path="/commerces" element={<Commerces />} />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
