# Student Management System (SMS): Product Requirements Document

*Version 1.0 draft · 22 November 2026 · Status: for stakeholder approval · Source: SMS Master Plan (V0 to V49) · Companion: SMS Technical Requirements Document (TRD)*

## 1. Summary

SMS is a responsive web application that lets an educational institution manage students, academic structure, teaching, assessment, finance, campus services and communication in one system. It is delivered as 50 independently validated modules (V0 to V49). Each module is tested, documented and frozen before any module that depends on it starts. The data layer is MySQL only. The finished product serves Admin, Teacher and Student users, plus Staff and Parent access, with reports, analytics and a versioned API.

Items marked **proposed** are my recommendations where the master plan is silent. They need stakeholder confirmation before the related module’s contract is frozen.

## 2. Problem and opportunity

Institutions often keep student, attendance, marks and fee records in separate spreadsheets and tools. This causes duplicate data entry, conflicting records, slow reporting, weak access control and no audit trail. SMS gives each student one authoritative record, role-based access to it, and a history of who changed what.

## 3. Goals and non-goals

### Goals

| ID | Goal |
| --- | --- |
| G1 | One source of truth for student and academic records. |
| G2 | Reduce routine administrative effort: attendance, marks, fee tracking, certificates, reports. |
| G3 | The right data reaches the right person: strict role-based access, with self-service views for students and parents. |
| G4 | Trustworthy data: audit trail, backups that are restore-tested, no regressions when later modules are added. |
| G5 | Usable and accessible on any device from phone to desktop. |
| G6 | Production quality, delivered progressively, with no fake or placeholder features. |

### Non-goals

- Progressive Web App features: installability, service worker, offline use, push notifications.
- Native mobile apps.
- Any database other than MySQL.
- Hosting several institutions in one deployment (multi-tenancy). **Proposed assumption.**
- Processing online payments or storing card data. Payments are recorded, not processed.
- Delivering email or SMS. V46 prepares adapter interfaces only; delivery is out of scope unless confirmed (see Open Question 7).
- Live classes or video, admissions marketing and CRM, payroll and HR beyond the teacher profile.

## 4. Users and roles

| Role | Who | Main jobs | Access boundary |
| --- | --- | --- | --- |
| SUPER ADMIN | Institution owner or IT lead | Settings, roles and permissions, backups, audit review | Everything |
| ADMIN | Registrar, academic office | Students, academic structure, enrollment, fees, reports | All academic and finance modules, no system-level settings unless granted |
| TEACHER | Faculty | Attendance, assignments, materials, marks | Only classes and subjects assigned to them |
| STAFF | Front office, accounts, librarian, transport or hostel clerk | Operate the specific modules granted to them | Only modules granted by permission |
| STUDENT | Enrolled student | View own profile, attendance, marks, timetable, fees; submit assignments; raise tickets | Own data only |
| PARENT | Guardian | View linked children’s attendance, marks, fees and notices; raise tickets | Linked children only, read-only |

Access is deny-by-default. A permission is a resource plus an action, granted to a role, and further narrowed by ownership (own record, assigned class, linked child).

## 5. Product principles

1. **No fake functionality.** Every button works, every menu entry opens a real module. “Coming Soon” appears only on the V1 shell for modules not yet built.
2. **One consistent design system.** Modules reuse the same components and states.
3. **Every state is designed:** loading, empty, validation error, permission error, network error, server error, not found, conflict. Each error tells the user how to recover.
4. **Frozen means frozen.** Later modules extend earlier ones through defined extension points. Changes to frozen modules go through a change request.
5. **Evidence over assertion.** A module is done only when its checklist is complete and backed by test output.

## 6. Scope and phasing

| Domain | Versions | What users get |
| --- | --- | --- |
| Platform and access | V0 to V3, V39 | Secure shell, login, users, roles, system settings |
| Student lifecycle | V4 to V6, V14, V23, V35, V36 | Student records, profiles, guardians, enrollment, documents, ID cards, certificates |
| Academic structure | V7 to V13, V17 | Departments, courses, subjects, years and semesters, classes, teachers, assignments, timetable |
| Teaching and assessment | V15, V16, V18 to V22 | Attendance and analytics, exams, marks, grades, assignments, study materials |
| Finance and campus | V24 to V28 | Fees, payment records, library, transport, hostel |
| Communication and support | V29, V30, V37 | Announcements, messages, notifications, helpdesk |
| Insight and data tools | V31 to V34 | Reports, dashboards, global search, import and export |
| Administration and trust | V38 to V40 | Audit logs, settings, backup and recovery |
| Platform quality | V41 to V49 | Security hardening, performance, accessibility, responsive design, API, integrations, deployment, monitoring, certification |

**Build order.** The master plan’s numeric order is not strictly followed. V4 (Student) needs V7, V8 and V10 first because a student record references department, course and semester. The TRD records this as a decision (ADR-001) for approval.

## 7. Functional requirements

Priority uses MoSCoW: **M**ust, **S**hould, **C**ould. Each requirement must also meet the master plan’s Definition of Done.

### 7.1 Platform and access

| ID | Requirement | Acceptance criteria | Pri |
| --- | --- | --- | --- |
| FR-01 | Application shell: header, sidebar, breadcrumbs, footer, standard components (cards, tables, forms, modal, toast, loading, error, empty) | Every navigation item opens a working module or a clear “Coming Soon” page. No dead links | M |
| FR-02 | Login, logout, session handling, password hashing and rules, protected routes, session expiry | Wrong credentials give a generic message. Idle sessions expire. Unauthenticated access to protected pages redirects to login | M |
| FR-03 | User management: create, edit, disable, activate, assign role, manage permissions | A disabled user cannot act on their next request. Role changes apply on the next request | M |
| FR-04 | Administrator-initiated password reset (no email dependency). **Proposed addition** | Reset forces a password change at next login and is audited | S |
| FR-05 | System settings: institution details, logo, academic configuration, notification and security settings, timezone, date format | Changes apply without redeploy and are audited | M |

### 7.2 Student lifecycle

| ID | Requirement | Acceptance criteria | Pri |
| --- | --- | --- | --- |
| FR-10 | Student CRUD with unique Student ID and Admission Number; deactivate instead of delete | Duplicates are rejected with a clear message. Deactivated students leave active lists but keep their history | M |
| FR-11 | Search, filter, sort and paginate students | Results update within the performance target in section 9 | M |
| FR-12 | Student profile: personal, academic, attendance, marks, fees, documents, exams, activity history | Sections for modules not yet built show “Coming Soon”. Each later module adds its own section without editing V5 | M |
| FR-13 | Guardians: many guardians per student, many students per guardian, relationship type, one primary contact | A student always has at most one primary contact. Parent accounts see only linked students | M |
| FR-14 | Enrollment: new admission, course and semester enrollment, section allocation, enrollment history, transfers | Allocation respects section capacity. Every change is recorded in history. A student is in at most one section per class per semester | M |
| FR-15 | Student documents: upload, preview, download, delete, categories, access permissions | File type and size limits enforced. Only permitted roles can open a file. Deletion is audited | M |
| FR-16 | ID cards for students and teachers with photo, QR code, institution details, print-ready layout | Printed card matches the on-screen layout. Each card has a unique number | S |
| FR-17 | Certificates (bonafide, course, transfer, completion) from configurable templates | Each certificate has a unique serial number and issuing it is logged | S |

### 7.3 Academic structure

| ID | Requirement | Acceptance criteria | Pri |
| --- | --- | --- | --- |
| FR-20 | Departments: create, edit, disable, department head, statistics | A department with active courses cannot be disabled without a clear warning | M |
| FR-21 | Courses: duration, department mapping, status, enrolled students, teachers | Course belongs to exactly one department | M |
| FR-22 | Subjects: code, credits, course and semester mapping, teacher mapping | Subject code is unique | M |
| FR-23 | Academic years and semesters: dates, active semester, history | Exactly one active semester at a time. Past semesters are read-only | M |
| FR-24 | Classes and sections: capacity, class teacher, student assignment | Capacity cannot be exceeded without a recorded admin override | M |
| FR-25 | Teacher profiles: employee ID, department, subjects, contact, status | Employee ID is unique | M |
| FR-26 | Teacher assignment: teacher to course, subject, class and semester | Teachers see and act only on assigned combinations | M |
| FR-27 | Timetable: class view, teacher view, room allocation, subject schedule, conflict detection | The system blocks double-booking of a teacher, room or class | M |

### 7.4 Teaching and assessment

| ID | Requirement | Acceptance criteria | Pri |
| --- | --- | --- | --- |
| FR-30 | Attendance: teacher picks class, subject and date, marks Present, Absent, Late or Leave, with bulk marking | One record per student per class, subject and date. Edits keep history. Only the assigned teacher or an admin can mark | M |
| FR-31 | Attendance analytics: daily, monthly and semester percentages by student, class and subject | Percentages reconcile exactly with raw records. The formula is documented | M |
| FR-32 | Examinations: type, subject, date, time, room, maximum marks | Room and class clashes are rejected | M |
| FR-33 | Marks: enter, edit, validate, bulk upload, lock, calculate results | Marks must be between 0 and the exam maximum. Locked marks change only through an audited unlock | M |
| FR-34 | Grades: configurable boundaries, GPA, percentage, pass or fail, result summary | The same marks give the same grade for a given configuration. Changing configuration never silently alters published results | M |
| FR-35 | Assignments: create with deadline and attachment, student submission, status | Submissions after the deadline are flagged late | S |
| FR-36 | Study materials: upload files and links by subject with access permissions | Only students of the relevant course or class can download | S |

### 7.5 Finance and campus

| ID | Requirement | Acceptance criteria | Pri |
| --- | --- | --- | --- |
| FR-40 | Fees: structures, assignment to students, discounts, scholarships, due dates, paid and pending amounts | Pending equals assigned minus discounts, scholarships and payments, to the smallest currency unit | M |
| FR-41 | Payments: entry, history, receipts, transaction reference, status | No card data is stored. Receipt numbers are unique and gap-free. Corrections are reversal entries, never edits or deletes | M |
| FR-42 | Library: books, categories, authors, inventory, issue, return, due dates, fines | A book with no available copy cannot be issued | S |
| FR-43 | Transport: routes, vehicles, drivers, stops, student assignment, transport fees | Transport fees flow into the student’s fee account | S |
| FR-44 | Hostel: buildings, rooms, beds, allocation, vacancies, hostel fees | A bed cannot be allocated twice at the same time | S |

### 7.6 Communication and support

| ID | Requirement | Acceptance criteria | Pri |
| --- | --- | --- | --- |
| FR-50 | Announcements and notices with target audience (role, course, class) and scheduling | Only the targeted audience sees an item. Scheduled items appear at the set time | M |
| FR-51 | Messages between users | Users can message only recipients their role permits | S |
| FR-52 | Central in-app notifications: attendance, exam, assignment, fee, announcement, system | Read and unread state. Users receive only notifications they are entitled to see | M |
| FR-53 | Helpdesk: tickets, categories, priority, status, assignment, comments, resolution, history | Full ticket history is retained and visible to staff handling it | S |

### 7.7 Insight and data tools

| ID | Requirement | Acceptance criteria | Pri |
| --- | --- | --- | --- |
| FR-60 | Reports: student, attendance, exam, marks, fee, course, department. Export to PDF, CSV, Excel-compatible, print | Exported totals equal on-screen totals | M |
| FR-61 | Dashboard metrics and charts: totals, attendance trends, performance trends, fee collection | Every metric opens the module it summarises | M |
| FR-62 | Global search across students, teachers, courses, subjects, admission number, departments, attendance, fees, with saved filters where useful | Users never see results they could not open directly | M |
| FR-63 | Import (CSV, Excel-compatible) with upload, validation, preview, error detection, confirmation, result report; export to CSV, Excel-compatible, PDF | Nothing is written before confirmation. Failed rows are downloadable with reasons. A confirmed batch is atomic (**proposed**) | M |

### 7.8 Administration and trust

| ID | Requirement | Acceptance criteria | Pri |
| --- | --- | --- | --- |
| FR-70 | Audit log: user, action, entity, entity ID, timestamp, IP metadata, result | Entries cannot be edited or deleted through the application | M |
| FR-71 | Backup and recovery: scheduled MySQL backups, verification, restore procedure, retention, recovery documentation | A restore is performed and verified, not just a backup file created | M |

### 7.9 Platform quality (V41 to V49)

| ID | Requirement | Pri |
| --- | --- | --- |
| FR-80 | Dedicated security review across all modules and fixes for every critical and high finding | M |
| FR-81 | Performance targets in section 9 are measured and met | M |
| FR-82 | WCAG-aligned accessibility across all modules | M |
| FR-83 | Responsive layout verified on mobile, tablet, laptop and desktop in Chrome, Edge, Firefox and Safari where available | M |
| FR-84 | Versioned, documented API under /api/v1 with consistent errors, pagination and rate limits | M |
| FR-85 | Integration adapters for email, SMS, storage, payment gateway, identity provider, ERP, learning platform, kept decoupled from the core | C |
| FR-86 | Production deployment over HTTPS with documented rollback | M |
| FR-87 | Monitoring: logs, error tracking, API and MySQL monitoring, uptime checks, health endpoint | M |
| FR-88 | Final certification: full regression, security audit, verified backup and restore, deployment test | M |

## 8. Key business rules (proposed, please confirm)

The master plan lists features but not the rules between them. These keep every team building the same system.

| ID | Rule |
| --- | --- |
| BR-01 | Student ID and Admission Number are unique and never reused, even after deactivation. |
| BR-02 | Students are deactivated, never deleted. Their attendance, marks and fee history are retained. |
| BR-03 | Attendance is recorded per class, subject and date. Daily percentage is derived from those records. |
| BR-04 | Exactly one semester is active at a time. |
| BR-05 | A section cannot exceed capacity unless an admin overrides it and the override is recorded. |
| BR-06 | Locked marks can be changed only by an audited unlock. |
| BR-07 | Grade configuration is versioned. Each result records the configuration version used. |
| BR-08 | One currency per installation, set in system settings. Money is never stored as floating point. |
| BR-09 | Payments are append-only. A mistake is corrected by a reversal entry. |
| BR-10 | Students see only their own data, parents only their linked children’s, teachers only their assigned classes. |
| BR-11 | Creation, change and deletion of important records are written to the audit log. |
| BR-12 | Receipt, certificate and ID card numbers are unique and immutable once issued. |

## 9. Non-functional requirements (proposed targets)

The master plan asks for measurable targets rather than vague claims. These are starting values to confirm and then validate in V42.

| Area | Requirement |
| --- | --- |
| Design capacity | 10,000 students, 500 staff, 300 concurrent sessions |
| Responsiveness | List and search API p95 at most 300 ms at design capacity. Page load (LCP) at most 2.5 s on a mid-range laptop. Report export of 10,000 rows within 10 s |
| Availability | 99.5% monthly, excluding announced maintenance |
| Recovery | RPO 15 minutes or better using binary-log point-in-time recovery. RTO 4 hours. Daily full backup |
| Security | Reviewed against OWASP Top 10 and ASVS Level 2. Basic security from V2, dedicated hardening in V41 |
| Accessibility | WCAG 2.2 Level AA as the target |
| Browsers | Latest two versions of Chrome, Edge and Firefox; Safari where available |
| Screens | 375 px to 1920 px wide, mobile-first |
| Privacy | Collect only needed personal data, log access to it, make retention configurable. The institution confirms which data-protection law applies |
| Localization | English interface first, text externalised so other languages can be added. Timezone and date format configurable |

## 10. Success metrics (proposed)

| Metric | Target |
| --- | --- |
| Modules frozen with evidence | 50 of 50 |
| Open critical or high defects at certification | 0 |
| Navigation items that work | 100% |
| API endpoints covered by the role-by-endpoint authorization test | 100% |
| Successful full restore test before certification | At least 1 |
| Time for a teacher to mark attendance for a class of 60 | Under 2 minutes |
| After launch: share of attendance and marks recorded in SMS rather than elsewhere | Baseline first, then agree a target |

## 11. Assumptions, constraints and dependencies

**Assumptions**

- One institution per installation, with a college or university structure (department, course, semester) plus class and section.
- English interface, one currency, users have a modern browser and internet access.
- Students and parents sign in with their own accounts.
- The institution supplies hosting and hosting credentials.

**Constraints**

- MySQL only. Free and open-source tools first. Web application only, no PWA.
- The lifecycle in the master plan: build, test, freeze, integrate, document.

**Dependencies**

- A development MySQL 8.4 server (already installed, see the TRD).
- A stakeholder available for user acceptance testing at the end of each wave.
- Hosting decisions and credentials before V47.

## 12. Risks and mitigations

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Scope growth across 50 modules | Delays | Freeze rule, change requests, MoSCoW priorities |
| Parallel work causes integration conflicts | Rework | Frozen module contracts, path ownership, single merge queue |
| Attendance model ambiguity (daily versus per subject) | Wrong data model | Resolve Open Question 3 before V15 contract |
| Security found late | Costly fixes | Security checks from V2, threat model per module, V41 as a review, not a first look |
| Free hosting tiers change or lack MySQL | Deployment delay | Self-hosted MySQL as baseline, verify tiers before V47 |
| Stakeholder unavailable for acceptance | Modules stay provisional | Batch sign-off per wave, V49 blocked until all signed |
| Personal data exposure | Legal and reputational harm | Least privilege, deny-by-default access, audit log, encrypted backups |

## 13. Release plan

Dates are set after the planning gate, once team capacity is known. Each milestone ends with a stakeholder checkpoint.

| Milestone | Versions | Outcome |
| --- | --- | --- |
| M1 Foundation and access | V0 to V3 | Running shell, secure login, users and roles |
| M2 Student and academic core | V4 to V14 | Student records, academic structure, teachers, enrollment |
| M3 Daily academic operations | V15 to V20 | Attendance, timetable, exams, marks, grades |
| M4 Learning, finance and campus | V21 to V28 | Assignments, materials, documents, fees, payments, library, transport, hostel |
| M5 Communication, insight and administration | V29 to V40 | Communication, notifications, reports, dashboards, search, import and export, ID cards, certificates, helpdesk, audit, settings, backup |
| M6 Hardening and certification | V41 to V49 | Security, performance, accessibility, API, deployment, monitoring, production certification |

## 14. Open questions

Please answer before the related module’s contract is frozen. Defaults are in brackets.

1. Is this one institution or several? \[one\]
2. College or university only, school only, or both? This decides the terms “class”, “section”, “course” and “semester”. \[college or university with class and section\]
3. Is attendance recorded per subject and period, or once per day? The plan describes both. \[per subject, with daily derived\]
4. Which grading scale and GPA scale apply? \[configurable, default 10-point and percentage\]
5. Which currency, tax and late-fee rules apply? \[one currency, no tax, fines only for library\]
6. Do parents and students log in with their own accounts? \[yes\]
7. Must email or SMS actually be sent, or is in-app notification enough? \[in-app only\]
8. Expected number of students, staff and simultaneous users? \[section 9\]
9. Is there existing data to import, and in what format? \[CSV and spreadsheet files\]
10. Which data-protection and retention rules apply to student records?
11. Where will it be hosted? \[self-hosted server with MySQL\]
12. Who signs off acceptance testing for each wave?
