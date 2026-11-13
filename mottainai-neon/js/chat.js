let chatPollInterval = null;
async function openChat(cid) {
  STATE.currentConversation = { id: cid };
  showScreen('chat');
  await loadMessages(cid);
  await api('chat/markMessagesRead.php', 'POST', { conversation_id: cid, user_id: AUTH.user.id });
  if (chatPollInterval) clearInterval(chatPollInterval);
  chatPollInterval = setInterval(() => loadMessages(cid, true), 3000);
}
async function loadMessages(cid, silent = false) {
  const r = await api(`chat/getMessages.php?conversation_id=${cid}`);
  const msgs = r.data?.messages || [];
  const box = document.getElementById('chatMessages');
  box.innerHTML = msgs.length ? msgs.map(m => `
    <div class="msg ${m.sender_id == AUTH.user.id ? 'mine' : 'theirs'}">
      ${escapeHtml(m.message)}
      <div class="msg-time">${formatTime(m.created_at)}</div>
    </div>`).join('') : `<div class="empty"><div class="ic">💬</div>${t('noMessages')}</div>`;
  if (!silent) box.scrollTop = box.scrollHeight;
  else { if (box.scrollHeight - box.scrollTop - box.clientHeight < 100) box.scrollTop = box.scrollHeight; }
}
async function sendMessage() {
  const input = document.getElementById('chatInput');
  const msg = input.value.trim();
  if (!msg || !STATE.currentConversation) return;
  await api('chat/sendMessage.php', 'POST', { conversation_id: STATE.currentConversation.id, sender_id: AUTH.user.id, message: msg });
  input.value = '';
  await loadMessages(STATE.currentConversation.id);
}
async function renderMessagesScreen() {
  const list = document.getElementById('conversationsList');
  if (!list) return;
  if (!AUTH.isSignedIn()) {
    list.innerHTML = `<div class="empty"><div class="ic">🔒</div>${t('onlySignedIn')}</div>`;
    document.getElementById('msgBadge').style.display = 'none';
    return;
  }
  const r = await api(`chat/getConversations.php?user_id=${AUTH.user.id}`);
  const convs = r.data?.conversations || [];
  const totalUnread = convs.reduce((s, c) => s + Number(c.unread || 0), 0);
  const b = document.getElementById('msgBadge');
  if (b) { b.textContent = totalUnread; b.style.display = totalUnread > 0 ? 'inline' : 'none'; }
  if (!convs.length) { list.innerHTML = `<div class="empty"><div class="ic">💬</div>${t('noMessages')}</div>`; return; }
  list.innerHTML = convs.map(c => {
    const other = AUTH.user.id == c.buyer_id ? c.seller_name : c.buyer_name;
    return `
    <div class="conversation-item" onclick="openChat(${c.id})">
      <div class="avatar-sm">${escapeHtml((other||'?').charAt(0))}</div>
      <div class="conv-info">
        <div class="n">${escapeHtml(other)}</div>
        <div class="p">${escapeHtml(c.product_name || '')} • ${escapeHtml(c.last_message || '').slice(0, 30)}</div>
      </div>
      ${Number(c.unread) > 0 ? `<span class="badge">${c.unread}</span>` : ''}
    </div>`;
  }).join('');
}
