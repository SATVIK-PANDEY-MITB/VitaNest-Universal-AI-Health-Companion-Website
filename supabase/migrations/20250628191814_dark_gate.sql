/*
  # Create medications table

  1. New Tables
    - `medications`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users.id)
      - `name` (text, required)
      - `dosage` (text, required)
      - `frequency` (text, required)
      - `start_date` (date, required)
      - `end_date` (date, optional)
      - `instructions` (text, optional)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on medications table
    - Add policies for authenticated users to manage their own medications
*/

-- Create medications table
CREATE TABLE IF NOT EXISTS medications (
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

-- Enable Row Level Security
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;

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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_medications_user_id ON medications(user_id);
CREATE INDEX IF NOT EXISTS idx_medications_start_date ON medications(start_date);

-- Create trigger for updated_at
CREATE TRIGGER update_medications_updated_at
  BEFORE UPDATE ON medications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();