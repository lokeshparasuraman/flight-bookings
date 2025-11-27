# Backend Environment Configuration Guide

## Required Environment Variables

Create a `.env` file in the `backend` directory with the following variables:

### 1. DATABASE_URL (Required)
**Purpose:** PostgreSQL database connection string for Prisma

**Format:**
```
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
```

**Examples:**
- Local PostgreSQL: `postgresql://postgres:password@localhost:5432/flyfast?schema=public`
- Remote PostgreSQL: `postgresql://user:pass@host.example.com:5432/flyfast?schema=public`
- Docker PostgreSQL: `postgresql://postgres:postgres@db:5432/flyfast?schema=public`

**Where to get:** 
- Install PostgreSQL locally, or
- Use a cloud provider (AWS RDS, Railway, Supabase, etc.)

---

### 2. OPENAI_API_KEY (Required)
**Purpose:** OpenAI API key for AI chat functionality

**Format:**
```
OPENAI_API_KEY="sk-..."
```

**Where to get:**
1. Go to https://platform.openai.com/api-keys
2. Sign up or log in
3. Create a new API key
4. Copy the key (starts with `sk-`)

**Note:** Keep this secret! Never commit it to version control.

---

### 3. JWT_SECRET (Required)
**Purpose:** Secret key for signing JWT tokens (authentication)

**Format:**
```
JWT_SECRET="your_random_secret_string"
```

**How to generate:**
```bash
# Using OpenSSL
openssl rand -base64 32

# Or use any random string generator
```

**Security:** Use a strong, random string in production. Never use default values.

---

### 4. PORT (Optional)
**Purpose:** Backend server port

**Default:** `4000`

**Format:**
```
PORT=4000
```

**Note:** If you change this, also update the frontend `vite.config.ts` proxy URL.

---

### 5. FRONTEND_URL (Optional)
**Purpose:** Frontend URL for CORS configuration

**Default:** `http://localhost:3000`

**Format:**
```
FRONTEND_URL="http://localhost:3000"
```

**Production example:**
```
FRONTEND_URL="https://yourdomain.com"
```

---

## Quick Setup Steps

1. **Copy the example file:**
   ```bash
   cd backend
   cp .env.example .env
   ```

2. **Edit `.env` file and fill in:**
   - `DATABASE_URL` - Your PostgreSQL connection string
   - `OPENAI_API_KEY` - Your OpenAI API key
   - `JWT_SECRET` - A random secret string

3. **Install dependencies:**
   ```bash
   npm install
   ```

4. **Setup database:**
   ```bash
   # Generate Prisma client
   npx prisma generate
   
   # Run migrations
   npx prisma migrate dev --name init
   
   # Seed sample data
   npm run seed
   ```

5. **Start the server:**
   ```bash
   npm run dev
   ```

---

## Frontend Configuration

The frontend is already configured to connect to the backend:

**File:** `frontend/vite.config.ts`
```typescript
proxy: {
  "/api": "http://localhost:4000"  // Change this if your backend runs on different port
}
```

**File:** `frontend/src/services/api.ts`
```typescript
baseURL: "/api"  // This uses the proxy in development
```

**For Production:**
- Update `vite.config.ts` proxy or use environment variables
- Or update `api.ts` to use the full backend URL

---

## Common Issues

### Database Connection Error
- Check if PostgreSQL is running
- Verify DATABASE_URL format is correct
- Ensure database exists
- Check network/firewall settings

### OpenAI API Error
- Verify OPENAI_API_KEY is correct
- Check if you have API credits
- Ensure API key has proper permissions

### CORS Error
- Update FRONTEND_URL in `.env`
- Or update CORS settings in `server.ts`

### Port Already in Use
- Change PORT in `.env` to a different port
- Update frontend proxy accordingly

---

## Security Notes

1. **Never commit `.env` file** - It's already in `.gitignore`
2. **Use strong JWT_SECRET** in production
3. **Keep OPENAI_API_KEY secure** - Don't expose it publicly
4. **Use environment-specific configs** - Different `.env` for dev/staging/prod

