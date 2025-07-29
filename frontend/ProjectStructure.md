# ClockKo Wellness App — Frontend

Welcome to the ClockKo Wellness App frontend! This project helps remote workers track work hours, boost productivity, and improve wellness—all built using the bulletproof-react template for scalability and maintainability.

---

## 🧩 Key Features
- 🔐 Authentication (JWT-based)
- ⏱️ Time Tracking
- 📋 Task Management
- 🧘‍♂️ Guided Shutdown Prompts
- 📊 Wellness Reports
- 👥 Community Feed
- 🎯 Productivity Planner
- 🎁 Reward System

---

## 📋 Project Structure

We follow a **feature-based architecture**. Each main feature gets its own folder with components, API logic, and hooks. Shared UI and utilities are in their own directories.

```
src/
  features/
    auth/               # Login, authentication
    timeTracker/        # Clock in/out, breaks, daily summary
    tasks/              # Task list, timers, reminders
    shutdowns/          # Guided shutdown, end-of-day reflection
    coworking/          # Virtual co-working rooms
    wellnessReports/    # Wellness stats, recommendations
    challenges/         # Community challenges, leaderboard
    rewards/            # Points, badges, redeemables
    profile/            # User profile, settings
  components/           # Shared UI components
  layouts/              # App-wide layouts (dashboard, auth, etc.)
  pages/                # Route-level components (if using file-based routing)
  lib/                  # Utilities, API clients
  store/                # Global state (if needed)
  hooks/                # Shared custom hooks
  styles/               # Global styles, theme
  assets/               # Images, icons, fonts
  types/                # TypeScript types
  routes/               # Centralized routing (if not using pages/)
```

---

## 🌟 MVP Features and Folder Mapping

| Feature                       | Folder(s) / Example Components                   |
|-------------------------------|-------------------------------------------------|
| Log in/out                    | `features/auth/`<br/>`LoginForm.tsx`            |
| Clock in/out, breaks, timers  | `features/timeTracker/`<br/>`ClockInOutButton.tsx`, `BreakTimer.tsx` |
| Task management               | `features/tasks/`<br/>`TaskList.tsx`, `TaskTimer.tsx` |
| Guided shutdowns, reflection  | `features/shutdowns/`<br/>`ShutdownPrompt.tsx`  |
| Virtual co-working            | `features/coworking/`<br/>`CoworkingRoom.tsx`   |
| Wellness reports              | `features/wellnessReports/`<br/>`WellnessReport.tsx` |
| Community challenges          | `features/challenges/`<br/>`ChallengeList.tsx`  |
| Reward system                 | `features/rewards/`<br/>`PointsSummary.tsx`     |
| Profile, settings             | `features/profile/`<br/>`ProfileCard.tsx`       |
| Shared UI (buttons, modals)   | `components/`<br/>`Button.tsx`, `Modal.tsx`     |

---

## 👩‍💻 How to Contribute

1. **Clone & Install:**
```bash
git clone https://github.com/Bamidele0102/clockko-team04-althub-project/frontend.git
cd frontend
npm install
or
pnpm install
```

---
Create a `.env` file:
```env
VITE_API_URL=https://your-backend-url.com
```

2. **Start Development Server:**
Run the app:
```bash
npm run dev
or
pnpm run dev
```

## 🧪 Testing
```bash
npm run test
or
pnpm run test
```
---

## 🗂️ Contributing
- Fork the repository
- Create your feature branch: `git checkout -b feature/YourFeature`
- Commit your changes: `git commit -m 'Add feature'`
- Push to the branch: `git push origin feature/YourFeature`
- Create a Pull Request

---

1. **Branch by Feature:**  
   Work inside feature folders—e.g., `features/timeTracker/` for time tracking logic.

2. **Add Components & Logic:**  
   - UI: Place in `components/`
   - API calls: Place in `api/`
   - Custom hooks: Place in `hooks/`
   - Export from the feature’s `index.ts`

3. **Shared UI:**  
   Add generic UI (buttons, modals) to `src/components/` for reuse.

4. **Routing:**  
   Define new routes in `routes/` or `pages/` as per app navigation.

5. **Testing:**  
   Write unit tests with Jest and React Testing Library in the same folder as the component (e.g., `LoginForm.test.tsx`).

---

## 🗂️ Example: Adding a New Feature

Suppose the PRD adds "Team Announcements":

1. Create `features/announcements/`
2. Add:
   - `components/AnnouncementList.tsx`
   - `api/announcementsApi.ts`
   - `hooks/useAnnouncements.ts`
   - `index.ts`
3. Export components/hooks via `index.ts`
4. Add route (if needed) in `routes/` or `pages/`

---

## 🛠️ Tech Stack

- React + TypeScript
- Vite
- TanStack / React Query (data fetching)
- Zustand / React Context (for global state, if needed)
- Jest + React Testing Library (testing)
- Prettier, ESLint (code style)
- [bulletproof-react](https://github.com/alan2207/bulletproof-react) (project structure inspiration)

---

## 📌 Notes
- Sync regularly with the **Backend** and **Design** teams
- Refer to the shared [Figma designs](#) and API documentation
- Use GitHub Project board to track issues and sprints

---

## 📄 Reference

- [ClickUp PRD](https://app.clickup.com/9012978739/docs/8cke91k-652/8cke91k-352)
- [User Flows & MVP Features](#🌟-mvp-features-and-folder-mapping)
- [Architecture Guide](https://github.com/alan2207/bulletproof-react)

