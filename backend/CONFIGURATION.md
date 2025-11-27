# Backend Configuration Guide

## ✅ Backend Status: No Errors Found

The backend code has been checked and there are **no TypeScript compilation errors**.

## 📋 Required Configuration

### Step 1: Create `.env` File

Create a `.env` file in the `backend` directory with these variables:

```env
# Database Configuration (REQUIRED)
DATABASE_URL="postgresql://user:password@localhost:5432/flyfast?schema=public"

# OpenAI API Key (REQUIRED for AI chat)
OPENAI_API_KEY="sk-your-openai-api-key-here"

# JWT Secret (REQUIRED for authentication)
JWT_SECRET="your-random-secret-string-here"

# Server Port (OPTIONAL - defaults to 4000)
PORT=4000

# Frontend URL (OPTIONAL - defaults to http://localhost:3000)
FRONTEND_URL="http://localhost:3000"
```

### Step 2: Where to Get Configuration Values

#### 1. DATABASE_URL
**Location to configure:** `backend/.env` file

**Options:**
- **Local PostgreSQL:**
  - Install PostgreSQL: https://www.postgresql.org/download/
  - Create database: `createdb flyfast`
  - Connection string: `postgresql://postgres:yourpassword@localhost:5432/flyfast?schema=public`

- **Cloud Options:**
  - **Railway:** https://railway.app (Free tier available)
  - **Supabase:** https://supabase.com (Free tier available)
  - **Neon:** https://neon.tech (Free tier available)
  - **AWS RDS:** For production

#### 2. OPENAI_API_KEY
**Location to configure:** `backend/.env` file

**Steps:**
1. Go to: https://platform.openai.com/api-keys
2. Sign up or log in
3. Click "Create new secret key"
4. Copy the key (starts with `sk-`)
5. Paste in `.env` file

**Important:** You need OpenAI API credits to use the AI chat feature.

#### 3. JWT_SECRET
**Location to configure:** `backend/.env` file

**Generate a random secret:**
```bash
# Windows PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))

# Or use any random string generator
# Minimum 32 characters recommended
```

#### 4. PORT
**Location to configure:** `backend/.env` file (optional)

**Default:** `4000`

**Note:** If you change this, update `frontend/vite.config.ts`:
```typescript
proxy: {
  "/api": "http://localhost:YOUR_PORT"  // Update this
}
```

#### 5. FRONTEND_URL
**Location to configure:** `backend/.env` file (optional)

**Default:** `http://localhost:3000`

**Used for:** CORS configuration

---

## 🔧 Frontend Configuration

### Backend URL Configuration

The frontend is already configured to connect to the backend. Here's where it's set:

#### Development (Current Setup)
**File:** `frontend/vite.config.ts`
```typescript
server: {
  port: 3000,
  proxy: {
    "/api": "http://localhost:4000"  // ⬅️ Backend URL here
  }
}
```

**File:** `frontend/src/services/api.ts`
```typescript
const api = axios.create({
  baseURL: "/api",  // Uses proxy in development
  timeout: 15000
});
```

#### Production Setup
For production, you have two options:

**Option 1: Update `vite.config.ts` proxy**
```typescript
proxy: {
  "/api": "https://your-backend-domain.com"
}
```

**Option 2: Update `api.ts` directly**
```typescript
const api = axios.create({
  baseURL: process.env.VITE_API_URL || "https://your-backend-domain.com/api",
  timeout: 15000
});
```

Then create `frontend/.env`:
```env
VITE_API_URL=https://your-backend-domain.com/api
```

---

## 🚀 Setup Instructions

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Setup Database
```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init

# Seed sample flights
npm run seed
```

### 3. Start Backend Server
```bash
npm run dev
```

Backend should start on: `http://localhost:4000`

### 4. Start Frontend (in another terminal)
```bash
cd frontend
npm install
npm run dev
```

Frontend should start on: `http://localhost:3000`

---

## 🐛 Troubleshooting

### Backend won't start
1. **Check `.env` file exists** in `backend/` directory
2. **Verify DATABASE_URL** is correct and database is accessible
3. **Check PORT** is not already in use
4. **Verify OPENAI_API_KEY** is valid (if using AI chat)

### Database connection error
```bash
# Test PostgreSQL connection
psql -h localhost -U postgres -d flyfast

# Or check if PostgreSQL is running
# Windows: Check Services
# Mac/Linux: sudo service postgresql status
```

### CORS errors
- Update `FRONTEND_URL` in `backend/.env`
- Or modify CORS settings in `backend/src/server.ts`

### OpenAI API errors
- Verify API key is correct
- Check if you have API credits
- Verify API key permissions

### Port already in use
```bash
# Windows: Find process using port 4000
netstat -ano | findstr :4000

# Kill the process or change PORT in .env
```

---

## 📁 File Structure

```
backend/
├── .env                 # ⬅️ CREATE THIS FILE (not in git)
├── .env.example         # Example file (optional)
├── src/
│   ├── server.ts        # Main server file (uses PORT from .env)
│   ├── routes.ts        # API routes
│   └── services/
│       ├── llmClient.ts # Uses OPENAI_API_KEY from .env
│       └── authService.ts # Uses JWT_SECRET from .env
├── prisma/
│   └── schema.prisma    # Database schema
└── package.json
```

---

## ✅ Checklist

- [ ] Created `backend/.env` file
- [ ] Added `DATABASE_URL` (PostgreSQL connection)
- [ ] Added `OPENAI_API_KEY` (for AI chat)
- [ ] Added `JWT_SECRET` (random secret string)
- [ ] (Optional) Set `PORT` if not using 4000
- [ ] (Optional) Set `FRONTEND_URL` if frontend is not on localhost:3000
- [ ] Installed dependencies (`npm install`)
- [ ] Generated Prisma client (`npx prisma generate`)
- [ ] Ran database migrations (`npx prisma migrate dev`)
- [ ] Seeded database (`npm run seed`)
- [ ] Started backend server (`npm run dev`)
- [ ] Verified frontend proxy URL in `vite.config.ts`

---

## 🔐 Security Notes

1. **Never commit `.env` file** - It should be in `.gitignore`
2. **Use strong JWT_SECRET** in production
3. **Keep OPENAI_API_KEY secure**
4. **Use environment-specific configs** for dev/staging/prod
5. **Don't expose API keys** in frontend code

---

## 📞 Need Help?

If you encounter issues:
1. Check the error message in the terminal
2. Verify all environment variables are set
3. Check database connection
4. Verify API keys are valid
5. Check port availability

