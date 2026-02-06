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
// SCHEDULE MODAL - MULTI-STEP WIZARD
// ============================================
let currentStep = 1;
const totalSteps = 4;
let wizardData = {
    service: null,
    serviceName: null,
    urgency: 'standard',
    name: '',
    phone: '',
    email: '',
    address: '',
    date: null,
    dateFriendly: '',
    time: null,
    notes: ''
};
let wizardInitialized = false;

function openScheduleModal() {
    scheduleModal.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Only initialize once
    if (!wizardInitialized) {
        initWizard();
        wizardInitialized = true;
    }

    resetWizard();
    updateDatePicker();
}

function closeScheduleModal() {
    scheduleModal.classList.remove('active');
    document.body.style.overflow = '';
}

function resetWizard() {
    currentStep = 1;
    wizardData = {
        service: null,
        serviceName: null,
        urgency: 'standard',
        name: '',
        phone: '',
        email: '',
        address: '',
        date: null,
        dateFriendly: '',
        time: null,
        notes: ''
    };

    // Reset UI
    document.querySelectorAll('.wizard-step').forEach(step => step.classList.remove('active'));
    document.getElementById('step-1').classList.add('active');
    document.querySelectorAll('.progress-step').forEach(step => {
        step.classList.remove('active', 'completed');
    });
    document.querySelector('.progress-step[data-step="1"]').classList.add('active');
    document.getElementById('progress-fill').style.width = '25%';

    // Reset selections
    document.querySelectorAll('.service-option').forEach(opt => opt.classList.remove('selected'));
    document.querySelectorAll('.urgency-option').forEach(opt => opt.classList.remove('selected'));
    document.querySelectorAll('.date-pick').forEach(opt => opt.classList.remove('selected'));
    document.querySelectorAll('.time-slot').forEach(opt => opt.classList.remove('selected'));

    // Reset forms
    const contactForm = document.getElementById('contact-details-form');
    if (contactForm) contactForm.reset();

    // Clear form inputs
    const inputs = document.querySelectorAll('.wizard-form input, .wizard-form textarea');
    inputs.forEach(input => {
        input.value = '';
        input.classList.remove('error');
    });

    // Clear error messages
    document.querySelectorAll('.field-error').forEach(el => el.textContent = '');

    // Hide emergency alert
    const emergencyAlert = document.getElementById('emergency-alert');
    if (emergencyAlert) emergencyAlert.classList.remove('active');

    // Disable next button
    const nextBtn = document.getElementById('step1-next');
    if (nextBtn) nextBtn.disabled = true;

    // Reset category tabs to HVAC
    document.querySelectorAll('.category-tab').forEach(t => t.classList.remove('active'));
    const hvacTab = document.querySelector('.category-tab[data-category="hvac"]');
    if (hvacTab) hvacTab.classList.add('active');

    document.querySelectorAll('.service-options').forEach(opts => opts.classList.remove('active'));
    const hvacServices = document.getElementById('services-hvac');
    if (hvacServices) hvacServices.classList.add('active');
}

function updateDatePicker() {
    // Initialize date picker
    const dateInput = document.getElementById('w-date');
    if (dateInput) {
        const today = new Date();
        dateInput.min = today.toISOString().split('T')[0];
        dateInput.value = '';
    }

    // Set day names for quick picks
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    for (let i = 2; i <= 4; i++) {
        const futureDate = new Date(today);
        futureDate.setDate(today.getDate() + i);
        const dayEl = document.getElementById(`day-${i}`);
        if (dayEl) {
            dayEl.textContent = dayNames[futureDate.getDay()];
        }
    }
}

function initWizard() {
    console.log('Initializing wizard...');

    // Service category tabs
    document.querySelectorAll('.category-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            const category = this.dataset.category;
            console.log('Category clicked:', category);

            document.querySelectorAll('.category-tab').forEach(t => t.classList.remove('active'));
            this.classList.add('active');

            document.querySelectorAll('.service-options').forEach(opts => opts.classList.remove('active'));
            const targetServices = document.getElementById(`services-${category}`);
            if (targetServices) {
                targetServices.classList.add('active');
            }
        });
    });

    // Service options - this is the key fix
    document.querySelectorAll('.service-option').forEach(option => {
        option.addEventListener('click', function() {
            console.log('Service clicked:', this.dataset.service);

            // Remove selected from all options across all categories
            document.querySelectorAll('.service-option').forEach(opt => opt.classList.remove('selected'));

            // Add selected to clicked option
            this.classList.add('selected');

            // Update wizard data
            wizardData.service = this.dataset.service;
            wizardData.serviceName = this.dataset.name;

            console.log('wizardData updated:', wizardData.service, wizardData.serviceName);

            // Enable the next button
            updateNextButton();
        });
    });

    // Urgency options
    document.querySelectorAll('.urgency-option').forEach(option => {
        option.addEventListener('click', function() {
            console.log('Urgency clicked:', this.dataset.urgency);

            document.querySelectorAll('.urgency-option').forEach(opt => opt.classList.remove('selected'));
            this.classList.add('selected');
            wizardData.urgency = this.dataset.urgency;

            // Show emergency alert if emergency selected
            if (wizardData.urgency === 'emergency') {
                const emergencyAlert = document.getElementById('emergency-alert');
                if (emergencyAlert) {
                    emergencyAlert.classList.add('active');
                }
            }
        });
    });

    // Date quick picks
    document.querySelectorAll('.date-pick').forEach(pick => {
        pick.addEventListener('click', () => {
            document.querySelectorAll('.date-pick').forEach(p => p.classList.remove('selected'));
            pick.classList.add('selected');

            const days = parseInt(pick.dataset.days);
            const selectedDate = new Date();
            selectedDate.setDate(selectedDate.getDate() + days);
            wizardData.date = selectedDate.toISOString().split('T')[0];
            wizardData.dateFriendly = selectedDate.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric'
            });

            // Clear custom date
            document.getElementById('w-date').value = '';
        });
    });

    // Custom date picker
    document.getElementById('w-date').addEventListener('change', (e) => {
        document.querySelectorAll('.date-pick').forEach(p => p.classList.remove('selected'));
        const selectedDate = new Date(e.target.value + 'T12:00:00');
        wizardData.date = e.target.value;
        wizardData.dateFriendly = selectedDate.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric'
        });
    });

    // Time slots
    document.querySelectorAll('.time-slot').forEach(slot => {
        slot.addEventListener('click', () => {
            document.querySelectorAll('.time-slot').forEach(s => s.classList.remove('selected'));
            slot.classList.add('selected');
            wizardData.time = slot.dataset.time;
        });
    });

    // Real-time form validation
    const formInputs = document.querySelectorAll('#contact-details-form input');
    formInputs.forEach(input => {
        input.addEventListener('blur', () => validateField(input));
        input.addEventListener('input', () => {
            if (input.classList.contains('error')) {
                validateField(input);
            }
        });
    });
}

function updateNextButton() {
    const nextBtn = document.getElementById('step1-next');
    if (nextBtn) {
        const shouldEnable = wizardData.service !== null && wizardData.service !== '';
        nextBtn.disabled = !shouldEnable;
        console.log('Next button updated - service:', wizardData.service, 'disabled:', nextBtn.disabled);
    }
}

function dismissEmergency() {
    document.getElementById('emergency-alert').classList.remove('active');
}

function validateField(input) {
    const errorEl = input.nextElementSibling;
    let isValid = true;
    let errorMsg = '';

    if (input.required && !input.value.trim()) {
        isValid = false;
        errorMsg = 'This field is required';
    } else if (input.type === 'email' && input.value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(input.value)) {
            isValid = false;
            errorMsg = 'Please enter a valid email';
        }
    } else if (input.type === 'tel' && input.value) {
        const phoneRegex = /^[\d\s\-\(\)]{10,}$/;
        if (!phoneRegex.test(input.value.replace(/\D/g, '')) || input.value.replace(/\D/g, '').length < 10) {
            isValid = false;
            errorMsg = 'Please enter a valid phone number';
        }
    }

    if (isValid) {
        input.classList.remove('error');
        if (errorEl) errorEl.textContent = '';
    } else {
        input.classList.add('error');
        if (errorEl) errorEl.textContent = errorMsg;
    }

    return isValid;
}

function validateStep(step) {
    if (step === 2) {
        const inputs = document.querySelectorAll('#contact-details-form input[required]');
        let allValid = true;
        inputs.forEach(input => {
            if (!validateField(input)) {
                allValid = false;
            }
        });

        if (allValid) {
            wizardData.name = document.getElementById('w-name').value;
            wizardData.phone = document.getElementById('w-phone').value;
            wizardData.email = document.getElementById('w-email').value;
            wizardData.address = document.getElementById('w-address').value;
        }

        return allValid;
    }
    return true;
}

function nextStep() {
    if (!validateStep(currentStep)) {
        return;
    }

    if (currentStep < totalSteps) {
        // Mark current step as completed
        document.querySelector(`.progress-step[data-step="${currentStep}"]`).classList.remove('active');
        document.querySelector(`.progress-step[data-step="${currentStep}"]`).classList.add('completed');

        currentStep++;

        // Show next step
        document.querySelectorAll('.wizard-step').forEach(step => step.classList.remove('active'));
        document.getElementById(`step-${currentStep}`).classList.add('active');

        // Update progress
        document.querySelector(`.progress-step[data-step="${currentStep}"]`).classList.add('active');
        document.getElementById('progress-fill').style.width = `${(currentStep / totalSteps) * 100}%`;

        // If moving to confirmation, populate summary
        if (currentStep === 4) {
            populateConfirmation();
        }

        // Get notes before moving to step 4
        if (currentStep === 4) {
            wizardData.notes = document.getElementById('w-notes').value;
        }
    }
}

function prevStep() {
    if (currentStep > 1) {
        document.querySelector(`.progress-step[data-step="${currentStep}"]`).classList.remove('active');

        currentStep--;

        document.querySelectorAll('.wizard-step').forEach(step => step.classList.remove('active'));
        document.getElementById(`step-${currentStep}`).classList.add('active');

        document.querySelector(`.progress-step[data-step="${currentStep}"]`).classList.remove('completed');
        document.querySelector(`.progress-step[data-step="${currentStep}"]`).classList.add('active');
        document.getElementById('progress-fill').style.width = `${(currentStep / totalSteps) * 100}%`;
    }
}

function populateConfirmation() {
    // Service
    document.getElementById('confirm-service').textContent = wizardData.serviceName || 'Not selected';

    // Urgency badge
    const urgencyBadge = document.getElementById('confirm-urgency');
    const urgencyLabels = {
        'standard': 'Standard',
        'soon': 'Within 2-3 days',
        'urgent': 'Urgent',
        'emergency': 'Emergency'
    };
    urgencyBadge.textContent = urgencyLabels[wizardData.urgency] || 'Standard';
    urgencyBadge.className = 'summary-badge';
    if (wizardData.urgency === 'urgent') urgencyBadge.classList.add('urgent');
    if (wizardData.urgency === 'emergency') urgencyBadge.classList.add('emergency');

    // Contact info
    document.getElementById('confirm-name').textContent = wizardData.name || '-';
    document.getElementById('confirm-contact').textContent = `${wizardData.phone} | ${wizardData.email}`;

    // Address
    document.getElementById('confirm-address').textContent = wizardData.address || '-';

    // Date/Time
    const timeLabels = {
        'morning': 'Morning (8am-12pm)',
        'afternoon': 'Afternoon (12pm-4pm)',
        'flexible': 'Flexible'
    };
    const dateStr = wizardData.dateFriendly || 'Flexible';
    const timeStr = timeLabels[wizardData.time] || 'Flexible';
    document.getElementById('confirm-datetime').textContent = `${dateStr}, ${timeStr}`;

    // Notes
    const notesSection = document.getElementById('confirm-notes-section');
    if (wizardData.notes && wizardData.notes.trim()) {
        notesSection.classList.add('visible');
        document.getElementById('confirm-notes').textContent = wizardData.notes;
    } else {
        notesSection.classList.remove('visible');
    }
}

function submitSchedule() {
    const submitBtn = document.getElementById('submit-btn');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';

    // Simulate API call
    setTimeout(() => {
        // Log the data (in production, send to server)
        console.log('Schedule submission:', wizardData);

        // Show success step
        document.querySelectorAll('.wizard-step').forEach(step => step.classList.remove('active'));
        document.getElementById('step-success').classList.add('active');

        // Update success details
        document.getElementById('success-name').textContent = wizardData.name.split(' ')[0];
        document.getElementById('success-email').textContent = wizardData.email;

        // Mark all steps as completed
        document.querySelectorAll('.progress-step').forEach(step => {
            step.classList.remove('active');
            step.classList.add('completed');
        });
        document.getElementById('progress-fill').style.width = '100%';

        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-calendar-check"></i> Confirm Request';
    }, 1500);
}

// Close modal on escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && scheduleModal.classList.contains('active')) {
        closeScheduleModal();
    }
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

// ============================================
// INTERACTIVE MAP & LIST SYNC
// ============================================
const initMapInteraction = () => {
    const mapAreas = document.querySelectorAll('.map-area');
    const areaItems = document.querySelectorAll('.area-item[data-city]');
    const areasMap = document.querySelector('.areas-map');

    // City display names for tooltips
    const cityNames = {
        'birmingham': 'Birmingham Metro',
        'hoover': 'Hoover',
        'mountain-brook': 'Mountain Brook',
        'homewood': 'Homewood',
        'vestavia': 'Vestavia Hills',
        'trussville': 'Trussville',
        'irondale': 'Irondale (HQ)'
    };

    // Create tooltip element
    const tooltip = document.createElement('div');
    tooltip.className = 'map-tooltip';
    if (areasMap) {
        areasMap.appendChild(tooltip);
    }

    // Map area hover - highlight corresponding list item
    mapAreas.forEach(area => {
        const city = area.getAttribute('data-city');

        area.addEventListener('mouseenter', (e) => {
            // Highlight list item
            areaItems.forEach(item => {
                if (item.getAttribute('data-city') === city) {
                    item.classList.add('active');
                }
            });

            // Show tooltip
            const rect = area.getBoundingClientRect();
            const mapRect = areasMap.getBoundingClientRect();
            tooltip.textContent = cityNames[city] || city;
            tooltip.style.left = `${rect.left - mapRect.left + rect.width / 2}px`;
            tooltip.style.top = `${rect.top - mapRect.top - 10}px`;
            tooltip.classList.add('visible');
        });

        area.addEventListener('mouseleave', () => {
            // Remove highlight
            areaItems.forEach(item => item.classList.remove('active'));
            // Hide tooltip
            tooltip.classList.remove('visible');
        });

        // Click to scroll to schedule
        area.addEventListener('click', () => {
            openScheduleModal();
        });
    });

    // List item hover - highlight corresponding map area
    areaItems.forEach(item => {
        const city = item.getAttribute('data-city');

        item.addEventListener('mouseenter', () => {
            mapAreas.forEach(area => {
                if (area.getAttribute('data-city') === city) {
                    area.classList.add('active');
                }
            });
        });

        item.addEventListener('mouseleave', () => {
            mapAreas.forEach(area => area.classList.remove('active'));
        });

        // Click to schedule
        item.addEventListener('click', () => {
            openScheduleModal();
        });
    });
};

// Initialize map interaction on DOM load
document.addEventListener('DOMContentLoaded', () => {
    initMapInteraction();
});
