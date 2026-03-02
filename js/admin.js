'use strict';

/* ================================================================
   LEATHR — Admin Dashboard
   ================================================================ */

    let adminCurrentTab  = 'orders';
    let adminAllOrders   = [];
    let adminAllPayments = [];

    async function openAdmin() {
      document.getElementById('adminModal').classList.add('open');
      document.getElementById('adminOverlay').classList.add('open');
      document.body.style.overflow = 'hidden';
      await refreshAdmin();
    }
    function closeAdmin() {
      document.getElementById('adminModal').classList.remove('open');
      document.getElementById('adminOverlay').classList.remove('open');
      document.body.style.overflow = '';
    }
    async function refreshAdmin() {
      try {
        adminAllOrders   = await dbGetAll('orders');
        adminAllPayments = await dbGetAll('payments');
        adminAllOrders.sort((a,b)   => new Date(b.createdAt)-new Date(a.createdAt));
        adminAllPayments.sort((a,b) => new Date(b.createdAt)-new Date(a.createdAt));
      } catch(e) { adminAllOrders=[]; adminAllPayments=[]; }
      updateAdminStats();
      renderAdminTable();
    }
    function updateAdminStats() {
      const revenue = adminAllOrders.reduce((s,o)=>s+(o.total||0), 0);
      const pending = adminAllOrders.filter(o=>o.status==='pending').length;
      const failed  = adminAllPayments.filter(p=>p.status==='failed').length;
      document.getElementById('statOrders').textContent   = adminAllOrders.length;
      document.getElementById('statRevenue').textContent  = '₹'+revenue.toLocaleString('en-IN');
      document.getElementById('statPending').textContent  = pending;
      document.getElementById('statPayments').textContent = adminAllPayments.length;
      document.getElementById('statFailed').textContent   = failed;
    }
    function switchAdminTab(tab) {
      adminCurrentTab = tab;
      document.getElementById('tabOrders').classList.toggle('active',   tab==='orders');
      document.getElementById('tabPayments').classList.toggle('active', tab==='payments');
      document.getElementById('tabSettings').classList.toggle('active', tab==='settings');

      const isSettings = tab === 'settings';
      document.getElementById('adminTableWrap').style.display   = isSettings ? 'none'  : 'block';
      document.getElementById('adminTableActions').style.display= isSettings ? 'none'  : 'flex';
      document.getElementById('settingsWrap').classList.toggle('visible', isSettings);
      document.getElementById('settingsSaveBar').classList.toggle('visible', isSettings && settingsUnsaved);

      if (!isSettings) {
        document.getElementById('adminSearch').value = '';
        renderAdminTable();
      }
    }
    function filterAdminTable() { renderAdminTable(); }

    function fmt(iso) {
      if (!iso) return '—';
      const d = new Date(iso);
      return d.toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'})
            +' '+d.toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'});
    }

    function renderAdminTable() {
      const wrap   = document.getElementById('adminTableWrap');
      const search = document.getElementById('adminSearch').value.toLowerCase();
      const data   = adminCurrentTab==='orders' ? adminAllOrders : adminAllPayments;
      const filtered = search ? data.filter(r=>JSON.stringify(r).toLowerCase().includes(search)) : data;
      document.getElementById('adminRecordCount').innerHTML = `Records: <strong>${filtered.length}</strong>`;

      if (filtered.length === 0) {
        wrap.innerHTML = `<div class="admin-empty">
          <div class="admin-empty-icon">${adminCurrentTab==='orders'?'📦':'💳'}</div>
          <div class="admin-empty-title">No ${adminCurrentTab} found</div>
          <div class="admin-empty-sub">${search?'No records match your search.':'Place an order to see records here.'}</div>
        </div>`; return;
      }
      adminCurrentTab==='orders' ? renderOrdersTable(wrap,filtered) : renderPaymentsTable(wrap,filtered);
    }

    function renderOrdersTable(wrap, orders) {
      wrap.innerHTML = `<table class="admin-table"><thead><tr>
        <th>Order ID</th><th>Date & Time</th><th>Customer</th><th>Items</th>
        <th>Subtotal</th><th>Shipping</th><th>Discount</th><th>Total</th><th>Status</th><th>Payment ID</th>
      </tr></thead><tbody id="ordersBody"></tbody></table>`;
      const tbody = document.getElementById('ordersBody');
      orders.forEach(o => {
        const ic  = (o.items||[]).reduce((s,i)=>s+i.qty,0);
        const row = document.createElement('tr');
        row.onclick = () => toggleDetail('od-'+o.orderId);
        row.innerHTML = `
          <td class="td-mono">${o.orderId}</td>
          <td>${fmt(o.createdAt)}</td>
          <td class="td-bold">${(o.customer?.firstName||'')} ${(o.customer?.lastName||'')}</td>
          <td>${ic} item${ic!==1?'s':''}</td>
          <td>₹${(o.subtotal||0).toLocaleString('en-IN')}</td>
          <td>${o.shipping===0?'<span style="color:var(--teal);font-weight:700">FREE</span>':'₹'+(o.shipping||0)}</td>
          <td>${o.discount>0?`<span style="color:var(--teal)">−₹${o.discount.toLocaleString('en-IN')}</span>`:'—'}</td>
          <td class="td-bold">₹${(o.total||0).toLocaleString('en-IN')}</td>
          <td><span class="status-badge status-${o.status||'pending'}">${o.status||'—'}</span></td>
          <td class="td-mono" style="font-size:0.68rem">${o.paymentId||'—'}</td>`;
        tbody.appendChild(row);
        const dr = document.createElement('tr');
        dr.className='detail-row'; dr.id='od-'+o.orderId;
        const items = (o.items||[]).map(i=>`<div class="detail-item"><span>${i.name} ×${i.qty}</span><span>₹${(i.lineTotal||i.price*i.qty).toLocaleString('en-IN')}</span></div>`).join('');
        dr.innerHTML=`<td colspan="10" class="detail-cell"><div class="detail-grid">
          <div class="detail-section">
            <div class="detail-section-title">📦 Items</div>
            <div class="detail-items-list">${items}</div>
          </div>
          <div class="detail-section">
            <div class="detail-section-title">🏠 Delivery Address</div>
            <div class="detail-kv"><span>Name</span><span>${(o.customer?.firstName||'')} ${(o.customer?.lastName||'')}</span></div>
            <div class="detail-kv"><span>Phone</span><span>${o.customer?.phone||'—'}</span></div>
            <div class="detail-kv"><span>Street</span><span>${o.address?.street||'—'}</span></div>
            <div class="detail-kv"><span>City / State</span><span>${o.address?.city||'—'}, ${o.address?.state||'—'}</span></div>
            <div class="detail-kv"><span>PIN</span><span>${o.address?.pin||'—'}</span></div>
          </div>
          <div class="detail-section">
            <div class="detail-section-title">💰 Billing</div>
            <div class="detail-kv"><span>Subtotal</span><span>₹${(o.subtotal||0).toLocaleString('en-IN')}</span></div>
            <div class="detail-kv"><span>Shipping</span><span>${o.shipping===0?'FREE':'₹'+(o.shipping||0)}</span></div>
            ${o.discount>0?`<div class="detail-kv"><span>Discount (${o.promoCode})</span><span style="color:var(--teal)">−₹${o.discount.toLocaleString('en-IN')}</span></div>`:''}
            ${o.codFee>0?`<div class="detail-kv"><span>COD Fee</span><span>₹${o.codFee}</span></div>`:''}
            <div class="detail-kv" style="border-top:1px solid var(--border);padding-top:6px;margin-top:4px"><span><b>Total</b></span><span><b>₹${(o.total||0).toLocaleString('en-IN')}</b></span></div>
            <div class="detail-kv" style="margin-top:8px"><span>Payment ID</span><span style="font-family:monospace;font-size:0.7rem;color:var(--navy)">${o.paymentId||'—'}</span></div>
          </div>
        </div></td>`;
        tbody.appendChild(dr);
      });
    }

    function renderPaymentsTable(wrap, payments) {
      wrap.innerHTML = `<table class="admin-table"><thead><tr>
        <th>Payment ID</th><th>Order ID</th><th>Date & Time</th><th>Method</th>
        <th>Amount</th><th>Currency</th><th>Status</th><th>Details</th>
      </tr></thead><tbody id="paymentsBody"></tbody></table>`;
      const tbody = document.getElementById('paymentsBody');
      const icons = {card:'💳',upi:'📱',wallet:'👛',cod:'🏠'};
      payments.forEach(p => {
        const icon = icons[p.method]||'💳';
        const det  = p.details
          ? (p.details.last4?`•••• ${p.details.last4} (${p.details.network||''})`:
             p.details.upiId?p.details.upiId:
             p.details.wallet?p.details.wallet:
             p.details.note||'—') : '—';
        const row = document.createElement('tr');
        row.onclick = () => toggleDetail('pd-'+p.paymentId);
        row.innerHTML=`
          <td class="td-mono">${p.paymentId}</td>
          <td class="td-mono" style="font-size:0.7rem">${p.orderId}</td>
          <td>${fmt(p.createdAt)}</td>
          <td><span class="method-badge">${icon} ${(p.method||'').toUpperCase()}</span></td>
          <td class="td-bold">₹${(p.amount||0).toLocaleString('en-IN')}</td>
          <td>${p.currency||'INR'}</td>
          <td><span class="status-badge status-${p.status||'pending'}">${p.status||'—'}</span></td>
          <td style="font-size:0.72rem;color:var(--muted)">${det}</td>`;
        tbody.appendChild(row);
        const dr = document.createElement('tr');
        dr.className='detail-row'; dr.id='pd-'+p.paymentId;
        dr.innerHTML=`<td colspan="8" class="detail-cell"><div class="detail-grid">
          <div class="detail-section">
            <div class="detail-section-title">💳 Payment Info</div>
            <div class="detail-kv"><span>Payment ID</span><span style="font-family:monospace">${p.paymentId}</span></div>
            <div class="detail-kv"><span>Order ID</span><span style="font-family:monospace">${p.orderId}</span></div>
            <div class="detail-kv"><span>Method</span><span>${icon} ${(p.method||'').toUpperCase()}</span></div>
            <div class="detail-kv"><span>Status</span><span>${p.status}</span></div>
          </div>
          <div class="detail-section">
            <div class="detail-section-title">💰 Amount</div>
            <div class="detail-kv"><span>Amount</span><span><b>₹${(p.amount||0).toLocaleString('en-IN')}</b></span></div>
            <div class="detail-kv"><span>Currency</span><span>${p.currency||'INR'}</span></div>
            <div class="detail-kv"><span>Timestamp</span><span>${fmt(p.createdAt)}</span></div>
          </div>
          <div class="detail-section">
            <div class="detail-section-title">🔍 Method Details</div>
            ${Object.entries(p.details||{}).map(([k,v])=>`<div class="detail-kv"><span>${k}</span><span>${v}</span></div>`).join('')}
          </div>
        </div></td>`;
        tbody.appendChild(dr);
      });
    }

    function toggleDetail(id) {
      const el = document.getElementById(id);
      if (el) el.classList.toggle('open');
    }

    function exportJSON() {
      const data = adminCurrentTab==='orders' ? adminAllOrders : adminAllPayments;
      const blob = new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href=url; a.download=`leathr_${adminCurrentTab}_${new Date().toISOString().slice(0,10)}.json`;
      a.click(); URL.revokeObjectURL(url);
    }

    async function clearDB() {
      if (!confirm(`Clear ALL ${adminCurrentTab}? This cannot be undone.`)) return;
      await dbClear(adminCurrentTab);
      await refreshAdmin();
    }

    /* ════════════════════════════════════════════════════════
       RECEIVING ACCOUNT SETTINGS
    ════════════════════════════════════════════════════════ */
    let receivingAccount = null;
    let settingsUnsaved  = false;

    const SETTING_FIELDS = [
      'sAccHolder','sBankName','sAccType','sAccNumber','sIfsc','sBranch','sSwift',
      'sUpiPrimary','sUpiPhonepe','sUpiGpay','sUpiPaytm','sUpiMobile',
      'sWalletPhonepe','sWalletPaytm','sWalletAmazon','sGatewayKey',
      'sBizName','sGst','sPan','sCurrency','sSupportEmail','sSupportPhone',
      'sCodFee','sCodMax','sFreeShip','sTransferNote'
    ];

    async function loadSettings() {
      try {
        const rec = await dbGet('settings', 'receiving_account');
        receivingAccount = rec ? rec.data : null;
      } catch(e) { receivingAccount = null; }
      SETTING_FIELDS.forEach(id => {
        const el = document.getElementById(id);
        if (el && receivingAccount) el.value = receivingAccount[id] || '';
        else if (el) el.value = '';
      });
      settingsUnsaved = false;
      document.getElementById('settingsSaveBar').classList.remove('visible');
      updateRecvAccountDisplay();
    }

    function markUnsaved() {
      settingsUnsaved = true;
      const bar = document.getElementById('settingsSaveBar');
      bar.classList.add('visible');
      document.getElementById('settingsSaveMsg').textContent = 'Unsaved changes';
      document.getElementById('settingsSaveMsg').className = 'settings-save-msg';
    }

    async function saveSettings() {
      const data = {};
      SETTING_FIELDS.forEach(id => {
        const el = document.getElementById(id);
        if (el) data[id] = el.value.trim();
      });
      data.updatedAt = new Date().toISOString();
      try {
        await dbPut('settings', { key: 'receiving_account', data });
        receivingAccount = data;
        settingsUnsaved = false;
        const msg = document.getElementById('settingsSaveMsg');
        msg.textContent = '✓ Saved successfully!';
        msg.className = 'settings-save-msg saved';
        setTimeout(() => {
          document.getElementById('settingsSaveBar').classList.remove('visible');
        }, 2500);
        updateRecvAccountDisplay();
        document.getElementById('adminStats').querySelector('#statOrders').closest('.admin-stats')
          .style.borderBottom = '';
      } catch(err) {
        console.error('Settings save error:', err);
        alert('Error saving settings: ' + err.message);
      }
    }

    /* Receiving account details are admin-only — not shown to customers */
    function updateRecvAccountDisplay() { /* intentionally empty */ }

    function maskAccNumber(num) {
      if (!num || num.length < 6) return num;
      return '•'.repeat(num.length - 4) + num.slice(-4);
    }

    function copyText(text, btn) {
      navigator.clipboard.writeText(text).then(() => {
        btn.textContent = 'Copied!';
        btn.classList.add('copied');
        setTimeout(() => { btn.textContent = 'Copy'; btn.classList.remove('copied'); }, 2000);
      }).catch(() => {
        btn.textContent = 'Done';
        setTimeout(() => { btn.textContent = 'Copy'; }, 1500);
      });
    }
