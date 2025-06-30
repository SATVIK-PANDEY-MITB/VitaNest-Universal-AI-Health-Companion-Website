-- Complete Database Schema for Health AI App with Sample Data
-- Run this entire script in your Supabase SQL Editor

-- First, ensure we're working in the public schema
SET search_path TO public;

-- Drop existing tables if they exist (in correct order to handle foreign keys)
DROP TABLE IF EXISTS chat_messages CASCADE;
DROP TABLE IF EXISTS appointments CASCADE;
DROP TABLE IF EXISTS medications CASCADE;
DROP TABLE IF EXISTS health_profiles CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop existing functions and triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create users table
CREATE TABLE users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  avatar_url text,
  subscription text DEFAULT 'free' CHECK (subscription IN ('free', 'premium', 'enterprise')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create health_profiles table
CREATE TABLE health_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  age integer CHECK (age > 0 AND age < 150),
  gender text,
  height numeric CHECK (height > 0),
  weight numeric CHECK (weight > 0),
  blood_type text,
  allergies text[] DEFAULT '{}',
  conditions text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create medications table
CREATE TABLE medications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name text NOT NULL,
  dosage text NOT NULL,
  frequency text NOT NULL,
  start_date date NOT NULL,
  end_date date,
  instructions text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create appointments table
CREATE TABLE appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title text NOT NULL,
  date date NOT NULL,
  time time NOT NULL,
  doctor text NOT NULL,
  type text NOT NULL CHECK (type IN ('consultation', 'checkup', 'follow-up', 'emergency')),
  status text DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create chat_messages table
CREATE TABLE chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content text NOT NULL,
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  type text DEFAULT 'text' CHECK (type IN ('text', 'audio', 'video')),
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own data"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create policies for health_profiles table
CREATE POLICY "Users can read own health profile"
  ON health_profiles
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own health profile"
  ON health_profiles
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own health profile"
  ON health_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own health profile"
  ON health_profiles
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Create policies for medications table
CREATE POLICY "Users can read own medications"
  ON medications
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own medications"
  ON medications
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own medications"
  ON medications
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own medications"
  ON medications
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Create policies for appointments table
CREATE POLICY "Users can read own appointments"
  ON appointments
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own appointments"
  ON appointments
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own appointments"
  ON appointments
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own appointments"
  ON appointments
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Create policies for chat_messages table
CREATE POLICY "Users can read own chat messages"
  ON chat_messages
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own chat messages"
  ON chat_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own chat messages"
  ON chat_messages
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Create indexes for better performance
CREATE INDEX idx_health_profiles_user_id ON health_profiles(user_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_medications_user_id ON medications(user_id);
CREATE INDEX idx_medications_start_date ON medications(start_date);
CREATE INDEX idx_appointments_user_id ON appointments(user_id);
CREATE INDEX idx_appointments_date ON appointments(date);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_chat_messages_user_id ON chat_messages(user_id);
CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at);
CREATE INDEX idx_chat_messages_role ON chat_messages(role);

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_health_profiles_updated_at
  BEFORE UPDATE ON health_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_medications_updated_at
  BEFORE UPDATE ON medications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, subscription)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'display_name', 'User'),
    'free'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- Create a demo user for sample data (this will be created when someone signs up)
-- The sample data will be automatically added when users sign up through the app

-- Function to add sample data for new users
CREATE OR REPLACE FUNCTION add_sample_data_for_user(user_id_param uuid)
RETURNS void AS $$
BEGIN
  -- Add sample medications
  INSERT INTO medications (user_id, name, dosage, frequency, start_date, end_date, instructions) VALUES
  (user_id_param, 'Lisinopril', '10mg', 'Once daily', '2024-01-15', NULL, 'Take with or without food. Monitor blood pressure regularly.'),
  (user_id_param, 'Metformin', '500mg', 'Twice daily', '2024-02-01', NULL, 'Take with meals to reduce stomach upset.'),
  (user_id_param, 'Vitamin D3', '2000 IU', 'Once daily', '2024-01-01', NULL, 'Take with a meal containing fat for better absorption.'),
  (user_id_param, 'Omega-3 Fish Oil', '1000mg', 'Once daily', '2024-01-10', NULL, 'Take with food to prevent fishy aftertaste.'),
  (user_id_param, 'Aspirin', '81mg', 'Once daily', '2024-01-20', NULL, 'Low-dose aspirin for heart health. Take with food.'),
  (user_id_param, 'Multivitamin', '1 tablet', 'Once daily', '2024-01-05', NULL, 'Take with breakfast for better absorption.'),
  (user_id_param, 'Calcium Carbonate', '600mg', 'Twice daily', '2024-02-10', NULL, 'Take with meals. Do not take with iron supplements.'),
  (user_id_param, 'Probiotics', '10 billion CFU', 'Once daily', '2024-02-15', NULL, 'Take on empty stomach, 30 minutes before meals.');

  -- Add sample appointments
  INSERT INTO appointments (user_id, title, date, time, doctor, type, status, notes) VALUES
  (user_id_param, 'Annual Physical Examination', '2025-02-15', '10:00', 'Dr. Sarah Johnson', 'checkup', 'scheduled', 'Bring insurance card and list of current medications. Fasting required for blood work.'),
  (user_id_param, 'Cardiology Consultation', '2025-02-20', '14:30', 'Dr. Michael Chen', 'consultation', 'scheduled', 'Follow-up for blood pressure monitoring. Bring recent BP readings.'),
  (user_id_param, 'Dental Cleaning & Exam', '2025-03-05', '09:00', 'Dr. Emily Davis', 'checkup', 'scheduled', 'Regular 6-month cleaning and examination. No eating 2 hours before.'),
  (user_id_param, 'Eye Examination', '2025-03-12', '11:00', 'Dr. Robert Wilson', 'checkup', 'scheduled', 'Annual vision check and prescription update. Bring current glasses.'),
  (user_id_param, 'Dermatology Screening', '2025-03-18', '15:00', 'Dr. Lisa Martinez', 'checkup', 'scheduled', 'Full body skin cancer screening. Wear comfortable clothing.'),
  (user_id_param, 'Blood Work Follow-up', '2024-12-15', '08:30', 'Dr. Sarah Johnson', 'follow-up', 'completed', 'Reviewed cholesterol and glucose levels. All results within normal range.'),
  (user_id_param, 'Flu Vaccination', '2024-10-20', '16:00', 'Nurse Practitioner Jane Smith', 'checkup', 'completed', 'Annual flu shot administered. No adverse reactions observed.'),
  (user_id_param, 'Physical Therapy Session', '2025-02-25', '13:00', 'Dr. Mark Thompson', 'follow-up', 'scheduled', 'Continuing treatment for lower back pain. Bring exercise log.'),
  (user_id_param, 'Nutrition Consultation', '2025-03-08', '10:30', 'Registered Dietitian Amy Lee', 'consultation', 'scheduled', 'Dietary planning for diabetes management. Bring food diary.'),
  (user_id_param, 'Mental Health Check-in', '2025-03-22', '14:00', 'Dr. Patricia Brown', 'consultation', 'scheduled', 'Quarterly mental health assessment. Discuss stress management techniques.');

  -- Add sample health profile
  INSERT INTO health_profiles (user_id, age, gender, height, weight, blood_type, allergies, conditions) VALUES
  (user_id_param, 35, 'male', 175.5, 78.2, 'O+', 
   ARRAY['Peanuts', 'Shellfish', 'Penicillin'], 
   ARRAY['Hypertension', 'Type 2 Diabetes', 'Seasonal Allergies']);

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the handle_new_user function to include sample data
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create user profile
  INSERT INTO public.users (id, email, name, subscription)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'display_name', 'User'),
    'free'
  );
  
  -- Add sample data for the new user
  PERFORM add_sample_data_for_user(NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Refresh the schema cache
NOTIFY pgrst, 'reload schema';