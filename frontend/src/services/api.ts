import axios from "axios";

const IS_DEV = (import.meta as any).env?.DEV === true;
const PROD_BASE = (import.meta as any).env?.VITE_API_URL || "";
const BASE_URL = IS_DEV ? "/api" : PROD_BASE;

const NORMALIZED_BASE = (BASE_URL || "").replace(/\/$/, "");

const api = axios.create({
  baseURL: NORMALIZED_BASE || undefined,
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

export function clearAuthToken() {
  try {
    if (typeof window !== "undefined") localStorage.removeItem("token");
  } catch {}
  delete api.defaults.headers.common["Authorization"];
}

const existingToken =
  typeof window !== "undefined" ? localStorage.getItem("token") : null;

if (existingToken) setAuthToken(existingToken);

api.interceptors.request.use((config) => {
  try {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (token) {
      config.headers = config.headers || {};
      (config.headers as any).Authorization = `Bearer ${token}`;
    }
  } catch {}
  return config;
});

api.interceptors.response.use(
  (resp) => resp,
  (error) => {
    const status = error?.response?.status;
    if (status === 401) {
      clearAuthToken();
    }
    const data = error?.response?.data;
    const message = (data && typeof data.error === "string" ? data.error : undefined) || error?.message || "Request failed";
    return Promise.reject(Object.assign(new Error(message), { status }));
  }
);

// ---------------- HEALTH CHECK ----------------

export async function checkHealth(): Promise<boolean> {
  try {
    let healthUrl = "";
    if (IS_DEV) {
      healthUrl = "http://localhost:4000/health";
    } else if (NORMALIZED_BASE) {
      healthUrl = `${NORMALIZED_BASE.replace(/\/api$/, "")}/health`;
    } else {
      return false;
    }

    const r = await axios.get(healthUrl, { timeout: 8000 });
    return r.status === 200 && String(r.data).toLowerCase() === "ok";
  } catch {
    return false;
  }
}

export default api;
