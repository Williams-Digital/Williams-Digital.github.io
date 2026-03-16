// ===== HEADER SCROLL EFFECT =====
const header = document.getElementById('header');
if (header) {
  // Inner pages start with scrolled state
  const isInnerPage = header.classList.contains('scrolled');
  if (!isInnerPage) {
    window.addEventListener('scroll', () => {
      header.classList.toggle('scrolled', window.scrollY > 60);
    });
  }
}

// ===== MOBILE NAV TOGGLE =====
const navToggle = document.querySelector('.nav-toggle');
const mainNav = document.getElementById('main-nav');

if (navToggle && mainNav) {
  navToggle.addEventListener('click', () => {
    const isOpen = mainNav.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  // Close nav on link click
  mainNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mainNav.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });
}

// ===== SCROLL-REVEAL ANIMATIONS =====
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);

document.querySelectorAll(
  '.location-card, .feature-card, .menu-card, .info-block, .gallery-item, .other-location-card, .story-grid, .location-feature, .form-section, .fade-up'
).forEach(el => {
  if (!el.classList.contains('fade-up')) {
    el.classList.add('fade-up');
  }
  revealObserver.observe(el);
});

// ===== COUNTER ANIMATION =====
const counters = document.querySelectorAll('[data-count]');
if (counters.length) {
  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = parseInt(el.getAttribute('data-count'), 10);
          const suffix = el.getAttribute('data-suffix') || '';
          const duration = 2000;
          const start = performance.now();

          const animate = (now) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = Math.floor(target * eased).toLocaleString() + suffix;

            if (progress < 1) {
              requestAnimationFrame(animate);
            }
          };

          requestAnimationFrame(animate);
          counterObserver.unobserve(el);
        }
      });
    },
    { threshold: 0.5 }
  );

  counters.forEach(c => counterObserver.observe(c));
}

// ===== FORM VALIDATION =====
const appForm = document.getElementById('application-form');
if (appForm) {
  appForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // Simple validation
    const required = appForm.querySelectorAll('[required]');
    let valid = true;

    required.forEach(field => {
      field.style.borderColor = '';
      if (!field.value.trim()) {
        field.style.borderColor = '#e74c3c';
        valid = false;
      }
    });

    if (valid) {
      const btn = appForm.querySelector('.btn-primary');
      const originalText = btn.textContent;
      btn.textContent = 'Application Submitted!';
      btn.style.background = '#4CAF50';
      btn.disabled = true;

      setTimeout(() => {
        btn.textContent = originalText;
        btn.style.background = '';
        btn.disabled = false;
        appForm.reset();
      }, 3000);
    }
  });
}

// ===== MENU TABS =====
const menuTabs = document.querySelectorAll('.menu-tab');
if (menuTabs.length) {
  menuTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Deactivate all tabs and panels
      menuTabs.forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.menu-panel').forEach(p => p.classList.remove('active'));

      // Activate clicked tab and matching panel
      tab.classList.add('active');
      const panel = document.getElementById('menu-' + tab.getAttribute('data-tab'));
      if (panel) panel.classList.add('active');
    });
  });
}

// ===== SMOOTH SCROLL FOR ANCHOR LINKS =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});
