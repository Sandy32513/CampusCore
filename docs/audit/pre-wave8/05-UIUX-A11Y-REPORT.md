# UI/UX and Accessibility Report

## Validation

The shipped shell is `frontend/public/index.html`. CI run `45178870296` passes all **7/7 Playwright tests** in Chromium: six shell/status/accessibility tests plus a real authenticated login/session test against the CI API and isolated MySQL `sms_audit_ci` schema. Local `npm run test:ui` passes the six shell tests and skips the live-backend test when CI database credentials are not configured.

axe-core scans 11 primary routed shell states (dashboard, departments, students, subjects, backups, academic years, audit logs, users, authentication, settings detail, and a planned-module detail) plus the student admission dialog. There are **zero serious or critical axe violations** in those states. The dialog test checks its accessible name, initial focus, Tab wrapping, Escape dismissal, and trigger focus restoration. The mobile navigation test checks the visible keyboard focus indicator, `aria-expanded`, route navigation, and drawer closure.

The authenticated browser test signs in using the seeded CI administrator, confirms healthy API/MySQL status, checks that the API returns no raw token, verifies the HttpOnly/SameSite session cookie is not visible to JavaScript or stored in local/session storage, and confirms the session survives a page reload. The backend auth integration suite separately passes all six lifecycle/security tests.

The dashboard has no horizontal overflow at 375, 640, 768, 1024, or 1440 CSS px. The 640px check provides the reflow-equivalent viewport for 200% zoom from a 1280px CSS baseline; native browser zoom itself was not automated. Durable Chromium screenshots at the four audit-required widths are in [`screens/`](screens/): `dashboard-375.png`, `dashboard-768.png`, `dashboard-1024.png`, and `dashboard-1440.png`.

## Remediation

- Improved text, link, button, and status contrast; added a 3px `:focus-visible` outline and visible form focus treatment.
- Added associated labels for form controls and named modal dialogs with `aria-modal` / `aria-hidden` state.
- Closed dialogs are removed from display/accessibility; open dialogs receive focus, contain Tab navigation, close on Escape, and return focus to their trigger.
- Mobile navigation exposes `aria-expanded`, closes after route selection, and hides nonessential header controls at constrained widths.
- The footer stacks at narrow widths, and a `prefers-reduced-motion` rule reduces transitions and animation.
- Removed the pointer affordance from the noninteractive signed-out profile.
- CI now validates the actual HttpOnly-cookie session flow against a running API and the isolated MySQL audit schema; local UI runs remain independent of a database.

## Findings and limits

CC-F-501's shell markup, keyboard behavior, WCAG-tagged axe scans, and required responsive widths pass in CI. CC-F-302's live login/session flow and backend lifecycle tests also pass. The zoom check verifies reflow at the equivalent CSS viewport rather than changing the browser's native zoom setting. Gate A8 remains **NOT READY** while other Critical/High findings and operational gates remain open.
