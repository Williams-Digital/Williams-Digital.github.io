// ====================================
// Pliable Marketing - Interactive Features
// ====================================

document.addEventListener('DOMContentLoaded', () => {
    initNavbar();
    initMobileMenu();
    initSmoothScroll();
    initScrollReveal();
    initImpactCounters();
    initContactModal();
    initVideoPlayer();
});

// ====================================
// Navbar Scroll Effect
// ====================================

function initNavbar() {
    const navbar = document.querySelector('.navbar');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 80) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
}

// ====================================
// Mobile Menu
// ====================================

function initMobileMenu() {
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    if (!menuBtn || !navLinks) return;

    // Inject mobile nav styles
    const style = document.createElement('style');
    style.textContent = `
        @media (max-width: 768px) {
            .nav-links.mobile-active {
                display: flex !important;
                flex-direction: column;
                position: absolute;
                top: 100%;
                left: 0;
                right: 0;
                background: rgba(10, 22, 40, 0.98);
                backdrop-filter: blur(20px);
                padding: 24px 40px;
                gap: 20px;
                border-bottom: 2px solid rgba(207, 14, 19, 0.3);
                animation: slideDown 0.3s ease;
            }
            @keyframes slideDown {
                from { opacity: 0; transform: translateY(-10px); }
                to { opacity: 1; transform: translateY(0); }
            }
            .nav-links.mobile-active .btn-nav {
                text-align: center;
                display: block;
            }
        }
    `;
    document.head.appendChild(style);

    menuBtn.addEventListener('click', () => {
        const isActive = navLinks.classList.toggle('mobile-active');
        menuBtn.classList.toggle('active');

        const spans = menuBtn.querySelectorAll('span');
        if (isActive) {
            spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
            spans[1].style.opacity = '0';
            spans[2].style.transform = 'rotate(-45deg) translate(7px, -6px)';
        } else {
            spans[0].style.transform = '';
            spans[1].style.opacity = '';
            spans[2].style.transform = '';
        }
    });
}

// ====================================
// Smooth Scroll
// ====================================

function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#') return;

            e.preventDefault();
            const target = document.querySelector(href);
            if (!target) return;

            const navHeight = document.querySelector('.navbar').offsetHeight;
            window.scrollTo({
                top: target.offsetTop - navHeight - 20,
                behavior: 'smooth'
            });

            // Close mobile menu
            const navLinks = document.querySelector('.nav-links');
            const menuBtn = document.querySelector('.mobile-menu-btn');
            if (navLinks && navLinks.classList.contains('mobile-active')) {
                navLinks.classList.remove('mobile-active');
                menuBtn.classList.remove('active');
                const spans = menuBtn.querySelectorAll('span');
                spans[0].style.transform = '';
                spans[1].style.opacity = '';
                spans[2].style.transform = '';
            }
        });
    });
}

// ====================================
// Scroll Reveal Animations
// ====================================

function initScrollReveal() {
    const elements = document.querySelectorAll(
        '.section-header, .about-content, .about-visual, .service-card, ' +
        '.athlete-card, .reel-content, .reel-video, .testimonial-content, ' +
        '.cta-content, .cta-image, .impact-stat, .media-logo, .level-header, ' +
        '.feature, .cta-feature'
    );

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, i) => {
            if (entry.isIntersecting) {
                // Stagger animation for grid items
                const delay = entry.target.dataset.delay || 0;
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, delay);
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -40px 0px'
    });

    elements.forEach((el, i) => {
        el.classList.add('reveal');

        // Auto-stagger items within grids
        const parent = el.parentElement;
        if (parent) {
            const siblings = Array.from(parent.children).filter(c => c.classList.contains('reveal'));
            const index = siblings.indexOf(el);
            if (index > 0) {
                el.dataset.delay = index * 100;
            }
        }

        observer.observe(el);
    });
}

// ====================================
// Impact Counter Animations
// ====================================

function initImpactCounters() {
    const counters = document.querySelectorAll('.impact-number');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(counter => observer.observe(counter));
}

function animateCounter(element) {
    const target = parseInt(element.dataset.target, 10);
    const duration = 2000;
    const start = performance.now();

    function update(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 4);
        element.textContent = Math.round(target * eased);

        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }

    requestAnimationFrame(update);
}

// ====================================
// Contact Modal
// ====================================

function initContactModal() {
    const modal = document.getElementById('contact-modal');
    if (!modal) return;

    const overlay = modal.querySelector('.modal-overlay');
    const closeBtn = modal.querySelector('.modal-close');
    const form = document.getElementById('contact-form');
    const successMsg = document.getElementById('form-success');

    function openModal() {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        if (form) {
            form.style.display = '';
            form.reset();
        }
        if (successMsg) successMsg.style.display = 'none';
    }

    function closeModal() {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }

    // Trigger buttons
    document.querySelectorAll('.contact-form-trigger, .btn-nav').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            openModal();
        });
    });

    if (overlay) overlay.addEventListener('click', closeModal);
    if (closeBtn) closeBtn.addEventListener('click', closeModal);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const submitBtn = form.querySelector('button[type="submit"]');
            const original = submitBtn.innerHTML;
            submitBtn.innerHTML = '<span>Sending...</span>';
            submitBtn.disabled = true;

            setTimeout(() => {
                form.style.display = 'none';
                successMsg.style.display = 'block';
                submitBtn.innerHTML = original;
                submitBtn.disabled = false;
                setTimeout(closeModal, 3000);
            }, 1500);
        });
    }
}

// ====================================
// Video Player
// ====================================

function initVideoPlayer() {
    const playBtn = document.querySelector('.play-btn');
    if (!playBtn) return;

    playBtn.addEventListener('click', () => {
        const player = playBtn.closest('.video-player');
        const img = player.querySelector('img');

        // Replace image with an embedded video placeholder
        const videoOverlay = document.createElement('div');
        videoOverlay.style.cssText = 'position:absolute;inset:0;background:#000;display:flex;align-items:center;justify-content:center;border-radius:16px;';
        videoOverlay.innerHTML = `
            <div style="text-align:center;color:white;">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom:16px;opacity:0.5;">
                    <polygon points="5 3 19 12 5 21 5 3"/>
                </svg>
                <p style="font-size:1.125rem;opacity:0.7;">Highlight reel would play here</p>
                <p style="font-size:0.875rem;opacity:0.4;margin-top:8px;">Connect your video source</p>
            </div>
        `;

        player.style.position = 'relative';
        player.appendChild(videoOverlay);
        playBtn.style.display = 'none';

        // Click to dismiss
        videoOverlay.addEventListener('click', () => {
            videoOverlay.remove();
            playBtn.style.display = '';
        });
    });
}
