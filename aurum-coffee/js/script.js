/* ═══════════════════════════════════════════════════════════════
   AURUM — Luxury Coffee House
   Interactive Scripts
   ═══════════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  // ── Loading Screen ──────────────────────────────────────────
  const loader = document.getElementById('loader');
  const heroElements = document.querySelectorAll('.hero-badge, .hero-title, .hero-subtitle, .hero-cta');

  // Wait for loading animation then reveal site
  setTimeout(() => {
    loader.classList.add('hidden');
    document.body.style.overflow = 'auto';

    // Animate hero content in sequence
    heroElements.forEach((el, i) => {
      setTimeout(() => {
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      }, 200 + i * 200);
    });
  }, 3500);

  // Set initial hero states
  heroElements.forEach(el => {
    el.style.transition = 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
    el.style.transform = 'translateY(30px)';
  });

  // Prevent scroll during loading
  document.body.style.overflow = 'hidden';


  // ── Navbar Scroll Effect ────────────────────────────────────
  const navbar = document.getElementById('navbar');
  const backToTop = document.getElementById('backToTop');

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;

    // Navbar background
    if (scrollY > 80) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    // Back to top button
    if (scrollY > 600) {
      backToTop.classList.add('visible');
    } else {
      backToTop.classList.remove('visible');
    }

    // Active nav link based on scroll
    updateActiveNav();
  });

  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });


  // ── Active Nav Link ─────────────────────────────────────────
  function updateActiveNav() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    let currentSection = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 200;
      if (window.scrollY >= sectionTop) {
        currentSection = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('data-section') === currentSection) {
        link.classList.add('active');
      }
    });
  }


  // ── Mobile Menu ─────────────────────────────────────────────
  const mobileToggle = document.querySelector('.nav-mobile-toggle');
  const mobileMenu = document.getElementById('mobileMenu');

  mobileToggle.addEventListener('click', () => {
    mobileToggle.classList.toggle('active');
    mobileMenu.classList.toggle('open');
    document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
  });

  // Close mobile menu on link click
  document.querySelectorAll('.mobile-links a').forEach(link => {
    link.addEventListener('click', () => {
      mobileToggle.classList.remove('active');
      mobileMenu.classList.remove('open');
      document.body.style.overflow = '';
    });
  });


  // ── Scroll Reveal ──────────────────────────────────────────
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

  document.querySelectorAll('.reveal').forEach(el => {
    revealObserver.observe(el);
  });


  // ── Counter Animation ──────────────────────────────────────
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const counters = entry.target.querySelectorAll('.stat-number');
        counters.forEach(counter => {
          const target = parseInt(counter.getAttribute('data-target'));
          const duration = 2000;
          const start = performance.now();

          function updateCounter(currentTime) {
            const elapsed = currentTime - start;
            const progress = Math.min(elapsed / duration, 1);

            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            counter.textContent = Math.round(target * eased);

            if (progress < 1) {
              requestAnimationFrame(updateCounter);
            }
          }
          requestAnimationFrame(updateCounter);
        });
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  const statsSection = document.querySelector('.origin-stats');
  if (statsSection) counterObserver.observe(statsSection);


  // ── Shop Filter ─────────────────────────────────────────────
  const filterBtns = document.querySelectorAll('.filter-btn');
  const productCards = document.querySelectorAll('.product-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Update active button
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');

      productCards.forEach((card, index) => {
        const category = card.getAttribute('data-category');

        if (filter === 'all' || category === filter) {
          card.classList.remove('hidden');
          card.style.animation = `fadeUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${index * 0.05}s both`;
        } else {
          card.classList.add('hidden');
        }
      });
    });
  });


  // ── Menu Tabs ───────────────────────────────────────────────
  const menuTabs = document.querySelectorAll('.menu-tab');
  const menuPanels = document.querySelectorAll('.menu-panel');

  menuTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetId = tab.getAttribute('data-tab');

      // Update active tab
      menuTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      // Show target panel
      menuPanels.forEach(panel => {
        panel.classList.remove('active');
        if (panel.id === targetId) {
          panel.classList.add('active');

          // Re-trigger reveal animations for new panel items
          panel.querySelectorAll('.menu-item').forEach((item, i) => {
            item.classList.remove('visible');
            setTimeout(() => {
              item.classList.add('reveal', 'visible');
            }, i * 80);
          });
        }
      });
    });
  });


  // ── Testimonial Slider ──────────────────────────────────────
  const track = document.getElementById('testimonialTrack');
  const dots = document.querySelectorAll('.test-dot');
  const prevBtn = document.querySelector('.test-nav-btn.prev');
  const nextBtn = document.querySelector('.test-nav-btn.next');
  let currentSlide = 0;
  const totalSlides = dots.length;

  function goToSlide(index) {
    currentSlide = index;
    track.style.transform = `translateX(-${currentSlide * 100}%)`;

    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === currentSlide);
    });
  }

  prevBtn.addEventListener('click', () => {
    goToSlide(currentSlide === 0 ? totalSlides - 1 : currentSlide - 1);
  });

  nextBtn.addEventListener('click', () => {
    goToSlide(currentSlide === totalSlides - 1 ? 0 : currentSlide + 1);
  });

  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => goToSlide(i));
  });

  // Auto-play testimonials
  let autoPlay = setInterval(() => {
    goToSlide(currentSlide === totalSlides - 1 ? 0 : currentSlide + 1);
  }, 5000);

  // Pause on hover
  const slider = document.querySelector('.testimonial-slider');
  slider.addEventListener('mouseenter', () => clearInterval(autoPlay));
  slider.addEventListener('mouseleave', () => {
    autoPlay = setInterval(() => {
      goToSlide(currentSlide === totalSlides - 1 ? 0 : currentSlide + 1);
    }, 5000);
  });


  // ── Reservation Form ────────────────────────────────────────
  const form = document.getElementById('reservationForm');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    btn.textContent = 'RESERVED!';
    btn.style.background = '#4a9';
    btn.style.pointerEvents = 'none';

    setTimeout(() => {
      btn.textContent = 'RESERVE NOW';
      btn.style.background = '';
      btn.style.pointerEvents = '';
      form.reset();
    }, 3000);
  });


  // ── Smooth Scroll for Anchors ───────────────────────────────
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        const offset = 80;
        const targetPosition = target.offsetTop - offset;
        window.scrollTo({ top: targetPosition, behavior: 'smooth' });
      }
    });
  });


  // ── Parallax on Mouse Move (desktop only) ──────────────────
  if (window.innerWidth > 1024) {
    const heroContent = document.querySelector('.hero-content');

    document.addEventListener('mousemove', (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;

      if (heroContent) {
        heroContent.style.transform = `translate(${x * 10}px, ${y * 8}px)`;
      }
    });
  }


  // ── Cart Quick Add (visual feedback) ────────────────────────
  const cartCount = document.querySelector('.cart-count');
  let cartItems = 0;

  document.querySelectorAll('.product-quick-add').forEach(btn => {
    btn.addEventListener('click', () => {
      cartItems++;
      cartCount.textContent = cartItems;
      cartCount.style.transform = 'scale(1.3)';
      setTimeout(() => { cartCount.style.transform = 'scale(1)'; }, 200);

      btn.textContent = 'Added!';
      btn.style.background = '#4a9';
      setTimeout(() => {
        btn.textContent = '+ Add to Cart';
        btn.style.background = '';
      }, 1500);
    });
  });

});
