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