# FlyFast Client — Premium React Flight Portal

This is the React SPA frontend application for FlyFast, built on React 18, Vite, TypeScript, and Tailwind CSS. The interface features a clean user experience (UX), dark/light mode toggles, interactive flight selections, and printer-friendly boarding tickets.

---

## Key Features & Visual Design

### 1. Unified Spotlight Search
- Offers a simple search input fields as well as an **AI Super Search box**.
- Interprets natural query sentences (e.g. *"Fly to Mumbai next Monday"* or *"deals to BLR"*) using backend parsing, pre-populating dates/codes instantly, and redirecting passengers to matching selections.

### 2. Interactive Seating Layout
- Features a responsive flight seating map illustrating aisle divides, seat numbers (Rows 1-6, Columns A-F), and occupancy grids.
- Computes seat-specific pricing premiums in real-time (e.g., Business Class upgrades vs Economy seating options) alongside check-in baggage, hot meals, and insurance options.

### 3. Reusable Toast Notification Context
- Replaced traditional browser popups (`alert`) with a customizable React Toast Notification Context (`ToastContext`).
- Supports dismissible notifications (`success`, `error`, `warning`, `info`) complete with slide-in CSS micro-animations.

### 4. Printer-Friendly Boarding Passes
- Displays detailed, print-ready boarding passes complete with flight coordinates, passenger stubs, and CSS-drawn mock barcodes.
- Formatted with media print overrides (`print:hidden`), enabling users to trigger clean, high-fidelity ticket outputs directly from `window.print()`.

---

## Directory Structure

- **`/src/contexts`**: Core state managers (e.g. `ThemeContext` for dark/light themes, `ToastContext` for floating notifications).
- **`/src/components`**: Shared modular interfaces (AI chat models, flight search cards, loading indicators).
- **`/src/pages`**: Layout views (homepage, flight results, detail configurations, auth login/registrations, and active tickets).
- **`/src/services`**: Configuration files for data fetching, Axios wrapper settings, and response/token interceptors.

---

## Setup & Local Development

### Installation

1. Install project packages:
   ```bash
   npm install
   ```

2. Create custom configuration overrides (optional, defaults to local proxy rules in Vite configuration):
   Create `frontend/.env`:
   ```env
   VITE_API_URL="http://localhost:4000/api"
   ```

3. Initialize local development client:
   ```bash
   npm run dev
   ```
   Open your browser to `http://localhost:3000` (or the customized port listed in your terminal).

---

## Compiling & Validation Checks
```bash
# Typecheck TypeScript source
npm run typecheck

# Build optimized production bundle
npm run build
```
