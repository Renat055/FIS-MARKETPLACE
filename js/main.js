/* ==========================================================================
   EPN FIS — main.js
   Namespace global, datos ficticios, utilidades compartidas por todas
   las páginas: encabezado, menú, toasts, modal de confirmación,
   notificaciones, carrito/favoritos (contadores) y helpers de localStorage.
   ========================================================================== */

const EPN = (function () {

  /* ---------------- Datos ficticios ---------------- */

  const categories = [
    { id: 'productividad', name: 'Productividad', desc: 'Herramientas de organización y gestión' },
    { id: 'desarrollo', name: 'Desarrollo', desc: 'Librerías, SDKs y utilidades para programar' },
    { id: 'diseno', name: 'Diseño', desc: 'Plantillas, íconos y recursos visuales' },
    { id: 'datos-ia', name: 'Datos & IA', desc: 'Modelos, notebooks y datasets' },
    { id: 'juegos', name: 'Juegos', desc: 'Proyectos y motores para videojuegos' },
    { id: 'seguridad', name: 'Seguridad', desc: 'Auditoría, cifrado y buenas prácticas' },
  ];

  const products = [
    { id: 'p01', title: 'TaskForge', category: 'productividad', price: 8.99, rating: 4.7, reviewsCount: 3, seller: 'Mateo Cevallos', sellerId: 'u02', shortDesc: 'Tablero kanban ligero con atajos de teclado y modo offline.', longDesc: 'TaskForge es un tablero kanban pensado para equipos pequeños de la facultad. Incluye atajos de teclado para mover tarjetas sin usar el mouse, exportación a CSV y un modo offline que sincroniza al reconectarse.', tags: ['kanban', 'offline', 'productividad'], sales: 128, dateAdded: '2026-06-02' },
    { id: 'p02', title: 'GitFlow Visual', category: 'desarrollo', price: 12.5, rating: 4.9, reviewsCount: 2, seller: 'Valentina Salas', sellerId: 'u03', shortDesc: 'Visualiza ramas y commits de Git en un grafo interactivo.', longDesc: 'GitFlow Visual conecta con tu repositorio local y dibuja un grafo interactivo de ramas, merges y commits. Útil para enseñar control de versiones en los laboratorios de la FIS.', tags: ['git', 'visualización', 'cli'], sales: 94, dateAdded: '2026-05-18' },
    { id: 'p03', title: 'IconForge', category: 'diseno', price: 5.0, rating: 4.4, reviewsCount: 4, seller: 'Doménica Ruiz', sellerId: 'u04', shortDesc: 'Generador de sets de íconos SVG consistentes.', longDesc: 'Con IconForge defines un grosor de trazo y una paleta, y generas automáticamente un set de más de 120 íconos SVG consistentes para tu proyecto o portafolio.', tags: ['svg', 'iconos', 'ui'], sales: 210, dateAdded: '2026-04-30' },
    { id: 'p04', title: 'DataSet Predictor', category: 'datos-ia', price: 15.0, rating: 4.6, reviewsCount: 3, seller: 'Iván Paredes', sellerId: 'u05', shortDesc: 'Notebook con modelo de regresión listo para tus datos académicos.', longDesc: 'Un notebook de Jupyter documentado paso a paso que entrena un modelo de regresión sobre datasets tabulares, ideal para el curso de Minería de Datos.', tags: ['python', 'machine-learning', 'notebook'], sales: 61, dateAdded: '2026-07-01' },
    { id: 'p05', title: 'PixelDash', category: 'juegos', price: 6.5, rating: 4.2, reviewsCount: 2, seller: 'Mateo Cevallos', sellerId: 'u02', shortDesc: 'Motor 2D ligero en JavaScript para plataformeros.', longDesc: 'PixelDash es un motor 2D minimalista escrito en JavaScript puro, con física simple, cámara con seguimiento y soporte para sprites en pixel-art.', tags: ['motor-2d', 'javascript', 'juegos'], sales: 77, dateAdded: '2026-06-20' },
    { id: 'p06', title: 'VaultGuard', category: 'seguridad', price: 10.0, rating: 4.8, reviewsCount: 1, seller: 'Valentina Salas', sellerId: 'u03', shortDesc: 'Auditor de dependencias con reporte de vulnerabilidades.', longDesc: 'VaultGuard escanea el árbol de dependencias de tu proyecto y genera un reporte legible con las vulnerabilidades conocidas y su nivel de severidad.', tags: ['seguridad', 'auditoria', 'cli'], sales: 39, dateAdded: '2026-07-10' },
    { id: 'p07', title: 'NotaFácil', category: 'productividad', price: 0, rating: 4.3, reviewsCount: 2, seller: 'Doménica Ruiz', sellerId: 'u04', shortDesc: 'Bloc de notas con etiquetas y búsqueda instantánea.', longDesc: 'NotaFácil es un bloc de notas minimalista con etiquetas de color, búsqueda instantánea y atajos rápidos para capturar ideas entre clases.', tags: ['notas', 'gratis', 'productividad'], sales: 340, dateAdded: '2026-03-11' },
    { id: 'p08', title: 'API Mocker', category: 'desarrollo', price: 7.25, rating: 4.5, reviewsCount: 3, seller: 'Iván Paredes', sellerId: 'u05', shortDesc: 'Simula endpoints REST a partir de un archivo JSON.', longDesc: 'API Mocker levanta un servidor local que simula endpoints REST definidos en un archivo JSON, perfecto para practicar consumo de APIs sin backend real.', tags: ['api', 'testing', 'nodejs'], sales: 152, dateAdded: '2026-05-02' },
    { id: 'p09', title: 'UI Blocks FIS', category: 'diseno', price: 9.99, rating: 4.6, reviewsCount: 2, seller: 'Mateo Cevallos', sellerId: 'u02', shortDesc: 'Componentes de interfaz reutilizables en CSS puro.', longDesc: 'Una colección de más de 40 componentes de interfaz (botones, tarjetas, formularios) construidos con CSS puro, sin dependencias, listos para copiar y pegar.', tags: ['css', 'componentes', 'ui'], sales: 188, dateAdded: '2026-06-15' },
    { id: 'p10', title: 'ChatBot Academico', category: 'datos-ia', price: 18.0, rating: 4.9, reviewsCount: 2, seller: 'Valentina Salas', sellerId: 'u03', shortDesc: 'Asistente conversacional entrenado con material de la facultad.', longDesc: 'Plantilla de chatbot que responde preguntas frecuentes de estudiantes usando material académico como base de conocimiento, con panel de administración incluido.', tags: ['chatbot', 'ia', 'educacion'], sales: 45, dateAdded: '2026-07-22' },
    { id: 'p11', title: 'Laberinto Quántico', category: 'juegos', price: 4.0, rating: 4.1, reviewsCount: 2, seller: 'Iván Paredes', sellerId: 'u05', shortDesc: 'Puzzle 2D con mecánicas de teletransporte.', longDesc: 'Un juego de puzzles 2D donde resuelves laberintos usando portales cuánticos. Incluye editor de niveles y 30 niveles predefinidos.', tags: ['puzzle', '2d', 'juegos'], sales: 58, dateAdded: '2026-04-05' },
    { id: 'p12', title: 'HashCheck', category: 'seguridad', price: 3.5, rating: 4.4, reviewsCount: 1, seller: 'Doménica Ruiz', sellerId: 'u04', shortDesc: 'Verificador de integridad de archivos por lotes.', longDesc: 'HashCheck calcula y compara hashes SHA-256 de archivos en lote, útil para verificar la integridad de entregas y proyectos de laboratorio.', tags: ['hash', 'integridad', 'cli'], sales: 26, dateAdded: '2026-07-29' },
  ];

  const licenses = [
    { id: 'personal', name: 'Licencia personal', mult: 1, desc: 'Uso individual, un solo proyecto' },
    { id: 'equipo', name: 'Licencia de equipo', mult: 2.4, desc: 'Hasta 5 integrantes, proyectos internos' },
    { id: 'academica', name: 'Licencia académica', mult: 0.6, desc: 'Solo para fines educativos con validación EPN' },
  ];

  const reviewsSeed = {
    p01: [
      { user: 'Ana T.', rating: 5, comment: 'Excelente para organizar el proyecto de aula. Muy simple de usar.', date: '2026-07-02' },
      { user: 'Carlos M.', rating: 4, comment: 'Cumple lo que promete, me gustaría más colores para etiquetas.', date: '2026-06-20' },
      { user: 'Sofía R.', rating: 5, comment: 'El modo offline salvó una entrega sin internet en el bus.', date: '2026-06-11' },
    ],
    p02: [
      { user: 'Diego P.', rating: 5, comment: 'El grafo interactivo ayuda muchísimo a explicar Git a mis compañeros.', date: '2026-05-25' },
      { user: 'Emilia F.', rating: 5, comment: 'Instalación rápida y documentación clara.', date: '2026-05-19' },
    ],
    p03: [
      { user: 'Luis A.', rating: 4, comment: 'Buen set de íconos, algunos trazos quedan algo gruesos.', date: '2026-05-01' },
      { user: 'Marina G.', rating: 5, comment: 'Uso esto en todos mis proyectos de UI ahora.', date: '2026-05-05' },
      { user: 'Pablo S.', rating: 4, comment: 'Muy consistente entre íconos.', date: '2026-05-12' },
      { user: 'Renata V.', rating: 5, comment: 'Justo lo que necesitaba para mi portafolio.', date: '2026-05-20' },
    ],
  };

  const seedUsers = [
    { id: 'u01', name: 'Estudiante Demo', email: 'demo@epn.edu.ec', password: '123456', bio: 'Estudiante de la Facultad de Ingeniería de Sistemas.' },
    { id: 'u02', name: 'Mateo Cevallos', email: 'mateo@epn.edu.ec', password: '123456', bio: 'Desarrollador de herramientas de productividad.' },
    { id: 'u03', name: 'Valentina Salas', email: 'valentina@epn.edu.ec', password: '123456', bio: 'Ingeniera de software, entusiasta de IA.' },
    { id: 'u04', name: 'Doménica Ruiz', email: 'domenica@epn.edu.ec', password: '123456', bio: 'Diseñadora UI y desarrolladora frontend.' },
    { id: 'u05', name: 'Iván Paredes', email: 'ivan@epn.edu.ec', password: '123456', bio: 'Backend y seguridad informática.' },
  ];

  const questionsSeed = {
    p01: [
      { id: 'q1', question: '¿TaskForge funciona sin conexión a internet todo el tiempo?', askedBy: 'Renata V.', date: '2026-07-05', answer: 'Sí, el modo offline guarda tus tableros localmente y sincroniza automáticamente cuando vuelves a tener conexión.', answeredBy: 'Mateo Cevallos', answerDate: '2026-07-06' },
      { id: 'q2', question: '¿Puedo exportar mis tareas a Excel?', askedBy: 'Luis A.', date: '2026-07-10', answer: null, answeredBy: null, answerDate: null },
    ],
    p02: [
      { id: 'q3', question: '¿GitFlow Visual soporta repositorios muy grandes?', askedBy: 'Emilia F.', date: '2026-05-20', answer: 'Se ha probado con repositorios de más de 5,000 commits sin problemas de rendimiento.', answeredBy: 'Valentina Salas', answerDate: '2026-05-21' },
    ],
  };

  /* ---------------- Claves de almacenamiento ---------------- */
  const KEYS = {
    cart: 'epnfis_cart',
    favorites: 'epnfis_favorites',
    user: 'epnfis_user',
    library: 'epnfis_library',
    published: 'epnfis_published',
    users: 'epnfis_users',
    reviews: 'epnfis_reviews',
    notifications: 'epnfis_notifications',
    invoices: 'epnfis_invoices',
    compare: 'epnfis_compare',
    questions: 'epnfis_questions',
  };

  /* ---------------- Helpers de almacenamiento ---------------- */
  function read(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback;
    }
  }
  function write(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function ensureSeed() {
    if (!localStorage.getItem(KEYS.users)) write(KEYS.users, seedUsers);
    if (!localStorage.getItem(KEYS.reviews)) write(KEYS.reviews, reviewsSeed);
    if (!localStorage.getItem(KEYS.questions)) write(KEYS.questions, questionsSeed);
    if (!localStorage.getItem(KEYS.cart)) write(KEYS.cart, []);
    if (!localStorage.getItem(KEYS.favorites)) write(KEYS.favorites, []);
    if (!localStorage.getItem(KEYS.library)) write(KEYS.library, []);
    if (!localStorage.getItem(KEYS.published)) write(KEYS.published, []);
    if (!localStorage.getItem(KEYS.invoices)) write(KEYS.invoices, []);
    if (!localStorage.getItem(KEYS.compare)) write(KEYS.compare, []);
    if (!localStorage.getItem(KEYS.notifications)) {
      write(KEYS.notifications, [
        { id: 'n1', text: 'Bienvenido a <b>EPN FIS</b>, el marketplace de software de la facultad.', time: 'Hace 2 días', unread: false },
        { id: 'n2', text: 'Nueva versión disponible para <b>TaskForge</b>.', time: 'Hace 5 horas', unread: true },
      ]);
    }
  }

  function allProducts() {
    return products.concat(read(KEYS.published, []));
  }

  function getProduct(id) {
    return allProducts().find(p => p.id === id);
  }

  function getCategory(id) {
    return categories.find(c => c.id === id);
  }

  /* ---------------- Usuario / sesión ---------------- */
  function currentUser() {
    return read(KEYS.user, null);
  }
  function setCurrentUser(user) {
    write(KEYS.user, user);
  }
  function logout() {
    localStorage.removeItem(KEYS.user);
  }
  function getUsers() {
    return read(KEYS.users, seedUsers);
  }
  function addUser(user) {
    const users = getUsers();
    users.push(user);
    write(KEYS.users, users);
  }

  /* ---------------- Carrito ---------------- */
  function getCart() { return read(KEYS.cart, []); }
  function setCart(cart) { write(KEYS.cart, cart); refreshHeaderCounts(); }
  function addToCart(productId, licenseId) {
    const cart = getCart();
    const existing = cart.find(i => i.productId === productId && i.licenseId === licenseId);
    if (existing) existing.qty += 1;
    else cart.push({ productId, licenseId: licenseId || 'personal', qty: 1 });
    setCart(cart);
  }
  function cartCount() {
    return getCart().reduce((sum, i) => sum + i.qty, 0);
  }

  /* ---------------- Favoritos ---------------- */
  function getFavorites() { return read(KEYS.favorites, []); }
  function setFavorites(favs) { write(KEYS.favorites, favs); refreshHeaderCounts(); }
  function isFavorite(productId) { return getFavorites().includes(productId); }
  function toggleFavorite(productId) {
    let favs = getFavorites();
    if (favs.includes(productId)) favs = favs.filter(id => id !== productId);
    else favs.push(productId);
    setFavorites(favs);
    return favs.includes(productId);
  }

  /* ---------------- Precio con licencia ---------------- */
  function licensePrice(basePrice, licenseId) {
    const lic = licenses.find(l => l.id === licenseId) || licenses[0];
    return Math.round(basePrice * lic.mult * 100) / 100;
  }

  /* ---------------- Seguridad: escape de HTML ---------------- */
  function esc(value) {
    if (value === null || value === undefined) return '';
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /* ---------------- Formato ---------------- */
  function money(n) {
    if (n === 0) return 'Gratis';
    return '$' + n.toFixed(2);
  }
  function stars(rating) {
    const full = Math.round(rating);
    return '★'.repeat(full) + '☆'.repeat(5 - full);
  }
  function initials(name) {
    return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  }

  /* ---------------- Comparador de productos ---------------- */
  const COMPARE_LIMIT = 3;
  function getCompare() { return read(KEYS.compare, []); }
  function setCompare(list) { write(KEYS.compare, list); }
  function isInCompare(id) { return getCompare().includes(id); }
  function toggleCompare(id) {
    let list = getCompare();
    if (list.includes(id)) {
      list = list.filter(x => x !== id);
      setCompare(list);
      return { added: false, list, limitReached: false };
    }
    if (list.length >= COMPARE_LIMIT) {
      return { added: false, list, limitReached: true };
    }
    list.push(id);
    setCompare(list);
    return { added: true, list, limitReached: false };
  }
  function clearCompare() { setCompare([]); }

  /* ---------------- Facturas ---------------- */
  function getInvoices() { return read(KEYS.invoices, []); }
  function getInvoice(id) { return getInvoices().find(inv => inv.id === id); }
  function nextInvoiceNumber() {
    const year = new Date().getFullYear();
    const count = getInvoices().length + 1;
    return `FAC-${year}-${String(count).padStart(4, '0')}`;
  }
  function saveInvoice(invoice) {
    const invoices = getInvoices();
    invoices.unshift(invoice);
    write(KEYS.invoices, invoices);
  }

  /* ---------------- Toasts ---------------- */
  function toast(message, type) {
    let stack = document.querySelector('.toast-stack');
    if (!stack) {
      stack = document.createElement('div');
      stack.className = 'toast-stack';
      stack.setAttribute('role', 'status');
      stack.setAttribute('aria-live', 'polite');
      document.body.appendChild(stack);
    }
    const el = document.createElement('div');
    el.className = 'toast' + (type ? ' ' + type : '');
    el.innerHTML = message;
    stack.appendChild(el);
    setTimeout(() => {
      el.classList.add('leaving');
      setTimeout(() => el.remove(), 220);
    }, 3200);
  }

  /* ---------------- Modal de confirmación ---------------- */
  function confirmModal({ title, message, confirmText, danger, onConfirm }) {
    let overlay = document.querySelector('.modal-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = 'modal-overlay';
      overlay.innerHTML = `
        <div class="modal-box" role="dialog" aria-modal="true">
          <h3 class="m-title"></h3>
          <p class="m-message"></p>
          <div class="modal-actions">
            <button class="btn btn-ghost m-cancel" type="button">Cancelar</button>
            <button class="btn m-confirm" type="button"></button>
          </div>
        </div>`;
      document.body.appendChild(overlay);
      overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });
    }
    overlay.querySelector('.m-title').textContent = title;
    overlay.querySelector('.m-message').textContent = message;
    const confirmBtn = overlay.querySelector('.m-confirm');
    confirmBtn.textContent = confirmText || 'Confirmar';
    confirmBtn.className = 'btn m-confirm ' + (danger ? 'btn-danger' : 'btn-primary');
    overlay.querySelector('.m-cancel').onclick = closeModal;
    confirmBtn.onclick = () => { closeModal(); if (onConfirm) onConfirm(); };
    overlay.classList.add('open');
  }
  function closeModal() {
    const overlay = document.querySelector('.modal-overlay');
    if (overlay) overlay.classList.remove('open');
  }

  /* ---------------- Notificaciones ---------------- */
  function getNotifications() { return read(KEYS.notifications, []); }
  function markNotificationsRead() {
    const list = getNotifications().map(n => ({ ...n, unread: false }));
    write(KEYS.notifications, list);
  }
  function pushNotification(text) {
    const list = getNotifications();
    list.unshift({ id: 'n' + Date.now(), text, time: 'Ahora', unread: true });
    write(KEYS.notifications, list);
  }

  /* ---------------- Encabezado / navegación ---------------- */
  function refreshHeaderCounts() {
    document.querySelectorAll('[data-cart-count]').forEach(el => {
      const n = cartCount();
      el.textContent = n;
      el.classList.toggle('hidden', n === 0);
    });
    document.querySelectorAll('[data-fav-count]').forEach(el => {
      const n = getFavorites().length;
      el.textContent = n;
      el.classList.toggle('hidden', n === 0);
    });
    const notifBadge = document.querySelector('[data-notif-count]');
    if (notifBadge) {
      const n = getNotifications().filter(x => x.unread).length;
      notifBadge.textContent = n;
      notifBadge.classList.toggle('hidden', n === 0);
    }
  }

  function renderUserChip() {
    const slot = document.querySelector('[data-user-slot]');
    if (!slot) return;
    const user = currentUser();
    if (user) {
      slot.innerHTML = `
        <button class="user-chip" type="button" id="userMenuBtn" aria-haspopup="true" aria-expanded="false">
          <span class="avatar">${esc(initials(user.name))}</span>
          <span>${esc(user.name.split(' ')[0])}</span>
        </button>
        <div class="user-dropdown" id="userDropdown">
          <a href="biblioteca.html">Mi biblioteca</a>
          <a href="dashboard.html">Panel de vendedor</a>
          <div class="dropdown-divider"></div>
          <button type="button" class="logout-btn" id="logoutBtn">Cerrar sesión</button>
        </div>`;
      bindUserMenu();
    } else {
      slot.innerHTML = `<a href="login.html" class="btn btn-outline btn-sm">Iniciar sesión</a>`;
    }
  }

  function bindUserMenu() {
    const btn = document.getElementById('userMenuBtn');
    const dropdown = document.getElementById('userDropdown');
    const logoutBtn = document.getElementById('logoutBtn');
    if (!btn || !dropdown) return;

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdown.classList.toggle('open');
      btn.setAttribute('aria-expanded', String(dropdown.classList.contains('open')));
    });
    document.addEventListener('click', (e) => {
      if (!dropdown.contains(e.target) && e.target !== btn) {
        dropdown.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
      }
    });
    logoutBtn.addEventListener('click', () => {
      dropdown.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
      confirmModal({
        title: 'Cerrar sesión',
        message: '¿Seguro que quieres cerrar tu sesión actual?',
        confirmText: 'Cerrar sesión',
        danger: true,
        onConfirm: () => {
          logout();
          toast('Sesión cerrada correctamente');
          setTimeout(() => { window.location.href = 'index.html'; }, 500);
        },
      });
    });
  }

  function bindNotifPanel() {
    const btn = document.querySelector('[data-notif-btn]');
    const panel = document.querySelector('[data-notif-panel]');
    if (!btn || !panel) return;
    function renderList() {
      const list = getNotifications();
      panel.querySelector('.notif-body').innerHTML = list.length
        ? list.map(n => `<div class="notif-item ${n.unread ? 'unread' : ''}"><span>${n.text}</span><span class="n-time">${n.time}</span></div>`).join('')
        : `<div class="notif-empty">No tienes notificaciones nuevas.</div>`;
    }
    renderList();
    btn.setAttribute('aria-haspopup', 'true');
    btn.setAttribute('aria-expanded', 'false');
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      panel.classList.toggle('open');
      const open = panel.classList.contains('open');
      btn.setAttribute('aria-expanded', String(open));
      if (open) {
        markNotificationsRead();
        refreshHeaderCounts();
        renderList();
      }
    });
    document.addEventListener('click', (e) => {
      if (!panel.contains(e.target) && e.target !== btn) {
        panel.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
      }
    });
  }

  function bindThemeToggle() {
    document.querySelectorAll('[data-theme-toggle]').forEach(btn => {
      btn.addEventListener('click', () => {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        if (isDark) {
          document.documentElement.removeAttribute('data-theme');
          localStorage.setItem('epnfis_theme', 'light');
        } else {
          document.documentElement.setAttribute('data-theme', 'dark');
          localStorage.setItem('epnfis_theme', 'dark');
        }
      });
    });
  }

  function bindMobileMenu() {
    const toggle = document.querySelector('.menu-toggle');
    const nav = document.querySelector('.mobile-nav');
    if (!toggle || !nav) return;
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Abrir menú');
    toggle.addEventListener('click', () => {
      toggle.classList.toggle('open');
      nav.classList.toggle('open');
      const open = toggle.classList.contains('open');
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    });
  }

  function bindHeaderSearch() {
    const forms = document.querySelectorAll('[data-header-search]');
    forms.forEach(form => {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const q = form.querySelector('input').value.trim();
        window.location.href = 'productos.html' + (q ? '?q=' + encodeURIComponent(q) : '');
      });
    });
  }

  function initHeader() {
    ensureSeed();
    refreshHeaderCounts();
    renderUserChip();
    bindNotifPanel();
    bindThemeToggle();
    bindMobileMenu();
    bindHeaderSearch();
  }

  document.addEventListener('DOMContentLoaded', initHeader);

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js').catch(() => {
        /* silencioso: si falla (p. ej. abierto como file://), la app sigue funcionando sin offline */
      });
    });
  }

  return {
    KEYS, categories, products, licenses,
    read, write, allProducts, getProduct, getCategory,
    currentUser, setCurrentUser, logout, getUsers, addUser,
    getCart, setCart, addToCart, cartCount,
    getFavorites, setFavorites, isFavorite, toggleFavorite,
    licensePrice, money, stars, initials, esc,
    toast, confirmModal, closeModal,
    getNotifications, pushNotification, markNotificationsRead,
    getInvoices, getInvoice, saveInvoice, nextInvoiceNumber,
    getCompare, isInCompare, toggleCompare, clearCompare, COMPARE_LIMIT,
    refreshHeaderCounts, renderUserChip,
  };
})();
