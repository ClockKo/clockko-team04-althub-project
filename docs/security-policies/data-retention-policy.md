**ClockKo Data Retention & Deletion Policy**

Version: 1.0

Date: Aug 17, 2025

Classification: Internal Use Only

Audience: Internal, Dev Team

Author: Beatrice Pepple

1.  # Purpose 

This policy establishes how ClockKo collects, stores, retains, and deletes user data, ensuring compliance with the Nigeria Data Protection Act (NDPA) 2023. It protects user privacy while supporting ClockKo’s mission to promote wellness-focused productivity for remote workers.

2.  # Scope 

This policy applies to all user data processed by ClockKo, including:

- Reflections (personal wellness journaling and guided shutdown notes)
- Smart Time Tracking data (session logs, timestamps, durations)
- Task Management data (to-do items, deadlines, priorities)
- Wellness Analytics data (focus levels, break habits, aggregated health insights)
- Virtual Coworking data (room participation logs, interactions)
- Gamification data (challenges, rewards, progress metrics)
- Account Metadata (profile information, authentication credentials, preferences, audit logs)

3.  # NDPA 2023 Compliance Principles

ClockKo adheres to the following NDPA 2023 requirements in its retention practices:

- Data Minimization: Only retain data necessary for ClockKo’s stated purposes.
- Purpose Limitation: Retain data only as long as necessary to provide services or comply with legal obligations.
- User Rights: Ensure users can request access, correction, or deletion of their data.
- Accountability & Transparency: Maintain clear records of retention schedules and securely dispose of expired data.

4.  # Retention Schedule

| Data Category                                  | Purpose                                                          | Retention Period                                                                                              | Deletion Method                                                                                       |
| ---------------------------------------------- | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Reflections (personal notes, shutdown entries) | Wellness tracking, self-reflection, burnout prevention.          | User-controlled: retained until deleted by user or 24 months of inactivity. Users notified prior to deletion. | Deleted from active storage within 24 hours, backups purged within 30 days. Unrecoverable thereafter. |
| Smart Time Tracking data                       | Productivity analytics, work-hour patterns.                      | 24 months (rolling).                                                                                          | Aggregated anonymization; raw logs deleted.                                                           |
| Task Management data                           | Task organization and prioritization.                            | Retained until task completion + 6 months.                                                                    | Secure deletion or anonymization.                                                                     |
| Wellness Analytics                             | Personalized insights, aggregated wellness metrics.              | Aggregated indefinitely (non-identifiable). Individual-level data retained 18 months.                         | Anonymization.                                                                                        |
| Virtual Coworking data                         | Participation tracking, accountability, collaboration.           | 12 months.                                                                                                    | Secure deletion.                                                                                      |
| Gamification data                              | Progress tracking, challenges, rewards.                          | 18 months or until user account closure.                                                                      | Secure deletion.                                                                                      |
| Account Metadata                               | Authentication, legal compliance, fraud detection.               | Active account lifetime + 5 years post-deletion (NDPA + financial regulations).                               | Secure deletion, audit logs archived.                                                                 |
| System & Security Logs                         | Security monitoring, compliance audits, incident investigations. | 12 months.                                                                                                    | Secure purge.                                                                                         |

5.  # Data Deletion Process

- User-Initiated Deletion: Users may delete reflections, tasks, or their entire account at any time through the ClockKo interface.  Reflections removed from active storage within 24 hours.
- Automated Deletion:  Inactive account reflections deleted after 24 months, with prior user notification.
- Backup Deletion: Deleted data erased from encrypted backups within 30 days.
- Secure Disposal: Data deletion uses industry-standard techniques (cryptographic erasure, secure overwrite) to prevent recovery. This means, Once deleted, reflections cannot be restored by admins, engineers, or services.

6.  # Responsibilities

- Data Protection Officer (DPO): Ensures NDPA compliance and oversees execution of this policy.
- Engineering & Cloud Teams: Implement secure deletion procedures and automated retention controls.
- Cybersecurity Team: Monitor for unauthorized access and validate secure disposal.
- Team Leads: Review data access and retention compliance quarterly.

7.  # User Rights & Transparency

- Users can request data access, correction, export, or deletion in line with NDPA.
- Retention timelines are disclosed in the ClockKo Privacy Policy.
- Users will be notified of material changes to retention schedules.

8.  # Review & Audit

This policy will be reviewed annually or upon significant legal/technical changes. Audit logs of deletion activities will be retained for 3 years for accountability.

9.  # Approval & Version Control

Approved by: Cybersecurity Lead

Date: August 2025

Next Review Date: January 2026
