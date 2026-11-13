let selectedRating = 0;
async function loadReviews(productId) {
  const r = await api(`reviews/get.php?product_id=${productId}`);
  const list = r.data?.reviews || [];
  const wrap = document.getElementById('reviewsList');
  if (!wrap) return;
  if (!list.length) { wrap.innerHTML = `<div class="empty" style="padding:20px">No reviews yet</div>`; return; }
  wrap.innerHTML = list.map(rv => `
    <div class="review-item">
      <div class="review-header">
        <div class="avatar-mini">${escapeHtml(rv.avatar_initial || '?')}</div>
        <div style="flex:1">
          <strong>${escapeHtml(rv.user_name)}</strong>
          <div>${renderStars(rv.rating)}</div>
        </div>
        <div style="color:var(--muted);font-size:11px">${formatDate(rv.created_at)}</div>
      </div>
      ${rv.comment ? `<div style="font-size:13px;color:var(--muted)">${escapeHtml(rv.comment)}</div>` : ''}
    </div>
  `).join('');
}
function showReviewModal(productId) {
  if (!AUTH.require()) return;
  selectedRating = 0;
  showModal(`
    <h3>${t('writeReview')}</h3>
    <div style="text-align:center;margin:12px 0">
      ${[1,2,3,4,5].map(n => `<span class="star" data-n="${n}" onclick="selectedRating=${n};this.parentNode.querySelectorAll('.star').forEach(s=>s.classList.toggle('active',s.dataset.n<=${n}))">★</span>`).join('')}
    </div>
    <textarea id="reviewComment" class="textarea" placeholder="Comment (optional)"></textarea>
    <button class="btn btn-primary btn-full" onclick="submitReview(${productId})">${t('submit')}</button>
  `);
}
async function submitReview(productId) {
  if (!selectedRating) return toast('Select a rating', 'error');
  const comment = document.getElementById('reviewComment')?.value || '';
  const r = await api('reviews/add.php', 'POST', { product_id: productId, user_id: AUTH.user.id, rating: selectedRating, comment });
  if (r.success) { toast('Review posted!', 'success', '⭐'); closeModal(); loadReviews(productId); }
}
