// ===== Users Management =====
let allUsers = [];

async function renderUsers() {
  const c = document.getElementById('pageContainer');
  c.innerHTML = '<div class="empty-state"><div class="ic">⏳</div>Loading...</div>';
  const r = await adminApi('admin/customers.php');
  allUsers = r.data?.customers || [];
  renderUsersTable();
}

function renderUsersTable() {
  const c = document.getElementById('pageContainer');
  c.innerHTML = `
    <div class="toolbar">
      <input class="search-input" placeholder="🔍 Search users..." oninput="filterUsers(this.value)">
      <button class="btn btn-primary" onclick="exportUsers()">📥 Export CSV</button>
    </div>
    <div class="panel">
      <div class="table-wrap">
        <table class="table" id="usersTable">
          <thead><tr><th>User</th><th>Email</th><th>Level</th><th>Points</th><th>Joined</th><th>Actions</th></tr></thead>
          <tbody>
            ${allUsers.map(u => `
              <tr>
                <td><div style="display:flex;align-items:center;gap:10px"><div class="avatar" style="width:36px;height:36px;font-size:14px">${(u.avatar_initial || u.name.charAt(0)).toUpperCase()}</div><strong>${escapeHtml(u.name)}</strong></div></td>
                <td>${escapeHtml(u.email)}</td>
                <td><span class="badge-status ${u.level==='Platinum'?'badge-info':u.level==='Gold'?'badge-warning':'badge-default'}">${u.level}</span></td>
                <td>${u.mottainai_points} pts</td>
                <td>${new Date(u.created_at).toLocaleDateString()}</td>
                <td><button class="btn btn-sm btn-secondary" onclick="viewUser(${u.id})">View</button></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function filterUsers(q) {
  document.querySelectorAll('#usersTable tbody tr').forEach(r => {
    r.style.display = r.textContent.toLowerCase().includes(q.toLowerCase()) ? '' : 'none';
  });
}

function viewUser(id) {
  const u = allUsers.find(x => x.id === id);
  if (!u) return;
  showAdminModal(`
    <h3>User Details</h3>
    <div style="text-align:center;margin:20px 0">
      <div class="avatar" style="width:80px;height:80px;font-size:32px;margin:0 auto">${(u.avatar_initial||u.name.charAt(0)).toUpperCase()}</div>
      <h2 style="margin-top:10px">${escapeHtml(u.name)}</h2>
      <p style="color:var(--muted)">${escapeHtml(u.email)}</p>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
      <div><strong>Level:</strong> ${u.level}</div>
      <div><strong>Points:</strong> ${u.mottainai_points}</div>
      <div><strong>Joined:</strong> ${new Date(u.created_at).toLocaleDateString()}</div>
    </div>
    <button class="btn btn-secondary" onclick="closeModal()" style="margin-top:16px">Close</button>
  `);
}

function exportUsers() {
  let csv = 'Name,Email,Level,Points,Joined\n';
  allUsers.forEach(u => csv += `${u.name},${u.email},${u.level},${u.mottainai_points},${u.created_at}\n`);
  const blob = new Blob([csv], { type: 'text/csv' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = 'users.csv'; a.click();
  adminToast('Exported!', 'success');
}
