/* ==========================================================================
   EPN FIS — asistente.js
   Agente de soporte simulado (basado en reglas, sin backend real) que
   responde preguntas frecuentes y acompaña al usuario durante el proceso
   de compra. Se inyecta como un widget flotante disponible en todas las
   páginas y se puede abrir también desde botones contextuales.
   ========================================================================== */

const EPN_ASSISTANT = (function () {

  const STORAGE_KEY = 'epnfis_assistant_msgs';
  const OPENED_KEY = 'epnfis_assistant_opened';

  const KB = [
    { keys: ['comprar', 'como comprar', 'cómo comprar', 'proceso de compra', 'pasos para comprar', 'checkout'],
      answer: 'Para comprar: 1) abre el producto y elige una licencia, 2) presiona "Agregar al carrito" o "Comprar ahora", 3) en el carrito revisa el resumen y aplica un cupón si tienes uno, 4) presiona "Finalizar compra". Es una demo académica: no se realiza ningún cargo real.' },
    { keys: ['licencia', 'licencias', 'personal', 'de equipo', 'academica', 'académica'],
      answer: 'Hay tres licencias: Personal (uso individual), Equipo (hasta 5 integrantes, precio mayor) y Académica (con descuento, solo fines educativos). Se eligen en la página del producto, antes de agregarlo al carrito.' },
    { keys: ['cupon', 'cupón', 'descuento', 'codigo', 'código', 'promo'],
      answer: 'En el carrito hay un campo de "Código de descuento". Prueba con EPN10 para un 10% de descuento simulado sobre el subtotal.' },
    { keys: ['pago', 'pagar', 'tarjeta', 'metodo de pago', 'método de pago', 'cobro'],
      answer: 'EPN FIS es una plataforma de demostración: al finalizar la compra se simula el pago y el producto pasa directo a tu biblioteca. No se pide número de tarjeta ni se realiza ningún cobro real.' },
    { keys: ['biblioteca', 'mis compras', 'donde veo lo que compre', 'dónde veo lo que compré'],
      answer: 'Todo lo que compras aparece en "Mi biblioteca", en la pestaña Comprados. Ahí también puedes revisar tus favoritos.' },
    { keys: ['vender', 'publicar', 'subir mi proyecto', 'publicar software'],
      answer: 'Para publicar tu software ve a "Vender", completa nombre, categoría, descripción y precio, y confirma que eres el autor. Tu proyecto aparecerá luego en tu panel de vendedor.' },
    { keys: ['favorito', 'favoritos', 'me gusta'],
      answer: 'Toca el ícono de corazón en cualquier producto para guardarlo en tus favoritos. Puedes verlos en Mi biblioteca.' },
    { keys: ['cuenta', 'iniciar sesion', 'iniciar sesión', 'registro', 'registrarme', 'crear cuenta'],
      answer: 'Puedes registrarte desde "Crear cuenta" o usar la cuenta de prueba demo@epn.edu.ec / 123456 para explorar todas las funciones sin crear una nueva.' },
    { keys: ['reembolso', 'devolucion', 'devolución', 'cancelar compra', 'cancelar pedido'],
      answer: 'Como es una demo sin pagos reales, no existen reembolsos. Sí puedes quitar cualquier producto del carrito antes de presionar "Finalizar compra".' },
    { keys: ['carrito', 'agregar al carrito', 'cantidad'],
      answer: 'En el carrito puedes cambiar la cantidad con los botones + y −, quitar un producto con el ícono de basurero, y ver el total actualizado al instante.' },
    { keys: ['reseña', 'reseñas', 'calificacion', 'calificación', 'opinion', 'opinión'],
      answer: 'Puedes dejar una reseña desde la pestaña "Reseñas" en la página de cada producto: elige una calificación de estrellas y escribe tu comentario.' },
    { keys: ['soporte', 'ayuda humana', 'contacto', 'hablar con alguien'],
      answer: 'Soy un asistente simulado para esta demo académica de la FIS. Para dudas reales sobre la facultad, lo mejor es contactar a la coordinación académica.' },
  ];

  function findAnswer(text) {
    const t = text.toLowerCase();
    const hit = KB.find(item => item.keys.some(k => t.includes(k)));
    return hit
      ? hit.answer
      : 'No tengo una respuesta exacta para eso todavía, pero puedo ayudarte con licencias, pagos simulados, cupones, tu biblioteca o cómo publicar software. ¿Sobre cuál te gustaría saber más?';
  }

  function contextGreeting() {
    const path = window.location.pathname;
    if (path.includes('carrito')) return '¡Hola! Estoy aquí por si tienes dudas mientras finalizas tu compra: licencias, cupones o cómo funciona el pago simulado.';
    if (path.includes('producto')) return '¡Hola! Si tienes dudas sobre este producto, las licencias disponibles o cómo comprarlo, pregúntame lo que necesites.';
    if (path.includes('vender')) return '¡Hola! Puedo ayudarte con el proceso de publicar tu software en EPN FIS. ¿Qué necesitas saber?';
    return '¡Hola! Soy el asistente de EPN FIS. Puedo ayudarte a encontrar productos, entender las licencias o guiarte en el proceso de compra.';
  }

  function getMsgs() {
    try { return JSON.parse(sessionStorage.getItem(STORAGE_KEY) || '[]'); }
    catch (e) { return []; }
  }
  function saveMsgs(msgs) { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(msgs)); }

  let panelEl, fabEl, bodyEl, badgeEl;

  function renderMessages() {
    const msgs = getMsgs();
    bodyEl.innerHTML = msgs.map(m => `<div class="msg ${m.who}">${EPN.esc(m.text)}</div>`).join('');
    bodyEl.scrollTop = bodyEl.scrollHeight;
  }

  function pushMessage(who, text) {
    const msgs = getMsgs();
    msgs.push({ who, text });
    saveMsgs(msgs);
    renderMessages();
  }

  function showTyping() {
    const typingEl = document.createElement('div');
    typingEl.className = 'msg bot';
    typingEl.id = 'assistantTyping';
    typingEl.innerHTML = '<span class="typing-dots"><span></span><span></span><span></span></span>';
    bodyEl.appendChild(typingEl);
    bodyEl.scrollTop = bodyEl.scrollHeight;
  }
  function hideTyping() {
    const t = document.getElementById('assistantTyping');
    if (t) t.remove();
  }

  function respond(userText) {
    pushMessage('user', userText);
    showTyping();
    setTimeout(() => {
      hideTyping();
      pushMessage('bot', findAnswer(userText));
    }, 550 + Math.random() * 500);
  }

  function openPanel() {
    panelEl.classList.add('open');
    badgeEl.classList.add('hidden');
    fabEl.setAttribute('aria-expanded', 'true');
    sessionStorage.setItem(OPENED_KEY, '1');
    if (getMsgs().length === 0) {
      pushMessage('bot', contextGreeting());
    } else {
      renderMessages();
    }
  }
  function closePanel() {
    panelEl.classList.remove('open');
    fabEl.setAttribute('aria-expanded', 'false');
  }
  function togglePanel() { panelEl.classList.contains('open') ? closePanel() : openPanel(); }

  function buildWidget() {
    if (document.querySelector('.assistant-fab')) return;

    fabEl = document.createElement('button');
    fabEl.type = 'button';
    fabEl.className = 'assistant-fab';
    fabEl.setAttribute('aria-label', 'Abrir asistente de soporte');
    fabEl.setAttribute('aria-haspopup', 'true');
    fabEl.setAttribute('aria-expanded', 'false');
    fabEl.innerHTML = `
      <img src="assets/images/robot-asistente.png" alt="Asistente EPN FIS">
      <span class="fab-badge">1</span>`;

    panelEl = document.createElement('div');
    panelEl.className = 'assistant-panel';
    panelEl.innerHTML = `
      <div class="assistant-head">
        <span class="a-avatar"><img src="assets/images/robot-asistente.png" alt="Asistente EPN FIS"></span>
        <div>
          <h4>Asistente EPN FIS</h4>
          <span class="a-status">En línea · simulado</span>
        </div>
        <button class="assistant-close" type="button" aria-label="Cerrar asistente">✕</button>
      </div>
      <div class="assistant-body"></div>
      <div class="assistant-quick">
        <button class="quick-chip" type="button" data-quick="¿Cómo funciona el proceso de compra?">Proceso de compra</button>
        <button class="quick-chip" type="button" data-quick="¿Qué licencias existen?">Licencias</button>
        <button class="quick-chip" type="button" data-quick="¿Cómo aplico un cupón de descuento?">Cupones</button>
        <button class="quick-chip" type="button" data-quick="¿Dónde veo mis compras?">Mi biblioteca</button>
      </div>
      <form class="assistant-form">
        <input type="text" placeholder="Escribe tu pregunta…" aria-label="Escribe tu pregunta">
        <button type="submit" aria-label="Enviar">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
        </button>
      </form>`;

    document.body.appendChild(fabEl);
    document.body.appendChild(panelEl);

    bodyEl = panelEl.querySelector('.assistant-body');
    badgeEl = fabEl.querySelector('.fab-badge');

    if (sessionStorage.getItem(OPENED_KEY)) badgeEl.classList.add('hidden');

    fabEl.addEventListener('click', togglePanel);
    panelEl.querySelector('.assistant-close').addEventListener('click', closePanel);

    panelEl.querySelectorAll('[data-quick]').forEach(btn => {
      btn.addEventListener('click', () => respond(btn.dataset.quick));
    });

    const form = panelEl.querySelector('.assistant-form');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = form.querySelector('input');
      const text = input.value.trim();
      if (!text) return;
      input.value = '';
      respond(text);
    });

    document.addEventListener('click', (e) => {
      if (panelEl.classList.contains('open') && !panelEl.contains(e.target) && e.target !== fabEl && !fabEl.contains(e.target)) {
        closePanel();
      }
    });
  }

  function init() {
    buildWidget();
    document.querySelectorAll('[data-open-assistant]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        openPanel();
      });
    });
  }

  document.addEventListener('DOMContentLoaded', init);

  return { openPanel: () => openPanel() };
})();
