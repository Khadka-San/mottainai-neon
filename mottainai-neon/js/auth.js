const AUTH = {
  user: JSON.parse(localStorage.getItem('mn_user') || 'null'),
  save() { localStorage.setItem('mn_user', JSON.stringify(this.user)); },
  isSignedIn() { return !!this.user; },
  isAdmin() { return this.user && this.user.is_admin === 1; },
  signOut() { this.user = null; localStorage.removeItem('mn_user'); localStorage.removeItem('mn_cart'); },
  require() {
    if (!this.isSignedIn()) { toast(t('loginRequired'), 'error', '🔒'); showScreen('auth'); return false; }
    return true;
  }
};
