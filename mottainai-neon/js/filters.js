const FILTERS = {
  category: 'All',
  search: '',
  min_price: 0,
  max_price: 0,
  condition: '',
  sort: 'new',
  only_free: false
};

function showFilterModal() {
  showModal(`
    <h3>${t('filters')}</h3>
    <div class="filter-section">
      <h4>${t('price')}</h4>
      <div class="price-inputs">
        <input type="number" id="fMin" class="input" placeholder="Min ¥" value="${FILTERS.min_price || ''}">
        <span>—</span>
        <input type="number" id="fMax" class="input" placeholder="Max ¥" value="${FILTERS.max_price || ''}">
      </div>
    </div>
    <div class="filter-section">
      <h4>${t('condition')}</h4>
      <div class="chip-row">
        ${['', 'New', 'Like New', 'Used'].map(c => `<div class="cat-chip ${FILTERS.condition === c ? 'active' : ''}" onclick="FILTERS.condition='${c}';this.parentNode.querySelectorAll('.cat-chip').forEach(x=>x.classList.remove('active'));this.classList.add('active')">${c || t('all')}</div>`).join('')}
      </div>
    </div>
    <div class="filter-section">
      <h4>${t('sortBy')}</h4>
      <select id="fSort" class="select">
        <option value="new" ${FILTERS.sort==='new'?'selected':''}>${t('newest')}</option>
        <option value="price_low" ${FILTERS.sort==='price_low'?'selected':''}>${t('priceLow')}</option>
        <option value="price_high" ${FILTERS.sort==='price_high'?'selected':''}>${t('priceHigh')}</option>
        <option value="rating" ${FILTERS.sort==='rating'?'selected':''}>${t('rating')}</option>
        <option value="popular" ${FILTERS.sort==='popular'?'selected':''}>${t('popular')}</option>
      </select>
    </div>
    <div style="display:flex;gap:8px">
      <button class="btn btn-secondary btn-full" onclick="resetFilters();closeModal()">${t('reset')}</button>
      <button class="btn btn-primary btn-full" onclick="applyFilters()">${t('apply')}</button>
    </div>
  `);
}
function applyFilters() {
  FILTERS.min_price = Number(document.getElementById('fMin')?.value || 0);
  FILTERS.max_price = Number(document.getElementById('fMax')?.value || 0);
  FILTERS.sort = document.getElementById('fSort')?.value || 'new';
  closeModal();
  loadProducts();
}
function resetFilters() {
  FILTERS.min_price = 0; FILTERS.max_price = 0; FILTERS.condition = ''; FILTERS.sort = 'new';
  loadProducts();
}
