**ClockKo Reflection Security Reference**

Version: 1.0

Date: Aug 19, 2025

Classification: Internal Use,  Quick-Reference

Audience: Internal, Dev Team

Author: Beatrice Pepple

1.  # Purpose 

This guideline summarizes all reflection-specific rules from the Access Control Policy and Data Retention Policy so the dev team can follow it without digging into the full documents.

2.  # Access Control

- Every reflection is tied to a unique user ID.
- Only the owner can view, edit, export, or delete their reflections.
- No staff role (admin, engineer, analyst) has direct access to decrypted reflections.
- Authorized system services (e.g., analytics, reminders) must authenticate via JWT/OAuth 2.1 before accessing reflection metadata.
- All reflection access attempts must be logged with user/service ID, action, timestamp, reflection ID.

3.  # Retention Rules

- Reflections remain until the user deletes them.
- Inactive accounts: reflections retained for 24 months, then flagged for deletion.
- Users must receive a notification before auto-deletion.

4.  # Deletion Rules

- User-initiated deletion: Reflections deleted from active storage within 24 hours.
- Backup purge: Reflections permanently erased from encrypted backups within 30 days.
- Deleted reflections are unrecoverable — no engineer, admin, or system may restore them.

5.  # Compliance & Transparency

- Aligned with NDPA 2023 and NDPR obligations.
- Reflection retention and deletion timelines must be published in the Privacy Policy and visible to users in-app.
- Logs of reflection access/deletion must be retained for 3 years for compliance audits.

6.  # Enforcement

- Unauthorized reflection access attempts trigger security alerts and incident response.
- Breaches must be reported to the DPO and regulatory authorities (if applicable).
- Violations can result in access revocation, disciplinary action, or legal escalation.
