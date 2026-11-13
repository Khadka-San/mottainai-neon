async function applyCoupon() {
  const code = document.getElementById('couponInput')?.value.trim();
  if (!code) return toast('Enter coupon code', 'error');
  const r = await api(`coupons/apply.php?code=${encodeURIComponent(code)}`);
  if (!r.success) return toast(r.error, 'error');
  CART.coupon = r.data.coupon;
  CART.save();
  toast(t('couponApplied'), 'success', '🎟');
  renderCart();
}
