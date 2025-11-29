import axios from "axios";

// Use VITE_API_URL or proxy "/api"
const BASE_URL = (import.meta as any).env?.VITE_API_URL || "/api";

const api = axios.create({
  baseURL: BASE_URL.replace(/$/, ""), // <-- remove trailing slash for safety
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
    // If using "/api", health must hit "/health" so Vite proxy works
    const url = BASE_URL.startsWith("/api")
      ? "/health"
      : `${BASE_URL.replace(/\/$/, "")}/health`;

    const r = await axios.get(url, { timeout: 5000 });

    return r.status === 200 && String(r.data).toLowerCase() === "ok";
  } catch {
    return false;
  }
}

export default api;
