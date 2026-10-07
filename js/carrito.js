/* ==========================================================================
   EPN FIS — carrito.js
   Lógica de la página del carrito: renderizado de ítems, cantidades,
   eliminación con confirmación, código promocional y compra simulada.
   ========================================================================== */

let appliedDiscount = 0;

function initCartPage() {
  const cartLayout = document.getElementById('cartLayout');
  if (!cartLayout) return;

  function render() {
    const cart = EPN.getCart();
    const empty = document.getElementById('cartEmpty');

    if (cart.length === 0) {
      cartLayout.classList.add('hidden');
      empty.classList.remove('hidden');
      updateSummary(0);
      return;
    }
    cartLayout.classList.remove('hidden');
    empty.classList.add('hidden');

    const itemsWrap = document.getElementById('cartItems');
    itemsWrap.innerHTML = cart.map((item, index) => {
      const p = EPN.getProduct(item.productId);
      if (!p) return '';
      const lic = EPN.licenses.find(l => l.id === item.licenseId) || EPN.licenses[0];
      const unitPrice = EPN.licensePrice(p.price, item.licenseId);
      return `
      <div class="cart-item" data-index="${index}">
        <div class="cart-thumb"><img src="${productImgSrc(p)}" alt="${EPN.esc(p.title)}" loading="lazy" ${IMG_FALLBACK_ATTR}></div>
        <div>
          <h4>${EPN.esc(p.title)}</h4>
          <div class="cart-license">${lic.name}</div>
        </div>
        <div class="cart-item-actions">
          <div class="qty-control">
            <button type="button" data-qty="-1" aria-label="Disminuir cantidad">−</button>
            <span>${item.qty}</span>
            <button type="button" data-qty="1" aria-label="Aumentar cantidad">+</button>
          </div>
          <span class="cart-price">${EPN.money(unitPrice * item.qty)}</span>
          <button class="remove-item" type="button" data-remove aria-label="Eliminar producto">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
          </button>
        </div>
      </div>`;
    }).join('');

    itemsWrap.querySelectorAll('[data-qty]').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = Number(btn.closest('.cart-item').dataset.index);
        const cart = EPN.getCart();
        const delta = Number(btn.dataset.qty);
        cart[idx].qty = Math.max(1, cart[idx].qty + delta);
        EPN.setCart(cart);
        render();
      });
    });

    itemsWrap.querySelectorAll('[data-remove]').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = Number(btn.closest('.cart-item').dataset.index);
        const cart = EPN.getCart();
        const p = EPN.getProduct(cart[idx].productId);
        EPN.confirmModal({
          title: 'Eliminar producto',
          message: `¿Quieres quitar "${p ? p.title : 'este producto'}" del carrito?`,
          confirmText: 'Eliminar',
          danger: true,
          onConfirm: () => {
            cart.splice(idx, 1);
            EPN.setCart(cart);
            render();
            EPN.toast('Producto eliminado del carrito');
          },
        });
      });
    });

    updateSummary(subtotal(cart));
  }

  function subtotal(cart) {
    return cart.reduce((sum, item) => {
      const p = EPN.getProduct(item.productId);
      if (!p) return sum;
      return sum + EPN.licensePrice(p.price, item.licenseId) * item.qty;
    }, 0);
  }

  function updateSummary(sub) {
    const discount = sub * appliedDiscount;
    const total = Math.max(0, sub - discount);
    document.getElementById('sumSubtotal').textContent = EPN.money(sub);
    document.getElementById('sumDiscount').textContent = '-' + EPN.money(discount);
    document.getElementById('sumTotal').textContent = EPN.money(total);
  }

  document.getElementById('promoBtn').addEventListener('click', () => {
    const code = document.getElementById('promoInput').value.trim().toUpperCase();
    if (code === 'EPN10') {
      appliedDiscount = 0.1;
      EPN.toast('Código aplicado: 10% de descuento');
    } else if (code === '') {
      EPN.toast('Ingresa un código de descuento', 'warn');
      return;
    } else {
      appliedDiscount = 0;
      EPN.toast('Código no válido', 'error');
    }
    render();
  });

  document.getElementById('checkoutBtn').addEventListener('click', () => {
    const cart = EPN.getCart();
    if (cart.length === 0) return;

    const user = EPN.currentUser();
    if (!user) {
      EPN.confirmModal({
        title: 'Inicia sesión para continuar',
        message: 'Necesitas una cuenta para guardar tus compras en tu biblioteca.',
        confirmText: 'Ir a iniciar sesión',
        onConfirm: () => { window.location.href = 'login.html'; },
      });
      return;
    }

    EPN.confirmModal({
      title: 'Confirmar compra',
      message: `Se procesará la compra simulada de ${cart.length} producto(s) por un total de ${document.getElementById('sumTotal').textContent}.`,
      confirmText: 'Comprar',
      onConfirm: () => {
        const sub = subtotal(cart);
        const discountAmount = sub * appliedDiscount;
        const total = Math.max(0, sub - discountAmount);
        const now = new Date();

        const invoice = {
          id: EPN.nextInvoiceNumber(),
          date: now.toISOString().slice(0, 10),
          time: now.toTimeString().slice(0, 5),
          buyer: { name: user.name, email: user.email },
          items: cart.map(item => {
            const p = EPN.getProduct(item.productId);
            const lic = EPN.licenses.find(l => l.id === item.licenseId) || EPN.licenses[0];
            const unitPrice = EPN.licensePrice(p.price, item.licenseId);
            return {
              productId: item.productId,
              title: p ? p.title : 'Producto',
              licenseName: lic.name,
              qty: item.qty,
              unitPrice,
              total: unitPrice * item.qty,
            };
          }),
          subtotal: sub,
          discount: discountAmount,
          discountCode: appliedDiscount > 0 ? 'EPN10' : null,
          total,
        };
        EPN.saveInvoice(invoice);

        const library = EPN.read(EPN.KEYS.library, []);
        const today = now.toISOString().slice(0, 10);
        cart.forEach(item => {
          library.unshift({ productId: item.productId, licenseId: item.licenseId, date: today, invoiceId: invoice.id });
        });
        EPN.write(EPN.KEYS.library, library);
        EPN.setCart([]);
        EPN.pushNotification(`Se generó la factura <b>${invoice.id}</b> por tu compra.`);
        EPN.toast('¡Compra realizada con éxito!');
        setTimeout(() => { window.location.href = 'factura.html?id=' + encodeURIComponent(invoice.id); }, 700);
      },
    });
  });

  render();
}

document.addEventListener('DOMContentLoaded', initCartPage);
