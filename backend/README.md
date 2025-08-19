# ClockKo Backend API

A FastAPI-based backend application for ClockKo - Authentication and user management system.

## Features

- **User Authentication**: Registration, login, and JWT-based authentication
- **Email Verification**: OTP-based email verification with beautiful sky blue themed emails
- **Password Reset**: Secure password reset with OTP verification
- **PostgreSQL Database**: Robust database with SQLAlchemy ORM
- **Email Service**: Professional email templates with SMTP integration

## Tech Stack

- **FastAPI**: Modern, fast web framework for building APIs
- **SQLAlchemy**: SQL toolkit and Object-Relational Mapping (ORM)
- **PostgreSQL**: Advanced open source relational database
- **Pydantic**: Data validation using Python type annotations
- **JWT**: JSON Web Tokens for secure authentication
- **Alembic**: Database migration tool

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/user` - Get current user info

### Email Verification

- `POST /api/auth/send-verification-email` - Send verification code
- `POST /api/auth/verify-email` - Verify email with OTP

### Password Reset

- `POST /api/auth/forgot-password` - Send password reset code
- `POST /api/auth/reset-password` - Reset password with OTP

## Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/ClockKo/clockko-team04-althub-project.git
   cd backend
   ```

2. **Create virtual environment**

   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**

   ```bash
   pip install -r requirements.txt
   ```

4. **Environment Setup**
   Create a `.env` file with the following variables:

   ```env
   # Database
   DATABASE_URL=postgresql://username:password@localhost/clockko_db
   
   # JWT
   SECRET_KEY=my-secret-key
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=30
   
   # Email Configuration
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASSWORD=my-app-password
   SMTP_FROM=your-email@gmail.com
   SMTP_FROM_NAME=ClockKo
   
   # OTP Settings
   OTP_EXPIRE_MINUTES=5
   
   # App Settings
   APP_NAME=ClockKo
   FRONTEND_URL=http://localhost:3000
   DEBUG=True
   ```

5. **Database Setup**

   ```bash
   # Run migrations
   alembic upgrade head
   ```

6. **Run the application**

   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

## Development

### Database Migrations

```bash
# Create new migration
alembic revision --autogenerate -m "Description"

# Apply migrations
alembic upgrade head
```

### API Documentation

Once running, visit:

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Project Structure

```
backend/
├── app/
│   ├── api/          # API routes
│   ├── core/         # Core functionality (auth, database, security)
│   ├── models/       # Database models
│   ├── schemas/      # Pydantic schemas
│   ├── services/     # Business logic services
│   └── main.py       # FastAPI application
├── alembic/          # Database migrations
├── requirements.txt  # Python dependencies
└── .env             # Environment variables
```

## Email Templates

The application features beautiful, professional email templates with a sky blue theme:

- **Email Verification**: Clean OTP verification emails with verification links
- **Password Reset**: Secure password reset emails with clear instructions
- **Welcome Emails**: Professional welcome messages for new users

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- CORS middleware configured
- Input validation with Pydantic
- SQL injection protection with SQLAlchemy ORM

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests
5. Submit a pull request

## License

This project is licensed under the MIT License.
