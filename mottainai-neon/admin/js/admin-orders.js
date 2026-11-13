// ===== Orders Management =====
let allOrders = [];
let orderFilter = { search: '', status: '' };

async function renderOrders() {
  const c = document.getElementById('pageContainer');
  c.innerHTML = '<div class="empty-state"><div class="ic">⏳</div>Loading...</div>';
  
  const r = await adminApi('admin/orders.php');
  allOrders = r.data?.orders || [];
  renderOrdersTable();
}

function renderOrdersTable() {
  const c = document.getElementById('pageContainer');
  let filtered = allOrders;
  if (orderFilter.status) filtered = filtered.filter(o => o.status === orderFilter.status);
  if (orderFilter.search) filtered = filtered.filter(o => String(o.id).includes(orderFilter.search) || o.customer_name?.toLowerCase().includes(orderFilter.search.toLowerCase()));
  
  const totalRevenue = filtered.reduce((s, o) => s + Number(o.total_amount), 0);
  
  c.innerHTML = `
    <div class="stats-grid">
      <div class="stat-card"><div class="ic">📦</div><div class="label">Total Orders</div><div class="value">${filtered.length}</div></div>
      <div class="stat-card"><div class="ic">💰</div><div class="label">Total Revenue</div><div class="value">¥${totalRevenue.toLocaleString()}</div></div>
      <div class="stat-card"><div class="ic">⏳</div><div class="label">Pending</div><div class="value">${filtered.filter(o=>o.status==='Pending').length}</div></div>
      <div class="stat-card"><div class="ic">✅</div><div class="label">Delivered</div><div class="value">${filtered.filter(o=>o.status==='Delivered').length}</div></div>
    </div>
    <div class="toolbar">
      <input class="search-input" placeholder="🔍 Search by ID or customer..." oninput="orderFilter.search=this.value;renderOrdersTable()">
      <select class="filter-select" onchange="orderFilter.status=this.value;renderOrdersTable()">
        <option value="">All Status</option>
        <option>Pending</option><option>Processing</option><option>Shipped</option>
        <option>Delivered</option><option>Cancelled</option>
      </select>
    </div>
    <div class="panel">
      <div class="table-wrap">
        <table class="table">
          <thead><tr><th>Order ID</th><th>Customer</th><th>Items</th><th>Total</th><th>Payment</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
          <tbody>
            ${filtered.length ? filtered.map(o => `
              <tr>
                <td><strong>#${o.id}</strong></td>
                <td>${escapeHtml(o.customer_name || '—')}</td>
                <td>${o.items?.length || 0} items</td>
                <td><strong>¥${Number(o.total_amount).toLocaleString()}</strong></td>
                <td>${escapeHtml(o.payment_method || '—')}</td>
                <td><span class="badge-status ${getStatusClass(o.status)}">${o.status}</span></td>
                <td>${new Date(o.created_at).toLocaleDateString()}</td>
                <td class="actions">
                  <button class="btn btn-sm btn-secondary" onclick="viewOrder(${o.id})">👁</button>
                  <select class="filter-select" style="padding:4px 8px;font-size:11px" onchange="updateOrderStatus(${o.id}, this.value)">
                    <option value="">Change...</option>
                    <option ${o.status==='Pending'?'selected':''}>Pending</option>
                    <option ${o.status==='Processing'?'selected':''}>Processing</option>
                    <option ${o.status==='Shipped'?'selected':''}>Shipped</option>
                    <option ${o.status==='Delivered'?'selected':''}>Delivered</option>
                    <option ${o.status==='Cancelled'?'selected':''}>Cancelled</option>
                  </select>
                </td>
              </tr>
            `).join('') : '<tr><td colspan="8" style="text-align:center;padding:40px;color:var(--muted)">No orders</td></tr>'}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

async function updateOrderStatus(id, status) {
  if (!status) return;
  const r = await adminApi('orders/updateStatus.php', 'POST', { id, status });
  if (r.success) {
    adminToast('Order status updated', 'success');
    renderOrders();
  } else {
    adminToast(r.error, 'error');
  }
}

function viewOrder(id) {
  const o = allOrders.find(x => x.id === id);
  if (!o) return;
  showAdminModal(`
    <h3>Order #${o.id}</h3>
    <div style="margin:16px 0">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px">
        <div><strong>Customer:</strong> ${escapeHtml(o.customer_name)}</div>
        <div><strong>Status:</strong> <span class="badge-status ${getStatusClass(o.status)}">${o.status}</span></div>
        <div><strong>Total:</strong> ¥${Number(o.total_amount).toLocaleString()}</div>
        <div><strong>Payment:</strong> ${escapeHtml(o.payment_method)}</div>
        <div><strong>Date:</strong> ${new Date(o.created_at).toLocaleString()}</div>
        ${o.shipping_address ? `<div style="grid-column:1/-1"><strong>Address:</strong> ${escapeHtml(o.shipping_address)}</div>` : ''}
      </div>
      <h4 style="margin-bottom:8px">Items:</h4>
      ${(o.items || []).map(i => `
        <div style="display:flex;gap:10px;padding:8px;background:var(--bg3);border-radius:8px;margin-bottom:6px">
          <div style="width:40px;height:40px;border-radius:6px;background:var(--bg2);overflow:hidden;flex-shrink:0">${i.product_image ? `<img src="../${escapeHtml(i.product_image)}" style="width:100%;height:100%;object-fit:cover">` : ''}</div>
          <div style="flex:1"><strong>${escapeHtml(i.product_name)}</strong><br><small>Qty: ${i.quantity}</small></div>
          <strong>¥${Number(i.price * i.quantity).toLocaleString()}</strong>
        </div>
      `).join('')}
    </div>
    <button class="btn btn-secondary" onclick="closeModal()">Close</button>
  `);
}

function renderPayments() {
  const total = allOrders.reduce((s, o) => s + Number(o.total_amount), 0);
  const byMethod = {};
  allOrders.forEach(o => { byMethod[o.payment_method] = (byMethod[o.payment_method] || 0) + Number(o.total_amount); });
  
  document.getElementById('pageContainer').innerHTML = `
    <div class="stats-grid">
      <div class="stat-card"><div class="ic">💰</div><div class="label">Total Revenue</div><div class="value">¥${total.toLocaleString()}</div></div>
      <div class="stat-card"><div class="ic">📊</div><div class="label">Transactions</div><div class="value">${allOrders.length}</div></div>
    </div>
    <div class="panel">
      <div class="panel-header"><div class="panel-title">Revenue by Payment Method</div></div>
      ${Object.keys(byMethod).length ? Object.entries(byMethod).map(([m, v]) => `
        <div style="padding:12px 0;border-bottom:1px solid var(--border)">
          <div style="display:flex;justify-content:space-between;margin-bottom:6px">
            <strong>${escapeHtml(m)}</strong>
            <strong>¥${v.toLocaleString()}</strong>
          </div>
          <div style="background:var(--bg3);height:8px;border-radius:4px;overflow:hidden">
            <div style="width:${(v/total)*100}%;height:100%;background:linear-gradient(90deg,var(--accent),var(--accent2))"></div>
          </div>
        </div>
      `).join('') : '<p style="color:var(--muted)">No payments yet</p>'}
    </div>
  `;
}
