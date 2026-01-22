FROM python:3.12-slim

# Keep Python from writing .pyc files and ensure logs are unbuffered
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# System dependencies (psycopg2 build deps)
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first to leverage Docker layer caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Create a non-root user
RUN useradd --create-home --shell /usr/sbin/nologin appuser

# Copy application code (explicit paths to avoid leaking unintended files)
COPY --chown=appuser:appuser app/ ./app/
COPY --chown=appuser:appuser main.py ./main.py

USER appuser

EXPOSE 8000

CMD ["python", "-m", "uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
