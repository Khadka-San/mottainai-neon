// ===== Products Management =====
let allProducts = [];
let productFilter = { search: '', category: '', status: '' };

async function renderProducts() {
  const c = document.getElementById('pageContainer');
  c.innerHTML = '<div class="empty-state"><div class="ic">⏳</div>Loading...</div>';
  
  const r = await adminApi('admin/products.php');
  allProducts = r.data?.products || [];
  renderProductsTable();
}

function renderProductsTable() {
  const c = document.getElementById('pageContainer');
  let filtered = allProducts;
  if (productFilter.search) filtered = filtered.filter(p => p.name.toLowerCase().includes(productFilter.search.toLowerCase()));
  if (productFilter.category) filtered = filtered.filter(p => p.category === productFilter.category);
  
  c.innerHTML = `
    <div class="toolbar">
      <input class="search-input" placeholder="🔍 Search products..." oninput="productFilter.search=this.value;renderProductsTable()">
      <select class="filter-select" onchange="productFilter.category=this.value;renderProductsTable()">
        <option value="">All Categories</option>
        <option>Electronics</option><option>Fashion</option><option>Furniture</option>
        <option>Books</option><option>Toys</option><option>Other</option>
      </select>
      <button class="btn btn-primary" onclick="showProductForm()">＋ Add Product</button>
    </div>
    <div class="panel">
      <div class="table-wrap">
        <table class="table">
          <thead><tr><th></th><th>Name</th><th>Category</th><th>Price</th><th>Seller</th><th>Views</th><th>Rating</th><th>Actions</th></tr></thead>
          <tbody>
            ${filtered.length ? filtered.map(p => `
              <tr>
                <td><div style="width:50px;height:50px;border-radius:6px;background:var(--bg3);overflow:hidden">${p.images?.[0] ? `<img src="../${escapeHtml(p.images[0])}" style="width:100%;height:100%;object-fit:cover">` : ''}</div></td>
                <td><strong>${escapeHtml(p.name)}</strong>${p.is_free==1 ? '<br><span class="badge-status badge-success">FREE</span>' : ''}${p.is_eco==1 ? '<span class="badge-status badge-info">ECO</span>' : ''}</td>
                <td>${escapeHtml(p.category)}</td>
                <td><strong>¥${Number(p.price).toLocaleString()}</strong></td>
                <td>${escapeHtml(p.seller_name || '—')}</td>
                <td>${p.views || 0}</td>
                <td>⭐ ${Number(p.rating_avg || 0).toFixed(1)} (${p.rating_count || 0})</td>
                <td class="actions">
                  <button class="btn btn-sm btn-secondary" onclick="viewProduct(${p.id})">👁</button>
                  <button class="btn btn-sm btn-warning" onclick="showProductForm(${p.id})">✏</button>
                  <button class="btn btn-sm btn-danger" onclick="deleteProduct(${p.id})">🗑</button>
                </td>
              </tr>
            `).join('') : '<tr><td colspan="8" style="text-align:center;padding:40px;color:var(--muted)">No products found</td></tr>'}
          </tbody>
        </table>
      </div>
      <div style="color:var(--muted);font-size:13px;margin-top:12px">Total: ${filtered.length} products</div>
    </div>
  `;
}

function showProductForm(id = null) {
  const p = id ? allProducts.find(x => x.id === id) : null;
  showAdminModal(`
    <h3>${p ? 'Edit' : 'Add'} Product</h3>
    <form id="productForm" onsubmit="saveProduct(event, ${id || 'null'})">
      <div class="form-group"><label>Name *</label><input class="form-input" name="name" value="${escapeHtml(p?.name || '')}" required></div>
      <div class="form-row">
        <div class="form-group"><label>Price (¥)</label><input class="form-input" type="number" name="price" value="${p?.price || 0}" min="0"></div>
        <div class="form-group"><label>Original Price (¥)</label><input class="form-input" type="number" name="original_price" value="${p?.original_price || 0}" min="0"></div>
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
          ${['Tokyo','Osaka','Nagoya','Fukuoka','Sapporo','Kobe'].map(c => `<option ${p?.location===c?'selected':''}>${c}</option>`).join('')}
        </select>
      </div>
      <div class="form-group"><label>Description</label><textarea class="form-textarea" name="description">${escapeHtml(p?.description || '')}</textarea></div>
      <div style="display:flex;gap:16px">
        <label class="checkbox-group"><input type="checkbox" name="is_free" ${p?.is_free==1?'checked':''}> Free Item</label>
        <label class="checkbox-group"><input type="checkbox" name="is_eco" ${p?.is_eco==1?'checked':''}> Eco-Friendly</label>
      </div>
      <div style="display:flex;gap:8px;margin-top:20px">
        <button type="submit" class="btn btn-primary">Save</button>
        <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
      </div>
    </form>
  `);
}

async function saveProduct(e, id) {
  e.preventDefault();
  const form = e.target;
  const fd = new FormData(form);
  const body = {
    name: fd.get('name'), price: Number(fd.get('price')), original_price: Number(fd.get('original_price')),
    category: fd.get('category'), condition_label: fd.get('condition_label'), location: fd.get('location'),
    description: fd.get('description'), is_free: fd.get('is_free') ? 1 : 0, is_eco: fd.get('is_eco') ? 1 : 0,
    user_id: 1, images: []
  };
  if (id) body.id = id;
  const endpoint = id ? 'products/update.php' : 'products/add.php';
  const r = await adminApi(endpoint, 'POST', body);
  if (r.success) {
    adminToast('Product saved!', 'success');
    closeModal();
    renderProducts();
  } else {
    adminToast(r.error, 'error');
  }
}

async function deleteProduct(id) {
  if (!confirm('Delete this product?')) return;
  const r = await adminApi('products/delete.php', 'POST', { id, user_id: 1 });
  if (r.success) {
    adminToast('Product deleted', 'success');
    renderProducts();
  } else {
    adminToast(r.error, 'error');
  }
}

function viewProduct(id) {
  const p = allProducts.find(x => x.id === id);
  if (!p) return;
  showAdminModal(`
    <h3>${escapeHtml(p.name)}</h3>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin:16px 0">
      <div><strong>Price:</strong> ¥${Number(p.price).toLocaleString()}</div>
      <div><strong>Category:</strong> ${escapeHtml(p.category)}</div>
      <div><strong>Condition:</strong> ${escapeHtml(p.condition_label)}</div>
      <div><strong>Location:</strong> ${escapeHtml(p.location)}</div>
      <div><strong>Views:</strong> ${p.views || 0}</div>
      <div><strong>Rating:</strong> ⭐ ${Number(p.rating_avg || 0).toFixed(1)}</div>
    </div>
    <p>${escapeHtml(p.description || 'No description')}</p>
    <button class="btn btn-secondary" onclick="closeModal()" style="margin-top:16px">Close</button>
  `);
}

// ===== Categories =====
function renderCategories() {
  const categories = [
    { name: 'Electronics', count: allProducts.filter(p => p.category === 'Electronics').length, ic: '💻' },
    { name: 'Fashion', count: allProducts.filter(p => p.category === 'Fashion').length, ic: '👕' },
    { name: 'Furniture', count: allProducts.filter(p => p.category === 'Furniture').length, ic: '🛋️' },
    { name: 'Books', count: allProducts.filter(p => p.category === 'Books').length, ic: '📚' },
    { name: 'Toys', count: allProducts.filter(p => p.category === 'Toys').length, ic: '🧸' },
    { name: 'Other', count: allProducts.filter(p => p.category === 'Other').length, ic: '📦' }
  ];
  document.getElementById('pageContainer').innerHTML = `
    <div class="stats-grid">
      ${categories.map(c => `
        <div class="stat-card">
          <div class="ic">${c.ic}</div>
          <div class="label">${c.name}</div>
          <div class="value">${c.count}</div>
        </div>
      `).join('')}
    </div>
  `;
}
