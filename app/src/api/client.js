const API_BASE = "http://localhost:8000/api/v1";

let _token = null;
let _refreshToken = null;

export function setTokens(access, refresh) {
  _token = access;
  _refreshToken = refresh;
}

export function getToken() {
  return _token;
}

export function getRefreshToken() {
  return _refreshToken;
}

export async function api(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const headers = { "Content-Type": "application/json", ...options.headers };
  if (_token) headers["Authorization"] = `Bearer ${_token}`;
  const res = await fetch(url, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.detail || data.message || `Error ${res.status}`);
  return data;
}

export async function apiMultipart(path, formData) {
  const url = `${API_BASE}${path}`;
  const headers = {};
  if (_token) headers["Authorization"] = `Bearer ${_token}`;
  const res = await fetch(url, { method: "POST", headers, body: formData });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.detail || data.message || `Error ${res.status}`);
  return data;
}

export default api;
