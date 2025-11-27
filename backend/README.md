# Backend (Flight Booking App)

1. Copy `.env.example` -> `.env` and fill values (DATABASE_URL, OPENAI_API_KEY, JWT_SECRET).
2. Install dependencies:
   cd backend
   npm install
3. Generate prisma client and run migrations:
   npx prisma generate
   npx prisma migrate dev --name init
4. Seed sample flights:
   npm run seed
5. Start dev server:
   npm run dev
