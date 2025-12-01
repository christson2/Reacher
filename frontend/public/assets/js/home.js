/* home.js
   - Mobile-first Home page behaviors for FreeMart
   - Mock sample data for demo (replace with API calls)
   - Behaviors:
     * initial feed -> random posts from saved contacts only
     * search types: product, service, job, person
     * search shows results only after submit
     * products & services filtered to 'local' (same town in mock)
     * jobs global
     * find person searches contacts + local users
     * results include Call (tel:) and WhatsApp (wa.me) buttons
     * promotional posts shown under results and filtered by tags
*/

(function () {
  'use strict';

  /** ---------- Mock data (demo) ---------- **/
  // saved contacts posts (feed)
  const CONTACT_POSTS = [
    {
      id: 'c1',
      author: 'Mary Supermart',
      avatarLetter: 'M',
      time: '2h',
      text: 'Fresh tomatoes and pepper at discount today!',
      media: 'https://via.placeholder.com/600x320?text=Tomatoes',
      type: 'image',
      tags: ['tomato','food'],
      phone: '+2348012345678',
      location: 'Alagbaka Market'
    },
    {
      id: 'c2',
      author: 'A. Plumbers',
      avatarLetter: 'A',
      time: '1d',
      text: 'Got a leaking pipe? We fix same day.',
      media: 'https://samplelib.com/lib/preview/mp4/sample-5s.mp4',
      type: 'video',
      tags: ['plumber','repair'],
      phone: '+2348098765432',
      location: 'GRA Akure'
    },
    {
      id: 'c3',
      author: 'Sabi Traders',
      avatarLetter: 'S',
      time: '3d',
      text: 'Hiring an accountant — apply within.',
      media: '',
      type: 'text',
      tags: ['job','accountant'],
      phone: '+2348071112233',
      location: 'Akure'
    }
  ];

  // product sellers (mock inventory)
  const PRODUCTS = [
    { id:'p1', name:'Fresh Tomatoes (Basket)', tags:['tomato','food'], seller:'Mary Supermart', town:'Akure', phone:'+2348012345678', location:'Alagbaka Market' },
    { id:'p2', name:'Premium Rice 50kg', tags:['rice','food'], seller:'Olu Agro', town:'Akure', phone:'+2348098765432', location:'GRA Akure' },
    { id:'p3', name:'Pepper (Bundle)', tags:['pepper','food'], seller:'Market Fresh', town:'Ondo', phone:'+2348071112233', location:'Ondo Market' }
  ];

  // service providers
  const PROVIDERS = [
    { id:'s1', name:'Ade Plumbers', profession:'plumber', tags:['plumber','repair'], town:'Akure', phone:'+2348012345678', location:'GRA Akure' },
    { id:'s2', name:'Olu Electric', profession:'electrician', tags:['electrician','wiring'], town:'Akure', phone:'+2348098765432', location:'Alagbaka' },
    { id:'s3', name:'Comfort Cleaners', profession:'cleaner', tags:['cleaner','housekeeping'], town:'Ilesa', phone:'+2348071112233', location:'Ilesa' }
  ];

  // jobs (global)
  const JOBS = [
    { id:'j1', title:'Office Assistant', company:'Bright Co.', location:'Akure', phone:'+2348014441111' },
    { id:'j2', title:'Accountant', company:'Sabi Traders', location:'Lagos', phone:'+2348093332222' },
    { id:'j3', title:'Cashier', company:'Green Mart', location:'Gbedde', phone:'+2348075556666' }
  ];

  // promos
  const PROMOS = [
    { id:'pr1', type:'image', title:'Tomato Sale', src:'https://via.placeholder.com/400x250?text=Tomato+Sale', tags:['tomato','food'] },
    { id:'pr2', type:'video', title:'Plumbing Services', src:'https://samplelib.com/lib/preview/mp4/sample-5s.mp4', tags:['plumber','repair'] },
    { id:'pr3', type:'text', title:'Rice delivery', text:'Olu Agro supplies — call to order', tags:['rice','food'] }
  ];

  // Backend API base
  const API_BASE = 'http://localhost:4000/api';

  /** ---------- DOM refs ---------- **/
  const feedList = document.getElementById('feedList');
  const searchOptions = document.querySelectorAll('.search-option');
  const searchForm = document.getElementById('searchForm');
  const searchInput = document.getElementById('searchInput');
  const resultsSection = document.getElementById('resultsSection');
  const resultsList = document.getElementById('resultsList');
  const promoSection = document.getElementById('promoSection');
  const promoList = document.getElementById('promoList');
  const clearBtn = document.getElementById('clearBtn');
  const roleButtons = document.querySelectorAll('.role-switch');

  // default active search
  let activeType = 'product';
  let userTown = 'Akure'; // demo current user's town. Replace with real user location.

  /** ---------- Helpers ---------- **/
  const esc = s => String(s == null ? '' : s);

  function el(tag, attrs = {}, children = []) {
    const e = document.createElement(tag);
    Object.keys(attrs).forEach(k => {
      if (k === 'class') e.className = attrs[k];
      else if (k === 'html') e.innerHTML = attrs[k];
      else e.setAttribute(k, attrs[k]);
    });
    (Array.isArray(children) ? children : [children]).forEach(c => {
      if (!c) return;
      if (typeof c === 'string') e.appendChild(document.createTextNode(c));
      else e.appendChild(c);
    });
    return e;
  }

  function randomize(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  /** ---------- Render initial feed (contacts only) ---------- **/
  function renderInitialFeed() {
    feedList.innerHTML = '';
    // Try to load posts from backend, fallback to mock CONTACT_POSTS
    fetch(`${API_BASE}/posts`)
      .then(r => r.json())
      .then(data => {
        const posts = Array.isArray(data.posts) ? data.posts : [];
        if (posts.length) {
          // map posts to expected post-card shape
          posts.forEach(p => {
            const cardData = {
              id: p.id || p._id,
              author: p.user_id ? `User ${p.user_id}` : (p.author || 'Unknown'),
              avatarLetter: (p.user_id && String(p.user_id).charAt(0)) || (p.author && p.author.charAt(0)) || 'U',
              time: p.created_at ? new Date(p.created_at).toLocaleString() : (p.time || ''),
              text: p.caption || p.content || '',
              media: p.image_url || p.media || '',
              type: p.image_url ? 'image' : (p.media ? 'video' : 'text'),
              tags: p.tags || [],
              phone: p.contact_phone || '+2348000000000',
              location: p.location || ''
            };
            feedList.appendChild(renderPostCard(cardData));
          });
          return;
        }
        // fallback to local mock
        const fallback = randomize(CONTACT_POSTS);
        fallback.forEach(p => feedList.appendChild(renderPostCard(p)));
      })
      .catch(() => {
        const fallback = randomize(CONTACT_POSTS);
        fallback.forEach(p => feedList.appendChild(renderPostCard(p)));
      });
  }

  function renderPostCard(post) {
    const card = el('article', { class: 'post-card card', role: 'article' });
    const header = el('div', { class: 'post-header' }, [
      el('div', { class: 'post-avatar' }, post.avatarLetter || post.author.charAt(0)),
      el('div', { class: 'post-meta' }, [
        el('div', {}, post.author),
        el('div', { class: 'post-meta' }, `${post.time} • ${post.location}`)
      ])
    ]);
    const body = el('div', { class: 'post-body' }, post.text);
    card.appendChild(header);
    card.appendChild(body);

    if (post.media) {
      const mediaWrap = el('div', { class: 'post-media' });
      if (post.type === 'image') {
        const img = el('img', { src: post.media, alt: post.author + ' image' });
        mediaWrap.appendChild(img);
      } else if (post.type === 'video') {
        const video = el('video', { src: post.media, controls: true });
        mediaWrap.appendChild(video);
      }
      card.appendChild(mediaWrap);
    }

    return card;
  }

  /** ---------- Search flow ---------- **/
  // update placeholder and active button
  function setActiveSearch(type) {
    activeType = type;
    searchOptions.forEach(btn => {
      const t = btn.dataset.type;
      if (t === type) {
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');
      } else {
        btn.classList.remove('active');
        btn.setAttribute('aria-selected', 'false');
      }
    });

    if (type === 'product') searchInput.placeholder = 'Enter product name';
    else if (type === 'service') searchInput.placeholder = 'Enter service type or profession';
    else if (type === 'job') searchInput.placeholder = 'Enter job title';
    else if (type === 'person') searchInput.placeholder = "Enter person's name or phone";
  }

  // filter local items (town match) for products/providers
  function filterLocal(list) {
    return list.filter(item => {
      // treat town equality as locality
      return item.town === userTown || (item.location && item.location.toLowerCase().includes(userTown.toLowerCase()));
    });
  }

  // Search submit handler
  async function onSearch(e) {
    e && e.preventDefault();
    const q = (searchInput.value || '').trim().toLowerCase();
    if (!q) {
      alert('Please type a search query');
      return;
    }

    // hide feed, show results & promos
    document.getElementById('feedSection').hidden = true;
    resultsSection.hidden = false;
    promoSection.hidden = false;
    resultsList.innerHTML = '';
    promoList.innerHTML = '';

    try {
      if (activeType === 'product') {
        const res = await fetch(`${API_BASE}/products?q=${encodeURIComponent(q)}`);
        const data = await res.json();
        const list = Array.isArray(data.products) ? data.products : (data.products || []);
        // Map backend product shape to frontend expected
        const mapped = list.map(p => ({ id: p.id, name: p.title || p.name, location: p.location || '', phone: p.contact_phone || p.phone || '+2348000000000' }));
        const localMatches = filterLocal(mapped);
        renderProductResults(localMatches.length ? localMatches : mapped);
        renderPromosByQuery(q);
      } else if (activeType === 'service') {
        const res = await fetch(`${API_BASE}/services?q=${encodeURIComponent(q)}`);
        const data = await res.json();
        const list = Array.isArray(data.services) ? data.services : (data.services || []);
        const mapped = list.map(s => ({ id: s.id, name: s.title || s.service_name || s.name, profession: s.profession || '', location: s.location || '', phone: s.contact_phone || s.phone || '+2348000000000' }));
        const localMatches = filterLocal(mapped);
        renderProviderResults(localMatches.length ? localMatches : mapped);
        renderPromosByQuery(q);
      } else if (activeType === 'job') {
        const res = await fetch(`${API_BASE}/jobs?q=${encodeURIComponent(q)}`);
        const data = await res.json();
        const list = Array.isArray(data.jobs) ? data.jobs : (data.jobs || []);
        const mapped = list.map(j => ({ id: j.id, title: j.title, company: j.company_name || j.company, location: j.location || '', phone: j.contact_phone || '+2348000000000' }));
        renderJobResults(mapped);
        renderPromosByQuery(q);
      } else if (activeType === 'person') {
        // try contacts (requires auth), fallback to local CONTACT_POSTS
        const token = localStorage.getItem('jwt_token');
        let contactsList = [];
        try {
          const headers = token ? { Authorization: `Bearer ${token}` } : {};
          const res = await fetch(`${API_BASE}/contacts`, { headers });
          const d = await res.json();
          contactsList = Array.isArray(d.contacts) ? d.contacts : [];
        } catch (err) {
          // ignore and fallback
        }
        const results = contactsList.filter(c => (c.name && c.name.toLowerCase().includes(q)) || (c.phone && c.phone.includes(q)));
        if (!results.length) {
          const localResults = CONTACT_POSTS.filter(c => (c.author.toLowerCase().includes(q) || (c.phone && c.phone.includes(q))));
          renderPersonResults(localResults);
        } else {
          const mapped = results.map(r => ({ author: r.name || r.author, phone: r.phone, location: r.location || '' }));
          renderPersonResults(mapped);
        }
        renderPromosByQuery(q);
      }
    } catch (err) {
      console.error('Search error', err);
      alert('Search failed — showing local results');
      // fallback to local behaviour
      if (activeType === 'product') {
        const matches = PRODUCTS.filter(p => (p.name.toLowerCase().includes(q) || p.tags.some(t => t.includes(q))));
        renderProductResults(filterLocal(matches));
      } else if (activeType === 'service') {
        const matches = PROVIDERS.filter(p => (p.name.toLowerCase().includes(q) || p.profession.toLowerCase().includes(q) || p.tags.some(t => t.includes(q))));
        renderProviderResults(filterLocal(matches));
      } else if (activeType === 'job') {
        const matches = JOBS.filter(j => (j.title.toLowerCase().includes(q) || j.company.toLowerCase().includes(q)));
        renderJobResults(matches);
      } else if (activeType === 'person') {
        const results = CONTACT_POSTS.filter(c => (c.author.toLowerCase().includes(q) || (c.phone && c.phone.includes(q)) ));
        renderPersonResults(results);
      }
    }
    // scroll to results on mobile
    window.scrollTo({ top: document.getElementById('resultsSection').offsetTop - 10, behavior: 'smooth' });
  }

  /** ---------- Renderers for result types ---------- **/
  function createContactButtons(phone) {
    const callBtn = el('button', { class: 'action-btn call', type: 'button', 'data-phone': phone }, 'Call');
    callBtn.addEventListener('click', () => {
      window.location.href = `tel:${phone}`;
    });

    const waBtn = el('button', { class: 'action-btn whatsapp', type: 'button', 'data-phone': phone }, 'WhatsApp');
    waBtn.addEventListener('click', () => {
      // open wa.me link
      const normalized = phone.replace(/\D/g, '');
      const waUrl = `https://wa.me/${normalized}`;
      window.open(waUrl, '_blank', 'noopener');
    });

    const wrap = el('div', { class: 'actions' }, [callBtn, waBtn]);
    return wrap;
  }

  function renderProductResults(list) {
    resultsList.innerHTML = '';
    if (!list.length) {
      resultsList.appendChild(el('div', { class: 'card' , html: '<div class="item-title">No products found in your area.</div>' }));
      return;
    }
    list.forEach(item => {
      const card = el('div', { class: 'result-card card' });
      card.appendChild(el('div', { class: 'result-title' }, item.name));
      card.appendChild(el('div', { class: 'result-location' }, 'Location: ' + item.location));
      card.appendChild(createContactButtons(item.phone));
      resultsList.appendChild(card);
    });
  }

  function renderProviderResults(list) {
    resultsList.innerHTML = '';
    if (!list.length) {
      resultsList.appendChild(el('div', { class: 'card' , html: '<div class="item-title">No service providers found in your area.</div>' }));
      return;
    }
    list.forEach(item => {
      const card = el('div', { class: 'result-card card' });
      card.appendChild(el('div', { class: 'result-title' }, item.name + ' — ' + item.profession));
      card.appendChild(el('div', { class: 'result-location' }, 'Location: ' + item.location));
      card.appendChild(createContactButtons(item.phone));
      resultsList.appendChild(card);
    });
  }

  function renderJobResults(list) {
    resultsList.innerHTML = '';
    if (!list.length) {
      resultsList.appendChild(el('div', { class: 'card' , html: '<div class="item-title">No job posts found.</div>' }));
      return;
    }
    list.forEach(item => {
      const card = el('div', { class: 'result-card card' });
      card.appendChild(el('div', { class: 'result-title' }, item.title + ' — ' + item.company));
      card.appendChild(el('div', { class: 'result-location' }, 'Location: ' + item.location));
      // jobs: show call + whatsapp to employer phone
      card.appendChild(createContactButtons(item.phone));
      resultsList.appendChild(card);
    });
  }

  function renderPersonResults(list) {
    resultsList.innerHTML = '';
    if (!list.length) {
      resultsList.appendChild(el('div', { class: 'card' , html: '<div class="item-title">No person found.</div>' }));
      return;
    }
    list.forEach(item => {
      const card = el('div', { class: 'result-card card' });
      const name = item.author || item.name || item.title || 'Unknown';
      const phone = item.phone || item.phone || '+2348000000000';
      const location = item.location || item.town || 'Unknown';
      card.appendChild(el('div', { class: 'result-title' }, name));
      card.appendChild(el('div', { class: 'result-location' }, 'Location: ' + location));
      // Call & WhatsApp
      card.appendChild(createContactButtons(phone));
      resultsList.appendChild(card);
    });
  }

  /** ---------- Promotional posts (filter by query/tags) ---------- **/
  function renderPromosByQuery(q) {
    promoList.innerHTML = '';
    const qLower = (q || '').toLowerCase();
    const matches = PROMOS.filter(p => p.title.toLowerCase().includes(qLower) || (p.tags && p.tags.some(t => t.includes(qLower))));
    if (!matches.length) {
      promoList.appendChild(el('div', { class: 'promo-card card' }, 'No promotional posts for this search.'));
      return;
    }
    matches.forEach(p => {
      const card = el('div', { class: 'promo-card card' });
      card.appendChild(el('div', { class: 'result-title' }, p.title));
      if (p.type === 'image') {
        card.appendChild(el('div', { class: 'post-media' }, el('img', { src: p.src, alt: p.title })));
      } else if (p.type === 'video') {
        card.appendChild(el('div', { class: 'post-media' }, el('video', { src: p.src, controls: true })));
      } else if (p.type === 'text') {
        card.appendChild(el('p', {}, p.text));
      }
      promoList.appendChild(card);
    });
  }

  /** ---------- Events ---------- **/
  // search option click
  searchOptions.forEach(btn => {
    btn.addEventListener('click', (ev) => {
      const t = btn.dataset.type;
      setActiveSearch(t);
    });
  });

  // form submit
  searchForm.addEventListener('submit', onSearch);

  // clear search resets to feed
  clearBtn.addEventListener('click', () => {
    searchInput.value = '';
    resultsSection.hidden = true;
    promoSection.hidden = true;
    document.getElementById('feedSection').hidden = false;
  });

  // role switcher behavior
  // role switcher behavior: set mode and navigate to role dashboard
 // ================================
// ROLE SWITCHER REDIRECT HANDLING
// ================================

document.querySelectorAll(".role-switch").forEach(btn => {
  btn.addEventListener("click", () => {
    const role = btn.dataset.role;

    // Toggle active button
    document.querySelectorAll(".role-switch").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    // Redirect to related dashboard page
    if (role === "consumer") {
      window.location.href = "./consumer-dashboard.html";   // inside pages folder
    } 
    else if (role === "seller") {
      window.location.href = "./seller-dashboard.html";
    } 
    else if (role === "provider") {
      window.location.href = "./provider-dashboard.html";
    }
  });
});

  /** ---------- Init ---------- **/
  function init() {
    // Respect saved current profile mode (if any) and mark active role button
    const savedMode = (localStorage.getItem('current_profile_mode') || 'consumer');
    roleButtons.forEach(r => {
      const is = r.dataset.role === savedMode;
      r.classList.toggle('active', is);
      r.setAttribute('aria-selected', is ? 'true' : 'false');
    });

    renderInitialFeed();
    setActiveSearch('product');
    resultsSection.hidden = true;
    promoSection.hidden = true;
  }

  init();

})();