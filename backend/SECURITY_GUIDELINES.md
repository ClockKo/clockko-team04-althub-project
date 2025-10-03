# Backend Security Guidelines

This note captures the security measures currently in place for the ClockKo backend. Use it as a quick reference when maintaining or extending the service.

## Authentication and Access Control

- JWT access tokens use `HS256` and expire after the configured `ACCESS_TOKEN_EXPIRE_MINUTES` (30 minutes by default).
- `app.core.auth.get_current_user` validates tokens, loads the user from the database, and rejects missing or expired credentials.
- `/api/auth/google/verify` checks Google ID tokens against `GOOGLE_CLIENT_ID` before issuing a backend JWT.
- Email and OTP flows rely on six-digit codes that expire after `OTP_EXPIRE_MINUTES` and are cleared once used.

## Credentials and Secrets

- Passwords are hashed with Passlib’s bcrypt implementation (`hash_password` / `verify_password`).
- Password reset tokens expire after one hour and are removed once they are used or expire.
- Production environments load database and JWT secrets from AWS Secrets Manager, with `.env` fallback for local development.
- Runtime settings (SMTP details, frontend URL, debug flag, OTP timing) are driven by environment variables or secret stores.

## Email Security

- `smtp_connection` negotiates STARTTLS whenever credentials are present so credentials and mail content are encrypted in transit.
- Gmail integrations require app passwords and matching `SMTP_USER`/`SMTP_FROM` addresses to keep the sender identity consistent.
- Custom exceptions (`SMTPConnectionError`, `SMTPAuthError`, `EmailSendError`) surface meaningful errors without leaking stack traces. Verbose output only appears when `DEBUG=true`.

## Data Protection

- SQLAlchemy ORM queries prevent SQL injection by parameterizing statements.
- Verification and reset tokens use UUIDs and are cleared immediately after they are confirmed.
- Onboarding progress is stored server-side to control user flows without exposing internal state to the client.

## Operational Safeguards

- CORS is wide open for development (`allow_origins=["*"]`). Restrict this list to approved domains in production.
- Logging captures security-relevant events at INFO/ERROR levels without writing sensitive values.
- `/health` and `/health/google` provide lightweight health checks suitable for load balancers.

## Ongoing Maintenance

- Rotate JWT secrets, SMTP credentials, and database passwords through AWS Secrets Manager on a schedule.
- Terminate all traffic over HTTPS to protect tokens in transit.
- Monitor failed OTP and login attempts and introduce rate limiting or lockouts if abuse appears.
- Tighten the CORS origin list once the app runs in production.
- Keep dependencies (FastAPI, Passlib, `python-jose`, `google-auth`, etc.) patched for security fixes.

Following these practices keeps the backend secure while leaving room for future hardening.
