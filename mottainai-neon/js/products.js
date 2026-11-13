let currentProducts = [];

async function loadProducts() {
  const params = new URLSearchParams();
  if (FILTERS.category && FILTERS.category !== 'All') params.set('category', FILTERS.category);
  if (FILTERS.search) params.set('search', FILTERS.search);
  if (FILTERS.only_free) params.set('free', '1');
  if (FILTERS.min_price) params.set('min_price', FILTERS.min_price);
  if (FILTERS.max_price) params.set('max_price', FILTERS.max_price);
  if (FILTERS.condition) params.set('condition', FILTERS.condition);
  if (FILTERS.sort) params.set('sort', FILTERS.sort);
  const r = await api('products/get.php?' + params.toString());
  currentProducts = r.data?.products || [];
  renderProducts();
  renderRecentlyViewed();
}

function productCardHtml(p) {
  const imgSrc = p.images?.[0] || p.main_image || '';
  const img = imgSrc
    ? `<img src="${escapeHtml(imgSrc)}" onerror="this.parentElement.innerHTML='${(p.name||'?').charAt(0).toUpperCase()}'">`
    : placeholderImage(p.name);
  const isFav = STATE.favorites.includes(Number(p.id));
  const tags = [];
  if (p.is_free == 1) tags.push(`<div class="tag tag-free">${t('free2')}</div>`);
  if (p.is_eco == 1) tags.push(`<div class="tag tag-eco">${t('ecoTag')}</div>`);
  if (p.original_price > p.price && p.price > 0) {
    const pct = Math.round((1 - p.price / p.original_price) * 100);
    tags.push(`<div class="tag tag-discount">-${pct}%</div>`);
  }
  if (p.rating_count > 5) tags.push(`<div class="tag tag-hot">${t('hot')}</div>`);
  return `
    <div class="product-card" onclick="openProduct(${p.id})">
      <div class="product-image">
        <div class="product-tags">${tags.join('')}</div>
        ${img}
        <button class="fav-btn ${isFav ? 'active' : ''}" onclick="event.stopPropagation();toggleFav(${p.id})">${isFav ? '❤️' : '🤍'}</button>
      </div>
      <div class="product-info">
        <div class="product-name">${escapeHtml(p.name)}</div>
        <div class="product-price">
          ${p.is_free == 1 ? t('free2') : '¥' + Number(p.price).toLocaleString()}
          ${p.original_price > p.price ? `<span class="original">¥${Number(p.original_price).toLocaleString()}</span>` : ''}
        </div>
        <div class="product-meta">
          ${renderStars(p.rating_avg || 0)} ${p.rating_count || 0} • ${escapeHtml(p.location || '')}
        </div>
      </div>
    </div>`;
}

function renderProducts() {
  const grid = document.getElementById('productGrid') || document.getElementById('productGrid2');
  if (!grid) return;
  if (!currentProducts.length) {
    grid.innerHTML = `<div class="empty" style="grid-column:1/-1;"><div class="ic">📦</div>No products</div>`;
    return;
  }
  grid.innerHTML = currentProducts.map(productCardHtml).join('');
}

async function openProduct(id) {
  const r = await api('products/get.php');
  const p = (r.data?.products || []).find(x => Number(x.id) === Number(id));
  if (!p) return;
  STATE.currentProduct = p;
  await api(`products/view.php?id=${id}&user_id=${AUTH.user.id || 0}`);
  const imgs = p.images || [];
  document.getElementById('detailMainImage').innerHTML = imgs[0]
    ? `<img src="${escapeHtml(imgs[0])}" onclick="zoomImage('${escapeHtml(imgs[0])}')">`
    : placeholderImage(p.name);
  document.getElementById('detailGallery').innerHTML = imgs.map(src => `
    <div class="image-thumb" onclick="document.getElementById('detailMainImage').innerHTML='<img src=\\'${escapeHtml(src)}\\' onclick=zoomImage(\\'${escapeHtml(src)}\\')>'"><img src="${escapeHtml(src)}"></div>
  `).join('');
  document.getElementById('detailName').textContent = p.name;
  document.getElementById('detailPrice').innerHTML = (p.is_free == 1 ? t('free2') : '¥' + Number(p.price).toLocaleString()) + (p.original_price > p.price ? ` <span class="original">¥${Number(p.original_price).toLocaleString()}</span>` : '');
  document.getElementById('detailCategory').textContent = p.category;
  document.getElementById('detailCondition').textContent = p.condition_label;
  document.getElementById('detailDescription').textContent = p.description || '—';
  document.getElementById('detailSeller').innerHTML = `${escapeHtml(p.seller_name)} <span class="level-badge ${p.seller_level || 'Bronze'}">${p.seller_level || 'Bronze'}</span>`;
  document.getElementById('detailLocation').textContent = p.location || '—';
  document.getElementById('detailRating').innerHTML = `${renderStars(p.rating_avg || 0)} <span style="color:var(--muted);font-size:12px">(${p.rating_count || 0} ${t('reviews')})</span>`;
  document.getElementById('detailViews').textContent = p.views + ' views';
  loadReviews(id);
  showScreen('product');
}

function zoomImage(src) {
  showModal(`<img src="${escapeHtml(src)}" class="zoom-img" onclick="closeModal()">`);
}

function addCurrentToCart() {
  const p = STATE.currentProduct; if (!p) return;
  CART.add({ id: p.id, name: p.name, price: p.is_free == 1 ? 0 : p.price, images: p.images });
  toast(t('addedToCart'), 'success', '🛒');
}

async function contactSeller() {
  if (!AUTH.require()) return;
  const p = STATE.currentProduct;
  const r = await api('chat/createConversation.php', 'POST', { product_id: p.id, buyer_id: AUTH.user.id, seller_id: p.user_id });
  if (r.success) { STATE.currentConversation = { id: r.data.id }; openChat(r.data.id); }
}

async function toggleFav(id) {
  if (!AUTH.isSignedIn()) return toast(t('loginRequired'), 'error', '🔒');
  const r = await api('favorites/toggle.php', 'POST', { user_id: AUTH.user.id, product_id: id });
  if (r.success) {
    if (r.data.favorited) { STATE.favorites.push(id); toast(t('productAdded'), 'success', '❤️'); }
    else { STATE.favorites = STATE.favorites.filter(x => x !== id); toast(t('removedFromFav')); }
    saveFavLocal(); renderProducts();
  }
}

function saveFavLocal() {
  if (AUTH.isSignedIn()) localStorage.setItem('mn_favs_' + AUTH.user.id, JSON.stringify(STATE.favorites));
}
function loadFavorites() {
  if (!AUTH.isSignedIn()) { STATE.favorites = []; return; }
  STATE.favorites = JSON.parse(localStorage.getItem('mn_favs_' + AUTH.user.id) || '[]');
}

async function renderRecentlyViewed() {
  if (!AUTH.isSignedIn()) return;
  const r = await api('products/get.php?sort=popular');
  const wrap = document.getElementById('recentViewed');
  if (!wrap) return;
  const list = (r.data?.products || []).slice(0, 4);
  wrap.innerHTML = `<h3 style="margin:16px 0 10px;font-size:14px;color:var(--muted)">${t('recentlyViewed')}</h3>
    <div style="display:flex;gap:8px;overflow-x:auto;padding-bottom:8px">${list.map(productCardHtml).join('')}</div>`;
}
