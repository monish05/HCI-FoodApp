# Build stage (frontend)
FROM node:20-alpine AS build
WORKDIR /app
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Run stage (backend + static frontend)
FROM python:3.11-slim
WORKDIR /app

COPY requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

COPY backend ./backend
COPY --from=build /app/dist ./backend/dist

ENV PORT=7860
ENV UVICORN_RELOAD=false
EXPOSE 7860

CMD ["python", "/app/backend/main.py"]
