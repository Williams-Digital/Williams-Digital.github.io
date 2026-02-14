/* ══════════════════════════════════════
   Helen — Main JavaScript
   ══════════════════════════════════════ */

(function () {
  'use strict';

  // ── Navigation scroll effect ──
  const nav = document.getElementById('nav');
  if (nav) {
    const onScroll = () => {
      nav.classList.toggle('scrolled', window.scrollY > 40);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // ── Mobile navigation ──
  const navToggle = document.getElementById('navToggle');
  const navClose = document.getElementById('navClose');
  const navMobile = document.getElementById('navMobile');

  if (navToggle && navMobile) {
    navToggle.addEventListener('click', () => {
      navMobile.classList.add('open');
      document.body.style.overflow = 'hidden';
    });
  }
  if (navClose && navMobile) {
    navClose.addEventListener('click', () => {
      navMobile.classList.remove('open');
      document.body.style.overflow = '';
    });
  }
  if (navMobile) {
    navMobile.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navMobile.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  // ── Hero load animation ──
  const hero = document.getElementById('hero');
  if (hero) {
    requestAnimationFrame(() => {
      hero.classList.add('loaded');
    });
  }

  // ── Scroll reveal ──
  const revealElements = document.querySelectorAll('.reveal');
  if (revealElements.length > 0) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -60px 0px' }
    );
    revealElements.forEach((el) => observer.observe(el));
  }

  // ── Menu tab switching ──
  const menuBtns = document.querySelectorAll('.menu-nav-btn');
  const menuPanels = document.querySelectorAll('.menu-panel');

  if (menuBtns.length > 0 && menuPanels.length > 0) {
    menuBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.dataset.menu;

        menuBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        menuPanels.forEach(panel => {
          panel.style.display = panel.id === 'menu-' + target ? 'block' : 'none';
        });

        // Re-trigger reveal for newly visible items
        const newReveals = document.querySelectorAll('#menu-' + target + ' .reveal:not(.visible)');
        newReveals.forEach(el => {
          el.classList.add('visible');
        });
      });
    });
  }

  // ── Smooth parallax for hero background ──
  const heroBg = document.querySelector('.hero-bg');
  if (heroBg) {
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrolled = window.scrollY;
          if (scrolled < window.innerHeight) {
            heroBg.style.transform = 'scale(' + (1.05 - scrolled * 0.0001) + ') translateY(' + (scrolled * 0.3) + 'px)';
          }
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

})();
