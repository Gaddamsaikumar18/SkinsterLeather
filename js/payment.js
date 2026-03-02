'use strict';

/* ================================================================
   LEATHR — Payment Processing
   ================================================================ */

    let currentPayMethod = 'card';

    function openPayment() {
      document.getElementById('payModal').classList.add('open');
      document.getElementById('payOverlay').classList.add('open');
      document.body.style.overflow = 'hidden';
    }
    function closePayment() {
      document.getElementById('payModal').classList.remove('open');
      document.getElementById('payOverlay').classList.remove('open');
      if (!document.getElementById('cartDrawer').classList.contains('open')) {
        document.body.style.overflow = '';
      }
    }

    function populatePaymentSummary() {
      const subtotal = cart.reduce((s,i) => s+i.price*i.qty, 0);
      const discount = promoApplied ? Math.round(subtotal*PROMO_CODES[promoApplied]) : 0;
      const shipping = subtotal >= FREE_SHIP_THRESHOLD ? 0 : 299;
      const cod      = currentPayMethod === 'cod' ? 49 : 0;
      const total    = subtotal - discount + shipping + cod;

      document.getElementById('payOrderItems').innerHTML = cart.map(item => `
        <div class="pay-order-item">
          <div class="poi-img"><img src="${item.img}" alt="${item.name}"/></div>
          <div class="poi-info">
            <div class="poi-name">${item.name}</div>
            <div class="poi-type">${item.type}</div>
            <div class="poi-qty">Qty: ${item.qty}</div>
          </div>
          <div class="poi-price">₹${(item.price*item.qty).toLocaleString('en-IN')}</div>
        </div>`).join('');

      document.getElementById('paySubtotal').textContent = '₹'+subtotal.toLocaleString('en-IN');
      document.getElementById('payShipping').textContent = shipping===0 ? 'FREE 🎉' : '₹'+shipping;
      document.getElementById('payTotal').textContent    = '₹'+total.toLocaleString('en-IN');
      document.getElementById('payNowBtn').innerHTML     = `🔒 Pay ₹${total.toLocaleString('en-IN')}`;

      const discRow = document.getElementById('payDiscountRow');
      if (discount > 0) {
        discRow.style.display = 'flex';
        document.getElementById('payDiscount').textContent    = '−₹'+discount.toLocaleString('en-IN');
        document.getElementById('payPromoLabel').textContent  = `Promo (${promoApplied})`;
      } else { discRow.style.display = 'none'; }
      document.getElementById('payCodRow').style.display = cod > 0 ? 'flex' : 'none';
    }

    function selectMethod(method, el) {
      currentPayMethod = method;
      document.querySelectorAll('.pay-method').forEach(m => m.classList.remove('active'));
      el.classList.add('active');
      document.getElementById('cardPanel').style.display   = method==='card'   ? 'block' : 'none';
      document.getElementById('upiPanel').className        = 'upi-panel'   +(method==='upi'    ?' visible':'');
      document.getElementById('walletPanel').className     = 'wallet-panel'+(method==='wallet' ?' visible':'');
      document.getElementById('codPanel').className        = 'cod-panel'   +(method==='cod'    ?' visible':'');
      populatePaymentSummary();
    }
    function selectUpi(el)    { document.querySelectorAll('.upi-app').forEach(a=>a.classList.remove('active'));    el.classList.add('active'); }
    function selectWallet(el) { document.querySelectorAll('.wallet-item').forEach(w=>w.classList.remove('active')); el.classList.add('active'); }

    function formatCard(inp) {
      let v = inp.value.replace(/\D/g,'').slice(0,16);
      inp.value = v.replace(/(.{4})/g,'$1 ').trim();
      const display = (v+'•'.repeat(Math.max(0,16-v.length))).replace(/(.{4})/g,'$1 ').trim();
      document.getElementById('cpNumber').textContent = display;
      const net = v[0]==='4'?'VISA':v[0]==='5'?'MC':v.startsWith('6')?'RuPay':'CARD';
      document.getElementById('cpNetwork').textContent = net;
      document.getElementById('cardType').value = net==='VISA'?'Visa':net==='MC'?'Mastercard':net==='RuPay'?'RuPay':'';
    }
    function formatExpiry(inp) {
      let v = inp.value.replace(/\D/g,'');
      if (v.length>=2) v = v.slice(0,2)+' / '+v.slice(2,4);
      inp.value = v;
      document.getElementById('cpExpiry').textContent = v||'MM/YY';
    }
    function updateCardPreview() {
      document.getElementById('cpName').textContent = (document.getElementById('cardName').value||'YOUR NAME').toUpperCase();
    }

    /* ── Process Payment → save to DB ── */
    async function processPayment() {
      const btn = document.getElementById('payNowBtn');
      btn.disabled = true;
      btn.innerHTML = '<span style="display:inline-block;animation:spin 0.8s linear infinite">⏳</span> Processing…';

      const subtotal  = cart.reduce((s,i) => s+i.price*i.qty, 0);
      const discount  = promoApplied ? Math.round(subtotal*PROMO_CODES[promoApplied]) : 0;
      const shipping  = subtotal >= FREE_SHIP_THRESHOLD ? 0 : 299;
      const cod       = currentPayMethod==='cod' ? 49 : 0;
      const total     = subtotal - discount + shipping + cod;

      const now       = new Date().toISOString();
      const orderId   = 'LTH-'+Math.floor(100000+Math.random()*900000);
      const paymentId = 'PAY-'+Math.floor(100000+Math.random()*900000);
      const g = id => (document.getElementById(id)||{}).value||'';

      const orderRecord = {
        orderId, paymentId, createdAt: now, status: 'confirmed',
        customer: { firstName: g('addrFirst')||'Guest', lastName: g('addrLast'), phone: g('addrPhone'), email: 'customer@leathr.com' },
        customerEmail: 'customer@leathr.com',
        address: { street: g('addrStreet'), city: g('addrCity'), state: g('addrState'), pin: g('addrPin') },
        items: cart.map(i => ({ name:i.name, type:i.type, price:i.price, qty:i.qty, lineTotal:i.price*i.qty, img:i.img })),
        subtotal, discount, promoCode: promoApplied||null, shipping, codFee: cod, total
      };

      const getDetails = () => {
        if (currentPayMethod==='card') {
          const num = (document.getElementById('cardNumber')||{}).value||'';
          return { last4: num.replace(/\s/g,'').slice(-4)||'****', network: document.getElementById('cpNetwork').textContent, expiry: g('cardExpiry') };
        }
        if (currentPayMethod==='upi')    return { upiId: g('upiId')||'user@upi' };
        if (currentPayMethod==='wallet') { const a=document.querySelector('.wallet-item.active'); return { wallet: a?a.textContent.trim():'Wallet' }; }
        return { note: 'Cash on Delivery' };
      };

      const paymentRecord = {
        paymentId, orderId, createdAt: now,
        method: currentPayMethod, status: 'success',
        amount: total, currency: 'INR',
        details: getDetails()
      };

      setTimeout(async () => {
        try {
          await saveOrderAndPayment(orderRecord, paymentRecord);
          console.log('✅ Saved to IndexedDB — Order:', orderId, '| Payment:', paymentId);
        } catch(err) { console.error('DB error:', err); }

        document.getElementById('payFormWrap').style.display = 'none';
        document.getElementById('paySuccess').classList.add('visible');
        document.getElementById('successOrderId').textContent = 'Order #'+orderId;
        btn.disabled = false;
      }, 2200);
    }

    function resetAll() {
      cart = []; promoApplied = null;
      document.getElementById('promoInput').value = '';
      document.getElementById('promoInput').classList.remove('applied');
      document.getElementById('promoMsg').className = 'promo-msg';
      renderCart();
      document.getElementById('payFormWrap').style.display = 'block';
      document.getElementById('paySuccess').classList.remove('visible');
      document.getElementById('payNowBtn').innerHTML = '🔒 Pay Now';
      document.getElementById('cpNumber').textContent = '•••• •••• •••• ••••';
      document.getElementById('cpName').textContent   = 'YOUR NAME';
      document.getElementById('cpExpiry').textContent = 'MM/YY';
      document.getElementById('cpNetwork').textContent= 'VISA';
      ['cardNumber','cardName','cardExpiry','cardCvv','cardType','upiId',
       'addrFirst','addrLast','addrStreet','addrCity','addrState','addrPin','addrPhone']
        .forEach(id => { const el=document.getElementById(id); if(el) el.value=''; });
      closeCart();
    }
