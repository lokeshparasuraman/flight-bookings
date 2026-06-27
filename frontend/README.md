# FlyFast Client Portal — Premium Flight Web App

This is the passenger client interface for FlyFast, built on React 18, Vite, TypeScript, and Tailwind CSS. The client has dark/light mode context themes, interactive cabin maps, automated seat validations, and printer-friendly boarding tickets.

---

## Directory Organization

- **`/src/contexts`**: State providers (e.g. `ThemeContext` for dark/light themes, `ToastContext` for slide-in notification toasts).
- **`/src/components`**: Shared modular components (AI chatbot panel, glassmorphic special fares grids, loading indicators, custom icons).
- **`/src/pages`**: Main page layouts (Spotlight Home Search, Search Results list, Detail seat selector and check-out, User Bookings, Operator portal).
- **`/src/services`**: Axios client wrapper configs, authorization headers, and response interceptors.

---

## Getting Started

### Local Setup
1. Install project packages:
   ```bash
   npm install
   ```
2. Configure dynamic environment overrides (optional):
   Create `frontend/.env`:
   ```env
   VITE_API_URL="http://localhost:4000/api"
   ```
3. Start local development hot-reload client:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

---

## Validation & Compilation Checks
Validate TypeScript code compilation and static checks:
```bash
npm run typecheck
```
Build an optimized distribution bundle:
```bash
npm run build
```
