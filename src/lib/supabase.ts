import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://gcdzvjfkesiluwrjknab.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdjZHp2amZrZXNpbHV3cmprbmFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU0NzE3NzgsImV4cCI6MjA1MTA0Nzc3OH0.v06Tc_BWc_pCr5a8N50UTLUyf3dIIUjEzJIsI_1yufc';

if (!supabaseKey) {
  console.warn('⚠️ Supabase anon key not found. Please add VITE_SUPABASE_ANON_KEY to your environment variables.');
} else {
  console.log('✅ Supabase client initialized successfully');
  console.log('🔗 Connected to:', supabaseUrl);
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    flowType: 'pkce'
  }
});

// Database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          avatar_url?: string;
          subscription: 'free' | 'premium' | 'enterprise';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          name: string;
          avatar_url?: string;
          subscription?: 'free' | 'premium' | 'enterprise';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          avatar_url?: string;
          subscription?: 'free' | 'premium' | 'enterprise';
          updated_at?: string;
        };
      };
      health_profiles: {
        Row: {
          id: string;
          user_id: string;
          age?: number;
          gender?: string;
          height?: number;
          weight?: number;
          blood_type?: string;
          allergies?: string[];
          conditions?: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          age?: number;
          gender?: string;
          height?: number;
          weight?: number;
          blood_type?: string;
          allergies?: string[];
          conditions?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          age?: number;
          gender?: string;
          height?: number;
          weight?: number;
          blood_type?: string;
          allergies?: string[];
          conditions?: string[];
          updated_at?: string;
        };
      };
      medications: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          dosage: string;
          frequency: string;
          start_date: string;
          end_date?: string;
          instructions?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          dosage: string;
          frequency: string;
          start_date: string;
          end_date?: string;
          instructions?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          dosage?: string;
          frequency?: string;
          start_date?: string;
          end_date?: string;
          instructions?: string;
          updated_at?: string;
        };
      };
      appointments: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          date: string;
          time: string;
          doctor: string;
          type: 'consultation' | 'checkup' | 'follow-up' | 'emergency';
          status: 'scheduled' | 'completed' | 'cancelled';
          notes?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          date: string;
          time: string;
          doctor: string;
          type: 'consultation' | 'checkup' | 'follow-up' | 'emergency';
          status?: 'scheduled' | 'completed' | 'cancelled';
          notes?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          title?: string;
          date?: string;
          time?: string;
          doctor?: string;
          type?: 'consultation' | 'checkup' | 'follow-up' | 'emergency';
          status?: 'scheduled' | 'completed' | 'cancelled';
          notes?: string;
          updated_at?: string;
        };
      };
      chat_messages: {
        Row: {
          id: string;
          user_id: string;
          content: string;
          role: 'user' | 'assistant';
          type: 'text' | 'audio' | 'video';
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          content: string;
          role: 'user' | 'assistant';
          type?: 'text' | 'audio' | 'video';
          created_at?: string;
        };
        Update: {
          content?: string;
          role?: 'user' | 'assistant';
          type?: 'text' | 'audio' | 'video';
        };
      };
    };
  };
}