
import React, { useState, useEffect, createContext, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);

  const updateUserState = useCallback(async (currentSession) => {
    if (currentSession?.user) {
      const { data: userProfile, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', currentSession.user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        console.error("Error fetching profile", error);
        setUser(currentSession.user);
      } else {
        setUser(userProfile ? { ...currentSession.user, ...userProfile } : currentSession.user);
      }
    } else {
      setUser(null);
    }
    setSession(currentSession);
  }, []);

  useEffect(() => {
    setLoading(true);
    supabase.auth.getSession().then(({ data: { session } }) => {
      updateUserState(session).finally(() => setLoading(false));
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      updateUserState(session);
    });

    return () => subscription.unsubscribe();
  }, [updateUserState]);

  const login = async (credentials) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });
    if (error) throw error;
    return data;
  };

  const register = async (userData) => {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: { data: { username: userData.username } },
    });

    if (authError) throw authError;

    if (authData.user) {
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          username: userData.username,
          email: userData.email,
          plan: 'free',
          storage_used: 0,
          role: 'user',
        });
      if (profileError) throw profileError;
    }
    return authData;
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const value = {
    user,
    session,
    login,
    register,
    logout,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>
  );
};
