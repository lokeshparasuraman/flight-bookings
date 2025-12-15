# Flight Bookings — Production Setup & Manual Deployment

## Overview

- Backend: Express + Prisma + PostgreSQL
- Frontend: React + Vite
- Auth: JWT, password + OTP flows
- Security: CORS, helmet, rate limiters, error handling, compression

## Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Recommended: Nginx reverse proxy

## Environment Variables

- Backend
  - `DATABASE_URL` — Postgres connection string (postgresql://…)
  - `JWT_SECRET` — strong random secret
  - `PORT` — backend port (default 4000)
  - `FRONTEND_URL` — comma-separated allowed origins (e.g. https://app.example.com)
- Frontend
  - `VITE_API_URL` — public API base (e.g. https://api.example.com/api)

## Backend Deployment

1. Install dependencies:
   - `cd backend`
   - `npm ci`
2. Prepare database:
   - `npx prisma db push`
   - `npx prisma generate`
3. Build:
   - `npm run build`
4. Start:
   - `npm run start`
5. Health check:
   - `GET https://api.example.com/health` → 200 OK

### Systemd service (Linux)

Example unit file:

```
[Unit]
Description=Flight Backend
After=network.target

[Service]
Environment=PORT=4000
Environment=JWT_SECRET=change-me
Environment=DATABASE_URL=postgresql://user:pass@host:5432/db
Environment=FRONTEND_URL=https://app.example.com
WorkingDirectory=/srv/flight-bookings/backend
ExecStart=/usr/bin/node dist/server.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Enable and start:

- `sudo systemctl daemon-reload`
- `sudo systemctl enable flight-backend`
- `sudo systemctl start flight-backend`

### Nginx reverse proxy

```
server {
  listen 80;
  server_name api.example.com;

  location / {
    proxy_pass http://127.0.0.1:4000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

## Frontend Deployment

1. Set `VITE_API_URL` to your API (including `/api`), e.g. `https://api.example.com/api`
2. Install and build:
   - `cd frontend`
   - `npm ci`
   - `npm run build`
3. Serve static files:
   - Any static host (Netlify/Vercel/Nginx)
   - Nginx example:

```
server {
  listen 80;
  server_name app.example.com;

  root /srv/flight-bookings/frontend/dist;
  index index.html;

  location / {
    try_files $uri $uri/ /index.html;
  }
}
```

## Deployment Checklist

- Backend builds without TypeScript errors: `npm run typecheck`
- Frontend builds and typechecks: `npm run build`, `npm run typecheck`
- CORS `FRONTEND_URL` includes production origin
- Health check returns 200
- JWT secret is strong and private

## Operations

- Logs: backend prints request lines and errors to stdout
- Graceful shutdown: handles SIGINT/SIGTERM and closes DB
- Rate limiting: `/api/auth` and `/api/chat`
- Compression: responses compressed via `compression`

## Troubleshooting

- 503 “Service temporarily unavailable”: database unreachable (Prisma)
- CORS errors: verify `FRONTEND_URL` and Nginx proxy headers
- 401: invalid/missing JWT — user must login again

