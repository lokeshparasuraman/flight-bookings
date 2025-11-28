import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "/api";

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000
});

export function setAuthToken(token: string | null) {
  if (token) api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  else delete api.defaults.headers.common["Authorization"];
}

const existingToken = typeof window !== "undefined" ? localStorage.getItem("token") : null;
if (existingToken) setAuthToken(existingToken);

export async function checkHealth(): Promise<boolean> {
  try {
    const rootURL = BASE_URL.replace(/\/api$/, "");   // works for both absolute & relative
    const url = `${rootURL}/health`;

    const r = await axios.get(url, { timeout: 5000 });
    return r.status === 200 && String(r.data).toLowerCase() === "ok";
  } catch {
    return false;
  }
}

export default api;
