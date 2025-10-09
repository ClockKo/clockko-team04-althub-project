# ClockKo Frontend - README

Welcome to the **ClockKo Frontend** repository! This project is part of the AltHub 3.0 initiative, aiming to build a wellness-focused productivity application for remote workers.

## 🚀 Overview

The frontend is built to interface seamlessly with the FastAPI backend and bring the UI/UX designs from the Product Design team to life. It supports features such as time tracking, guided shutdowns, task management, wellness reports, and more.

## 📁 Project Structure

```bash
clockko-wellness-app/
├── public/               # Static assets
├── src/
│   ├── assets/           # Images, icons, fonts
│   ├── components/       # Reusable UI components
│   │   └── ui/           # shadcn/ui components
│   ├── features/         # Feature-based modules
│   │   ├── auth/         # Authentication system
│   │   ├── challenges/   # Challenge & gamification
│   │   ├── coworking/    # Virtual coworking rooms
│   │   ├── profile/      # User profile management
│   │   ├── rewards/      # Reward & points system
│   │   ├── shutdowns/    # Guided shutdown prompts
│   │   ├── tasks-management/  # Task tracking
│   │   ├── timeTracker/  # Time tracking features
│   │   └── wellnessReports/   # Analytics & reports
│   ├── pages/            # Page-level components
│   │   ├── dashboard/    # Main dashboard
│   │   └── landingpage/  # Landing page
│   ├── hooks/            # Custom React hooks
│   ├── layouts/          # Layout components
│   ├── lib/              # Utility libraries
│   ├── routes/           # Routing configuration
│   ├── stores/           # State management
│   ├── styles/           # Global styles
│   ├── types/            # TypeScript type definitions
│   └── utils/            # Helper functions
├── .github/workflows/    # CI/CD configuration
├── package.json          # Dependencies & scripts
└── README.md             # Project documentation
```

## 🛠️ Tech Stack

- **React 19** with **Vite**
- **TypeScript** (full type safety)
- **TailwindCSS** (styling)
- **shadcn/ui** (component library)
- **ESLint + Prettier** (code quality)
- **pnpm** (package manager)
- **GitHub Actions** (CI/CD)

## 🧩 Current Implementation Status

### ✅ Completed

- 📦 **Project Setup** - Vite + React + TypeScript configuration
- 🏗️ **Architecture** - Feature-based folder structure
- 📝 **Type Definitions** - Complete TypeScript interfaces for all features
- 🧪 **Testing Setup** - Test files created for each feature
- 🎨 **UI Foundation** - shadcn/ui components integrated
- 🔧 **Development Tools** - ESLint, Prettier, and CI/CD pipeline
- 📁 **Feature Scaffolding** - All feature modules structured with:
  - API service files
  - Component files
  - Hook files
  - Context files
  - Test files

### 🚧 In Progress

- 🔐 Authentication system implementation
- ⏱️ Time tracking functionality
- 📋 Task management features
- 🧘‍♂️ Guided shutdown system
- 📊 Wellness reporting
- 🎯 Dashboard widgets
- 👥 Coworking rooms
- 🎁 Rewards & challenges

## 📦 Installation & Setup

```bash
# Clone the repository
git clone https://github.com/Bamidele0102/clockko-team04-althub-project.git
cd frontend/clockko-wellness-app

# Install dependencies
pnpm install

# Start development server
pnpm run dev
```

### Environment Setup

Create a `.env` file in the `clockko-wellness-app` directory:

```env
VITE_API_URL=https://your-backend-url.com
```

## 🛠️ Available Scripts

```bash
# Development
pnpm run dev          # Start development server

# Building
pnpm run build        # Build for production
pnpm run preview      # Preview production build

# Code Quality
pnpm run lint         # Run ESLint
pnpm run lint:fix     # Fix ESLint issues

# Testing
pnpm run test         # Run tests (when implemented)
```

## 🧪 Testing Strategy

Each feature module includes:

- Unit tests for components
- Integration tests for hooks
- API service tests
- End-to-end test preparations

Test files are co-located with features in dedicated `test/` folders.

## 🏗️ Architecture

The project follows a **feature-based architecture**:

- **Features** are self-contained modules with their own components, hooks, services, and tests
- **Shared components** live in the `components/` directory
- **Types** are centralized in the `types/` directory
- **Global state** is managed in the `stores/` directory

## 🗂️ Contributing

1. clone the repository
2. Create your feature branch: `git checkout -b feature/YourFeature`
3. Follow the existing folder structure and naming conventions
4. Add tests for new functionality
5. Commit your changes: `git commit -m 'Add feature'`
6. Push to the branch: `git push origin feature/YourFeature`
7. Create a Pull Request

## 👥 Team

Frontend Development Team - AltHub 3.0 Cohort  
Track progress via GitHub issues and project board

## 📌 Development Notes

- **Type Safety**: All features have complete TypeScript interfaces
- **Component Library**: Using shadcn/ui for consistent design
- **Testing**: Comprehensive test structure prepared
- **CI/CD**: Automated workflows configured
- **Code Quality**: ESLint and Prettier enforced

## 🎯 Next Steps

1. Implement authentication flow
2. Build core time tracking functionality
3. Develop task management system
4. Create wellness reporting dashboard
5. Add real-time features for coworking
6. Implement gamification elements

## 📃 License

[MIT](LICENSE)

---

Building a wellness-focused productivity platform for remote workers. 💪🌿
