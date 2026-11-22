# V1 Application Shell: Security & Threat Model

## 1. Threat Modeling (STRIDE)

| Threat | Target | Mitigation |
|---|---|---|
| **Cross-Site Scripting (XSS)** | UI Components & Inputs | All components use strict TypeScript and React/HTML escaping. No `dangerouslySetInnerHTML` is used. |
| **Clickjacking** | Application Shell | `helmet.frameguard` enforces `X-Frame-Options: SAMEORIGIN` and CSP `frame-ancestors 'none'`. |
| **Broken Access Control** | Navigation Links | Unbuilt routes clearly display public status and roadmap details. No administrative actions or sensitive data are rendered in "Coming Soon" states. |
| **Phishing / Spoofing** | External links | All external links use `rel="noopener noreferrer"`. |

## 2. Security Validations
- Automated HTML injection tests on search inputs and toast notifications.
- Modal focus trap ensures keyboard focus cannot wander into background elements when a modal dialog is active.
