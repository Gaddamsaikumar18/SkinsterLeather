'use strict';

/* ================================================================
   LEATHR — Cart Management
   ================================================================ */

    const FREE_SHIP_THRESHOLD = 1500;
    const PROMO_CODES = { 'LEATHR10': 0.10, 'SAVE15': 0.15 };
    let cart = [];
    let promoApplied = null;
    let idCounter = 0;

    function openCart() {
      document.getElementById('cartDrawer').classList.add('open');
      document.getElementById('cartOverlay').classList.add('open');
      document.body.style.overflow = 'hidden';
    }
    function closeCart() {
      document.getElementById('cartDrawer').classList.remove('open');
      document.getElementById('cartOverlay').classList.remove('open');
      document.body.style.overflow = '';
    }

    function addToCartFromCard(btn) {
      const card = btn.closest('.product-card');
      const name = card.dataset.name.split(' ').map(w=>w[0].toUpperCase()+w.slice(1)).join(' ');
      const price = parseInt(card.dataset.price, 10);
      const type  = card.dataset.type;
      const img   = card.dataset.img;
      addItem({ name, price, type, img });
      const orig = btn.textContent;
      btn.textContent = '✓ Added!';
      btn.style.background = '#2a9d8f';
      setTimeout(() => { btn.textContent = orig; btn.style.background = ''; }, 1500);
      const cartBtn = document.getElementById('cartToggleBtn');
      cartBtn.classList.remove('bounce');
      void cartBtn.offsetWidth;
      cartBtn.classList.add('bounce');
      openCart();
    }

    function addItem(product) {
      const existing = cart.find(i => i.name === product.name);
      if (existing) { existing.qty++; }
      else { cart.push({ id: ++idCounter, ...product, qty: 1 }); }
      renderCart();
    }

    function changeQty(id, delta) {
      const item = cart.find(i => i.id === id);
      if (!item) return;
      item.qty += delta;
      if (item.qty <= 0) cart = cart.filter(i => i.id !== id);
      renderCart();
    }

    function removeItem(id) {
      const el = document.getElementById('ci-' + id);
      if (el) {
        el.style.transition = 'all 0.25s ease';
        el.style.opacity = '0';
        el.style.transform = 'translateX(30px)';
        setTimeout(() => { cart = cart.filter(i => i.id !== id); renderCart(); }, 250);
      } else {
        cart = cart.filter(i => i.id !== id);
        renderCart();
      }
    }

    function applyPromo() {
      const code = document.getElementById('promoInput').value.trim().toUpperCase();
      const msg  = document.getElementById('promoMsg');
      const inp  = document.getElementById('promoInput');
      if (PROMO_CODES[code]) {
        promoApplied = code;
        msg.textContent = `✓ Code "${code}" applied — ${PROMO_CODES[code]*100}% off!`;
        msg.className = 'promo-msg success';
        inp.classList.add('applied');
        renderCart();
      } else {
        promoApplied = null;
        msg.textContent = '✗ Invalid code. Try LEATHR10 or SAVE15.';
        msg.className = 'promo-msg error';
        inp.classList.remove('applied');
      }
    }

    function renderCart() {
      const totalItems = cart.reduce((s,i) => s+i.qty, 0);
      const subtotal   = cart.reduce((s,i) => s+i.price*i.qty, 0);
      const discount   = promoApplied ? Math.round(subtotal*PROMO_CODES[promoApplied]) : 0;
      const shipping   = subtotal >= FREE_SHIP_THRESHOLD ? 0 : 299;
      const total      = subtotal - discount + shipping;

      document.getElementById('cartCount').textContent   = totalItems;
      document.getElementById('drawerCount').textContent = totalItems;

      const progress = Math.min(100, (subtotal/FREE_SHIP_THRESHOLD)*100);
      document.getElementById('shipFill').style.width = progress+'%';
      if (subtotal >= FREE_SHIP_THRESHOLD) {
        document.getElementById('shippingMsg').innerHTML = "🎉 You've unlocked <b>free shipping!</b>";
      } else {
        document.getElementById('shippingMsg').innerHTML =
          `Add <b>₹${(FREE_SHIP_THRESHOLD-subtotal).toLocaleString('en-IN')}</b> more for <b>free shipping!</b>`;
      }

      const cartItemsEl = document.getElementById('cartItems');
      const emptyEl     = document.getElementById('cartEmpty');
      if (cart.length === 0) {
        emptyEl.style.display = 'flex';
        cartItemsEl.querySelectorAll('.cart-item').forEach(e => e.remove());
        document.getElementById('cartPromoSection').style.display   = 'none';
        document.getElementById('cartSummarySection').style.display = 'none';
        return;
      }
      emptyEl.style.display = 'none';
      document.getElementById('cartPromoSection').style.display   = 'block';
      document.getElementById('cartSummarySection').style.display = 'block';

      const existing = new Set(cart.map(i => 'ci-'+i.id));
      cartItemsEl.querySelectorAll('.cart-item').forEach(el => { if(!existing.has(el.id)) el.remove(); });
      cart.forEach(item => {
        let el = document.getElementById('ci-'+item.id);
        if (!el) { el = document.createElement('div'); el.className='cart-item'; el.id='ci-'+item.id; cartItemsEl.appendChild(el); }
        el.innerHTML = `
          <div class="cart-item-img"><img src="${item.img}" alt="${item.name}"/></div>
          <div class="cart-item-info">
            <div><div class="cart-item-name">${item.name}</div><div class="cart-item-type">${item.type}</div></div>
            <div class="cart-qty-row">
              <button class="qty-btn" onclick="changeQty(${item.id},-1)">−</button>
              <span class="qty-num">${item.qty}</span>
              <button class="qty-btn" onclick="changeQty(${item.id},1)">+</button>
            </div>
          </div>
          <div class="cart-item-right">
            <span class="cart-item-price">₹${(item.price*item.qty).toLocaleString('en-IN')}</span>
            <button class="cart-remove" onclick="removeItem(${item.id})">🗑</button>
          </div>`;
      });

      document.getElementById('subtotalVal').textContent = '₹'+subtotal.toLocaleString('en-IN');
      document.getElementById('shippingVal').textContent = shipping===0 ? 'FREE 🎉' : '₹'+shipping;
      document.getElementById('totalVal').textContent    = '₹'+total.toLocaleString('en-IN');
      const discRow = document.getElementById('discountRow');
      if (discount > 0) {
        discRow.style.display = 'flex';
        document.getElementById('discountVal').textContent = '−₹'+discount.toLocaleString('en-IN');
        document.querySelector('#discountRow span:first-child').textContent = `Promo (${promoApplied})`;
      } else { discRow.style.display = 'none'; }
    }

    function checkout() {
      if (cart.length === 0) return;
      populatePaymentSummary();
      openPayment();
    }
