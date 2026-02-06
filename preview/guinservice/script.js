// ============================================
// GUIN SERVICE - WEBSITE JAVASCRIPT
// ============================================

// DOM Elements
const preloader = document.getElementById('preloader');
const navbar = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('nav-menu');
const navLinks = document.querySelectorAll('.nav-link');
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');
const scheduleModal = document.getElementById('schedule-modal');
const chatWidget = document.getElementById('chat-widget');
const chatToggle = document.getElementById('chat-toggle');
const chatForm = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-input');
const chatMessages = document.getElementById('chat-messages');

// ============================================
// PRELOADER
// ============================================
window.addEventListener('load', () => {
    setTimeout(() => {
        preloader.classList.add('hidden');
    }, 500);
});

// ============================================
// NAVBAR
// ============================================
window.addEventListener('scroll', () => {
    if (window.scrollY > 100) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }

    // Update active nav link based on scroll position
    updateActiveNavLink();
});

// Mobile Menu Toggle
hamburger.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    hamburger.classList.toggle('active');
});

// Close mobile menu on link click
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        hamburger.classList.remove('active');
    });
});

// Update active nav link based on scroll position
function updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const scrollPos = window.scrollY + 150;

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');

        if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${sectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    });
}

// ============================================
// SERVICE TABS
// ============================================
tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const tabId = btn.getAttribute('data-tab');

        // Update active button
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Update active content
        tabContents.forEach(content => {
            content.classList.remove('active');
            if (content.id === tabId) {
                content.classList.add('active');
            }
        });
    });
});

// ============================================
// SCHEDULE MODAL
// ============================================
function openScheduleModal() {
    scheduleModal.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Set minimum date to today
    const dateInput = document.getElementById('sched-date');
    const today = new Date().toISOString().split('T')[0];
    dateInput.setAttribute('min', today);
}

function closeScheduleModal() {
    scheduleModal.classList.remove('active');
    document.body.style.overflow = '';
}

// Close modal on escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && scheduleModal.classList.contains('active')) {
        closeScheduleModal();
    }
});

// Schedule Form Submission
const scheduleForm = document.getElementById('schedule-form');
scheduleForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = new FormData(scheduleForm);
    const data = Object.fromEntries(formData);

    // Show success message
    showFormSuccess(scheduleForm, 'Thank you! We\'ll call you within 1 business hour to confirm your appointment.');

    // In production, you would send this data to your server
    console.log('Schedule request:', data);

    // Reset form after delay
    setTimeout(() => {
        scheduleForm.reset();
        closeScheduleModal();
    }, 3000);
});

// Contact Form Submission
const contactForm = document.getElementById('contact-form');
contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = new FormData(contactForm);
    const data = Object.fromEntries(formData);

    // Show success message
    showFormSuccess(contactForm, 'Message sent! We\'ll get back to you shortly.');

    // In production, you would send this data to your server
    console.log('Contact form:', data);

    // Reset form after delay
    setTimeout(() => {
        contactForm.reset();
    }, 3000);
});

function showFormSuccess(form, message) {
    const btn = form.querySelector('button[type="submit"]');
    const originalContent = btn.innerHTML;

    btn.innerHTML = '<i class="fas fa-check"></i> ' + message;
    btn.style.background = 'var(--success)';
    btn.disabled = true;

    setTimeout(() => {
        btn.innerHTML = originalContent;
        btn.style.background = '';
        btn.disabled = false;
    }, 3000);
}

// ============================================
// CHAT WIDGET
// ============================================
chatToggle.addEventListener('click', toggleChat);

function toggleChat() {
    chatWidget.classList.toggle('active');

    // Remove badge when opened
    const badge = chatWidget.querySelector('.chat-badge');
    if (chatWidget.classList.contains('active') && badge) {
        badge.style.display = 'none';
    }
}

// Chat form submission
chatForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const message = chatInput.value.trim();
    if (!message) return;

    // Add user message
    addChatMessage(message, 'user');
    chatInput.value = '';

    // Simulate bot response
    setTimeout(() => {
        const response = getChatResponse(message);
        addChatMessage(response, 'bot');
    }, 1000);
});

function addChatMessage(text, sender) {
    // Remove quick replies if exists
    const quickReplies = chatMessages.querySelector('.chat-quick-replies');
    if (quickReplies) {
        quickReplies.remove();
    }

    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${sender}`;

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    messageDiv.innerHTML = `
        <div class="message-avatar">
            <i class="fas ${sender === 'bot' ? 'fa-robot' : 'fa-user'}"></i>
        </div>
        <div class="message-content">
            <p>${text}</p>
            <span class="message-time">${time}</span>
        </div>
    `;

    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function sendQuickReply(message) {
    addChatMessage(message, 'user');

    setTimeout(() => {
        const response = getChatResponse(message);
        addChatMessage(response, 'bot');
    }, 800);
}

function getChatResponse(message) {
    const lowerMessage = message.toLowerCase();

    // Emergency
    if (lowerMessage.includes('emergency') || lowerMessage.includes('urgent')) {
        return 'For emergencies, please call us immediately at <strong>(205) 595-4846</strong>. We offer 24/7 emergency service for HVAC and plumbing issues. A technician can be dispatched right away!';
    }

    // Schedule
    if (lowerMessage.includes('schedule') || lowerMessage.includes('appointment') || lowerMessage.includes('book')) {
        return 'I\'d be happy to help you schedule a service! You can click the "Schedule Service" button to fill out our online form, or call us at <strong>(205) 595-4846</strong>. What type of service do you need?';
    }

    // Quote/Estimate
    if (lowerMessage.includes('quote') || lowerMessage.includes('estimate') || lowerMessage.includes('price') || lowerMessage.includes('cost')) {
        return 'We provide free estimates for most services! The cost depends on the specific work needed. Would you like to schedule a free consultation? You can call us at <strong>(205) 595-4846</strong> or use our online scheduling form.';
    }

    // Hours
    if (lowerMessage.includes('hour') || lowerMessage.includes('open') || lowerMessage.includes('close')) {
        return 'Our office hours are <strong>Monday-Friday, 7:30 AM - 4:30 PM</strong>. However, we offer <strong>24/7 emergency service</strong> for urgent issues. Just call <strong>(205) 595-4846</strong> anytime!';
    }

    // HVAC
    if (lowerMessage.includes('ac') || lowerMessage.includes('air condition') || lowerMessage.includes('heat') || lowerMessage.includes('hvac') || lowerMessage.includes('furnace')) {
        return 'We provide comprehensive HVAC services including AC repair, heating repair, installations, duct cleaning, and indoor air quality solutions. We service all major brands. Would you like to schedule a service call?';
    }

    // Plumbing
    if (lowerMessage.includes('plumb') || lowerMessage.includes('pipe') || lowerMessage.includes('water') || lowerMessage.includes('drain') || lowerMessage.includes('leak')) {
        return 'Our plumbing services include repairs, water heater service, drain cleaning, sewer repair, gas line work, and water filtration systems. We can help with any plumbing issue! Would you like to schedule a visit?';
    }

    // Generator
    if (lowerMessage.includes('generator') || lowerMessage.includes('generac') || lowerMessage.includes('backup power')) {
        return 'We\'re authorized Generac dealers offering generator installation, repair, and maintenance. A whole-home generator ensures you never lose power during outages. Want to learn more or get a quote?';
    }

    // Location/Address
    if (lowerMessage.includes('location') || lowerMessage.includes('address') || lowerMessage.includes('where')) {
        return 'We\'re located at <strong>2880 Crestwood Blvd, Irondale, AL 35210</strong>. We serve Birmingham, Hoover, Mountain Brook, Homewood, Vestavia Hills, Trussville, and surrounding areas.';
    }

    // Default response
    return 'Thanks for reaching out! For the fastest assistance, please call us at <strong>(205) 595-4846</strong> or use our online scheduling form. Is there something specific I can help you with regarding HVAC, plumbing, or generators?';
}

// ============================================
// ANIMATED COUNTERS
// ============================================
const counters = document.querySelectorAll('.stat-number');
let countersAnimated = false;

function animateCounters() {
    if (countersAnimated) return;

    counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-count'));
        const duration = 2000;
        const step = target / (duration / 16);
        let current = 0;

        const updateCounter = () => {
            current += step;
            if (current < target) {
                counter.textContent = Math.floor(current).toLocaleString();
                requestAnimationFrame(updateCounter);
            } else {
                counter.textContent = target.toLocaleString();
            }
        };

        updateCounter();
    });

    countersAnimated = true;
}

// Intersection Observer for counters
const aboutSection = document.querySelector('.about');
const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            animateCounters();
        }
    });
}, { threshold: 0.5 });

if (aboutSection) {
    counterObserver.observe(aboutSection);
}

// ============================================
// SCROLL ANIMATIONS
// ============================================
const animateOnScroll = () => {
    const elements = document.querySelectorAll('.service-card, .feature-card, .contact-card');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, index * 100);
            }
        });
    }, { threshold: 0.1 });

    elements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.5s ease';
        observer.observe(el);
    });
};

// Initialize animations on DOM load
document.addEventListener('DOMContentLoaded', () => {
    animateOnScroll();
});

// ============================================
// SMOOTH SCROLL FOR ANCHOR LINKS
// ============================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;

        e.preventDefault();
        const target = document.querySelector(targetId);

        if (target) {
            const headerOffset = 80;
            const elementPosition = target.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// ============================================
// PHONE NUMBER FORMATTING
// ============================================
const phoneInputs = document.querySelectorAll('input[type="tel"]');
phoneInputs.forEach(input => {
    input.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 0) {
            if (value.length <= 3) {
                value = `(${value}`;
            } else if (value.length <= 6) {
                value = `(${value.slice(0, 3)}) ${value.slice(3)}`;
            } else {
                value = `(${value.slice(0, 3)}) ${value.slice(3, 6)}-${value.slice(6, 10)}`;
            }
        }
        e.target.value = value;
    });
});

// Make functions globally available
window.openScheduleModal = openScheduleModal;
window.closeScheduleModal = closeScheduleModal;
window.toggleChat = toggleChat;
window.sendQuickReply = sendQuickReply;
