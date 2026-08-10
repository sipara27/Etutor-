# eTutor Backend (Django API)
FROM python:3.10-slim

# Prevent Python from writing pyc and buffering stdout/stderr
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Build deps for pycairo (required by xhtml2pdf -> svglib -> rlpycairo)
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libcairo2-dev \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
# Ensure setuptools is installed first (provides pkg_resources for gunicorn/simplejwt)
RUN pip install --upgrade pip && pip install --no-cache-dir setuptools wheel
RUN pip install --no-cache-dir -r requirements.txt gunicorn==20.1.0

# Copy project
COPY . .

# Create directories used by STATICFILES_DIRS/STATIC_ROOT and uploads
RUN mkdir -p static staticfiles media

# Expose port
EXPOSE 8000

# Wait for DB to be reachable, then migrate, load fixture, collect static, and start Gunicorn
CMD ["sh", "-c", "set -eu; echo 'Waiting for db...'; sleep 5; python - <<'PY'\nimport os, socket, time, sys\nhost = os.environ.get('DB_HOST', 'db')\nport = int(os.environ.get('DB_PORT', 5432))\nfor attempt in range(1, 31):\n    try:\n        with socket.create_connection((host, port), timeout=3):\n            print(f'DB reachable at {host}:{port}')\n            break\n    except OSError as e:\n        if attempt == 30:\n            print(f'ERROR: could not reach DB at {host}:{port}', file=sys.stderr)\n            sys.exit(1)\n        time.sleep(3)\nPY\npython manage.py migrate --noinput; (python manage.py loaddata database_dumps/etutor_fixture_20260305.json || true); (python manage.py collectstatic --noinput --clear || true); exec gunicorn etutor_api.wsgi:application --bind 0.0.0.0:8000 --workers 2 --threads 4"]
