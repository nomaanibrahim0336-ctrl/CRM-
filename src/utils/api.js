const BASE = import.meta.env.VITE_API_URL || 'https://crm-production-eb0c.up.railway.app';

const getToken = () => localStorage.getItem('crm_token');

const req = async (method, path, body) => {
  const opts = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
    },
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${BASE}${path}`, opts);
  const text = await res.text();
  try { return JSON.parse(text); } catch { throw new Error(`Server error (${res.status})`); }
};

export const api = {
  get:    (path)        => req('GET',    path),
  post:   (path, body)  => req('POST',   path, body),
  put:    (path, body)  => req('PUT',    path, body),
  delete: (path)        => req('DELETE', path),
};

export default api;
