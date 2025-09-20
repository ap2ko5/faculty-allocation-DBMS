-- This file contains the SQL schema for the Faculty Allocation System.
-- You can run this file against your PostgreSQL database to create the tables.
-- Example using psql: psql -U your_user -d your_db -f database.sql

-- Based on FR-2, the Teachers table needs department, expertise, max load, etc.
-- It also needs basic info like name, email, and a password for authentication (FR-1).
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

-- You can add more tables here as you build out the features.
-- For example, the 'Classes' table:
/*
CREATE TABLE classes (
    class_id SERIAL PRIMARY KEY,
    class_name VARCHAR(100) NOT NULL, -- e.g., "CS101"
    semester INT NOT NULL,
    year INT NOT NULL,
    department VARCHAR(100)
);
*/