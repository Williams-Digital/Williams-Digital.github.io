// ===== LOADER =====
(function () {
  const loader = document.getElementById('loader');
  if (!loader) return;

  // Hide loader after burger assembly + logo reveal finishes (~2.4s)
  const LOADER_DURATION = 2600;

  window.addEventListener('load', () => {
    setTimeout(() => {
      loader.classList.add('hidden');
      // Remove from DOM after transition completes
      setTimeout(() => loader.remove(), 750);
    }, LOADER_DURATION);
  });

  // Safety fallback — never block UI longer than 5s
  setTimeout(() => {
    loader.classList.add('hidden');
  }, 5000);
})();


// ===== CART STATE =====
const cart = {
  items: JSON.parse(localStorage.getItem('heroCart') || '[]'),

  save() {
    localStorage.setItem('heroCart', JSON.stringify(this.items));
    this.updateUI();
  },

  add(name, price) {
    const existing = this.items.find(item => item.name === name);
    if (existing) {
      existing.qty += 1;
    } else {
      this.items.push({ name, price: parseFloat(price), qty: 1 });
    }
    this.save();
    showToast(`${name} added to order`);
  },

  remove(name) {
    this.items = this.items.filter(item => item.name !== name);
    this.save();
  },

  updateQty(name, delta) {
    const item = this.items.find(i => i.name === name);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) {
      this.remove(name);
    } else {
      this.save();
    }
  },

  getTotal() {
    return this.items.reduce((sum, item) => sum + item.price * item.qty, 0);
  },

  getCount() {
    return this.items.reduce((sum, item) => sum + item.qty, 0);
  },

  updateUI() {
    const itemsEl = document.getElementById('cartItems');
    const footerEl = document.getElementById('cartFooter');
    const totalEl = document.getElementById('cartTotal');

    if (itemsEl) {
      if (this.items.length === 0) {
        itemsEl.innerHTML = `
          <div class="cart-empty">
            <p>Nothing here yet</p>
            <a href="#menu" class="btn btn-primary btn-sm">Browse the Menu</a>
          </div>`;
        if (footerEl) footerEl.style.display = 'none';
      } else {
        itemsEl.innerHTML = this.items.map(item => `
          <div class="cart-item">
            <div class="cart-item-image">${item.name.substring(0, 3).toUpperCase()}</div>
            <div class="cart-item-details">
              <div class="cart-item-name">${item.name}</div>
              <div class="cart-item-price">$${(item.price * item.qty).toFixed(2)}</div>
              <div class="cart-item-qty">
                <button onclick="cart.updateQty('${item.name}', -1)" aria-label="Decrease">−</button>
                <span>${item.qty}</span>
                <button onclick="cart.updateQty('${item.name}', 1)" aria-label="Increase">+</button>
              </div>
              <button class="cart-item-remove" onclick="cart.remove('${item.name}')">Remove</button>
            </div>
          </div>`).join('');
        if (footerEl) footerEl.style.display = 'block';
        if (totalEl) totalEl.textContent = `$${this.getTotal().toFixed(2)}`;
      }
    }
  }
};


// ===== DOM READY =====
document.addEventListener('DOMContentLoaded', () => {

  // Init cart
  cart.updateUI();

  // ------ Header scroll ------
  const header = document.getElementById('header');
  if (header) {
    window.addEventListener('scroll', () => {
      header.classList.toggle('scrolled', window.scrollY > 10);
    }, { passive: true });
  }

  // ------ Mobile menu ------
  const mobileToggle = document.getElementById('mobileToggle');
  const mobileMenu   = document.getElementById('mobileMenu');
  if (mobileToggle && mobileMenu) {
    mobileToggle.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.toggle('open');
      mobileToggle.classList.toggle('active');
      mobileToggle.setAttribute('aria-expanded', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
        mobileToggle.classList.remove('active');
        mobileToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  }

  // ------ Cart drawer ------
  const cartDrawer  = document.getElementById('cartDrawer');
  const cartOverlay = document.getElementById('cartOverlay');
  const cartClose   = document.getElementById('cartClose');

  function openCart() {
    if (cartDrawer)  cartDrawer.classList.add('open');
    if (cartOverlay) cartOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeCart() {
    if (cartDrawer)  cartDrawer.classList.remove('open');
    if (cartOverlay) cartOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (cartClose)   cartClose.addEventListener('click', closeCart);
  if (cartOverlay) cartOverlay.addEventListener('click', closeCart);

  // ------ Menu tabs ------
  const tabBtns   = document.querySelectorAll('.tab-btn');
  const tabPanels = document.querySelectorAll('.tab-panel');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.tab;

      tabBtns.forEach(b => b.classList.remove('active'));
      tabPanels.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const panel = document.getElementById(`tab-${target}`);
      if (panel) panel.classList.add('active');
    });
  });

  // ------ Add to cart ------
  document.querySelectorAll('.add-to-cart').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const name  = e.currentTarget.dataset.name;
      const price = e.currentTarget.dataset.price;
      cart.add(name, price);

      const el = e.currentTarget;
      const orig = el.textContent;
      el.textContent = 'Added!';
      el.style.background = 'var(--red-dark)';
      setTimeout(() => {
        el.textContent = orig;
        el.style.background = '';
      }, 1200);
    });
  });

  // ------ Testimonials slider ------
  const track   = document.getElementById('testimonialsTrack');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');

  if (track && prevBtn && nextBtn) {
    let currentSlide = 0;

    function getVisibleCount() {
      if (window.innerWidth <= 768)  return 1;
      if (window.innerWidth <= 1024) return 2;
      return 3;
    }

    function getSlideWidth() {
      const cards = track.querySelectorAll('.testimonial-card');
      if (!cards.length) return 0;
      return cards[0].offsetWidth + 24;
    }

    function updateSlider() {
      track.style.transform = `translateX(-${currentSlide * getSlideWidth()}px)`;
    }

    const totalCards = track.querySelectorAll('.testimonial-card').length;

    nextBtn.addEventListener('click', () => {
      const max = totalCards - getVisibleCount();
      if (currentSlide < max) { currentSlide++; updateSlider(); }
    });

    prevBtn.addEventListener('click', () => {
      if (currentSlide > 0) { currentSlide--; updateSlider(); }
    });

    window.addEventListener('resize', () => {
      currentSlide = 0;
      updateSlider();
    }, { passive: true });
  }

  // ------ Scroll animations ------
  const fadeEls = document.querySelectorAll(
    '.menu-card, .location-card, .catering-card, .testimonial-card, .pillar'
  );
  fadeEls.forEach(el => el.classList.add('fade-in'));

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -36px 0px' });

  fadeEls.forEach(el => observer.observe(el));

  // ------ Smooth scroll ------
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const offset = header ? header.offsetHeight : 0;
        const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  // ------ Newsletter form ------
  const newsletterForm = document.getElementById('newsletterForm');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      showToast("You're in! Welcome to the Hero crew.");
      newsletterForm.querySelector('input').value = '';
    });
  }

  // ------ Contact form ------
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      showToast("Message sent! We'll be in touch soon.");
      contactForm.reset();
    });
  }

  // ------ Floating order button — hide near footer ------
  const floatingBtn = document.getElementById('floatingOrderBtn');
  const footer      = document.querySelector('.footer');
  if (floatingBtn && footer) {
    window.addEventListener('scroll', () => {
      const footerTop = footer.getBoundingClientRect().top;
      floatingBtn.style.opacity = footerTop < window.innerHeight + 80 ? '0' : '1';
    }, { passive: true });
  }
});


// ===== TOAST =====
function showToast(message) {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  document.body.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add('show'));

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 420);
  }, 2600);
}
