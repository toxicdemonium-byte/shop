/* =========================================================
   ASCENT — Store interactivity
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------------- Product data ---------------- */
  const PRODUCTS = [
    { id:1, name:'Reactive Runner RX-07', cat:'running', price:5499, oldPrice:6999, tag:'BESTSELLER', img:'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600&auto=format&fit=crop' },
    { id:2, name:'Skyline Court High', cat:'basketball', price:6299, oldPrice:null, tag:'NEW', img:'https://images.unsplash.com/photo-1552346154-21d32810aba3?q=80&w=600&auto=format&fit=crop' },
    { id:3, name:'Drift Knit Lifestyle', cat:'lifestyle', price:4199, oldPrice:5199, tag:'-20%', img:'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=600&auto=format&fit=crop' },
    { id:4, name:'Ridgeline Trail GTX', cat:'trail', price:7299, oldPrice:null, tag:null, img:'https://images.unsplash.com/photo-1519744792095-2f2205e87b6f?q=80&w=600&auto=format&fit=crop' },
    { id:5, name:'Pulse Trainer 2.0', cat:'running', price:4899, oldPrice:null, tag:null, img:'https://images.unsplash.com/photo-1595341888016-a392ef81b7de?q=80&w=600&auto=format&fit=crop' },
    { id:6, name:'Crossover Mid', cat:'basketball', price:5799, oldPrice:6499, tag:'-11%', img:'https://images.unsplash.com/photo-1608379743498-3c0a1f4b1e9d?q=80&w=600&auto=format&fit=crop' },
    { id:7, name:'Everyday Low Canvas', cat:'lifestyle', price:3299, oldPrice:null, tag:null, img:'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?q=80&w=600&auto=format&fit=crop' },
    { id:8, name:'Summit Peak Hiker', cat:'trail', price:8199, oldPrice:9499, tag:'BESTSELLER', img:'https://images.unsplash.com/photo-1520639888713-7851133b1ed0?q=80&w=600&auto=format&fit=crop' },
  ];

  const fmt = n => '₹' + n.toLocaleString('en-IN');

  /* ---------------- State ---------------- */
  let cart = [];       // {id, qty}
  let wishlist = new Set();

  /* ---------------- Render products ---------------- */
  const grid = document.getElementById('productGrid');

  function renderProducts(filter = 'all'){
    grid.innerHTML = '';
    const list = filter === 'all' ? PRODUCTS : PRODUCTS.filter(p => p.cat === filter);
    list.forEach((p, i) => {
      const card = document.createElement('article');
      card.className = 'product-card';
      card.style.animationDelay = (i * 0.06) + 's';
      card.innerHTML = `
        <div class="product-card__media">
          ${p.tag ? `<span class="product-card__tag">${p.tag}</span>` : ''}
          <button class="product-card__wish" data-id="${p.id}" aria-label="Add to wishlist">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 20s-7-4.35-9.5-8.5C.5 7.5 3 4 6.5 4c2 0 3.5 1 5.5 3 2-2 3.5-3 5.5-3C21 4 23.5 7.5 21.5 11.5 19 15.65 12 20 12 20z" stroke="#1B1C1F" stroke-width="2" stroke-linejoin="round"/></svg>
          </button>
          <img src="${p.img}" alt="${p.name}" loading="lazy">
        </div>
        <div class="product-card__body">
          <span class="product-card__cat">${p.cat}</span>
          <h3 class="product-card__name">${p.name}</h3>
          <div class="product-card__price-row">
            <span class="product-card__price">${fmt(p.price)}${p.oldPrice ? `<del>${fmt(p.oldPrice)}</del>` : ''}</span>
            <button class="product-card__add" data-id="${p.id}" aria-label="Add to cart">+</button>
          </div>
        </div>
      `;
      grid.appendChild(card);
    });
  }
  renderProducts();

  /* ---------------- Filters ---------------- */
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderProducts(btn.dataset.filter);
    });
  });

  /* ---------------- Toast ---------------- */
  const toast = document.getElementById('toast');
  let toastTimer;
  function showToast(msg){
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
  }

  /* ---------------- Cart logic ---------------- */
  const cartDrawer = document.getElementById('cartDrawer');
  const overlay = document.getElementById('overlay');
  const cartItemsEl = document.getElementById('cartItems');
  const cartEmpty = document.getElementById('cartEmpty');
  const cartCountEl = document.getElementById('cartCount');
  const cartSubtotalEl = document.getElementById('cartSubtotal');

  function openCart(){ cartDrawer.classList.add('open'); overlay.classList.add('open'); }
  function closeCart(){ cartDrawer.classList.remove('open'); overlay.classList.remove('open'); }

  function addToCart(id){
    const existing = cart.find(c => c.id === id);
    if (existing) existing.qty++;
    else cart.push({ id, qty:1 });
    renderCart();
    const product = PRODUCTS.find(p => p.id === id);
    showToast(`Added "${product.name}" to your bag`);
    openCart();
  }

  function changeQty(id, delta){
    const item = cart.find(c => c.id === id);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) cart = cart.filter(c => c.id !== id);
    renderCart();
  }

  function removeItem(id){
    cart = cart.filter(c => c.id !== id);
    renderCart();
  }

  function renderCart(){
    const totalQty = cart.reduce((s,c) => s + c.qty, 0);
    cartCountEl.textContent = totalQty;
    cartCountEl.classList.toggle('show', totalQty > 0);

    if (cart.length === 0){
      cartItemsEl.innerHTML = '';
      cartItemsEl.appendChild(cartEmpty);
      cartSubtotalEl.textContent = fmt(0);
      return;
    }

    cartItemsEl.innerHTML = '';
    let subtotal = 0;
    cart.forEach(c => {
      const p = PRODUCTS.find(pp => pp.id === c.id);
      subtotal += p.price * c.qty;
      const row = document.createElement('div');
      row.className = 'cart-item';
      row.innerHTML = `
        <img src="${p.img}" alt="${p.name}">
        <div class="cart-item__info">
          <h4>${p.name}</h4>
          <span>${fmt(p.price)}</span>
          <div class="cart-item__row">
            <div class="qty-control">
              <button data-action="dec" data-id="${p.id}">−</button>
              <span>${c.qty}</span>
              <button data-action="inc" data-id="${p.id}">+</button>
            </div>
            <button class="cart-item__remove" data-action="remove" data-id="${p.id}">Remove</button>
          </div>
        </div>
      `;
      cartItemsEl.appendChild(row);
    });
    cartSubtotalEl.textContent = fmt(subtotal);
  }

  cartItemsEl.addEventListener('click', e => {
    const btn = e.target.closest('button[data-action]');
    if (!btn) return;
    const id = Number(btn.dataset.id);
    if (btn.dataset.action === 'inc') changeQty(id, 1);
    if (btn.dataset.action === 'dec') changeQty(id, -1);
    if (btn.dataset.action === 'remove') removeItem(id);
  });

  grid.addEventListener('click', e => {
    const addBtn = e.target.closest('.product-card__add');
    const wishBtn = e.target.closest('.product-card__wish');
    if (addBtn) addToCart(Number(addBtn.dataset.id));
    if (wishBtn) toggleWishlist(Number(wishBtn.dataset.id), wishBtn);
  });

  document.getElementById('cartBtn').addEventListener('click', openCart);
  document.getElementById('closeCart').addEventListener('click', closeCart);
  overlay.addEventListener('click', closeCart);

  document.getElementById('checkoutBtn').addEventListener('click', () => {
    if (cart.length === 0){ showToast('Your bag is empty'); return; }
    showToast('This is a demo — checkout is not connected 🙂');
  });

  /* ---------------- Wishlist ---------------- */
  const wishlistCountEl = document.getElementById('wishlistCount');
  function toggleWishlist(id, btn){
    if (wishlist.has(id)){
      wishlist.delete(id);
      btn.classList.remove('active');
      showToast('Removed from wishlist');
    } else {
      wishlist.add(id);
      btn.classList.add('active');
      showToast('Added to wishlist ❤');
    }
    wishlistCountEl.textContent = wishlist.size;
    wishlistCountEl.classList.toggle('show', wishlist.size > 0);
  }

  /* ---------------- Mobile nav ---------------- */
  const burger = document.getElementById('burger');
  const nav = document.getElementById('nav');
  burger.addEventListener('click', () => {
    burger.classList.toggle('active');
    nav.classList.toggle('mobile-open');
  });
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    burger.classList.remove('active');
    nav.classList.remove('mobile-open');
  }));

  /* ---------------- Search panel ---------------- */
  const searchPanel = document.getElementById('searchPanel');
  document.getElementById('searchBtn').addEventListener('click', () => {
    searchPanel.classList.add('open');
    document.getElementById('searchInput').focus();
  });
  document.getElementById('closeSearch').addEventListener('click', () => searchPanel.classList.remove('open'));

  document.getElementById('wishlistBtn').addEventListener('click', () => {
    showToast(wishlist.size ? `You have ${wishlist.size} item(s) saved` : 'Your wishlist is empty');
  });

  /* ---------------- Header scroll state ---------------- */
  const header = document.getElementById('header');
  const scrollTopBtn = document.getElementById('scrollTop');
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 20);
    scrollTopBtn.classList.toggle('show', window.scrollY > 600);
  });
  scrollTopBtn.addEventListener('click', () => window.scrollTo({ top:0, behavior:'smooth' }));

  /* ---------------- Scroll reveal ---------------- */
  const revealEls = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting){
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }
    });
  }, { threshold:0.15 });
  revealEls.forEach(el => io.observe(el));

  // re-observe newly rendered product cards on filter change (they animate via CSS keyframes already)

  /* ---------------- Hero parallax ---------------- */
  const heroWrap = document.getElementById('heroParallax');
  if (window.matchMedia('(min-width: 861px)').matches){
    document.querySelector('.hero').addEventListener('mousemove', (e) => {
      const rect = heroWrap.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width/2) / rect.width;
      const y = (e.clientY - rect.top - rect.height/2) / rect.height;
      heroWrap.style.transform = `rotate(2deg) translate(${x*14}px, ${y*14}px)`;
    });
  }

  /* ---------------- Countdown timer ---------------- */
  const endTime = Date.now() + (1000 * 60 * 60 * 18) + (1000 * 60 * 24); // ~18h24m demo countdown
  const cdH = document.getElementById('cd-h');
  const cdM = document.getElementById('cd-m');
  const cdS = document.getElementById('cd-s');
  function tickCountdown(){
    const diff = Math.max(0, endTime - Date.now());
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    cdH.textContent = String(h).padStart(2,'0');
    cdM.textContent = String(m).padStart(2,'0');
    cdS.textContent = String(s).padStart(2,'0');
  }
  tickCountdown();
  setInterval(tickCountdown, 1000);

  /* ---------------- Testimonial slider ---------------- */
  const testiTrack = document.getElementById('testiTrack');
  const testiCards = testiTrack.children.length;
  const dotsWrap = document.getElementById('testiDots');
  let testiIndex = 0;

  for (let i = 0; i < testiCards; i++){
    const dot = document.createElement('span');
    if (i === 0) dot.classList.add('active');
    dot.addEventListener('click', () => goToTesti(i));
    dotsWrap.appendChild(dot);
  }

  function goToTesti(i){
    testiIndex = i;
    testiTrack.style.transform = `translateX(-${i * 100}%)`;
    [...dotsWrap.children].forEach((d, idx) => d.classList.toggle('active', idx === i));
  }

  setInterval(() => {
    testiIndex = (testiIndex + 1) % testiCards;
    goToTesti(testiIndex);
  }, 5000);

  /* ---------------- Newsletter ---------------- */
  document.getElementById('newsletterForm').addEventListener('submit', (e) => {
    e.preventDefault();
    document.getElementById('newsletterNote').textContent = "You're on the list. Welcome to ASCENT.";
    e.target.reset();
  });

  /* ---------------- Init cart UI ---------------- */
  renderCart();
});
