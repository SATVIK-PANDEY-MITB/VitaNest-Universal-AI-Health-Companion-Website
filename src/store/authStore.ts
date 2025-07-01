import { create } from 'zustand';
import { User } from '../types';
import { SupabaseService } from '../services/supabaseService';
import { supabase } from '../lib/supabase';
import { useHealthStore } from './healthStore';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
  initializeAuth: () => Promise<void>;
  clearError: () => void;
  refreshUser: () => Promise<void>;
  testDatabaseConnection: () => Promise<any>;
  ensureUserProfileExists: (authUser: any) => Promise<User>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  clearError: () => set({ error: null }),

  testDatabaseConnection: async () => {
    try {
      const results = await SupabaseService.testDatabaseConnection();
      return results;
    } catch (error: any) {
      return [{ table: 'connection', status: 'error', error: error.message }];
    }
  },

  ensureUserProfileExists: async (authUser: any) => {
    try {
      const userProfile = await SupabaseService.ensureUserProfileExists(
        authUser.id,
        authUser.email || '',
        authUser.user_metadata?.name || authUser.user_metadata?.display_name || 'User'
      );
      const user: User = {
        id: authUser.id,
        email: authUser.email || userProfile.email || '',
        name: userProfile.name || authUser.user_metadata?.name || authUser.user_metadata?.display_name || 'User',
        subscription: userProfile.subscription || 'free',
        healthProfile: userProfile.health_profiles?.[0] || {}
      };
      return user;
    } catch (error) {
      throw error;
    }
  },

  refreshUser: async () => {
    const { user } = get();
    if (!user) return;
    try {
      const userProfile = await SupabaseService.getUserProfile(user.id);
      const updatedUser: User = {
        id: user.id,
        email: userProfile.email || user.email,
        name: userProfile.name || user.name,
        subscription: userProfile.subscription || 'free',
        healthProfile: userProfile.health_profiles?.[0] || {}
      };
      set({ user: updatedUser });
    } catch (error) {}
  },

  signIn: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      try {
        await supabase.auth.signOut();
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch {}
      const { user: authUser, session } = await SupabaseService.signIn(email, password);
      if (authUser && session) {
        const user = await get().ensureUserProfileExists(authUser);
        set({ user, isAuthenticated: true, isLoading: false, error: null });
        try {
          const { initializeSampleData } = useHealthStore.getState();
          await initializeSampleData(user.id);
        } catch {}
      } else {
        throw new Error('Authentication failed - no user data received');
      }
    } catch (error: any) {
      let errorMessage = 'Sign in failed. Please try again.';
      if (error.message) errorMessage = error.message;
      set({ isLoading: false, error: errorMessage, user: null, isAuthenticated: false });
      throw error;
    }
  },

  signUp: async (email: string, password: string, name: string) => {
    set({ isLoading: true, error: null });
    try {
      const { user: authUser, session } = await SupabaseService.signUp(email, password, name);
      if (authUser) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const user = await get().ensureUserProfileExists(authUser);
        set({ user, isAuthenticated: true, isLoading: false, error: null });
        try {
          const { initializeSampleData } = useHealthStore.getState();
          await initializeSampleData(user.id);
        } catch {}
      } else {
        throw new Error('Account creation failed. Please try again.');
      }
    } catch (error: any) {
      let errorMessage = 'Account creation failed. Please try again.';
      if (error.message) errorMessage = error.message;
      set({ isLoading: false, error: errorMessage, user: null, isAuthenticated: false });
      throw error;
    }
  },

  signOut: async () => {
    set({ isLoading: true, error: null });
    try {
      await SupabaseService.signOut();
      set({ user: null, isAuthenticated: false, isLoading: false, error: null });
    } catch (error: any) {
      set({ user: null, isAuthenticated: false, isLoading: false, error: null });
    }
  },

  updateUser: async (userData: Partial<User>) => {
    const { user } = get();
    if (!user) throw new Error('No user logged in');
    set({ isLoading: true, error: null });
    try {
      const updatedUser = { ...user, ...userData };
      set({ user: updatedUser });
      if (userData.healthProfile) {
        await SupabaseService.updateHealthProfile(user.id, userData.healthProfile);
      }
      if (userData.name || userData.email) {
        await SupabaseService.updateUserProfile(user.id, {
          name: userData.name,
          email: userData.email
        });
      }
      await get().refreshUser();
      set({ isLoading: false, error: null });
    } catch (error: any) {
      set({ user, isLoading: false, error: error.message || 'Failed to update user profile' });
      throw error;
    }
  },

  initializeAuth: async () => {
    set({ isLoading: true, error: null });
    try {
      const authUser = await SupabaseService.getCurrentUser();
      if (authUser) {
        const user = await get().ensureUserProfileExists(authUser);
        set({ user, isAuthenticated: true, isLoading: false, error: null });
        try {
          const { initializeSampleData } = useHealthStore.getState();
          await initializeSampleData(user.id);
        } catch {}
      } else {
        set({ user: null, isAuthenticated: false, isLoading: false, error: null });
      }
    } catch (error: any) {
      set({ user: null, isAuthenticated: false, isLoading: false, error: null });
    }
  }
}));

let authChangeTimeout: any;

supabase.auth.onAuthStateChange(async (event: string, session: any) => {
  if (authChangeTimeout) clearTimeout(authChangeTimeout);
  authChangeTimeout = setTimeout(async () => {
    const { initializeAuth } = useAuthStore.getState();
    if (event === 'SIGNED_IN' && session?.user) {
      await initializeAuth();
    } else if (event === 'SIGNED_OUT') {
      useAuthStore.setState({ user: null, isAuthenticated: false, isLoading: false, error: null });
    }
  }, 500);
});