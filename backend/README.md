# FlyFast API — Layered Flight Booking Engine

This repository contains the backend engine driving FlyFast. It is designed around a layered (Controller-Service-Repository) architecture, type-safety via TypeScript, database mapping using Prisma ORM, and high security measures to protect transactions and user authentication.

---

## Technical Architecture

```
┌────────────────────────────────────────────────────────┐
│                      HTTP Request                      │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│                  Security Middlewares                  │
│       CORS, Helmet, Rate Limiters, Auth Guards         │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│                   Controllers Layer                    │
│      Route Registry, Request Validators, HTTP Map      │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│                     Services Layer                     │
│      Business Logic, AI Fallbacks, Mail, OTP           │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│                    Database & ORM                      │
│             Prisma Client, PostgreSQL / SQLite          │
└────────────────────────────────────────────────────────┘
```

### Layered Codebase Organization
- **`/controllers`**: Endpoint routing definitions, input validation chains (`express-validator`), and HTTP status mapping.
- **`/services`**: Independent modules containing the core business logic (auth, bookings, AI chat mapping, notifications, SMS/mail senders).
- **`/middlewares`**: Reusable middlewares including JWT validation, rate limiting pipelines, and the global error boundary.
- **`/utils`**: Pure helper logic, checksum calculations (Luhn check), and text/phone format validators.

---

## Core System Features

### 1. Resilient NLP Intent Fallback
When users type flight queries (e.g. *"Delhi to Mumbai tomorrow"*), the engine attempts to resolve intents using OpenAI. In case of API rate limits or quota depletions (HTTP 429), the controller traps the failure and seamlessly falls back to a custom **local regex-based heuristic parser** to avoid returning errors to the user.

### 2. Standardized Security Pipeline
- **Middleware Rate-Limiting:** Explicitly configured rate limiting on auth and chatbot routes, placed *before* route execution to guard controllers against brute-force attacks while bypassing preflight CORS `OPTIONS` requests.
- **Helmet Headers:** Secures the Express instance with modern headers to restrict scripting origins.
- **Safe Error Boundary:** Catch-all Express boundary mapping technical db connection failures to user-friendly messages while logging critical traceback diagnostics privately on the host terminal.

### 3. Verification & Sandbox OTPs
- Validates phone verification and password reset flows with transactional SMS (via Twilio) and SMTP mail (via Nodemailer).
- Features sandbox OTP codes (`123456` or `000000`) available in non-production environments to streamline automated verification testing.

---

## Setup & Local Development

### Prerequisites
- Node.js (v18+)
- Postgres database instance (or SQLite configuration)

### Installation

1. Install module dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables in `.env` (refer to `.env.example` if available):
   ```env
   PORT=4000
   DATABASE_URL="postgresql://username:password@localhost:5432/dbname"
   JWT_SECRET="generate_a_random_jwt_signing_key_here"
   OPENAI_API_KEY="your-openai-api-key"
   ```

3. Synchronize database schema and build client code:
   ```bash
   npx prisma db push
   npx prisma generate
   ```

4. Populate sample airports and mock flight departures:
   ```bash
   npm run seed
   ```

5. Launch the local hot-reload daemon:
   ```bash
   npm run dev
   ```
   The backend API will initialize at `http://localhost:4000`.

---

## Running Lint & Compile Checks
```bash
# Typecheck TypeScript source
npm run typecheck
```
