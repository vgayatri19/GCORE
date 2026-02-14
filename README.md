# GCORE - Geethanjali Central Operations Resource Engine

## Run locally

1. Copy `.env.example` to `.env` and update values.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start app:
   ```bash
   npm start
   ```
4. Open `http://localhost:4000`.

## Features
- JWT + bcrypt + session-based authentication
- RBAC for admin, student, club coordinator, placement user, faculty
- Dashboards, announcements, clubs, departments, career, placement, admin controls
- Helmet, strict CORS, rate limiting, input validation, sanitization
- Winston + Morgan logging, audit logs for admin actions
