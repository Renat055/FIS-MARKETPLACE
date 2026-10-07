/* ==========================================================================
   EPN FIS — productos.js
   Lógica para productos.html, categorias.html y producto.html:
   renderizado de tarjetas, búsqueda, filtros, orden, favoritos,
   página de detalle con pestañas y reseñas.
   ========================================================================== */

const CAT_COLORS = {
  'productividad': '#DCEFEA',
  'desarrollo':    '#E2E8F7',
  'diseno':        '#FCEBE3',
  'datos-ia':      '#E6E9FB',
  'juegos':        '#FDEBD3',
  'seguridad':     '#F3E1E6',
};

function catColor(catId) {
  return CAT_COLORS[catId] || '#E7ECF5';
}

/* ---------- Rutas de imágenes (listas para reemplazar por capturas reales) ---------- */
function productImgSrc(p) {
  if (p && p.image) return p.image;
  return `assets/images/productos/${p.id}.svg`;
}
function categoryImgSrc(catId) {
  return `assets/images/categorias/${catId}.svg`;
}
const IMG_FALLBACK_ATTR = `onerror="this.onerror=null;this.src='assets/images/productos/placeholder.svg';"`;

/* ---------- Tarjeta de producto reutilizable ---------- */
function renderProductCard(p) {
  const cat = EPN.getCategory(p.category);
  const fav = EPN.isFavorite(p.id);
  return `
  <article class="product-card" data-product-id="${p.id}">
    <div class="product-thumb">
      <img class="thumb-img" src="${productImgSrc(p)}" alt="${EPN.esc(p.title)}" loading="lazy" ${IMG_FALLBACK_ATTR}>
      <button class="fav-btn ${fav ? 'active' : ''}" type="button" data-fav-toggle aria-label="Agregar a favoritos">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="${fav ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg>
      </button>
    </div>
    <div class="product-body">
      <span class="product-cat">${cat ? EPN.esc(cat.name) : ''}</span>
      <h3 class="product-title"><a href="producto.html?id=${p.id}">${EPN.esc(p.title)}</a></h3>
      <p class="product-desc">${EPN.esc(p.shortDesc)}</p>
      <div class="product-meta">
        <span class="stars">${EPN.stars(p.rating)} <span class="count">(${p.reviewsCount})</span></span>
        <span class="product-price">${EPN.money(p.price)}</span>
      </div>
    </div>
    <div class="product-footer">
      <a href="producto.html?id=${p.id}" class="btn btn-outline btn-sm">Ver detalle</a>
      <button class="btn btn-primary btn-sm" type="button" data-add-cart="${p.id}">Agregar</button>
    </div>
    <label class="compare-check">
      <input type="checkbox" data-compare-toggle="${p.id}" ${EPN.isInCompare(p.id) ? 'checked' : ''}>
      Comparar este producto
    </label>
  </article>`;
}

/* ---------- Tarjeta compacta para el carrusel "Recién publicados" ---------- */
function renderMarqueeCard(p) {
  const cat = EPN.getCategory(p.category);
  return `
  <a class="marquee-card" href="producto.html?id=${p.id}">
    <div class="marquee-card-thumb"><img src="${productImgSrc(p)}" alt="${EPN.esc(p.title)}" loading="lazy" ${IMG_FALLBACK_ATTR}></div>
    <div class="marquee-card-body">
      <span class="product-cat">${cat ? EPN.esc(cat.name) : ''}</span>
      <h3 class="product-title">${EPN.esc(p.title)}</h3>
      <div class="product-meta">
        <span class="stars">${EPN.stars(p.rating)}</span>
        <span class="product-price">${EPN.money(p.price)}</span>
      </div>
    </div>
  </a>`;
}

/* ---------- Carrusel de flechas para "Recién publicados" ---------- */
function initMarquee() {
  const track = document.getElementById('newGrid');
  const prevBtn = document.getElementById('marqueePrev');
  const nextBtn = document.getElementById('marqueeNext');
  if (!track || !prevBtn || !nextBtn) return;

  function scrollStep() {
    const card = track.querySelector('.marquee-card');
    const cardWidth = card ? card.getBoundingClientRect().width : 260;
    return Math.round(cardWidth * 2 + 36);
  }

  function updateArrows() {
    const maxScroll = track.scrollWidth - track.clientWidth - 2;
    prevBtn.disabled = track.scrollLeft <= 2;
    nextBtn.disabled = track.scrollLeft >= maxScroll;
  }

  prevBtn.addEventListener('click', () => {
    track.scrollBy({ left: -scrollStep(), behavior: 'smooth' });
  });
  nextBtn.addEventListener('click', () => {
    track.scrollBy({ left: scrollStep(), behavior: 'smooth' });
  });
  track.addEventListener('scroll', updateArrows, { passive: true });
  window.addEventListener('resize', updateArrows);
  updateArrows();
}

function bindProductCardEvents(container) {
  container.querySelectorAll('[data-fav-toggle]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const card = btn.closest('[data-product-id]');
      const id = card.getAttribute('data-product-id');
      const active = EPN.toggleFavorite(id);
      btn.classList.toggle('active', active);
      btn.classList.add('pulse');
      setTimeout(() => btn.classList.remove('pulse'), 350);
      EPN.toast(active ? 'Agregado a favoritos' : 'Quitado de favoritos');
    });
  });
  container.querySelectorAll('[data-add-cart]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const id = btn.getAttribute('data-add-cart');
      const p = EPN.getProduct(id);
      EPN.addToCart(id, 'personal');
      EPN.toast(`<b>${EPN.esc(p.title)}</b> se agregó al carrito`);
    });
  });
  container.querySelectorAll('[data-compare-toggle]').forEach(cb => {
    cb.addEventListener('change', () => {
      const id = cb.getAttribute('data-compare-toggle');
      const result = EPN.toggleCompare(id);
      if (result.limitReached) {
        cb.checked = false;
        EPN.toast(`Solo puedes comparar hasta ${EPN.COMPARE_LIMIT} productos a la vez`, 'warn');
        return;
      }
      renderCompareBar();
    });
  });
}

/* ---------- Barra flotante del comparador ---------- */
function renderCompareBar() {
  const list = EPN.getCompare();
  let bar = document.querySelector('.compare-bar');

  if (!bar) {
    bar = document.createElement('div');
    bar.className = 'compare-bar';
    bar.innerHTML = `
      <div class="compare-items" id="compareItems"></div>
      <div class="compare-actions">
        <button class="compare-clear" id="compareClear" type="button">Vaciar</button>
        <a class="btn btn-primary btn-sm" id="compareGo" href="comparar.html">Comparar (<span id="compareCount">0</span>)</a>
      </div>`;
    document.body.appendChild(bar);
    bar.querySelector('#compareClear').addEventListener('click', () => {
      EPN.clearCompare();
      document.querySelectorAll('[data-compare-toggle]').forEach(cb => { cb.checked = false; });
      renderCompareBar();
    });
  }

  const itemsWrap = bar.querySelector('#compareItems');
  itemsWrap.innerHTML = list.map(id => {
    const p = EPN.getProduct(id);
    if (!p) return '';
    return `<span class="compare-chip"><img src="${productImgSrc(p)}" alt="${EPN.esc(p.title)}" ${IMG_FALLBACK_ATTR}>${EPN.esc(p.title)}<button type="button" data-compare-remove="${id}" aria-label="Quitar de la comparación">✕</button></span>`;
  }).join('');
  bar.querySelector('#compareCount').textContent = list.length;
  bar.querySelector('#compareGo').href = 'comparar.html?ids=' + list.join(',');
  bar.classList.toggle('visible', list.length > 0);

  itemsWrap.querySelectorAll('[data-compare-remove]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-compare-remove');
      EPN.toggleCompare(id);
      document.querySelectorAll(`[data-compare-toggle="${id}"]`).forEach(cb => { cb.checked = false; });
      renderCompareBar();
    });
  });
}

/* ==========================================================================
   productos.html — catálogo con búsqueda, filtros y orden
   ========================================================================== */
function initProductsPage() {
  const grid = document.getElementById('productGrid');
  if (!grid) return;

  const catFilterWrap = document.getElementById('catFilters');
  if (catFilterWrap && !catFilterWrap.dataset.built) {
    catFilterWrap.innerHTML = EPN.categories.map(c => `
      <label class="filter-option">
        <input type="checkbox" data-filter-cat value="${c.id}"> ${c.name}
      </label>`).join('');
    catFilterWrap.dataset.built = '1';
  }

  const params = new URLSearchParams(window.location.search);
  const state = {
    q: params.get('q') || '',
    cats: params.get('cat') ? [params.get('cat')] : [],
    sort: params.get('sort') || 'relevancia',
    maxPrice: 20,
    view: 'grid',
  };

  const searchInput = document.getElementById('toolbarSearch');
  const sortSelect = document.getElementById('sortSelect');
  const countLabel = document.getElementById('resultsCount');
  const catCheckboxes = document.querySelectorAll('[data-filter-cat]');
  const priceRange = document.getElementById('priceRange');
  const priceValue = document.getElementById('priceValue');
  const clearBtn = document.getElementById('clearFilters');
  const filterToggle = document.getElementById('filterToggle');
  const filtersPanel = document.getElementById('filtersPanel');

  if (searchInput) searchInput.value = state.q;
  if (sortSelect) sortSelect.value = state.sort;
  if (priceRange) priceRange.value = state.maxPrice;

  catCheckboxes.forEach(cb => {
    cb.checked = state.cats.includes(cb.value);
  });

  function applyAndRender() {
    let list = EPN.allProducts().filter(p => {
      const matchesQ = !state.q || (p.title + p.shortDesc + p.tags.join(' ')).toLowerCase().includes(state.q.toLowerCase());
      const matchesCat = state.cats.length === 0 || state.cats.includes(p.category);
      const matchesPrice = p.price <= state.maxPrice;
      return matchesQ && matchesCat && matchesPrice;
    });

    switch (state.sort) {
      case 'precio-asc': list.sort((a, b) => a.price - b.price); break;
      case 'precio-desc': list.sort((a, b) => b.price - a.price); break;
      case 'rating': list.sort((a, b) => b.rating - a.rating); break;
      case 'nuevos': list.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded)); break;
      default: list.sort((a, b) => b.sales - a.sales);
    }

    countLabel.textContent = `${list.length} producto${list.length !== 1 ? 's' : ''} encontrado${list.length !== 1 ? 's' : ''}`;

    if (list.length === 0) {
      grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1;">
        <h3>No encontramos productos</h3>
        <p>Prueba con otras palabras clave o quita algunos filtros.</p>
        <button class="btn btn-outline" id="emptyClear">Limpiar filtros</button>
      </div>`;
      const eb = document.getElementById('emptyClear');
      if (eb) eb.addEventListener('click', resetFilters);
    } else {
      grid.innerHTML = list.map(renderProductCard).join('');
    }
    bindProductCardEvents(grid);
  }

  function resetFilters() {
    state.q = ''; state.cats = []; state.sort = 'relevancia'; state.maxPrice = 20;
    if (searchInput) searchInput.value = '';
    if (sortSelect) sortSelect.value = 'relevancia';
    if (priceRange) priceRange.value = 20;
    if (priceValue) priceValue.textContent = 'Hasta $20';
    catCheckboxes.forEach(cb => cb.checked = false);
    applyAndRender();
  }

  if (searchInput) {
    searchInput.addEventListener('input', () => { state.q = searchInput.value; applyAndRender(); });
  }
  if (sortSelect) {
    sortSelect.addEventListener('change', () => { state.sort = sortSelect.value; applyAndRender(); });
  }
  catCheckboxes.forEach(cb => {
    cb.addEventListener('change', () => {
      state.cats = Array.from(catCheckboxes).filter(x => x.checked).map(x => x.value);
      applyAndRender();
    });
  });
  if (priceRange) {
    priceRange.addEventListener('input', () => {
      state.maxPrice = Number(priceRange.value);
      priceValue.textContent = state.maxPrice >= 20 ? 'Hasta $20+' : `Hasta $${state.maxPrice}`;
      applyAndRender();
    });
  }
  if (clearBtn) clearBtn.addEventListener('click', resetFilters);
  if (filterToggle && filtersPanel) {
    filterToggle.setAttribute('aria-expanded', 'false');
    filterToggle.addEventListener('click', () => {
      filtersPanel.classList.toggle('open');
      filterToggle.setAttribute('aria-expanded', String(filtersPanel.classList.contains('open')));
    });
  }

  if (priceValue) priceValue.textContent = 'Hasta $20+';
  applyAndRender();
}

/* ==========================================================================
   categorias.html — grilla completa de categorías
   ========================================================================== */
function initCategoriesPage() {
  const grid = document.getElementById('fullCatGrid');
  if (!grid) return;
  grid.innerHTML = EPN.categories.map(c => {
    const count = EPN.allProducts().filter(p => p.category === c.id).length;
    return `
    <a class="cat-card" href="productos.html?cat=${c.id}" style="padding:26px 20px;">
      <div class="cat-icon" style="width:48px;height:48px;">
        <img src="${categoryImgSrc(c.id)}" alt="${c.name}" loading="lazy">
      </div>
      <h3 style="font-size:1.05rem;">${c.name}</h3>
      <p style="margin:6px 0 2px;font-size:.85rem;">${c.desc}</p>
      <span>${count} productos</span>
    </a>`;
  }).join('');
}

/* ==========================================================================
   producto.html — página de detalle
   ========================================================================== */
function initProductDetailPage() {
  const root = document.getElementById('productDetail');
  if (!root) return;

  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  const product = EPN.getProduct(id);

  if (!product) {
    root.innerHTML = `<div class="empty-state"><h3>Producto no encontrado</h3><p>Puede que el enlace sea incorrecto o el producto ya no exista.</p><a href="productos.html" class="btn btn-primary">Volver al catálogo</a></div>`;
    return;
  }

  const cat = EPN.getCategory(product.category);
  document.title = `${product.title} — EPN FIS`;

  document.getElementById('crumbCat').textContent = cat.name;
  document.getElementById('crumbCat').href = `productos.html?cat=${cat.id}`;
  document.getElementById('crumbTitle').textContent = product.title;

  const catLabelEl = document.getElementById('detailCatLabel');
  if (catLabelEl) catLabelEl.textContent = cat.name;

  document.getElementById('galleryIcon').outerHTML = `<img src="${productImgSrc(product)}" alt="${EPN.esc(product.title)}" ${IMG_FALLBACK_ATTR}>`;
  document.getElementById('detailTitle').textContent = product.title;
  document.getElementById('detailSub').innerHTML = `
    <span class="stars">${EPN.stars(product.rating)} <span class="count">${product.rating.toFixed(1)} · ${product.reviewsCount} reseñas</span></span>
    <span>Por ${EPN.esc(product.seller)}</span>
    <span>${product.sales} descargas</span>`;
  document.getElementById('descPanel').textContent = product.longDesc;
  document.getElementById('tagList').innerHTML = product.tags.map(t => `<span class="tag">${EPN.esc(t)}</span>`).join('');

  const favBtn = document.getElementById('detailFav');
  function syncFav() {
    const active = EPN.isFavorite(product.id);
    favBtn.classList.toggle('active', active);
    favBtn.innerHTML = active ? '♥ En favoritos' : '♡ Agregar a favoritos';
  }
  syncFav();
  favBtn.addEventListener('click', () => { EPN.toggleFavorite(product.id); syncFav(); EPN.toast('Preferencias actualizadas'); });

  // Licencias
  const licenseWrap = document.getElementById('licenseOptions');
  licenseWrap.innerHTML = EPN.licenses.map((lic, i) => `
    <label class="license-option">
      <span class="lo-name"><input type="radio" name="license" value="${lic.id}" ${i === 0 ? 'checked' : ''}> ${lic.name}</span>
      <span class="lo-price">${EPN.money(EPN.licensePrice(product.price, lic.id))}</span>
    </label>`).join('');

  const priceBig = document.getElementById('priceBig');
  function updatePrice() {
    const chosen = licenseWrap.querySelector('input:checked').value;
    priceBig.textContent = EPN.money(EPN.licensePrice(product.price, chosen));
  }
  updatePrice();
  licenseWrap.addEventListener('change', updatePrice);

  document.getElementById('addCartBtn').addEventListener('click', () => {
    const chosen = licenseWrap.querySelector('input:checked').value;
    EPN.addToCart(product.id, chosen);
    EPN.toast(`<b>${EPN.esc(product.title)}</b> se agregó al carrito`);
  });

  document.getElementById('buyNowBtn').addEventListener('click', () => {
    const chosen = licenseWrap.querySelector('input:checked').value;
    EPN.addToCart(product.id, chosen);
    window.location.href = 'carrito.html';
  });

  // Tabs
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(btn.dataset.tab).classList.add('active');
    });
  });

  // Reseñas
  renderReviews(product.id);
  bindReviewForm(product);

  // Preguntas y respuestas
  renderQA(product);
  bindQuestionForm(product);

  // Relacionados
  const related = EPN.allProducts().filter(p => p.category === product.category && p.id !== product.id).slice(0, 3);
  document.getElementById('relatedGrid').innerHTML = related.map(renderProductCard).join('');
  bindProductCardEvents(document.getElementById('relatedGrid'));
}

function renderReviews(productId) {
  const allReviews = EPN.read(EPN.KEYS.reviews, {});
  const list = allReviews[productId] || [];
  const wrap = document.getElementById('reviewList');
  document.getElementById('reviewCount').textContent = list.length;
  wrap.innerHTML = list.length
    ? list.map(r => `
      <div class="review">
        <div class="review-head">
          <div class="review-user"><span class="avatar">${EPN.esc(EPN.initials(r.user))}</span>${EPN.esc(r.user)}</div>
          <span class="review-date">${r.date}</span>
        </div>
        <span class="stars">${EPN.stars(r.rating)}</span>
        <p>${EPN.esc(r.comment)}</p>
      </div>`).join('')
    : `<p>Este producto todavía no tiene reseñas. Sé el primero en opinar.</p>`;
}

function bindReviewForm(product) {
  const form = document.getElementById('reviewForm');
  if (!form) return;
  const stars = form.querySelectorAll('.rating-input button');
  let chosenRating = 0;
  stars.forEach(btn => {
    btn.addEventListener('click', () => {
      chosenRating = Number(btn.dataset.value);
      stars.forEach(b => b.classList.toggle('active', Number(b.dataset.value) <= chosenRating));
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const comment = form.querySelector('textarea').value.trim();
    const errorEl = form.querySelector('.field-error');
    if (!chosenRating || comment.length < 5) {
      form.querySelector('.field').classList.add('has-error');
      EPN.toast('Agrega una calificación y un comentario de al menos 5 caracteres', 'error');
      return;
    }
    form.querySelector('.field').classList.remove('has-error');

    const user = EPN.currentUser();
    const allReviews = EPN.read(EPN.KEYS.reviews, {});
    if (!allReviews[product.id]) allReviews[product.id] = [];
    allReviews[product.id].unshift({
      user: user ? user.name : 'Anónimo',
      rating: chosenRating,
      comment,
      date: new Date().toISOString().slice(0, 10),
    });
    EPN.write(EPN.KEYS.reviews, allReviews);

    product.reviewsCount += 1;
    product.rating = Math.round(((product.rating * (product.reviewsCount - 1) + chosenRating) / product.reviewsCount) * 10) / 10;

    form.reset();
    chosenRating = 0;
    stars.forEach(b => b.classList.remove('active'));
    renderReviews(product.id);
    EPN.toast('Gracias por tu reseña');
  });
}

function renderQA(product) {
  const allQuestions = EPN.read(EPN.KEYS.questions, {});
  const list = allQuestions[product.id] || [];
  const wrap = document.getElementById('qaList');
  const countEl = document.getElementById('qaCount');
  if (!wrap) return;
  if (countEl) countEl.textContent = list.length;

  const currentUser = EPN.currentUser();
  const isSeller = currentUser && currentUser.id === product.sellerId;

  wrap.innerHTML = list.length
    ? list.map(q => `
      <div class="qa-item" data-qid="${q.id}">
        <div class="qa-block qa-question">
          <span class="qa-avatar">${EPN.esc(EPN.initials(q.askedBy))}</span>
          <div>
            <p class="qa-meta"><b>${EPN.esc(q.askedBy)}</b> preguntó · <span class="qa-date">${q.date}</span></p>
            <p>${EPN.esc(q.question)}</p>
          </div>
        </div>
        ${q.answer ? `
        <div class="qa-block qa-answer">
          <span class="qa-avatar seller">${EPN.esc(EPN.initials(q.answeredBy))}</span>
          <div>
            <p class="qa-meta"><b>${EPN.esc(q.answeredBy)}</b> · vendedor · <span class="qa-date">${q.answerDate}</span></p>
            <p>${EPN.esc(q.answer)}</p>
          </div>
        </div>` : isSeller ? `
        <div class="qa-reply-form">
          <textarea placeholder="Responde esta pregunta…" rows="2" data-reply-input="${q.id}"></textarea>
          <button class="btn btn-outline btn-sm" type="button" data-reply-submit="${q.id}">Responder</button>
        </div>` : `
        <p class="qa-pending">Aún sin respuesta del vendedor.</p>`}
      </div>`).join('')
    : `<p>Todavía no hay preguntas sobre este producto. ¡Sé el primero en preguntar!</p>`;

  wrap.querySelectorAll('[data-reply-submit]').forEach(btn => {
    btn.addEventListener('click', () => {
      const qid = btn.getAttribute('data-reply-submit');
      const textarea = wrap.querySelector(`[data-reply-input="${qid}"]`);
      const answerText = textarea.value.trim();
      if (answerText.length < 3) {
        EPN.toast('Escribe una respuesta antes de enviarla', 'error');
        return;
      }
      const questions = EPN.read(EPN.KEYS.questions, {});
      const arr = questions[product.id] || [];
      const item = arr.find(q => q.id === qid);
      if (item) {
        item.answer = answerText;
        item.answeredBy = currentUser.name;
        item.answerDate = new Date().toISOString().slice(0, 10);
        EPN.write(EPN.KEYS.questions, questions);
        EPN.toast('Respuesta publicada');
        renderQA(product);
      }
    });
  });
}

function bindQuestionForm(product) {
  const form = document.getElementById('questionForm');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const textarea = form.querySelector('textarea');
    const text = textarea.value.trim();
    const field = form.querySelector('.field');
    if (text.length < 5) {
      field.classList.add('has-error');
      EPN.toast('Escribe una pregunta de al menos 5 caracteres', 'error');
      return;
    }
    field.classList.remove('has-error');

    const user = EPN.currentUser();
    const questions = EPN.read(EPN.KEYS.questions, {});
    if (!questions[product.id]) questions[product.id] = [];
    questions[product.id].unshift({
      id: 'q' + Date.now(),
      question: text,
      askedBy: user ? user.name : 'Anónimo',
      date: new Date().toISOString().slice(0, 10),
      answer: null,
      answeredBy: null,
      answerDate: null,
    });
    EPN.write(EPN.KEYS.questions, questions);
    form.reset();
    renderQA(product);
    EPN.toast('Tu pregunta fue enviada');

    if (product.sellerId) {
      EPN.pushNotification(`Nueva pregunta sobre <b>${EPN.esc(product.title)}</b>.`);
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initProductsPage();
  initCategoriesPage();
  initProductDetailPage();
  renderCompareBar();
});
