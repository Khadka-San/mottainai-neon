const CART = {
  items: JSON.parse(localStorage.getItem('mn_cart') || '[]'),
  coupon: JSON.parse(localStorage.getItem('mn_coupon') || 'null'),
  save() { localStorage.setItem('mn_cart', JSON.stringify(this.items)); localStorage.setItem('mn_coupon', JSON.stringify(this.coupon)); this.updateBadge(); },
  add(p) {
    const ex = this.items.find(i => i.id === p.id);
    if (ex) ex.quantity++;
    else this.items.push({ id: p.id, name: p.name, price: p.price, images: p.images || [p.image], quantity: 1 });
    this.save();
  },
  remove(id) { this.items = this.items.filter(i => i.id !== id); this.save(); },
  inc(id) { const it = this.items.find(i => i.id === id); if (it) { it.quantity++; this.save(); } },
  dec(id) { const it = this.items.find(i => i.id === id); if (it) { it.quantity--; if (it.quantity <= 0) this.remove(id); else this.save(); } },
  clear() { this.items = []; this.coupon = null; this.save(); },
  count() { return this.items.reduce((s, i) => s + i.quantity, 0); },
  subtotal() { return this.items.reduce((s, i) => s + i.quantity * Number(i.price), 0); },
  discount() {
    if (!this.coupon) return 0;
    return this.subtotal() * (this.coupon.discount_percent / 100);
  },
  total() { return Math.max(0, this.subtotal() - this.discount()); },
  points() { return Math.floor(this.total() / 10); },
  updateBadge() {
    const b = document.getElementById('cartBadge');
    if (b) { const c = this.count(); b.textContent = c; b.style.display = c > 0 ? 'inline' : 'none'; }
  }
};
