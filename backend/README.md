# ClockKo Backend Project (FastAPI)

Welcome to the ClockKo backend codebase! This backend powers the ClockKo wellness and productivity app for remote workers. Built with FastAPI, it is modular, scalable, and production-ready.

---

## 🚀 Tech Stack

* **Framework**: FastAPI
* **Database**: PostgreSQL (SQLAlchemy ORM)
* **Migrations**: Alembic
* **Auth**: OAuth2, JWT (using python-jose)
* **Containerization**: Docker + Docker Compose
* **Data Validation**: Pydantic
* **Realtime Features**: WebSockets
* **Background Tasks**: FastAPI BackgroundTasks

---

## 📁 Project Structure

```
ClockKo/
├── app/
│   ├── __init__.py
│   ├── main.py
│   ├── api/
        └── v1/                         # Versioning for future-proofing
│   │       ├── __init__.py
│   │       ├── auth.py
│   │       ├── tasks.py
│   │       ├── timetracker.py
│   │       ├── shutdown.py
│   │       ├── coworking.py
│   │       ├── community.py
│   │       ├── rewards.py
│   │       ├── reports.py
│   │       └── planner.py
│   ├── core/
│   │   ├── __init__.py
│   │   ├── database.py
│   │   ├── security.py
│   │   ├── auth.py
│   │   └── config.py                   # Handles .env, environments (dev, prod)
│   ├── models/
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── task.py
│   │   ├── session.py
│   │   ├── coworking.py
│   │   ├── reward.py
│   │   ├── report.py
│   │   └── planner.py
│   ├── schemas/
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── task.py
│   │   ├── timelog.py
│   │   ├── shutdown.py
│   │   └── planner.py
│   ├── services/
│   │   ├── __init__.py
│   │   ├── userservice.py
│   │   ├── taskservice.py
│   │   ├── reportservice.py
│   │   ├── rewardservice.py
│   │   └── plannerservice.py
│   ├── tests/
│   │   ├── __init__.py
│   │   ├── testusers.py
│   │   ├── testtasks.py
│   │   └── testplanner.py
│   ├── docs/                            # 🔹 Optional: API usage guides, Swagger files, etc.
│
├── alembic/
│   ├── versions/
│   └── env.py
├── .env.example
├── alembic.ini
├── requirements.txt
├── Dockerfile
├── docker-compose.yml
├── run.py  # Entry point (Optional: uvicorn runner)
└── README.md
```

---

## 🧠 Authentication Stack

* **OAuth2 with Password Flow**
* **JWT tokens** for access control

**Endpoints:**

* `POST /register`
* `POST /login`
* `GET /user` (current profile)

---

## 🔌 Key API Features

### Time Tracker

* `POST /time-log`: Log a session
* `GET /time-log`: Get all logs(history)

### Task Tracker

* `POST /tasks`, `GET /tasks`, `PUT /tasks/{id}`, `DELETE /tasks/{id}`

### Guided Shutdowns

* `GET /shutdown/prompt`: Prompts
* `POST /shutdown/log`: Saves end of the day reflections

### Virtual Co-Working Rooms

* `POST /rooms`: Create Co-Working Rooms
* `POST /rooms/join`: Join a Room
* `GET /rooms`: List Rooms

### Monthly Wellness Reports

* `GET /reports`: Monthly Reports
* `GET /reports/download`: PDF or CSV

### Community Support APIs

* `POST /community/post`: Start a Community post
* `GET /community/feed`: See Timeline(feed)

### Reward System

* `POST /rewards/assign`: Assigns Reward
* `GET /rewards/user`: Track points and reward history 

### Planner

* `POST /planner/create`
* `GET /planner/schedule`

---

## 🧱 Suggested Libraries

| Area             | Tool                                                                     |
| ---------------- | ------------------------------------------------------------------------ |
| ORM              | SQLAlchemy + Alembic                                                     |
| Auth             | FastAPI + OAuth2 + python-jose + passlib                                 |
| Websockets       | Built-in FastAPI support                                                 |
| Background Tasks | FastAPI BackgroundTasks(manages report generation)                       |
| Validation       | Pydantic                                                                 |
| Analytics        | Optional log processors event tables. Optional, but helpful for insights.|

---

## 🐳 Docker Setup

1. Build and run

```bash
docker-compose up --build
```

2. Access API at `http://localhost:8000`

---

## 📌 Contribution Guide

* All contributions must be made via **pull requests**
* Follow the naming convention: `feature/auth`, `fix/typo-login`, etc.
* Run tests before pushing
* Add docstrings and typing annotations

---

## 📌 Tasks & Planning

We use **GitHub Projects** to manage development sprints. Tasks are tracked using Issues. See the **Projects** tab in this repository.

---

## 🧪 Tests

```bash
pytest app/tests
```

---

## 🛠 Maintainers

This project is maintained by the ClockKo Development Team (Team 04 @ AltHub).

---

Let's help remote workers unplug, recharge, and thrive with ClockKo! 🧘‍♂️💻
