// services/api.ts - fetch wrapper usando VITE_API_URL
const API = (path, opts={}) => {
  const base = import.meta.env.VITE_API_URL || "";
  const url = base.replace(/\/$/, "") + "/" + path.replace(/^\//, "");
  return fetch(url, opts).then(async res => {
    const text = await res.text();
    try { const json = JSON.parse(text); return { ok: res.ok, status: res.status, data: json }; }
    catch(e) { return { ok: res.ok, status: res.status, data: text }; }
  });
};
export default API;
