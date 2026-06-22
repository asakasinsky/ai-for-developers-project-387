FROM python:3.12-slim

WORKDIR /app

# Install Node.js for frontend build
RUN apt-get update && apt-get install -y nodejs npm curl && rm -rf /var/lib/apt/lists/*

COPY frontend/package*.json frontend/
WORKDIR /app/frontend
RUN npm ci && npm run build

WORKDIR /app
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY backend ./backend/

ENV PORT=8000
ENV HOST=0.0.0.0

EXPOSE 8000

CMD python -m uvicorn backend.main:app --host $HOST --port $PORT