Sprint 2 – Security Guidelines (.md)

Scope: Time‑tracking service (backend APIs + cloud deployment). This document defines the security requirements for the backend and cloud teams must implement during Sprint 2.


---

1) Authentication

Primary: JSON Web Tokens (JWT) for API access.

Optional: OAuth 2.0/OpenID Connect (e.g., Google, GitHub) for sign‑in; issue our own JWT after successful OAuth login.

JWT Claims:

sub = user ID (UUID)

role = {user, manager, admin}

iat, exp (short‑lived access token, ≤15 minutes)


Refresh Tokens: server‑side stored/rotating refresh tokens (7–14 days) or HttpOnly secure cookies.

Transport: HTTPS only end‑to‑end. Reject plain HTTP.


Acceptance: All protected endpoints return 401 without a valid Authorization: Bearer <token> header; tokens expire and are refreshable without re‑entering password.


2) Authorization & RBAC

Enforce role‑based access control in middleware/gatekeepers.

Ownership rule: users can only view/edit/delete their own time entries; admins can access all.


RBAC Matrix (minimum):

Resource/Action	               user   manager	admin

Create own time entry	        ✅	✅	✅
Read own time entries	        ✅	✅	✅
Update own time entry	        ✅	✅	✅
Delete own time entry	        ✅	✅	✅
Read others’ time entries	❌	(opt)*	✅
Update/Delete others’ entries	❌	(opt)*	✅
Manage roles/users	        ❌	❌	✅


(opt) Decide if manager can read team members; if yes, require a team scope check.

Acceptance: Attempting to access another user’s entry returns 403 unless admin (or approved manager scope) and request is logged.



3) Backend Implementation Requirements

Never trust client‑supplied user_id. Derive from verified JWT (sub).

Middleware order: authenticate → authorize(role) → ownership check → handler.

Input validation: validate all body/query/path params (e.g., with Zod/Joi). Reject invalid timestamps.

Password security: bcrypt (cost ~10–12) or argon2; never store plaintext.

Error hygiene: generic auth errors (avoid user enumeration). Use consistent 401/403 semantics.

Rate limiting: at least on /auth/login and /auth/refresh (e.g., 5–10 attempts/min/IP).

Audit fields: created_at, updated_at on entries; store user_id foreign key.


Acceptance: Unit/integration tests cover: token required, role checks, ownership, rate‑limited login, invalid input rejected.



4) Cloud & DevSecOps Requirements

Secrets management: JWT secret, DB creds, and OAuth client secrets in cloud secret manager or CI secrets. Never commit to Git.

TLS: Managed certificates; force HTTPS; enable HSTS.

Logging (structured JSON):

Auth: login success/fail, token refresh, logout, invalid token.

Data: create/update/delete time entries (include actor_user_id, target_entry_id).

Security: 401/403 events, rate‑limit triggers.


Monitoring/Alerts: create alerts for spikes in 401/403, 5xx, and failed logins.

Dependency scanning: Enable Dependabot/Snyk; block builds on critical vulns.

CI/CD:

Run tests + lints on PRs.

Block deploy if tests fail or vulnerabilities are critical.


Backups: daily DB backups; test restore.

Least privilege: DB user with minimal rights; separate prod vs. non‑prod.


Acceptance: Secrets absent from repo; HTTPS enforced; logs visible in central dashboard; CI shows tests + scans on each PR.



5) Data Protection & Privacy

Data minimization: store only necessary fields (times, description, owner).

PII: protect emails/user identifiers; don’t log full tokens or passwords ever.

Token handling: do not log raw JWT; if needed, log token fingerprint or sub only.


Acceptance: Logs contain no sensitive data; privacy review checklist passed.


6) Endpoint Protection Checklist (sample)

POST /auth/login → rate‑limited; returns access + (optional) refresh token.

POST /auth/refresh → rotates refresh tokens; rate‑limited.

POST /time-entries → authenticated; user_id from token only.

GET /time-entries → authenticated; returns only caller’s entries.

PUT /time-entries/:id → authenticated + ownership (or admin/manager scope).

DELETE /time-entries/:id → authenticated + admin (or owner if policy allows).



7) GitHub Hygiene

Include .env.example; add .env to .gitignore.

Add this file as SECURITY.md and a concise README.md with security notes.

Enable branch protection and required checks (tests + scan) on main.



8) Evidence for Sprint Review

Demo: unauthorized call → 401; cross‑user access → 403; owner access → 200.

Show logs for a create/update/delete with actor_user_id and timestamps.

Show CI passing (tests + dependency scan) and that repo contains no secrets.



9) Definitions

JWT Access Token: short‑lived token used in Authorization: Bearer header.

Refresh Token: longer‑lived credential to obtain new access tokens.

RBAC: permissions granted based on role(s); enforced centrally in middleware.