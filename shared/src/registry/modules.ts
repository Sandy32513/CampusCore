export interface ModuleDescriptor {
  id: string;
  name: string;
  slug: string;
  version: string;
  wave: number;
  category: "academic" | "admin" | "finance" | "campus" | "system";
  description: string;
  icon: string;
  status: "FROZEN" | "BUILDING" | "COMING_SOON";
  path: string;
}

export const MODULE_CATALOG: ModuleDescriptor[] = [
  {
    id: "v0-foundation",
    name: "Project Foundation",
    slug: "foundation",
    version: "V0",
    wave: 1,
    category: "system",
    description: "Core technical foundation, toolchains, base configs, and health check API.",
    icon: "🏗️",
    status: "FROZEN",
    path: "/foundation"
  },
  {
    id: "v1-shell",
    name: "Application Shell",
    slug: "shell",
    version: "V1",
    wave: 2,
    category: "system",
    description: "Complete UI layout shell, navigation, design system, and module registry.",
    icon: "🖥️",
    status: "BUILDING",
    path: "/"
  },
  {
    id: "v2-auth",
    name: "Authentication",
    slug: "auth",
    version: "V2",
    wave: 3,
    category: "system",
    description: "Argon2id password hashing, MySQL session store, cookie auth, login/logout.",
    icon: "🔐",
    status: "COMING_SOON",
    path: "/auth"
  },
  {
    id: "v3-users-roles",
    name: "User & Role Management",
    slug: "users",
    version: "V3",
    wave: 4,
    category: "system",
    description: "6 RBAC roles, user CRUD, permission assignment & registry.",
    icon: "👥",
    status: "COMING_SOON",
    path: "/users"
  },
  {
    id: "v7-departments",
    name: "Department Management",
    slug: "departments",
    version: "V7",
    wave: 5,
    category: "academic",
    description: "Academic department entity, department heads, and statistics.",
    icon: "🏛️",
    status: "COMING_SOON",
    path: "/departments"
  },
  {
    id: "v10-academic-years",
    name: "Academic Year & Semester",
    slug: "semesters",
    version: "V10",
    wave: 5,
    category: "academic",
    description: "Academic years, terms, active semester tracking.",
    icon: "🗓️",
    status: "COMING_SOON",
    path: "/semesters"
  },
  {
    id: "v38-audit-logs",
    name: "Audit Logs",
    slug: "audit-logs",
    version: "V38",
    wave: 5,
    category: "system",
    description: "Central transactional audit log store.",
    icon: "📜",
    status: "COMING_SOON",
    path: "/audit-logs"
  },
  {
    id: "v8-courses",
    name: "Course Management",
    slug: "courses",
    version: "V8",
    wave: 6,
    category: "academic",
    description: "Degree and certificate courses mapped to departments.",
    icon: "📚",
    status: "COMING_SOON",
    path: "/courses"
  },
  {
    id: "v39-settings",
    name: "System Settings",
    slug: "settings",
    version: "V39",
    wave: 6,
    category: "system",
    description: "Institution profile, branding, locale, timezone, date formats.",
    icon: "⚙️",
    status: "COMING_SOON",
    path: "/settings"
  },
  {
    id: "v4-students",
    name: "Student Management",
    slug: "students",
    version: "V4",
    wave: 7,
    category: "academic",
    description: "Student CRUD with unique Student ID, admission number, search, filters.",
    icon: "👨‍🎓",
    status: "FROZEN",
    path: "/students"
  },
  {
    id: "v9-subjects",
    name: "Subject Management",
    slug: "subjects",
    version: "V9",
    wave: 7,
    category: "academic",
    description: "Subject catalog, credits, semester and course mapping.",
    icon: "📖",
    status: "FROZEN",
    path: "/subjects"
  },
  {
    id: "v40-backup",
    name: "Backup & Recovery",
    slug: "backups",
    version: "V40",
    wave: 7,
    category: "system",
    description: "MySQL automated backup verification, restore tooling, point-in-time recovery.",
    icon: "💾",
    status: "FROZEN",
    path: "/backups"
  },
  {
    id: "v12-teachers",
    name: "Teacher Management",
    slug: "teachers",
    version: "V12",
    wave: 8,
    category: "academic",
    description: "Faculty profiles, employee IDs, department mapping.",
    icon: "👨‍🏫",
    status: "COMING_SOON",
    path: "/teachers"
  },
  {
    id: "v15-attendance",
    name: "Attendance",
    slug: "attendance",
    version: "V15",
    wave: 11,
    category: "academic",
    description: "Daily and subject-level student attendance marking.",
    icon: "📅",
    status: "COMING_SOON",
    path: "/attendance"
  },
  {
    id: "v18-exams",
    name: "Examination Management",
    slug: "examinations",
    version: "V18",
    wave: 11,
    category: "academic",
    description: "Exam scheduling, rooms, max marks, student eligibility.",
    icon: "📝",
    status: "COMING_SOON",
    path: "/examinations"
  },
  {
    id: "v24-fees",
    name: "Fees & Finance",
    slug: "fees",
    version: "V24",
    wave: 9,
    category: "finance",
    description: "Fee structures, student fee assignments, scholarships, discounts.",
    icon: "💰",
    status: "COMING_SOON",
    path: "/fees"
  },
  {
    id: "v31-reports",
    name: "Reports",
    slug: "reports",
    version: "V31",
    wave: 15,
    category: "admin",
    description: "Multi-domain reports: students, attendance, exams, fees (PDF, CSV, Excel).",
    icon: "📊",
    status: "COMING_SOON",
    path: "/reports"
  }
];
