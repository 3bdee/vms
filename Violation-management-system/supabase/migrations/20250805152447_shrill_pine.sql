/*
  # Violation Management System Database Schema

  1. New Tables
    - `students`
      - `id` (uuid, primary key)
      - `first_name` (text)
      - `last_name` (text)
      - `level` (text)
      - `created_at` (timestamp)
    - `teachers`
      - `id` (uuid, primary key)
      - `full_name` (text)
      - `created_at` (timestamp)
    - `violations`
      - `id` (uuid, primary key)
      - `violation_name` (text)
      - `created_at` (timestamp)
    - `punishments`
      - `id` (uuid, primary key)
      - `punishment_name` (text)
      - `created_at` (timestamp)
    - `violation_records`
      - `id` (uuid, primary key)
      - `student_id` (uuid, foreign key)
      - `teacher_id` (uuid, foreign key)
      - `violation_id` (uuid, foreign key)
      - `punishment_id` (uuid, foreign key)
      - `violation_time` (timestamp)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage data

  3. Sample Data
    - Insert sample teachers, violations, and punishments
*/

-- Create students table
CREATE TABLE IF NOT EXISTS students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  last_name text NOT NULL,
  level text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create teachers table
CREATE TABLE IF NOT EXISTS teachers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create violations table
CREATE TABLE IF NOT EXISTS violations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  violation_name text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now()
);

-- Create punishments table
CREATE TABLE IF NOT EXISTS punishments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  punishment_name text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now()
);

-- Create violation_records table
CREATE TABLE IF NOT EXISTS violation_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  teacher_id uuid NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  violation_id uuid NOT NULL REFERENCES violations(id) ON DELETE CASCADE,
  punishment_id uuid NOT NULL REFERENCES punishments(id) ON DELETE CASCADE,
  violation_time timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE violations ENABLE ROW LEVEL SECURITY;
ALTER TABLE punishments ENABLE ROW LEVEL SECURITY;
ALTER TABLE violation_records ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Users can read students" ON students FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert students" ON students FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Users can update students" ON students FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Users can delete students" ON students FOR DELETE TO authenticated USING (true);

CREATE POLICY "Users can read teachers" ON teachers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert teachers" ON teachers FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Users can update teachers" ON teachers FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Users can delete teachers" ON teachers FOR DELETE TO authenticated USING (true);

CREATE POLICY "Users can read violations" ON violations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert violations" ON violations FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Users can update violations" ON violations FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Users can delete violations" ON violations FOR DELETE TO authenticated USING (true);

CREATE POLICY "Users can read punishments" ON punishments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert punishments" ON punishments FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Users can update punishments" ON punishments FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Users can delete punishments" ON punishments FOR DELETE TO authenticated USING (true);

CREATE POLICY "Users can read violation_records" ON violation_records FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert violation_records" ON violation_records FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Users can update violation_records" ON violation_records FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Users can delete violation_records" ON violation_records FOR DELETE TO authenticated USING (true);

-- Insert sample teachers
INSERT INTO teachers (full_name) VALUES
  ('Prof. Abdelmalek eddiry'),
  
ON CONFLICT DO NOTHING;

-- Insert sample violations
INSERT INTO violations (violation_name) VALUES
  ('Retard en classe'),
  ('Absence non justifiée'),
  ('Comportement irrespectueux'),
  ('Non-respect du règlement'),
  ('Perturbation de cours'),
  ('Oubli de matériel'),
  ('Usage de téléphone portable'),
  ('Tricherie'),
  ('Violence verbale'),
  ('Dégradation de matériel')
ON CONFLICT DO NOTHING;

-- Insert sample punishments
INSERT INTO punishments (punishment_name) VALUES
  ('Avertissement oral'),
  ('Avertissement écrit'),
  ('Retenue 1 heure'),
  ('Retenue 2 heures'),
  ('Exclusion temporaire'),
  ('Convocation des parents'),
  ('Travail supplémentaire'),
  ('Nettoyage de classe'),
  ('Rapport disciplinaire'),
  ('Conseil de discipline')
ON CONFLICT DO NOTHING;