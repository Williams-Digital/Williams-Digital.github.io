// Mobile nav toggle
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

navToggle.addEventListener('click', () => {
  navLinks.classList.toggle('open');
});

navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => navLinks.classList.remove('open'));
});

// Menu tabs
const tabs = document.querySelectorAll('.menu-tab');
const items = document.querySelectorAll('.menu-item');

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    const category = tab.dataset.tab;
    tabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    items.forEach(item => {
      item.style.display = item.dataset.category === category ? '' : 'none';
    });
  });
});

// Scroll fade-in
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll('.section, .gallery-section').forEach(el => {
  el.classList.add('fade-up');
  observer.observe(el);
});

// === Lightbox ===
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
const lightboxClose = document.getElementById('lightboxClose');
const lightboxPrev = document.getElementById('lightboxPrev');
const lightboxNext = document.getElementById('lightboxNext');
const lightboxCounter = document.getElementById('lightboxCounter');
const galleryItems = document.querySelectorAll('.gallery-item');

let currentLightboxIndex = 0;
const gallerySrcs = [];

galleryItems.forEach((item, i) => {
  const img = item.querySelector('img');
  gallerySrcs.push({ src: img.src, alt: img.alt });

  item.addEventListener('click', () => {
    currentLightboxIndex = i;
    openLightbox();
  });
});

function openLightbox() {
  lightboxImg.src = gallerySrcs[currentLightboxIndex].src;
  lightboxImg.alt = gallerySrcs[currentLightboxIndex].alt;
  lightboxCounter.textContent = `${currentLightboxIndex + 1} / ${gallerySrcs.length}`;
  lightbox.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  lightbox.classList.remove('active');
  document.body.style.overflow = '';
}

function navigateLightbox(dir) {
  currentLightboxIndex = (currentLightboxIndex + dir + gallerySrcs.length) % gallerySrcs.length;
  lightboxImg.src = gallerySrcs[currentLightboxIndex].src;
  lightboxImg.alt = gallerySrcs[currentLightboxIndex].alt;
  lightboxCounter.textContent = `${currentLightboxIndex + 1} / ${gallerySrcs.length}`;
}

lightboxClose.addEventListener('click', closeLightbox);
lightboxPrev.addEventListener('click', () => navigateLightbox(-1));
lightboxNext.addEventListener('click', () => navigateLightbox(1));

lightbox.addEventListener('click', (e) => {
  if (e.target === lightbox) closeLightbox();
});

document.addEventListener('keydown', (e) => {
  if (!lightbox.classList.contains('active')) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowLeft') navigateLightbox(-1);
  if (e.key === 'ArrowRight') navigateLightbox(1);
});

// === Reviews Carousel ===
const carousel = document.getElementById('reviewsCarousel');
const carouselPrev = document.getElementById('carouselPrev');
const carouselNext = document.getElementById('carouselNext');
const dotsContainer = document.getElementById('carouselDots');

if (carousel) {
  const cards = carousel.querySelectorAll('.review-card');
  const totalCards = cards.length;

  // Calculate visible cards based on viewport
  function getVisibleCount() {
    if (window.innerWidth <= 768) return 1;
    if (window.innerWidth <= 1024) return 2;
    return 3;
  }

  function getTotalPages() {
    return Math.max(1, totalCards - getVisibleCount() + 1);
  }

  let currentPage = 0;

  function buildDots() {
    dotsContainer.innerHTML = '';
    const pages = getTotalPages();
    for (let i = 0; i < pages; i++) {
      const dot = document.createElement('div');
      dot.className = 'carousel-dot' + (i === currentPage ? ' active' : '');
      dot.addEventListener('click', () => {
        currentPage = i;
        scrollToPage();
        updateDots();
      });
      dotsContainer.appendChild(dot);
    }
  }

  function updateDots() {
    const dots = dotsContainer.querySelectorAll('.carousel-dot');
    dots.forEach((d, i) => d.classList.toggle('active', i === currentPage));
  }

  function scrollToPage() {
    if (!cards[currentPage]) return;
    const cardWidth = cards[0].offsetWidth + 20; // gap
    carousel.scrollTo({ left: currentPage * cardWidth, behavior: 'smooth' });
  }

  carouselPrev.addEventListener('click', () => {
    currentPage = Math.max(0, currentPage - 1);
    scrollToPage();
    updateDots();
  });

  carouselNext.addEventListener('click', () => {
    currentPage = Math.min(getTotalPages() - 1, currentPage + 1);
    scrollToPage();
    updateDots();
  });

  // Update dots on scroll
  carousel.addEventListener('scroll', () => {
    const cardWidth = cards[0].offsetWidth + 20;
    const newPage = Math.round(carousel.scrollLeft / cardWidth);
    if (newPage !== currentPage) {
      currentPage = newPage;
      updateDots();
    }
  });

  buildDots();
  window.addEventListener('resize', () => {
    buildDots();
  });
}
