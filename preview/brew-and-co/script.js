/* ========================================
   BREW & CO. — Main Script
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {

  // ---- LOADING SCREEN ----
  const loader = document.getElementById('loader');
  document.body.style.overflow = 'hidden';

  // Spawn floating coffee bean particles
  const particleContainer = document.getElementById('loaderParticles');
  for (let i = 0; i < 20; i++) {
    const p = document.createElement('div');
    p.classList.add('coffee-particle');
    p.style.left = Math.random() * 100 + '%';
    p.style.animationDuration = (6 + Math.random() * 8) + 's';
    p.style.animationDelay = (Math.random() * 5) + 's';
    p.style.width = (4 + Math.random() * 6) + 'px';
    p.style.height = (6 + Math.random() * 8) + 'px';
    p.style.opacity = 0;
    particleContainer.appendChild(p);
  }

  // Animate percentage counter
  const percentEl = document.getElementById('loaderPercent');
  let startTime = null;
  const totalDuration = 4600;

  function animatePercent(now) {
    if (!startTime) startTime = now;
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / totalDuration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    percentEl.textContent = Math.floor(eased * 100) + '%';
    if (progress < 1) requestAnimationFrame(animatePercent);
  }

  // Staged animation sequence
  // 0.4s  — portafilter fades in, pour stream starts, filling begins
  // 3.0s  — pour stops (stream retracts), splash stops
  // 3.4s  — latte art draws in, steam appears
  // 5.2s  — exit animation
  setTimeout(() => {
    loader.classList.add('filling');
    loader.classList.add('pouring');
    requestAnimationFrame(animatePercent);
  }, 400);

  // Stop the pour once the cup is nearly full
  setTimeout(() => {
    loader.classList.remove('pouring');
    loader.classList.add('pour-stop');
  }, 3000);

  // Latte art reveal after pour stops
  setTimeout(() => {
    loader.classList.add('art-reveal');
  }, 3400);

  // Exit
  setTimeout(() => {
    loader.classList.add('fade-out');
    setTimeout(() => {
      loader.style.display = 'none';
      document.body.style.overflow = '';
      animateHero();
    }, 1200);
  }, 5200);

  // ---- HERO VIDEO — force play after loader ----
  const heroVideo = document.querySelector('.hero-video');
  if (heroVideo) {
    heroVideo.play().catch(() => {});
    // Retry after loader exits in case browser blocked early autoplay
    setTimeout(() => { heroVideo.play().catch(() => {}); }, 5500);
  }

  // ---- NAVBAR ----
  const navbar = document.getElementById('navbar');
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.querySelector('.nav-links');

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
  });

  navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('open');
  });

  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => navLinks.classList.remove('open'));
  });

  // ---- HERO ANIMATION ----
  function animateHero() {
    document.querySelectorAll('.hero .animate-in').forEach((el, i) => {
      setTimeout(() => el.classList.add('visible'), i * 200);
    });
  }

  // ---- SCROLL ANIMATIONS ----
  const observerOptions = { threshold: 0.15, rootMargin: '0px 0px -50px 0px' };
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        if (entry.target.classList.contains('stat-number')) {
          animateCounter(entry.target);
        }
      }
    });
  }, observerOptions);

  document.querySelectorAll('.about-images, .about-text, .feature-card, .menu-item, .shop-card, .testimonial-card, .stat-number').forEach(el => {
    el.style.opacity = el.classList.contains('stat-number') ? '1' : '';
    observer.observe(el);
  });

  // ---- COUNTER ANIMATION ----
  function animateCounter(el) {
    const target = parseInt(el.dataset.target);
    const duration = 2000;
    const start = performance.now();

    function update(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(target * eased).toLocaleString();
      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  }

  // ---- MENU DATA ----
  const menuData = {
    espresso: [
      { name: 'Classic Espresso', desc: 'Bold, pure, and beautifully extracted', price: '$3.50' },
      { name: 'Americano', desc: 'Espresso diluted with hot water for a smooth finish', price: '$4.00' },
      { name: 'Cortado', desc: 'Equal parts espresso and steamed milk', price: '$4.50' },
      { name: 'Flat White', desc: 'Velvety microfoam over a double ristretto', price: '$5.00' },
      { name: 'Cappuccino', desc: 'Classic Italian — espresso, steamed milk, thick foam', price: '$5.00' },
      { name: 'Oat Milk Latte', desc: 'Creamy oat milk with our signature espresso blend', price: '$5.50' },
      { name: 'Macchiato', desc: 'Espresso stained with a touch of foamed milk', price: '$4.00' },
      { name: 'Double Shot', desc: 'For the purists — two perfectly pulled shots', price: '$4.50' },
    ],
    brewed: [
      { name: 'House Drip', desc: 'Our rotating single-origin, brewed fresh every hour', price: '$3.00' },
      { name: 'Pour Over', desc: 'Hand-poured Hario V60 — made to order', price: '$5.00' },
      { name: 'Cold Brew', desc: '18-hour slow steeped, smooth and rich', price: '$5.50' },
      { name: 'Nitro Cold Brew', desc: 'Cascading nitrogen-infused cold brew on tap', price: '$6.00' },
      { name: 'French Press', desc: 'Full-bodied and robust, for the table', price: '$5.50' },
      { name: 'AeroPress', desc: 'Clean and bright, competition-style brewing', price: '$5.00' },
    ],
    specialty: [
      { name: 'Lavender Honey Latte', desc: 'House-made lavender syrup with local honey', price: '$6.50' },
      { name: 'Brown Sugar Shaken Espresso', desc: 'Brown sugar, oat milk, shaken over ice', price: '$6.00' },
      { name: 'Matcha Latte', desc: 'Ceremonial-grade matcha whisked with milk', price: '$6.00' },
      { name: 'Chai Latte', desc: 'Spiced chai brewed in-house with whole spices', price: '$5.50' },
      { name: 'Mocha', desc: 'Single-origin dark chocolate meets espresso', price: '$6.00' },
      { name: 'Affogato', desc: 'Espresso poured over vanilla bean gelato', price: '$7.00' },
    ],
    pastries: [
      { name: 'Butter Croissant', desc: 'Flaky, golden, baked fresh every morning', price: '$4.50' },
      { name: 'Pain au Chocolat', desc: 'Dark chocolate wrapped in laminated dough', price: '$5.00' },
      { name: 'Almond Croissant', desc: 'Filled with frangipane, topped with sliced almonds', price: '$5.50' },
      { name: 'Banana Bread', desc: 'Moist, walnut-studded, with a hint of cinnamon', price: '$4.00' },
      { name: 'Morning Bun', desc: 'Orange zest and cinnamon sugar spiral', price: '$4.50' },
      { name: 'Scone of the Day', desc: 'Rotating seasonal flavors — ask your barista', price: '$4.00' },
    ],
  };

  function renderMenu(category) {
    const grid = document.getElementById('menuGrid');
    grid.innerHTML = menuData[category].map(item => `
      <div class="menu-item">
        <div class="menu-item-info">
          <div class="menu-item-name">${item.name}</div>
          <div class="menu-item-desc">${item.desc}</div>
        </div>
        <div class="menu-item-price">${item.price}</div>
      </div>
    `).join('');
  }

  renderMenu('espresso');

  document.querySelectorAll('.menu-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.menu-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      renderMenu(tab.dataset.tab);
    });
  });

  // ---- SHOP DATA ----
  const shopProducts = [
    { id: 1, name: 'Ethiopia Yirgacheffe', category: 'beans', desc: 'Bright, floral, with notes of bergamot and stone fruit.', price: 22, badge: 'Best Seller', img: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&h=400&fit=crop' },
    { id: 2, name: 'Colombia Huila', category: 'beans', desc: 'Rich caramel sweetness with a clean chocolate finish.', price: 19, badge: '', img: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400&h=400&fit=crop' },
    { id: 3, name: 'Guatemala Antigua', category: 'beans', desc: 'Full-bodied with smoky undertones and dark cocoa.', price: 21, badge: 'New', img: 'https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=400&h=400&fit=crop' },
    { id: 4, name: 'House Blend', category: 'beans', desc: 'Our signature year-round blend. Balanced and versatile.', price: 17, badge: '', img: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefda?w=400&h=400&fit=crop' },
    { id: 5, name: 'Hario V60 Kit', category: 'gear', desc: 'Ceramic dripper, server, and 100 filters. The perfect pour-over setup.', price: 45, badge: 'Popular', img: 'https://images.unsplash.com/photo-1572286258217-40142c1c6a70?w=400&h=400&fit=crop' },
    { id: 6, name: 'Fellow Stagg Kettle', category: 'gear', desc: 'Precision pour, built-in thermometer, stunning design.', price: 89, badge: '', img: 'https://images.unsplash.com/photo-1585515320310-259814833e62?w=400&h=400&fit=crop' },
    { id: 7, name: 'Brew & Co. Tote', category: 'merch', desc: 'Heavyweight canvas tote with embroidered logo.', price: 28, badge: 'Limited', img: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=400&h=400&fit=crop' },
    { id: 8, name: 'Ceramic Mug Set', category: 'merch', desc: 'Handmade stoneware, set of 2. Each one unique.', price: 38, badge: '', img: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=400&h=400&fit=crop' },
  ];

  let cart = [];
  const cartCount = document.getElementById('cartCount');

  function renderShop(filter = 'all') {
    const grid = document.getElementById('shopGrid');
    const filtered = filter === 'all' ? shopProducts : shopProducts.filter(p => p.category === filter);
    grid.innerHTML = filtered.map(product => `
      <div class="shop-card" data-category="${product.category}">
        <div class="shop-card-img">
          <img src="${product.img}" alt="${product.name}" loading="lazy">
          ${product.badge ? `<span class="shop-card-badge">${product.badge}</span>` : ''}
        </div>
        <div class="shop-card-body">
          <div class="shop-card-category">${product.category}</div>
          <h3 class="shop-card-title">${product.name}</h3>
          <p class="shop-card-desc">${product.desc}</p>
          <div class="shop-card-footer">
            <span class="shop-card-price">$${product.price}</span>
            <button class="shop-card-btn" onclick="addToCart(${product.id})">Add to Cart</button>
          </div>
        </div>
      </div>
    `).join('');
  }

  renderShop();

  document.querySelectorAll('.shop-filter').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.shop-filter').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderShop(btn.dataset.filter);
    });
  });

  window.addToCart = function(id) {
    cart.push(id);
    cartCount.textContent = cart.length;
    cartCount.style.transform = 'scale(1.4)';
    setTimeout(() => cartCount.style.transform = 'scale(1)', 200);
  };

  // ---- TESTIMONIALS SLIDER ----
  const testimonials = document.querySelectorAll('.testimonial-card');
  const dotsContainer = document.getElementById('testimonialDots');
  let currentTestimonial = 0;

  testimonials.forEach((_, i) => {
    const dot = document.createElement('div');
    dot.classList.add('testimonial-dot');
    if (i === 0) dot.classList.add('active');
    dot.addEventListener('click', () => goToTestimonial(i));
    dotsContainer.appendChild(dot);
  });

  function goToTestimonial(index) {
    testimonials[currentTestimonial].classList.remove('active');
    dotsContainer.children[currentTestimonial].classList.remove('active');
    currentTestimonial = index;
    testimonials[currentTestimonial].classList.add('active');
    dotsContainer.children[currentTestimonial].classList.add('active');
  }

  setInterval(() => {
    goToTestimonial((currentTestimonial + 1) % testimonials.length);
  }, 5000);

  // ---- CONTACT FORM ----
  document.getElementById('contactForm').addEventListener('submit', (e) => {
    e.preventDefault();
    alert('Thanks for reaching out! We\'ll get back to you within 24 hours.');
    e.target.reset();
  });

  // ============================================================
  // STAFF PORTAL
  // ============================================================
  const portalLogin = document.getElementById('portalLogin');
  const portalDashboard = document.getElementById('portalDashboard');
  let currentRole = 'owner';

  // Role selection
  document.querySelectorAll('.role-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.role-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentRole = btn.dataset.role;
    });
  });

  // Login
  document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const names = { owner: 'Owner', manager: 'Manager', barista: 'Barista' };
    const titles = { owner: 'Shop Owner', manager: 'Floor Manager', barista: 'Lead Barista' };
    document.getElementById('portalName').textContent = names[currentRole];
    document.getElementById('portalRole').textContent = titles[currentRole];
    document.getElementById('portalAvatar').textContent = names[currentRole][0];
    portalLogin.classList.add('hidden');
    portalDashboard.classList.remove('hidden');
  });

  // Logout
  document.getElementById('portalLogout').addEventListener('click', () => {
    portalDashboard.classList.add('hidden');
    portalLogin.classList.remove('hidden');
    // Close overlay on logout
    const overlay = document.getElementById('staff-portal');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  });

  // Portal tabs
  document.querySelectorAll('.portal-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.portal-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.portal-panel').forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById(`panel-${tab.dataset.portal}`).classList.add('active');
    });
  });

  // ---- SCHEDULE ----
  const staffMembers = ['Emma Wilson', 'Jake Thompson', 'Maria Garcia', 'Alex Kim', 'Sofia Reyes', 'Tyler Brown'];
  const roles = ['Barista', 'Cashier', 'Kitchen', 'Floor Manager'];
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const colors = ['#c8a96e', '#8B6914', '#5B2C6F', '#2d5016', '#922B21', '#1a6b5a'];

  const scheduleData = [
    { staff: 'Emma Wilson', day: 'Monday', start: '06:00', end: '14:00', role: 'Barista' },
    { staff: 'Jake Thompson', day: 'Monday', start: '10:00', end: '18:00', role: 'Barista' },
    { staff: 'Maria Garcia', day: 'Monday', start: '06:00', end: '14:00', role: 'Cashier' },
    { staff: 'Emma Wilson', day: 'Tuesday', start: '06:00', end: '14:00', role: 'Barista' },
    { staff: 'Alex Kim', day: 'Tuesday', start: '10:00', end: '18:00', role: 'Kitchen' },
    { staff: 'Sofia Reyes', day: 'Wednesday', start: '06:00', end: '14:00', role: 'Barista' },
    { staff: 'Tyler Brown', day: 'Wednesday', start: '10:00', end: '18:00', role: 'Barista' },
    { staff: 'Jake Thompson', day: 'Wednesday', start: '14:00', end: '22:00', role: 'Floor Manager' },
    { staff: 'Maria Garcia', day: 'Thursday', start: '06:00', end: '14:00', role: 'Cashier' },
    { staff: 'Emma Wilson', day: 'Thursday', start: '10:00', end: '18:00', role: 'Barista' },
    { staff: 'Alex Kim', day: 'Friday', start: '06:00', end: '14:00', role: 'Kitchen' },
    { staff: 'Sofia Reyes', day: 'Friday', start: '06:00', end: '14:00', role: 'Barista' },
    { staff: 'Tyler Brown', day: 'Friday', start: '14:00', end: '22:00', role: 'Barista' },
    { staff: 'Jake Thompson', day: 'Friday', start: '10:00', end: '18:00', role: 'Floor Manager' },
    { staff: 'Emma Wilson', day: 'Saturday', start: '07:00', end: '15:00', role: 'Barista' },
    { staff: 'Maria Garcia', day: 'Saturday', start: '07:00', end: '15:00', role: 'Cashier' },
    { staff: 'Sofia Reyes', day: 'Saturday', start: '12:00', end: '20:00', role: 'Barista' },
    { staff: 'Tyler Brown', day: 'Sunday', start: '07:00', end: '15:00', role: 'Barista' },
    { staff: 'Alex Kim', day: 'Sunday', start: '07:00', end: '15:00', role: 'Kitchen' },
  ];

  function renderSchedule() {
    const grid = document.getElementById('scheduleGrid');
    grid.innerHTML = days.map(day => {
      const shifts = scheduleData.filter(s => s.day === day);
      return `
        <div class="schedule-day">
          <div class="schedule-day-header">${day.slice(0, 3)}</div>
          ${shifts.map(s => {
            const color = colors[staffMembers.indexOf(s.staff) % colors.length];
            return `
              <div class="schedule-shift" style="border-left-color: ${color}">
                <span class="shift-name">${s.staff.split(' ')[0]}</span>
                <span class="shift-time">${s.start} - ${s.end}</span>
                <span class="shift-role">${s.role}</span>
              </div>
            `;
          }).join('')}
        </div>
      `;
    }).join('');
  }

  renderSchedule();

  // Add Shift Modal
  const shiftModal = document.getElementById('shiftModal');
  document.getElementById('addShiftBtn').addEventListener('click', () => shiftModal.classList.remove('hidden'));
  document.getElementById('shiftModalClose').addEventListener('click', () => shiftModal.classList.add('hidden'));

  document.getElementById('shiftForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const staff = document.getElementById('shiftStaff').value;
    const day = document.getElementById('shiftDay').value;
    const start = document.getElementById('shiftStart').value;
    const end = document.getElementById('shiftEnd').value;
    const role = document.getElementById('shiftRole').value;
    scheduleData.push({ staff, day, start, end, role });
    renderSchedule();
    shiftModal.classList.add('hidden');
  });

  // ---- TEAM CHAT ----
  const chatMessages = [
    { user: 'Emma Wilson', avatar: 'EW', color: '#c8a96e', time: '8:32 AM', text: 'Good morning team! The new Ethiopian single-origin just arrived. It smells incredible.' },
    { user: 'Jake Thompson', avatar: 'JT', color: '#5B2C6F', time: '8:35 AM', text: 'Nice! Can\'t wait to dial it in. What\'s the recommended dose?' },
    { user: 'Emma Wilson', avatar: 'EW', color: '#c8a96e', time: '8:37 AM', text: '18g in, 36g out, 28 seconds. It\'s pulling beautifully as a ristretto too.' },
    { user: 'Sofia Reyes', avatar: 'SR', color: '#2d5016', time: '8:41 AM', text: 'The pastry delivery is here! We got extra almond croissants today.' },
    { user: 'Maria Garcia', avatar: 'MG', color: '#922B21', time: '8:45 AM', text: 'The morning rush is starting. We\'re looking good on prep. Let\'s have a great day!' },
    { user: 'Owner', avatar: 'O', color: '#8B6914', time: '9:00 AM', text: 'Great work on the weekend numbers team! We hit a new record. Coffee is on me today... well, it always is.' },
  ];

  function renderChat() {
    const container = document.getElementById('chatMessages');
    container.innerHTML = chatMessages.map(msg => `
      <div class="chat-message">
        <div class="chat-msg-avatar" style="background: ${msg.color}">${msg.avatar}</div>
        <div class="chat-msg-content">
          <div class="chat-msg-header">
            <span class="chat-msg-name">${msg.user}</span>
            <span class="chat-msg-time">${msg.time}</span>
          </div>
          <div class="chat-msg-text">${msg.text}</div>
        </div>
      </div>
    `).join('');
    container.scrollTop = container.scrollHeight;
  }

  renderChat();

  // Send message
  function sendMessage() {
    const input = document.getElementById('chatInput');
    const text = input.value.trim();
    if (!text) return;
    const now = new Date();
    const time = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    const name = document.getElementById('portalName').textContent;
    chatMessages.push({
      user: name,
      avatar: name[0],
      color: '#8B6914',
      time,
      text,
    });
    renderChat();
    input.value = '';
  }

  document.getElementById('chatSend').addEventListener('click', sendMessage);
  document.getElementById('chatInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
  });

  // ---- ANNOUNCEMENTS ----
  const announcements = [
    { title: 'Holiday Hours Update', body: 'We will be operating with reduced hours during the upcoming holiday weekend. Saturday: 8am-4pm, Sunday: Closed. Please plan your shifts accordingly.', priority: 'important', author: 'Owner', time: '2 hours ago' },
    { title: 'New Espresso Machine Arriving', body: 'Our new La Marzocca Strada is arriving next Tuesday! Training sessions will be scheduled for all baristas. This is going to be a game changer for our espresso quality.', priority: 'normal', author: 'Owner', time: '1 day ago' },
    { title: 'Health Inspection — This Friday', body: 'Reminder: Health inspection is this Friday at 10am. Please ensure all stations are clean and organized. Deep clean scheduled for Thursday evening. All hands on deck.', priority: 'urgent', author: 'Manager', time: '3 days ago' },
  ];

  function renderAnnouncements() {
    const list = document.getElementById('announcementsList');
    list.innerHTML = announcements.map(a => `
      <div class="announcement-item ${a.priority}">
        <div class="announcement-meta">
          <strong>${a.title}</strong>
          <span class="announcement-priority priority-${a.priority}">${a.priority}</span>
          <span>${a.author} &bull; ${a.time}</span>
        </div>
        <p class="announcement-text">${a.body}</p>
      </div>
    `).join('');
  }

  renderAnnouncements();

  document.getElementById('postAnnouncement').addEventListener('click', () => {
    const title = document.getElementById('annTitle').value.trim();
    const body = document.getElementById('annBody').value.trim();
    const priority = document.getElementById('annPriority').value;
    if (!title || !body) return alert('Please fill in both title and body.');
    announcements.unshift({
      title,
      body,
      priority,
      author: document.getElementById('portalName').textContent,
      time: 'Just now',
    });
    renderAnnouncements();
    document.getElementById('annTitle').value = '';
    document.getElementById('annBody').value = '';
  });

  // ---- STAFF PORTAL OVERLAY ----
  const portalOverlay = document.getElementById('staff-portal');
  const openPortalBtn = document.getElementById('openPortalBtn');
  const closePortalBtn = document.getElementById('closePortalBtn');

  function openPortal() {
    portalOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closePortal() {
    portalOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  openPortalBtn.addEventListener('click', (e) => {
    e.preventDefault();
    navLinks.classList.remove('open');
    openPortal();
  });

  closePortalBtn.addEventListener('click', closePortal);

  // Close overlay on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && portalOverlay.classList.contains('active')) {
      closePortal();
    }
  });

  // Footer links that open portal
  document.querySelectorAll('.open-portal-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      openPortal();
    });
  });

  // ---- SMOOTH SCROLL ----
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href === '#' || href === '#staff-portal') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

});
