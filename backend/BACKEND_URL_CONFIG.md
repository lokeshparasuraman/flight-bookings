# 🔗 Backend URL Configuration Guide

## ✅ Backend Code Status: No Errors Found

I've checked all backend files - **no TypeScript compilation errors** detected.

## 📍 Where to Configure Backend URL

### 1. Backend Server Port (Backend Side)

**File:** `backend/.env`
```env
PORT=4000  # ⬅️ Change this if you want a different port
```

**File:** `backend/src/server.ts` (Line 25)
```typescript
const port = Number(process.env.PORT) || 4000;  // Uses PORT from .env
```

**Default:** `4000`
**URL:** `http://localhost:4000`

---

### 2. Frontend Proxy Configuration (Frontend Side)

**File:** `frontend/vite.config.ts` (Line 9)
```typescript
server: {
  port: 3000,
  proxy: {
    "/api": "http://localhost:4000"  // ⬅️ UPDATE THIS if backend runs on different port/URL
  }
}
```

**Current Configuration:** ✅ Already set to `http://localhost:4000`

**To Change:**
- If backend runs on port 5000: Change to `http://localhost:5000`
- If backend is on different server: Change to `https://your-backend-domain.com`

---

### 3. API Client Configuration (Frontend Side)

**File:** `frontend/src/services/api.ts` (Line 4)
```typescript
const api = axios.create({
  baseURL: "/api",  // ⬅️ Uses proxy in development
  timeout: 15000
});
```

**Current Configuration:** ✅ Uses `/api` which proxies to backend via vite.config.ts

**For Production:** You may want to change this to:
```typescript
const api = axios.create({
  baseURL: process.env.VITE_API_URL || "https://your-backend-domain.com/api",
  timeout: 15000
});
```

---

### 4. CORS Configuration (Backend Side)

**File:** `backend/src/server.ts` (Line 13)
```typescript
app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:3000" }));
```

**File:** `backend/.env`
```env
FRONTEND_URL="http://localhost:3000"  # ⬅️ Update this if frontend runs on different URL
```

**Default:** `http://localhost:3000`

---

## 🎯 Quick Configuration Summary

### Development Setup (Current)
- **Backend:** `http://localhost:4000`
- **Frontend:** `http://localhost:3000`
- **Proxy:** Frontend → Backend via `/api` → `http://localhost:4000`

### If You Change Backend Port

1. Update `backend/.env`:
   ```env
   PORT=5000
   ```

2. Update `frontend/vite.config.ts`:
   ```typescript
   proxy: {
     "/api": "http://localhost:5000"  // Match the new port
   }
   ```

### Production Setup

1. Update `backend/.env`:
   ```env
   PORT=4000
   FRONTEND_URL="https://your-frontend-domain.com"
   ```

2. Update `frontend/vite.config.ts` (for build):
   ```typescript
   // Or use environment variables
   proxy: {
     "/api": process.env.VITE_BACKEND_URL || "https://your-backend-domain.com"
   }
   ```

3. Or update `frontend/src/services/api.ts`:
   ```typescript
   baseURL: process.env.VITE_API_URL || "https://your-backend-domain.com/api"
   ```

---

## 📝 Required Environment Variables

### Backend `.env` File

Create `backend/.env` with:

```env
# Database (REQUIRED)
DATABASE_URL="postgresql://user:password@localhost:5432/flyfast?schema=public"

# OpenAI API Key (REQUIRED for AI chat)
OPENAI_API_KEY="sk-your-key-here"

# JWT Secret (REQUIRED)
JWT_SECRET="your-random-secret-here"

# Server Port (OPTIONAL - defaults to 4000)
PORT=4000

# Frontend URL (OPTIONAL - defaults to http://localhost:3000)
FRONTEND_URL="http://localhost:3000"
```

---

## ✅ Verification Checklist

- [ ] `backend/.env` file exists with all required variables
- [ ] Backend runs on port 4000 (or your configured port)
- [ ] Frontend `vite.config.ts` proxy points to correct backend URL
- [ ] CORS allows frontend URL in `backend/.env` (FRONTEND_URL)
- [ ] Database is connected (DATABASE_URL is correct)
- [ ] OpenAI API key is set (for AI chat features)
- [ ] Backend server starts without errors
- [ ] Frontend can communicate with backend (no CORS errors)

---

## 🐛 Common Configuration Issues

### Issue: CORS Error
**Solution:** Update `FRONTEND_URL` in `backend/.env` to match your frontend URL

### Issue: Cannot connect to backend
**Solution:** 
1. Check backend is running: `http://localhost:4000`
2. Verify proxy URL in `frontend/vite.config.ts`
3. Check if port is correct

### Issue: Backend won't start
**Solution:**
1. Check `.env` file exists
2. Verify DATABASE_URL is correct
3. Check if PORT is available

### Issue: Database connection error
**Solution:**
1. Verify PostgreSQL is running
2. Check DATABASE_URL format
3. Ensure database exists

---

## 🚀 Quick Start

1. **Create `backend/.env` file**
2. **Fill in required variables** (see above)
3. **Start backend:** `npm run dev` (runs on port 4000)
4. **Start frontend:** `npm run dev` (runs on port 3000)
5. **Frontend automatically proxies to backend** via `/api`

That's it! No additional URL configuration needed for development.

