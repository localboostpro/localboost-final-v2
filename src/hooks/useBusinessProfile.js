import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export function useBusinessProfile(userId) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    // Chargement initial
    const fetchProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('business_profile')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (error) throw error;
        setProfile(data);
      } catch (err) {
        console.error('❌ Erreur:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();

    // ✅ ÉCOUTE EN TEMPS RÉEL
    const channel = supabase
      .channel(`business_profile:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'business_profile',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          console.log('🔄 Mise à jour détectée:', payload);
          
          if (payload.eventType === 'UPDATE') {
            setProfile(payload.new);
          }
        }
      )
      .subscribe();

    // Nettoyage
    return () => {
      supabase.removeChannel(channel);
    };

  }, [userId]);

  return { profile, loading };
}
