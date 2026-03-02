'use strict';

/* ================================================================
   LEATHR — UI Helpers, Product Data & Initialization
   ================================================================ */

    function toggleWish(btn) {
      btn.textContent = btn.textContent==='♡'?'♥':'♡';
      btn.style.background = btn.textContent==='♥'?'#e63946':'';
      btn.style.color      = btn.textContent==='♥'?'white':'';
    }

    const sliderState = {};
    function getState(id) { if(!sliderState[id]) sliderState[id]={current:0,total:4}; return sliderState[id]; }
    function updateSlider(id, index) {
      const s=getState(id); s.current=index;
      const slider=document.getElementById(id); if(!slider) return;
      slider.style.transform=`translateX(-${index*25}%)`;
      document.querySelectorAll(`#tabs-${id} .view-tab`).forEach((t,i)=>t.classList.toggle('active',i===index));
      document.querySelectorAll(`#dots-${id} .view-dot`).forEach((d,i)=>d.classList.toggle('active',i===index));
    }
    function slideView(id,dir) { const s=getState(id); let n=s.current+dir; if(n<0)n=s.total-1; if(n>=s.total)n=0; updateSlider(id,n); }
    function goToSlide(id,index) { updateSlider(id,index); }

    function filterCat(cat,el) {
      document.querySelectorAll('.cat-item').forEach(c=>c.classList.remove('active'));
      el.classList.add('active');
      document.querySelectorAll('.product-card').forEach(card=>{
        card.style.display=(cat==='all'||card.dataset.cat===cat)?'':'none';
      });
    }
    function filterProducts() {
      const val=document.getElementById('searchInput').value.toLowerCase();
      document.querySelectorAll('.product-card').forEach(card=>{
        card.style.display=(!val||(card.dataset.name||'').includes(val))?'':'none';
      });
    }

    /* Rich product data keyed by lowercase name */
    const PRODUCT_DATA = {
      'classic biker jacket': {
        badge: '🔥 Hot', badgeClass: 'pdp-tag-hot',
        rating: 4.9, reviewCount: 124,
        oldPrice: 34999,
        desc: 'A timeless silhouette reborn. Crafted from full-grain cowhide leather, this jacket features an asymmetric zip, snap-down lapels, and a belted waist — all finished with antique brass hardware. Made to outlast trends and decades.',
        colors: [
          { name: 'Jet Black', hex: '#1a1a1a' },
          { name: 'Cognac Brown', hex: '#3a2a1a' },
          { name: 'Midnight Blue', hex: '#1d3557' },
        ],
        sizes: ['XS','S','M','L','XL','XXL'],
        soldout: ['XS'],
        specs: {
          'Material'   : 'Full-Grain Cowhide Leather',
          'Lining'     : '100% Viscose',
          'Hardware'   : 'Antique Brass YKK Zippers',
          'Fit'        : 'Slim / Regular',
          'Origin'     : 'Handcrafted in Kolkata, India',
          'Care'       : 'Professional Leather Clean Only',
          'Warranty'   : '1 Year',
          'Weight'     : '1.4 kg',
        },
        reviews: [
          { name: 'Arjun M.', stars: 5, date: 'Jan 2026', text: 'Absolutely love it. The leather is thick and supple, hardware feels premium. Got so many compliments.' },
          { name: 'Priya K.', stars: 5, date: 'Dec 2025', text: 'Perfect fit, exactly as described. The Full-Grain quality is visible immediately.' },
          { name: 'Rahul S.', stars: 4, date: 'Nov 2025', text: 'Great jacket! Took a few days to break in but now it fits like a glove.' },
        ],
        images: [
          { url: 'https://m.media-amazon.com/images/I/81i6vOQnn1L._SY741_.jpg', label: 'Front' },
          { url: 'https://m.media-amazon.com/images/I/710vXqVNV4L._SY741_.jpg', label: 'Back' },
          { url: 'https://m.media-amazon.com/images/I/71rBAjLctUL._SY741_.jpg', label: 'Left' },
          { url: 'https://m.media-amazon.com/images/I/71TjFit7QgL._SY741_.jpg', label: 'Detail' },
        ],
      },
      'vintage bomber jacket': {
        badge: 'New', badgeClass: 'pdp-tag-new',
        rating: 4.7, reviewCount: 87,
        oldPrice: null,
        desc: 'Channel the golden age of aviation. This suede bomber blends buttery-soft finish with a ribbed collar, cuffs, and waistband. An interior pocket and quilted lining make it as practical as it is iconic.',
        colors: [
          { name: 'Tobacco', hex: '#5c4033' },
          { name: 'Charcoal', hex: '#2c2c2c' },
          { name: 'Rust', hex: '#6d4c41' },
        ],
        sizes: ['S','M','L','XL','XXL'],
        soldout: [],
        specs: {
          'Material'   : 'Genuine Suede Leather',
          'Lining'     : 'Quilted Polyester',
          'Closure'    : 'Front Zip with Snap Collar',
          'Fit'        : 'Relaxed',
          'Origin'     : 'Handcrafted in Hyderabad, India',
          'Care'       : 'Suede Brush & Professional Clean',
          'Warranty'   : '1 Year',
          'Weight'     : '1.1 kg',
        },
        reviews: [
          { name: 'Sneha R.', stars: 5, date: 'Feb 2026', text: 'The suede feels incredible. Warm enough for Hyderabad winters and looks amazing.' },
          { name: 'Karan P.', stars: 4, date: 'Jan 2026', text: 'Quality is excellent. Slightly larger than expected so size down.' },
        ],
        images: [
          { url: 'https://5.imimg.com/data5/SELLER/Default/2023/6/314732605/AW/GO/MX/86884569/gents-stylish-brown-leather-jacket-1000x1000.jpg', label: 'Front' },
          { url: 'https://5.imimg.com/data5/SELLER/Default/2023/6/314732598/IP/JU/HK/86884569/gents-stylish-brown-leather-jacket-1000x1000.jpg', label: 'Back' },
          { url: 'https://5.imimg.com/data5/SELLER/Default/2023/6/314732597/TN/FU/YN/86884569/gents-stylish-brown-leather-jacket-1000x1000.jpg', label: 'Left' },
          { url: 'https://www.thejacketmaker.hk/cdn/shop/files/Men_s_Alex_Brown_Leather_Biker_Jacket5972_57a271de-e5bc-4036-af70-5ad4359af2a5_900x.jpg?v=1760635802', label: 'Detail' },
        ],
      },
      'moto slim jacket': {
        badge: 'Sale', badgeClass: 'pdp-tag-sale',
        rating: 4.9, reviewCount: 203,
        oldPrice: 25999,
        desc: 'Designed for the modern woman who rides on her own terms. Cut from butter-soft Nappa leather, this slim-fit moto jacket hugs every curve with a sculpted silhouette, side lace-up panels, and polished hardware throughout.',
        colors: [
          { name: 'Jet Black', hex: '#000' },
          { name: 'Deep Red', hex: '#8B0000' },
        ],
        sizes: ['XS','S','M','L','XL'],
        soldout: ['XS'],
        specs: {
          'Material'   : 'Nappa Lambskin Leather',
          'Lining'     : 'Satin Silk',
          'Hardware'   : 'Polished Silver',
          'Fit'        : 'Slim / Tailored',
          'Origin'     : 'Handcrafted in Chennai, India',
          'Care'       : 'Professional Leather Clean Only',
          'Warranty'   : '1 Year',
          'Weight'     : '0.9 kg',
        },
        reviews: [
          { name: 'Aarti L.', stars: 5, date: 'Feb 2026', text: 'This is my third LEATHR purchase and my favourite yet. The Nappa leather is insanely soft.' },
          { name: 'Divya N.', stars: 5, date: 'Jan 2026', text: 'Fits perfectly, looks stunning. Worth every rupee.' },
          { name: 'Meera S.', stars: 5, date: 'Dec 2025', text: 'The red is so deep and rich in person. Amazing quality.' },
        ],
        images: [
          { url: 'https://m.media-amazon.com/images/I/811u4jBTLwL._AC_SY741_.jpg', label: 'Front' },
          { url: 'https://m.media-amazon.com/images/I/81ck5zveVzL._AC_SY741_.jpg', label: 'Back' },
          { url: 'https://m.media-amazon.com/images/I/81wiq4jOxRL._AC_SY741_.jpg', label: 'Left' },
          { url: 'https://m.media-amazon.com/images/I/615I1cqEMHL._AC_SX679_.jpg', label: 'Detail' },
        ],
      },
      'racer leather jacket': {
        badge: 'Limited', badgeClass: 'pdp-tag-limited',
        rating: 4.8, reviewCount: 56,
        oldPrice: null,
        desc: 'Born on the track, refined for the street. The Racer features a stand collar, two-zip chest pockets, and a perforated back panel for breathability — all in premium full-grain leather with a clean, minimal aesthetic.',
        colors: [
          { name: 'Midnight Navy', hex: '#1a1a2e' },
          { name: 'Graphite', hex: '#333' },
        ],
        sizes: ['S','M','L','XL','XXL'],
        soldout: [],
        specs: {
          'Material'   : 'Full-Grain Cowhide Leather',
          'Lining'     : 'Mesh + Polyester',
          'Hardware'   : 'Gunmetal Zippers',
          'Fit'        : 'Athletic / Slim',
          'Origin'     : 'Handcrafted in Mumbai, India',
          'Care'       : 'Professional Leather Clean Only',
          'Warranty'   : '1 Year',
          'Weight'     : '1.3 kg',
        },
        reviews: [
          { name: 'Vikram B.', stars: 5, date: 'Jan 2026', text: 'Superb jacket. The navy colour is unique and the leather quality is top-tier.' },
          { name: 'Rohan T.', stars: 5, date: 'Dec 2025', text: 'Perfect for bike rides. Lightweight but still feels protective.' },
        ],
        images: [
          { url: 'https://xcdn.next.co.uk/common/items/default/default/itemimages/3_4Ratio/product/lge/387081s.jpg?im=Resize,width=750', label: 'Front' },
          { url: 'https://xcdn.next.co.uk/common/items/default/default/itemimages/3_4Ratio/product/lge/387081s4.jpg?im=Resize,width=750', label: 'Back' },
          { url: 'https://xcdn.next.co.uk/common/items/default/default/itemimages/3_4Ratio/product/lge/387081s6.jpg?im=Resize,width=750', label: 'Left' },
          { url: 'https://xcdn.next.co.uk/common/items/default/default/itemimages/3_4Ratio/product/lge/387081s7.jpg?im=Resize,width=750', label: 'Detail' },
        ],
      },
      'cropped moto jacket': {
        badge: 'New', badgeClass: 'pdp-tag-new',
        rating: 4.8, reviewCount: 91,
        oldPrice: null,
        desc: 'A fashion-forward cropped cut that pairs effortlessly with high-waist jeans or skirts. Crafted from butter-soft lambskin with a slightly oversized shoulder and cinched waist, this jacket commands attention.',
        colors: [
          { name: 'Jet Black', hex: '#000' },
          { name: 'Hot Pink', hex: '#c2185b' },
        ],
        sizes: ['XS','S','M','L'],
        soldout: [],
        specs: {
          'Material'   : 'Lambskin Leather',
          'Lining'     : '100% Silk',
          'Hardware'   : 'Rose Gold Zippers',
          'Fit'        : 'Cropped / Oversized Shoulder',
          'Origin'     : 'Handcrafted in Delhi, India',
          'Care'       : 'Professional Leather Clean Only',
          'Warranty'   : '1 Year',
          'Weight'     : '0.8 kg',
        },
        reviews: [
          { name: 'Nisha K.', stars: 5, date: 'Feb 2026', text: 'The pink is so vibrant! Got it for a party and everyone asked where it\'s from.' },
          { name: 'Tara M.', stars: 5, date: 'Jan 2026', text: 'Fits perfectly cropped. The lambskin is incredibly light and soft.' },
        ],
        images: [
          { url: 'https://sreeleathersonline.com/cdn/shop/files/IMG_0746_c1917c16-f8af-4b6d-a3db-ad2402a452ab.png?v=1700380790', label: 'Front' },
          { url: 'https://sreeleathersonline.com/cdn/shop/files/IMG_0745.png?v=1700380835', label: 'Back' },
          { url: 'https://sreeleathersonline.com/cdn/shop/files/IMG_0734_0cda503d-9a9a-4b5d-ad03-6866ebbd03ac.png?v=1700380835', label: 'Left' },
          { url: 'https://sreeleathersonline.com/cdn/shop/files/IMG_0730_2e1da158-fc5a-473b-9fe7-f89b57dd8a48.png?v=1700380835', label: 'Detail' },
        ],
      },
      'leather flight bomber': {
        badge: 'Sale', badgeClass: 'pdp-tag-sale',
        rating: 4.6, reviewCount: 92,
        oldPrice: 26999,
        desc: 'Inspired by WWII aviator jackets and reengineered for modern wear. The Flight Bomber features a shearling-trimmed collar, patch pockets, and a full cowhide shell that develops a rich patina over time.',
        colors: [
          { name: 'Dark Brown', hex: '#3e2723' },
          { name: 'Black', hex: '#1a1a1a' },
        ],
        sizes: ['S','M','L','XL','XXL'],
        soldout: ['XXL'],
        specs: {
          'Material'   : 'Full-Grain Cowhide Leather',
          'Collar'     : 'Genuine Shearling Trim',
          'Lining'     : 'Quilted Cotton Blend',
          'Fit'        : 'Relaxed / Classic',
          'Origin'     : 'Handcrafted in Agra, India',
          'Care'       : 'Professional Leather Clean Only',
          'Warranty'   : '1 Year',
          'Weight'     : '1.6 kg',
        },
        reviews: [
          { name: 'Suresh B.', stars: 5, date: 'Jan 2026', text: 'The shearling collar alone is worth the price. Keeps you very warm.' },
          { name: 'Aditya V.', stars: 4, date: 'Dec 2025', text: 'Excellent quality, great warmth. The brown develops a gorgeous patina.' },
        ],
        images: [
          { url: 'https://image-cdn.ubuy.com/velez-full-grain-leather-jacket-for/400_400_100/69514258efba4194850da908.jpg', label: 'Front' },
          { url: 'https://image-cdn.ubuy.com/velez-full-grain-leather-jacket-for/400_400_100/69514258efba4194850da90b.jpg', label: 'Back' },
          { url: 'https://5.imimg.com/data5/SELLER/Default/2023/6/314732597/TN/FU/YN/86884569/gents-stylish-brown-leather-jacket-1000x1000.jpg', label: 'Left' },
          { url: 'https://image-cdn.ubuy.com/velez-full-grain-leather-jacket-for/400_400_100/69514258efba4194850da911.jpg', label: 'Detail' },
        ],
      },
      'cafe racer jacket': {
        badge: '🔥 Hot', badgeClass: 'pdp-tag-hot',
        rating: 4.9, reviewCount: 145,
        oldPrice: null,
        desc: 'The purist\'s choice. Minimal stitching, a clean stand collar, and a razor-sharp silhouette define this full-grain leather café racer. Understated on the outside, obsessively crafted on the inside.',
        colors: [
          { name: 'Black', hex: '#1a1a1a' },
          { name: 'Tan', hex: '#8B4513' },
          { name: 'Slate', hex: '#2c3e50' },
        ],
        sizes: ['XS','S','M','L','XL','XXL'],
        soldout: [],
        specs: {
          'Material'   : 'Full-Grain Cowhide Leather',
          'Lining'     : '100% Viscose',
          'Hardware'   : 'Antique Brass',
          'Collar'     : 'Mandarin Stand Collar',
          'Fit'        : 'Slim',
          'Origin'     : 'Handcrafted in Hyderabad, India',
          'Care'       : 'Professional Leather Clean Only',
          'Warranty'   : '1 Year',
          'Weight'     : '1.2 kg',
        },
        reviews: [
          { name: 'Dev P.', stars: 5, date: 'Feb 2026', text: 'This is the cleanest jacket I\'ve ever owned. No unnecessary details, just pure quality.' },
          { name: 'Ishan R.', stars: 5, date: 'Jan 2026', text: 'Bought the tan colour and it\'s stunning. Ages beautifully.' },
          { name: 'Nikhil S.', stars: 5, date: 'Dec 2025', text: 'My fourth LEATHR jacket. This one is the best — perfect slim fit.' },
        ],
        images: [
          { url: 'https://bharatreshma.com/cdn/shop/files/JACKET-1A.jpg?v=1748613173&width=960', label: 'Front' },
          { url: 'https://bharatreshma.com/cdn/shop/files/JACKET-1C.jpg?v=1748613173&width=960', label: 'Back' },
          { url: 'https://bharatreshma.com/cdn/shop/files/JACKET-1B.jpg?v=1748613173&width=960', label: 'Left' },
          { url: 'https://bharatreshma.com/cdn/shop/files/JACKET-1C.jpg?v=1748613173&width=960', label: 'Detail' },
        ],
      },
      'distressed western jacket': {
        badge: 'Limited', badgeClass: 'pdp-tag-limited',
        rating: 4.7, reviewCount: 61,
        oldPrice: null,
        desc: 'The wild, the worn, the wonderful. This vintage cowhide jacket is hand-distressed by our artisans to give each piece its own unique character. Western yoke stitching, fringe cuffs, and snap buttons complete the look.',
        colors: [
          { name: 'Rust', hex: '#6d4c41' },
          { name: 'Stone', hex: '#d7ccc8' },
        ],
        sizes: ['S','M','L','XL'],
        soldout: [],
        specs: {
          'Material'   : 'Vintage Cowhide Leather',
          'Finish'     : 'Hand-Distressed',
          'Lining'     : 'Cotton Flannel',
          'Closure'    : 'Snap Buttons',
          'Fit'        : 'Relaxed / Western',
          'Origin'     : 'Handcrafted in Jaipur, India',
          'Care'       : 'Leather Conditioner + Professional Clean',
          'Warranty'   : '1 Year',
          'Weight'     : '1.5 kg',
        },
        reviews: [
          { name: 'Kabir A.', stars: 5, date: 'Feb 2026', text: 'Unique, one-of-a-kind piece. The distressing on mine is perfect. Absolute head-turner.' },
          { name: 'Ravi M.', stars: 4, date: 'Jan 2026', text: 'Love the Western vibe. Heavy but very warm. Great craftsmanship.' },
        ],
        images: [
          { url: 'https://m.media-amazon.com/images/I/81IHlk-7xWL._SY741_.jpg', label: 'Front' },
          { url: 'https://m.media-amazon.com/images/I/710vXqVNV4L._SY741_.jpg', label: 'Back' },
          { url: 'https://m.media-amazon.com/images/I/81AeFJ3K7qL._SY741_.jpg', label: 'Left' },
          { url: 'https://m.media-amazon.com/images/I/71Fl7okZKmL._SY741_.jpg', label: 'Detail' },
        ],
      },
      'leather bookmark': {
        badge: '🔥 Hot', badgeClass: 'pdp-tag-hot',
        rating: 4.9, reviewCount: 124,
        oldPrice: 34999,
        desc: 'A timeless silhouette reborn. Crafted from full-grain cowhide leather, this jacket features an asymmetric zip, snap-down lapels, and a belted waist — all finished with antique brass hardware. Made to outlast trends and decades.',
        colors: [
          { name: 'Jet Black', hex: '#1a1a1a' },
          { name: 'Cognac Brown', hex: '#3a2a1a' },
          { name: 'Midnight Blue', hex: '#1d3557' },
        ],
        sizes: ['XS','S','M','L','XL','XXL'],
        soldout: ['XS'],
        specs: {
          'Material'   : 'Full-Grain Cowhide Leather',
          'Lining'     : '100% Viscose',
          'Hardware'   : 'Antique Brass YKK Zippers',
          'Fit'        : 'Slim / Regular',
          'Origin'     : 'Handcrafted in Kolkata, India',
          'Care'       : 'Professional Leather Clean Only',
          'Warranty'   : '1 Year',
          'Weight'     : '1.4 kg',
        },
        reviews: [
          { name: 'Arjun M.', stars: 5, date: 'Jan 2026', text: 'Absolutely love it. The leather is thick and supple, hardware feels premium. Got so many compliments.' },
          { name: 'Priya K.', stars: 5, date: 'Dec 2025', text: 'Perfect fit, exactly as described. The Full-Grain quality is visible immediately.' },
          { name: 'Rahul S.', stars: 4, date: 'Nov 2025', text: 'Great jacket! Took a few days to break in but now it fits like a glove.' },
        ],
        images: [
          { url: 'https://m.media-amazon.com/images/I/81Qu5V4CswL._SY625_.jpg', label: 'Front' },
          { url: 'https://m.media-amazon.com/images/I/81scUhl+n-L._SY625_.jpg', label: 'Back' },
          { url: 'https://m.media-amazon.com/images/I/8116D7LQMVL._SY625_.jpg', label: 'Left' },
          { url: 'https://m.media-amazon.com/images/I/81OGI+FUPgL._SY625_.jpg', label: 'Detail' },
        ],
      },
    };

    document.addEventListener('keydown', e=>{
      if(e.key==='Escape'){ closePDP(); closeAdmin(); closePayment(); closeCart(); }
      const fc=document.querySelector('.product-card:hover'); if(!fc) return;
      const se=fc.querySelector('.view-slider'); if(!se) return;
      if(e.key==='ArrowLeft')  slideView(se.id,-1);
      if(e.key==='ArrowRight') slideView(se.id, 1);
    });

    const obs=new IntersectionObserver(entries=>{
      entries.forEach(e=>{ if(e.isIntersecting) e.target.classList.add('show'); });
    },{threshold:0.1});
    document.querySelectorAll('.fade-in').forEach(el=>obs.observe(el));

    const styleEl=document.createElement('style');
    styleEl.textContent='@keyframes spin{to{transform:rotate(360deg)}}';
    document.head.appendChild(styleEl);

    /* ── INIT ── */
    initDB().then(async ()=>{
      console.log('✅ LeathrDB v2 ready — stores: orders, payments, settings');
      await loadSettings();
      renderCart();
    }).catch(err=>{
      console.error('❌ IndexedDB init failed:', err);
      renderCart();
    });
