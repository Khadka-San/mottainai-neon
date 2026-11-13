// ===== Settings =====
async function renderSettings() {
  const c = document.getElementById('pageContainer');
  c.innerHTML = `
    <div class="settings-grid">
      <!-- Store Info -->
      <div class="settings-card">
        <h3>🏪 Store Information</h3>
        <div class="form-group"><label>Store Name</label><input class="form-input" id="setStoreName" value="Mottainai Neon"></div>
        <div class="form-group"><label>Support Email</label><input class="form-input" id="setEmail" value="support@mottainai.com"></div>
        <div class="form-group"><label>Phone</label><input class="form-input" id="setPhone" value="+81-3-1234-5678"></div>
        <div class="form-group"><label>Currency</label>
          <select class="form-select" id="setCurrency">
            <option>¥ JPY</option><option>$ USD</option><option>€ EUR</option><option>£ GBP</option>
          </select>
        </div>
        <div class="form-group"><label>Time Zone</label>
          <select class="form-select" id="setTimezone">
            <option>Asia/Tokyo</option><option>UTC</option><option>America/New_York</option><option>Europe/London</option>
          </select>
        </div>
        <button class="btn btn-primary" onclick="saveSettings()">💾 Save</button>
      </div>
      
      <!-- Notifications -->
      <div class="settings-card">
        <h3>🔔 Notifications</h3>
        <div class="setting-item">
          <div class="info"><div class="label">New Orders</div><div class="desc">Email when new order placed</div></div>
          <div class="switch on" onclick="this.classList.toggle('on')"></div>
        </div>
        <div class="setting-item">
          <div class="info"><div class="label">New Users</div><div class="desc">Notify on new signups</div></div>
          <div class="switch on" onclick="this.classList.toggle('on')"></div>
        </div>
        <div class="setting-item">
          <div class="info"><div class="label">New Messages</div><div class="desc">Alert for chat messages</div></div>
          <div class="switch" onclick="this.classList.toggle('on')"></div>
        </div>
        <div class="setting-item">
          <div class="info"><div class="label">Low Stock</div><div class="desc">Alert when products run out</div></div>
          <div class="switch on" onclick="this.classList.toggle('on')"></div>
        </div>
      </div>
      
      <!-- Payments -->
      <div class="settings-card">
        <h3>💳 Payment Methods</h3>
        <div class="setting-item">
          <div class="info"><div class="label">PayPay</div><div class="desc">Japan mobile payment</div></div>
          <div class="switch on" onclick="this.classList.toggle('on')"></div>
        </div>
        <div class="setting-item">
          <div class="info"><div class="label">Apple Pay</div><div class="desc">iOS payment</div></div>
          <div class="switch on" onclick="this.classList.toggle('on')"></div>
        </div>
        <div class="setting-item">
          <div class="info"><div class="label">Credit Card</div><div class="desc">Visa, Mastercard, etc.</div></div>
          <div class="switch on" onclick="this.classList.toggle('on')"></div>
        </div>
        <div class="setting-item">
          <div class="info"><div class="label">Konbini Pay</div><div class="desc">Convenience store payment</div></div>
          <div class="switch on" onclick="this.classList.toggle('on')"></div>
        </div>
        <div class="setting-item">
          <div class="info"><div class="label">Bank Transfer</div><div class="desc">Direct bank transfer</div></div>
          <div class="switch" onclick="this.classList.toggle('on')"></div>
        </div>
        <div class="setting-item">
          <div class="info"><div class="label">Cash on Pickup</div><div class="desc">Pay when collecting</div></div>
          <div class="switch" onclick="this.classList.toggle('on')"></div>
        </div>
      </div>
      
      <!-- Security -->
      <div class="settings-card">
        <h3>🔒 Security</h3>
        <div class="setting-item">
          <div class="info"><div class="label">Two-Factor Auth</div><div class="desc">Extra login security</div></div>
          <div class="switch" onclick="this.classList.toggle('on')"></div>
        </div>
        <div class="setting-item">
          <div class="info"><div class="label">Login Alerts</div><div class="desc">Notify on new logins</div></div>
          <div class="switch on" onclick="this.classList.toggle('on')"></div>
        </div>
        <div class="form-group" style="margin-top:16px"><label>Session Timeout (minutes)</label>
          <input class="form-input" type="number" value="60">
        </div>
      </div>
      
      <!-- System -->
      <div class="settings-card">
        <h3>⚙️ System</h3>
        <div class="setting-item">
          <div class="info"><div class="label">Maintenance Mode</div><div class="desc">Disable user access</div></div>
          <div class="switch" onclick="this.classList.toggle('on')"></div>
        </div>
        <div class="setting-item">
          <div class="info"><div class="label">Debug Mode</div><div class="desc">Show errors</div></div>
          <div class="switch" onclick="this.classList.toggle('on')"></div>
        </div>
        <div class="setting-item">
          <div class="info"><div class="label">Cache</div><div class="desc">Enable caching</div></div>
          <div class="switch on" onclick="this.classList.toggle('on')"></div>
        </div>
      </div>
      
      <!-- Appearance -->
      <div class="settings-card">
        <h3>🎨 Appearance</h3>
        <div class="form-group"><label>Primary Color</label><input class="form-input" type="color" value="#6366f1"></div>
        <div class="form-group"><label>Items per page</label><input class="form-input" type="number" value="20"></div>
        <div class="form-group"><label>Date Format</label>
          <select class="form-select"><option>YYYY-MM-DD</option><option>MM/DD/YYYY</option><option>DD/MM/YYYY</option></select>
        </div>
      </div>
    </div>
  `;
}

function saveSettings() {
  const settings = {
    storeName: document.getElementById('setStoreName')?.value,
    email: document.getElementById('setEmail')?.value,
    phone: document.getElementById('setPhone')?.value
  };
  localStorage.setItem('mn_admin_settings', JSON.stringify(settings));
  adminToast('Settings saved!', 'success');
}

function renderMaintenance() {
  document.getElementById('pageContainer').innerHTML = `
    <div class="panel" style="max-width:600px">
      <h3 style="margin-bottom:16px">🔧 Maintenance Tools</h3>
      <div style="display:flex;flex-direction:column;gap:12px">
        <button class="btn btn-secondary" onclick="adminToast('Cache cleared!','success')">🗑 Clear Cache</button>
        <button class="btn btn-secondary" onclick="if(confirm('Optimize database?'))adminToast('Database optimized','success')">⚡ Optimize Database</button>
        <button class="btn btn-warning" onclick="if(confirm('Reset all stats?'))adminToast('Stats reset','success')">📊 Reset Statistics</button>
        <button class="btn btn-danger" onclick="if(confirm('This will log you out!'))adminLogout()">🚪 Logout All Admins</button>
      </div>
      <div style="margin-top:24px;padding:16px;background:var(--bg3);border-radius:8px">
        <h4 style="margin-bottom:8px">System Info</h4>
        <div style="font-size:13px;color:var(--muted);line-height:1.8">
          PHP: ${navigator.userAgent.includes('Chrome') ? 'Running' : 'Active'}<br>
          Database: MySQL<br>
          Version: 1.0.0<br>
          Last Backup: Never
        </div>
      </div>
    </div>
  `;
}

function renderLogs() {
  const logs = [
    { ic: '✅', action: 'New order #1234 placed', time: '2 minutes ago' },
    { ic: '👤', action: 'New user registered: john@example.com', time: '15 minutes ago' },
    { ic: '💬', action: 'New message in conversation', time: '1 hour ago' },
    { ic: '📦', action: 'Product "iPhone 12" updated', time: '2 hours ago' },
    { ic: '🔐', action: 'Admin login successful', time: '5 hours ago' }
  ];
  document.getElementById('pageContainer').innerHTML = `
    <div class="panel">
      <div class="panel-header"><div class="panel-title">Recent Activity</div></div>
      ${logs.map(l => `
        <div class="activity-item">
          <div class="activity-icon">${l.ic}</div>
          <div class="activity-info"><div class="action">${l.action}</div><div class="time">${l.time}</div></div>
        </div>
      `).join('')}
    </div>
  `;
}

function renderCoupons() {
  document.getElementById('pageContainer').innerHTML = `
    <div class="panel">
      <div class="panel-header">
        <div class="panel-title">Coupons</div>
        <button class="btn btn-primary" onclick="showCouponForm()">＋ Add Coupon</button>
      </div>
      <div class="table-wrap">
        <table class="table">
          <thead><tr><th>Code</th><th>Discount</th><th>Uses</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            <tr><td><strong style="font-family:monospace">MOTTAINAI10</strong></td><td>10%</td><td>0 / 1000</td><td><span class="badge-status badge-success">Active</span></td><td><button class="btn btn-sm btn-danger">Disable</button></td></tr>
            <tr><td><strong style="font-family:monospace">ECO20</strong></td><td>20%</td><td>0 / 500</td><td><span class="badge-status badge-success">Active</span></td><td><button class="btn btn-sm btn-danger">Disable</button></td></tr>
            <tr><td><strong style="font-family:monospace">WELCOME15</strong></td><td>15%</td><td>0 / 9999</td><td><span class="badge-status badge-success">Active</span></td><td><button class="btn btn-sm btn-danger">Disable</button></td></tr>
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function showCouponForm() {
  showAdminModal(`
    <h3>Add Coupon</h3>
    <div class="form-group"><label>Code</label><input class="form-input" placeholder="SUMMER25"></div>
    <div class="form-row">
      <div class="form-group"><label>Discount %</label><input class="form-input" type="number" value="10"></div>
      <div class="form-group"><label>Max Uses</label><input class="form-input" type="number" value="100"></div>
    </div>
    <div style="display:flex;gap:8px">
      <button class="btn btn-primary" onclick="adminToast('Coupon created!','success');closeModal()">Create</button>
      <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
    </div>
  `);
}
