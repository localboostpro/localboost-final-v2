import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

const DataContext = createContext();

export const DataProvider = ({ children, session }) => {
  const [profile, setProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadAllData = useCallback(async (userId, email) => {
    try {
      setLoading(true);
      setError(null);

      const { data: profileData, error: profileError } = await supabase
        .from('business_profile')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (profileError) throw profileError;

      if (!profileData) {
        setProfile({ name: 'Nouveau compte', email, plan: 'basic', user_id: userId });
        setLoading(false);
        return;
      }

      const [reviewsRes, customersRes, postsRes, promotionsRes] = await Promise.all([
        supabase
          .from('reviews')
          .select('*')
          .eq('business_id', profileData.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('customers')
          .select('*')
          .eq('business_id', profileData.id),
        supabase
          .from('posts')
          .select('*')
          .eq('business_id', profileData.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('promotions')
          .select('*')
          .eq('business_id', profileData.id)
          .order('created_at', { ascending: false }),
      ]);

      setProfile({ ...profileData, email });
      setReviews(reviewsRes.data || []);
      setCustomers(customersRes.data || []);
      setPosts(postsRes.data || []);
      setPromotions(promotionsRes.data || []);

    } catch (e) {
      console.error('Erreur loadAllData:', e);
      setError('Impossible de charger les donnees. Veuillez reessayer.');
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshReviews = useCallback(async (businessId) => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('business_id', businessId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReviews(data || []);
    } catch (e) {
      console.error('Erreur refreshReviews:', e);
    }
  }, []);

  const refreshPosts = useCallback(async (businessId) => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('business_id', businessId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (e) {
      console.error('Erreur refreshPosts:', e);
    }
  }, []);

  const refreshPromotions = useCallback(async (businessId) => {
    try {
      const { data, error } = await supabase
        .from('promotions')
        .select('*')
        .eq('business_id', businessId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPromotions(data || []);
    } catch (e) {
      console.error('Erreur refreshPromotions:', e);
    }
  }, []);

  const refreshCustomers = useCallback(async (businessId) => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('business_id', businessId);

      if (error) throw error;
      setCustomers(data || []);
    } catch (e) {
      console.error('Erreur refreshCustomers:', e);
    }
  }, []);

  const refreshAllData = useCallback(async () => {
    if (profile?.id) {
      await Promise.all([
        refreshReviews(profile.id),
        refreshCustomers(profile.id),
        refreshPosts(profile.id),
        refreshPromotions(profile.id),
      ]);
    }
  }, [profile?.id, refreshReviews, refreshCustomers, refreshPosts, refreshPromotions]);

  useEffect(() => {
    if (session?.user) {
      loadAllData(session.user.id, session.user.email);
    } else {
      setProfile(null);
      setReviews([]);
      setCustomers([]);
      setPosts([]);
      setPromotions([]);
      setLoading(false);
    }
  }, [session, loadAllData]);

  const value = {
    profile,
    reviews,
    customers,
    posts,
    promotions,
    loading,
    error,
    setProfile,
    setReviews,
    setCustomers,
    setPosts,
    setPromotions,
    refreshReviews,
    refreshPosts,
    refreshPromotions,
    refreshCustomers,
    refreshAllData,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData doit etre utilise a l\'interieur de DataProvider');
  }
  return context;
};
