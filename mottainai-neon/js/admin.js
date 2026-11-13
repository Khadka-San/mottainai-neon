async function renderAdminSection(section) {
  const body = document.getElementById('adminBody');
  document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
  event?.target?.classList.add('active');
  if (section === 'dashboard') {
    const r = await api('admin/stats.php');
    const d = r.data;
    body.innerHTML = `
      <div class="admin-grid">
        <div class="admin-card"><div class="l">${t('totalRevenue')}</div><div class="v">¥${Number(d.revenue).toLocaleString()}</div></div>
        <div class="admin-card"><div class="l">${t('totalOrders')}</div><div class="v">${d.orders}</div></div>
        <div class="admin-card"><div class="l">${t('customers')}</div><div class="v">${d.customers}</div></div>
        <div class="admin-card"><div class="l">Products</div><div class="v">${d.products}</div></div>
      </div>`;
  } else if (section === 'products') {
    const r = await api('admin/products.php');
    body.innerHTML = `<div class="product-grid">${(r.data.products || []).map(productCardHtml).join('')}</div>`;
  } else if (section === 'orders') {
    const r = await api('admin/orders.php');
    body.innerHTML = (r.data.orders || []).map(o => `
      <div class="card" style="margin-bottom:8px">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <strong>#${o.id}</strong>
          <span class="status-badge status-${o.status}">${o.status}</span>
        </div>
        <div style="display:flex;justify-content:space-between;margin:6px 0"><span>${escapeHtml(o.customer_name)}</span><span style="color:var(--accent)">¥${Number(o.total_amount).toLocaleString()}</span></div>
        <div style="color:var(--muted);font-size:12px">${escapeHtml(o.payment_method)} • ${o.created_at}</div>
      </div>`).join('') || '<div class="empty">No orders</div>';
  } else if (section === 'customers') {
    const r = await api('admin/customers.php');
    body.innerHTML = (r.data.customers || []).map(c => `
      <div class="card" style="margin-bottom:8px;display:flex;justify-content:space-between;align-items:center">
        <div><strong>${escapeHtml(c.name)}</strong><div style="color:var(--muted);font-size:12px">${escapeHtml(c.email)}</div></div>
        <div style="text-align:right"><span class="level-badge ${c.level}">${c.level}</span><div style="color:var(--accent);font-size:12px;margin-top:4px">${c.mottainai_points} ${t('points')}</div></div>
      </div>`).join('') || '<div class="empty">No customers</div>';
  } else if (section === 'messages') {
    const r = await api('admin/messages.php');
    body.innerHTML = (r.data.conversations || []).map(c => `
      <div class="card" style="margin-bottom:8px">
        <strong>${escapeHtml(c.buyer_name)} ↔ ${escapeHtml(c.seller_name)}</strong>
        <div style="color:var(--muted);font-size:12px">${escapeHtml(c.product_name)}</div>
      </div>`).join('') || '<div class="empty">No conversations</div>';
  }
}
