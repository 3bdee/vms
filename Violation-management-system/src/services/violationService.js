import { supabase } from "../lib/supabase";

// Students
export const getStudents = async (schoolId) => {
  const { data, error } = await supabase
    .from("students")
    .select("*")
    .eq("school_id", schoolId)
    .order("first_name");

  if (error) throw error;
  return data;
};

export const createStudent = async (student, schoolId) => {
  const { data, error } = await supabase
    .from("students")
    .insert([{ ...student, school_id: schoolId }])
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Teachers
export const getTeachers = async (schoolId) => {
  const { data, error } = await supabase
    .from("teachers")
    .select("*")
    .eq("school_id", schoolId)
    .order("full_name");

  if (error) throw error;
  return data;
};

// Violations
export const getViolations = async () => {
  const { data, error } = await supabase
    .from("violations")
    .select("*")
    .order("violation_name");

  if (error) throw error;
  return data;
};

export const createViolation = async (violationName) => {
  const { data, error } = await supabase
    .from("violations")
    .insert([{ violation_name: violationName }])
    .select()
    .single();

  if (error) throw error;
  return data;
};

// levels
export const getLevels = async (schoolId) => {
  const { data, error } = await supabase
    .from("levels")
    .select("level_name")
    .eq("school_id", schoolId)
    .order("level_name");

  if (error) throw error;
  return data;
};

// Punishments
export const getPunishments = async () => {
  const { data, error } = await supabase
    .from("punishments")
    .select("*")
    .order("punishment_name");

  if (error) throw error;
  return data;
};

//Get school name

export const getSchoolName = async (schoolId) => {
  const { data, error } = await supabase
    .from("schools")
    .select("school_name")
    .eq("id", schoolId);
  if (error) throw error;
  return data;
};

export const createPunishment = async (punishmentName) => {
  const { data, error } = await supabase
    .from("punishments")
    .insert([{ punishment_name: punishmentName }])
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Violation Records
export const getViolationRecords = async (schoolId) => {
  const { data, error } = await supabase
    .from("violation_records")
    .select(
      `
      *,
      students (first_name, last_name, level),
      teachers (full_name),
      violations (violation_name),
      punishments (punishment_name)
    `
    )
    .eq("school_id", schoolId)
    .order("violation_time", { ascending: false });

  if (error) throw error;
  return data;
};

export const createViolationRecord = async (record, schoolId) => {
  const { data, error } = await supabase
    .from("violation_records")
    .insert([{ ...record, school_id: schoolId }])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteViolationRecord = async (id) => {
  const { error } = await supabase
    .from("violation_records")
    .delete()
    .eq("id", id);

  if (error) throw error;
};

// Get student violation count
export const getStudentViolationCount = async (studentId) => {
  const { data, error } = await supabase
    .from("violation_records")
    .select("id")
    .eq("student_id", studentId);

  if (error) throw error;
  return data.length;
};

// Statistics
export const getMonthlyStats = async (schoolId) => {
  const { data, error } = await supabase
    .from("violation_records")
    .select("violation_time")
    .eq("school_id", schoolId);

  if (error) throw error;

  // Group by month
  const monthlyData = {};
  data.forEach((record) => {
    const month = new Date(record.violation_time).toISOString().slice(0, 7);
    monthlyData[month] = (monthlyData[month] || 0) + 1;
  });

  return Object.entries(monthlyData).map(([month, count]) => ({
    month,
    count,
  }));
};

export const getTeacherStats = async (schoolId) => {
  const { data, error } = await supabase
    .from("violation_records")
    .select(
      `
      teachers (full_name)
    `
    )
    .eq("school_id", schoolId);

  if (error) throw error;

  // Group by teacher
  const teacherData = {};
  data.forEach((record) => {
    const teacher = record.teachers.full_name;
    teacherData[teacher] = (teacherData[teacher] || 0) + 1;
  });

  return Object.entries(teacherData)
    .map(([teacher, count]) => ({ teacher, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
};

export const getTopStudents = async (schoolId) => {
  const { data, error } = await supabase
    .from("violation_records")
    .select(
      `
      students (first_name, last_name)
    `
    )
    .eq("school_id", schoolId);

  if (error) throw error;

  // Group by student
  const studentData = {};
  data.forEach((record) => {
    const fullName = `${record.students.first_name} ${record.students.last_name}`;
    studentData[fullName] = (studentData[fullName] || 0) + 1;
  });

  return Object.entries(studentData)
    .map(([fullName, violationCount]) => ({ fullName, violationCount }))
    .sort((a, b) => b.violationCount - a.violationCount)
    .slice(0, 10);
};

export const getLevelStats = async (schoolId) => {
  const { data, error } = await supabase
    .from("violation_records")
    .select(
      `
      students (level)
    `
    )
    .eq("school_id", schoolId);

  if (error) throw error;

  // Group by level
  const levelData = {};
  data.forEach((record) => {
    const level = record.students.level;
    levelData[level] = (levelData[level] || 0) + 1;
  });

  return Object.entries(levelData).map(([level, count]) => ({
    level,
    count,
  }));
};
