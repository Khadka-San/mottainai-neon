// ===== Admin Auth =====
const ADMIN_TOKEN_KEY = 'mn_admin_token';
const ADMIN_USER_KEY = 'mn_admin_user';

function isAdminLoggedIn() {
  return !!localStorage.getItem(ADMIN_TOKEN_KEY);
}

async function adminLogin(email, password) {
  const r = await adminApi('auth/signin.php', 'POST', { email, password });
  if (r.success && r.data.user.is_admin === 1) {
    localStorage.setItem(ADMIN_TOKEN_KEY, JSON.stringify({ ...r.data.user, ts: Date.now() }));
    localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(r.data.user));
    return { success: true };
  } else if (r.success) {
    return { success: false, error: 'Access denied: Admin privileges required' };
  }
  return r;
}

function adminLogout() {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
  localStorage.removeItem(ADMIN_USER_KEY);
  window.location.href = 'login.html';
}

function getAdminUser() {
  return JSON.parse(localStorage.getItem(ADMIN_USER_KEY) || 'null');
}
