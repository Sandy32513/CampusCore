# UI/UX and Accessibility Report

## Validation

The shipped shell is `frontend/public/index.html`. Playwright runs in Chromium through `npm run test:ui` / `npm run test:e2e --workspace=frontend`; the API is deliberately stubbed as unauthorized and these checks use no database or authenticated user.

The current browser suite passes **6/6 tests**. axe-core scans 11 primary routed UI states (dashboard, departments, students, subjects, backups, academic years, audit logs, users, authentication, settings detail, and a planned-module detail) plus the student admission dialog. There are **zero serious or critical axe violations** in those states. The student dialog test checks its accessible name, initial focus, Tab wrapping, Escape dismissal, and trigger focus restoration. The mobile navigation test checks the visible keyboard focus indicator, `aria-expanded`, route navigation, and drawer closure.

The dashboard has no horizontal overflow at 375, 640, 768, 1024, or 1440 CSS px. The 640px check provides the reflow-equivalent viewport for 200% zoom from a 1280px CSS baseline; native browser zoom itself was not automated. Durable Chromium screenshots at the four audit-required widths are in [`screens/`](screens/): `dashboard-375.png`, `dashboard-768.png`, `dashboard-1024.png`, and `dashboard-1440.png`.

## Remediation

- Improved text, link, button, and status contrast; added a 3px `:focus-visible` outline and visible form focus treatment.
- Added associated labels for form controls and named modal dialogs with `aria-modal` / `aria-hidden` state.
- Closed dialogs are removed from display/accessibility; open dialogs receive focus, contain Tab navigation, close on Escape, and return focus to their trigger.
- Mobile navigation exposes `aria-expanded`, closes after route selection, and hides nonessential header controls at constrained widths.
- The footer stacks at narrow widths, and a `prefers-reduced-motion` rule reduces transitions and animation.
- Removed the pointer affordance from the noninteractive signed-out profile.

## Findings and limits

CC-F-501's shell markup, keyboard behavior, WCAG-tagged axe scans, and required responsive widths are covered by Playwright. The browser suite uses an unauthorized API stub: authenticated login/session behavior and live backend flows remain part of CC-F-302 validation. The zoom check verifies reflow at the equivalent CSS viewport rather than changing the browser's native zoom setting. Gate A8 remains **NOT READY** while other Critical/High findings and operational gates remain open.
