// ====================================
// NIL Management - Interactive Features
// ====================================

document.addEventListener('DOMContentLoaded', () => {
    // Initialize all features
    initNavbar();
    initMobileMenu();
    initSmoothScroll();
    initGearFilters();
    initScrollAnimations();
    initCounterAnimations();
});

// ====================================
// Navbar Scroll Effect
// ====================================

function initNavbar() {
    const navbar = document.querySelector('.navbar');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;

        // Add background opacity based on scroll
        if (currentScroll > 100) {
            navbar.style.background = 'rgba(10, 10, 10, 0.98)';
            navbar.style.boxShadow = '0 4px 30px rgba(0, 0, 0, 0.3)';
        } else {
            navbar.style.background = 'rgba(10, 10, 10, 0.9)';
            navbar.style.boxShadow = 'none';
        }

        lastScroll = currentScroll;
    });
}

// ====================================
// Mobile Menu
// ====================================

function initMobileMenu() {
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');

    if (menuBtn) {
        menuBtn.addEventListener('click', () => {
            menuBtn.classList.toggle('active');
            navLinks.classList.toggle('mobile-active');

            // Animate hamburger
            const spans = menuBtn.querySelectorAll('span');
            if (menuBtn.classList.contains('active')) {
                spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
                spans[1].style.opacity = '0';
                spans[2].style.transform = 'rotate(-45deg) translate(7px, -6px)';
            } else {
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
            }
        });
    }
}

// ====================================
// Smooth Scroll
// ====================================

function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));

            if (target) {
                const navHeight = document.querySelector('.navbar').offsetHeight;
                const targetPosition = target.offsetTop - navHeight - 20;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });

                // Close mobile menu if open
                const navLinks = document.querySelector('.nav-links');
                const menuBtn = document.querySelector('.mobile-menu-btn');
                if (navLinks.classList.contains('mobile-active')) {
                    navLinks.classList.remove('mobile-active');
                    menuBtn.classList.remove('active');
                }
            }
        });
    });
}

// ====================================
// Gear Category Filters
// ====================================

function initGearFilters() {
    const categoryBtns = document.querySelectorAll('.category-btn');
    const gearCards = document.querySelectorAll('.gear-card');

    categoryBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active state
            categoryBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Animate cards (placeholder - in production would filter)
            gearCards.forEach((card, index) => {
                card.style.opacity = '0';
                card.style.transform = 'translateY(20px)';

                setTimeout(() => {
                    card.style.transition = 'all 0.3s ease';
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, index * 100);
            });
        });
    });
}

// ====================================
// Scroll Animations
// ====================================

function initScrollAnimations() {
    const animatedElements = document.querySelectorAll(
        '.section-header, .about-content, .about-visual, .athlete-showcase, ' +
        '.gear-card, .service-card, .testimonial-card'
    );

    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });

    // Add animate-in styles
    const style = document.createElement('style');
    style.textContent = `
        .animate-in {
            opacity: 1 !important;
            transform: translateY(0) !important;
        }
    `;
    document.head.appendChild(style);
}

// ====================================
// Counter Animations
// ====================================

function initCounterAnimations() {
    const stats = document.querySelectorAll('.stat-number');

    const observerOptions = {
        threshold: 0.5
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    stats.forEach(stat => observer.observe(stat));
}

function animateCounter(element) {
    const text = element.textContent;
    const hasPlus = text.includes('+');
    const hasDollar = text.includes('$');
    const hasM = text.includes('M');
    const hasK = text.includes('K');

    let endValue = parseFloat(text.replace(/[^0-9.]/g, ''));
    let suffix = '';

    if (hasPlus) suffix += '+';
    if (hasM) suffix = 'M' + suffix;
    if (hasK) suffix = 'K' + suffix;

    const prefix = hasDollar ? '$' : '';
    const duration = 2000;
    const startTime = performance.now();

    function updateCounter(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Easing function
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const currentValue = endValue * easeOutQuart;

        // Format the number
        let displayValue;
        if (hasM || hasK) {
            displayValue = currentValue.toFixed(currentValue < 10 ? 1 : 0);
        } else {
            displayValue = Math.round(currentValue).toLocaleString();
        }

        element.textContent = prefix + displayValue + suffix;

        if (progress < 1) {
            requestAnimationFrame(updateCounter);
        }
    }

    requestAnimationFrame(updateCounter);
}

// ====================================
// Add to Cart Animation (Placeholder)
// ====================================

document.querySelectorAll('.btn-gear').forEach(btn => {
    btn.addEventListener('click', function(e) {
        e.preventDefault();

        // Button animation
        const originalText = this.textContent;
        this.textContent = 'Added!';
        this.style.background = '#10B981';

        setTimeout(() => {
            this.textContent = originalText;
            this.style.background = '';
        }, 1500);
    });
});

// ====================================
// Floating Cards Parallax
// ====================================

document.addEventListener('mousemove', (e) => {
    const cards = document.querySelectorAll('.athlete-card');
    const badges = document.querySelectorAll('.floating-badge');

    const mouseX = e.clientX / window.innerWidth - 0.5;
    const mouseY = e.clientY / window.innerHeight - 0.5;

    cards.forEach((card, index) => {
        const depth = (index + 1) * 10;
        const moveX = mouseX * depth;
        const moveY = mouseY * depth;
        card.style.transform = `translate(${moveX}px, ${moveY}px)`;
    });

    badges.forEach((badge, index) => {
        const depth = (index + 1) * 15;
        const moveX = mouseX * depth * -1;
        const moveY = mouseY * depth * -1;
        badge.style.transform = `translate(${moveX}px, ${moveY}px)`;
    });
});

// ====================================
// Mobile Nav Styles (Add to DOM)
// ====================================

const mobileStyles = document.createElement('style');
mobileStyles.textContent = `
    @media (max-width: 768px) {
        .nav-links.mobile-active {
            display: flex !important;
            flex-direction: column;
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: rgba(10, 10, 10, 0.98);
            padding: 20px 40px;
            gap: 20px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .nav-links.mobile-active .btn-nav {
            text-align: center;
        }
    }
`;
document.head.appendChild(mobileStyles);

console.log('NIL Management - Website loaded successfully!');
