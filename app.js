/* ==========================================================================
   SIFEN TEKALIGN / PICTURA - Application JavaScript Logic
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize all core app modules
  initSplash();
  initHeader();
  initGalleryModule();
  initLightboxModule();
  initPricingModule();
  initAccordionModule();
  initContactModule();
  initScrollTopModule();
});

/* ==========================================================================
   1. Splash Screen Loader Module
   ========================================================================== */
function initSplash() {
  const splashScreen = document.getElementById('splash-screen');
  const progressFill = document.getElementById('splash-progress-fill');
  const counterNumber = document.getElementById('splash-counter-number');

  if (!splashScreen) return;

  let progress = 0;
  const interval = setInterval(() => {
    progress += Math.floor(Math.random() * 12) + 4;
    if (progress >= 100) {
      progress = 100;
      clearInterval(interval);
      
      // Complete fill transition
      if (progressFill) progressFill.style.width = '100%';
      if (counterNumber) counterNumber.textContent = '100';

      // Hide splash after a brief pause
      setTimeout(() => {
        splashScreen.classList.add('hidden');
        document.body.style.overflow = 'initial';
      }, 500);
    } else {
      if (progressFill) progressFill.style.width = `${progress}%`;
      if (counterNumber) counterNumber.textContent = progress;
    }
  }, 60);
}

/* ==========================================================================
   2. Header & Navigation Module
   ========================================================================== */
function initHeader() {
  const header = document.querySelector('.main-header');
  const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
  const mobileDrawer = document.querySelector('.mobile-drawer');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  // Sticky header on scroll
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header?.classList.add('scrolled');
    } else {
      header?.classList.remove('scrolled');
    }

    // Active link highlighting on scroll
    let currentSectionId = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 120;
      const sectionHeight = section.offsetHeight;
      if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
        currentSectionId = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentSectionId}`) {
        link.classList.add('active');
      }
    });
  });

  // Mobile menu drawer toggle
  if (mobileMenuBtn && mobileDrawer) {
    mobileMenuBtn.addEventListener('click', () => {
      const isOpen = mobileDrawer.classList.toggle('open');
      mobileMenuBtn.classList.toggle('active');
      document.body.style.overflow = isOpen ? 'hidden' : 'initial';
    });

    // Close drawer when clicking any drawer link
    mobileDrawer.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        mobileDrawer.classList.remove('open');
        mobileMenuBtn.classList.remove('active');
        document.body.style.overflow = 'initial';
      });
    });
  }
}

/* ==========================================================================
   3. Gallery & Filtering Module
   ========================================================================== */

// Sample Curated Artworks Data
const GALLERY_ITEMS = [
  {
    id: 1,
    title: 'Aura of Silence',
    category: 'Portraits',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1000&q=85',
    description: 'High-contrast studio portrait featuring cinematic mood lighting, volumetric shadows, and crisp ultra-HD detail capture.',
    dimensions: '3840 x 5120 px',
    camera: 'Sony A7R V • 85mm f/1.4',
    format: 'RAW / PNG 16-Bit',
    colorSpace: 'Display P3'
  },
  {
    id: 2,
    title: 'Monolith in Horizon',
    category: 'Architecture',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=85',
    description: 'Brutalist modern architectural structure designed with clean geometric planes and glass surface reflections.',
    dimensions: '4096 x 3072 px',
    camera: 'Hasselblad H6D • 24mm',
    format: 'ProRes RAW',
    colorSpace: 'sRGB'
  },
  {
    id: 3,
    title: 'Nebula Convergence',
    category: 'Abstract',
    image: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=1000&q=85',
    description: 'Dynamic fluid art render combining liquid metallic sheen with radiant gold and neon sapphire pigments.',
    dimensions: '6000 x 4000 px',
    camera: '3D Render / Octane engine',
    format: 'EXR 32-Bit',
    colorSpace: 'ACEScg'
  },
  {
    id: 4,
    title: 'Cybernetic Muse',
    category: 'AI Art',
    image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1000&q=85',
    description: 'Generative AI synthetic portrait exploring human emotion merged with organic digital embellishments.',
    dimensions: '4096 x 4096 px',
    camera: 'Pictura AI Engine v4.2',
    format: 'PNG High-Bit',
    colorSpace: 'Display P3'
  },
  {
    id: 5,
    title: 'Vogue Noir',
    category: 'Editorial',
    image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1000&q=85',
    description: 'Avant-garde fashion editorial photography captured on location with ambient twilight light gradient.',
    dimensions: '3200 x 4800 px',
    camera: 'Canon EOS R5 • 50mm',
    format: 'TIFF Uncompressed',
    colorSpace: 'Adobe RGB'
  },
  {
    id: 6,
    title: 'Echoes of Glass',
    category: 'Architecture',
    image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1000&q=85',
    description: 'Reflective skyscraper exterior capturing light refractions across metallic modular facets.',
    dimensions: '4500 x 3000 px',
    camera: 'Leica SL2 • 35mm Summilux',
    format: 'DNG Raw',
    colorSpace: 'Display P3'
  },
  {
    id: 7,
    title: 'Golden Sanctuary',
    category: 'Portraits',
    image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1000&q=85',
    description: 'Warm sunset backlight illuminates natural portrait texture with rich gold highlights.',
    dimensions: '3600 x 4500 px',
    camera: 'Fujifilm GFX 100 II',
    format: 'RAF Raw',
    colorSpace: 'sRGB'
  },
  {
    id: 8,
    title: 'Quantum Drift',
    category: 'Abstract',
    image: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=1000&q=85',
    description: 'High-speed light trail photography showcasing vibrant energy patterns in motion.',
    dimensions: '5400 x 3600 px',
    camera: 'Nikon Z9 • 24-70mm f/2.8',
    format: 'NEF Raw',
    colorSpace: 'ProPhoto RGB'
  }
];

let activeFilter = 'all';
let currentSearchQuery = '';

function initGalleryModule() {
  const galleryGrid = document.getElementById('gallery-grid');
  const filterPills = document.querySelectorAll('.filter-btn');
  const searchInput = document.getElementById('gallery-search-input');

  if (!galleryGrid) return;

  // Initial render
  renderGallery(GALLERY_ITEMS);

  // Filter tab click handler
  filterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      filterPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      
      activeFilter = pill.getAttribute('data-filter') || 'all';
      filterAndRender();
    });
  });

  // Search input handler
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      currentSearchQuery = e.target.value.toLowerCase().trim();
      filterAndRender();
    });
  }
}

function filterAndRender() {
  const filtered = GALLERY_ITEMS.filter(item => {
    const matchesFilter = activeFilter === 'all' || item.category.toLowerCase() === activeFilter.toLowerCase();
    const matchesSearch = item.title.toLowerCase().includes(currentSearchQuery) || 
                          item.category.toLowerCase().includes(currentSearchQuery) ||
                          item.description.toLowerCase().includes(currentSearchQuery);
    return matchesFilter && matchesSearch;
  });

  renderGallery(filtered);
}

function renderGallery(items) {
  const galleryGrid = document.getElementById('gallery-grid');
  if (!galleryGrid) return;

  if (items.length === 0) {
    galleryGrid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 60px 0; color: var(--text-muted);">
        <svg style="width: 48px; height: 48px; margin-bottom: 16px; opacity: 0.5;" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <p style="font-size: 1.1rem; font-weight: 500;">No artwork matching your search criteria.</p>
        <button onclick="resetGalleryFilter()" class="btn-secondary" style="margin-top: 16px; padding: 8px 20px;">Clear Search</button>
      </div>
    `;
    return;
  }

  galleryGrid.innerHTML = items.map(item => `
    <div class="gallery-card" data-id="${item.id}">
      <img src="${item.image}" alt="${item.title}" loading="lazy" />
      <div class="gallery-card-overlay">
        <span class="card-category">${item.category}</span>
        <h3 class="card-title">${item.title}</h3>
        <div class="card-actions">
          <button class="card-action-btn view-btn" title="View Fullscreen" onclick="openLightbox(${item.id}); event.stopPropagation();">
            <svg style="width: 18px; height: 18px;" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
          <button class="card-action-btn bookmark-btn" title="Bookmark Item" onclick="toggleBookmark(this); event.stopPropagation();">
            <svg style="width: 18px; height: 18px;" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  `).join('');

  // Add click listener to whole card
  document.querySelectorAll('.gallery-card').forEach(card => {
    card.addEventListener('click', () => {
      const id = parseInt(card.getAttribute('data-id'), 10);
      openLightbox(id);
    });
  });
}

function resetGalleryFilter() {
  activeFilter = 'all';
  currentSearchQuery = '';
  const searchInput = document.getElementById('gallery-search-input');
  if (searchInput) searchInput.value = '';
  
  document.querySelectorAll('.filter-btn').forEach(p => p.classList.remove('active'));
  document.querySelector('.filter-btn[data-filter="all"]')?.classList.add('active');
  
  filterAndRender();
}

/* ==========================================================================
   4. Lightbox Modal Module
   ========================================================================== */
let currentLightboxIndex = 0;

function initLightboxModule() {
  const modal = document.getElementById('lightbox-modal');
  const closeBtn = document.getElementById('lightbox-close-btn');
  const prevBtn = document.getElementById('lightbox-prev-btn');
  const nextBtn = document.getElementById('lightbox-next-btn');

  if (!modal) return;

  // Close triggers
  closeBtn?.addEventListener('click', closeLightbox);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeLightbox();
  });

  // Prev / Next triggers
  prevBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    navigateLightbox(-1);
  });

  nextBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    navigateLightbox(1);
  });

  // Keyboard navigation
  window.addEventListener('keydown', (e) => {
    if (!modal.classList.contains('active')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') navigateLightbox(-1);
    if (e.key === 'ArrowRight') navigateLightbox(1);
  });
}

function openLightbox(id) {
  const modal = document.getElementById('lightbox-modal');
  if (!modal) return;

  const index = GALLERY_ITEMS.findIndex(item => item.id === id);
  if (index === -1) return;

  currentLightboxIndex = index;
  updateLightboxContent();

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  const modal = document.getElementById('lightbox-modal');
  if (!modal) return;

  modal.classList.remove('active');
  document.body.style.overflow = 'initial';
}

function navigateLightbox(direction) {
  currentLightboxIndex += direction;
  if (currentLightboxIndex < 0) {
    currentLightboxIndex = GALLERY_ITEMS.length - 1;
  } else if (currentLightboxIndex >= GALLERY_ITEMS.length) {
    currentLightboxIndex = 0;
  }
  updateLightboxContent();
}

function updateLightboxContent() {
  const item = GALLERY_ITEMS[currentLightboxIndex];
  if (!item) return;

  const imgEl = document.getElementById('lightbox-img');
  const tagEl = document.getElementById('lightbox-tag');
  const titleEl = document.getElementById('lightbox-title');
  const descEl = document.getElementById('lightbox-desc');
  const dimEl = document.getElementById('lightbox-meta-dim');
  const camEl = document.getElementById('lightbox-meta-cam');
  const fmtEl = document.getElementById('lightbox-meta-fmt');
  const colEl = document.getElementById('lightbox-meta-col');

  if (imgEl) imgEl.src = item.image;
  if (tagEl) tagEl.textContent = item.category;
  if (titleEl) titleEl.textContent = item.title;
  if (descEl) descEl.textContent = item.description;
  if (dimEl) dimEl.textContent = item.dimensions;
  if (camEl) camEl.textContent = item.camera;
  if (fmtEl) fmtEl.textContent = item.format;
  if (colEl) colEl.textContent = item.colorSpace;
}

function toggleBookmark(btn) {
  btn.classList.toggle('active');
  const isBookmarked = btn.classList.contains('active');
  if (isBookmarked) {
    btn.style.background = 'var(--accent-gold)';
    btn.style.color = 'var(--bg-dark)';
    showToast('Saved to your private collection', 'bookmark');
  } else {
    btn.style.background = 'rgba(255, 255, 255, 0.15)';
    btn.style.color = '#FFF';
    showToast('Removed from collection', 'info');
  }
}

function shareCurrentArtwork() {
  const item = GALLERY_ITEMS[currentLightboxIndex];
  if (navigator.clipboard) {
    navigator.clipboard.writeText(window.location.href);
    showToast(`Copied share link for "${item.title}"`, 'share');
  } else {
    showToast('Link ready for sharing!', 'share');
  }
}

function downloadCurrentArtwork() {
  const item = GALLERY_ITEMS[currentLightboxIndex];
  showToast(`Preparing download for "${item.title}" (${item.format})`, 'download');
}

/* ==========================================================================
   5. Pricing Toggle Module
   ========================================================================== */
function initPricingModule() {
  const toggleSwitch = document.getElementById('billing-toggle');
  const monthlyLabel = document.getElementById('label-monthly');
  const annualLabel = document.getElementById('label-annual');
  const pricePro = document.getElementById('price-pro');
  const priceStudio = document.getElementById('price-studio');
  const priceEnterprise = document.getElementById('price-enterprise');

  if (!toggleSwitch) return;

  toggleSwitch.addEventListener('change', () => {
    const isAnnual = toggleSwitch.checked;

    if (monthlyLabel && annualLabel) {
      monthlyLabel.classList.toggle('active', !isAnnual);
      annualLabel.classList.toggle('active', isAnnual);
    }

    if (pricePro) pricePro.textContent = isAnnual ? '$19' : '$29';
    if (priceStudio) priceStudio.textContent = isAnnual ? '$59' : '$79';
    if (priceEnterprise) priceEnterprise.textContent = isAnnual ? '$149' : '$199';

    showToast(isAnnual ? 'Switched to Annual Billing (20% Savings applied!)' : 'Switched to Monthly Billing', 'pricing');
  });
}

/* ==========================================================================
   6. FAQ Accordion Module
   ========================================================================== */
function initAccordionModule() {
  const accordionHeaders = document.querySelectorAll('.accordion-header');

  accordionHeaders.forEach(header => {
    header.addEventListener('click', () => {
      const item = header.parentElement;
      const isActive = item.classList.contains('active');

      // Close all accordion items
      document.querySelectorAll('.accordion-item').forEach(i => i.classList.remove('active'));

      // Toggle current item if it wasn't active
      if (!isActive) {
        item.classList.add('active');
      }
    });
  });
}

/* ==========================================================================
   7. Contact Form Module
   ========================================================================== */
function initContactModule() {
  const contactForm = document.getElementById('contact-form');

  if (!contactForm) return;

  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('form-name')?.value;
    const email = document.getElementById('form-email')?.value;
    const message = document.getElementById('form-message')?.value;

    if (!name || !email || !message) {
      showToast('Please complete all required fields.', 'warning');
      return;
    }

    // Success response
    showToast(`Thank you, ${name}! Your inquiry has been sent to Sifen Tekalign.`, 'success');
    contactForm.reset();
  });
}

/* ==========================================================================
   8. Scroll-To-Top Button Module
   ========================================================================== */
function initScrollTopModule() {
  const scrollTopBtn = document.getElementById('scroll-top-btn');

  if (!scrollTopBtn) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 500) {
      scrollTopBtn.classList.add('visible');
    } else {
      scrollTopBtn.classList.remove('visible');
    }
  });

  scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}

/* ==========================================================================
   9. Universal Toast Notification System
   ========================================================================== */
function showToast(message, type = 'info') {
  let toastContainer = document.getElementById('toast-container');
  
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement('div');
  toast.className = 'toast';

  const iconSvg = `
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  `;

  toast.innerHTML = `${iconSvg} <span>${message}</span>`;
  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px) scale(0.9)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}
