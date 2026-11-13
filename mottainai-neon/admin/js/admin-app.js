// ===== Mottainai Neon Admin — Complete App (FIXED) =====
let currentPage = 'dashboard';
let dashboardData = { stats: {}, orders: [], products: [], users: [], conversations: [] };
let allProducts = [];
let allOrders = [];
let allUsers = [];
let allCategories = [];
let allConvs = [];
let messageFilter = { search: '', age: '' };
let productFilter = { search: '', category: '' };
let orderFilter = { search: '', status: '' };
let userFilter = { search: '', level: '', activity: '' };
let editingImages = [];

// ===== Init =====
function initAdmin() {
  const user = getAdminUser();
  if (user) {
    const nameEl = document.getElementById('adminName');
    const avatarEl = document.getElementById('adminAvatar');
    if (nameEl) nameEl.textContent = user.name;
    if (avatarEl) avatarEl.textContent = (user.avatar_initial || user.name.charAt(0)).toUpperCase();
  }
  showPage('dashboard');
}

function toggleSidebar() {
  document.getElementById('sidebar')?.classList.toggle('open');
}

function refreshPage() { showPage(currentPage); }
function adminLogout() { localStorage.clear(); window.location.href = 'login.html'; }

// ===== Page Router =====
const PAGE_TITLES = {
  dashboard: 'Dashboard', analytics: 'Analytics', products: 'Products', categories: 'Categories',
  reviews: 'Reviews', coupons: 'Coupons', orders: 'Orders', payments: 'Payments',
  users: 'Customers', messages: 'Messages', settings: 'Settings', maintenance: 'Maintenance',
  logs: 'Activity Logs', profile: 'My Profile'
};

function showPage(page) {
  currentPage = page;
  document.querySelectorAll('.nav-link').forEach(n => {
    if (n.dataset.page) n.classList.toggle('active', n.dataset.page === page);
  });
  if (window.innerWidth < 768) document.getElementById('sidebar')?.classList.remove('open');
  const titleEl = document.getElementById('pageTitle');
  if (titleEl) titleEl.textContent = PAGE_TITLES[page] || 'Dashboard';
  
  const renderers = {
    dashboard: renderDashboard, analytics: renderAnalytics, products: renderProducts,
    categories: renderCategories, reviews: renderReviews, coupons: renderCoupons,
    orders: renderOrders, payments: renderPayments, users: renderUsers,
    messages: renderMessages, settings: renderSettings, maintenance: renderMaintenance,
    logs: renderLogs, profile: renderProfile
  };
  if (renderers[page]) renderers[page]();
  else document.getElementById('pageContainer').innerHTML = '<div class="empty-state"><div class="ic">🚧</div><h3>Coming soon</h3></div>';
}

// ===== Helpers =====
function escapeHtml(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

function getStatusClass(status) {
  const s = (status || '').toLowerCase();
  if (s.includes('delivered') || s.includes('completed')) return 'badge-success';
  if (s.includes('shipped') || s.includes('processing')) return 'badge-info';
  if (s.includes('pending') || s.includes('paid')) return 'badge-warning';
  if (s.includes('cancel')) return 'badge-danger';
  return 'badge-default';
}

function adminToast(msg, type = '', icon = '') {
  const container = document.getElementById('toastContainer');
  if (!container) { console.log('Toast:', msg); return; }
  const el = document.createElement('div');
  el.className = 'toast ' + type;
  el.innerHTML = `${icon ? `<span>${icon}</span>` : ''}<span>${escapeHtml(msg)}</span>`;
  container.appendChild(el);
  setTimeout(() => el.remove(), 3000);
}

function showAdminModal(html) {
  const m = document.getElementById('modalBackdrop');
  const c = document.getElementById('modalContent');
  if (m && c) { c.innerHTML = html; m.classList.add('active'); }
}
function closeModal() { document.getElementById('modalBackdrop')?.classList.remove('active'); }

function imgPath(p) {
  if (!p) return '';
  if (p.startsWith('http') || p.startsWith('data:')) return p;
  if (p.startsWith('backend/')) return '../' + p;
  return '../' + p;
}

// ============================================
// DASHBOARD
// ============================================
async function renderDashboard() {
  const c = document.getElementById('pageContainer');
  c.innerHTML = '<div class="empty-state"><div class="ic">⏳</div>Loading...</div>';
  
  try {
    const [statsR, ordersR, productsR, usersR] = await Promise.all([
      adminApi('admin/stats.php'),
      adminApi('admin/orders.php'),
      adminApi('admin/products.php'),
      adminApi('admin/customers.php')
    ]);
    
    dashboardData.stats = statsR.data || {};
    dashboardData.orders = ordersR.data?.orders || [];
    dashboardData.products = productsR.data?.products || [];
    dashboardData.users = usersR.data?.customers || [];
    allProducts = dashboardData.products;
    allOrders = dashboardData.orders;
    allUsers = dashboardData.users;
    
    const pc = document.getElementById('productCount');
    const oc = document.getElementById('orderCount');
    const uc = document.getElementById('userCount');
    if (pc) pc.textContent = allProducts.length;
    if (oc) oc.textContent = allOrders.length;
    if (uc) uc.textContent = allUsers.length;
    
    const recentOrders = allOrders.slice(0, 5);
    const topProducts = [...allProducts].sort((a, b) => b.views - a.views).slice(0, 5);
    const today = new Date().toDateString();
    const todayRevenue = allOrders
      .filter(o => new Date(o.created_at).toDateString() === today)
      .reduce((s, o) => s + Number(o.total_amount), 0);
    
    c.innerHTML = `
      <div class="stats-grid">
        <div class="stat-card"><div class="ic">💰</div><div class="label">Total Revenue</div><div class="value">¥${Number(dashboardData.stats.revenue || 0).toLocaleString()}</div><div class="change up">+¥${todayRevenue.toLocaleString()} today</div></div>
        <div class="stat-card"><div class="ic">🛒</div><div class="label">Total Orders</div><div class="value">${dashboardData.stats.orders || 0}</div></div>
        <div class="stat-card"><div class="ic">👥</div><div class="label">Customers</div><div class="value">${dashboardData.stats.customers || 0}</div></div>
        <div class="stat-card"><div class="ic">📦</div><div class="label">Products</div><div class="value">${dashboardData.stats.products || 0}</div></div>
      </div>
      <div style="display:grid;grid-template-columns:2fr 1fr;gap:20px">
        <div class="panel">
          <div class="panel-header"><div class="panel-title">Recent Orders</div><a class="btn btn-sm btn-secondary" onclick="showPage('orders')">View All →</a></div>
          <div class="table-wrap">
            <table class="table">
              <thead><tr><th>Order ID</th><th>Customer</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead>
              <tbody>
                ${recentOrders.length ? recentOrders.map(o => `
                  <tr><td><strong>#${o.id}</strong></td><td>${escapeHtml(o.customer_name||'—')}</td><td><strong>¥${Number(o.total_amount).toLocaleString()}</strong></td><td><span class="badge-status ${getStatusClass(o.status)}">${o.status}</span></td><td>${new Date(o.created_at).toLocaleDateString()}</td></tr>
                `).join('') : '<tr><td colspan="5" style="text-align:center;padding:30px;color:var(--muted)">No orders yet</td></tr>'}
              </tbody>
            </table>
          </div>
        </div>
        <div class="panel">
          <div class="panel-header"><div class="panel-title">Top Products</div></div>
          ${topProducts.length ? topProducts.map(p => `
            <div style="display:flex;gap:10px;align-items:center;padding:8px 0;border-bottom:1px solid var(--border)">
              <div style="width:40px;height:40px;border-radius:6px;background:var(--bg3);overflow:hidden;flex-shrink:0">${p.images?.[0] ? `<img src="${imgPath(p.images[0])}" style="width:100%;height:100%;object-fit:cover">` : ''}</div>
              <div style="flex:1;min-width:0"><div style="font-weight:600;font-size:13px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${escapeHtml(p.name)}</div><div style="color:var(--muted);font-size:11px">${p.views||0} views</div></div>
              <div style="font-weight:700;color:var(--accent)">¥${Number(p.price).toLocaleString()}</div>
            </div>
          `).join('') : '<p style="color:var(--muted);text-align:center;padding:20px">No products</p>'}
        </div>
      </div>
    `;
  } catch (e) {
    c.innerHTML = `<div class="empty-state"><div class="ic">❌</div><h3>Failed to load</h3><p>${e.message}</p></div>`;
  }
}

// ============================================
// ANALYTICS
// ============================================
async function renderAnalytics() {
  const c = document.getElementById('pageContainer');
  c.innerHTML = '<div class="empty-state"><div class="ic">⏳</div>Loading...</div>';
  
  if (!allProducts.length) {
    const [p, o, u] = await Promise.all([
      adminApi('admin/products.php'),
      adminApi('admin/orders.php'),
      adminApi('admin/customers.php')
    ]);
    allProducts = p.data?.products || [];
    allOrders = o.data?.orders || [];
    allUsers = u.data?.customers || [];
  }
  
  const avgOrder = allOrders.length ? Math.round(allOrders.reduce((s,o)=>s+Number(o.total_amount),0)/allOrders.length) : 0;
  const conversion = allUsers.length ? ((allOrders.length / allUsers.length) * 100).toFixed(1) : 0;
  const avgRating = allProducts.length ? (allProducts.reduce((s,p)=>s+Number(p.rating_avg||0),0)/allProducts.length).toFixed(1) : 0;
  const totalViews = allProducts.reduce((s,p)=>s+Number(p.views||0),0);
  
  const byDay = {};
  allOrders.forEach(o => {
    const d = new Date(o.created_at).toLocaleDateString();
    byDay[d] = (byDay[d]||0) + Number(o.total_amount);
  });
  const days = Object.keys(byDay).slice(-7);
  const max = Math.max(...days.map(d => byDay[d]), 1);
  
  c.innerHTML = `
    <div class="stats-grid">
      <div class="stat-card"><div class="ic">📈</div><div class="label">Avg Order</div><div class="value">¥${avgOrder.toLocaleString()}</div></div>
      <div class="stat-card"><div class="ic">🎯</div><div class="label">Conversion</div><div class="value">${conversion}%</div></div>
      <div class="stat-card"><div class="ic">⭐</div><div class="label">Avg Rating</div><div class="value">${avgRating}</div></div>
      <div class="stat-card"><div class="ic">👁️</div><div class="label">Views</div><div class="value">${totalViews.toLocaleString()}</div></div>
    </div>
    <div class="panel">
      <div class="panel-header"><div class="panel-title">📊 Revenue Last 7 Days</div></div>
      <div class="bar-chart">
        ${days.length ? days.map(d => `
          <div style="flex:1;display:flex;flex-direction:column;align-items:center">
            <div class="bar" style="height:${(byDay[d]/max)*100}%" title="¥${byDay[d].toLocaleString()}"></div>
            <div class="bar-label">${d.split('/').slice(0,2).join('/')}</div>
          </div>
        `).join('') : '<p style="color:var(--muted);text-align:center;width:100%">No data</p>'}
      </div>
    </div>
  `;
}

// ============================================
// PRODUCTS
// ============================================
async function renderProducts() {
  const c = document.getElementById('pageContainer');
  c.innerHTML = '<div class="empty-state"><div class="ic">⏳</div>Loading products...</div>';
  
  const r = await adminApi('admin/products.php');
  allProducts = r.data?.products || [];
  renderProductsTable();
}

function renderProductsTable() {
  const c = document.getElementById('pageContainer');
  let filtered = allProducts;
  if (productFilter.search) {
    const q = productFilter.search.toLowerCase();
    filtered = filtered.filter(p => p.name.toLowerCase().includes(q) || (p.seller_name||'').toLowerCase().includes(q));
  }
  if (productFilter.category) filtered = filtered.filter(p => p.category === productFilter.category);
  
  const pc = document.getElementById('productCount');
  if (pc) pc.textContent = allProducts.length;
  
  c.innerHTML = `
    <div class="toolbar">
      <input class="search-input" placeholder="🔍 Search products..." oninput="productFilter.search=this.value;renderProductsTable()">
      <select class="filter-select" onchange="productFilter.category=this.value;renderProductsTable()">
        <option value="">All Categories</option>
        <option ${productFilter.category==='Electronics'?'selected':''}>Electronics</option>
        <option ${productFilter.category==='Fashion'?'selected':''}>Fashion</option>
        <option ${productFilter.category==='Furniture'?'selected':''}>Furniture</option>
        <option ${productFilter.category==='Books'?'selected':''}>Books</option>
        <option ${productFilter.category==='Toys'?'selected':''}>Toys</option>
        <option ${productFilter.category==='Other'?'selected':''}>Other</option>
      </select>
      <button class="btn btn-primary" onclick="showProductForm()">＋ Add Product</button>
    </div>
    <div class="panel">
      <div class="table-wrap">
        <table class="table">
          <thead><tr><th>Image</th><th>Name</th><th>Category</th><th>Price</th><th>Seller</th><th>Views</th><th>Rating</th><th>Actions</th></tr></thead>
          <tbody>
            ${filtered.length ? filtered.map(p => `
              <tr>
                <td><div style="width:50px;height:50px;border-radius:6px;background:var(--bg3);overflow:hidden">${p.images?.[0] ? `<img src="${imgPath(p.images[0])}" style="width:100%;height:100%;object-fit:cover" onerror="this.style.display='none'">` : ''}</div></td>
                <td><strong>${escapeHtml(p.name)}</strong>${p.is_free==1?'<br><span class="badge-status badge-success">FREE</span>':''}${p.is_eco==1?' <span class="badge-status badge-info">ECO</span>':''}</td>
                <td>${escapeHtml(p.category)}</td>
                <td><strong>¥${Number(p.price).toLocaleString()}</strong></td>
                <td>${escapeHtml(p.seller_name||'—')}</td>
                <td>${p.views||0}</td>
                <td>⭐ ${Number(p.rating_avg||0).toFixed(1)} (${p.rating_count||0})</td>
                <td class="actions">
                  <button class="btn btn-sm btn-secondary" onclick="viewProduct(${p.id})" title="View">👁</button>
                  <button class="btn btn-sm btn-warning" onclick="showProductForm(${p.id})" title="Edit">✏</button>
                  <button class="btn btn-sm btn-danger" onclick="deleteProduct(${p.id})" title="Delete">🗑</button>
                </td>
              </tr>
            `).join('') : '<tr><td colspan="8" style="text-align:center;padding:40px;color:var(--muted)">No products found</td></tr>'}
          </tbody>
        </table>
      </div>
      <div style="color:var(--muted);font-size:13px;margin-top:12px">Total: ${filtered.length} of ${allProducts.length} products</div>
    </div>
  `;
}

// ============================================
// PRODUCT FORM WITH IMAGE EDITING
// ============================================
function showProductForm(id = null) {
  const p = id ? allProducts.find(x => x.id === id) : null;
  editingImages = p?.images ? [...p.images] : [];
  
  showAdminModal(`
    <h3>${p ? '✏ Edit' : '＋ Add'} Product</h3>
    <form id="productForm" onsubmit="saveProduct(event, ${id || 'null'})">
      <div class="form-group">
        <label>📸 Product Images (up to 5)</label>
        <div id="imageGallery" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(100px,1fr));gap:8px;margin-bottom:8px"></div>
        <input type="file" id="newImageInput" accept="image/*" multiple style="display:none" onchange="uploadNewImages(event)">
        <button type="button" class="btn btn-secondary btn-sm" onclick="document.getElementById('newImageInput').click()">
          📤 ${p ? 'Add More Images' : 'Upload Images'}
        </button>
      </div>
      <div class="form-group"><label>Product Name *</label><input class="form-input" name="name" value="${escapeHtml(p?.name || '')}" required></div>
      <div class="form-row">
        <div class="form-group"><label>Price (¥)</label><input class="form-input" type="number" name="price" value="${p?.price||0}" min="0" step="1"></div>
        <div class="form-group"><label>Original Price (¥)</label><input class="form-input" type="number" name="original_price" value="${p?.original_price||0}" min="0"></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label>Category</label>
          <select class="form-select" name="category">
            ${['Electronics','Fashion','Furniture','Books','Toys','Other'].map(c => `<option ${p?.category===c?'selected':''}>${c}</option>`).join('')}
          </select>
        </div>
        <div class="form-group"><label>Condition</label>
          <select class="form-select" name="condition_label">
            ${['New','Like New','Used'].map(c => `<option ${p?.condition_label===c?'selected':''}>${c}</option>`).join('')}
          </select>
        </div>
      </div>
      <div class="form-group"><label>Location</label>
        <select class="form-select" name="location">
          ${['Tokyo','Osaka','Nagoya','Fukuoka','Sapporo','Kobe','Yokohama','Kyoto'].map(c => `<option ${p?.location===c?'selected':''}>${c}</option>`).join('')}
        </select>
      </div>
      <div class="form-group"><label>Description</label><textarea class="form-textarea" name="description" rows="3">${escapeHtml(p?.description || '')}</textarea></div>
      <div style="display:flex;gap:20px;margin-bottom:16px">
        <label class="checkbox-group"><input type="checkbox" name="is_free" ${p?.is_free==1?'checked':''}> 🎁 Free Item</label>
        <label class="checkbox-group"><input type="checkbox" name="is_eco" ${p?.is_eco==1?'checked':''}> 🌱 Eco-Friendly</label>
      </div>
      <div style="display:flex;gap:8px;margin-top:20px">
        <button type="submit" class="btn btn-primary">💾 Save</button>
        <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
      </div>
    </form>
  `);
  renderImageGallery();
}

function renderImageGallery() {
  const gallery = document.getElementById('imageGallery');
  if (!gallery) return;
  if (editingImages.length === 0) {
    gallery.innerHTML = '<div style="grid-column:1/-1;padding:30px;text-align:center;color:var(--muted);border:2px dashed var(--border);border-radius:8px"><div style="font-size:36px;margin-bottom:8px">📷</div>No images yet</div>';
    return;
  }
  gallery.innerHTML = editingImages.map((img, idx) => `
    <div style="position:relative;aspect-ratio:1;border-radius:8px;overflow:hidden;background:var(--bg3);border:1px solid var(--border)">
      <img src="${imgPath(img)}" style="width:100%;height:100%;object-fit:cover" onerror="this.style.display='none'">
      <button type="button" onclick="removeImage(${idx})" style="position:absolute;top:4px;right:4px;width:24px;height:24px;border-radius:50%;background:var(--danger);color:#fff;border:none;cursor:pointer;font-size:14px;display:flex;align-items:center;justify-content:center">×</button>
      ${idx === 0 ? '<div style="position:absolute;top:4px;left:4px;background:var(--accent);color:#000;font-size:10px;padding:2px 6px;border-radius:4px;font-weight:700">MAIN</div>' : ''}
    </div>
  `).join('');
}

function removeImage(idx) {
  if (!confirm('Remove this image?')) return;
  editingImages.splice(idx, 1);
  renderImageGallery();
}

async function uploadNewImages(e) {
  const files = Array.from(e.target.files || []);
  if (!files.length) return;
  const remaining = 5 - editingImages.length;
  if (remaining <= 0) {
    adminToast('Maximum 5 images reached', 'error', '⚠');
    e.target.value = '';
    return;
  }
  const toUpload = files.slice(0, remaining);
  adminToast(`Uploading ${toUpload.length} image(s)...`, '', '⏳');
  for (const file of toUpload) {
    const r = await adminUploadFile(file);
    if (r.success) editingImages.push(r.data.url);
    else adminToast('Upload failed', 'error', '⚠');
  }
  renderImageGallery();
  e.target.value = '';
}

async function saveProduct(e, id) {
  e.preventDefault();
  const fd = new FormData(e.target);
  const user = getAdminUser();
  const body = {
    user_id: user?.id || 1,
    name: fd.get('name'),
    price: Number(fd.get('price')||0),
    original_price: Number(fd.get('original_price')||0),
    category: fd.get('category'),
    condition_label: fd.get('condition_label'),
    location: fd.get('location'),
    description: fd.get('description'),
    is_free: fd.get('is_free') ? 1 : 0,
    is_eco: fd.get('is_eco') ? 1 : 0,
    images: editingImages
  };
  if (id) body.id = id;
  const endpoint = id ? 'products/update.php' : 'products/add.php';
  const r = await adminApi(endpoint, 'POST', body);
  if (r.success) {
    adminToast(id ? 'Product updated!' : 'Product added!', 'success', '✅');
    editingImages = [];
    closeModal();
    renderProducts();
  } else {
    adminToast(r.error || 'Failed to save', 'error', '⚠');
  }
}

async function deleteProduct(id) {
  if (!confirm('Delete this product? This cannot be undone.')) return;
  const r = await adminApi('products/delete.php', 'POST', { id, user_id: 1 });
  if (r.success) { adminToast('Product deleted', 'success', '🗑'); renderProducts(); }
  else adminToast(r.error || 'Failed to delete', 'error', '⚠');
}

function viewProduct(id) {
  const p = allProducts.find(x => x.id === id);
  if (!p) return;
  showAdminModal(`
    <h3>${escapeHtml(p.name)}</h3>
    ${p.images?.[0] ? `<div style="width:100%;height:200px;border-radius:8px;overflow:hidden;margin:12px 0"><img src="${imgPath(p.images[0])}" style="width:100%;height:100%;object-fit:cover"></div>` : ''}
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:16px 0">
      <div><strong>Price:</strong> ¥${Number(p.price).toLocaleString()}</div>
      <div><strong>Category:</strong> ${escapeHtml(p.category)}</div>
      <div><strong>Condition:</strong> ${escapeHtml(p.condition_label)}</div>
      <div><strong>Location:</strong> ${escapeHtml(p.location||'—')}</div>
      <div><strong>Views:</strong> ${p.views||0}</div>
      <div><strong>Rating:</strong> ⭐ ${Number(p.rating_avg||0).toFixed(1)}</div>
      <div><strong>Seller:</strong> ${escapeHtml(p.seller_name||'—')}</div>
      <div><strong>Status:</strong> ${p.is_free==1?'Free':p.is_eco==1?'Eco':'Normal'}</div>
    </div>
    <p style="background:var(--bg3);padding:12px;border-radius:8px">${escapeHtml(p.description||'No description')}</p>
    <div style="display:flex;gap:8px;margin-top:16px">
      <button class="btn btn-warning" onclick="closeModal();showProductForm(${p.id})">✏ Edit</button>
      <button class="btn btn-danger" onclick="closeModal();deleteProduct(${p.id})">🗑 Delete</button>
      <button class="btn btn-secondary" onclick="closeModal()">Close</button>
    </div>
  `);
}

// ============================================
// CATEGORIES - FIXED (No Duplicates)
// ============================================
async function renderCategories() {
  const c = document.getElementById('pageContainer');
  c.innerHTML = '<div class="empty-state"><div class="ic">⏳</div>Loading...</div>';
  
  const [pR, catR] = await Promise.all([
    adminApi('admin/products.php'),
    adminApi('categories/list.php').catch(() => ({ data: { categories: [] } }))
  ]);
  allProducts = pR.data?.products || [];
  allCategories = catR.data?.categories || [];
  
  renderCategoriesView();
}

function renderCategoriesView() {
  const c = document.getElementById('pageContainer');
  
  // ✅ FIX 1: Get unique categories from products (no duplicates)
  const productCategories = [...new Set(allProducts.map(p => p.category).filter(Boolean))];
  
  // ✅ FIX 2: Default categories with PROPER emojis (not "�")
  const defaults = [
    { name: 'Electronics', icon: '💻', desc: 'Phones, laptops, gadgets' },
    { name: 'Fashion', icon: '👕', desc: 'Clothing, shoes, accessories' },
    { name: 'Furniture', icon: '🛋️', desc: 'Home & office furniture' },
    { name: 'Books', icon: '📚', desc: 'Books, magazines, comics' },
    { name: 'Toys', icon: '🧸', desc: 'Toys & games' },
    { name: 'Other', icon: '📦', desc: 'Everything else' }
  ];
  
  // Build final list without duplicates
  const allCats = [];
  const seen = new Set();
  
  // Add from products first
  productCategories.forEach(name => {
    if (!seen.has(name)) {
      seen.add(name);
      const def = defaults.find(d => d.name === name);
      const custom = allCategories.find(cat => cat.name === name);
      allCats.push({
        name,
        icon: custom?.icon || def?.icon || '📦',
        desc: custom?.description || def?.desc || '',
        custom: !!custom,
        id: custom?.id
      });
    }
  });
  
  // Add custom categories not in products
  allCategories.forEach(cat => {
    if (!seen.has(cat.name)) {
      seen.add(cat.name);
      allCats.push({ name: cat.name, icon: cat.icon || '📦', desc: cat.description, custom: true, id: cat.id });
    }
  });
  
  // Add defaults not already in list
  defaults.forEach(d => {
    if (!seen.has(d.name)) {
      seen.add(d.name);
      allCats.push({ name: d.name, icon: d.icon, desc: d.desc, custom: false });
    }
  });
  
  c.innerHTML = `
    <div class="panel">
      <div class="panel-header">
        <div class="panel-title">Categories (${allCats.length})</div>
        <button class="btn btn-primary" onclick="showCategoryForm()">＋ Add Category</button>
      </div>
      <div class="stats-grid">
        ${allCats.length ? allCats.map(cat => {
          const count = allProducts.filter(p => p.category === cat.name).length;
          const total = allProducts.filter(p => p.category === cat.name).reduce((s,p) => s + Number(p.price), 0);
          return `
            <div class="stat-card" style="cursor:pointer;position:relative" onclick="productFilter.category='${cat.name}';showPage('products')">
              <div class="ic">${cat.icon}</div>
              <div class="label">${escapeHtml(cat.name)}</div>
              <div class="value">${count}</div>
              <div style="color:var(--muted);font-size:11px;margin-top:4px">${escapeHtml(cat.desc || '')}<br>¥${total.toLocaleString()} value</div>
              ${cat.custom && cat.id ? `<button class="btn btn-sm btn-danger" style="position:absolute;top:10px;right:10px;padding:2px 6px;font-size:10px" onclick="event.stopPropagation();deleteCategory(${cat.id})">×</button>` : ''}
            </div>
          `;
        }).join('') : '<div class="empty-state"><div class="ic">📦</div><h3>No categories yet</h3></div>'}
      </div>
    </div>
  `;
}

function showCategoryForm() {
  showAdminModal(`
    <h3>＋ Add New Category</h3>
    <div class="form-group">
      <label>Category Name *</label>
      <input class="form-input" id="catName" placeholder="e.g., Sports, Music" maxlength="50">
    </div>
    <div class="form-group">
      <label>Icon (Emoji)</label>
      <input class="form-input" id="catIcon" placeholder="🎯" value="📦" maxlength="2">
    </div>
    <div class="form-group">
      <label>Description</label>
      <input class="form-input" id="catDesc" placeholder="What kind of items?">
    </div>
    <div style="display:flex;gap:8px;margin-top:16px">
      <button class="btn btn-primary" onclick="createCategory()">Create</button>
      <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
    </div>
  `);
}

async function createCategory() {
  const name = document.getElementById('catName').value.trim();
  const icon = document.getElementById('catIcon').value.trim() || '📦';
  const desc = document.getElementById('catDesc').value.trim();
  if (!name) return adminToast('Name required', 'error', '⚠');
  
  adminToast('Creating...', '', '⏳');
  const r = await adminApi('categories/add.php', 'POST', { name, icon, description: desc });
  if (r.success) {
    adminToast('Category "' + name + '" created!', 'success', '✅');
    closeModal();
    renderCategories();
  } else {
    adminToast(r.error || 'Failed', 'error', '⚠');
  }
}

async function deleteCategory(id) {
  if (!confirm('Delete this category?')) return;
  const r = await adminApi('categories/delete.php', 'POST', { id });
  if (r.success) { adminToast('Deleted', 'success', '🗑'); renderCategories(); }
  else adminToast(r.error, 'error', '⚠');
}

// ============================================
// ORDERS
// ============================================
async function renderOrders() {
  const c = document.getElementById('pageContainer');
  c.innerHTML = '<div class="empty-state"><div class="ic">⏳</div>Loading orders...</div>';
  const r = await adminApi('admin/orders.php');
  allOrders = r.data?.orders || [];
  renderOrdersTable();
}

function renderOrdersTable() {
  const c = document.getElementById('pageContainer');
  let filtered = allOrders;
  if (orderFilter.status) filtered = filtered.filter(o => o.status === orderFilter.status);
  if (orderFilter.search) {
    const q = orderFilter.search.toLowerCase();
    filtered = filtered.filter(o => String(o.id).includes(q) || (o.customer_name||'').toLowerCase().includes(q));
  }
  
  const oc = document.getElementById('orderCount');
  if (oc) oc.textContent = allOrders.length;
  
  const totalRevenue = filtered.reduce((s, o) => s + Number(o.total_amount), 0);
  
  c.innerHTML = `
    <div class="stats-grid">
      <div class="stat-card"><div class="ic">📦</div><div class="label">Total</div><div class="value">${filtered.length}</div></div>
      <div class="stat-card"><div class="ic">💰</div><div class="label">Revenue</div><div class="value">¥${totalRevenue.toLocaleString()}</div></div>
      <div class="stat-card"><div class="ic">⏳</div><div class="label">Pending</div><div class="value">${filtered.filter(o=>o.status==='Pending').length}</div></div>
      <div class="stat-card"><div class="ic">✅</div><div class="label">Completed</div><div class="value">${filtered.filter(o=>o.status==='Delivered'||o.status==='Paid').length}</div></div>
    </div>
    <div class="toolbar">
      <input class="search-input" placeholder="🔍 Search by ID or customer..." oninput="orderFilter.search=this.value;renderOrdersTable()">
      <select class="filter-select" onchange="orderFilter.status=this.value;renderOrdersTable()">
        <option value="">All Status</option>
        <option ${orderFilter.status==='Pending'?'selected':''}>Pending</option>
        <option ${orderFilter.status==='Paid'?'selected':''}>Paid</option>
        <option ${orderFilter.status==='Processing'?'selected':''}>Processing</option>
        <option ${orderFilter.status==='Shipped'?'selected':''}>Shipped</option>
        <option ${orderFilter.status==='Delivered'?'selected':''}>Delivered</option>
        <option ${orderFilter.status==='Cancelled'?'selected':''}>Cancelled</option>
      </select>
      <button class="btn btn-danger" onclick="bulkDeleteOrders()">🗑 Delete Selected</button>
      <button class="btn btn-secondary" onclick="cleanupOldOrders()">🧹 Clean Old</button>
    </div>
    <div class="panel">
      <div class="table-wrap">
        <table class="table">
          <thead><tr>
            <th><input type="checkbox" onchange="document.querySelectorAll('.order-check').forEach(c=>c.checked=this.checked)"></th>
            <th>Order</th><th>Customer</th><th>Total</th><th>Payment</th><th>Status</th><th>Date</th><th>Actions</th>
          </tr></thead>
          <tbody>
            ${filtered.length ? filtered.map(o => `
              <tr>
                <td><input type="checkbox" class="order-check" value="${o.id}"></td>
                <td><strong>#${o.id}</strong></td>
                <td>${escapeHtml(o.customer_name||'—')}</td>
                <td><strong>¥${Number(o.total_amount).toLocaleString()}</strong></td>
                <td>${escapeHtml(o.payment_method||'—')}</td>
                <td><span class="badge-status ${getStatusClass(o.status)}">${o.status}</span></td>
                <td>${new Date(o.created_at).toLocaleDateString()}</td>
                <td>
                  <div style="display:flex;gap:4px;flex-wrap:wrap">
                    <button class="btn btn-sm btn-secondary" onclick="viewOrder(${o.id})">👁</button>
                    <button class="btn btn-sm btn-success" onclick="markOrderPaid(${o.id})" title="Mark Paid">💰</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteSingleOrder(${o.id})" title="Delete">🗑</button>
                  </div>
                </td>
              </tr>
            `).join('') : '<tr><td colspan="8" style="text-align:center;padding:40px;color:var(--muted)">No orders</td></tr>'}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

async function markOrderPaid(id) {
  if (!confirm('Mark this order as PAID?')) return;
  const r = await adminApi('orders/updateStatus.php', 'POST', { id, status: 'Paid' });
  if (r.success) { adminToast('Marked as Paid', 'success', '✅'); renderOrders(); }
  else adminToast(r.error, 'error', '⚠');
}

async function deleteSingleOrder(id) {
  if (!confirm(`Delete order #${id}?`)) return;
  const r = await adminApi('orders/delete.php', 'POST', { id });
  if (r.success) { adminToast('Deleted', 'success', '🗑'); renderOrders(); }
  else adminToast(r.error, 'error', '⚠');
}

async function bulkDeleteOrders() {
  const checked = Array.from(document.querySelectorAll('.order-check:checked')).map(c => parseInt(c.value));
  if (!checked.length) return adminToast('No orders selected', 'error', '⚠');
  if (!confirm(`Delete ${checked.length} order(s)?`)) return;
  const r = await adminApi('orders/delete.php', 'POST', { ids: checked });
  if (r.success) { adminToast(`${r.data.deleted} orders deleted`, 'success', '🗑'); renderOrders(); }
  else adminToast(r.error, 'error', '⚠');
}

async function cleanupOldOrders() {
  const days = prompt('Delete orders older than how many days?', '90');
  if (!days) return;
  if (!confirm(`Delete all orders older than ${days} days?`)) return;
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const old = allOrders.filter(o => new Date(o.created_at) <= cutoff);
  if (!old.length) return adminToast('No old orders', 'info', 'ℹ');
  if (!confirm(`Found ${old.length} old orders. Delete them?`)) return;
  const r = await adminApi('orders/delete.php', 'POST', { ids: old.map(o => o.id) });
  if (r.success) { adminToast(`Cleaned ${r.data.deleted} orders`, 'success', '🧹'); renderOrders(); }
  else adminToast(r.error, 'error', '⚠');
}

async function updateOrderStatus(id, status) {
  if (!status) return;
  const r = await adminApi('orders/updateStatus.php', 'POST', { id, status });
  if (r.success) { adminToast('Status: ' + status, 'success', '✅'); renderOrders(); }
  else adminToast(r.error, 'error', '⚠');
}

function viewOrder(id) {
  const o = allOrders.find(x => x.id === id);
  if (!o) return;
  showAdminModal(`
    <h3>Order #${o.id}</h3>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:16px 0;padding:12px;background:var(--bg3);border-radius:8px">
      <div><strong>Customer:</strong> ${escapeHtml(o.customer_name||'—')}</div>
      <div><strong>Status:</strong> <span class="badge-status ${getStatusClass(o.status)}">${o.status}</span></div>
      <div><strong>Total:</strong> ¥${Number(o.total_amount).toLocaleString()}</div>
      <div><strong>Payment:</strong> ${escapeHtml(o.payment_method||'—')}</div>
      <div><strong>Date:</strong> ${new Date(o.created_at).toLocaleString()}</div>
      ${o.shipping_address ? `<div style="grid-column:1/-1"><strong>Address:</strong> ${escapeHtml(o.shipping_address)}</div>` : ''}
    </div>
    <h4>Items:</h4>
    ${(o.items || []).map(i => `
      <div style="display:flex;gap:10px;padding:10px;background:var(--bg3);border-radius:8px;margin-bottom:6px;align-items:center">
        <div style="width:50px;height:50px;border-radius:6px;background:var(--bg2);overflow:hidden;flex-shrink:0">${i.product_image ? `<img src="${imgPath(i.product_image)}" style="width:100%;height:100%;object-fit:cover">` : ''}</div>
        <div style="flex:1"><strong>${escapeHtml(i.product_name)}</strong><br><small>Qty: ${i.quantity} × ¥${Number(i.price).toLocaleString()}</small></div>
        <strong>¥${Number(i.price * i.quantity).toLocaleString()}</strong>
      </div>
    `).join('') || '<p style="color:var(--muted)">No items</p>'}
    <button class="btn btn-secondary" onclick="closeModal()" style="margin-top:16px">Close</button>
  `);
}

// ============================================
// USERS / CUSTOMERS
// ============================================
async function renderUsers() {
  const c = document.getElementById('pageContainer');
  c.innerHTML = '<div class="empty-state"><div class="ic">⏳</div>Loading...</div>';
  const r = await adminApi('admin/customers.php');
  allUsers = r.data?.customers || [];
  renderUsersTable();
}

function renderUsersTable() {
  const c = document.getElementById('pageContainer');
  let filtered = allUsers;
  if (userFilter.search) {
    const q = userFilter.search.toLowerCase();
    filtered = filtered.filter(u => (u.name||'').toLowerCase().includes(q) || (u.email||'').toLowerCase().includes(q));
  }
  if (userFilter.level) filtered = filtered.filter(u => u.level === userFilter.level);
  if (userFilter.activity === 'active') {
    const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    filtered = filtered.filter(u => u.last_active && new Date(u.last_active) > cutoff);
  } else if (userFilter.activity === 'recent') {
    const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    filtered = filtered.filter(u => u.last_active && new Date(u.last_active) > cutoff);
  } else if (userFilter.activity === 'inactive') {
    const cutoff = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    filtered = filtered.filter(u => !u.last_active || new Date(u.last_active) <= cutoff);
  }
  
  const uc = document.getElementById('userCount');
  if (uc) uc.textContent = filtered.length;
  
  c.innerHTML = `
    <div class="stats-grid">
      <div class="stat-card"><div class="ic">👥</div><div class="label">Total</div><div class="value">${allUsers.length}</div></div>
      <div class="stat-card"><div class="ic">🥉</div><div class="label">Bronze</div><div class="value">${allUsers.filter(u=>u.level==='Bronze').length}</div></div>
      <div class="stat-card"><div class="ic">🥈</div><div class="label">Silver</div><div class="value">${allUsers.filter(u=>u.level==='Silver').length}</div></div>
      <div class="stat-card"><div class="ic">🥇</div><div class="label">Gold+</div><div class="value">${allUsers.filter(u=>u.level==='Gold'||u.level==='Platinum').length}</div></div>
    </div>
    <div class="toolbar">
      <input class="search-input" placeholder="🔍 Search..." oninput="userFilter.search=this.value;renderUsersTable()">
      <select class="filter-select" onchange="userFilter.level=this.value;renderUsersTable()">
        <option value="">All Levels</option>
        <option ${userFilter.level==='Bronze'?'selected':''}>Bronze</option>
        <option ${userFilter.level==='Silver'?'selected':''}>Silver</option>
        <option ${userFilter.level==='Gold'?'selected':''}>Gold</option>
        <option ${userFilter.level==='Platinum'?'selected':''}>Platinum</option>
      </select>
      <select class="filter-select" onchange="userFilter.activity=this.value;renderUsersTable()">
        <option value="">All Activity</option>
        <option value="active" ${userFilter.activity==='active'?'selected':''}>Active (30d)</option>
        <option value="recent" ${userFilter.activity==='recent'?'selected':''}>Recent (7d)</option>
        <option value="inactive" ${userFilter.activity==='inactive'?'selected':''}>Inactive (90d+)</option>
      </select>
      <button class="btn btn-secondary" onclick="exportUsers()">📥 Export</button>
      <button class="btn btn-danger" onclick="bulkDeleteUsers()">🗑 Delete Inactive</button>
    </div>
    <div class="panel">
      <div class="table-wrap">
        <table class="table">
          <thead><tr><th>User</th><th>Email</th><th>Level</th><th>Points</th><th>Last Active</th><th>Joined</th><th>Actions</th></tr></thead>
          <tbody>
            ${filtered.length ? filtered.map(u => `
              <tr>
                <td><div style="display:flex;align-items:center;gap:10px"><div class="avatar" style="width:36px;height:36px;font-size:14px">${(u.avatar_initial||(u.name?u.name.charAt(0):'U')).toUpperCase()}</div><strong>${escapeHtml(u.name||'')}</strong></div></td>
                <td>${escapeHtml(u.email||'')}</td>
                <td><span class="badge-status ${u.level==='Platinum'?'badge-info':u.level==='Gold'?'badge-warning':'badge-default'}">${u.level}</span></td>
                <td><strong>${u.mottainai_points}</strong> pts</td>
                <td>${u.last_active ? new Date(u.last_active).toLocaleDateString() : '<span style="color:var(--muted)">Never</span>'}</td>
                <td>${new Date(u.created_at).toLocaleDateString()}</td>
                <td><button class="btn btn-sm btn-secondary" onclick="viewUser(${u.id})">View</button></td>
              </tr>
            `).join('') : '<tr><td colspan="7" style="text-align:center;padding:40px;color:var(--muted)">No users</td></tr>'}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function viewUser(id) {
  const u = allUsers.find(x => x.id === id);
  if (!u) return;
  showAdminModal(`
    <h3>User Profile</h3>
    <div style="text-align:center;margin:20px 0">
      <div class="avatar" style="width:80px;height:80px;font-size:32px;margin:0 auto">${(u.avatar_initial||(u.name?u.name.charAt(0):'U')).toUpperCase()}</div>
      <h2 style="margin-top:10px">${escapeHtml(u.name||'')}</h2>
      <p style="color:var(--muted)">${escapeHtml(u.email||'')}</p>
      <span class="badge-status ${u.level==='Platinum'?'badge-info':u.level==='Gold'?'badge-warning':'badge-default'}">${u.level}</span>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
      <div><strong>Points:</strong> ${u.mottainai_points}</div>
      <div><strong>Joined:</strong> ${new Date(u.created_at).toLocaleDateString()}</div>
      <div><strong>Last Active:</strong> ${u.last_active ? new Date(u.last_active).toLocaleDateString() : 'Never'}</div>
    </div>
    <button class="btn btn-secondary" onclick="closeModal()" style="margin-top:16px">Close</button>
  `);
}

function exportUsers() {
  let csv = 'Name,Email,Level,Points,Joined,LastActive\n';
  allUsers.forEach(u => csv += `"${u.name}","${u.email}",${u.level},${u.mottainai_points},"${u.created_at}","${u.last_active||''}"\n`);
  const blob = new Blob([csv], { type: 'text/csv' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = 'users.csv'; a.click();
  adminToast('Exported!', 'success', '📥');
}

async function bulkDeleteUsers() {
  const cutoff = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
  const inactive = allUsers.filter(u => !u.last_active || new Date(u.last_active) <= cutoff);
  if (!inactive.length) return adminToast('No inactive users (90d+) found', 'info', 'ℹ');
  if (!confirm(`Delete ${inactive.length} inactive user(s)?`)) return;
  const r = await adminApi('admin/deleteUsers.php', 'POST', { ids: inactive.map(u => u.id) });
  if (r.success) { adminToast(`Deleted ${r.data.deleted} users`, 'success', '🗑'); renderUsers(); }
  else adminToast(r.error, 'error', '⚠');
}

// ============================================
// MESSAGES - FIXED (correct endpoint)
// ============================================
async function renderMessages() {
  const c = document.getElementById('pageContainer');
  c.innerHTML = '<div class="empty-state"><div class="ic">⏳</div>Loading...</div>';
  const r = await adminApi('admin/messages.php');
  allConvs = r.data?.conversations || [];
  renderMessagesList();
}

function renderMessagesList() {
  const c = document.getElementById('pageContainer');
  let convs = [...allConvs];
  
  if (messageFilter.search) {
    const q = messageFilter.search.toLowerCase();
    convs = convs.filter(cv => 
      (cv.buyer_name||'').toLowerCase().includes(q) || 
      (cv.seller_name||'').toLowerCase().includes(q) || 
      (cv.product_name||'').toLowerCase().includes(q)
    );
  }
  if (messageFilter.age === '30') {
    convs = convs.filter(cv => new Date(cv.last_message_at) > new Date(Date.now() - 30*24*60*60*1000));
  } else if (messageFilter.age === '90') {
    convs = convs.filter(cv => new Date(cv.last_message_at) > new Date(Date.now() - 90*24*60*60*1000));
  } else if (messageFilter.age === 'old') {
    convs = convs.filter(cv => new Date(cv.last_message_at) <= new Date(Date.now() - 90*24*60*60*1000));
  }
  
  c.innerHTML = `
    <div class="toolbar">
      <input class="search-input" value="${escapeHtml(messageFilter.search)}" placeholder="🔍 Search..." oninput="messageFilter.search=this.value;renderMessagesList()">
      <select class="filter-select" onchange="messageFilter.age=this.value;renderMessagesList()">
        <option value="">All Time</option>
        <option value="30" ${messageFilter.age==='30'?'selected':''}>Last 30 days</option>
        <option value="90" ${messageFilter.age==='90'?'selected':''}>Last 90 days</option>
        <option value="old" ${messageFilter.age==='old'?'selected':''}>Older than 90 days</option>
      </select>
      <button class="btn btn-danger" onclick="cleanupOldMessages()">🧹 Clean Old</button>
    </div>
    <div class="panel">
      <div class="panel-header">
        <div class="panel-title">All Conversations (${convs.length})</div>
      </div>
      <div class="table-wrap">
        <table class="table">
          <thead><tr>
            <th><input type="checkbox" onchange="document.querySelectorAll('.conv-check').forEach(c=>c.checked=this.checked)"></th>
            <th>Buyer</th><th>Seller</th><th>Product</th><th>Last Activity</th><th>Age</th><th>Actions</th>
          </tr></thead>
          <tbody>
            ${convs.length ? convs.map(cv => {
              const days = Math.floor((Date.now() - new Date(cv.last_message_at).getTime()) / (1000 * 60 * 60 * 24));
              const ageClass = days > 90 ? 'badge-danger' : days > 30 ? 'badge-warning' : 'badge-success';
              return `
                <tr>
                  <td><input type="checkbox" class="conv-check" value="${cv.id}"></td>
                  <td><strong>${escapeHtml(cv.buyer_name||'')}</strong></td>
                  <td><strong>${escapeHtml(cv.seller_name||'')}</strong></td>
                  <td>${escapeHtml(cv.product_name||'')}</td>
                  <td>${new Date(cv.last_message_at).toLocaleDateString()}</td>
                  <td><span class="badge-status ${ageClass}">${days}d</span></td>
                  <td>
                    <button class="btn btn-sm btn-secondary" onclick="viewMessages(${cv.id})">👁</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteConversation(${cv.id})">🗑</button>
                  </td>
                </tr>
              `;
            }).join('') : '<tr><td colspan="7" style="text-align:center;padding:40px;color:var(--muted)">No conversations</td></tr>'}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

async function viewMessages(convId) {
  const r = await adminApi(`chat/getMessages.php?conversation_id=${convId}`);
  const msgs = r.data?.messages || [];
  showAdminModal(`
    <h3>💬 Messages (${msgs.length})</h3>
    <div style="max-height:50vh;overflow-y:auto;margin:16px 0">
      ${msgs.length ? msgs.map(m => `
        <div style="padding:10px;background:var(--bg3);border-radius:8px;margin-bottom:8px;display:flex;justify-content:space-between;align-items:start;gap:8px">
          <div style="flex:1">
            <div style="display:flex;justify-content:space-between;margin-bottom:4px">
              <strong>${escapeHtml(m.sender_name||'User')}</strong>
              <small style="color:var(--muted)">${new Date(m.created_at).toLocaleString()}</small>
            </div>
            <div>${escapeHtml(m.message)}</div>
          </div>
          <button class="btn btn-sm btn-danger" style="padding:2px 6px;font-size:10px" onclick="deleteSingleMessage(${m.id}, ${convId})">🗑</button>
        </div>
      `).join('') : '<p style="color:var(--muted);text-align:center">No messages</p>'}
    </div>
    <div style="display:flex;gap:8px">
      <button class="btn btn-danger" onclick="deleteConversation(${convId})">🗑 Delete Whole Chat</button>
      <button class="btn btn-secondary" onclick="closeModal()">Close</button>
    </div>
  `);
}

async function deleteSingleMessage(id, convId) {
  if (!confirm('Delete this message?')) return;
  // ✅ FIX 3: Use correct endpoint
  const r = await adminApi('chat/deleteMessage.php', 'POST', { id });
  if (r.success) {
    adminToast('Message deleted', 'success', '🗑');
    viewMessages(convId);
  } else {
    adminToast(r.error, 'error', '⚠');
  }
}

async function deleteConversation(id) {
  if (!confirm('Delete this entire conversation?')) return;
  // ✅ FIX 4: Use the correct endpoint for deleting whole conversation
  const r = await adminApi('chat/deleteConversation.php', 'POST', { conversation_id: id });
  if (r.success) {
    adminToast('Conversation deleted', 'success', '🗑');
    closeModal();
    renderMessages();
  } else {
    adminToast(r.error, 'error', '⚠');
  }
}

async function cleanupOldMessages() {
  const days = prompt('Delete conversations older than how many days?', '180');
  if (!days) return;
  if (!confirm(`Delete all conversations older than ${days} days?`)) return;
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const old = allConvs.filter(cv => new Date(cv.last_message_at) <= cutoff);
  if (!old.length) return adminToast('No old conversations', 'info', 'ℹ');
  if (!confirm(`Found ${old.length} old conversations. Delete?`)) return;
  for (const cv of old) {
    await adminApi('chat/deleteConversation.php', 'POST', { conversation_id: cv.id });
  }
  adminToast(`Cleaned ${old.length} conversations`, 'success', '🧹');
  renderMessages();
}

// ============================================
// REVIEWS, COUPONS, PAYMENTS
// ============================================
function renderReviews() {
  const c = document.getElementById('pageContainer');
  c.innerHTML = `
    <div class="panel">
      <div class="panel-header"><div class="panel-title">Product Reviews</div></div>
      <div class="table-wrap">
        <table class="table">
          <thead><tr><th>Product</th><th>Rating</th><th>Reviews</th><th>Action</th></tr></thead>
          <tbody>
            ${allProducts.length ? allProducts.sort((a,b)=>b.rating_count-a.rating_count).slice(0,20).map(p => `
              <tr>
                <td><strong>${escapeHtml(p.name)}</strong></td>
                <td>⭐ ${Number(p.rating_avg||0).toFixed(1)}</td>
                <td>${p.rating_count||0}</td>
                <td><button class="btn btn-sm btn-secondary" onclick="adminToast('Coming soon','info','ℹ')">View</button></td>
              </tr>
            `).join('') : '<tr><td colspan="4" style="text-align:center;padding:40px;color:var(--muted)">No products</td></tr>'}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function renderCoupons() {
  document.getElementById('pageContainer').innerHTML = `
    <div class="panel">
      <div class="panel-header">
        <div class="panel-title">🎟️ Coupons</div>
        <button class="btn btn-primary" onclick="adminToast('Create coupon form coming','info','ℹ')">＋ Add Coupon</button>
      </div>
      <div class="table-wrap">
        <table class="table">
          <thead><tr><th>Code</th><th>Discount</th><th>Status</th><th>Action</th></tr></thead>
          <tbody>
            <tr><td><strong style="font-family:monospace;color:var(--accent)">MOTTAINAI10</strong></td><td>10%</td><td><span class="badge-status badge-success">Active</span></td><td><button class="btn btn-sm btn-warning">Disable</button></td></tr>
            <tr><td><strong style="font-family:monospace;color:var(--accent)">ECO20</strong></td><td>20%</td><td><span class="badge-status badge-success">Active</span></td><td><button class="btn btn-sm btn-warning">Disable</button></td></tr>
            <tr><td><strong style="font-family:monospace;color:var(--accent)">WELCOME15</strong></td><td>15%</td><td><span class="badge-status badge-success">Active</span></td><td><button class="btn btn-sm btn-warning">Disable</button></td></tr>
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function renderPayments() {
  const total = allOrders.reduce((s, o) => s + Number(o.total_amount), 0);
  const byMethod = {};
  allOrders.forEach(o => { byMethod[o.payment_method||'Unknown'] = (byMethod[o.payment_method||'Unknown']||0) + Number(o.total_amount); });
  document.getElementById('pageContainer').innerHTML = `
    <div class="stats-grid">
      <div class="stat-card"><div class="ic">💰</div><div class="label">Revenue</div><div class="value">¥${total.toLocaleString()}</div></div>
      <div class="stat-card"><div class="ic">📊</div><div class="label">Transactions</div><div class="value">${allOrders.length}</div></div>
    </div>
    <div class="panel">
      <div class="panel-header"><div class="panel-title">Revenue by Payment Method</div></div>
      ${Object.keys(byMethod).length ? Object.entries(byMethod).map(([m, v]) => `
        <div style="padding:12px 0;border-bottom:1px solid var(--border)">
          <div style="display:flex;justify-content:space-between;margin-bottom:6px">
            <strong>${escapeHtml(m)}</strong>
            <strong>¥${v.toLocaleString()} (${total?Math.round(v/total*100):0}%)</strong>
          </div>
          <div style="background:var(--bg3);height:8px;border-radius:4px;overflow:hidden">
            <div style="width:${total?(v/total)*100:0}%;height:100%;background:linear-gradient(90deg,var(--accent),var(--accent2))"></div>
          </div>
        </div>
      `).join('') : '<p style="color:var(--muted);text-align:center;padding:20px">No payments yet</p>'}
    </div>
  `;
}

// ============================================
// SETTINGS, MAINTENANCE, LOGS, PROFILE
// ============================================
function renderSettings() {
  document.getElementById('pageContainer').innerHTML = `
    <div class="settings-grid">
      <div class="settings-card">
        <h3>🏪 Store Info</h3>
        <div class="form-group"><label>Store Name</label><input class="form-input" value="Mottainai Neon"></div>
        <div class="form-group"><label>Support Email</label><input class="form-input" value="support@mottainai.com"></div>
        <div class="form-group"><label>Phone</label><input class="form-input" value="+81-3-1234-5678"></div>
        <div class="form-group"><label>Currency</label><select class="form-select"><option>¥ JPY</option><option>$ USD</option><option>€ EUR</option></select></div>
        <div class="form-group"><label>Timezone</label><select class="form-select"><option>Asia/Tokyo</option><option>UTC</option></select></div>
        <button class="btn btn-primary" onclick="adminToast('Settings saved!','success','💾')">💾 Save</button>
      </div>
      <div class="settings-card">
        <h3>🔔 Notifications</h3>
        <div class="setting-item"><div class="info"><div class="label">New Orders</div></div><div class="switch on" onclick="this.classList.toggle('on')"></div></div>
        <div class="setting-item"><div class="info"><div class="label">New Users</div></div><div class="switch on" onclick="this.classList.toggle('on')"></div></div>
        <div class="setting-item"><div class="info"><div class="label">Messages</div></div><div class="switch" onclick="this.classList.toggle('on')"></div></div>
        <div class="setting-item"><div class="info"><div class="label">Low Stock</div></div><div class="switch on" onclick="this.classList.toggle('on')"></div></div>
      </div>
      <div class="settings-card">
        <h3>💳 Payments</h3>
        <div class="setting-item"><div class="info"><div class="label">PayPay</div></div><div class="switch on" onclick="this.classList.toggle('on')"></div></div>
        <div class="setting-item"><div class="info"><div class="label">Apple Pay</div></div><div class="switch on" onclick="this.classList.toggle('on')"></div></div>
        <div class="setting-item"><div class="info"><div class="label">Credit Card</div></div><div class="switch on" onclick="this.classList.toggle('on')"></div></div>
        <div class="setting-item"><div class="info"><div class="label">Konbini Pay</div></div><div class="switch on" onclick="this.classList.toggle('on')"></div></div>
        <div class="setting-item"><div class="info"><div class="label">Bank Transfer</div></div><div class="switch" onclick="this.classList.toggle('on')"></div></div>
        <div class="setting-item"><div class="info"><div class="label">Cash on Pickup</div></div><div class="switch" onclick="this.classList.toggle('on')"></div></div>
      </div>
      <div class="settings-card">
        <h3>🔒 Security</h3>
        <div class="setting-item"><div class="info"><div class="label">2FA</div></div><div class="switch" onclick="this.classList.toggle('on')"></div></div>
        <div class="setting-item"><div class="info"><div class="label">Login Alerts</div></div><div class="switch on" onclick="this.classList.toggle('on')"></div></div>
        <div class="setting-item"><div class="info"><div class="label">Session Timeout</div></div><span style="color:var(--muted)">60 min</span></div>
      </div>
      <div class="settings-card">
        <h3>⚙️ System</h3>
        <div class="setting-item"><div class="info"><div class="label">Maintenance Mode</div></div><div class="switch" onclick="this.classList.toggle('on')"></div></div>
        <div class="setting-item"><div class="info"><div class="label">Debug Mode</div></div><div class="switch" onclick="this.classList.toggle('on')"></div></div>
        <div class="setting-item"><div class="info"><div class="label">Cache</div></div><div class="switch on" onclick="this.classList.toggle('on')"></div></div>
      </div>
      <div class="settings-card">
        <h3>🎨 Appearance</h3>
        <div class="form-group"><label>Primary Color</label><input class="form-input" type="color" value="#6366f1"></div>
        <div class="form-group"><label>Items per page</label><input class="form-input" type="number" value="20"></div>
        <div class="form-group"><label>Date Format</label><select class="form-select"><option>YYYY-MM-DD</option></select></div>
      </div>
    </div>
  `;
}

function renderMaintenance() {
  document.getElementById('pageContainer').innerHTML = `
    <div class="panel" style="max-width:600px">
      <h3>🔧 Maintenance Tools</h3>
      <div style="display:flex;flex-direction:column;gap:12px;margin-top:16px">
        <button class="btn btn-secondary" onclick="adminToast('Cache cleared!','success','✅')">🗑 Clear Cache</button>
        <button class="btn btn-secondary" onclick="if(confirm('Optimize?'))adminToast('Optimized','success','⚡')">⚡ Optimize Database</button>
        <button class="btn btn-warning" onclick="if(confirm('Reset?'))adminToast('Reset','success','📊')">📊 Reset Stats</button>
        <button class="btn btn-danger" onclick="if(confirm('Logout?'))adminLogout()">🚪 Logout</button>
      </div>
    </div>
  `;
}

function renderLogs() {
  document.getElementById('pageContainer').innerHTML = `
    <div class="panel">
      <div class="panel-header"><div class="panel-title">📜 Activity Log</div></div>
      <div class="activity-item"><div class="activity-icon">✅</div><div class="activity-info"><div class="action">Admin login successful</div><div class="time">Just now</div></div></div>
      <div class="activity-item"><div class="activity-icon">📦</div><div class="activity-info"><div class="action">System activity tracked</div><div class="time">Real-time</div></div></div>
    </div>
  `;
}

function renderProfile() {
  const u = getAdminUser();
  document.getElementById('pageContainer').innerHTML = `
    <div class="panel" style="max-width:600px">
      <h3>Admin Profile</h3>
      <div style="display:flex;align-items:center;gap:20px;margin:20px 0">
        <div class="avatar" style="width:80px;height:80px;font-size:32px">${(u?.avatar_initial||'A').toUpperCase()}</div>
        <div>
          <h2>${escapeHtml(u?.name||'Admin')}</h2>
          <p style="color:var(--muted)">${escapeHtml(u?.email||'')}</p>
          <span class="badge-status badge-success">Super Admin</span>
        </div>
      </div>
      <div class="form-group"><label>Name</label><input class="form-input" value="${escapeHtml(u?.name||'')}"></div>
      <div class="form-group"><label>Email</label><input class="form-input" value="${escapeHtml(u?.email||'')}" disabled></div>
      <button class="btn btn-primary" onclick="adminToast('Updated','success','✅')">💾 Save</button>
    </div>
  `;
}
