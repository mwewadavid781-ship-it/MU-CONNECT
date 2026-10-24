const state = { products: [], stores: [], cart: new Map(), category: '', search: '', mode: 'demo' };
const $ = (selector) => document.querySelector(selector);
const money = (amount) => new Intl.NumberFormat('en-ZM', { style: 'currency', currency: 'ZMW', maximumFractionDigits: 2 }).format(Number(amount) || 0);
const escapeHtml = (value = '') => String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const symbols = { Essentials: '✦', Food: '♨', Stationery: '▤', Services: '⌘', Clothing: '◇', Electronics: '⌁' };

async function api(path, options = {}) {
  const response = await fetch(path, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Something went wrong.');
  return data;
}

async function loadMarketplace() {
  try {
    const [productData, storeData] = await Promise.all([api('/api/products'), api('/api/stores')]);
    state.products = productData.products || [];
    state.stores = storeData.stores || [];
    state.mode = productData.mode || 'demo';
    $('#market-mode').textContent = state.mode === 'live' ? 'Live listings' : 'Marketplace preview';
    renderProducts();
    renderStores();
  } catch (error) {
    $('#product-grid').innerHTML = `<div class="loading-state">We couldn't load the marketplace. ${escapeHtml(error.message)}</div>`;
    $('#store-grid').innerHTML = '';
  }
}

function renderProducts() {
  const products = state.products.filter((product) => {
    const haystack = `${product.name} ${product.description || ''} ${product.store?.name || ''} ${product.category || ''}`.toLowerCase();
    return (!state.search || haystack.includes(state.search)) &&
      (!state.category || String(product.category).toLowerCase() === state.category.toLowerCase());
  });
  $('#product-grid').innerHTML = products.map((product) => {
    const inCart = state.cart.get(String(product.id))?.quantity || 0;
    const image = product.image_url ? `<img src="${escapeHtml(product.image_url)}" alt="${escapeHtml(product.name)}" loading="lazy" onerror="this.remove()">` : '';
    return `<article class="product-card">
      <div class="product-image"><span class="category-tag">${escapeHtml(product.category || 'Marketplace')}</span><span class="product-symbol">${symbols[product.category] || '✧'}</span>${image}</div>
      <div class="product-info"><div class="store-name">${escapeHtml(product.store?.name || 'Campus seller')}</div>
      <h3>${escapeHtml(product.name)}</h3><p>${escapeHtml(product.description || 'Contact the seller for more information.')}</p>
      <div class="product-bottom"><span class="price">${money(product.price)}</span><button class="add-button" data-add="${escapeHtml(product.id)}" aria-label="Add ${escapeHtml(product.name)} to bag" ${Number(product.stock) <= 0 ? 'disabled' : ''}>${inCart ? `✓ ${inCart}` : '+'}</button></div></div></article>`;
  }).join('');
  $('#empty-state').classList.toggle('hidden', products.length > 0);
}

function renderStores() {
  const descriptions = {
    'mu-essentials': 'Useful essentials and everyday campus finds.',
    'prime-poultry': 'Poultry pre-orders. Confirm readiness and collection details first.',
    'tech-corner': 'Student-friendly device support and tech services.'
  };
  $('#store-grid').innerHTML = state.stores.length ? state.stores.map((store) => `<article class="store-card"><div class="store-avatar">${escapeHtml((store.name || 'M').slice(0, 1).toUpperCase())}</div><div><div class="store-label">CAMPUS SELLER</div><h3>${escapeHtml(store.name)}</h3><p>${escapeHtml(store.description || descriptions[store.slug] || 'Browse this seller’s products and contact them to confirm details.')}</p></div></article>`).join('') : '<div class="loading-state">Seller profiles will appear here as they join.</div>';
}

function addToCart(id) {
  const product = state.products.find((item) => String(item.id) === String(id));
  if (!product) return;
  const existing = state.cart.get(String(id));
  const quantity = (existing?.quantity || 0) + 1;
  if (quantity > Math.max(1, Number(product.stock) || 1)) return showToast('That is the available demo quantity.');
  state.cart.set(String(id), { product, quantity });
  updateCart();
  showToast(`${product.name} added to your bag.`);
}

function changeQuantity(id, delta) {
  const entry = state.cart.get(String(id));
  if (!entry) return;
  const next = entry.quantity + delta;
  if (next <= 0) state.cart.delete(String(id));
  else if (next <= Math.max(1, Number(entry.product.stock) || 1)) entry.quantity = next;
  updateCart();
}

function updateCart() {
  const entries = [...state.cart.entries()];
  const count = entries.reduce((sum, [, entry]) => sum + entry.quantity, 0);
  const total = entries.reduce((sum, [, entry]) => sum + Number(entry.product.price) * entry.quantity, 0);
  $('#cart-count').textContent = count;
  $('#drawer-count').textContent = `(${count})`;
  $('#cart-total').textContent = money(total);
  $('#cart-items').innerHTML = entries.length ? entries.map(([id, entry]) => `<div class="cart-item"><div><h4>${escapeHtml(entry.product.name)}</h4><small>${escapeHtml(entry.product.store?.name || 'Campus seller')} · ${money(entry.product.price)} each</small><div class="quantity-controls"><button data-qty="${escapeHtml(id)}" data-delta="-1" aria-label="Decrease quantity">−</button><span>${entry.quantity}</span><button data-qty="${escapeHtml(id)}" data-delta="1" aria-label="Increase quantity">+</button></div></div><div class="cart-item-price">${money(Number(entry.product.price) * entry.quantity)}</div></div>`).join('') : '<div class="cart-empty">Your bag is waiting for its first find.</div>';
  $('#checkout-button').disabled = !entries.length;
  $('#checkout-button').style.opacity = entries.length ? '1' : '.5';
  renderProducts();
}

function openCart() {
  $('#cart-overlay').classList.remove('hidden');
  $('#cart-drawer').classList.add('open');
  $('#cart-drawer').setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}
function closeCart() {
  $('#cart-overlay').classList.add('hidden');
  $('#cart-drawer').classList.remove('open');
  $('#cart-drawer').setAttribute('aria-hidden', 'true');
  if ($('#checkout-modal').classList.contains('hidden')) document.body.style.overflow = '';
}
function showToast(message) {
  const toast = $('#toast');
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove('show'), 2600);
}

$('#product-grid').addEventListener('click', (event) => {
  const button = event.target.closest('[data-add]');
  if (button) addToCart(button.dataset.add);
});
$('#cart-items').addEventListener('click', (event) => {
  const button = event.target.closest('[data-qty]');
  if (button) changeQuantity(button.dataset.qty, Number(button.dataset.delta));
});
$('#search-input').addEventListener('input', (event) => {
  state.search = event.target.value.trim().toLowerCase();
  renderProducts();
});
$('#category-tabs').addEventListener('click', (event) => {
  const button = event.target.closest('[data-category]');
  if (!button) return;
  state.category = button.dataset.category;
  $('#category-tabs').querySelectorAll('button').forEach((item) => item.classList.toggle('active', item === button));
  renderProducts();
});
$('#open-cart').addEventListener('click', openCart);
$('#close-cart').addEventListener('click', closeCart);
$('#cart-overlay').addEventListener('click', closeCart);
$('#checkout-button').addEventListener('click', () => {
  if (!state.cart.size) return;
  $('#checkout-message').textContent = '';
  $('#checkout-modal').classList.remove('hidden');
});
$('#close-checkout').addEventListener('click', () => {
  $('#checkout-modal').classList.add('hidden');
  if (!$('#cart-drawer').classList.contains('open')) document.body.style.overflow = '';
});
$('#checkout-modal').addEventListener('click', (event) => {
  if (event.target.id === 'checkout-modal') {
    $('#checkout-modal').classList.add('hidden');
    document.body.style.overflow = '';
  }
});
$('#checkout-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const button = event.currentTarget.querySelector('button[type="submit"]');
  const message = $('#checkout-message');
  button.disabled = true;
  button.textContent = 'Sending request…';
  message.textContent = '';
  const form = new FormData(event.currentTarget);
  const payload = Object.fromEntries(form.entries());
  payload.items = [...state.cart.entries()].map(([product_id, entry]) => ({ product_id, quantity: entry.quantity }));
  try {
    const result = await api('/api/orders', { method: 'POST', body: JSON.stringify(payload) });
    message.textContent = `${result.message} Reference: ${result.order_reference}`;
    state.cart.clear();
    updateCart();
    event.currentTarget.reset();
    showToast('Order request sent.');
    setTimeout(() => {
      $('#checkout-modal').classList.add('hidden');
      closeCart();
    }, 2200);
  } catch (error) {
    message.textContent = error.message;
  } finally {
    button.disabled = false;
    button.innerHTML = 'Send order request <span>↗</span>';
  }
});
$('#assistant-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const input = $('#assistant-question');
  const output = $('#assistant-answer');
  const button = event.currentTarget.querySelector('button');
  const question = input.value.trim();
  if (!question) return;
  button.disabled = true;
  button.textContent = 'Thinking…';
  output.textContent = 'One moment…';
  try {
    const result = await api('/api/ai/ask', { method: 'POST', body: JSON.stringify({ question }) });
    output.textContent = result.answer;
  } catch (error) {
    output.textContent = error.message;
  } finally {
    button.disabled = false;
    button.innerHTML = 'Ask ↗';
  }
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    $('#checkout-modal').classList.add('hidden');
    closeCart();
  }
  if (event.key === '/' && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
    event.preventDefault();
    $('#search-input').focus();
  }
});
loadMarketplace();
updateCart();
