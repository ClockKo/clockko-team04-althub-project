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

## ✨ Recent Features & Contributions

### Frontend
- Responsive landing page and sidebar navigation ([Landing PR](https://github.com/ClockKo/clockko-team04-althub-project/pull/38), [Sidebar PR](https://github.com/ClockKo/clockko-team04-althub-project/pull/40))
- Task Management UI implemented ([Task Management PR](https://github.com/ClockKo/clockko-team04-althub-project/pull/41))
- Challenge feature in progress ([Challenge PR](https://github.com/ClockKo/clockko-team04-althub-project/pull/42))
- Time Tracker UI and responsiveness ([TimeTracker PRs](https://github.com/ClockKo/clockko-team04-althub-project/pull/49), [PR#52](https://github.com/ClockKo/clockko-team04-althub-project/pull/52))
- CI/CD pipeline setup and README update ([CI/CD PRs](https://github.com/ClockKo/clockko-team04-althub-project/pull/32), [README Update PR](https://github.com/ClockKo/clockko-team04-althub-project/pull/33))

### Backend
- Authentication system cleaned up ([Auth PRs](https://github.com/ClockKo/clockko-team04-althub-project/pull/51), [PR#53](https://github.com/ClockKo/clockko-team04-althub-project/pull/53))
- Team database collaboration framework ([Team DB PR](https://github.com/ClockKo/clockko-team04-althub-project/pull/50))
- RESTful API endpoints for time tracking, user and task management ([Backend PRs](https://github.com/ClockKo/clockko-team04-althub-project/pull/25), [PR#22](https://github.com/ClockKo/clockko-team04-althub-project/pull/22))

### Cloud & DevOps
- Cache optimization for workflows ([Cache PR](https://github.com/ClockKo/clockko-team04-althub-project/pull/48))
- Infrastructure setup with Terraform ([Infra PR](https://github.com/ClockKo/clockko-team04-althub-project/pull/27))

### Cybersecurity
- Security objectives documented ([Security PR](https://github.com/ClockKo/clockko-team04-althub-project/pull/45))
- Privacy compliance and vulnerability assessment ([Access Control PR](https://github.com/ClockKo/clockko-team04-althub-project/pull/36))

---

## 👥 Notable Contributors

- Onovae: Backend Auth, Team DB, User Management
- Abujaipaul: Time Tracker features
- pelsdev: Task Management UI, DevOps
- mariamALLI: Dashboard, Sidebar, Challenges, Documentation
- Bamidele0102: Infrastructure, CI/CD, README updates
- Uforo-A: Security, Auth documentation
- Benjamin-BIC: Backend task management
- muhdfawwazbashir: Time tracker, API integration

---

## 🆕 What’s Next

- Finalize dashboard and challenge features
- Expand backend analytics and wellness endpoints
- Continue cloud infrastructure and security refinement
- Advance onboarding and user management flows

For full details and ongoing updates, see [recent pull requests](https://github.com/ClockKo/clockko-team04-althub-project/pulls) and [open issues](https://github.com/ClockKo/clockko-team04-althub-project/issues).

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

### � CI/CD Workflows

This project uses GitHub Actions with Terraform + Docker to deploy the backend behind an HTTPS API Gateway and the frontend to GitHub Pages.

#### Workflows

- infra-plan.yml (pull_request)
    - Runs Terraform plan for frontend and backend stacks when PRs touch infra/app code (frontend/**, backend/**, iac/**).
    - Concurrency: infra-plan-${{ github.ref }} (auto-cancels superseded runs).

- infra-apply-deploy.yml (push → main)
    - Triggers on changes under backend/** and iac/**.
    - Steps: build → Trivy scan → Terraform apply (backend stack) → Alembic migrations → update API Gateway integration via helper → HTTPS smoke tests (/api/health, /api/health/google).
    - Concurrency: infra-apply (auto-cancels superseded runs).

- deploy-frontend-pages.yml (push → main, manual)
    - Builds and deploys the frontend to GitHub Pages when files under `frontend/clockko-wellness-app/**` change.
    - Uses Vite envs: VITE_API_BASE_URL, VITE_GOOGLE_CLIENT_ID, VITE_BASE (defaults to `/clockko-team04-althub-project/`).

#### Required repo configuration

- Secrets
    - AWS_ROLE_ARN: OIDC role ARN used by Actions to access AWS.

- Variables
    - AWS_REGION: e.g., `us-east-1`
    - TF_STATE_BUCKET: S3 bucket for Terraform state
    - TF_STATE_DYNAMO_TABLE: DynamoDB lock table
    - TF_STATE_KEY_BACKEND: backend state object key (e.g., `clockko/backend/terraform.tfstate`)
    - FRONTEND_PROJECT_NAME: (optional) project name; CI defaults to `clockko` when unset
    - ECR_REPOSITORY: (optional) defaults to `clockko-backend`
    - VITE_API_BASE_URL: `https://<api-id>.execute-api.<region>.amazonaws.com/api`
    - VITE_GOOGLE_CLIENT_ID: your Google OAuth Client ID

#### Helper scripts (iac/scripts)

- backend-update-apigw-integration.sh: Points the API Gateway HTTP API integration to the current ECS public IP using `{proxy}` for the `/api/{proxy+}` route.
- run-db-migration.sh: Runs Alembic `upgrade head` in a one-off ECS task using the deployed task definition and networking.
- ecs-task-public-ip.sh: Prints the current ECS task public IP (for quick diagnostics).
- frontend-deploy.sh: Builds the frontend. Defaults to GitHub Pages (triggers the workflow via `gh` if available); supports legacy S3 via `DEPLOY_TARGET=s3`.

#### Notes

- Frontend deploys are handled exclusively by GitHub Pages; the backend workflow does not rebuild or deploy the frontend.
- The backend exposes HTTPS via API Gateway; smoke tests verify `/api/health` and Google config at `/api/health/google` after each deploy.

---

### �🔐 Cybersecurity

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