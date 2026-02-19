// ===== CART STATE =====
const cart = {
  items: JSON.parse(localStorage.getItem('calaCart') || '[]'),

  save() {
    localStorage.setItem('calaCart', JSON.stringify(this.items));
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
    showToast(`${name} added to cart`);
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
    const countEl = document.getElementById('cartCount');
    const itemsEl = document.getElementById('cartItems');
    const footerEl = document.getElementById('cartFooter');
    const totalEl = document.getElementById('cartTotal');

    if (countEl) {
      const count = this.getCount();
      countEl.textContent = count;
      countEl.style.display = count > 0 ? 'flex' : 'none';
    }

    if (itemsEl) {
      if (this.items.length === 0) {
        itemsEl.innerHTML = `
          <div class="cart-empty">
            <p>Your cart is empty</p>
            <a href="shop.html" class="btn btn-primary btn-sm">Start Shopping</a>
          </div>`;
        if (footerEl) footerEl.style.display = 'none';
      } else {
        itemsEl.innerHTML = this.items.map(item => `
          <div class="cart-item">
            <div class="cart-item-image">${item.name.substring(0, 3)}</div>
            <div class="cart-item-details">
              <div class="cart-item-name">${item.name}</div>
              <div class="cart-item-price">$${(item.price * item.qty).toFixed(2)}</div>
              <div class="cart-item-qty">
                <button onclick="cart.updateQty('${item.name}', -1)" aria-label="Decrease quantity">−</button>
                <span>${item.qty}</span>
                <button onclick="cart.updateQty('${item.name}', 1)" aria-label="Increase quantity">+</button>
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
  // Initialize cart UI
  cart.updateUI();

  // Header scroll effect
  const header = document.getElementById('header');
  if (header) {
    window.addEventListener('scroll', () => {
      header.classList.toggle('scrolled', window.scrollY > 10);
    }, { passive: true });
  }

  // Mobile menu toggle
  const mobileToggle = document.getElementById('mobileToggle');
  const mobileMenu = document.getElementById('mobileMenu');
  if (mobileToggle && mobileMenu) {
    mobileToggle.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.toggle('open');
      mobileToggle.classList.toggle('active');
      mobileToggle.setAttribute('aria-expanded', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // Close mobile menu on link click
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
        mobileToggle.classList.remove('active');
        mobileToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  }

  // Cart drawer
  const cartBtn = document.getElementById('cartBtn');
  const cartDrawer = document.getElementById('cartDrawer');
  const cartOverlay = document.getElementById('cartOverlay');
  const cartClose = document.getElementById('cartClose');

  function openCart() {
    if (cartDrawer) cartDrawer.classList.add('open');
    if (cartOverlay) cartOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeCart() {
    if (cartDrawer) cartDrawer.classList.remove('open');
    if (cartOverlay) cartOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (cartBtn) cartBtn.addEventListener('click', openCart);
  if (cartClose) cartClose.addEventListener('click', closeCart);
  if (cartOverlay) cartOverlay.addEventListener('click', closeCart);

  // Add to cart buttons
  document.querySelectorAll('.add-to-cart').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const name = e.target.dataset.name;
      const price = e.target.dataset.price;
      cart.add(name, price);

      // Button feedback
      const originalText = e.target.textContent;
      e.target.textContent = 'Added!';
      e.target.style.background = '#365a2d';
      setTimeout(() => {
        e.target.textContent = originalText;
        e.target.style.background = '';
      }, 1200);
    });
  });

  // Testimonials slider
  const track = document.getElementById('testimonialsTrack');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');

  if (track && prevBtn && nextBtn) {
    let currentSlide = 0;

    function getVisibleCount() {
      if (window.innerWidth <= 768) return 1;
      if (window.innerWidth <= 1024) return 2;
      return 3;
    }

    function getSlideWidth() {
      const cards = track.querySelectorAll('.testimonial-card');
      if (cards.length === 0) return 0;
      return cards[0].offsetWidth + 24; // card width + gap
    }

    function updateSlider() {
      const slideWidth = getSlideWidth();
      track.style.transform = `translateX(-${currentSlide * slideWidth}px)`;
    }

    const totalCards = track.querySelectorAll('.testimonial-card').length;

    nextBtn.addEventListener('click', () => {
      const visible = getVisibleCount();
      const maxSlide = totalCards - visible;
      if (currentSlide < maxSlide) {
        currentSlide++;
        updateSlider();
      }
    });

    prevBtn.addEventListener('click', () => {
      if (currentSlide > 0) {
        currentSlide--;
        updateSlider();
      }
    });

    window.addEventListener('resize', () => {
      currentSlide = 0;
      updateSlider();
    });
  }

  // Scroll animations
  const fadeElements = document.querySelectorAll('.product-card, .location-card, .catering-card, .testimonial-card');
  fadeElements.forEach(el => el.classList.add('fade-in'));

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  fadeElements.forEach(el => observer.observe(el));

  // Smooth scroll for anchor links
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

  // Newsletter form
  const newsletterForm = document.getElementById('newsletterForm');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = newsletterForm.querySelector('input');
      showToast('Thanks for subscribing!');
      input.value = '';
    });
  }

  // Contact form
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      showToast('Message sent! We\'ll get back to you soon.');
      contactForm.reset();
    });
  }
});

// ===== TOAST NOTIFICATION =====
function showToast(message) {
  // Remove existing toast
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.add('show');
  });

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 400);
  }, 2500);
}
