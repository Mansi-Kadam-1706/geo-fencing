# Geo-Fencing Attendance: Jira, Git, Docker

The app is a geo-fenced QR attendance system. A professor defines a venue (lat, long, radius) and starts a session that shows a short-lived QR. A student scans it, the browser sends GPS plus a device id, and the server classifies the result as INSIDE, BORDER or EDGE.

## Changes already applied in this copy

- `POST /api/reports/manual-mark` is now routed, and the Attendance model accepts zone `MANUAL`.
- `server.js` defaults `PORT` to 5000.
- Frontend `package-lock.json` regenerated, so the Dockerfile uses `npm ci` again.
- Committed `frontend/frontend/.env` removed; use `.env.example` (root `.gitignore` added).

## Still open (in the Jira CSV)

1. **Anyone can register as a professor.** `register` trusts `role` from the request body.
2. **Reports list every student in the database**, not just one class.
3. **Device check runs before QR validation**, and `is_active` is never read.
4. **`AttendanceTable.jsx` is empty** and `App.test.js` is the CRA default.

## 1. Jira

1. Create a Scrum project with key `GEO` and invite the 3 other members.
2. Project settings → Import issues from CSV → upload `jira-import.csv`. Map `Issue Id` to Issue Id and `Parent Id` to Parent Id. If your Jira version lacks those mappings, create the 6 epics by hand and set the Epic Link per story.
3. Replace `Member 1..4` with real Jira users (find/replace in the CSV before import, or reassign after).
4. Create Sprint 1, 2 and 3 if the importer didn't, and start Sprint 1.
5. Screenshot the board, the sprint report and the burndown for your submission.

## 2. Git

```bash
git checkout -b dev
git checkout -b feature/GEO-12-geofence-distance-check
git commit -m "GEO-12 compute distance to venue"
git push -u origin feature/GEO-12-geofence-distance-check
```

- Open a pull request into `dev`, and have a teammate review and merge it.
- Merge `dev` into `main` only when the app runs.
- Keep the Jira key in every branch name and commit message so commits link to tasks.
- Every member needs their own commits. Evaluators read the history.

## 3. Docker (localhost deployment)

Files: `docker-compose.yml` and `.env.example` in the repo root, `Dockerfile` + `.dockerignore` in `backend/`, and `Dockerfile` + `nginx.conf` + `.dockerignore` in `frontend/frontend/`.

```bash
cp .env.example .env        # set JWT_SECRET to a long random string
docker compose up --build
```

- Frontend: http://localhost:3000
- Backend: http://localhost:5000 (should show "Attendance System Server Running")
- MongoDB runs as a third container with a named volume, so data survives restarts.

Compose refuses to start without `JWT_SECRET`. To point the frontend at the deployed Render backend instead, set `REACT_APP_API_URL=https://geo-fencing-nrcj.onrender.com/api` in `.env`. That URL is baked in at build time, so changing it needs `--build`.

## 4. Demo gotchas

- **Phones need HTTPS.** Camera (QR scan) and geolocation are blocked on plain `http://192.168.x.x:3000`. Only `localhost` and HTTPS work. For phone testing use the Vercel URL, or a tunnel such as ngrok or cloudflared pointed at port 3000.
- **CORS.** The backend uses `cors()` with no restrictions, so localhost works.
- **Render free tier sleeps.** The first request after idle can take 30-60 seconds. Open the backend URL before your demo.
- **Fake locations in class.** Chrome DevTools → Sensors lets you test INSIDE, BORDER and EDGE without walking around.
- **Device binding is weak.** `getDeviceId` is stored in localStorage, so clearing site data or using another browser gets a new id. State this limitation in your report.
