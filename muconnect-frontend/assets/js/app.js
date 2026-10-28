// Muconnect Frontend Core Logic
// AHAK DEV × TEKARU

// Replace with your public Supabase Project URL and Anon/Publishable Key
const SUPABASE_URL = 'YOUR_SUPABASE_URL_HERE';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY_HERE';

// Simple Supabase fetch utility for public marketplace browsing
async function fetchMarketplaceProducts() {
  const productGrid = document.getElementById('productGrid');
  
  if (!productGrid) return;

  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/products?is_available=eq.true&select=*,businesses(business_name,campus)`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch products from database.');
    }

    const products = await response.json();

    if (products.length === 0) {
      productGrid.innerHTML = `<p style="color: var(--text-muted);">No products listed on campus yet. Be the first seller!</p>`;
      return;
    }

    // Render products dynamically
    productGrid.innerHTML = products.map(product => `
      <div class="card" style="display: flex; flex-direction: column; justify-content: space-between;">
        <div>
          <h3 style="font-size: 1.1rem; margin-bottom: 0.25rem;">${escapeHtml(product.name)}</h3>
          <p style="font-size: 0.85rem; color: var(--accent); margin-bottom: 0.5rem;">${escapeHtml(product.businesses?.business_name || 'Campus Vendor')}</p>
          <p style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: 1rem; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
            ${escapeHtml(product.description || 'No description provided.')}
          </p>
        </div>
        <div>
          <div style="font-size: 1.2rem; font-weight: 700; color: var(--text-main); margin-bottom: 1rem;">
            K${parseFloat(product.price_zmw).toFixed(2)} <span style="font-size: 0.75rem; color: var(--text-muted);">ZMW</span>
          </div>
          <button class="btn" style="width: 100%; text-align: center;" onclick="alert('Order system integration next!')">
            Add to Order
          </button>
        </div>
      </div>
    `).join('');

  } catch (error) {
    console.error('Error loading marketplace:', error);
    productGrid.innerHTML = `<p style="color: #ef4444;">Unable to load products. Check your Supabase configuration.</p>`;
  }
}

// Basic security helper to prevent HTML injection
function escapeHtml(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

// Initialize when marketplace page loads
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('productGrid')) {
    fetchMarketplaceProducts();
  }
});
