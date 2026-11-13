// ===== App State =====
const STATE = {
  currentProduct: null,
  currentConversation: null,
  favorites: [],
  editing: null
};

// ===== Screen Navigation =====
function showScreen(name) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const el = document.getElementById('screen-' + name);
  if (el) el.classList.add('active');
  document.querySelectorAll('.nav-item').forEach(n => n.classList.toggle('active', n.dataset.screen === name));
  onScreenShow(name);
  window.scrollTo(0, 0);
}

function onScreenShow(name) {
  if (name === 'home') loadProducts();
  if (name === 'search') { loadProducts(); document.getElementById('searchInput')?.focus(); }
  if (name === 'cart') renderCart();
  if (name === 'account') renderAccount();
  if (name === 'upload') { if (!AUTH.require()) return; renderUploadForm(); }
  if (name === 'messages') renderMessagesScreen();
  if (name === 'admin') { if (!AUTH.isAdmin()) { showScreen('home'); return; } renderAdminSection('dashboard'); }
  if (name === 'eco') renderEcoScreen();
  if (name === 'orders') renderOrders();
  if (name === 'myListings') renderMyListings();
  if (name === 'favorites') renderFavorites();
  if (name === 'help') renderHelp();
  if (name === 'settings') {
    renderLanguageDropdown();
    renderThemeGrid();
    updateModeButtons();
  }
}

function renderCurrentScreen() {
  const active = document.querySelector('.screen.active');
  if (active) onScreenShow(active.id.replace('screen-', ''));
}

// ===== Startup =====
window.addEventListener('DOMContentLoaded', () => {
  loadTheme();
  loadMode();
  applyTranslations();
  if (AUTH.isSignedIn()) {
    showScreen('home');
  } else {
    showScreen('splash');
  }
  CART.updateBadge();
  loadFavorites();
  if (AUTH.isAdmin()) startAdminLink();
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
});

// ===== Admin Link =====
function startAdminLink() {
  if (document.getElementById('adminNavBtn')) return;
  const btn = document.createElement('button');
  btn.id = 'adminNavBtn'; btn.className = 'nav-item'; btn.dataset.screen = 'admin';
  btn.innerHTML = `<div class="ic">🖥️</div><div>${t('admin')}</div>`;
  btn.onclick = () => showScreen('admin');
  document.querySelector('.bottom-nav').appendChild(btn);
}

// ===== Auth =====
function setAuthTab(tab) {
  document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
  document.getElementById('tab-' + tab).classList.add('active');
  document.getElementById('signupForm').style.display = tab === 'signup' ? 'block' : 'none';
  document.getElementById('signinForm').style.display = tab === 'signin' ? 'block' : 'none';
}

async function doSignUp() {
  const name = document.getElementById('su_name').value.trim();
  const email = document.getElementById('su_email').value.trim();
  const password = document.getElementById('su_password').value;
  if (!name || !email || !password) return toast('Fill all fields', 'error', '⚠');
  const r = await api('auth/signup.php', 'POST', { name, email, password });
  if (!r.success) return toast(r.error, 'error', '⚠');
  AUTH.user = r.data.user; AUTH.save();
  toast('Welcome, ' + name + '!', 'success', '🎉');
  showScreen('home');
  if (AUTH.isAdmin()) startAdminLink();
}

async function doSignIn() {
  const email = document.getElementById('si_email').value.trim();
  const password = document.getElementById('si_password').value;
  if (!email || !password) return toast('Fill all fields', 'error', '⚠');
  const r = await api('auth/signin.php', 'POST', { email, password });
  if (!r.success) return toast(r.error, 'error', '⚠');
  AUTH.user = r.data.user; AUTH.save();
  toast('Welcome back!', 'success', '👋');
  showScreen('home');
  if (AUTH.isAdmin()) startAdminLink();
}

function doSignOut() {
  if (!confirm(t('confirm2'))) return;
  AUTH.signOut();
  CART.clear();
  toast('Signed out', 'success', '👋');
  showScreen('splash');
  // Remove admin button
  document.getElementById('adminNavBtn')?.remove();
}

// ===== Search & Filter =====
function onSearchInput(v) { FILTERS.search = v; loadProducts(); }

function selectCategory(c) {
  FILTERS.category = c;
  FILTERS.only_free = c === 'Free';
  if (c === 'Free') FILTERS.category = 'All';
  document.querySelectorAll('.cat-chip').forEach(x => x.classList.remove('active'));
  if (event && event.target) event.target.classList.add('active');
  loadProducts();
}

// ===== Cart =====
function renderCart() {
  const list = document.getElementById('cartList');
  if (!list) return;
  if (!CART.items.length) {
    list.innerHTML = `<div class="empty"><div class="ic">🛒</div>${t('cartEmpty')}</div>`;
  } else {
    list.innerHTML = CART.items.map(i => `
      <div class="cart-item">
        <div class="img">${i.images?.[0] ? `<img src="${escapeHtml(i.images[0])}">` : (i.name||'?').charAt(0).toUpperCase()}</div>
        <div class="info">
          <div class="product-name">${escapeHtml(i.name)}</div>
          <div class="product-price">¥${Number(i.price).toLocaleString()}</div>
        </div>
        <div class="qty-control">
          <button class="qty-btn" onclick="CART.dec(${i.id});renderCart();">−</button>
          <span>${i.quantity}</span>
          <button class="qty-btn" onclick="CART.inc(${i.id});renderCart();">+</button>
        </div>
        <button class="qty-btn" onclick="CART.remove(${i.id});renderCart();">🗑</button>
      </div>`).join('');
  }
  const sub = CART.subtotal();
  const disc = CART.discount();
  const tot = CART.total();
  const subEl = document.getElementById('cartSubtotal');
  const discEl = document.getElementById('cartDiscount');
  const totEl = document.getElementById('cartTotal');
  const ptsEl = document.getElementById('cartPoints');
  if (subEl) subEl.textContent = '¥' + sub.toLocaleString();
  if (discEl) discEl.textContent = '-¥' + disc.toLocaleString();
  if (totEl) totEl.textContent = '¥' + tot.toLocaleString();
  if (ptsEl) ptsEl.textContent = '+' + CART.points() + ' ' + t('points');
  const couponEl = document.getElementById('couponStatus');
  if (couponEl) {
    couponEl.innerHTML = CART.coupon
      ? `<div class="coupon-card"><div><div style="font-size:11px;color:var(--muted)">${t('coupon')}</div><div class="coupon-code">${escapeHtml(CART.coupon.code)}</div></div><div style="color:var(--success);font-weight:700">-${CART.coupon.discount_percent}%</div><button class="btn btn-small btn-ghost" onclick="CART.coupon=null;CART.save();renderCart()">×</button></div>`
      : `<div class="coupon-card"><input id="couponInput" class="input" placeholder="${t('coupon')}" style="margin:0"><button class="btn btn-primary btn-small" onclick="applyCoupon()">${t('applyCoupon')}</button></div>`;
  }
}

async function doCheckout() {
  if (!AUTH.require()) return;
  if (!CART.items.length) return toast(t('cartEmpty'), 'error', '🛒');
  
  const address = localStorage.getItem('mn_addr_' + AUTH.user.id) || '';
  const payment = localStorage.getItem('mn_pay_' + AUTH.user.id) || 'PayPay';
  
  const r = await api('orders/create.php', 'POST', {
    user_id: AUTH.user.id,
    items: CART.items,
    shipping_address: address,
    payment_method: payment,
    total: CART.total(),
    discount: CART.discount(),
    coupon_code: CART.coupon?.code || ''
  });
  
  if (!r.success) return toast(r.error, 'error', '⚠');
  
  // ✅ Show payment confirmation modal
  showPaymentConfirmation(r.data.order_id, payment, r.data.points_awarded);
}

// ===== Payment Confirmation Flow =====
function showPaymentConfirmation(orderId, paymentMethod, points) {
  const total = CART.total();
  const paymentIcons = {
    'PayPay': '💳', 'Apple Pay': '🍎', 'Konbini': '🏪',
    'Credit Card': '💳', 'Bank Transfer': '🏦', 'Cash on Pickup': '💵'
  };
  const icon = paymentIcons[paymentMethod] || '💳';
  
  showModal(`
    <div style="text-align:center;padding:20px 0">
      <div style="font-size:60px;margin-bottom:16px">${icon}</div>
      <h3 style="margin-bottom:8px">Confirm Payment</h3>
      <p style="color:var(--muted);margin-bottom:20px">Pay with <strong>${escapeHtml(paymentMethod)}</strong></p>
      
      <div style="background:var(--bg3);padding:16px;border-radius:12px;margin-bottom:16px">
        <div style="color:var(--muted);font-size:12px;margin-bottom:4px">Total Amount</div>
        <div style="font-size:32px;font-weight:800;color:var(--accent)">¥${total.toLocaleString()}</div>
      </div>
      
      <div style="background:linear-gradient(90deg, color-mix(in srgb, var(--success) 15%, transparent), transparent);border:1px solid var(--success);border-radius:10px;padding:12px;margin-bottom:20px">
        <div style="color:var(--success);font-size:13px">You'll earn <strong>+${points} ${t('points')}</strong></div>
      </div>
      
      <div style="display:flex;flex-direction:column;gap:8px">
        <button class="btn btn-primary btn-full" onclick="processPayment(${orderId}, '${escapeHtml(paymentMethod)}', ${points})">
          ✓ Confirm & Pay
        </button>
        <button class="btn btn-secondary btn-full" onclick="cancelCheckout(${orderId})">
          ✕ Cancel
        </button>
      </div>
      
      <p style="color:var(--muted);font-size:11px;margin-top:16px">
        <strong>Demo Mode:</strong> No real charge will be made.<br>
        In production, this would redirect to ${escapeHtml(paymentMethod)}.
      </p>
    </div>
  `);
}

async function processPayment(orderId, paymentMethod, points) {
  toast('Processing payment...', '', '⏳');
  
  // Simulate 1.5 second payment delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Mark order as Paid
  const r = await api('orders/updateStatus.php', 'POST', {
    id: orderId,
    status: 'Paid',
    payment_method: paymentMethod
  });
  
  if (r.success) {
    // Update user points
    AUTH.user.mottainai_points = (AUTH.user.mottainai_points || 0) + points;
    AUTH.save();
    
    CART.clear();
    renderCart();
    closeModal();
    
    toast(`✅ Payment successful via ${paymentMethod}! +${points} ${t('points')}`, 'success', '🎉');
    showScreen('orders');
  } else {
    toast('Payment failed: ' + r.error, 'error', '⚠');
  }
}

async function cancelCheckout(orderId) {
  if (!confirm('Cancel this order?')) return;
  await api('orders/updateStatus.php', 'POST', { id: orderId, status: 'Cancelled' });
  closeModal();
  toast('Order cancelled', 'info', 'ℹ');
}




const PAYMENT_METHODS = [
  { id: 'PayPay', label: 'PayPay', icon: '💳' },
  { id: 'Apple Pay', label: 'Apple Pay', icon: '🍎' },
  { id: 'Konbini', label: 'Konbini Pay', icon: '🏪' },
  { id: 'Credit Card', label: 'Credit Card', icon: '💳' },
  { id: 'Bank Transfer', label: 'Bank Transfer', icon: '🏦' },
  { id: 'Cash on Pickup', label: 'Cash on Pickup', icon: '💵' }
];

function showPaymentPicker() {
  if (!AUTH.isSignedIn()) return toast(t('loginRequired'), 'error', '🔒');
  const current = localStorage.getItem('mn_pay_' + AUTH.user.id) || 'PayPay';
  showModal(`<h3>${t('selectPayment')}</h3>${PAYMENT_METHODS.map(p => `
    <div class="menu-item" onclick="localStorage.setItem('mn_pay_${AUTH.user.id}','${p.id}');closeModal();renderAccount();toast('${escapeHtml(p.label)} ✓','success','💳');">
      <div class="left"><span class="ic">${p.icon}</span>${escapeHtml(p.label)}</div>
      <span>${current === p.id ? '✓' : ''}</span>
    </div>`).join('')}`);
}

function showAddressModal() {
  if (!AUTH.isSignedIn()) return toast(t('loginRequired'), 'error', '🔒');
  const cur = JSON.parse(localStorage.getItem('mn_addr_full_' + AUTH.user.id) || '{}');
  showModal(`
    <h3>${t('updateAddress')}</h3>
    <label>City</label>
    <select id="addr_city" class="select">
      ${['Tokyo','Osaka','Nagoya','Fukuoka','Sapporo','Kobe','Yokohama','Kyoto'].map(c => `<option ${cur.city===c?'selected':''}>${c}</option>`).join('')}
    </select>
    <label>${t('address')}</label>
    <input class="input" id="addr_line" value="${escapeHtml(cur.address_line || '')}" placeholder="Street, building...">
    <label>Postal Code</label>
    <input class="input" id="addr_zip" value="${escapeHtml(cur.postal_code || '')}">
    <button class="btn btn-primary btn-full" onclick="saveAddress()">${t('saveAddress')}</button>
  `);
}

async function saveAddress() {
  const city = document.getElementById('addr_city').value;
  const line = document.getElementById('addr_line').value;
  const zip = document.getElementById('addr_zip').value;
  await api('address/save.php', 'POST', { user_id: AUTH.user.id, address_line: line, city, postal_code: zip, country: 'Japan' });
  localStorage.setItem('mn_addr_full_' + AUTH.user.id, JSON.stringify({ address_line: line, city, postal_code: zip }));
  localStorage.setItem('mn_addr_' + AUTH.user.id, [line, city, zip].filter(Boolean).join(', '));
  toast(t('addressSaved'), 'success', '📍');
  closeModal();
  renderAccount();
}

// ===== Account =====
async function renderAccount() {
  const u = AUTH.user;
  const accName = document.getElementById('accountName');
  const accStatus = document.getElementById('accountStatus');
  const accAvatar = document.getElementById('accountAvatar');
  const accPoints = document.getElementById('accountPoints');
  const accLevel = document.getElementById('accountLevel');
  const accFavs = document.getElementById('accountFavs');
  const accAddr = document.getElementById('accountAddress');
  const accPay = document.getElementById('accountPay');
  
  if (accName) accName.textContent = u ? u.name : t('guest');
  if (accStatus) accStatus.textContent = u ? u.email : t('guest') + ' mode';
  if (accAvatar) accAvatar.textContent = u ? (u.avatar_initial || u.name.charAt(0)).toUpperCase() : '👤';
  if (accPoints) accPoints.textContent = u ? (u.mottainai_points || 0) : 0;
  if (accLevel) accLevel.innerHTML = u ? `<span class="level-badge ${u.level || 'Bronze'}">${u.level || 'Bronze'}</span>` : '';
  if (accFavs) accFavs.textContent = STATE.favorites.length;
  if (accAddr) accAddr.textContent = (u ? (localStorage.getItem('mn_addr_' + u.id) || '') : '') || t('noAddress');
  if (accPay) accPay.textContent = u ? (localStorage.getItem('mn_pay_' + u.id) || 'PayPay') : '—';
  
  const signinRow = document.getElementById('accountSigninRow');
  const signoutRow = document.getElementById('accountSignoutRow');
  if (signinRow) signinRow.style.display = u ? 'none' : 'flex';
  if (signoutRow) signoutRow.style.display = u ? 'flex' : 'none';
  
  if (u) {
    await renderMessagesScreen();
    const sr = await api(`stats/seller.php?user_id=${u.id}`);
    const accStats = document.getElementById('accountStats');
    if (accStats) {
      accStats.innerHTML = `
        <div class="admin-grid">
          <div class="admin-card"><div class="l">Listings</div><div class="v">${sr.data?.products || 0}</div></div>
          <div class="admin-card"><div class="l">Views</div><div class="v">${sr.data?.views || 0}</div></div>
          <div class="admin-card"><div class="l">Sold</div><div class="v">${sr.data?.sales || 0}</div></div>
          <div class="admin-card"><div class="l">Revenue</div><div class="v">¥${Number(sr.data?.revenue || 0).toLocaleString()}</div></div>
        </div>`;
    }
  }
}

// ===== Upload =====
let uploadImages = [];

function renderUploadForm(p = null) {
  STATE.editing = p;
  document.getElementById('uploadName').value = p?.name || '';
  document.getElementById('uploadPrice').value = p?.price || '';
  document.getElementById('uploadOriginal').value = p?.original_price || '';
  document.getElementById('uploadCategory').value = p?.category || 'Electronics';
  document.getElementById('uploadCondition').value = p?.condition_label || 'Used';
  document.getElementById('uploadDescription').value = p?.description || '';
  document.getElementById('uploadLocation').value = p?.location || 'Tokyo';
  document.getElementById('uploadFree').checked = p?.is_free == 1;
  document.getElementById('uploadEco').checked = p?.is_eco == 1;
  uploadImages = p?.images || [];
  renderUploadGallery();
  document.getElementById('uploadTitle').textContent = p ? t('editProduct') : t('addProduct');
}

function renderUploadGallery() {
  const gallery = document.getElementById('uploadGallery');
  const preview = document.getElementById('uploadPreview');
  if (gallery) {
    gallery.innerHTML = uploadImages.map((src, i) => `
      <div class="image-thumb" style="position:relative">
        <img src="${escapeHtml(src)}">
        <span class="remove" onclick="uploadImages.splice(${i},1);renderUploadGallery()">×</span>
      </div>
    `).join('') + (uploadImages.length < 5 ? `
      <div class="image-thumb" style="display:flex;align-items:center;justify-content:center;font-size:24px;color:var(--muted);border:2px dashed var(--border)" onclick="document.getElementById('uploadFile').click()">+</div>
    ` : '');
  }
  if (preview) {
    if (uploadImages[0]) preview.innerHTML = `<img src="${escapeHtml(uploadImages[0])}">`;
    else preview.innerHTML = `<div style="text-align:center"><div style="font-size:32px">📷</div>${t('uploadImage')}</div>`;
  }
}

function onUploadImage(e) {
  const files = Array.from(e.target.files || []);
  files.forEach(f => {
    if (uploadImages.length >= 5) return;
    const r = new FileReader();
    r.onload = ev => { uploadImages.push(ev.target.result); renderUploadGallery(); };
    r.readAsDataURL(f);
  });
  e.target.value = '';
}

function dataURLtoFile(dataurl, filename) {
  const arr = dataurl.split(',');
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) u8arr[n] = bstr.charCodeAt(n);
  return new File([u8arr], filename, { type: mime });
}

async function saveProduct() {
  const name = document.getElementById('uploadName').value.trim();
  if (!name) return toast('Name required', 'error', '⚠');
  
  toast('Uploading images...', '', '⏳');
  const urls = [];
  for (const src of uploadImages) {
    if (src.startsWith('data:')) {
      const file = dataURLtoFile(src, 'image.jpg');
      const url = await uploadFile(file);
      if (url) urls.push(url);
    } else {
      urls.push(src);
    }
  }
  
  const body = {
    user_id: AUTH.user.id,
    name,
    price: Number(document.getElementById('uploadPrice').value || 0),
    original_price: Number(document.getElementById('uploadOriginal').value || 0),
    category: document.getElementById('uploadCategory').value,
    condition_label: document.getElementById('uploadCondition').value,
    description: document.getElementById('uploadDescription').value,
    location: document.getElementById('uploadLocation').value,
    is_free: document.getElementById('uploadFree').checked ? 1 : 0,
    is_eco: document.getElementById('uploadEco').checked ? 1 : 0,
    images: urls
  };
  
  let r;
  if (STATE.editing) {
    body.id = STATE.editing.id;
    r = await api('products/update.php', 'POST', body);
  } else {
    r = await api('products/add.php', 'POST', body);
  }
  
  if (!r.success) return toast(r.error, 'error', '⚠');
  toast(STATE.editing ? t('productUpdated') : t('productAdded'), 'success', '✅');
  STATE.editing = null;
  uploadImages = [];
  showScreen('home');
}

async function deleteProduct(id) {
  if (!confirm(t('confirmDelete'))) return;
  const r = await api('products/delete.php', 'POST', { user_id: AUTH.user.id, id });
  if (r.success) {
    toast(t('productDeleted'), 'success', '🗑');
    renderMyListings();
  }
}

async function renderMyListings() {
  if (!AUTH.require()) return;
  const r = await api(`products/myProducts.php?user_id=${AUTH.user.id}`);
  const list = document.getElementById('myListingsList');
  const prods = r.data?.products || [];
  if (!prods.length) {
    list.innerHTML = `<div class="empty"><div class="ic">📦</div>${t('noListings')}</div>`;
    return;
  }
  list.innerHTML = prods.map(p => `
    <div class="card" style="margin-bottom:8px;display:flex;gap:10px;align-items:center">
      <div style="width:60px;height:60px;background:var(--bg3);border-radius:8px;overflow:hidden;flex-shrink:0">${p.images?.[0] ? `<img src="${escapeHtml(p.images[0])}" style="width:100%;height:100%;object-fit:cover">` : (p.name||'?').charAt(0)}</div>
      <div style="flex:1;min-width:0">
        <div style="font-weight:600">${escapeHtml(p.name)}</div>
        <div style="color:var(--accent);font-size:14px">${p.is_free == 1 ? t('free2') : '¥' + Number(p.price).toLocaleString()}</div>
      </div>
      <button class="btn btn-small btn-secondary" onclick='renderUploadForm(${JSON.stringify(p).replace(/'/g,"&apos;")})'>✏</button>
      <button class="btn btn-small btn-danger" onclick="deleteProduct(${p.id})">🗑</button>
    </div>`).join('');
}

// ===== Favorites =====
async function renderFavorites() {
  if (!AUTH.isSignedIn()) {
    document.getElementById('favoritesList').innerHTML = `<div class="empty">${t('onlySignedIn')}</div>`;
    return;
  }
  if (!STATE.favorites.length) {
    document.getElementById('favoritesList').innerHTML = `<div class="empty"><div class="ic">💔</div>No favorites</div>`;
    return;
  }
  const r = await api('products/get.php');
  const all = r.data?.products || [];
  const favs = all.filter(p => STATE.favorites.includes(Number(p.id)));
  document.getElementById('favoritesList').innerHTML = `<div class="product-grid">${favs.map(productCardHtml).join('')}</div>`;
}

// ===== Orders =====
async function renderOrders() {
  if (!AUTH.isSignedIn()) {
    document.getElementById('ordersList').innerHTML = `<div class="empty">${t('onlySignedIn')}</div>`;
    return;
  }
  const r = await api(`orders/get.php?user_id=${AUTH.user.id}`);
  const orders = r.data?.orders || [];
  const list = document.getElementById('ordersList');
  if (!orders.length) { 
    list.innerHTML = `<div class="empty"><div class="ic">📋</div>No orders yet</div>`; 
    return; 
  }
  
  const paymentIcons = {
    'PayPay': '💳', 'Apple Pay': '🍎', 'Konbini': '🏪',
    'Credit Card': '💳', 'Bank Transfer': '🏦', 'Cash on Pickup': '💵'
  };
  
  list.innerHTML = orders.map(o => {
    const payIcon = paymentIcons[o.payment_method] || '💳';
    return `
    <div class="card" style="margin-bottom:12px;overflow:hidden">
      <div style="display:flex;justify-content:space-between;align-items:center;padding-bottom:12px;border-bottom:1px solid var(--border)">
        <div>
          <strong style="font-size:15px">Order #${o.id}</strong>
          <div style="color:var(--muted);font-size:11px;margin-top:2px">${new Date(o.created_at).toLocaleString()}</div>
        </div>
        <span class="status-badge status-${o.status}">${o.status}</span>
      </div>
      
      <div style="padding:12px 0;display:flex;justify-content:space-between;align-items:center;background:var(--bg3);margin:0 -14px;padding:12px 14px">
        <div>
          <div style="color:var(--muted);font-size:11px">Payment Method</div>
          <div style="font-weight:600;margin-top:2px">${payIcon} ${escapeHtml(o.payment_method || 'Not selected')}</div>
        </div>
        <div style="text-align:right">
          <div style="color:var(--muted);font-size:11px">Total</div>
          <div style="font-weight:800;font-size:18px;color:var(--accent)">¥${Number(o.total_amount).toLocaleString()}</div>
        </div>
      </div>
      
      ${o.discount > 0 ? `
        <div style="padding:8px 0;font-size:13px;color:var(--success)">
          🎟️ Coupon "${escapeHtml(o.coupon_code || '')}" applied: -¥${Number(o.discount).toLocaleString()}
        </div>
      ` : ''}
      
      <div style="padding-top:12px;border-top:1px solid var(--border)">
        <div style="color:var(--muted);font-size:11px;margin-bottom:8px">Items (${o.items?.length || 0})</div>
        ${(o.items || []).map(i => `
          <div style="display:flex;gap:10px;align-items:center;padding:6px 0">
            <div style="width:40px;height:40px;border-radius:6px;background:var(--bg2);overflow:hidden;flex-shrink:0">
              ${i.product_image ? `<img src="${imgPath(i.product_image)}" style="width:100%;height:100%;object-fit:cover" onerror="this.style.display='none'">` : ''}
            </div>
            <div style="flex:1;font-size:13px">
              <div style="font-weight:600">${escapeHtml(i.product_name)}</div>
              <div style="color:var(--muted);font-size:11px">Qty: ${i.quantity} × ¥${Number(i.price).toLocaleString()}</div>
            </div>
            <div style="font-weight:600">¥${Number(i.price * i.quantity).toLocaleString()}</div>
          </div>
        `).join('')}
      </div>
      
      ${o.shipping_address ? `
        <div style="margin-top:12px;padding-top:12px;border-top:1px solid var(--border);font-size:12px;color:var(--muted)">
          📍 Ship to: ${escapeHtml(o.shipping_address)}
        </div>
      ` : ''}
      
      ${o.status === 'Paid' ? `
        <div style="margin-top:12px;padding:10px;background:linear-gradient(90deg, color-mix(in srgb, var(--success) 15%, transparent), transparent);border-radius:8px;font-size:12px;color:var(--success)">
          ✅ Payment received! Your order is being processed.
        </div>
      ` : ''}
      
      ${o.status === 'Shipped' ? `
        <div style="margin-top:12px;padding:10px;background:linear-gradient(90deg, color-mix(in srgb, var(--accent) 15%, transparent), transparent);border-radius:8px;font-size:12px;color:var(--accent)">
          🚚 Your order is on the way!
        </div>
      ` : ''}
      
      ${o.status === 'Delivered' ? `
        <div style="margin-top:12px;padding:10px;background:linear-gradient(90deg, color-mix(in srgb, var(--success) 15%, transparent), transparent);border-radius:8px;font-size:12px;color:var(--success)">
          🎉 Delivered! Enjoy your purchase.
        </div>
      ` : ''}
    </div>
    `;
  }).join('');
}


// ===== Eco =====
async function renderEcoScreen() {
  const data = [
    { city: 'Tokyo', count: 240 }, { city: 'Osaka', count: 187 }, { city: 'Nagoya', count: 154 },
    { city: 'Fukuoka', count: 98 }, { city: 'Sapporo', count: 76 }, { city: 'Kobe', count: 65 }
  ];
  const max = Math.max(...data.map(d => d.count));
  const heatmap = document.getElementById('heatmap');
  if (heatmap) {
    heatmap.innerHTML = `
      <h3>${t('heatmap')}</h3>
      ${data.map(d => `
        <div class="heatmap-bar">
          <div style="display:flex;justify-content:space-between"><strong>${d.city}</strong><span>${d.count}</span></div>
          <div class="heatmap-fill" style="width:${(d.count / max) * 100}%"></div>
        </div>`).join('')}
    `;
  }
  const items = JSON.parse(localStorage.getItem('mn_eco_items') || '["🌱","🪴","♻️"]');
  const ecoHome = document.getElementById('ecoHome');
  if (ecoHome) {
    ecoHome.innerHTML = `
      <h3 style="margin:16px 0 10px">${t('ecoHome')}</h3>
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;text-align:center">
        ${['🌱','🪴','🌳','♻️','🌻','🍀','🌷','🌿'].map(e => {
          const owned = items.includes(e);
          return `<div class="card" style="padding:20px;font-size:28px;opacity:${owned?1:0.3}">${e}</div>`;
        }).join('')}
      </div>
      <p style="color:var(--muted);font-size:12px;margin-top:8px">Earn eco items by reusing and giving away!</p>
    `;
  }
}

// ===== Help =====
function renderHelp() {
  const faqs = [
    { q: 'How do I sell an item?', a: 'Sign in, go to Sell, fill in details, upload photos, and submit.' },
    { q: 'How do points work?', a: 'Earn 1 point for every ¥10 spent. Higher levels unlock more perks.' },
    { q: 'What is Mottainai?', a: 'A Japanese concept meaning "what a waste!" — we encourage reuse to reduce waste.' },
    { q: 'How do I contact a seller?', a: 'Open any product and tap "Contact Seller" to start a chat.' },
    { q: 'Is my data safe?', a: 'Yes. We use encrypted passwords and never share personal info.' }
  ];
  const helpList = document.getElementById('helpList');
  if (helpList) {
    helpList.innerHTML = faqs.map(f => `
      <div class="faq-item" onclick="this.classList.toggle('open')">
        <div class="faq-q">${escapeHtml(f.q)} <span class="arrow">▼</span></div>
        <div class="faq-a">${escapeHtml(f.a)}</div>
      </div>
    `).join('');
  }
}

// ===== Settings =====
function toggleSetting(k) {
  const cur = JSON.parse(localStorage.getItem('mn_settings') || '{}');
  cur[k] = !cur[k];
  localStorage.setItem('mn_settings', JSON.stringify(cur));
  if (k === 'compact') document.body.classList.toggle('compact', cur[k]);
  if (event && event.target) event.target.classList.toggle('on', cur[k]);
}

function loadSettings() {
  const cur = JSON.parse(localStorage.getItem('mn_settings') || '{}');
  document.querySelectorAll('.switch').forEach(s => {
    const k = s.dataset.key;
    if (cur[k]) s.classList.add('on');
  });
  if (cur.compact) document.body.classList.add('compact');
}

// ===== Theme Grid =====
function renderThemeGrid() {
  const grid = document.getElementById('themeGrid');
  if (!grid) return;
  const current = localStorage.getItem('mn_theme') || 'cyan';
  grid.innerHTML = Object.keys(THEMES).map(theme => `
    <div class="theme-swatch ${theme} ${current === theme ? 'active' : ''}"
         data-theme="${theme}"
         onclick="setTheme('${theme}');renderThemeGrid();"
         title="${THEMES[theme].name}"></div>
  `).join('');
}

// ===== Language Dropdown =====
function renderLanguageDropdown() {
  const flag = document.getElementById('langFlag');
  const name = document.getElementById('langName');
  const code = document.getElementById('langCode');
  if (!flag) return;
  const lang = LANGUAGES[currentLang] || LANGUAGES.en;
  flag.textContent = lang.flag;
  name.textContent = lang.name;
  code.textContent = lang.code;
  renderLangOptions();
}

function renderLangOptions(filter = '') {
  const wrap = document.getElementById('langOptions');
  if (!wrap) return;
  const q = filter.toLowerCase().trim();
  const filtered = Object.entries(LANGUAGES).filter(([code, lang]) =>
    !q || lang.name.toLowerCase().includes(q) || code.toLowerCase().includes(q)
  );
  wrap.innerHTML = filtered.map(([code, lang]) => `
    <div class="lang-option ${currentLang === code ? 'active' : ''}" onclick="selectLanguage('${code}')">
      <span class="flag">${lang.flag}</span>
      <span class="name">${lang.name}</span>
      <span class="check">✓</span>
    </div>
  `).join('');
  if (!filtered.length) {
    wrap.innerHTML = '<div style="padding:12px;text-align:center;color:var(--muted);font-size:12px">No match</div>';
  }
}

function selectLanguage(code) {
  setLang(code);
  renderLanguageDropdown();
  const dd = document.getElementById('langDropdown');
  if (dd) dd.classList.remove('open');
}

function toggleLangDropdown(e) {
  if (e) e.stopPropagation();
  const dd = document.getElementById('langDropdown');
  if (dd) dd.classList.toggle('open');
  if (dd && dd.classList.contains('open')) {
    setTimeout(() => document.getElementById('langSearch')?.focus(), 100);
  }
}

function filterLanguages(q) {
  renderLangOptions(q);
}

document.addEventListener('click', (e) => {
  const dd = document.getElementById('langDropdown');
  if (dd && !dd.contains(e.target)) dd.classList.remove('open');
});

// ===== Mode Buttons Update =====
function updateModeButtons() {
  const mode = localStorage.getItem('mn_mode') || 'dark';
  document.querySelectorAll('.mode-btn').forEach(b => {
    b.classList.toggle('active', b.getAttribute('data-mode') === mode);
  });
}
