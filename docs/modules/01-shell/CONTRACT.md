# V1 Application Shell: Module Contract

- **Module:** V1 Application Shell
- **Status:** CONTRACT-FROZEN (Gate A Approved)
- **Date:** 2026-11-22
- **Lead Architect:** Antigravity Orchestrator

## 1. Scope
Deliver the complete, responsive UI application shell for CampusCore SMS:
- Complete layout shell: Header, Sidebar, Breadcrumbs, Footer, and Dashboard Container.
- Common Design System components: Button, Input, Select, Checkbox, Radio, Table, Card, Modal, Drawer, Tabs, Badge, Toast, Alert, Pagination, Breadcrumb, Dropdown, Loading State, Error State, Empty State.
- Compile-time Module & Navigation Registry (implementing ADR-002):
  - Dashboard (Active)
  - Students (Coming Soon)
  - Teachers (Coming Soon)
  - Courses (Coming Soon)
  - Subjects (Coming Soon)
  - Attendance (Coming Soon)
  - Examinations (Coming Soon)
  - Fees (Coming Soon)
  - Reports (Coming Soon)
  - Settings (Coming Soon)
- Zero fake functionality: Unbuilt modules render a clear, explicit "Coming Soon" card with module metadata, planned wave, and release readiness.
- Mobile drawer navigation below 1024px.
- Accessibility compliance: WCAG 2.2 AA (focus traps in modals, keyboard navigation, contrast ratio >= 4.5:1).

## 2. API Specification
The shell is primarily frontend, but exposes an API configuration endpoint:
### `GET /api/v1/modules`
- **Method:** `GET`
- **Auth:** Public / System
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "modules": [
        {
          "id": "v1-shell",
          "name": "Application Shell & Dashboard",
          "slug": "dashboard",
          "status": "FROZEN",
          "path": "/"
        },
        {
          "id": "v4-student-management",
          "name": "Student Management",
          "slug": "students",
          "status": "COMING_SOON",
          "wave": 7,
          "path": "/students"
        }
      ]
    },
    "message": "Module registry retrieved"
  }
  ```

## 3. Database Specification
- **Engine:** MySQL 8.4 LTS
- **Tables:** No new tables required for V1. Reuses V0 system metadata.

## 4. UI Specification
- **Breakpoints:** 640px (sm), 768px (md), 1024px (lg), 1280px (xl).
- **Sidebar:** Fixed at >= 1024px; converts to an accessible sliding Drawer overlay below 1024px.
- **Header:** Institutional branding ("CampusCore SMS"), notification bell, quick user menu placeholder.
- **Card Grid:** Dashboard renders clickable module cards with real-time status badges.
- **All States Handled:** Loading, Success, Empty, Error.
