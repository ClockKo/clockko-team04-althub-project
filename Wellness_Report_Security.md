# Wellness Report Security Guidelines

## 1. Data Sensitivity Classification

- **High Sensitivity:** User identifiers, personal health notes, free-text reflections.
- **Medium Sensitivity:** Individual mood/stress scores, timestamps.
- **Low Sensitivity:** Aggregated, anonymized analytics with no user linkage.

**Action:**  
Document all data fields in the wellness report and assign a sensitivity level. Use this classification to guide access control and data handling.

---

## 2. Access Control Testing

- Enforce Role-Based Access Control (RBAC) for all wellness report endpoints.
- Only report owners and authorized admins may access individual reports.
- Aggregated analytics endpoints must not expose individual user data.
- Implement and run automated tests to verify:
  - Users cannot access reports they do not own.
  - Unauthorized access attempts are denied with appropriate error messages.
  - Admin access is logged and reviewed.

---

## 3. Analytics Anonymization Review

- Ensure all analytics endpoints return only aggregated, anonymized data.
- Remove or obfuscate all direct and indirect identifiers (e.g., user ID, precise timestamps).
- Apply data minimization: only expose fields necessary for analytics.
- Regularly review anonymization logic to prevent re-identification risks.

---

## 4. Compliance

- Align all controls with NDPR and relevant data protection standards.
- Document all access and anonymization procedures for audit readiness.

---

**Backend Team Action Items:**
- Review and implement the above controls.
- Document test results and anonymization logic.
- Report any gaps or risks to the security team.
