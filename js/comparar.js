/* ==========================================================================
   EPN FIS — comparar.js
   Construye la tabla comparativa a partir de los productos elegidos
   (por parámetro ?ids= o por lo guardado en el comparador global).
   ========================================================================== */

function initComparePage() {
  const wrap = document.getElementById('compareWrap');
  if (!wrap) return;

  const params = new URLSearchParams(window.location.search);
  const idsParam = params.get('ids');
  const ids = idsParam ? idsParam.split(',').filter(Boolean) : EPN.getCompare();
  const products = ids.map(id => EPN.getProduct(id)).filter(Boolean);

  function render() {
    if (products.length < 2) {
      wrap.innerHTML = `
        <div class="empty-state">
          <h3>Elige al menos dos productos para comparar</h3>
          <p>Marca la casilla "Comparar este producto" en cualquier tarjeta del catálogo y vuelve aquí.</p>
          <a href="productos.html" class="btn btn-primary">Ir al catálogo</a>
        </div>`;
      return;
    }

    const rows = [
      { label: 'Categoría', render: p => EPN.esc(EPN.getCategory(p.category)?.name || '—') },
      { label: 'Precio', render: p => `<span class="compare-price">${EPN.money(p.price)}</span>` },
      { label: 'Calificación', render: p => `<span class="stars">${EPN.stars(p.rating)}</span> <span class="count">(${p.reviewsCount})</span>` },
      { label: 'Vendedor', render: p => EPN.esc(p.seller) },
      { label: 'Descargas', render: p => `${p.sales}` },
      { label: 'Etiquetas', render: p => `<div class="tag-list" style="margin-top:0;">${p.tags.map(t => `<span class="tag">${EPN.esc(t)}</span>`).join('')}</div>` },
      { label: 'Descripción', render: p => `<span style="font-size:.85rem;color:var(--muted);">${EPN.esc(p.shortDesc)}</span>` },
    ];

    wrap.innerHTML = `
      <div style="overflow-x:auto;">
        <table class="compare-table">
          <thead>
            <tr>
              <th class="compare-label-col"></th>
              ${products.map(p => `
                <th>
                  <button type="button" class="compare-remove" data-remove="${p.id}" aria-label="Quitar de la comparación">✕</button>
                  <img src="${productImgSrc(p)}" alt="${EPN.esc(p.title)}" ${IMG_FALLBACK_ATTR}>
                  <div class="compare-title"><a href="producto.html?id=${p.id}">${EPN.esc(p.title)}</a></div>
                </th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${rows.map(row => `
              <tr>
                <td class="compare-label-col">${row.label}</td>
                ${products.map(p => `<td>${row.render(p)}</td>`).join('')}
              </tr>`).join('')}
            <tr>
              <td class="compare-label-col"></td>
              ${products.map(p => `
                <td>
                  <div style="display:flex;gap:6px;flex-wrap:wrap;">
                    <a href="producto.html?id=${p.id}" class="btn btn-outline btn-sm">Ver detalle</a>
                    <button class="btn btn-primary btn-sm" type="button" data-add-cart="${p.id}">Agregar</button>
                  </div>
                </td>`).join('')}
            </tr>
          </tbody>
        </table>
      </div>`;

    wrap.querySelectorAll('[data-remove]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-remove');
        EPN.toggleCompare(id);
        const idx = products.findIndex(p => p.id === id);
        if (idx > -1) products.splice(idx, 1);
        render();
      });
    });

    bindProductCardEvents(wrap);
  }

  render();
}

document.addEventListener('DOMContentLoaded', initComparePage);
