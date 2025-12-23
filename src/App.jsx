import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import AuthForm from './components/AuthForm';

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!session) {
    return <AuthForm />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-8">
        <h1 className="text-3xl font-bold text-green-600">✅ APP FONCTIONNE !</h1>
        <p className="mt-4 text-lg">Connecté en tant que : {session.user.email}</p>
        <button 
          onClick={() => supabase.auth.signOut()}
          className="mt-4 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Se déconnecter
        </button>
      </div>
    </div>
  );
}

export default App;
