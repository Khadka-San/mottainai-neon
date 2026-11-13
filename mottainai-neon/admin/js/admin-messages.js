// ===== Messages =====
async function renderMessages() {
  const c = document.getElementById('pageContainer');
  c.innerHTML = '<div class="empty-state"><div class="ic">⏳</div>Loading...</div>';
  const r = await adminApi('admin/messages.php');
  const convs = r.data?.conversations || [];
  
  c.innerHTML = `
    <div class="panel">
      <div class="panel-header"><div class="panel-title">All Conversations</div><div style="color:var(--muted);font-size:13px">${convs.length} total</div></div>
      <div class="table-wrap">
        <table class="table">
          <thead><tr><th>Buyer</th><th>Seller</th><th>Product</th><th>Started</th></tr></thead>
          <tbody>
            ${convs.length ? convs.map(c => `
              <tr>
                <td><strong>${escapeHtml(c.buyer_name)}</strong></td>
                <td><strong>${escapeHtml(c.seller_name)}</strong></td>
                <td>${escapeHtml(c.product_name)}</td>
                <td>${new Date(c.last_message_at).toLocaleDateString()}</td>
              </tr>
            `).join('') : '<tr><td colspan="4" style="text-align:center;padding:40px;color:var(--muted)">No conversations yet</td></tr>'}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function renderReviews() {
  const products = dashboardData.products || [];
  document.getElementById('pageContainer').innerHTML = `
    <div class="panel">
      <div class="panel-header"><div class="panel-title">Product Reviews</div></div>
      <div class="table-wrap">
        <table class="table">
          <thead><tr><th>Product</th><th>Rating</th><th>Reviews</th><th>Action</th></tr></thead>
          <tbody>
            ${products.length ? products.map(p => `
              <tr>
                <td><strong>${escapeHtml(p.name)}</strong></td>
                <td>⭐ ${Number(p.rating_avg || 0).toFixed(1)}</td>
                <td>${p.rating_count || 0} reviews</td>
                <td><button class="btn btn-sm btn-secondary" onclick="adminToast('View reviews: ${escapeHtml(p.name)}')">View</button></td>
              </tr>
            `).join('') : '<tr><td colspan="4" style="text-align:center;padding:40px;color:var(--muted)">No products</td></tr>'}
          </tbody>
        </table>
      </div>
    </div>
  `;
}
