# V0 Foundation: Architecture Document

## 1. System Topology
```text
[ Browser ]
    │
    ▼ (HTTP :3000)
[ Frontend (Next.js / HTML Shell) ]
    │
    ▼ (HTTP /api/v1/health :5000)
[ Express API Server ]
    │
    ├─► Pino Structured Logger
    ├─► Request ID & CORS & Security Middleware
    ├─► Standard Response Envelope Handler
    ▼
[ MySQL 8.4 LTS ] (Port 3306, utf8mb4, InnoDB)
```

## 2. Workspace Structure
```text
CampusCore/
├── shared/              Shared TypeScript types, Zod schemas, manifest interfaces
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── index.ts
│       ├── types/
│       └── schemas/
├── backend/             Express backend API
│   ├── package.json
│   ├── tsconfig.json
│   ├── src/
│   │   ├── index.ts
│   │   ├── app.ts
│   │   ├── config/
│   │   ├── db/
│   │   ├── middleware/
│   │   └── routes/
│   └── tests/
├── frontend/            Next.js / Responsive UI
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
├── database/            Migrations, seeds, and knexfile
│   ├── knexfile.ts
│   ├── migrations/
│   └── seeds/
├── docs/                Documentation
├── .env.example
├── package.json         Monorepo root package.json
└── tsconfig.base.json
```

## 3. Data Flow
1. Client requests `GET /health`.
2. Request passes through `requestId` middleware and pino logger.
3. Health controller invokes `db.raw('SELECT 1 + 1 AS result')`.
4. If database responds, returns `200 OK` with `{ success: true, data: { status: 'healthy', database: 'connected' } }`.
5. If database fails, returns `503 Service Unavailable` with formatted error envelope.
