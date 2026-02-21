/* ================================
   CONTINENTAL BAKERY — JavaScript
   ================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ========================
  // LOADING SCREEN
  // ========================
  const loader = document.getElementById('loader');
  const loaderBar = document.getElementById('loaderBar');
  const siteWrapper = document.getElementById('siteWrapper');
  const breadItems = document.querySelectorAll('.bread-item');

  // Add floating animation after initial appear animation
  setTimeout(() => {
    breadItems.forEach(item => item.classList.add('floating'));
  }, 1200);

  // Animate the progress bar
  let progress = 0;
  const loadInterval = setInterval(() => {
    progress += Math.random() * 12 + 3;
    if (progress > 100) progress = 100;
    loaderBar.style.width = progress + '%';

    if (progress >= 100) {
      clearInterval(loadInterval);
      setTimeout(() => {
        loader.classList.add('hidden');
        siteWrapper.classList.add('visible');
        document.body.style.overflow = '';
      }, 400);
    }
  }, 120);

  // Prevent scroll during loading
  document.body.style.overflow = 'hidden';

  // ========================
  // HEADER SCROLL EFFECT
  // ========================
  const header = document.getElementById('header');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // ========================
  // MOBILE MENU
  // ========================
  const mobileToggle = document.getElementById('mobileToggle');
  const mobileMenu = document.getElementById('mobileMenu');

  mobileToggle.addEventListener('click', () => {
    mobileToggle.classList.toggle('active');
    mobileMenu.classList.toggle('active');
    const isOpen = mobileMenu.classList.contains('active');
    mobileToggle.setAttribute('aria-expanded', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  // Close mobile menu on link click
  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mobileToggle.classList.remove('active');
      mobileMenu.classList.remove('active');
      mobileToggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });

  // ========================
  // MENU TABS
  // ========================
  const menuTabs = document.querySelectorAll('.menu-tab');
  const tabContents = document.querySelectorAll('.tab-content');

  menuTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetId = tab.dataset.tab;

      menuTabs.forEach(t => t.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));

      tab.classList.add('active');
      document.getElementById(targetId).classList.add('active');
    });
  });

  // ========================
  // SMOOTH SCROLL FOR ANCHOR LINKS
  // ========================
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;

      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        const headerHeight = header.offsetHeight;
        const targetPosition = target.getBoundingClientRect().top + window.scrollY - headerHeight - 20;

        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

  // ========================
  // SCROLL REVEAL ANIMATIONS
  // ========================
  const revealElements = document.querySelectorAll(
    '.feature-card, .menu-card, .catering-card, .testimonial-card, ' +
    '.about-content, .about-images, .breads-banner-content, .breads-banner-image, ' +
    '.contact-info-card, .contact-form-card, .gallery-item, .section-header'
  );

  revealElements.forEach(el => el.classList.add('reveal'));

  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -60px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  revealElements.forEach(el => observer.observe(el));

  // ========================
  // FORM HANDLING
  // ========================
  const contactForm = document.getElementById('contactForm');
  const newsletterForm = document.getElementById('newsletterForm');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = contactForm.querySelector('button[type="submit"]');
      const originalText = btn.textContent;
      btn.textContent = 'Sent!';
      btn.disabled = true;
      setTimeout(() => {
        btn.textContent = originalText;
        btn.disabled = false;
        contactForm.reset();
      }, 2500);
    });
  }

  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = newsletterForm.querySelector('button[type="submit"]');
      const originalText = btn.textContent;
      btn.textContent = 'Subscribed!';
      btn.disabled = true;
      setTimeout(() => {
        btn.textContent = originalText;
        btn.disabled = false;
        newsletterForm.reset();
      }, 2500);
    });
  }

  // ========================
  // ACTIVE NAV HIGHLIGHTING
  // ========================
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    let current = '';
    const scrollPos = window.scrollY + 200;

    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;

      if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  });

});
