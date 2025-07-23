# ClockKo Frontend - README

Welcome to the **ClockKo Frontend** repository! This project is part of the AltHub 3.0 initiative, aiming to build a wellness-focused productivity application for remote workers.

## 🚀 Overview
The frontend is built to interface seamlessly with the FastAPI backend and bring the UI/UX designs from the Product Design team to life. It supports features such as time tracking, guided shutdowns, task management, wellness reports, and more.

---

## 📁 Project Structure
```bash
clockko-frontend/
├── public/               # Static assets
├── src/
│   ├── assets/           # Images, icons, fonts
│   ├── components/       # Reusable UI components
│   ├── pages/            # Page-level components (routes)
│   ├── services/         # API service modules
│   ├── store/            # State management (Redux/Context)
│   ├── utils/            # Utility functions
│   ├── App.tsx           # Main application file
│   └── index.tsx         # Entry point
├── .env                  # Environment variables
├── package.json          # Project metadata and dependencies
└── README.md             # Project documentation
```

---

## 🛠️ Tech Stack
- **React** (with Vite or CRA)
- **TypeScript**
- **TailwindCSS**
- **Axios** (for API calls)
- **Redux Toolkit** or **React Context**
- **Tanstack Query (for state management and API)**
- **Jest** & **React Testing Library** (testing)
- **ESLint + Prettier** (linting & formatting)

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

## 📦 Installation & Setup
```bash
git clone https://github.com/Bamidele0102/clockko-team04-althub-project/frontend.git
cd frontend
npm install
or
pnpm install
```

Create a `.env` file:
```env
VITE_API_URL=https://your-backend-url.com
```

Run the app:
```bash
npm run dev
or
pnpm run dev
```

---

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

## 👥 Team
Frontend Lead: TBD  
Collaborators: All frontend team members (track via GitHub issues and Slack)

---

## 📌 Notes
- Sync regularly with the **Backend** and **Design** teams
- Refer to the shared [Figma designs](#) and API documentation
- Use GitHub Project board to track issues and sprints

---

## 📃 License
[MIT](LICENSE)

---

Let's build something that helps remote workers rest better and live healthier. 💪🌿
