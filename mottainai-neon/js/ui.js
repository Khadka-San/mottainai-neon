let toastStack = [];
function toast(msg, type = '', icon = '') {
  let stack = document.getElementById('toastStack');
  if (!stack) {
    stack = document.createElement('div');
    stack.id = 'toastStack';
    stack.className = 'toast-stack';
    document.body.appendChild(stack);
  }
  const el = document.createElement('div');
  el.className = 'toast ' + type;
  el.innerHTML = `${icon ? `<span class="ic">${icon}</span>` : ''}<span>${escapeHtml(msg)}</span>`;
  stack.appendChild(el);
  setTimeout(() => { el.style.opacity = '0'; el.style.transform = 'translateY(20px)'; }, 2200);
  setTimeout(() => el.remove(), 2600);
}

function escapeHtml(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

function placeholderImage(name) {
  const initial = (name || '?').charAt(0).toUpperCase();
  return `<div style="width:100%;height:100%;background:linear-gradient(135deg,var(--bg3),var(--bg2));display:flex;align-items:center;justify-content:center;font-size:48px;color:var(--accent);">${escapeHtml(initial)}</div>`;
}

function showModal(html) {
  const m = document.getElementById('modalBackdrop');
  m.innerHTML = `<div class="modal">${html}</div>`;
  m.classList.add('active');
}
function closeModal() { document.getElementById('modalBackdrop').classList.remove('active'); }

function formatTime(ts) {
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
function formatDate(ts) {
  const d = new Date(ts);
  return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function renderStars(rating) {
  const full = Math.round(rating);
  return `<span class="stars">${'★'.repeat(full)}${'☆'.repeat(5 - full)}</span>`;
}
