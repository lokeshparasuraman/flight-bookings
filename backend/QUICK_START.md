# 🚀 Quick Start Guide

## Backend Configuration - Where to Fill URLs

### ✅ Step 1: Create `.env` File

Create a file named `.env` in the `backend` directory with this content:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/flyfast?schema=public"
OPENAI_API_KEY="sk-your-key-here"
JWT_SECRET="your-random-secret-here"
PORT=4000
FRONTEND_URL="http://localhost:3000"
```

### 📍 Where to Configure Backend URL

#### For Development (Already Configured ✅)

**Frontend File:** `frontend/vite.config.ts`
```typescript
proxy: {
  "/api": "http://localhost:4000"  // ⬅️ Backend runs here
}
```

**No changes needed** if backend runs on `localhost:4000`

#### For Production

**Option 1:** Update `frontend/vite.config.ts`
```typescript
proxy: {
  "/api": "https://your-backend-domain.com"
}
```

**Option 2:** Update `frontend/src/services/api.ts`
```typescript
const api = axios.create({
  baseURL: "https://your-backend-domain.com/api",  // ⬅️ Your backend URL
  timeout: 15000
});
```

### 🔧 Setup Steps

1. **Create `.env` file:**
   ```bash
   cd backend
   # Create .env file and add the variables above
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Setup database:**
   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   npm run seed
   ```

4. **Start backend:**
   ```bash
   npm run dev
   # Backend runs on http://localhost:4000
   ```

5. **Start frontend (in another terminal):**
   ```bash
   cd frontend
   npm install
   npm run dev
   # Frontend runs on http://localhost:3000
   ```

### 📝 Configuration Files Summary

| File | Purpose | What to Configure |
|------|---------|-------------------|
| `backend/.env` | Environment variables | DATABASE_URL, OPENAI_API_KEY, JWT_SECRET, PORT |
| `frontend/vite.config.ts` | Dev server proxy | Backend URL (line 9) |
| `frontend/src/services/api.ts` | API client | baseURL (for production) |

### 🔍 Check Backend is Running

Visit: http://localhost:4000/api/flights/search?origin=DEL&destination=BOM

You should see flight data (if database is seeded) or an empty array.

### ❌ Common Issues

1. **Backend not starting:** Check `.env` file exists and has all variables
2. **Database error:** Verify DATABASE_URL is correct and PostgreSQL is running
3. **CORS error:** Update FRONTEND_URL in `.env` or check `server.ts` CORS config
4. **AI chat not working:** Verify OPENAI_API_KEY is valid and has credits

