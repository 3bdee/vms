/*
  # Teachers Violations Management System

  1. New Tables
    - `teachers`
      - `id` (uuid, primary key, auto-generated)
      - `email` (text, unique, not null) - Teacher's email for login
      - `name` (text, not null) - Teacher's full name
      - `created_at` (timestamptz, default now())
    
    - `students`
      - `id` (uuid, primary key, auto-generated)
      - `nom` (text, not null) - Last name
      - `prenom` (text, not null) - First name
      - `niveau` (text, not null) - Class level
      - `created_at` (timestamptz, default now())
    
    - `violations`
      - `id` (uuid, primary key, auto-generated)
      - `student_id` (uuid, foreign key to students)
      - `teacher_id` (uuid, foreign key to teachers)
      - `violation` (text, not null) - Description of violation
      - `sanction` (text, not null) - Sanction applied
      - `violation_date` (date, not null) - Date when violation occurred
      - `created_at` (timestamptz, default now())
  
  2. Security
    - Enable RLS on all tables
    - Teachers can read their own profile
    - Teachers can view all students
    - Teachers can create and view violations
    - Teachers can only update their own data
*/

-- Create teachers table
CREATE TABLE IF NOT EXISTS teachers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;

-- Create students table
CREATE TABLE IF NOT EXISTS students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nom text NOT NULL,
  prenom text NOT NULL,
  niveau text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE students ENABLE ROW LEVEL SECURITY;

-- Create violations table
CREATE TABLE IF NOT EXISTS violations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  teacher_id uuid NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  violation text NOT NULL,
  sanction text NOT NULL,
  violation_date date NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE violations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for teachers table
CREATE POLICY "Teachers can view own profile"
  ON teachers FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Teachers can update own profile"
  ON teachers FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- RLS Policies for students table
CREATE POLICY "Teachers can view all students"
  ON students FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM teachers
      WHERE teachers.id = auth.uid()
    )
  );

CREATE POLICY "Teachers can insert students"
  ON students FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM teachers
      WHERE teachers.id = auth.uid()
    )
  );

-- RLS Policies for violations table
CREATE POLICY "Teachers can view all violations"
  ON violations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM teachers
      WHERE teachers.id = auth.uid()
    )
  );

CREATE POLICY "Teachers can insert violations"
  ON violations FOR INSERT
  TO authenticated
  WITH CHECK (
    teacher_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM teachers
      WHERE teachers.id = auth.uid()
    )
  );

-- Create index for faster student searches by prenom
CREATE INDEX IF NOT EXISTS idx_students_prenom ON students(prenom);
CREATE INDEX IF NOT EXISTS idx_violations_date ON violations(violation_date DESC);
CREATE INDEX IF NOT EXISTS idx_violations_teacher ON violations(teacher_id);