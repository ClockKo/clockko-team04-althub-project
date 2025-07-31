# 🏃 Sprint Plan for ClockKo Wellness App Frontend team

This plan breaks down the project into feature-focused sprints. Each sprint delivers a valuable, testable increment.

---

## 🏁 Sprint 0: Project Setup & Core Infrastructure

- Set up project repository and environments (Vite, React, TypeScript, ESLint, Prettier, Vitest, UI library, TanStack Query)
- Establish base folder structure (`src/`, `features/`, `components/`, etc.)
- Configure routing, theming, and global styles
- Add CI/CD, basic README, and contribution guidelines

---

## 🔐 Sprint 1: Authentication

- Implement login/logout UI and logic (`features/auth/`)
- JWT handling, protected routes, and session management
- Basic user context (current user info)
- Unit tests for auth flows

---

## ⏱️ Sprint 2: Time Tracking

- Clock in/out, break timer UI (`features/timeTracker/`)
- Track and display daily summaries
- Integrate with backend API
- Tests for time-tracking logic

---

## 📋 Sprint 3: Task Management

- Task list, create/edit/delete tasks (`features/tasks/`)
- Task timer and reminders
- UI components for tasks
- API integration and tests

---

## 🧘‍♂️ Sprint 4: Guided Shutdowns

- Guided shutdown prompt UI (`features/shutdowns/`)
- End-of-day reflection workflow
- Hook up to backend, store reflection data
- Unit tests

---

## 👩‍💻 Sprint 5: Virtual Co-working

- Coworking room UI and logic (`features/coworking/`)
- Real-time presence (if MVP)
- Join/leave room functionality
- Tests for core flows

---

## 📊 Sprint 6: Wellness Reports

- Wellness stats dashboard (`features/wellnessReports/`)
- Display charts/graphs for productivity & wellness
- Fetch and render data from backend
- Tests for report components

---

## 🎯 Sprint 7: Community Challenges

- Challenge list, join/leave challenge (`features/challenges/`)
- Show leaderboard and progress
- UI and backend integration
- Test challenge logic

---

## 🎁 Sprint 8: Reward System

- Points, badges, redeemables UI (`features/rewards/`)
- Update points on user actions
- Redeem reward workflow
- Tests for rewards logic

---

## 🧑 Sprint 9: Profile & Settings

- Profile page (view/edit info) (`features/profile/`)
- Update settings, avatar, etc.
- Integrate with backend
- Unit tests for profile features

---

## 🧩 Sprint 10: Shared UI, Polish & Accessibility

- Refactor and polish shared components (`components/`)
- Ensure accessibility (a11y) and responsiveness
- Apply consistent theming and style
- Address technical debt

---

## 🧪 Sprint 11: Testing & Documentation

- Expand unit/integration tests across features
- Add Storybook (optional)
- Finalize README and contribution docs

---

## 🚀 Sprint 12: MVP Review, Bug Fixes, & Deployment

- User acceptance testing
- Fix bugs, address feedback
- Prepare production build
- Deploy to production

---

# 📌 Notes

- Multiple features can be worked on in parallel.
- Adjust the number of sprints or merge features based on our timeline and priorities.
- Each sprint should include code review, documentation, and a demo.
- We'll make use of backlog and board to track progress and re-prioritize as needed.
