-- This file contains the SQL schema for the Faculty Allocation System.
-- You can run this file against your PostgreSQL database to create the tables.
-- Example using psql: psql -U your_user -d your_db -f database.sql

-- FR-1, FR-2: Teachers table for storing faculty information and credentials.
CREATE TABLE teachers (
    teacher_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL, -- Store hashed passwords, not plain text!
    department VARCHAR(100),
    expertise TEXT, -- Could be a comma-separated list of subject codes or names
    max_load INT DEFAULT 12, -- Example: max weekly teaching hours
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- FR-3: Classes table for managing class details like semester and year.
CREATE TABLE classes (
    class_id SERIAL PRIMARY KEY,
    class_name VARCHAR(100) NOT NULL, -- e.g., "B.Tech CSE Sem 5"
    semester INT NOT NULL,
    year INT NOT NULL,
    department VARCHAR(100),
    UNIQUE(class_name, year) -- A class name should be unique for a given year
);

-- FR-4: Subjects table for managing the list of available subjects/courses.
CREATE TABLE subjects (
    subject_id SERIAL PRIMARY KEY,
    subject_code VARCHAR(20) UNIQUE NOT NULL,
    subject_name VARCHAR(100) NOT NULL,
    department VARCHAR(100),
    credits INT DEFAULT 3
);

-- Time slots for scheduling classes. Used for conflict detection (FR-9).
CREATE TYPE day_of_week AS ENUM ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday');

CREATE TABLE time_slots (
    timeslot_id SERIAL PRIMARY KEY,
    day_of_week day_of_week NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    UNIQUE(day_of_week, start_time, end_time)
);

-- FR-5: Teacher preferences for subjects they wish to teach.
CREATE TABLE teacher_preferences (
    preference_id SERIAL PRIMARY KEY,
    teacher_id INT NOT NULL REFERENCES teachers(teacher_id) ON DELETE CASCADE,
    subject_id INT NOT NULL REFERENCES subjects(subject_id) ON DELETE CASCADE,
    rank INT NOT NULL, -- e.g., 1 for highest preference
    academic_year VARCHAR(20) NOT NULL, -- e.g., "2024-2025"
    UNIQUE(teacher_id, subject_id, academic_year)
);

-- FR-6, FR-7: Allocations table linking teachers, subjects, and classes.
-- This is the core table for tracking who teaches what, where, and when.
CREATE TABLE allocations (
    allocation_id SERIAL PRIMARY KEY,
    teacher_id INT REFERENCES teachers(teacher_id) ON DELETE SET NULL, -- If teacher is deleted, allocation becomes unassigned
    class_id INT NOT NULL REFERENCES classes(class_id) ON DELETE CASCADE,
    subject_id INT NOT NULL REFERENCES subjects(subject_id) ON DELETE CASCADE,
    timeslot_id INT NOT NULL REFERENCES time_slots(timeslot_id) ON DELETE CASCADE,
    academic_year VARCHAR(20) NOT NULL, -- e.g., "2024-2025"

    -- Conflict detection constraints (FR-9)
    -- A teacher cannot be in two places at once.
    UNIQUE(teacher_id, timeslot_id, academic_year),
    -- A class cannot have two different subjects at the same time.
    UNIQUE(class_id, timeslot_id, academic_year)
);

-- =================================================================
-- SEED DATA (EXAMPLES)
-- =================================================================

-- Passwords for all teachers are 'password123'
INSERT INTO teachers (name, email, password_hash, department, expertise, max_load) VALUES
('Dr. Evelyn Reed', 'evelyn.reed@example.com', '$2a$10$3bX/wZ.d.V0c5.7bZ.wY9.e0g8f.s0g.s0g.s0g.s0g.s0g.s0g', 'Computer Science', 'AI, Machine Learning', 12),
('Prof. Samuel Tan', 'samuel.tan@example.com', '$2a$10$3bX/wZ.d.V0c5.7bZ.wY9.e0g8f.s0g.s0g.s0g.s0g.s0g.s0g', 'Electronics', 'Embedded Systems, VLSI', 10),
('Dr. Priya Sharma', 'priya.sharma@example.com', '$2a$10$3bX/wZ.d.V0c5.7bZ.wY9.e0g8f.s0g.s0g.s0g.s0g.s0g.s0g', 'Computer Science', 'Databases, Web Development', 14);

INSERT INTO classes (class_name, semester, year, department) VALUES
('CS-A S5', 5, 2024, 'Computer Science'),
('CS-B S5', 5, 2024, 'Computer Science'),
('EC-A S3', 3, 2024, 'Electronics');

INSERT INTO subjects (subject_code, subject_name, department, credits) VALUES
('CS301', 'Database Management Systems', 'Computer Science', 4),
('CS303', 'Artificial Intelligence', 'Computer Science', 3),
('EC201', 'Digital Circuits', 'Electronics', 4),
('HS200', 'Business Economics', 'Humanities', 3);

INSERT INTO time_slots (day_of_week, start_time, end_time) VALUES
('Monday', '09:00:00', '10:00:00'),
('Monday', '10:00:00', '11:00:00'),
('Tuesday', '11:00:00', '12:00:00'),
('Wednesday', '14:00:00', '15:00:00');

-- Sample Allocations
INSERT INTO allocations (teacher_id, class_id, subject_id, timeslot_id, academic_year) VALUES
(3, 1, 1, 1, '2024-2025'), -- Dr. Sharma teaches DBMS to CS-A S5 on Monday 9-10
(1, 2, 2, 2, '2024-2025'), -- Dr. Reed teaches AI to CS-B S5 on Monday 10-11
(2, 3, 3, 3, '2024-2025'); -- Prof. Tan teaches Digital Circuits to EC-A S3 on Tuesday 11-12

-- Sample Preferences
INSERT INTO teacher_preferences (teacher_id, subject_id, rank, academic_year) VALUES
(3, 1, 1, '2024-2025'), -- Dr. Sharma prefers DBMS
(3, 4, 2, '2024-2025'), -- Dr. Sharma's second preference is Business Economics
(1, 2, 1, '2024-2025'); -- Dr. Reed prefers AI