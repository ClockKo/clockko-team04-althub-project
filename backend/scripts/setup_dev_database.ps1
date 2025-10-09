# PowerShell version for Windows developers
# setup_dev_database.ps1

param(
    [Parameter(Mandatory=$true)]
    [string]$DeveloperName
)

Write-Host "🗄️ ClockKo Database Setup for Development" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# Convert to lowercase and remove spaces
$dbName = "clockko_dev_$($DeveloperName.ToLower() -replace ' ', '')"

Write-Host "📝 Creating database: $dbName" -ForegroundColor Yellow

# Check if PostgreSQL is accessible
try {
    $result = psql -U postgres -c "SELECT 1;" 2>$null
    if (-not $result) {
        throw "Cannot connect to PostgreSQL"
    }
} catch {
    Write-Host "❌ Cannot connect to PostgreSQL. Please ensure:" -ForegroundColor Red
    Write-Host "   1. PostgreSQL is installed and running" -ForegroundColor Red
    Write-Host "   2. You can connect with: psql -U postgres" -ForegroundColor Red
    exit 1
}

# Create database
try {
    $createResult = psql -U postgres -c "CREATE DATABASE $dbName;" 2>$null
    Write-Host "✅ Database '$dbName' created successfully" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Database '$dbName' might already exist" -ForegroundColor Yellow
    $recreate = Read-Host "Do you want to drop and recreate it? (y/N)"
    if ($recreate -eq 'y' -or $recreate -eq 'Y') {
        psql -U postgres -c "DROP DATABASE IF EXISTS $dbName;"
        psql -U postgres -c "CREATE DATABASE $dbName;"
        Write-Host "✅ Database '$dbName' recreated" -ForegroundColor Green
    }
}

# Create .env.local file
$envContent = @"
# Database Configuration for $DeveloperName
DATABASE_URL=postgresql://postgres:password@localhost:5432/$dbName

# Copy other settings from .env.example
SECRET_KEY=dev-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Email Configuration (use shared test credentials)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=clockko04@gmail.com
# For local-only testing, set your personal Gmail App Password here or via environment
# Do NOT commit real passwords; in AWS we read SMTP_PASSWORD from Secrets Manager
SMTP_PASSWORD=your-app-password
SMTP_FROM=clockko04@gmail.com
SMTP_FROM_NAME=Clockko Team

# OTP Configuration
OTP_EXPIRE_MINUTES=10

# Application Configuration
DEBUG=True
APP_NAME=ClockKo-Dev-$DeveloperName
FRONTEND_URL=http://localhost:3000
"@

$envContent | Out-File -FilePath ".env.local" -Encoding UTF8

Write-Host "📝 Created .env.local with your database configuration" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 Next steps:" -ForegroundColor Cyan
Write-Host "1. Copy environment file: Copy-Item .env.local .env" -ForegroundColor White
Write-Host "2. Run migrations: alembic upgrade head" -ForegroundColor White
Write-Host "3. Start the server: uvicorn app.main:app --reload" -ForegroundColor White
Write-Host ""
Write-Host "💡 Your database: $dbName" -ForegroundColor Yellow
Write-Host "💡 Your .env file is ready!" -ForegroundColor Yellow
