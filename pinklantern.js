/* =============================================
   PINK LANTERN - INTERACTIVE SCRIPTS
   ============================================= */

document.addEventListener('DOMContentLoaded', () => {

  // === LOADING SCREEN ===
  const loader = document.getElementById('loader');

  window.addEventListener('load', () => {
    setTimeout(() => {
      loader.classList.add('hidden');
      document.body.style.overflow = '';
      initScrollReveal();
    }, 2800);
  });

  // Prevent scrolling while loader is visible
  document.body.style.overflow = 'hidden';

  // === NAVBAR SCROLL EFFECT ===
  const navbar = document.getElementById('navbar');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  // === MOBILE NAVIGATION ===
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('active');
    navLinks.classList.toggle('open');
    document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
  });

  // Close mobile nav on link click
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navToggle.classList.remove('active');
      navLinks.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

  // === MENU TABS ===
  const tabs = document.querySelectorAll('.menu-tab');
  const panels = document.querySelectorAll('.menu-panel');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;

      tabs.forEach(t => t.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));

      tab.classList.add('active');
      document.getElementById(`tab-${target}`).classList.add('active');
    });
  });

  // === HERO FLOATING PARTICLES ===
  const heroParticles = document.getElementById('heroParticles');

  function createParticle() {
    const particle = document.createElement('div');
    const size = Math.random() * 4 + 2;
    const x = Math.random() * 100;
    const duration = Math.random() * 8 + 6;
    const delay = Math.random() * 4;

    particle.style.cssText = `
      position: absolute;
      bottom: -10px;
      left: ${x}%;
      width: ${size}px;
      height: ${size}px;
      background: radial-gradient(circle, rgba(255, 26, 117, 0.6), transparent);
      border-radius: 50%;
      pointer-events: none;
      animation: particleFloat ${duration}s ease-in ${delay}s infinite;
    `;

    heroParticles.appendChild(particle);

    // Limit particles
    if (heroParticles.children.length > 30) {
      heroParticles.removeChild(heroParticles.firstChild);
    }
  }

  // Add particle animation keyframes
  const particleStyle = document.createElement('style');
  particleStyle.textContent = `
    @keyframes particleFloat {
      0% {
        opacity: 0;
        transform: translateY(0) scale(0);
      }
      10% {
        opacity: 1;
        transform: translateY(-10vh) scale(1);
      }
      90% {
        opacity: 0.5;
        transform: translateY(-80vh) scale(0.5);
      }
      100% {
        opacity: 0;
        transform: translateY(-100vh) scale(0);
      }
    }
  `;
  document.head.appendChild(particleStyle);

  // Create initial particles
  for (let i = 0; i < 15; i++) {
    createParticle();
  }

  // Continue creating particles
  setInterval(createParticle, 2000);

  // === SCROLL REVEAL ANIMATION ===
  function initScrollReveal() {
    const revealElements = document.querySelectorAll(
      '.about-image, .about-content, .menu-card, .events-content, .events-form-wrapper, .hours-card, .section-header'
    );

    revealElements.forEach(el => el.classList.add('reveal'));

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -40px 0px'
    });

    revealElements.forEach(el => observer.observe(el));
  }

  // === SMOOTH SCROLL FOR NAV LINKS ===
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // === FORM SUBMISSION ===
  const eventsForm = document.getElementById('eventsForm');
  if (eventsForm) {
    eventsForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = eventsForm.querySelector('button[type="submit"]');
      const originalText = btn.textContent;

      btn.textContent = 'Sent!';
      btn.style.background = 'linear-gradient(135deg, #00C851, #007E33)';

      setTimeout(() => {
        btn.textContent = originalText;
        btn.style.background = '';
        eventsForm.reset();
      }, 3000);
    });
  }

});
