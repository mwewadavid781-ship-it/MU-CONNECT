// Muconnect Seller Dashboard Logic
// AHAK DEV × TEKARU

const SUPABASE_URL = 'YOUR_SUPABASE_URL_HERE';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY_HERE';

// Standard test business ID established in Phase 1 setup
const TEST_BUSINESS_ID = 'a0000000-0000-0000-0000-000000000001';

document.addEventListener('DOMContentLoaded', () => {
  loadStoreDetails();
  loadSellerProducts();

  const newProductBtn = document.getElementById('newProductBtn');
  const cancelProdBtn = document.getElementById('cancelProdBtn');
  const productFormCard = document.getElementById('productFormCard');
  const addProductForm = document.getElementById('addProductForm');

  if (newProductBtn) {
    newProductBtn.addEventListener('click', () => {
      productFormCard.style.display = 'block';
    });
  }

  if (cancelProdBtn) {
    cancelProdBtn.addEventListener('click', () => {
      productFormCard.style.display = 'none';
    });
  }

  if (addProductForm) {
    addProductForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      await createProduct();
    });
  }
});

async function loadStoreDetails() {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/businesses?id=eq.${TEST_BUSINESS_ID}&select=*`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });

    const data = await res.json();
    if (data && data.length > 0) {
      document.getElementById('storeNameDisplay').textContent = data[0].business_name;
      document.getElementById('storeCampusDisplay').textContent = `${data[0].campus} • ${data[0].location_text}`;
    }
  } catch (err) {
    console.error('Error fetching store info:', err);
  }
}

async function loadSellerProducts() {
  const grid = document.getElementById('sellerProductGrid');
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/products?business_id=eq.${TEST_BUSINESS_ID}&select=*`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });

    const products = await res.json();
    document.getElementById('productCount').textContent = products.length;

    if (products.length === 0) {
      grid.innerHTML = `<p style="color: var(--text-muted);">No products in your store yet. Click "+ Add New Product" to list one!</p>`;
      return;
    }

    grid.innerHTML = products.map(p => `
      <div class="card">
        <h4 style="margin-bottom: 0.25rem;">${escapeHtml(p.name)}</h4>
        <p style="font-size: 0.85rem; color: var(--accent); margin-bottom: 0.5rem;">${escapeHtml(p.category)}</p>
        <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1rem;">${escapeHtml(p.description || '')}</p>
        <div style="font-weight: bold; font-size: 1.1rem;">K${parseFloat(p.price_zmw).toFixed(2)} ZMW</div>
      </div>
    `).join('');
  } catch (err) {
    console.error('Error loading inventory:', err);
    grid.innerHTML = `<p style="color: #ef4444;">Failed to load inventory.</p>`;
  }
}

async function createProduct() {
  const name = document.getElementById('prodName').value.trim();
  const price = parseFloat(document.getElementById('prodPrice').value);
  const category = document.getElementById('prodCategory').value;
  const description = document.getElementById('prodDesc').value.trim();

  if (!name || isNaN(price)) return;

  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/products`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        business_id: TEST_BUSINESS_ID,
        name: name,
        price_zmw: price,
        category: category,
        description: description,
        is_available: true
      })
    });

    if (response.ok) {
      document.getElementById('addProductForm').reset();
      document.getElementById('productFormCard').style.display = 'none';
      loadSellerProducts(); // Refresh seller grid
    } else {
      alert('Error creating product. Check database RLS rules.');
    }
  } catch (err) {
    console.error('Failed to create product:', err);
  }
}

function escapeHtml(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}
