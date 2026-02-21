/* ============================================================
   EDGAR'S BAKERY — REDESIGN SCRIPTS
   ============================================================ */

/* -------- LOADER -------- */
(function () {
  const loader = document.getElementById('loader');
  const items  = document.querySelectorAll('.loader-item');
  const body   = document.body;

  body.classList.add('loading');

  // Stagger the three item animations
  items.forEach((item, i) => {
    setTimeout(() => item.classList.add('appear'), i * 500);
  });

  // Dismiss loader after ~3.5s (allows bar + logo animations to finish)
  const dismiss = () => {
    loader.classList.add('done');
    body.classList.remove('loading');
  };

  // Earliest dismiss: after 3.5s
  // Also dismiss on window load (whichever is later)
  let timerDone = false;
  let pageDone  = false;

  setTimeout(() => {
    timerDone = true;
    if (pageDone) dismiss();
  }, 3500);

  window.addEventListener('load', () => {
    pageDone = true;
    if (timerDone) dismiss();
  });

  // Fallback: always dismiss after 5s
  setTimeout(dismiss, 5000);
})();

/* -------- NAVBAR scroll effect -------- */
(function () {
  const nav = document.getElementById('navbar');

  const update = () => {
    if (window.scrollY > 60) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', update, { passive: true });
  update();
})();

/* -------- HAMBURGER / mobile menu -------- */
(function () {
  const btn  = document.getElementById('hamburger');
  const menu = document.getElementById('mobileMenu');

  btn.addEventListener('click', () => {
    menu.classList.toggle('open');
  });

  // Close when a link is clicked
  menu.querySelectorAll('.mob-link').forEach(link => {
    link.addEventListener('click', () => menu.classList.remove('open'));
  });
})();

/* -------- MENU FILTER TABS -------- */
(function () {
  const tabs  = document.querySelectorAll('.tab');
  const cards = document.querySelectorAll('.menu-card');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Active state
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const cat = tab.dataset.cat;

      cards.forEach(card => {
        if (cat === 'all' || card.dataset.cat === cat) {
          card.classList.remove('hidden');
        } else {
          card.classList.add('hidden');
        }
      });
    });
  });
})();

/* -------- SCROLL REVEAL -------- */
(function () {
  const revealEls = () => document.querySelectorAll(
    '.section-eyebrow, .section-title, .section-sub, ' +
    '.story-quote, .story-attr, .story-body, .btn-outline, ' +
    '.menu-card, .location-card, .press-quote, .weddings-body, ' +
    '.weddings-list, .ship-body, .ship-visual, ' +
    '.mosaic-img, .story-badge, .wedding-img, .wedding-tagline'
  );

  // Add reveal class
  revealEls().forEach(el => el.classList.add('reveal'));

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  revealEls().forEach(el => io.observe(el));
})();

/* -------- SMOOTH ACTIVE NAV LINK -------- */
(function () {
  const sections = document.querySelectorAll('section[id]');
  const links    = document.querySelectorAll('.nav-links a[href^="#"]');

  const onScroll = () => {
    const scrollY = window.scrollY + 120;

    sections.forEach(sec => {
      if (
        scrollY >= sec.offsetTop &&
        scrollY < sec.offsetTop + sec.offsetHeight
      ) {
        links.forEach(l => l.classList.remove('active-link'));
        const match = document.querySelector(`.nav-links a[href="#${sec.id}"]`);
        if (match) match.classList.add('active-link');
      }
    });
  };

  window.addEventListener('scroll', onScroll, { passive: true });
})();

/* -------- NEWSLETTER -------- */
function handleNewsletterSubmit(e) {
  e.preventDefault();
  const form = e.target;
  form.innerHTML = '<p style="color:var(--caramel);font-weight:700;font-size:1rem;">Thanks! You\'re subscribed. 🎂</p>';
  return false;
}

/* -------- PARALLAX (subtle) on hero -------- */
(function () {
  const hero  = document.getElementById('hero');
  const video = hero.querySelector('.hero-video');
  if (!video) return;

  window.addEventListener('scroll', () => {
    const scroll = window.scrollY;
    if (scroll < window.innerHeight) {
      video.style.transform = `translateY(${scroll * 0.25}px)`;
    }
  }, { passive: true });
})();
