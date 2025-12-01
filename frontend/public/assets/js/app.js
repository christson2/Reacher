// FreeMart — Client-side demo (Option A: static sample data)
// - Dynamic search paths: products, services, jobs
// - Promotional posts shown under results, filtered by search
// - No backend required (mock data); replace functions with real API calls as needed

(() => {
  'use strict';

  /** --------------------
   * Sample data sets
   * ---------------------*/
  const PRODUCTS = [
    { id: 'p1', name: 'Fresh Tomatoes (Basket)', tags: ['tomato','vegetables','food'], seller: 'Mary\'s Supermart', distance_km: 1.2 },
    { id: 'p2', name: 'Premium Rice 50kg', tags: ['rice','grains','food'], seller: 'Olu Agro Supplies', distance_km: 2.7 },
    { id: 'p3', name: 'Pepper (Bundle)', tags: ['pepper','vegetables','food'], seller: 'Market Fresh', distance_km: 0.9 }
  ];

  const PROVIDERS = [
    { id: 's1', name: 'Ade Plumbers', profession: 'plumber', tags: ['plumber','plumbing','repair'], distance_km: 0.8 },
    { id: 's2', name: 'Olu Electric', profession: 'electrician', tags: ['electrician','wiring','installation'], distance_km: 2.9 },
    { id: 's3', name: 'Comfort Cleaners', profession: 'cleaner', tags: ['cleaner','housekeeping','cleaning'], distance_km: 1.6 }
  ];

  const JOBS = [
    { id: 'j1', title: 'Office Assistant', company: 'Bright Co.', location: 'Akure', tags: ['office','assistant','admin'] },
    { id: 'j2', title: 'Accountant (Part-Time)', company: 'Sabi Traders', location: 'Akure', tags: ['accountant','finance'] },
    { id: 'j3', title: 'Cashier', company: 'Green Mart', location: 'Gbadeyanka', tags: ['cashier','retail'] }
  ];

  // promotional posts with topic tags to match search
  const PROMOS = [
    { id: 'pr1', type: 'image', title: 'Tomato Sale Today', src: 'https://via.placeholder.com/400x250?text=Tomatoes', tags: ['tomato','food'] },
    { id: 'pr2', type: 'video', title: 'Plumbing Services — Call Ade', src: 'https://samplelib.com/lib/preview/mp4/sample-5s.mp4', tags: ['plumber','repair'] },
    { id: 'pr3', type: 'image', title: 'Accountant Vacancy - Apply Now', src: 'https://via.placeholder.com/400x250?text=Accountant+Job', tags: ['accountant','job'] },
    { id: 'pr4', type: 'text', title: 'We deliver rice across town', text: 'Olu Agro Supplies — fast delivery', tags: ['rice','food'] }
  ];

  /** --------------------
   * DOM references
   * ---------------------*/
  const optButtons = document.querySelectorAll('.search-option');
  const searchInput = document.getElementById('searchInput');
  const searchForm = document.getElementById('searchForm');
  const resultsSection = document.getElementById('resultsSection');
  const promoList = document.getElementById('promoList');
  const promoSection = document.getElementById('promoSection');
  const ctaGetStarted = document.getElementById('ctaGetStarted');

  let activeType = 'product'; // product | service | job

  /** --------------------
   * Utilities
   * ---------------------*/
  const esc = s => String(s == null ? '' : s);

  function setActiveType(type) {
    activeType = type;
    optButtons.forEach(btn => {
      const t = btn.dataset.type;
      btn.setAttribute('aria-selected', t === type ? 'true' : 'false');
    });

    // Update placeholder based on type
    if (type === 'product') searchInput.placeholder = 'Enter product name (e.g., tomato, rice)';
    else if (type === 'service') searchInput.placeholder = 'Enter service or profession (e.g., plumber, electrician)';
    else searchInput.placeholder = 'Enter job title (e.g., Office Assistant, Accountant)';

    // Clear previous results/promos
    clearResults();
    clearPromos();
  }

  function clearResults() {
    resultsSection.innerHTML = '';
  }
  function clearPromos() {
    promoList.innerHTML = '';
  }

  function renderResults(results, title) {
    clearResults();
    if (!results || results.length === 0) {
      resultsSection.innerHTML = `<div class="card"><div class="card-body"><div class="item-title">No ${title} found</div><div class="item-meta">Try widening your search or check spelling.</div></div></div>`;
      return;
    }

    const container = document.createElement('div');
    container.className = 'results-grid';
    results.forEach(item => {
      const card = document.createElement('article');
      card.className = 'card';
      const thumb = document.createElement('div');
      thumb.className = 'thumb';
      thumb.textContent = item.name ? item.name.charAt(0) : (item.title ? item.title.charAt(0) : '•');

      const body = document.createElement('div');
      body.className = 'card-body';
      let titleText = item.name || item.title || 'Item';
      let meta = '';
      if (activeType === 'product') meta = `${esc(item.seller)} • ${esc(item.distance_km)} km`;
      else if (activeType === 'service') meta = `${esc(item.profession)} • ${esc(item.distance_km)} km`;
      else if (activeType === 'job') meta = `${esc(item.company)} • ${esc(item.location)}`;

      body.innerHTML = `
        <div class="item-title">${esc(titleText)}</div>
        <div class="item-meta">${meta}</div>
      `;

      // action buttons
      const actions = document.createElement('div');
      actions.className = 'actions';
      if (activeType !== 'job') {
        const btnCall = document.createElement('button'); btnCall.className = 'action-btn'; btnCall.textContent = 'Contact';
        btnCall.addEventListener('click', () => alert(`Contacting ${titleText}...`));
        actions.appendChild(btnCall);
      } else {
        const btnApply = document.createElement('button'); btnApply.className = 'action-btn'; btnApply.textContent = 'Apply';
        btnApply.addEventListener('click', () => alert(`Applying for ${titleText}...`));
        actions.appendChild(btnApply);
      }

      body.appendChild(actions);
      card.appendChild(thumb);
      card.appendChild(body);
      container.appendChild(card);
    });

    resultsSection.appendChild(container);
  }

  function renderPromos(promos) {
    promoList.innerHTML = '';
    if (!promos || promos.length === 0) {
      promoList.innerHTML = `<div class="promo-card">No promotional posts available for this search.</div>`;
      return;
    }
    promos.forEach(p => {
      const c = document.createElement('div');
      c.className = 'promo-card';
      const title = document.createElement('div'); title.style.fontWeight = '700'; title.textContent = p.title;
      c.appendChild(title);
      if (p.type === 'image') {
        const img = document.createElement('img'); img.src = p.src; img.alt = p.title;
        c.appendChild(img);
      } else if (p.type === 'video') {
        const v = document.createElement('video'); v.src = p.src; v.controls = true; v.setAttribute('playsinline','');
        c.appendChild(v);
      } else if (p.type === 'text') {
        const text = document.createElement('p'); text.textContent = p.text;
        c.appendChild(text);
      }
      promoList.appendChild(c);
    });
  }

  /** --------------------
   * Search handlers
   * ---------------------*/
  // click handlers for option buttons
  optButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      setActiveType(btn.dataset.type);
      searchInput.focus();
    });
  });

  // form submit
  searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const q = (searchInput.value || '').trim().toLowerCase();
    if (!q) {
      alert('Please type a search query.');
      return;
    }
    // filter appropriate dataset
    if (activeType === 'product') {
      const results = PRODUCTS.filter(p => p.name.toLowerCase().includes(q) || p.tags.some(tag => tag.includes(q)));
      renderResults(results, 'products');
      // promos: match by tags or name
      const promos = PROMOS.filter(pr => pr.tags.some(t => t.includes(q)) || pr.title.toLowerCase().includes(q));
      renderPromos(promos);
    } else if (activeType === 'service') {
      const results = PROVIDERS.filter(s => s.profession.toLowerCase().includes(q) || s.tags.some(tag => tag.includes(q)));
      renderResults(results, 'service providers');
      const promos = PROMOS.filter(pr => pr.tags.some(t => t.includes(q)) || pr.title.toLowerCase().includes(q));
      renderPromos(promos);
    } else { // job
      const results = JOBS.filter(j => j.title.toLowerCase().includes(q) || j.tags.some(tag => tag.includes(q)));
      renderResults(results, 'job posts');
      const promos = PROMOS.filter(pr => pr.tags.some(t => t.includes(q)) || pr.title.toLowerCase().includes(q));
      renderPromos(promos);
    }
    // scroll to results
    document.getElementById('resultsSection').scrollIntoView({behavior:'smooth',block:'start'});
  });

  // clear button
  const clearBtn = document.getElementById('clearSearch');
  clearBtn.addEventListener('click', () => {
    searchInput.value = '';
    clearResults();
    clearPromos();
  });

  // CTA: Get Started
  ctaGetStarted.addEventListener('click', () => {
    alert('Get Started — sign up or create your seller/provider profile.');
  });

  // initial state
  setActiveType('product');

})();