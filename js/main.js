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
    bars[1].style.opacity   = isOpen ? '0' : '';
    bars[2].style.transform = isOpen ? 'translateY(-7px) rotate(-45deg)' : '';
  });

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

/* ============================================
   BUSINESS MODAL
   ============================================ */

/* Global business store — populated by loadFeaturedBusinesses or directory.js */
window._waypointerBusinesses = [];

function createModal() {
  if (document.getElementById('bizModal')) return;
  const modal = document.createElement('div');
  modal.id = 'bizModal';
  modal.className = 'biz-modal';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.innerHTML = `
    <div class="biz-modal-overlay"></div>
    <div class="biz-modal-content">
      <button class="biz-modal-close" aria-label="Close">✕</button>
      <div id="bizModalBody"></div>
    </div>
  `;
  document.body.appendChild(modal);
  modal.querySelector('.biz-modal-overlay').addEventListener('click', closeModal);
  modal.querySelector('.biz-modal-close').addEventListener('click', closeModal);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
}

function showBizModal(biz) {
  createModal();
  const body = document.getElementById('bizModalBody');
  const location = biz.state ? `${biz.city}, ${biz.state}` : biz.city;
  const tagHtml = [biz.category, ...biz.tags].map((t, i) =>
    `<span class="tag${i > 0 ? ' tag-gold' : ''}">${t}</span>`
  ).join('');
  const logoHtml = biz.logo
    ? `<img src="${biz.logo}" alt="${biz.name}" />`
    : `<span>${biz.logoInitials || ''}</span>`;

  const socialKeys = ['instagram', 'facebook', 'linkedin', 'tiktok', 'x'];
  const socialHtml = socialKeys
    .filter(s => biz[s])
    .map(s => `<a href="${biz[s]}" target="_blank" rel="noopener">${s.charAt(0).toUpperCase() + s.slice(1)}</a>`)
    .join('');

  body.innerHTML = `
    <div class="modal-logo-row">
      <div class="modal-logo" style="background:${biz.logoColor || '#1B617A'}">${logoHtml}</div>
      <div class="modal-biz-meta">
        <div class="tags">${tagHtml}</div>
        <div class="modal-biz-name">${biz.name}</div>
        <div class="modal-biz-location">📍 ${location}</div>
      </div>
    </div>
    <div class="modal-description">${biz.description}</div>
    ${socialHtml ? `<div class="modal-socials">${socialHtml}</div>` : ''}
    <a class="btn btn-primary modal-cta" href="${biz.website}" target="_blank" rel="noopener noreferrer">Visit Website →</a>
  `;

  document.getElementById('bizModal').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  const modal = document.getElementById('bizModal');
  if (modal) modal.classList.remove('open');
  document.body.style.overflow = '';
}

/* --- Card click delegation --- */
document.addEventListener('click', e => {
  const card = e.target.closest('.biz-card');
  if (!card) return;
  const bizId = card.dataset.bizId;
  const biz = window._waypointerBusinesses.find(b => b.id === bizId);
  if (biz) showBizModal(biz);
});

/* --- Render business card (click opens modal) --- */
function renderBizCard(biz) {
  const location = biz.state ? `${biz.city}, ${biz.state}` : biz.city;
  const tagHtml = [biz.category, ...biz.tags].map((t, i) =>
    `<span class="tag${i > 0 ? ' tag-gold' : ''}">${t}</span>`
  ).join('');
  const logoHtml = biz.logo
    ? `<img src="${biz.logo}" alt="${biz.name} logo" />`
    : biz.logoInitials || '';

  return `
    <div class="biz-card" data-biz-id="${biz.id}" role="button" tabindex="0" data-aos="fade-up">
      <div class="biz-logo" style="background:${biz.logoColor || '#1B617A'}">${logoHtml}</div>
      <div class="biz-info">
        <div class="tags">${tagHtml}</div>
        <div class="biz-name">${biz.name}</div>
        <div class="biz-location">📍 ${location}</div>
        <div class="biz-description">${biz.description}</div>
      </div>
    </div>
  `;
}

/* --- Load featured businesses on homepage --- */
async function loadFeaturedBusinesses() {
  const grid = document.getElementById('featuredGrid');
  if (!grid) return;

  try {
    const res  = await fetch('/data/businesses.json');
    const data = await res.json();
    window._waypointerBusinesses = data.businesses;
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
