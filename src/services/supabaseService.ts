import { supabase } from '../lib/supabase';
import { User, Medication, Appointment, ChatMessage } from '../types';

export class SupabaseService {
  static async testDatabaseConnection() {
    try {
      const tests = [
        { name: 'users', query: supabase.from('users').select('count', { count: 'exact', head: true }) },
        { name: 'health_profiles', query: supabase.from('health_profiles').select('count', { count: 'exact', head: true }) },
        { name: 'medications', query: supabase.from('medications').select('count', { count: 'exact', head: true }) },
        { name: 'appointments', query: supabase.from('appointments').select('count', { count: 'exact', head: true }) },
        { name: 'chat_messages', query: supabase.from('chat_messages').select('count', { count: 'exact', head: true }) }
      ];
      const results = [];
      for (const test of tests) {
        try {
          const { error } = await test.query;
          if (error) {
            results.push({ table: test.name, status: 'error', error: error.message });
          } else {
            results.push({ table: test.name, status: 'success' });
          }
        } catch (err: any) {
          results.push({ table: test.name, status: 'error', error: err.message });
        }
      }
      return results;
    } catch (error: any) {
      return [{ table: 'connection', status: 'error', error: error.message }];
    }
  }

  static async ensureUserProfileExists(userId: string, email: string, name: string) {
    try {
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      if (checkError && checkError.code !== 'PGRST116') {
        throw new Error(`Failed to check user profile: ${checkError.message}`);
      }
      if (existingUser) return existingUser;
      const profileData = {
        id: userId,
        email: email.toLowerCase().trim(),
        name: name.trim(),
        subscription: 'free',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert(profileData)
        .select()
        .single();
      if (createError) {
        if (createError.code === '23505') {
          const { data: fetchedUser, error: fetchError } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();
          if (fetchError) throw new Error(`Failed to fetch user profile after creation: ${fetchError.message}`);
          return fetchedUser;
        }
        throw new Error(`Failed to create user profile: ${createError.message}`);
      }
      return newUser;
    } catch (error: any) {
      throw error;
    }
  }

  static async signUp(email: string, password: string, name: string) {
    try {
      if (!email || !password || !name) throw new Error('All fields are required');
      if (password.length < 6) throw new Error('Password must be at least 6 characters');
      const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
      if (!emailRegex.test(email)) throw new Error('Invalid email format');
      const cleanEmail = email.toLowerCase().trim();
      const cleanName = name.trim();
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            name: cleanName,
            display_name: cleanName
          }
        }
      });
      if (error) {
        if (error.message.includes('User already registered')) {
          return await this.signIn(cleanEmail, password);
        } else if (error.message.includes('Password should be at least')) {
          throw new Error('Password must be at least 6 characters long');
        } else if (error.message.includes('Invalid email')) {
          throw new Error('Please enter a valid email address');
        } else {
          throw new Error(`Account creation failed: ${error.message}`);
        }
      }
      if (!data.user) throw new Error('Account creation failed. Please try again.');
      await this.ensureUserProfileExists(data.user.id, cleanEmail, cleanName);
      return data;
    } catch (error: any) {
      throw error;
    }
  }

  static async signIn(email: string, password: string) {
    try {
      if (!email || !password) throw new Error('Email and password are required');
      const cleanEmail = email.toLowerCase().trim();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password
      });
      if (error) {
        if (error.message.includes('Invalid login credentials') || error.message.includes('Invalid email or password')) {
          throw new Error('Invalid email or password. Please check your credentials and try again.');
        } else if (error.message.includes('Email not confirmed')) {
          throw new Error('Please verify your email address before signing in.');
        } else if (error.message.includes('Too many requests')) {
          throw new Error('Too many login attempts. Please wait a few minutes and try again.');
        } else {
          throw new Error(`Sign in failed: ${error.message}`);
        }
      }
      if (!data.user || !data.session) throw new Error('Sign in failed. No user session created.');
      await this.ensureUserProfileExists(
        data.user.id,
        data.user.email || cleanEmail,
        data.user.user_metadata?.name || data.user.user_metadata?.display_name || 'User'
      );
      return data;
    } catch (error: any) {
      throw error;
    }
  }

  static async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {}
    } catch (error) {}
  }

  static async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) return null;
      if (!user) return null;
      return user;
    } catch (error: any) {
      return null;
    }
  }

  static async createUserProfile(userId: string, email: string, name: string) {
    try {
      if (!userId || !email || !name) throw new Error('User ID, email, and name are required');
      const profileData = {
        id: userId,
        email: email.toLowerCase().trim(),
        name: name.trim(),
        subscription: 'free',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      const { data, error } = await supabase
        .from('users')
        .upsert(profileData, { 
          onConflict: 'id',
          ignoreDuplicates: false 
        })
        .select()
        .single();
      if (error) throw new Error(`Failed to create user profile: ${error.message || 'Unknown database error'}`);
      return data;
    } catch (error: any) {
      throw error;
    }
  }

  static async getUserProfile(userId: string) {
    try {
      if (!userId) throw new Error('User ID is required');
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
      if (userError) {
        if (userError.code === 'PGRST116') {
          return {
            id: userId,
            email: '',
            name: 'User',
            subscription: 'free',
            health_profiles: [],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
        }
        throw new Error(`Failed to fetch user profile: ${userError.message || 'Unknown database error'}`);
      }
      const { data: healthData } = await supabase
        .from('health_profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      const result = {
        ...userData,
        health_profiles: healthData ? [healthData] : []
      };
      return result;
    } catch (error: any) {
      return {
        id: userId,
        email: '',
        name: 'User',
        subscription: 'free',
        health_profiles: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    }
  }

  static async updateUserProfile(userId: string, updates: any) {
    try {
      if (!userId) throw new Error('User ID is required');
      if (!updates || Object.keys(updates).length === 0) throw new Error('No updates provided');
      const cleanUpdates: any = {
        updated_at: new Date().toISOString()
      };
      if (updates.name !== undefined) {
        if (typeof updates.name !== 'string' || updates.name.trim().length === 0) throw new Error('Name must be a non-empty string');
        cleanUpdates.name = updates.name.trim();
      }
      if (updates.email !== undefined) {
        if (typeof updates.email !== 'string' || updates.email.trim().length === 0) throw new Error('Email must be a non-empty string');
        const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
        if (!emailRegex.test(updates.email)) throw new Error('Invalid email format');
        cleanUpdates.email = updates.email.toLowerCase().trim();
      }
      if (updates.subscription !== undefined) {
        if (!['free', 'premium', 'enterprise'].includes(updates.subscription)) throw new Error('Invalid subscription type');
        cleanUpdates.subscription = updates.subscription;
      }
      const { data, error } = await supabase
        .from('users')
        .update(cleanUpdates)
        .eq('id', userId)
        .select()
        .single();
      if (error) {
        if (error.code === '23505') throw new Error('Email already exists. Please use a different email address.');
        else if (error.code === '23502') throw new Error('Required field is missing. Please fill in all required fields.');
        else if (error.code === 'PGRST116') throw new Error('User profile not found. Please try refreshing the page.');
        else if (error.message?.includes('JWT')) throw new Error('Session expired. Please sign in again.');
        else throw new Error(`Failed to update user profile: ${error.message || 'Unknown database error'}`);
      }
      if (!data) throw new Error('Update completed but no data returned. Please refresh the page.');
      return data;
    } catch (error: any) {
      throw error;
    }
  }
}