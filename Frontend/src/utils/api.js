const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, "");

// In development, Vite proxies /api to the local Express server. In production,
// VITE_API_BASE_URL must be the public Express API URL, including `/api`.
const apiBaseUrl = configuredApiBaseUrl || "/api";

export const apiUrl = (path) => `${apiBaseUrl}/${path.replace(/^\/+/, "")}`;
