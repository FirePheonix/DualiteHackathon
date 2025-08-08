import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      console.log('useAuth - getting initial session');
      const { data: { session } } = await supabase.auth.getSession();
      console.log('useAuth - initial session:', session);
      setUser(session?.user ?? null);
      setLoading(false);
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('useAuth - auth state change:', event, session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    console.log('useAuth - attempting sign in for:', email);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    console.log('useAuth - sign in result:', { data, error });
    return { data, error };
  };

  const signUp = async (email: string, password: string) => {
    console.log('useAuth - attempting sign up for:', email);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`
      }
    });
    console.log('useAuth - sign up result:', { data, error });
    return { data, error };
  };

  const signOut = async () => {
    console.log('useAuth - attempting sign out');
    const { error } = await supabase.auth.signOut();
    console.log('useAuth - sign out result:', { error });
    return { error };
  };

  return {
    user,
    loading,
    signIn,
    signUp,
    signOut,
  };
};
