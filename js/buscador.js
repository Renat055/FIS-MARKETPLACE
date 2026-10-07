/* ==========================================================================
   EPN FIS — buscador.js
   Paleta de búsqueda rápida al estilo "command palette": Ctrl/Cmd+K abre
   un overlay para saltar a productos o secciones del sitio con el teclado.
   ========================================================================== */

function buildCommandPalette() {
  if (document.querySelector('.cmdk-overlay')) return null;

  const overlay = document.createElement('div');
  overlay.className = 'cmdk-overlay';
  overlay.innerHTML = `
    <div class="cmdk-box" role="dialog" aria-modal="true" aria-label="Búsqueda rápida">
      <div class="cmdk-input-wrap">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input type="text" id="cmdkInput" placeholder="Buscar productos o secciones…" autocomplete="off" spellcheck="false">
        <kbd>Esc</kbd>
      </div>
      <div class="cmdk-results" id="cmdkResults"></div>
    </div>`;
  document.body.appendChild(overlay);

  const input = overlay.querySelector('#cmdkInput');
  const resultsWrap = overlay.querySelector('#cmdkResults');
  let items = [];
  let selectedIndex = 0;

  function navEntries() {
    const user = EPN.currentUser();
    const entries = [
      { icon: '🏠', label: 'Ir a Inicio', href: 'index.html' },
      { icon: '🧭', label: 'Explorar productos', href: 'productos.html' },
      { icon: '🗂️', label: 'Ver categorías', href: 'categorias.html' },
      { icon: '⬆️', label: 'Publicar software', href: 'vender.html' },
      { icon: '📚', label: 'Mi biblioteca', href: 'biblioteca.html' },
      { icon: '🛒', label: 'Ver carrito', href: 'carrito.html' },
      { icon: '⚖️', label: 'Comparar productos', href: 'comparar.html' },
      { icon: '📊', label: 'Panel de vendedor', href: 'dashboard.html' },
    ];
    entries.push(user
      ? { icon: '👤', label: 'Cerrar sesión', href: '#logout' }
      : { icon: '👤', label: 'Iniciar sesión', href: 'login.html' });
    return entries;
  }

  function productImg(p) {
    if (p.image) return p.image;
    return `assets/images/productos/${p.id}.svg`;
  }
  const FALLBACK = `onerror="this.onerror=null;this.src='assets/images/productos/placeholder.svg';"`;

  function computeResults(query) {
    const q = query.trim().toLowerCase();
    const nav = navEntries();
    const navMatches = q ? nav.filter(n => n.label.toLowerCase().includes(q)) : nav.slice(0, 6);
    const products = EPN.allProducts();
    const prodMatches = q
      ? products.filter(p => (p.title + ' ' + p.shortDesc + ' ' + p.tags.join(' ')).toLowerCase().includes(q)).slice(0, 6)
      : [];
    return { navMatches, prodMatches };
  }

  function render(query) {
    const { navMatches, prodMatches } = computeResults(query);
    items = [];
    let html = '';

    if (navMatches.length) {
      html += `<div class="cmdk-group-label">Ir a</div>`;
      navMatches.forEach(n => {
        items.push(n);
        html += `<div class="cmdk-item" data-idx="${items.length - 1}">
          <span class="cmdk-item-icon">${n.icon}</span>
          <span class="cmdk-item-title">${n.label}</span>
        </div>`;
      });
    }

    if (prodMatches.length) {
      html += `<div class="cmdk-group-label">Productos</div>`;
      prodMatches.forEach(p => {
        items.push({ href: 'producto.html?id=' + p.id });
        const cat = EPN.getCategory(p.category);
        html += `<div class="cmdk-item" data-idx="${items.length - 1}">
          <img class="cmdk-item-thumb" src="${productImg(p)}" alt="" ${FALLBACK}>
          <div>
            <div class="cmdk-item-title">${EPN.esc(p.title)}</div>
            <div class="cmdk-item-sub">${EPN.money(p.price)} · ${cat ? EPN.esc(cat.name) : ''}</div>
          </div>
        </div>`;
      });
    }

    if (!items.length) {
      html = `<div class="cmdk-empty">Sin resultados para "${query}"</div>`;
    }

    resultsWrap.innerHTML = html;
    selectedIndex = 0;
    highlightSelected();

    resultsWrap.querySelectorAll('.cmdk-item').forEach(el => {
      el.addEventListener('click', () => go(Number(el.dataset.idx)));
      el.addEventListener('mouseenter', () => { selectedIndex = Number(el.dataset.idx); highlightSelected(); });
    });
  }

  function highlightSelected() {
    resultsWrap.querySelectorAll('.cmdk-item').forEach(el => {
      el.classList.toggle('selected', Number(el.dataset.idx) === selectedIndex);
    });
    const sel = resultsWrap.querySelector('.cmdk-item.selected');
    if (sel) sel.scrollIntoView({ block: 'nearest' });
  }

  function go(idx) {
    const item = items[idx];
    if (!item) return;
    if (item.href === '#logout') {
      close();
      EPN.logout();
      EPN.toast('Sesión cerrada correctamente');
      setTimeout(() => { window.location.href = 'index.html'; }, 400);
      return;
    }
    window.location.href = item.href;
  }

  function open() {
    overlay.classList.add('open');
    input.value = '';
    render('');
    setTimeout(() => input.focus(), 10);
  }
  function close() {
    overlay.classList.remove('open');
  }

  input.addEventListener('input', () => render(input.value));
  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); selectedIndex = Math.min(selectedIndex + 1, items.length - 1); highlightSelected(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); selectedIndex = Math.max(selectedIndex - 1, 0); highlightSelected(); }
    else if (e.key === 'Enter') { e.preventDefault(); go(selectedIndex); }
    else if (e.key === 'Escape') { close(); }
  });
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });

  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      overlay.classList.contains('open') ? close() : open();
    } else if (e.key === 'Escape' && overlay.classList.contains('open')) {
      close();
    }
  });

  return { open, close };
}

let EPN_CMDK = null;
document.addEventListener('DOMContentLoaded', () => {
  EPN_CMDK = buildCommandPalette();
  document.querySelectorAll('[data-open-search]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (EPN_CMDK) EPN_CMDK.open();
    });
  });
});
