# ClockKo - Wellness-Focused Productivity Platform

**Team 04 - AltHub 3.0 Project**

ClockKo is a comprehensive wellness-driven productivity web application designed for remote workers. It combines time tracking, task management, wellness monitoring, and gamification to promote healthy and effective work habits.

---

## 🚩 Project Overview

ClockKo addresses the need for wellness-oriented productivity tools in the remote work era. The platform provides guided work sessions, wellness tracking, virtual coworking spaces, and personalized analytics.

---

## 🏗️ Architecture Overview

```
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│   Frontend    │◄──►│   Backend     │◄──►│    Cloud      │
│  (React/TS)   │    │  (FastAPI)    │    │ (AWS/Azure)   │
└───────────────┘    └───────────────┘    └───────────────┘
           │                      │                      │
           ▼                      ▼                      ▼
 ┌───────────────┐    ┌───────────────┐    ┌───────────────┐
 │ Cybersecurity │    │ Data Analytics│    │ DevOps/CI/CD  │
 │  (Security)   │    │ (ML/Insights) │    │ (Automation)  │
 └───────────────┘    └───────────────┘    └───────────────┘
```

---

## 🚀 Core Features

- ⏱️ **Smart Time Tracking** - Automated work session monitoring
- 📋 **Task Management** - Prioritised task organization with wellness breaks
- 🧑‍🦰 **Guided Shutdowns** - Structured end-of-day routines
- 📈 **Wellness Analytics** - Personalized productivity and health insights
- 👥 **Virtual Coworking** - Collaborative workspaces with focus rooms
- 🎮 **Gamification** - Challenges, rewards, and progress tracking
- 🔒 **Privacy-First** - Secure data handling and user privacy protection

---

## 👩‍💻 Team Structure & Contributions

### 🎨 Frontend Development

**Tech Stack:** React 19, TypeScript, Vite, TailwindCSS, shadcn/ui, TanStack Query, Framer Motion, Axios, Zod.

**Current Status:** ✅ Architecture Complete, Key UI features in progress

**Achievements:**
- Modular, scalable folder structure for core features
- Responsive UI component library and layout
- CI/CD pipeline (GitHub Actions)
- Test-driven development structure
- Responsive view of the landing page done.

**Active Branches:**
- `fe/challenges`
- `fe/dashboardlayout`
- `fe/landingPage`
- `pels/implement-task-management-ui`
- `fe-feature/auth`

**Pending:**
- Finalize challenge feature and advanced dashboard elements ([challenge PR](https://github.com/ClockKo/clockko-team04-althub-project/pull/42), [sidebar PR](https://github.com/ClockKo/clockko-team04-althub-project/pull/40))
- Complete onboarding flows ([onboarding issue](https://github.com/ClockKo/clockko-team04-althub-project/issues/35))
- Finish task management UI ([task management PR](https://github.com/ClockKo/clockko-team04-althub-project/pull/41))
- Authentication and Time tracker.

---

### ⚙️ Backend Development

**Tech Stack:** FastAPI, PostgreSQL, SQLAlchemy, Python

**Current Status:** 🚧 In Development

**Achievements:**
- RESTful API: authentication, user management, time tracking, task management
- JWT authentication and OTP email verification
- Database schema and migrations (Alembic)
- Real-time WebSocket connections

**Active Branches:**
- `be-feature/timetracker`
- `be-feature/tasktracker`
- `be-fix/auth-field-mapping`

**Pending:**
- Expand endpoints for advanced analytics and wellness tracking
- Guided shutdown and productivity features
- Error handling and improved frontend-backend integration
- API update for the pending features

---

### ☁️ Cloud Infrastructure

**Tech Stack:** AWS/Azure, Docker, Kubernetes, Terraform

**Current Status:** 🚧 Infrastructure Setup & CI/CD Integration

**Achievements:**
- Initial infrastructure setup via Terraform ([infra PRs](https://github.com/ClockKo/clockko-team04-althub-project/pull/27), [cloud-feature/infra-setup])
- CI/CD workflows live (`cloud-feature/ci_cd_setup`, `cloud-feature/ci_cd_issues`)
- AWS networking, RDS, ECS, S3 documented ([infra README](backend/infra/README.md))

**Pending:**
- Finalize auto-scaling, monitoring, logging, and disaster recovery
- Infrastructure as code refinement

---

### 🔐 Cybersecurity

**Tech Stack:** Security Frameworks, Encryption, Monitoring Tools

**Current Status:** 🚧 Security Implementation

**Achievements:**
- End-to-end encryption, secure authentication protocols
- Privacy compliance (GDPR/CCPA/NDPR)
- Vulnerability assessment and security monitoring ([security objectives PR](https://github.com/ClockKo/clockko-team04-althub-project/pull/45))

**Active Branches:**
- `Cybersecurity`
- `cybersecurity`

**Pending:**
- Continued penetration testing and incident response strategy

---

### 📊 Data Analytics

**Tech Stack:** Python, Machine Learning, Data Visualization, Analytics APIs

**Current Status:** 🚧 Analytics Development

**Achievements:**
- ML models for wellness insights
- Real-time analytics pipeline initiation

**Pending:**
- Data visualization and advanced reporting

---

## 🛠️ Development Setup

### Prerequisites

- Node.js 18+ and pnpm
- Python 3.9+ and pip
- Docker and Docker Compose
- Git

### Quick Start

```bash
# Clone the repository
git clone https://github.com/ClockKo/clockko-team04-althub-project.git
cd clockko-team04-althub-project

# Frontend Setup
cd frontend/clockko-wellness-app
pnpm install
pnpm run dev

# Backend Setup (when available)
cd ../../backend
pip install -r requirements.txt
uvicorn main:app --reload

# Full Stack with Docker (when available)
docker-compose up --build
```

---

## 📅 Project Timeline

#### Phase 1: Foundation (Current)
- ✅ Frontend architecture and scaffolding
- 🚧 Backend API development
- 🚧 Cloud infrastructure setup
- 🚧 Security framework implementation

#### Phase 2: Core Features (Next)
- Time tracking and task management
- User authentication and profiles
- Basic wellness analytics
- Security testing and compliance

#### Phase 3: Advanced Features
- Virtual coworking spaces
- Machine learning insights
- Gamification system
- Performance optimization

#### Phase 4: Launch Preparation
- End-to-end testing
- Security audits
- Performance tuning
- Documentation completion

---

## 🧪 Testing Strategy

- **Frontend:** Component testing with React Testing Library
- **Backend:** API testing with pytest and FastAPI TestClient
- **Integration:** End-to-end testing across services
- **Security:** Penetration testing and vulnerability assessments
- **Performance:** Load testing and optimization

---

## 📝 Contributing Guidelines

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/YourFeature`
3. **Example**: backend: `be-feature/time-tracker`, frontend: `fe-feature/time-tracker`
4. **Follow** architecture patterns
5. **Add** comprehensive tests
6. **Commit** with clear messages: `git commit -m 'Add amazing feature'`
7. **Push** to your branch: `git push origin feature/YourFeature`
8. **Create** a Pull Request

### Branch Naming Convention

- `feature/` - New features
- `bugfix/` - Bug fixes
- `hotfix/` - Urgent fixes
- `docs/` - Documentation updates

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🌟 Acknowledgments

- AltHub 3.0 Program
- All contributing team members
- Open source community
- Wellness and productivity research community

---

**Building the future of wellness-focused remote work productivity** 💪🌿

---

*Last Updated: September 2025 (see [recent pull requests](https://github.com/ClockKo/clockko-team04-althub-project/pulls) and [open issues](https://github.com/ClockKo/clockko-team04-althub-project/issues))*
