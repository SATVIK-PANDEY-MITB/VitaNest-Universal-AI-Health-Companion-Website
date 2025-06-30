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
      console.log('🔍 Testing database connection from auth store...');
      const results = await SupabaseService.testDatabaseConnection();
      console.log('📊 Database test results:', results);
      return results;
    } catch (error) {
      console.error('❌ Database test failed:', error);
      return [{ table: 'connection', status: 'error', error: error.message }];
    }
  },

  ensureUserProfileExists: async (authUser: any) => {
    try {
      console.log('🔍 Ensuring user profile exists for:', authUser.id);
      
      // Use the enhanced ensureUserProfileExists method
      const userProfile = await SupabaseService.ensureUserProfileExists(
        authUser.id,
        authUser.email || '',
        authUser.user_metadata?.name || authUser.user_metadata?.display_name || 'User'
      );

      // Create the User object
      const user: User = {
        id: authUser.id,
        email: authUser.email || userProfile.email || '',
        name: userProfile.name || authUser.user_metadata?.name || authUser.user_metadata?.display_name || 'User',
        subscription: userProfile.subscription || 'free',
        healthProfile: userProfile.health_profiles?.[0] || {}
      };

      console.log('✅ User profile ensured:', user);
      return user;
    } catch (error) {
      console.error('❌ Error ensuring user profile exists:', error);
      throw error;
    }
  },

  refreshUser: async () => {
    const { user } = get();
    if (!user) return;

    try {
      console.log('🔄 Refreshing user data...');
      const userProfile = await SupabaseService.getUserProfile(user.id);
      
      const updatedUser: User = {
        id: user.id,
        email: userProfile.email || user.email,
        name: userProfile.name || user.name,
        subscription: userProfile.subscription || 'free',
        healthProfile: userProfile.health_profiles?.[0] || {}
      };
      
      console.log('✅ User data refreshed:', updatedUser);
      set({ user: updatedUser });
    } catch (error) {
      console.error('❌ Failed to refresh user data:', error);
    }
  },

  signIn: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    
    try {
      console.log('🚀 Starting sign in process...');
      
      // Clear any existing session first
      try {
        await supabase.auth.signOut();
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (signOutError) {
        console.debug('Sign out before sign in failed (expected):', signOutError);
      }
      
      console.log('🔐 Attempting authentication...');
      const { user: authUser, session } = await SupabaseService.signIn(email, password);
      
      if (authUser && session) {
        console.log('✅ Authentication successful, ensuring user profile exists...');
        
        // Ensure user profile exists in database
        const user = await get().ensureUserProfileExists(authUser);
        
        console.log('🎉 Sign in successful! User:', user.name, user.email);
        set({ user, isAuthenticated: true, isLoading: false, error: null });
        
        // Initialize sample data for users (non-blocking)
        try {
          const { initializeSampleData } = useHealthStore.getState();
          await initializeSampleData(user.id);
          console.log('✅ Sample data initialized');
        } catch (sampleDataError) {
          console.warn('⚠️ Failed to initialize sample data:', sampleDataError);
        }
      } else {
        throw new Error('Authentication failed - no user data received');
      }
    } catch (error: any) {
      console.error('❌ Sign in failed:', error);
      
      let errorMessage = 'Sign in failed. Please try again.';
      
      if (error.message) {
        errorMessage = error.message;
      }
      
      set({ 
        isLoading: false, 
        error: errorMessage,
        user: null,
        isAuthenticated: false
      });
      throw error;
    }
  },

  signUp: async (email: string, password: string, name: string) => {
    set({ isLoading: true, error: null });
    
    try {
      console.log('🚀 Starting sign up process...');
      
      console.log('📝 Creating new account...');
      const { user: authUser, session } = await SupabaseService.signUp(email, password, name);
      
      if (authUser) {
        console.log('✅ Account created successfully, ensuring user profile exists...');
        
        // Wait a moment for the database trigger to potentially create the profile
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Ensure user profile exists in database
        const user = await get().ensureUserProfileExists(authUser);
        
        console.log('🎉 Sign up successful! User:', user.name, user.email);
        set({ user, isAuthenticated: true, isLoading: false, error: null });
        
        // Initialize sample data for new users (non-blocking)
        try {
          const { initializeSampleData } = useHealthStore.getState();
          await initializeSampleData(user.id);
          console.log('✅ Sample data initialized');
        } catch (sampleDataError) {
          console.warn('⚠️ Failed to initialize sample data:', sampleDataError);
        }
      } else {
        throw new Error('Account creation failed. Please try again.');
      }
    } catch (error: any) {
      console.error('❌ Sign up failed:', error);
      
      let errorMessage = 'Account creation failed. Please try again.';
      
      if (error.message) {
        errorMessage = error.message;
      }
      
      set({ 
        isLoading: false, 
        error: errorMessage,
        user: null,
        isAuthenticated: false
      });
      throw error;
    }
  },

  signOut: async () => {
    set({ isLoading: true, error: null });
    try {
      console.log('🚪 Signing out...');
      await SupabaseService.signOut();
      set({ 
        user: null, 
        isAuthenticated: false, 
        isLoading: false, 
        error: null 
      });
      console.log('✅ Sign out successful');
    } catch (error: any) {
      console.error('❌ Sign out error:', error);
      // Even if sign out fails, clear the local state
      set({ 
        user: null, 
        isAuthenticated: false, 
        isLoading: false, 
        error: null 
      });
    }
  },

  updateUser: async (userData: Partial<User>) => {
    const { user } = get();
    if (!user) {
      throw new Error('No user logged in');
    }

    set({ isLoading: true, error: null });
    try {
      console.log('📝 Updating user with data:', userData);
      
      // Update the user in local state immediately for better UX
      const updatedUser = { ...user, ...userData };
      set({ user: updatedUser });
      
      // Then update in database
      if (userData.healthProfile) {
        await SupabaseService.updateHealthProfile(user.id, userData.healthProfile);
      }
      
      // Update other user fields if needed
      if (userData.name || userData.email) {
        await SupabaseService.updateUserProfile(user.id, {
          name: userData.name,
          email: userData.email
        });
      }
      
      // Refresh user data from database to ensure consistency
      await get().refreshUser();
      
      set({ isLoading: false, error: null });
      console.log('✅ User updated successfully');
    } catch (error: any) {
      console.error('❌ Update user error:', error);
      
      // Revert local changes on error
      set({ user, isLoading: false, error: error.message || 'Failed to update user profile' });
      throw error;
    }
  },

  initializeAuth: async () => {
    set({ isLoading: true, error: null });
    
    try {
      console.log('🔄 Initializing auth...');
      
      console.log('🔍 Checking for existing session...');
      const authUser = await SupabaseService.getCurrentUser();
      
      if (authUser) {
        console.log('✅ Found existing user session:', authUser.email);
        
        // Ensure user profile exists in database
        const user = await get().ensureUserProfileExists(authUser);
        
        console.log('🎉 Auth initialized with user:', user.name, user.email);
        set({ user, isAuthenticated: true, isLoading: false, error: null });
        
        // Initialize sample data for existing users if they don't have any (non-blocking)
        try {
          const { initializeSampleData } = useHealthStore.getState();
          await initializeSampleData(user.id);
          console.log('✅ Sample data check completed');
        } catch (sampleDataError) {
          console.warn('⚠️ Failed to initialize sample data:', sampleDataError);
        }
      } else {
        console.log('ℹ️ No existing user session found');
        set({ 
          user: null, 
          isAuthenticated: false, 
          isLoading: false, 
          error: null 
        });
      }
    } catch (error: any) {
      console.error('❌ Initialize auth error:', error);
      set({ 
        user: null, 
        isAuthenticated: false, 
        isLoading: false, 
        error: null // Don't show error for initialization failures
      });
    }
  }
}));

// Listen for auth state changes with debouncing
let authChangeTimeout: NodeJS.Timeout;

supabase.auth.onAuthStateChange(async (event, session) => {
  console.log('🔄 Auth state changed:', event, session?.user?.email || 'no user');
  
  // Clear any existing timeout
  if (authChangeTimeout) {
    clearTimeout(authChangeTimeout);
  }
  
  // Debounce auth state changes to prevent rapid updates
  authChangeTimeout = setTimeout(async () => {
    const { initializeAuth } = useAuthStore.getState();
    
    if (event === 'SIGNED_IN' && session?.user) {
      console.log('✅ User signed in via auth state change, initializing...');
      await initializeAuth();
    } else if (event === 'SIGNED_OUT') {
      console.log('🚪 User signed out via auth state change');
      useAuthStore.setState({ 
        user: null, 
        isAuthenticated: false, 
        isLoading: false, 
        error: null 
      });
    } else if (event === 'TOKEN_REFRESHED' && session?.user) {
      console.log('🔄 Token refreshed for user:', session.user.email);
      // Don't reinitialize on token refresh, just log it
    }
  }, 500); // 500ms debounce
});