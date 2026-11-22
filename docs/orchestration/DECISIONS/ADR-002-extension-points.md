# ADR-002: Extension Point Architecture for Zero-Modification Module Addition

- **Status:** Proposed (Gate 0)
- **Date:** 2026-11-22
- **Author:** Orchestrator Lead Agent
- **Target:** CampusCore (SMS-2026-001)

## Context
Under the SMS Master Development Plan (§62), a module marked **FROZEN** is immutable and read-only. However, as the 50 modules are built progressively across 22 waves:
- Later modules must appear in the application navigation and dashboard module cards (`V1`).
- Later modules (Attendance, Marks, Fees, Documents, Exams) must appear as tabs within the Student Profile (`V5`).
- Later modules must register dashboard metrics/charts (`V32`), search providers (`V33`), notification templates (`V30`), report definitions (`V31`), and audit event definitions (`V38`).

If adding a new module required editing `V1`, `V5`, or `V32`, the "frozen" guarantee would be broken, causing continuous regression testing and merge conflicts across parallel agents.

## Decision
We establish a static, compile-time/build-time **Extension Point Registry Architecture** implemented in the `shared/` workspace and base shell (`V0`/`V1`):

1. **Manifest-Driven Registration:**
   Each module defines an immutable manifest file (`src/modules/<slug>/manifest.ts` or `manifest.json`):
   ```typescript
   export interface ModuleManifest {
     id: string; // e.g., 'v4-student-management'
     name: string;
     slug: string; // 'students'
     version: string;
     navigation?: NavigationItem[];
     moduleCard?: ModuleCardConfig;
     studentProfileTabs?: StudentProfileTabConfig[];
     dashboardWidgets?: DashboardWidgetConfig[];
     searchProviders?: SearchProviderConfig[];
     notificationTypes?: NotificationTypeConfig[];
     reportTypes?: ReportTypeConfig[];
     auditEvents?: AuditEventConfig[];
     permissions: PermissionDefinition[];
   }
   ```

2. **Integrator-Owned Aggregation:**
   - Specialists create their own module manifest inside their isolated module folder (`src/modules/<slug>/`).
   - The **Integrator** runs a registry generation script during wave integration that collects all manifests from active/frozen modules into the static registries (`shared/generated/registries.ts`).
   - The shell (`V1`), profile (`V5`), and dashboard (`V32`) consume only the generated registry. Unbuilt modules render a standard "Coming Soon" card/tab without any code modifications to the host module.

3. **Early Audit Logging Placement (V38):**
   - In conjunction with this registry, `V38` (Audit Logs) is placed in **Wave 5** (depending only on `V3`).
   - This provides the canonical database table `audit_logs` and the `auditService.logEvent(trx, ...)` transactional helper early, allowing every subsequent business module (`V4`, `V14`, `V15`, `V19`, `V24`, etc.) to write audit records in the same transaction as state changes.

## Consequences
- **Positive:**
  - Frozen modules remain 100% untouched when subsequent modules are integrated.
  - Zero merge conflicts between parallel specialist agents.
  - Compile-time type safety across all navigation, widgets, tabs, and permissions.
- **Negative:**
  - Requires adhering to strict manifest schemas for all modules from V0 onward.
