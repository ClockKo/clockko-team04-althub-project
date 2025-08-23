**ClockKo Access Control Policy**

**Version:** 1.0

**Date:** Aug 17, 2025

**Classification:** Internal, Technical Draft

**Audience:** Internal, Dev Team

**Author:** Beatrice Pepple

## 1. Purpose

    The purpose of this Role-Based Access Control (RBAC) Policy is to establish a structured approach for managing access to ClockKo systems, data, and user reflections. This ensures that access is granted only to authorized individuals and services, in alignment with the principles of least privilege, data minimization, and accountability under the Nigeria Data Protection Act (NDPA) 2023 and NDPR.

## 2. Scope 

    This policy applies to all ClockKo team members, service accounts, and third-party service providers who interact with ClockKo systems, including production databases, APIs, and user reflections.

## 3. NDPA Compliance Principles
    ClockKo enforces access control in line with NDPA 2023, guided by the following principles:

- Data Minimization: Access is restricted to only what is necessary to perform assigned duties.
- Accountability: All access rights are documented, reviewed, and auditable.
- Integrity & Confidentiality: Technical and organizational measures prevent unauthorized disclosure of personal data.
- User Rights Protection: Access controls ensure that users can exercise their rights (access, correction, deletion) securely.

## 4. RBAC - Role Based Access Framework

Access permissions are assigned to roles rather than individuals. Users and services are granted roles based on their responsibilities, ensuring consistency and reducing risk.

## 5. Role Definitions

The following roles exist within ClockKo:

| Role                           | Responsibilities                                                                          | Access                                                                                                | No Access                                                             |
| ------------------------------ | ----------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| End User (owner with userID)   | Full control of their personal data including reflections (create, edit, export, delete). | Own reflections.                                                                                      | Other users’ reflections.                                             |
| System Administrators          | Manage infrastructure and encrypted storage.                                              | Infrastructure and encrypted storage systems.                                                         | Decrypted reflections.                                                |
| Data Team                      | Perform analytics, reporting, and wellness insights.                                      | Anonymized/aggregated datasets, reporting tools.                                                      | Raw reflections or personally identifiable reflection data            |
| Cloud Engineering Team         | Deploy, maintain, and secure cloud infrastructure.                                        | Infrastructure services.                                                                              | Decrypted reflection content                                          |
| Frontend Team                  | UI development, staging/test environments.                                                | Code repositories, staging/test environments with synthetic data.                                     | Production database, real user reflections.                           |
| Backend Team                   | API and service logic, debugging.                                                         | Backend repos, anonymized test databases, limited time-bound production debug access (with approval). | Unrestricted access to production reflections.                        |
| Cybersecurity Team             | Audit logs, incident response.                                                            | Read-only access to audit/security logs, security tools, incident response authority.                 | Reflection content (unless anonymized), direct database manipulation. |
| Compliance & Security Officers | Ensure compliance with NDPA 2023 and internal policies.                                   | Read-only access to audit logs, access control records.                                               | Reflections                                                           |

## 6. Access Control Rules

- Role-based: Permissions are tied to job function, not individuals.
- Least Privilege: Only the minimum required access is granted.
- Segregation of Duties: No single role has unchecked access to sensitive data.
- Temporal Restrictions: Any elevated access is temporary, time-bound, and logged.
- Authentication: All access requires secure authentication (OAuth 2.1, MFA for the team).
- Service Authentication: Authorized services (analytics, notifications, wellness insights) must use signed JWT/OAuth 2.1 service-to-service authentication before accessing reflections.

## 7. Access Requests & Reviews

- Access requests must be submitted through formal channels and approved by a manager and the Security Officer.
- Roles are reviewed quarterly to ensure validity.
- Access is revoked immediately upon role change.
- Audit logs are maintained for all access requests, grants, and revocations.
- All access to reflections must be logged
- Logs must include: user/service ID, timestamp, reflection ID, and action taken (view/edit/delete/export).
- Logs must be immutable and retained in line with the Data Retention Policy.

## 8. Monitoring & Enforcement

- Continuous monitoring of access attempts is enforced.
- Unauthorized access attempts trigger security alerts and incident response.
- Violations of this policy may result in disciplinary action, termination, and regulatory reporting in line with NDPA 2023 obligations.

## 9. Review & Audit

This policy will be reviewed annually or upon changes in NDPA or ClockKo’s infrastructure. Audit trails of access control activities will be retained in accordance with the Data Retention & Deletion Policy.

## 10. Approval & Version Control

**Approved by:** Cybersecurity Lead

**Date:** August 2025

**Next Review Date:** January 2026