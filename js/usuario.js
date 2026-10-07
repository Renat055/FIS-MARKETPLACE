/* ==========================================================================
   EPN FIS — usuario.js
   Simula inicio de sesión y registro, y controla la página de biblioteca
   (productos comprados y favoritos del usuario autenticado).
   ========================================================================== */

function setFieldError(fieldEl, hasError) {
  fieldEl.classList.toggle('has-error', hasError);
}

/* ==========================================================================
   login.html
   ========================================================================== */
function initLoginForm() {
  const form = document.getElementById('loginForm');
  if (!form) return;

  const fieldEmail = document.getElementById('fieldEmail');
  const fieldPassword = document.getElementById('fieldPassword');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const submitBtn = form.querySelector('button[type=submit]');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value.trim());
    const passOk = passwordInput.value.length >= 6;
    setFieldError(fieldEmail, !emailOk);
    setFieldError(fieldPassword, !passOk);
    if (!emailOk || !passOk) return;

    const label = submitBtn.querySelector('.btn-label');
    submitBtn.disabled = true;
    if (label) label.textContent = 'Verificando…';
    submitBtn.insertAdjacentHTML('afterbegin', '<span class="spinner"></span> ');

    setTimeout(() => {
      const users = EPN.getUsers();
      const match = users.find(u => u.email.toLowerCase() === emailInput.value.trim().toLowerCase() && u.password === passwordInput.value);
      if (match) {
        EPN.setCurrentUser({ id: match.id, name: match.name, email: match.email });
        EPN.toast(`Bienvenido de nuevo, <b>${EPN.esc(match.name.split(' ')[0])}</b>`);
        setTimeout(() => { window.location.href = 'index.html'; }, 500);
      } else {
        submitBtn.disabled = false;
        submitBtn.querySelector('.spinner')?.remove();
        if (label) label.textContent = 'Iniciar sesión';
        setFieldError(fieldPassword, true);
        fieldPassword.querySelector('.field-error').textContent = '⚠ Correo o contraseña incorrectos.';
        EPN.toast('No pudimos verificar tus credenciales', 'error');
      }
    }, 700);
  });
}

/* ==========================================================================
   registro.html
   ========================================================================== */
function initRegisterForm() {
  const form = document.getElementById('registerForm');
  if (!form) return;

  const nameField = document.getElementById('fieldName');
  const emailField = document.getElementById('fieldEmail');
  const passField = document.getElementById('fieldPassword');
  const pass2Field = document.getElementById('fieldPassword2');
  const termsField = document.getElementById('fieldTerms');
  const termsError = document.getElementById('termsError');

  const name = document.getElementById('name');
  const email = document.getElementById('email');
  const password = document.getElementById('password');
  const password2 = document.getElementById('password2');
  const terms = document.getElementById('terms');

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const nameOk = name.value.trim().length >= 3;
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim());
    const passOk = password.value.length >= 6;
    const matchOk = password.value === password2.value && password.value.length > 0;
    const termsOk = terms.checked;

    setFieldError(nameField, !nameOk);
    setFieldError(emailField, !emailOk);
    setFieldError(passField, !passOk);
    setFieldError(pass2Field, !matchOk);
    termsError.style.display = termsOk ? 'none' : 'flex';

    if (!nameOk || !emailOk || !passOk || !matchOk || !termsOk) {
      EPN.toast('Revisa los campos marcados en rojo', 'error');
      return;
    }

    const users = EPN.getUsers();
    if (users.some(u => u.email.toLowerCase() === email.value.trim().toLowerCase())) {
      setFieldError(emailField, true);
      emailField.querySelector('.field-error').textContent = '⚠ Ya existe una cuenta con este correo.';
      return;
    }

    const newUser = {
      id: 'u' + Date.now(),
      name: name.value.trim(),
      email: email.value.trim(),
      password: password.value,
      bio: '',
    };
    EPN.addUser(newUser);
    EPN.setCurrentUser({ id: newUser.id, name: newUser.name, email: newUser.email });
    EPN.toast(`Cuenta creada. ¡Bienvenido, <b>${EPN.esc(newUser.name.split(' ')[0])}</b>!`);
    setTimeout(() => { window.location.href = 'index.html'; }, 600);
  });
}

/* ==========================================================================
   biblioteca.html
   ========================================================================== */
function initLibraryPage() {
  const wrap = document.getElementById('libraryWrap');
  if (!wrap) return;

  const guard = document.getElementById('guardWrap');
  const user = EPN.currentUser();

  if (!user) {
    wrap.classList.add('hidden');
    guard.classList.remove('hidden');
    return;
  }

  const purchasedGrid = document.getElementById('purchasedGrid');
  const library = EPN.read(EPN.KEYS.library, []);

  purchasedGrid.innerHTML = library.length
    ? library.map(item => {
        const p = EPN.getProduct(item.productId);
        if (!p) return '';
        return `
        <div class="library-card">
          <div class="library-icon"><img src="${productImgSrc(p)}" alt="${EPN.esc(p.title)}" loading="lazy" ${IMG_FALLBACK_ATTR}></div>
          <div>
            <h4>${EPN.esc(p.title)}</h4>
            <div class="lib-date">Adquirido el ${item.date} · Licencia ${item.licenseId}</div>
            <a href="producto.html?id=${p.id}" class="btn btn-outline btn-sm">Ver producto</a>
          </div>
        </div>`;
      }).join('')
    : `<div class="empty-state" style="grid-column:1/-1;"><h3>Aún no tienes compras</h3><p>Cuando adquieras un producto, aparecerá aquí para que lo descargues cuando quieras.</p><a href="productos.html" class="btn btn-primary">Explorar catálogo</a></div>`;

  const favoritesGrid = document.getElementById('favoritesGrid');
  const favIds = EPN.getFavorites();
  const favProducts = favIds.map(id => EPN.getProduct(id)).filter(Boolean);
  favoritesGrid.innerHTML = favProducts.length
    ? favProducts.map(renderProductCard).join('')
    : `<div class="empty-state" style="grid-column:1/-1;"><h3>No tienes favoritos todavía</h3><p>Toca el corazón en cualquier producto para guardarlo aquí.</p><a href="productos.html" class="btn btn-primary">Explorar catálogo</a></div>`;
  bindProductCardEvents(favoritesGrid);

  const invoicesBody = document.getElementById('invoicesTableBody');
  if (invoicesBody) {
    const invoices = EPN.getInvoices();
    invoicesBody.innerHTML = invoices.length
      ? invoices.map(inv => `
        <tr>
          <td>${inv.id}</td>
          <td>${inv.date} · ${inv.time}</td>
          <td>${inv.items.length} producto${inv.items.length !== 1 ? 's' : ''}</td>
          <td>${EPN.money(inv.total)}</td>
          <td><a href="factura.html?id=${encodeURIComponent(inv.id)}" class="btn btn-outline btn-sm">Ver factura</a></td>
        </tr>`).join('')
      : `<tr><td colspan="5" style="text-align:center;color:var(--muted-2);">Todavía no tienes facturas generadas.</td></tr>`;
  }

  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(btn.dataset.tab).classList.add('active');
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initLoginForm();
  initRegisterForm();
  initLibraryPage();
});
