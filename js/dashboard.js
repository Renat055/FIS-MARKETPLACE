/* ==========================================================================
   EPN FIS — dashboard.js
   Lógica para vender.html (publicar software, simulado) y
   dashboard.html (panel de vendedor con estadísticas y productos).
   ========================================================================== */

/* ==========================================================================
   vender.html
   ========================================================================== */
function initSellPage() {
  const form = document.getElementById('publishForm');
  if (!form) return;

  const guard = document.getElementById('guardWrap');
  const sellForm = document.getElementById('sellForm');
  const user = EPN.currentUser();

  if (!user) {
    sellForm.classList.add('hidden');
    guard.classList.remove('hidden');
    return;
  }

  const catSelect = document.getElementById('pCategory');
  catSelect.innerHTML = EPN.categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('');

  const imageInput = document.getElementById('pImage');
  const previewWrap = document.getElementById('imagePreviewWrap');
  const previewImg = document.getElementById('imagePreview');
  let uploadedImageDataUrl = null;

  imageInput.addEventListener('change', () => {
    const file = imageInput.files[0];
    if (!file) { uploadedImageDataUrl = null; previewWrap.classList.add('hidden'); return; }
    const reader = new FileReader();
    reader.onload = () => {
      uploadedImageDataUrl = reader.result;
      previewImg.src = uploadedImageDataUrl;
      previewWrap.classList.remove('hidden');
    };
    reader.readAsDataURL(file);
  });

  function setError(id, hasError) {
    document.getElementById(id).classList.toggle('has-error', hasError);
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const title = document.getElementById('pTitle').value.trim();
    const shortDesc = document.getElementById('pShort').value.trim();
    const longDesc = document.getElementById('pLong').value.trim();
    const price = document.getElementById('pPrice').value;
    const confirmChecked = document.getElementById('pConfirm').checked;

    const titleOk = title.length >= 3;
    const shortOk = shortDesc.length >= 10;
    const longOk = longDesc.length >= 30;
    const priceOk = price !== '' && Number(price) >= 0;

    setError('fieldTitle', !titleOk);
    setError('fieldShort', !shortOk);
    setError('fieldLong', !longOk);
    setError('fieldPrice', !priceOk);

    if (!titleOk || !shortOk || !longOk || !priceOk) {
      EPN.toast('Revisa los campos marcados en rojo', 'error');
      return;
    }
    if (!confirmChecked) {
      EPN.toast('Debes confirmar la autoría del proyecto', 'error');
      return;
    }

    const tags = document.getElementById('pTags').value
      .split(',').map(t => t.trim()).filter(Boolean);

    const newProduct = {
      id: 'up' + Date.now(),
      title,
      category: catSelect.value,
      price: Number(price),
      rating: 0,
      reviewsCount: 0,
      seller: user.name,
      sellerId: user.id,
      image: uploadedImageDataUrl || 'assets/images/productos/placeholder.svg',
      shortDesc,
      longDesc,
      tags: tags.length ? tags : ['nuevo'],
      sales: 0,
      dateAdded: new Date().toISOString().slice(0, 10),
    };

    const published = EPN.read(EPN.KEYS.published, []);
    published.unshift(newProduct);
    EPN.write(EPN.KEYS.published, published);
    EPN.pushNotification(`Tu proyecto <b>${EPN.esc(title)}</b> fue publicado correctamente.`);

    const submitBtn = form.querySelector('button[type=submit]');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner"></span> Publicando…';

    setTimeout(() => {
      EPN.toast(`<b>${EPN.esc(title)}</b> se publicó con éxito`);
      window.location.href = 'dashboard.html';
    }, 700);
  });
}

/* ==========================================================================
   dashboard.html
   ========================================================================== */
function initDashboardPage() {
  const dashWrap = document.getElementById('dashWrap');
  if (!dashWrap) return;

  const guard = document.getElementById('guardWrap');
  const user = EPN.currentUser();

  if (!user) {
    dashWrap.classList.add('hidden');
    guard.classList.remove('hidden');
    return;
  }

  const myProducts = EPN.allProducts().filter(p => p.sellerId === user.id || (EPN.read(EPN.KEYS.published, []).some(pp => pp.id === p.id)));

  const totalSales = myProducts.reduce((s, p) => s + p.sales, 0);
  const revenue = myProducts.reduce((s, p) => s + p.sales * p.price, 0);
  const avgRating = myProducts.length
    ? myProducts.reduce((s, p) => s + p.rating, 0) / myProducts.length
    : 0;

  document.getElementById('statProducts').textContent = myProducts.length;
  document.getElementById('statSales').textContent = totalSales;
  document.getElementById('statRevenue').textContent = '$' + revenue.toFixed(0);
  document.getElementById('statRating').textContent = avgRating.toFixed(1);

  const barsChart = document.getElementById('barsChart');
  const maxSales = Math.max(1, ...myProducts.map(p => p.sales));
  barsChart.innerHTML = myProducts.length
    ? myProducts.slice(0, 8).map(p => `
      <div class="bar-col">
        <div class="bar" style="height:${Math.max(6, (p.sales / maxSales) * 140)}px;" title="${p.sales} ventas"></div>
        <img class="bar-label-img" src="${typeof productImgSrc === 'function' ? productImgSrc(p) : ''}" alt="${EPN.esc(p.title)}" ${typeof IMG_FALLBACK_ATTR === 'string' ? IMG_FALLBACK_ATTR : ''}>
      </div>`).join('')
    : `<p style="font-size:.85rem;">Publica tu primer proyecto para ver estadísticas aquí.</p>`;

  const tbody = document.getElementById('productsTableBody');
  const publishedIds = EPN.read(EPN.KEYS.published, []).map(p => p.id);
  tbody.innerHTML = myProducts.length
    ? myProducts.map(p => {
        const cat = EPN.getCategory(p.category);
        const removable = publishedIds.includes(p.id);
        return `
        <tr data-product-id="${p.id}">
          <td>
            <div class="p-mini">
              <div class="mini-icon"><img src="${typeof productImgSrc === 'function' ? productImgSrc(p) : ''}" alt="${EPN.esc(p.title)}" ${typeof IMG_FALLBACK_ATTR === 'string' ? IMG_FALLBACK_ATTR : ''}></div>
              <span>${EPN.esc(p.title)}</span>
            </div>
          </td>
          <td>${cat ? cat.name : '—'}</td>
          <td>${EPN.money(p.price)}</td>
          <td>${p.sales}</td>
          <td><span class="pill ${p.sales > 0 ? 'ok' : 'pending'}">${p.sales > 0 ? 'Activo' : 'Sin ventas'}</span></td>
          <td>
            <div class="table-actions">
              <button type="button" data-delete-product="${p.id}" ${removable ? '' : 'disabled title="Producto de demostración"'} aria-label="Eliminar producto">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
              </button>
            </div>
          </td>
        </tr>`;
      }).join('')
    : `<tr><td colspan="6" style="text-align:center;color:var(--muted-2);">Todavía no has publicado productos.</td></tr>`;

  tbody.querySelectorAll('[data-delete-product]:not([disabled])').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-delete-product');
      const p = EPN.getProduct(id);
      EPN.confirmModal({
        title: 'Eliminar producto',
        message: `¿Seguro que deseas eliminar "${p ? p.title : ''}" de tu catálogo? Esta acción no se puede deshacer.`,
        confirmText: 'Eliminar',
        danger: true,
        onConfirm: () => {
          const published = EPN.read(EPN.KEYS.published, []).filter(pp => pp.id !== id);
          EPN.write(EPN.KEYS.published, published);
          EPN.toast('Producto eliminado');
          initDashboardPage();
        },
      });
    });
  });

  document.querySelectorAll('[data-dash-tab]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      document.querySelectorAll('[data-dash-tab]').forEach(l => l.classList.remove('active'));
      link.classList.add('active');
      document.querySelectorAll('.dash-panel').forEach(p => p.classList.add('hidden'));
      document.getElementById('panel-' + link.dataset.dashTab).classList.remove('hidden');
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initSellPage();
  initDashboardPage();
});
