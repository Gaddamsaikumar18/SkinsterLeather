'use strict';

/* ================================================================
   LEATHR — Product Detail Modal (PDP)
   ================================================================ */

    let pdpCurrentProduct = null;
    let pdpCurrentImgIdx  = 0;
    let pdpCurrentQty     = 1;
    let pdpSelectedSize   = null;
    let pdpSelectedColor  = 0;
    let pdpWishlisted     = false;

    function openPDP(event, card) {
      /* Ignore clicks on buttons/interactive children */
      if (event.target.closest('.add-btn, .wishlist-btn, .img-nav, .view-tab, .view-dot')) return;

      const name  = card.dataset.name;
      const price = parseInt(card.dataset.price, 10);
      const type  = card.dataset.type;
      const data  = PRODUCT_DATA[name] || null;

      pdpCurrentProduct  = { name, price, type, data, card };
      pdpCurrentImgIdx   = 0;
      pdpCurrentQty      = 1;
      pdpSelectedSize    = null;
      pdpSelectedColor   = 0;
      pdpWishlisted      = false;

      populatePDP(name, price, type, data);

      document.getElementById('pdpModal').classList.add('open');
      document.getElementById('pdpOverlay').classList.add('open');
      document.body.style.overflow = 'hidden';
    }

    function closePDP() {
      document.getElementById('pdpModal').classList.remove('open');
      document.getElementById('pdpOverlay').classList.remove('open');
      document.body.style.overflow = '';
    }

    function populatePDP(name, price, type, data) {
      const titleCase = name.split(' ').map(w=>w[0].toUpperCase()+w.slice(1)).join(' ');

      /* name / type */
      document.getElementById('pdpName').textContent = titleCase;
      document.getElementById('pdpType').textContent = type;

      /* badge */
      const badgeRow = document.getElementById('pdpBadgeRow');
      if (data) {
        const cat = type.split('·')[0].trim();
        badgeRow.innerHTML = `
          <span class="pdp-tag ${data.badgeClass}">${data.badge}</span>
          <span class="pdp-tag pdp-tag-cat">${cat}</span>`;
        document.getElementById('pdpGalleryBadge').textContent = data.badge;
        document.getElementById('pdpGalleryBadge').style.display = 'block';
      } else {
        badgeRow.innerHTML = '';
        document.getElementById('pdpGalleryBadge').style.display = 'none';
      }

      /* stars */
      const rating = data ? data.rating : 4.5;
      const reviews = data ? data.reviewCount : 0;
      const fullStars  = Math.floor(rating);
      const hasHalf    = rating % 1 >= 0.5;
      document.getElementById('pdpStars').textContent = '★'.repeat(fullStars) + (hasHalf?'½':'') + '☆'.repeat(Math.max(0,5-fullStars-(hasHalf?1:0)));
      document.getElementById('pdpRatingNum').textContent = rating.toFixed(1);
      document.getElementById('pdpReviewLink').textContent = `(${reviews} review${reviews!==1?'s':''})`;

      /* price */
      document.getElementById('pdpPrice').textContent = '₹'+price.toLocaleString('en-IN');
      const oldPriceEl = document.getElementById('pdpOldPrice');
      const savingEl   = document.getElementById('pdpSaving');
      if (data && data.oldPrice) {
        oldPriceEl.textContent = '₹'+data.oldPrice.toLocaleString('en-IN');
        oldPriceEl.style.display = 'inline';
        const saved = Math.round((data.oldPrice - price)/data.oldPrice*100);
        savingEl.textContent = `Save ${saved}%`;
        savingEl.style.display = 'inline';
      } else {
        oldPriceEl.style.display = 'none';
        savingEl.style.display   = 'none';
      }

      /* description */
      document.getElementById('pdpDesc').textContent = data
        ? data.desc
        : `Premium leather jacket. Crafted with full-grain leather, detailed stitching, and top-tier hardware. Available in multiple colours.`;

      /* images */
      const imgs = data ? data.images : [{ url: (pdpCurrentProduct?.card?.dataset?.img || ''), label: 'Front' }];
      pdpSetImage(0, imgs);
      const thumbsEl = document.getElementById('pdpThumbs');
      thumbsEl.innerHTML = imgs.map((img, i) => `
        <div class="pdp-thumb${i===0?' active':''}" onclick="pdpGoToImg(${i})" data-idx="${i}">
          <img src="${img.url}" alt="${img.label}"/>
        </div>`).join('');

      /* colours */
      const colors = data ? data.colors : [{ name: 'Black', hex: '#111' }];
      const colorsEl = document.getElementById('pdpColors');
      colorsEl.innerHTML = colors.map((c, i) => `
        <div class="pdp-color-swatch${i===0?' active':''}"
             style="background:${c.hex}"
             onclick="pdpSelectColor(${i},'${c.name}')"
             title="${c.name}"></div>`).join('');
      document.getElementById('pdpColorName').textContent = colors[0].name;

      /* sizes */
      const sizes   = data ? data.sizes   : ['S','M','L','XL','XXL'];
      const soldout = data ? data.soldout  : [];
      const sizesEl = document.getElementById('pdpSizes');
      sizesEl.innerHTML = sizes.map(s => `
        <div class="pdp-size${soldout.includes(s)?' soldout':''}" onclick="${soldout.includes(s)?'':'pdpSelectSize(this)'}">${s}</div>`
      ).join('');

      /* qty */
      pdpCurrentQty = 1;
      document.getElementById('pdpQtyNum').textContent = '1';

      /* wish */
      pdpWishlisted = false;
      const wishBtn = document.getElementById('pdpWishBtn');
      wishBtn.textContent = '♡';
      wishBtn.classList.remove('wishlisted');

      /* add btn */
      const addBtn = document.getElementById('pdpAddBtn');
      addBtn.textContent = '🛒 Add to Cart';
      addBtn.style.background = '';

      /* specs */
      const specsEl = document.getElementById('pdpSpecs');
      if (data && data.specs) {
        specsEl.innerHTML = `<div class="pdp-section-label" style="margin-bottom:12px;">Product Specifications</div>` +
          Object.entries(data.specs).map(([k,v])=>`
            <div class="pdp-spec-row">
              <span class="pdp-spec-key">${k}</span>
              <span class="pdp-spec-val">${v}</span>
            </div>`).join('');
      } else { specsEl.innerHTML = ''; }

      /* reviews */
      const reviewsEl = document.getElementById('pdpReviews');
      if (data && data.reviews && data.reviews.length) {
        reviewsEl.innerHTML = `<div class="pdp-section-label" style="margin-bottom:12px;">Customer Reviews</div>` +
          data.reviews.map(r=>`
            <div class="pdp-review-item">
              <div class="pdp-review-header">
                <span class="pdp-reviewer">${r.name}</span>
                <span class="pdp-review-stars">${'★'.repeat(r.stars)}${'☆'.repeat(5-r.stars)}</span>
                <span class="pdp-review-date">${r.date}</span>
              </div>
              <div class="pdp-review-text">${r.text}</div>
            </div>`).join('');
      } else { reviewsEl.innerHTML = ''; }
    }

    /* Gallery */
    function pdpSetImage(idx, imgs) {
      const data = pdpCurrentProduct?.data;
      const images = imgs || (data ? data.images : []);
      if (!images.length) return;
      idx = ((idx % images.length) + images.length) % images.length;
      pdpCurrentImgIdx = idx;
      const imgEl = document.getElementById('pdpMainImg');
      imgEl.classList.add('fade-swap');
      setTimeout(() => {
        imgEl.src = images[idx].url;
        imgEl.alt = images[idx].label;
        document.getElementById('pdpViewLabel').textContent = images[idx].label;
        imgEl.classList.remove('fade-swap');
      }, 150);
      document.querySelectorAll('.pdp-thumb').forEach((t,i) => t.classList.toggle('active', i===idx));
    }
    function pdpSlide(dir) {
      const imgs = pdpCurrentProduct?.data?.images || [];
      pdpSetImage(pdpCurrentImgIdx + dir, imgs);
    }
    function pdpGoToImg(idx) {
      const imgs = pdpCurrentProduct?.data?.images || [];
      pdpSetImage(idx, imgs);
    }

    /* Colour */
    function pdpSelectColor(idx, name) {
      pdpSelectedColor = idx;
      document.querySelectorAll('.pdp-color-swatch').forEach((s,i)=>s.classList.toggle('active',i===idx));
      document.getElementById('pdpColorName').textContent = name;
    }

    /* Size */
    function pdpSelectSize(el) {
      document.querySelectorAll('.pdp-size').forEach(s=>s.classList.remove('active'));
      el.classList.add('active');
      pdpSelectedSize = el.textContent;
    }

    /* Qty */
    function pdpChangeQty(delta) {
      pdpCurrentQty = Math.max(1, Math.min(10, pdpCurrentQty + delta));
      document.getElementById('pdpQtyNum').textContent = pdpCurrentQty;
    }

    /* Wish */
    function pdpToggleWish() {
      pdpWishlisted = !pdpWishlisted;
      const btn = document.getElementById('pdpWishBtn');
      btn.textContent = pdpWishlisted ? '♥' : '♡';
      btn.classList.toggle('wishlisted', pdpWishlisted);
    }

    /* Add to cart from PDP */
    function pdpAddToCart() {
      if (!pdpCurrentProduct) return;
      const { name, price, type } = pdpCurrentProduct;
      const img = pdpCurrentProduct.data?.images?.[0]?.url
                  || pdpCurrentProduct.card?.dataset?.img || '';
      for (let i = 0; i < pdpCurrentQty; i++) {
        addItem({ name: name.split(' ').map(w=>w[0].toUpperCase()+w.slice(1)).join(' '), price, type, img });
      }
      const btn = document.getElementById('pdpAddBtn');
      btn.textContent = `✓ Added ${pdpCurrentQty > 1 ? pdpCurrentQty+'×' : ''}!`;
      btn.style.background = '#2a9d8f';
      setTimeout(() => {
        btn.textContent = '🛒 Add to Cart';
        btn.style.background = '';
      }, 1800);
    }
