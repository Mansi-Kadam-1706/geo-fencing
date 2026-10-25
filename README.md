# Geo-Fencing QR Attendance

Professors create venues (lat, long, radius) and start a session that shows a 2-minute QR.
Students scan it; the server checks GPS distance (INSIDE <=70% of radius, BORDER <=90%, EDGE <=100%, else rejected) and a device id.

Stack: React (CRA) + Express + MongoDB, Docker Compose.

## Run on localhost
```bash
cp .env.example .env     # set JWT_SECRET
docker compose up --build
```
Frontend http://localhost:3000, backend http://localhost:5000.

## Team workflow
Jira (key GEO) for tasks: import `jira-import.csv`. Git: `main` / `dev` / `feature/GEO-n-name`, PR review before merge, Jira key in every commit. Details in `DEVOPS.md`.

Phones need HTTPS for camera and GPS; use a tunnel (ngrok/cloudflared) on port 3000 for device testing.
