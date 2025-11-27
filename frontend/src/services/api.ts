import axios from "axios";

const api = axios.create({
  baseURL: (import.meta as any).env?.VITE_API_URL || "/api",
  timeout: 15000
});

export function setAuthToken(token: string | null) {
  if (token) api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  else delete api.defaults.headers.common["Authorization"];
}

export async function checkHealth(): Promise<boolean> {
  try {
    const base: string = (import.meta as any).env?.VITE_API_URL || "/api";
    const url = base.endsWith("/api") ? base.replace(/\/api$/, "") + "/health" : "/health";
    const r = await axios.get(url, { timeout: 5000 });
    return r.status === 200 && String(r.data).toLowerCase() === "ok";
  } catch {
    return false;
  }
}

export default api;
