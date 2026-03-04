// ===========================
// SIGNALWAVE — Main Script
// ===========================

// ---- Thumbnail Generator ----
// Each episode gets a unique SVG icon, gradient, and decorative elements

const thumbData = {
  127: {
    title: 'The Neural Interface Revolution',
    icon: `<path d="M12 2a7 7 0 017 7c0 2.5-1.3 4.7-3.3 6H8.3C6.3 13.7 5 11.5 5 9a7 7 0 017-7z" stroke-width="1.5"/><path d="M9 21h6M10 17v4M14 17v4" stroke-width="1.5"/><circle cx="10" cy="8" r="1" fill="currentColor"/><circle cx="14" cy="8" r="1" fill="currentColor"/><path d="M10 8h4" stroke-width="1"/><path d="M8 5l-3-2M16 5l3-2M12 3V1" stroke-width="1" opacity="0.5"/>`,
    hue1: 180, hue2: 220, accent: '#00f0ff',
  },
  126: {
    title: 'Quantum Computing Goes Mainstream',
    icon: `<circle cx="12" cy="12" r="3" stroke-width="1.5"/><ellipse cx="12" cy="12" rx="10" ry="4" stroke-width="1.2" transform="rotate(0 12 12)"/><ellipse cx="12" cy="12" rx="10" ry="4" stroke-width="1.2" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="10" ry="4" stroke-width="1.2" transform="rotate(120 12 12)"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/>`,
    hue1: 260, hue2: 300, accent: '#b84dff',
  },
  125: {
    title: 'Living Off-Grid with Smart Tech',
    icon: `<path d="M12 2L2 7l10 5 10-5-10-5z" stroke-width="1.5"/><path d="M2 17l10 5 10-5" stroke-width="1.5"/><path d="M2 12l10 5 10-5" stroke-width="1.5"/><circle cx="12" cy="9" r="2" stroke-width="1" opacity="0.6"/><path d="M10 7l2-2 2 2" stroke-width="1" opacity="0.5"/>`,
    hue1: 120, hue2: 170, accent: '#00ff88',
  },
  124: {
    title: 'The Metaverse 3 Years Later',
    icon: `<rect x="3" y="7" width="18" height="10" rx="3" stroke-width="1.5"/><path d="M7 7V6a2 2 0 012-2h6a2 2 0 012 2v1" stroke-width="1.2"/><circle cx="9" cy="12" r="2" stroke-width="1.2"/><circle cx="15" cy="12" r="2" stroke-width="1.2"/><path d="M1 10l2 2-2 2M23 10l-2 2 2 2" stroke-width="1" opacity="0.5"/>`,
    hue1: 290, hue2: 340, accent: '#ff44cc',
  },
  123: {
    title: 'AI in Music Production',
    icon: `<path d="M9 18V5l12-2v13" stroke-width="1.5"/><circle cx="6" cy="18" r="3" stroke-width="1.5"/><circle cx="18" cy="16" r="3" stroke-width="1.5"/><path d="M9 9l12-2" stroke-width="1" opacity="0.4"/><path d="M9 13l12-2" stroke-width="1" opacity="0.3"/>`,
    hue1: 30, hue2: 60, accent: '#ffaa00',
  },
  122: {
    title: "Space Tourism: Who's Going?",
    icon: `<path d="M12 2c-1 0-3 4-3 10s2 10 3 10 3-4 3-10S13 2 12 2z" stroke-width="1.5"/><path d="M5 18l2-3h10l2 3" stroke-width="1.2"/><path d="M8 21h8" stroke-width="1.2"/><circle cx="12" cy="8" r="1" fill="currentColor"/><path d="M4 6l3 2M20 6l-3 2" stroke-width="1" opacity="0.4"/><circle cx="3" cy="4" r="0.5" fill="currentColor" opacity="0.3"/><circle cx="20" cy="3" r="0.5" fill="currentColor" opacity="0.3"/><circle cx="18" cy="8" r="0.5" fill="currentColor" opacity="0.2"/>`,
    hue1: 210, hue2: 250, accent: '#4d88ff',
  },
  121: {
    title: 'Decentralized Social Media',
    icon: `<circle cx="6" cy="6" r="2.5" stroke-width="1.3"/><circle cx="18" cy="6" r="2.5" stroke-width="1.3"/><circle cx="6" cy="18" r="2.5" stroke-width="1.3"/><circle cx="18" cy="18" r="2.5" stroke-width="1.3"/><circle cx="12" cy="12" r="2.5" stroke-width="1.3"/><line x1="8" y1="7.5" x2="10" y2="10.5" stroke-width="1" opacity="0.5"/><line x1="14" y1="10.5" x2="16" y2="7.5" stroke-width="1" opacity="0.5"/><line x1="8" y1="16.5" x2="10" y2="13.5" stroke-width="1" opacity="0.5"/><line x1="14" y1="13.5" x2="16" y2="16.5" stroke-width="1" opacity="0.5"/>`,
    hue1: 170, hue2: 210, accent: '#00ccdd',
  },
  120: {
    title: 'The Rise of Synthetic Biology',
    icon: `<path d="M12 2v6M12 16v6" stroke-width="1.5"/><path d="M12 8c4 0 6 2 6 4s-2 4-6 4-6-2-6-4 2-4 6-4z" stroke-width="1.5"/><circle cx="9" cy="12" r="1" fill="currentColor" opacity="0.6"/><circle cx="15" cy="12" r="1" fill="currentColor" opacity="0.6"/><path d="M8 6c0-2 1.5-3 4-3s4 1 4 3" stroke-width="1" opacity="0.4"/><path d="M8 18c0 2 1.5 3 4 3s4-1 4-3" stroke-width="1" opacity="0.4"/>`,
    hue1: 90, hue2: 150, accent: '#44dd66',
  },
  119: {
    title: 'Cybersecurity in 2026',
    icon: `<rect x="5" y="11" width="14" height="10" rx="2" stroke-width="1.5"/><path d="M8 11V7a4 4 0 018 0v4" stroke-width="1.5"/><circle cx="12" cy="16" r="1.5" fill="currentColor"/><path d="M12 17.5V19" stroke-width="1.5"/><path d="M3 6l2 2M21 6l-2 2" stroke-width="1" opacity="0.3"/><circle cx="2" cy="14" r="0.5" fill="currentColor" opacity="0.2"/><circle cx="22" cy="14" r="0.5" fill="currentColor" opacity="0.2"/>`,
    hue1: 340, hue2: 20, accent: '#ff4444',
  },
  118: {
    title: 'Autonomous Vehicles Update',
    icon: `<rect x="2" y="10" width="20" height="8" rx="3" stroke-width="1.5"/><circle cx="7" cy="18" r="2" stroke-width="1.3"/><circle cx="17" cy="18" r="2" stroke-width="1.3"/><path d="M5 10l2-4h10l2 4" stroke-width="1.3"/><path d="M10 6h4" stroke-width="1" opacity="0.5"/><path d="M1 14h2M21 14h2" stroke-width="1" opacity="0.3"/><line x1="9" y1="13" x2="15" y2="13" stroke-width="1" opacity="0.4"/>`,
    hue1: 200, hue2: 240, accent: '#44aaff',
  },
  117: {
    title: 'Digital Nomad Economy',
    icon: `<rect x="3" y="4" width="18" height="12" rx="2" stroke-width="1.5"/><line x1="3" y1="20" x2="21" y2="20" stroke-width="1.5"/><path d="M8 20l-1-4M16 20l1-4" stroke-width="1.2"/><circle cx="12" cy="10" r="3" stroke-width="1.2"/><path d="M1 8l2-2M23 8l-2-2" stroke-width="1" opacity="0.3"/><circle cx="22" cy="4" r="0.5" fill="currentColor" opacity="0.2"/><circle cx="2" cy="6" r="0.5" fill="currentColor" opacity="0.2"/>`,
    hue1: 45, hue2: 80, accent: '#ddaa00',
  },
  116: {
    title: 'Fusion Energy Breakthrough',
    icon: `<circle cx="12" cy="12" r="5" stroke-width="1.5"/><path d="M12 1v4M12 19v4M1 12h4M19 12h4" stroke-width="1.3"/><path d="M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8" stroke-width="1" opacity="0.5"/><circle cx="12" cy="12" r="2" fill="currentColor" opacity="0.5"/><circle cx="12" cy="12" r="8" stroke-width="0.8" stroke-dasharray="2 3" opacity="0.3"/>`,
    hue1: 40, hue2: 10, accent: '#ff8800',
  },
  115: {
    title: 'The Ethics of Gene Editing',
    icon: `<path d="M12 2c-2 3-2 6 0 10s2 7 0 10" stroke-width="1.5"/><path d="M12 2c2 3 2 6 0 10s-2 7 0 10" stroke-width="1.5"/><line x1="8" y1="6" x2="16" y2="6" stroke-width="1" opacity="0.4"/><line x1="7" y1="10" x2="17" y2="10" stroke-width="1" opacity="0.4"/><line x1="7" y1="14" x2="17" y2="14" stroke-width="1" opacity="0.4"/><line x1="8" y1="18" x2="16" y2="18" stroke-width="1" opacity="0.4"/><circle cx="8" cy="6" r="0.8" fill="currentColor" opacity="0.5"/><circle cx="16" cy="10" r="0.8" fill="currentColor" opacity="0.5"/><circle cx="8" cy="14" r="0.8" fill="currentColor" opacity="0.5"/><circle cx="16" cy="18" r="0.8" fill="currentColor" opacity="0.5"/>`,
    hue1: 150, hue2: 190, accent: '#00ddaa',
  },
  114: {
    title: 'Wearable Tech Beyond Watches',
    icon: `<rect x="6" y="3" width="12" height="18" rx="6" stroke-width="1.5"/><circle cx="12" cy="12" r="4" stroke-width="1.2"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/><path d="M6 9h-3M6 15h-3M18 9h3M18 15h3" stroke-width="1" opacity="0.4"/><line x1="12" y1="8" x2="12" y2="6" stroke-width="1" opacity="0.5"/><line x1="14.8" y1="9.2" x2="16" y2="8" stroke-width="1" opacity="0.5"/>`,
    hue1: 280, hue2: 320, accent: '#cc44ff',
  },
  113: {
    title: 'Open Source Everything',
    icon: `<path d="M8 3H5a2 2 0 00-2 2v14a2 2 0 002 2h3" stroke-width="1.5"/><path d="M16 3h3a2 2 0 012 2v14a2 2 0 01-2 2h-3" stroke-width="1.5"/><path d="M10 9l-3 3 3 3" stroke-width="1.5"/><path d="M14 9l3 3-3 3" stroke-width="1.5"/><line x1="12" y1="7" x2="12" y2="17" stroke-width="0.8" opacity="0.2"/>`,
    hue1: 190, hue2: 230, accent: '#44ccff',
  },
  112: {
    title: 'Climate Tech Innovations',
    icon: `<circle cx="12" cy="12" r="9" stroke-width="1.5"/><path d="M12 3c-3 3-5 6-5 9a5 5 0 0010 0c0-3-2-6-5-9z" stroke-width="1.2"/><path d="M3 12h18" stroke-width="0.8" opacity="0.3"/><path d="M12 3a20 20 0 014 9 20 20 0 01-4 9" stroke-width="0.8" opacity="0.3"/><path d="M12 3a20 20 0 00-4 9 20 20 0 004 9" stroke-width="0.8" opacity="0.3"/>`,
    hue1: 100, hue2: 160, accent: '#22cc44',
  },
};

function generateThumbnailSVG(epNum, large = false) {
  const data = thumbData[epNum];
  if (!data) return '';

  const w = large ? 640 : 320;
  const h = large ? 360 : 180;
  const iconScale = large ? 3.5 : 2;
  const iconX = w / 2;
  const iconY = h / 2 - (large ? 10 : 5);

  // Decorative grid dots
  let gridDots = '';
  for (let gx = 0; gx < w; gx += (large ? 40 : 24)) {
    for (let gy = 0; gy < h; gy += (large ? 40 : 24)) {
      gridDots += `<circle cx="${gx}" cy="${gy}" r="0.5" fill="white" opacity="0.04"/>`;
    }
  }

  // Decorative corner brackets
  const bS = large ? 30 : 18;
  const bW = large ? 1.5 : 1;
  const m = large ? 20 : 12;
  const corners = `
    <path d="M${m},${m + bS} L${m},${m} L${m + bS},${m}" fill="none" stroke="white" stroke-width="${bW}" opacity="0.15"/>
    <path d="M${w - m - bS},${m} L${w - m},${m} L${w - m},${m + bS}" fill="none" stroke="white" stroke-width="${bW}" opacity="0.15"/>
    <path d="M${m},${h - m - bS} L${m},${h - m} L${m + bS},${h - m}" fill="none" stroke="white" stroke-width="${bW}" opacity="0.15"/>
    <path d="M${w - m - bS},${h - m} L${w - m},${h - m} L${w - m},${h - m - bS}" fill="none" stroke="white" stroke-width="${bW}" opacity="0.15"/>
  `;

  // Waveform at bottom
  let waveform = '';
  const waveY = h - (large ? 45 : 28);
  const barCount = large ? 40 : 24;
  const barW = large ? 3 : 2;
  const barGap = large ? 5 : 3.5;
  const startX = (w - barCount * (barW + barGap)) / 2;
  for (let i = 0; i < barCount; i++) {
    const barH = Math.sin((i / barCount) * Math.PI) * (large ? 20 : 12) + (large ? 4 : 2);
    waveform += `<rect x="${startX + i * (barW + barGap)}" y="${waveY - barH / 2}" width="${barW}" height="${barH}" rx="1" fill="url(#tg${epNum})" opacity="0.5"/>`;
  }

  // Scanline effect
  let scanlines = '';
  for (let sy = 0; sy < h; sy += 4) {
    scanlines += `<rect x="0" y="${sy}" width="${w}" height="1" fill="white" opacity="0.01"/>`;
  }

  const epFontSize = large ? 16 : 10;
  const titleFontSize = large ? 14 : 8;
  const playR = large ? 28 : 16;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="100%" height="100%">
    <defs>
      <linearGradient id="tg${epNum}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="hsl(${data.hue1}, 80%, 55%)"/>
        <stop offset="100%" stop-color="hsl(${data.hue2}, 70%, 45%)"/>
      </linearGradient>
      <radialGradient id="tgr${epNum}" cx="50%" cy="40%" r="60%">
        <stop offset="0%" stop-color="hsl(${data.hue1}, 60%, 18%)"/>
        <stop offset="100%" stop-color="hsl(${data.hue2}, 50%, 6%)"/>
      </radialGradient>
      <radialGradient id="tglow${epNum}" cx="50%" cy="45%" r="35%">
        <stop offset="0%" stop-color="${data.accent}" stop-opacity="0.15"/>
        <stop offset="100%" stop-color="${data.accent}" stop-opacity="0"/>
      </radialGradient>
      <filter id="glow${epNum}">
        <feGaussianBlur stdDeviation="${large ? 4 : 2}" result="blur"/>
        <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
    </defs>

    <!-- Background -->
    <rect width="${w}" height="${h}" fill="url(#tgr${epNum})"/>
    <rect width="${w}" height="${h}" fill="url(#tglow${epNum})"/>

    <!-- Grid dots -->
    ${gridDots}

    <!-- Scanlines -->
    ${scanlines}

    <!-- Decorative circles -->
    <circle cx="${iconX}" cy="${iconY}" r="${large ? 70 : 40}" fill="none" stroke="${data.accent}" stroke-width="0.5" opacity="0.1"/>
    <circle cx="${iconX}" cy="${iconY}" r="${large ? 100 : 56}" fill="none" stroke="${data.accent}" stroke-width="0.3" opacity="0.06" stroke-dasharray="4 6"/>

    <!-- Main icon -->
    <g transform="translate(${iconX - 12 * iconScale}, ${iconY - 12 * iconScale}) scale(${iconScale})" fill="none" stroke="${data.accent}" filter="url(#glow${epNum})">
      ${data.icon}
    </g>

    <!-- Corner brackets -->
    ${corners}

    <!-- Waveform -->
    ${waveform}

    <!-- Episode badge -->
    <rect x="${m}" y="${h - m - (large ? 28 : 18)}" width="${large ? 80 : 50}" height="${large ? 28 : 18}" rx="${large ? 14 : 9}" fill="${data.accent}" opacity="0.15"/>
    <rect x="${m}" y="${h - m - (large ? 28 : 18)}" width="${large ? 80 : 50}" height="${large ? 28 : 18}" rx="${large ? 14 : 9}" fill="none" stroke="${data.accent}" stroke-width="0.5" opacity="0.3"/>
    <text x="${m + (large ? 40 : 25)}" y="${h - m - (large ? 9 : 5)}" text-anchor="middle" fill="${data.accent}" font-family="'Orbitron', monospace" font-size="${epFontSize}" font-weight="700" letter-spacing="1">EP ${epNum}</text>

    <!-- SIGNALWAVE watermark -->
    <text x="${w - m}" y="${m + (large ? 16 : 10)}" text-anchor="end" fill="white" font-family="'Orbitron', monospace" font-size="${titleFontSize}" font-weight="700" letter-spacing="2" opacity="0.12">SIGNALWAVE</text>

    <!-- Play button -->
    <circle cx="${iconX}" cy="${iconY}" r="${playR}" fill="rgba(0,0,0,0.4)" stroke="white" stroke-width="1.5" opacity="0"/>
    <polygon points="${iconX - playR * 0.3},${iconY - playR * 0.4} ${iconX - playR * 0.3},${iconY + playR * 0.4} ${iconX + playR * 0.45},${iconY}" fill="white" opacity="0"/>

    <!-- Hover overlay (CSS handles visibility) -->
    <rect class="thumb-hover-overlay" width="${w}" height="${h}" fill="black" opacity="0" rx="0"/>
    <circle class="thumb-play-bg" cx="${iconX}" cy="${iconY}" r="${playR}" fill="rgba(0,0,0,0.5)" stroke="white" stroke-width="1.5" opacity="0"/>
    <polygon class="thumb-play-icon" points="${iconX - playR * 0.3},${iconY - playR * 0.4} ${iconX - playR * 0.3},${iconY + playR * 0.4} ${iconX + playR * 0.45},${iconY}" fill="white" opacity="0"/>
  </svg>`;
}

// Render all thumbnails on page
function renderThumbnails() {
  document.querySelectorAll('.thumb[data-ep]').forEach(el => {
    const ep = parseInt(el.dataset.ep);
    const isLarge = el.closest('.video-wrapper') !== null;
    el.innerHTML = generateThumbnailSVG(ep, isLarge);
  });
}

renderThumbnails();

// ---- Tab Navigation ----
const navLinks = document.querySelectorAll('.nav-link[data-tab]');
const tabContents = document.querySelectorAll('.tab-content');
const btnGhosts = document.querySelectorAll('.btn-ghost[data-tab]');

function switchTab(tabId) {
  tabContents.forEach(t => t.classList.remove('active'));
  navLinks.forEach(l => l.classList.remove('active'));

  document.getElementById('tab-' + tabId)?.classList.add('active');
  document.querySelectorAll(`.nav-link[data-tab="${tabId}"]`).forEach(l => l.classList.add('active'));

  document.querySelector('.mobile-menu')?.classList.remove('open');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

navLinks.forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    switchTab(link.dataset.tab);
  });
});

btnGhosts.forEach(btn => {
  btn.addEventListener('click', e => {
    e.preventDefault();
    switchTab(btn.dataset.tab);
  });
});

// ---- Mobile Menu Toggle ----
const mobileToggle = document.querySelector('.mobile-toggle');
const mobileMenu = document.querySelector('.mobile-menu');

mobileToggle?.addEventListener('click', () => {
  mobileMenu?.classList.toggle('open');
});

// ---- Generate Episodes List ----
const episodesData = [
  { ep: 127, title: 'The Neural Interface Revolution', date: 'Feb 28, 2026', duration: '1h 24m', season: 3 },
  { ep: 126, title: 'Quantum Computing Goes Mainstream', date: 'Feb 21, 2026', duration: '1h 12m', season: 3 },
  { ep: 125, title: 'Living Off-Grid with Smart Tech', date: 'Feb 14, 2026', duration: '58m', season: 3 },
  { ep: 124, title: 'The Metaverse 3 Years Later', date: 'Feb 7, 2026', duration: '1h 05m', season: 3 },
  { ep: 123, title: 'AI in Music Production', date: 'Jan 31, 2026', duration: '49m', season: 3 },
  { ep: 122, title: "Space Tourism: Who's Going?", date: 'Jan 24, 2026', duration: '1h 18m', season: 3 },
  { ep: 121, title: 'Decentralized Social Media', date: 'Jan 17, 2026', duration: '55m', season: 3 },
  { ep: 120, title: 'The Rise of Synthetic Biology', date: 'Jan 10, 2026', duration: '1h 02m', season: 3 },
  { ep: 119, title: 'Cybersecurity in 2026', date: 'Jan 3, 2026', duration: '1h 10m', season: 3 },
  { ep: 118, title: 'Autonomous Vehicles Update', date: 'Dec 20, 2025', duration: '47m', season: 2 },
  { ep: 117, title: 'Digital Nomad Economy', date: 'Dec 13, 2025', duration: '52m', season: 2 },
  { ep: 116, title: 'Fusion Energy Breakthrough', date: 'Dec 6, 2025', duration: '1h 15m', season: 2 },
  { ep: 115, title: 'The Ethics of Gene Editing', date: 'Nov 29, 2025', duration: '1h 08m', season: 2 },
  { ep: 114, title: 'Wearable Tech Beyond Watches', date: 'Nov 22, 2025', duration: '44m', season: 2 },
  { ep: 113, title: 'Open Source Everything', date: 'Nov 15, 2025', duration: '59m', season: 1 },
  { ep: 112, title: 'Climate Tech Innovations', date: 'Nov 8, 2025', duration: '1h 20m', season: 1 },
];

const episodesList = document.querySelector('.episodes-list');
const filterBtns = document.querySelectorAll('.filter-btn');

function renderEpisodes(filter = 'All') {
  if (!episodesList) return;
  const filtered = filter === 'All' ? episodesData : episodesData.filter(e => `Season ${e.season}` === filter);

  episodesList.innerHTML = filtered.map(ep => `
    <div class="ep-list-item">
      <div class="ep-list-thumb">
        <div class="thumb" data-ep="${ep.ep}"></div>
      </div>
      <div class="ep-list-info">
        <span class="ep-number">EP ${ep.ep}</span>
        <h4>${ep.title}</h4>
        <p>Season ${ep.season}</p>
      </div>
      <div class="ep-list-meta">
        <span class="ep-duration">${ep.duration}</span>
        <span class="ep-date">${ep.date}</span>
      </div>
    </div>
  `).join('');

  // Render thumbnails for the newly created elements
  renderThumbnails();
}

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderEpisodes(btn.textContent.trim());
  });
});

renderEpisodes();

// ---- Contact Form Handler ----
function handleContact(e) {
  e.preventDefault();
  const btn = e.target.querySelector('button[type="submit"]');
  btn.textContent = 'Sent!';
  btn.style.background = 'linear-gradient(135deg, #00ff88, #00ccff)';
  setTimeout(() => {
    btn.textContent = 'Send Message';
    btn.style.background = '';
    e.target.reset();
  }, 2500);
}

// ---- Particle Background ----
const canvas = document.getElementById('particles');
const ctx = canvas.getContext('2d');

let particles = [];
const PARTICLE_COUNT = 80;

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

function createParticle() {
  return {
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    vx: (Math.random() - 0.5) * 0.4,
    vy: (Math.random() - 0.5) * 0.4,
    size: Math.random() * 2 + 0.5,
    opacity: Math.random() * 0.5 + 0.1,
    hue: Math.random() > 0.5 ? 185 : 280,
  };
}

function initParticles() {
  particles = [];
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push(createParticle());
  }
}

function drawParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 150) {
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.strokeStyle = `hsla(${particles[i].hue}, 100%, 60%, ${0.06 * (1 - dist / 150)})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
    }
  }

  for (const p of particles) {
    p.x += p.vx;
    p.y += p.vy;

    if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
    if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fillStyle = `hsla(${p.hue}, 100%, 60%, ${p.opacity})`;
    ctx.fill();
  }

  requestAnimationFrame(drawParticles);
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();
initParticles();
drawParticles();

// ---- Navbar scroll effect ----
window.addEventListener('scroll', () => {
  const nav = document.querySelector('.navbar');
  if (window.scrollY > 50) {
    nav.style.background = 'rgba(10, 10, 15, 0.92)';
  } else {
    nav.style.background = 'rgba(10, 10, 15, 0.7)';
  }
});
