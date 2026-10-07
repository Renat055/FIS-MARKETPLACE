/* ==========================================================================
   EPN FIS — factura.js
   Renderiza el detalle de una factura generada en el checkout y permite
   imprimirla o guardarla como PDF desde el navegador.
   ========================================================================== */

function initInvoicePage() {
  const wrap = document.getElementById('invoiceWrap');
  if (!wrap) return;

  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  const invoice = id ? EPN.getInvoice(id) : null;

  if (!invoice) {
    wrap.innerHTML = `
      <div class="empty-state">
        <h3>No encontramos esa factura</h3>
        <p>Puede que el enlace sea incorrecto o que la factura ya no esté disponible en este dispositivo.</p>
        <a href="biblioteca.html" class="btn btn-primary">Ir a mi biblioteca</a>
      </div>`;
    return;
  }

  const rowsHtml = invoice.items.map(item => `
    <tr>
      <td>${EPN.esc(item.title)}</td>
      <td>${EPN.esc(item.licenseName)}</td>
      <td class="num">${item.qty}</td>
      <td class="num">${EPN.money(item.unitPrice)}</td>
      <td class="num">${EPN.money(item.total)}</td>
    </tr>`).join('');

  wrap.innerHTML = `
    <div class="invoice-card" id="invoiceCard">
      <div class="invoice-head">
        <div>
          <div class="invoice-brand"><span class="logo-mark">FS</span> EPN · FIS</div>
          <p class="invoice-sub">Marketplace de software estudiantil</p>
          <p class="invoice-sub">Escuela Politécnica Nacional · Facultad de Ingeniería de Sistemas</p>
        </div>
        <div class="invoice-meta">
          <h2>Factura</h2>
          <p><b>N.º</b> ${invoice.id}</p>
          <p><b>Fecha</b> ${invoice.date} · ${invoice.time}</p>
        </div>
      </div>

      <div class="invoice-parties">
        <div>
          <h4>Facturado a</h4>
          <p>${EPN.esc(invoice.buyer.name)}</p>
          <p>${EPN.esc(invoice.buyer.email)}</p>
        </div>
        <div>
          <h4>Vendedor</h4>
          <p>EPN FIS Marketplace</p>
          <p>Compra simulada · sin cargos reales</p>
        </div>
      </div>

      <table class="invoice-table">
        <thead>
          <tr><th>Producto</th><th>Licencia</th><th class="num">Cant.</th><th class="num">Precio</th><th class="num">Total</th></tr>
        </thead>
        <tbody>${rowsHtml}</tbody>
      </table>

      <div class="invoice-totals">
        <div class="invoice-totals-row"><span>Subtotal</span><span>${EPN.money(invoice.subtotal)}</span></div>
        <div class="invoice-totals-row"><span>Descuento${invoice.discountCode ? ' (' + invoice.discountCode + ')' : ''}</span><span>-${EPN.money(invoice.discount)}</span></div>
        <div class="invoice-totals-row grand"><span>Total pagado</span><span>${EPN.money(invoice.total)}</span></div>
      </div>

      <p class="invoice-note">Este documento es un comprobante simulado generado automáticamente por EPN FIS con fines académicos. No representa una transacción financiera real.</p>
    </div>`;

  const printBtn = document.getElementById('printBtn');
  if (printBtn) printBtn.addEventListener('click', () => window.print());
}

document.addEventListener('DOMContentLoaded', initInvoicePage);
