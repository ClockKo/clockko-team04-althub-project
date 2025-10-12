# ==============================
# Stage 1 - Build dependencies
# ==============================
FROM public.ecr.aws/docker/library/python:3.11-slim-bookworm AS builder

WORKDIR /app

# Install system build dependencies
RUN apt-get update && apt-get -y upgrade && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Install pip & upgrade
RUN pip install --upgrade pip

# Install dependencies into wheels
COPY requirements.txt .
# Build wheels for all dependencies (include transitive deps)
RUN pip wheel --no-cache-dir --wheel-dir /wheels -r requirements.txt


# ==============================
# Stage 2 - Runtime container
# ==============================
FROM public.ecr.aws/docker/library/python:3.11-slim-bookworm

WORKDIR /app

# Install only runtime libraries
RUN apt-get update && apt-get -y upgrade && apt-get install -y --no-install-recommends \
    libpq5 \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Copy pre-built wheels and install
COPY --from=builder /wheels /wheels
RUN pip install --no-cache /wheels/* \
    && pip cache purge

# Copy project files
COPY . .

# Create non-root user and set ownership
RUN useradd -m -u 10001 appuser && chown -R appuser:appuser /app

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    PORT=8000 \
    APP_MODULE=app.main:app

# Expose FastAPI port
EXPOSE 8000

# Drop privileges and run app with uvicorn, honoring PORT/APP_MODULE
USER appuser
CMD ["sh", "-c", "uvicorn ${APP_MODULE:-app.main:app} --host 0.0.0.0 --port ${PORT:-8000}"]
