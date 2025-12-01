// assets/js/api.js
// Simple API client for FreeMart frontend -> custom backend
// Uses JWT stored in localStorage under key 'freemart_token'
// All responses expected in JSON. Errors thrown will contain `message` where possible.

const API_BASE = window.__API_BASE__ || (window.location.origin + '/api'); // set from server or defaults

const TOKEN_KEY = 'freemart_token';
const USER_KEY = 'freemart_user';

async function fetchJSON(url, opts = {}) {
  const headers = opts.headers || {};
  headers['Accept'] = 'application/json';
  if (!opts.body && opts.method && opts.method !== 'GET' && opts.body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }
  opts.headers = headers;

  const res = await fetch(url, opts);
  const contentType = res.headers.get('content-type') || '';
  let payload = null;
  if (contentType.includes('application/json')) {
    payload = await res.json();
  } else {
    payload = await res.text();
  }
  if (!res.ok) {
    const err = new Error(payload && payload.message ? payload.message : 'Request failed');
    err.status = res.status;
    err.payload = payload;
    throw err;
  }
  return payload;
}

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}
function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}
function setUser(user) {
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
  else localStorage.removeItem(USER_KEY);
}
function getUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY));
  } catch (e) {
    return null;
  }
}

function authHeaders() {
  const token = getToken();
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

/* ----- Public API methods ----- */

const api = {
  // Auth
  async login(email, password) {
    const url = `${API_BASE}/auth/login`;
    const payload = await fetchJSON(url, {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    if (payload && payload.token) {
      setToken(payload.token);
      if (payload.user) setUser(payload.user);
    }
    return payload;
  },

  async register(payloadObj) {
    const url = `${API_BASE}/auth/register`;
    const payload = await fetchJSON(url, {
      method: 'POST',
      body: JSON.stringify(payloadObj)
    });
    if (payload && payload.token) {
      setToken(payload.token);
      if (payload.user) setUser(payload.user);
    }
    return payload;
  },

  async logout() {
    // optionally call backend logout endpoint
    setToken(null);
    setUser(null);
    return { ok: true };
  },

  // Feed (contacts)
  async getContactsFeed() {
    const url = `${API_BASE}/feed/contacts`;
    return fetchJSON(url, { headers: authHeaders() });
  },

  // Search: /search?type=product&q=...
  // type: product | service | job | person
  async search(type, q, opts = {}) {
    const params = new URLSearchParams();
    if (type) params.set('type', type);
    if (q) params.set('q', q);
    if (opts.town) params.set('town', opts.town); // optional locality filter
    const url = `${API_BASE}/search?${params.toString()}`;
    return fetchJSON(url, { headers: authHeaders() });
  },

  // Promotional posts
  async getPromos(q) {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    const url = `${API_BASE}/promos?${params.toString()}`;
    return fetchJSON(url, { headers: authHeaders() });
  },

  // Get current authenticated user (from token)
  async me() {
    const url = `${API_BASE}/auth/me`;
    return fetchJSON(url, { headers: authHeaders() });
  }
};

export { api, getToken, setToken, getUser, setUser };