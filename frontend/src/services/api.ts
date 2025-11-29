import axios from "axios";

// Use VITE_API_URL or "/api" (local dev proxy)
const BASE_URL = (import.meta as any).env?.VITE_API_URL || "/api";

// Remove trailing slash for safety
const NORMALIZED_BASE = BASE_URL.replace(/\/$/, "");

const api = axios.create({
  baseURL: NORMALIZED_BASE,
  timeout: 15000,
});

// ---------------- AUTH TOKEN ----------------

export function setAuthToken(token: string | null) {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
}

const existingToken =
  typeof window !== "undefined" ? localStorage.getItem("token") : null;

if (existingToken) setAuthToken(existingToken);

// ---------------- HEALTH CHECK ----------------

export async function checkHealth(): Promise<boolean> {
  try {
    const url =
      NORMALIZED_BASE === "/api"
        ? "/health" // vite proxy → local
        : "/health"; // production (baseURL already used)

    // Use axios instance, not axios global
    const r = await api.get(url);

    return r.status === 200 && String(r.data).toLowerCase() === "ok";
  } catch {
    return false;
  }
}

export default api;
