# FlyFast Backend Engine — Layered Flight Booking API

This is the backend API engine for FlyFast. It utilizes a layered Controller-Service-Repository architecture, typed request validators, security headers, database mapping using Prisma ORM, and integrated transaction rollbacks.

---

## Architectural Layout

```
                        +----------------------+
                        |     HTTP Request     |
                        +----------+-----------+
                                   |
                                   v
                        +----------+-----------+
                        | Security Middleware  |
                        | (CORS, Rate Limiter) |
                        +----------+-----------+
                                   |
                                   v
                        +----------+-----------+
                        |  Controllers Layer   |
                        | (Req / Res mapping)  |
                        +----------+-----------+
                                   |
                                   v
                        +----------+-----------+
                        |    Services Layer    |
                        | (Business Decisions) |
                        +----------+-----------+
                                   |
                                   v
                        +----------+-----------+
                        |    Database Layer    |
                        |  (Prisma & SQLite)   |
                        +----------------------+
```

### Directory Map
- **`/src/controllers`**: Handles request endpoints, validation chains (`express-validator`), and HTTP status response codes.
- **`/src/services`**: Contains isolated business logic modules (booking management, user profiles, LLM clients, SMS/email sandboxing).
- **`/src/middlewares`**: Common middleware functions including JWT authentication guards, rate-limiting configurations, and global error logging.
- **`/src/utils`**: Independent helper utilities (Luhn checksum algorithms, pattern validators).
- **`/prisma`**: Schema mappings and database migration/seeding routines.

---

## Getting Started

### Local Setup
1. Install node modules:
   ```bash
   npm install
   ```
2. Configure `.env`:
   ```env
   DATABASE_URL="file:./dev.db"
   PORT=4000
   JWT_SECRET="wWAewCqNlYWIoINEDonLvXFszMxUZWbC"
   OPENAI_API_KEY="your-key-here"
   ```
3. Initialize SQLite DB:
   ```bash
   npx prisma db push
   npx prisma generate
   ```
4. Seed mock flight data:
   ```bash
   npx ts-node prisma/seed.ts
   ```
5. Boot dev server:
   ```bash
   npm run dev
   ```

---

## Verification & Testing
Verify TypeScript compiler compliance:
```bash
npm run typecheck
```
