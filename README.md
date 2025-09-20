# faculty-allocation-DBMS
DBMS PROJECT FOR FACULTY ALLOCATION 
Software Requirements Specification (SRS)
Project Title: Faculty-Class Allocation System
Prepared by: Arun Prabhasnakar, Aswathi M, Abel Abraham Panicker, Amala Jose
Course/Lab: Database Laboratory
1. Introduction
1.1 Purpose
The Faculty-Class Allocation System is designed to simplify the allocation of teachers to
classes in a college environment. Currently, allocation is either done manually or through
spreadsheets, leading to inefficiency, unfair workload distribution, and potential scheduling
conflicts. This system aims to automate and streamline the allocation process, ensuring
fairness, transparency, and efficiency.
1.2 Scope
The system will:
Allow teachers to log in and select class/subject preferences.
Allow administrators to approve manual requests or trigger automatic allocation.
Assign teachers automatically based on workload limits, subject specialization, and
availability.
Prevent allocation conflicts (time clashes or overloads).
Generate reports showing teacher allocations.
1.3 Definitions, Acronyms, Abbreviations
Teacher: Faculty member
Admin: System administrator
Auto-allocation: Automatic assignment of teachers
DBMS: Database Management System
Load: Teaching hours or classes assigned
1.4 References
IEEE SRS Template
Academic course allocation policies
DBMS documentation
2. Overall Description
2.1 Product Perspective
Standalone web-based application, client-server model
2.2 Product Functions
Teacher login, preference selection, admin management, auto/manual allocation, workload
monitoring, conflict detection, reporting
2.3 User Classes
Teachers (basic UI), Admins (advanced features)
2.4 Operating Environment
Frontend: React.js
Backend: Node.js with Express.js
Database: PostgreSQL
Browser: Chrome / Firefox
2.5 Constraints
Minimum 6 tables, role-based access, PC with 4GB RAM
2.6 User Documentation
User manual and online help
3. System Features
• Authentication Module
• Teacher Preferences Module
• Admin Management Module
• Auto-Allocation Engine
• Reporting & Analytics Module
• Conflict Management Module
4. Functional Requirements
ID Requirement Description
FR-1 Login System Secure login for teachers
and admins
FR-2 Teacher Registration Register teachers with
department, expertise, max
load, and availability
FR-3 Class Management Admin can
add/update/delete class
details
FR-4 Subject Management Admin maintains subject
database
FR-5 Preference Submission Teachers can select and
rank class/subject
preferences
FR-6 Auto Allocation System auto-assigns
teachers to classes based on
rules
FR-7 Manual Allocation Admin can manually assign
teachers
FR-8 Load Monitoring Track each teacher’s
assigned load
FR-9 Conflict Detection Prevent allocation clashes
FR-10 Reporting Generate allocation and
workload reports
5. Database Design
Teachers Table
Classes Table
Subjects Table
Allocations Table
Teacher_Preferences Table
Time_Slots Table
6. Non-Functional Requirements
Performance: Auto-allocation < 5 seconds for 500 records
Security: Encrypted passwords, role-based access
Reliability: Prevent duplicate/conflicting allocations
Scalability: Support 1000+ records
Usability: User-friendly interface
7. External Interface Requirements
User Interface: Web-based responsive UI
Hardware Interface: Standard PC
Software Interface: PostgreSQL + Node.js/Express.js Web Server
Communication Interface: HTTP/HTTPS
