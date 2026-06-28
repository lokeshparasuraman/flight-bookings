# FlyFast — Full-Stack Flight Booking Engine & Client Portal

A full-stack, decoupled flight booking application designed with a layered service-oriented architecture. FlyFast supports natural language flight search (backed by OpenAI with a local regex fallback), interactive cabin seat maps, secure bookings, transactional email/SMS sandboxing, and partner airline administrative consoles.

---

## System Architecture

```
=================================================================================
                               SYSTEM ARCHITECTURE
=================================================================================

      +-------------------+   +--------------------+   +-------------------+
      |  Passenger Portal |   | Partner Dashboard  |   |   AI Chat Widget  |
      +-------------------+   +--------------------+   +-------------------+
                |                       |                        |
                +-----------------------+------------------------+
                                        | (Vite React Client)
                                        v
                               [ Reverse Proxy / CORS ]
                                        | (Bearer JWT)
                                        v
                    [ Express API Router (Node.js): Port 4000 ]
                                        |
      +---------------------------------+---------------------------------+
      |                                 |                                 |
      v                                 v                                 v
[ Auth Controller ]           [ Flight Controller ]            [ Bookings Controller ]
      |                                 |                                 |
      v                                 v                                 v
[ Auth Service ]              [ Flight Service ]               [ Bookings Service ]
      |                                 |                                 |
      +----------------+----------------+----------------+----------------+
                       |                                 |
                       v (Prisma Client ORM)             v (OpenAI SDK / Fallback)
                 [ SQLite Database ]               [ OpenAI API Gateway ]
                 (dev.db - Seeded)                 (Regex Natural Language)
```

### Architectural Key Concepts
1. **Layered Decoupling:** The backend strictly isolates concerns using a Controller-Service-Data pattern. Controllers validate inputs and map HTTP responses; Services encapsulate core business rules and handle external APIs; Prisma ORM handles database transactions.
2. **Resilient AI-Search Pipeline:** Flight query intents are analyzed via an LLM. In the event of API rate limits or network issues, the request is routed to a high-speed, regex-based local parser to ensure zero user disruption.
3. **Transaction Rollback Protection:** The seat selection and check-out phase uses database transactions (`$transaction`). If seat payment fails, booking records are rolled back immediately to prevent orphaned seat locks.
4. **Unified Language System:** Dynamic localized translation layers have been streamlined to a high-speed, direct English text mapping system, reducing bundle overhead and removing localized switcher modules.

---

## Technical Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, TypeScript, TailwindCSS, React Router v6 |
| **Backend** | Node.js, Express, TypeScript, ts-node-dev |
| **ORM & DB** | Prisma Client 5, SQLite |
| **Security** | Helmet (Headers), Cors, JWT Auth, Express-Rate-Limit |
| **Integrations** | OpenAI Client, Twilio SMS (Sandbox), Nodemailer (SMTP Sandbox) |

---

## Getting Started

### Prerequisites
- **Node.js:** v18 or later
- **NPM:** v9 or later

### Setup Backend Engine
1. Navigate to the backend directory and install dependencies:
   ```bash
   cd backend
   npm install
   ```
2. Initialize environment parameters. Create `backend/.env` with the following configuration:
   ```env
   DATABASE_URL="file:./dev.db"
   PORT=4000
   JWT_SECRET="your-own-string"
   OPENAI_API_KEY="your-optional-openai-key"
   ```
3. Sync the Prisma schema and build the SQLite database:
   ```bash
   npx prisma db push
   npx prisma generate
   ```
4. Run the seed script to populate flights for the next 15 days:
   ```bash
   npx ts-node prisma/seed.ts
   ```
5. Start the API server:
   ```bash
   npm run dev
   ```
   The backend API will run on `http://localhost:4000/api`.

### Setup Frontend Client
1. Navigate to the frontend directory and install dependencies:
   ```bash
   cd ../frontend
   npm install
   ```
2. Launch the Vite client server:
   ```bash
   npm run dev
   ```
   The client application will run at `http://localhost:3000`.

---

## Verification & Testing

### Static Type Analysis
Validate type declarations across compile targets:
```bash
# Frontend
cd frontend
npm run typecheck

# Backend
cd backend
npm run typecheck
```

---

## License
MIT
