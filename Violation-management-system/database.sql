CREATE TABLE schools (
id CHAR(36) NOT NULL PRIMARY KEY,
school_name VARCHAR(255) NOT NULL UNIQUE,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE levels (
id CHAR(36) NOT NULL PRIMARY KEY,
school_id CHAR(36),
level_name VARCHAR(100),
FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE SET NULL
);


CREATE TABLE punishments (
id CHAR(36) NOT NULL PRIMARY KEY,
punishment_name VARCHAR(255) NOT NULL UNIQUE,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
school_id CHAR(36),
FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE SET NULL
);


CREATE TABLE violations (
id CHAR(36) NOT NULL PRIMARY KEY,
violation_name VARCHAR(255) NOT NULL UNIQUE,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
school_id CHAR(36),
FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE SET NULL
);


CREATE TABLE teachers (
id CHAR(36) NOT NULL PRIMARY KEY,
full_name VARCHAR(255) NOT NULL,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
school_id CHAR(36),
FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE SET NULL
);


CREATE TABLE students (
id CHAR(36) NOT NULL PRIMARY KEY,
first_name VARCHAR(100) NOT NULL,
last_name VARCHAR(100) NOT NULL,
level VARCHAR(50) NOT NULL,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
school_id CHAR(36),
FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE SET NULL
);


CREATE TABLE violation_records (
  id CHAR(36) NOT NULL,
  student_id CHAR(36) NOT NULL,
  teacher_id CHAR(36) NOT NULL,
  violation_id CHAR(36) NOT NULL,
  punishment_id CHAR(36) NOT NULL,
  violation_time TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  school_id CHAR(36),
  PRIMARY KEY (id),
  FOREIGN KEY (student_id) REFERENCES students(id),
  FOREIGN KEY (teacher_id) REFERENCES teachers(id),
  FOREIGN KEY (violation_id) REFERENCES violations(id),
  FOREIGN KEY (punishment_id) REFERENCES punishments(id),
  FOREIGN KEY (school_id) REFERENCES schools(id)
);

CREATE TABLE users (
id CHAR(36) NOT NULL PRIMARY KEY,
email VARCHAR(255) NOT NULL UNIQUE,
password VARCHAR(255) NOT NULL,
full_name VARCHAR(255),
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE user_schools (
user_id CHAR(36) NOT NULL,
school_id CHAR(36),
PRIMARY KEY (user_id, school_id),
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE
);

CREATE TABLE absences (
  id VARCHAR(36) PRIMARY KEY,
  student_id CHAR(36) NOT NULL,
  teacher_id CHAR(36) NOT NULL,
  school_id CHAR(36) NOT NULL,
  absence_date DATE NOT NULL,
  justification TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (student_id) REFERENCES students(id),
  FOREIGN KEY (teacher_id) REFERENCES teachers(id),
  FOREIGN KEY (school_id) REFERENCES schools(id)
);
