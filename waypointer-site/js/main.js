/* ============================================
   THE WAYPOINTER COLLECTIVE — main.js
   ============================================ */

/* --- Nav scroll effect --- */
const nav = document.getElementById('nav');
if (nav) {
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });
}

/* --- Mobile menu toggle --- */
const navToggle = document.getElementById('navToggle');
const mobileMenu = document.getElementById('mobileMenu');
if (navToggle && mobileMenu) {
  navToggle.addEventListener('click', () => {
    mobileMenu.classList.toggle('open');
    const bars = navToggle.querySelectorAll('span');
    const isOpen = mobileMenu.classList.contains('open');
    bars[0].style.transform = isOpen ? 'translateY(7px) rotate(45deg)' : '';
    bars[1].style.opacity  = isOpen ? '0' : '';
    bars[2].style.transform = isOpen ? 'translateY(-7px) rotate(-45deg)' : '';
  });

  // Close on link click
  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      navToggle.querySelectorAll('span').forEach(b => {
        b.style.transform = '';
        b.style.opacity = '';
      });
    });
  });
}

/* --- Active nav link --- */
(function setActiveNav() {
  const path = window.location.pathname.replace(/\/$/, '') || '/';
  document.querySelectorAll('.nav-links a, .mobile-menu a').forEach(link => {
    const href = link.getAttribute('href').replace(/\/$/, '') || '/';
    if (href === path || (href !== '/' && path.startsWith(href))) {
      link.classList.add('active');
    }
  });
})();

/* --- Render business cards (used on homepage + find page) --- */
function renderBizCard(biz) {
  const location = biz.state ? `${biz.city}, ${biz.state}` : biz.city;
  const tagHtml = [biz.category, ...biz.tags].map((t, i) =>
    `<span class="tag${i > 0 ? ' tag-gold' : ''}">${t}</span>`
  ).join('');

  const logoHtml = biz.logo
    ? `<img src="${biz.logo}" alt="${biz.name} logo" />`
    : biz.logoInitials || '';

  return `
    <a class="biz-card" href="${biz.website}" target="_blank" rel="noopener noreferrer" data-aos="fade-up">
      <div class="biz-logo" style="background:${biz.logoColor || '#1B617A'}">${logoHtml}</div>
      <div class="biz-info">
        <div class="tags">${tagHtml}</div>
        <div class="biz-name">${biz.name}</div>
        <div class="biz-location">📍 ${location}</div>
        <div class="biz-description">${biz.description}</div>
      </div>
    </a>
  `;
}

/* --- Load featured businesses on homepage --- */
async function loadFeaturedBusinesses() {
  const grid = document.getElementById('featuredGrid');
  if (!grid) return;

  try {
    const res  = await fetch('/data/businesses.json');
    const data = await res.json();
    const featured = data.businesses.filter(b => b.featured).slice(0, 4);

    if (featured.length === 0) {
      grid.innerHTML = '<p style="color:var(--text-muted);grid-column:1/-1">No businesses yet — check back soon.</p>';
      return;
    }

    grid.innerHTML = featured.map(renderBizCard).join('');
    if (window.AOS) AOS.refresh();
  } catch (e) {
    console.warn('Could not load businesses:', e);
  }
}

document.addEventListener('DOMContentLoaded', loadFeaturedBusinesses);
