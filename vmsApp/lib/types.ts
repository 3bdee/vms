export type School = {
  id: string;
  school_name: string;
  created_at: string;
};

export type Level = {
  id: string;
  school_id: string;
  level_name: string;
};

export type Punishment = {
  id: string;
  punishment_name: string;
  created_at: string;
  school_id: string;
};

export type Violation = {
  id: string;
  violation_name: string;
  created_at: string;
  school_id: string;
};

export type Teacher = {
  id: string;
  full_name: string;
  created_at: string;
  school_id: string;
};

export type Student = {
  id: string;
  first_name: string;
  last_name: string;
  level: string;
  created_at: string;
  school_id: string;
};

export type ViolationRecord = {
  id: string;
  student_id: string;
  teacher_id: string;
  violation_id: string;
  punishment_id: string;
  violation_time: string;
  first_name: string;
  last_name: string;
  teacher_name: string;
  level: string;
  created_at: string;
  violation_name: string;
  punishment_name: string;
  school_id: string;
  students?: Student;
  teachers?: Teacher;
  violations?: Violation;
  punishments?: Punishment;
};

export type User = {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
};

export type UserSchool = {
  user_id: string;
  school_id: string;
};
