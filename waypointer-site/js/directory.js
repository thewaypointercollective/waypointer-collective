/* ============================================
   THE WAYPOINTER COLLECTIVE — directory.js
   Find page filtering logic
   ============================================ */

let allBusinesses = [];
let activeCategory = 'All';
let activeTags = [];
let searchQuery = '';

/* --- Render a count line --- */
function updateCount(count, total) {
  const el = document.getElementById('resultsCount');
  if (!el) return;
  el.textContent = count === total
    ? `${total} business${total !== 1 ? 'es' : ''} in the Collective`
    : `${count} of ${total} businesses`;
}

/* --- Filter and render --- */
function applyFilters() {
  const grid = document.getElementById('directoryGrid');
  if (!grid) return;

  const q = searchQuery.toLowerCase().trim();

  const filtered = allBusinesses.filter(biz => {
    const matchCategory = activeCategory === 'All' || biz.category === activeCategory;
    const matchTags = activeTags.length === 0 || activeTags.every(t => biz.tags.includes(t));
    const matchSearch = !q || [biz.name, biz.city, biz.state, biz.description, biz.category]
      .join(' ').toLowerCase().includes(q);
    return matchCategory && matchTags && matchSearch;
  });

  updateCount(filtered.length, allBusinesses.length);

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="no-results" style="grid-column:1/-1">
        <h3>No businesses found</h3>
        <p>Try adjusting your search or filters.</p>
      </div>`;
    return;
  }

  grid.innerHTML = filtered.map(biz => {
    const location = biz.state ? `${biz.city}, ${biz.state}` : biz.city;
    const tagHtml = [biz.category, ...biz.tags].map((t, i) =>
      `<span class="tag${i > 0 ? ' tag-gold' : ''}">${t}</span>`
    ).join('');
    const logoHtml = biz.logo
      ? `<img src="${biz.logo}" alt="${biz.name}" />`
      : biz.logoInitials || '';

    return `
      <a class="biz-card" href="${biz.website}" target="_blank" rel="noopener noreferrer">
        <div class="biz-logo" style="background:${biz.logoColor || '#1B617A'}">${logoHtml}</div>
        <div class="biz-info">
          <div class="tags">${tagHtml}</div>
          <div class="biz-name">${biz.name}</div>
          <div class="biz-location">📍 ${location}</div>
          <div class="biz-description">${biz.description}</div>
        </div>
      </a>`;
  }).join('');
}

/* --- Set up category pills --- */
function buildCategoryPills(businesses) {
  const container = document.getElementById('categoryPills');
  if (!container) return;

  const categories = ['All', ...new Set(businesses.map(b => b.category))].sort((a, b) => {
    if (a === 'All') return -1;
    if (b === 'All') return 1;
    return a.localeCompare(b);
  });

  container.innerHTML = categories.map(cat => `
    <button class="filter-pill${cat === 'All' ? ' active' : ''}" data-category="${cat}">
      ${cat}
    </button>`).join('');

  container.querySelectorAll('.filter-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      activeCategory = pill.dataset.category;
      container.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      applyFilters();
    });
  });
}

/* --- Set up tag pills --- */
function buildTagPills() {
  const container = document.getElementById('tagPills');
  if (!container) return;

  const tags = ['Local', 'Online', 'Ships Anywhere', 'B2B', 'B2C'];

  container.innerHTML = tags.map(tag => `
    <button class="filter-pill" data-tag="${tag}">${tag}</button>`).join('');

  container.querySelectorAll('.filter-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      const tag = pill.dataset.tag;
      if (activeTags.includes(tag)) {
        activeTags = activeTags.filter(t => t !== tag);
        pill.classList.remove('active-gold');
      } else {
        activeTags.push(tag);
        pill.classList.add('active-gold');
      }
      applyFilters();
    });
  });
}

/* --- Search input --- */
function bindSearch() {
  const input = document.getElementById('searchInput');
  if (!input) return;
  let debounce;
  input.addEventListener('input', () => {
    clearTimeout(debounce);
    debounce = setTimeout(() => {
      searchQuery = input.value;
      applyFilters();
    }, 220);
  });
}

/* --- Load all businesses and init --- */
async function initDirectory() {
  const grid = document.getElementById('directoryGrid');
  if (!grid) return;

  try {
    const res  = await fetch('/data/businesses.json');
    const data = await res.json();
    allBusinesses = data.businesses;

    buildCategoryPills(allBusinesses);
    buildTagPills();
    bindSearch();
    applyFilters();
  } catch (e) {
    console.error('Failed to load businesses:', e);
    if (grid) grid.innerHTML = '<p style="color:var(--text-muted);grid-column:1/-1;text-align:center;padding:40px">Unable to load businesses. Please try again.</p>';
  }
}

document.addEventListener('DOMContentLoaded', initDirectory);
