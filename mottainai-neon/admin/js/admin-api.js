// ===== Admin API Client =====
const ADMIN_API_BASE = (() => {
  const segments = window.location.pathname.split('/').filter(s => s && !s.includes('.html'));
  const folder = segments[0] || '';
  return window.location.origin + '/' + folder + '/backend/api';
})();

async function adminApi(path, method = 'GET', body = null) {
  const url = `${ADMIN_API_BASE}/${path}`;
  const opts = { method, headers: { 'Content-Type': 'application/json' } };
  if (body) opts.body = JSON.stringify(body);
  
  try {
    const r = await fetch(url, opts);
    const text = await r.text();
    try { return JSON.parse(text); }
    catch (e) { return { success: false, error: 'Invalid response: ' + text.substring(0, 100) }; }
  } catch (e) {
    return { success: false, error: 'Network error: ' + e.message };
  }
}

async function adminUploadFile(file) {
  const fd = new FormData();
  fd.append('file', file);
  try {
    const r = await fetch(`${ADMIN_API_BASE}/upload.php`, { method: 'POST', body: fd });
    return await r.json();
  } catch (e) {
    return { success: false, error: e.message };
  }
}
