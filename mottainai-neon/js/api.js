// ===== API Client (AUTO-DETECTS CORRECT PATH) =====
function getApiBase() {
  // Get the current URL path
  const path = window.location.pathname;
  console.log('📍 Current path:', path);
  
  // Find the project folder name from the URL
  // Examples:
  //   /mottainai-neon/ -> "mottainai-neon"
  //   /myapp/index.html -> "myapp"
  //   / -> "" (root)
  const segments = path.split('/').filter(s => s && !s.includes('.html'));
  
  if (segments.length > 0) {
    return window.location.origin + '/' + segments[0] + '/backend/api';
  }
  // If app is at root, use /backend/api
  return window.location.origin + '/backend/api';
}

const API_BASE = getApiBase();
console.log('🔗 API Base URL:', API_BASE);

async function api(path, method = 'GET', body = null) {
  const url = `${API_BASE}/${path}`;
  const opts = { 
    method, 
    headers: { 'Content-Type': 'application/json' }
  };
  if (body) opts.body = JSON.stringify(body);
  
  try {
    console.log('📡', method, url);
    const r = await fetch(url, opts);
    const text = await r.text();
    console.log('📥 Response:', text.substring(0, 300));
    
    try {
      return JSON.parse(text);
    } catch (e) {
      console.error('❌ Invalid JSON. Server returned:');
      console.error(text);
      return { 
        success: false, 
        error: 'Server error. Check XAMPP Apache is running and PHP files exist. Response: ' + text.substring(0, 100)
      };
    }
  } catch (e) {
    console.error('❌ Network error:', e);
    return { 
      success: false, 
      error: 'Network error: Cannot reach ' + url + '. Make sure: 1) XAMPP Apache is running 2) You opened the app from http://localhost/your-folder/' 
    };
  }
}

// File upload
async function uploadFile(file) {
  const fd = new FormData();
  fd.append('file', file);
  try {
    const r = await fetch(`${API_BASE}/upload.php`, { method: 'POST', body: fd });
    const data = await r.json();
    if (data.success) return data.data.url;
    if (typeof toast === 'function') toast(data.error || 'Upload failed', 'error', '⚠');
    return null;
  } catch (e) {
    console.error('Upload error:', e);
    if (typeof toast === 'function') toast('Upload failed: ' + e.message, 'error', '⚠');
    return null;
  }
}
