import { create } from 'zustand';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthState {
  session: Session | null;
  user: User | null;
  profile: any | null;
  isLoading: boolean;
  setSession: (session: Session | null) => void;
  fetchProfile: () => Promise<void>;
  updateDisplayName: (name: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  user: null,
  profile: null,
  isLoading: true,
  setSession: (session) => {
    set({ session, user: session?.user || null });
    if (session?.user) {
      get().fetchProfile();
    } else {
      set({ profile: null, isLoading: false });
    }
  },
  fetchProfile: async () => {
    const { user } = get();
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('users_profiles')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (!error && data) {
        set({ profile: data });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      set({ isLoading: false });
    }
  },
  updateDisplayName: async (name) => {
    const { user } = get();
    if (!user) return;

    try {
      // Try to update first
      const { data, error } = await (supabase as any)
        .from('users_profiles')
        .update({ display_name: name })
        .eq('id', user.id)
        .select();

      if (error) throw error;

      // If no rows updated, it means the profile doesn't exist yet, so we insert it
      if (!data || data.length === 0) {
        const { error: insertError } = await (supabase as any)
          .from('users_profiles')
          .insert({ id: user.id, display_name: name });
        
        if (insertError) throw insertError;
      }

      // Update local state instantly
      set((state) => ({
        profile: state.profile 
          ? { ...state.profile, display_name: name } 
          : { id: user.id, display_name: name, currency: 'LKR', monthly_budget: null },
      }));
    } catch (err) {
      console.error('Error updating name:', err);
      throw err;
    }
  },
  signOut: async () => {
    await supabase.auth.signOut();
    set({ session: null, user: null, profile: null });
  },
}));
