# FlyFast — Flight Booking Platform

A full-stack flight booking web app built with React, Express, Prisma, and SQLite. Supports AI-assisted natural language search, seat selection, add-ons, and printable boarding passes.

---

## What This App Does

- Search flights using plain English (e.g. *"Delhi to Mumbai tomorrow morning"*)
- Browse available flights with filters for date, class, and price
- Pick seats from an interactive cabin map
- Add baggage, meals, Wi-Fi, or travel insurance
- Book and get a printable boarding pass
- Airline admin panel to manage routes, flights, and view bookings

---

## Tech Stack

| Layer      | Technology                                              |
|------------|---------------------------------------------------------|
| Frontend   | React 18, TypeScript, Vite, TailwindCSS, React Router v6 |
| Backend    | Node.js, Express, TypeScript                            |
| ORM        | Prisma 5                                                |
| Database   | SQLite (local) — swappable to PostgreSQL                |
| Auth       | JWT + bcrypt                                            |
| AI Search  | OpenAI API (with local regex fallback)                  |
| Security   | Helmet, CORS, express-rate-limit                        |

---

## Project Structure

```
flight-bookings/
├── backend/
│   ├── src/
│   │   ├── controllers/     # Route handlers
│   │   ├── middlewares/     # Auth, rate limiting, validation
│   │   ├── routes.ts        # API route definitions
│   │   ├── services/        # Business logic
│   │   ├── utils/           # Helpers (OTP, mailer, etc.)
│   │   └── server.ts        # App entry point
│   └── prisma/
│       └── schema.prisma    # DB schema + seed
└── frontend/
    └── src/
        ├── pages/           # Home, Search, Booking, Dashboard, etc.
        ├── components/      # Reusable UI components
        ├── contexts/        # Auth context
        └── services/        # Axios API calls
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- Git

### 1. Clone the repo

```bash
git clone https://github.com/your-username/flight-bookings.git
cd flight-bookings
```

### 2. Set up the backend

```bash
cd backend
npm install
```

Create a `.env` file inside `backend/`:

```env
DATABASE_URL="file:./dev.db"
PORT=4000
JWT_SECRET=your_secret_key_here
OPENAI_API_KEY=your_openai_key_here   # optional — fallback works without it
```

Push the schema and seed the database:

```bash
npx prisma db push
npx ts-node prisma/seed.ts
```

Start the backend:

```bash
npm run dev
```

### 3. Set up the frontend

```bash
cd ../frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:3000`, backend at `http://localhost:4000`.

---

## Key Features

### AI Natural Language Search
Users can type queries like *"Fly to Mysore next Monday"* and the app parses origin, destination, date, and class automatically. Backed by OpenAI. If the API quota is exceeded, it falls back to a local regex parser — so search always works.

### Seat Selection
Visual cabin map showing Business and Economy sections. Selecting a seat updates the price in real time (Business +₹5,000 / Economy +₹800).

### Add-ons
Choose from baggage options (15kg / 25kg / 35kg), meal preferences (Veg / Non-Veg / Vegan), Wi-Fi, and travel insurance. Total is recalculated on every change.

### Boarding Pass
After booking, a styled boarding pass is generated with flight info, passenger details, and a barcode. Fully printer-friendly.

### Airline Admin Panel
Separate login for airline staff to manage routes, flights, and view bookings for their airline.

---

## OTP Bypass (Dev Mode)

For local testing, the OTP verification step accepts `123456` or `000000` as valid codes. No email or SMS setup needed during development.

---

## Switching to PostgreSQL

In `backend/prisma/schema.prisma`, change:

```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}
```

to:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

Update `DATABASE_URL` in `.env` with your Postgres connection string and run `npx prisma db push`.

---

## Deployment

The backend is configured for [Railway](https://railway.app) via `nixpacks.toml`. The frontend can be deployed to Vercel — a `vercel.json` is already included.

**Backend env vars needed in production:**
- `DATABASE_URL`
- `JWT_SECRET`
- `PORT`
- `OPENAI_API_KEY` (optional)
- `FRONTEND_URL` (for CORS)

---

## License

MIT
