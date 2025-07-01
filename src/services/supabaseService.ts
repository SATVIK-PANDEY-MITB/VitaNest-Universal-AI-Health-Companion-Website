import { supabase } from '../lib/supabase';
import { User, Medication, Appointment, ChatMessage } from '../types';

export class SupabaseService {
  // Test database connection and verify tables exist
  static async testDatabaseConnection() {
    try {
      console.log('🔍 Testing database connection...');
      
      // Test each table exists by running a simple query
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
            console.error(`❌ Table ${test.name} error:`, error);
            results.push({ table: test.name, status: 'error', error: error.message });
          } else {
            console.log(`✅ Table ${test.name} exists and is accessible`);
            results.push({ table: test.name, status: 'success' });
          }
        } catch (err) {
          console.error(`❌ Table ${test.name} test failed:`, err);
          results.push({ table: test.name, status: 'error', error: err.message });
        }
      }

      return results;
    } catch (error) {
      console.error('❌ Database connection test failed:', error);
      return [{ table: 'connection', status: 'error', error: error.message }];
    }
  }

  // Enhanced user profile validation and creation
  static async ensureUserProfileExists(userId: string, email: string, name: string) {
    try {
      console.log('🔍 Ensuring user profile exists for:', userId);

      // First, check if user profile exists
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('❌ Error checking user profile:', checkError);
        throw new Error(`Failed to check user profile: ${checkError.message}`);
      }

      if (existingUser) {
        console.log('✅ User profile already exists:', existingUser.name);
        return existingUser;
      }

      // User profile doesn't exist, create it
      console.log('➕ Creating user profile...');
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
        console.error('❌ Error creating user profile:', createError);
        
        // If it's a unique constraint violation, the user might have been created by another process
        if (createError.code === '23505') {
          console.log('🔄 User profile created by another process, fetching...');
          const { data: fetchedUser, error: fetchError } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();

          if (fetchError) {
            throw new Error(`Failed to fetch user profile after creation: ${fetchError.message}`);
          }
          return fetchedUser;
        }
        
        throw new Error(`Failed to create user profile: ${createError.message}`);
      }

      console.log('✅ User profile created successfully:', newUser.name);
      return newUser;
    } catch (error: any) {
      console.error('❌ Error ensuring user profile exists:', error);
      throw error;
    }
  }

  // Simplified authentication with better error handling
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
      console.log('🚪 Signing out user...');
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Sign out error:', error);
      }
      console.log('✅ User signed out successfully');
    } catch (error) {
      console.error('SignOut error:', error);
    }
  }

  static async getCurrentUser() {
    try {
      console.log('🔍 Getting current user...');
      
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) {
        console.debug('Get user error (expected if not authenticated):', error);
        return null;
      }
      
      if (!user) {
        console.debug('No user found');
        return null;
      }

      console.log('✅ Current user found:', user.id, user.email);
      return user;
    } catch (error: any) {
      console.debug('GetCurrentUser error:', error);
      return null;
    }
  }

  // User Profile Management with enhanced error handling and validation
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
      const { data: healthData, error: healthError } = await supabase
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
        const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
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

  // Health Profile Management with enhanced error handling and correct column mapping
  static async createHealthProfile(userId: string, healthData: any) {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }

      console.log('🏥 Creating health profile for:', userId, healthData);

      // Map the data to correct database column names with validation
      const dbHealthData = {
        user_id: userId,
        age: healthData.age && !isNaN(healthData.age) ? parseInt(healthData.age) : null,
        gender: healthData.gender || null,
        height: healthData.height && !isNaN(healthData.height) ? parseFloat(healthData.height) : null,
        weight: healthData.weight && !isNaN(healthData.weight) ? parseFloat(healthData.weight) : null,
        blood_type: healthData.blood_type || healthData.bloodType || null,
        allergies: Array.isArray(healthData.allergies) ? healthData.allergies : [],
        conditions: Array.isArray(healthData.conditions) ? healthData.conditions : [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      console.log('📝 Health profile data to insert:', dbHealthData);

      const { data, error } = await supabase
        .from('health_profiles')
        .insert(dbHealthData)
        .select()
        .single();

      if (error) {
        console.error('❌ Create health profile error:', error);
        throw new Error(`Failed to create health profile: ${error.message || 'Unknown database error'}`);
      }
      
      console.log('✅ Health profile created successfully:', data);
      return data;
    } catch (error: any) {
      console.error('❌ CreateHealthProfile error:', error);
      throw error;
    }
  }

  static async updateHealthProfile(userId: string, healthData: any) {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }

      if (!healthData || Object.keys(healthData).length === 0) {
        throw new Error('No health data provided');
      }

      console.log('🏥 Updating health profile for:', userId, healthData);

      // Map the data to correct database column names with validation
      const dbHealthData: any = {
        updated_at: new Date().toISOString()
      };

      // Only include fields that are actually provided and valid
      if (healthData.age !== undefined && healthData.age !== null && healthData.age !== '') {
        const age = parseInt(healthData.age);
        if (!isNaN(age) && age >= 0 && age <= 150) {
          dbHealthData.age = age;
        }
      }

      if (healthData.gender !== undefined && healthData.gender !== null) {
        dbHealthData.gender = healthData.gender || null;
      }

      if (healthData.height !== undefined && healthData.height !== null && healthData.height !== '') {
        const height = parseFloat(healthData.height);
        if (!isNaN(height) && height > 0) {
          dbHealthData.height = height;
        }
      }

      if (healthData.weight !== undefined && healthData.weight !== null && healthData.weight !== '') {
        const weight = parseFloat(healthData.weight);
        if (!isNaN(weight) && weight > 0) {
          dbHealthData.weight = weight;
        }
      }

      if (healthData.blood_type !== undefined || healthData.bloodType !== undefined) {
        dbHealthData.blood_type = healthData.blood_type || healthData.bloodType || null;
      }

      if (healthData.allergies !== undefined) {
        dbHealthData.allergies = Array.isArray(healthData.allergies) ? healthData.allergies : [];
      }

      if (healthData.conditions !== undefined) {
        dbHealthData.conditions = Array.isArray(healthData.conditions) ? healthData.conditions : [];
      }

      console.log('📝 Health profile data to update:', dbHealthData);

      // First, check if health profile exists
      const { data: existingProfile, error: checkError } = await supabase
        .from('health_profiles')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      if (checkError) {
        console.error('❌ Health profile check error:', checkError);
        throw new Error(`Failed to check health profile: ${checkError.message || 'Unknown database error'}`);
      }

      let result;
      if (existingProfile) {
        // Update existing profile
        console.log('📝 Updating existing health profile');
        const { data, error } = await supabase
          .from('health_profiles')
          .update(dbHealthData)
          .eq('user_id', userId)
          .select()
          .single();

        if (error) {
          console.error('❌ Update health profile error:', error);
          throw new Error(`Failed to update health profile: ${error.message || 'Unknown database error'}`);
        }
        result = data;
      } else {
        // Create new profile
        console.log('➕ Creating new health profile');
        const createData = {
          user_id: userId,
          ...dbHealthData,
          created_at: new Date().toISOString()
        };

        const { data, error } = await supabase
          .from('health_profiles')
          .insert(createData)
          .select()
          .single();

        if (error) {
          console.error('❌ Create health profile error:', error);
          throw new Error(`Failed to create health profile: ${error.message || 'Unknown database error'}`);
        }
        result = data;
      }

      if (!result) {
        throw new Error('Health profile operation completed but no data returned');
      }

      console.log('✅ Health profile updated successfully:', result);
      return result;
    } catch (error: any) {
      console.error('❌ UpdateHealthProfile error:', error);
      throw error;
    }
  }

  // Medications Management with validation and user existence check
  static async getMedications(userId: string) {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }

      console.log('💊 Fetching medications for user:', userId);

      const { data, error } = await supabase
        .from('medications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Get medications error:', error);
        throw error;
      }
      
      console.log('✅ Medications fetched:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('❌ GetMedications error:', error);
      return [];
    }
  }

  static async addMedication(userId: string, medication: Omit<Medication, 'id'>) {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }

      if (!medication.name || !medication.dosage || !medication.frequency) {
        throw new Error('Name, dosage, and frequency are required');
      }

      console.log('💊 Adding medication for user:', userId, medication);

      // Ensure user exists before adding medication
      await this.ensureUserExists(userId);

      const { data, error } = await supabase
        .from('medications')
        .insert({
          user_id: userId,
          name: medication.name.trim(),
          dosage: medication.dosage.trim(),
          frequency: medication.frequency.trim(),
          start_date: medication.startDate,
          end_date: medication.endDate,
          instructions: medication.instructions?.trim(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Add medication error:', error);
        if (error.code === '23503') {
          throw new Error('User profile not found. Please refresh the page and try again.');
        }
        throw error;
      }
      
      console.log('✅ Medication added successfully:', data);
      return data;
    } catch (error) {
      console.error('❌ AddMedication error:', error);
      throw error;
    }
  }

  static async updateMedication(medicationId: string, updates: any) {
    try {
      if (!medicationId) {
        throw new Error('Medication ID is required');
      }

      console.log('💊 Updating medication:', medicationId, updates);

      const { data, error } = await supabase
        .from('medications')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', medicationId)
        .select()
        .single();

      if (error) {
        console.error('❌ Update medication error:', error);
        throw error;
      }
      
      console.log('✅ Medication updated successfully:', data);
      return data;
    } catch (error) {
      console.error('❌ UpdateMedication error:', error);
      throw error;
    }
  }

  static async deleteMedication(medicationId: string) {
    try {
      if (!medicationId) {
        throw new Error('Medication ID is required');
      }

      console.log('💊 Deleting medication:', medicationId);

      const { error } = await supabase
        .from('medications')
        .delete()
        .eq('id', medicationId);

      if (error) {
        console.error('❌ Delete medication error:', error);
        throw error;
      }
      
      console.log('✅ Medication deleted successfully');
    } catch (error) {
      console.error('❌ DeleteMedication error:', error);
      throw error;
    }
  }

  // Appointments Management with validation and user existence check
  static async getAppointments(userId: string) {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }

      console.log('📅 Fetching appointments for user:', userId);

      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: true });

      if (error) {
        console.error('❌ Get appointments error:', error);
        throw error;
      }
      
      console.log('✅ Appointments fetched:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('❌ GetAppointments error:', error);
      return [];
    }
  }

  static async addAppointment(userId: string, appointment: Omit<Appointment, 'id'>) {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }

      if (!appointment.title || !appointment.date || !appointment.time || !appointment.doctor) {
        throw new Error('Title, date, time, and doctor are required');
      }

      console.log('📅 Adding appointment for user:', userId, appointment);

      // Ensure user exists before adding appointment
      await this.ensureUserExists(userId);

      const { data, error } = await supabase
        .from('appointments')
        .insert({
          user_id: userId,
          title: appointment.title.trim(),
          date: appointment.date,
          time: appointment.time,
          doctor: appointment.doctor.trim(),
          type: appointment.type,
          status: appointment.status || 'scheduled',
          notes: appointment.notes?.trim(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Add appointment error:', error);
        if (error.code === '23503') {
          throw new Error('User profile not found. Please refresh the page and try again.');
        }
        throw error;
      }
      
      console.log('✅ Appointment added successfully:', data);
      return data;
    } catch (error) {
      console.error('❌ AddAppointment error:', error);
      throw error;
    }
  }

  static async updateAppointment(appointmentId: string, updates: any) {
    try {
      if (!appointmentId) {
        throw new Error('Appointment ID is required');
      }

      console.log('📅 Updating appointment:', appointmentId, updates);

      const { data, error } = await supabase
        .from('appointments')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', appointmentId)
        .select()
        .single();

      if (error) {
        console.error('❌ Update appointment error:', error);
        throw error;
      }
      
      console.log('✅ Appointment updated successfully:', data);
      return data;
    } catch (error) {
      console.error('❌ UpdateAppointment error:', error);
      throw error;
    }
  }

  static async deleteAppointment(appointmentId: string) {
    try {
      if (!appointmentId) {
        throw new Error('Appointment ID is required');
      }

      console.log('📅 Deleting appointment:', appointmentId);

      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', appointmentId);

      if (error) {
        console.error('❌ Delete appointment error:', error);
        throw error;
      }
      
      console.log('✅ Appointment deleted successfully');
    } catch (error) {
      console.error('❌ DeleteAppointment error:', error);
      throw error;
    }
  }

  // Helper method to ensure user exists before operations
  static async ensureUserExists(userId: string) {
    try {
      const { data: userExists, error } = await supabase
        .from('users')
        .select('id')
        .eq('id', userId)
        .single();

      if (error && error.code === 'PGRST116') {
        throw new Error('User profile not found. Please refresh the page and try again.');
      }

      if (error) {
        console.error('❌ Error checking user existence:', error);
        throw new Error('Failed to verify user profile. Please try again.');
      }

      if (!userExists) {
        throw new Error('User profile not found. Please refresh the page and try again.');
      }

      console.log('✅ User exists:', userId);
      return true;
    } catch (error: any) {
      console.error('❌ EnsureUserExists error:', error);
      throw error;
    }
  }

  // Chat Messages Management
  static async getChatMessages(userId: string) {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }

      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Get chat messages error:', error);
        throw error;
      }
      return data || [];
    } catch (error) {
      console.error('GetChatMessages error:', error);
      return [];
    }
  }

  static async addChatMessage(userId: string, message: Omit<ChatMessage, 'id'>) {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }

      if (!message.content || !message.role) {
        throw new Error('Content and role are required');
      }

      const { data, error } = await supabase
        .from('chat_messages')
        .insert({
          user_id: userId,
          content: message.content.trim(),
          role: message.role,
          type: message.type || 'text',
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Add chat message error:', error);
        throw error;
      }
      return data;
    } catch (error) {
      console.error('AddChatMessage error:', error);
      throw error;
    }
  }

  static async clearChatMessages(userId: string) {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }

      const { error } = await supabase
        .from('chat_messages')
        .delete()
        .eq('user_id', userId);

      if (error) {
        console.error('Clear chat messages error:', error);
        throw error;
      }
    } catch (error) {
      console.error('ClearChatMessages error:', error);
      throw error;
    }
  }
}