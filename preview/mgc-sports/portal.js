// MGC Sports Player Portal - JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const loginScreen = document.getElementById('loginScreen');
    const dashboard = document.getElementById('dashboard');
    const loginForm = document.getElementById('loginForm');
    const logoutBtn = document.getElementById('logoutBtn');
    const sidebar = document.querySelector('.sidebar');
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const navItems = document.querySelectorAll('.nav-item[data-section]');
    const sections = document.querySelectorAll('.section');
    const meetingModal = document.getElementById('meetingModal');
    const newMeetingBtn = document.getElementById('newMeetingBtn');
    const closeModalBtn = document.getElementById('closeModal');
    const cancelModalBtn = document.getElementById('cancelModal');

    // Check if user is "logged in" (demo purposes)
    function checkAuth() {
        const isLoggedIn = sessionStorage.getItem('mgc_logged_in');
        if (isLoggedIn) {
            showDashboard();
        }
    }

    // Login handling
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            // Demo login - in production, this would validate credentials
            sessionStorage.setItem('mgc_logged_in', 'true');
            showDashboard();
        });
    }

    // Show dashboard
    function showDashboard() {
        if (loginScreen) loginScreen.style.display = 'none';
        if (dashboard) dashboard.style.display = 'flex';
    }

    // Logout handling
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            sessionStorage.removeItem('mgc_logged_in');
            if (loginScreen) loginScreen.style.display = 'flex';
            if (dashboard) dashboard.style.display = 'none';
        });
    }

    // Mobile menu toggle
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', function() {
            sidebar.classList.toggle('active');
        });
    }

    // Navigation
    function showSection(sectionId) {
        sections.forEach(section => {
            section.classList.remove('active');
        });

        navItems.forEach(item => {
            item.classList.remove('active');
        });

        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');
        }

        const targetNavItem = document.querySelector(`.nav-item[data-section="${sectionId}"]`);
        if (targetNavItem) {
            targetNavItem.classList.add('active');
        }

        // Close mobile menu
        sidebar.classList.remove('active');
    }

    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.getAttribute('data-section');
            showSection(section);
        });
    });

    // Handle view all links and action buttons
    document.querySelectorAll('.view-all, .action-btn, .agent-actions .btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.getAttribute('data-section');
            if (section) {
                showSection(section);
            }
        });
    });

    // Modal handling
    function openModal() {
        if (meetingModal) {
            meetingModal.classList.add('active');
        }
    }

    function closeModal() {
        if (meetingModal) {
            meetingModal.classList.remove('active');
        }
    }

    if (newMeetingBtn) {
        newMeetingBtn.addEventListener('click', openModal);
    }

    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeModal);
    }

    if (cancelModalBtn) {
        cancelModalBtn.addEventListener('click', closeModal);
    }

    // Close modal on overlay click
    if (meetingModal) {
        meetingModal.querySelector('.modal-overlay').addEventListener('click', closeModal);
    }

    // Modal form submission
    const modalForm = meetingModal?.querySelector('.modal-form');
    if (modalForm) {
        modalForm.addEventListener('submit', function(e) {
            e.preventDefault();
            // In production, this would send to server
            alert('Meeting scheduled successfully!');
            closeModal();
            this.reset();
        });
    }

    // Chat functionality
    const chatInput = document.querySelector('.chat-input input');
    const sendBtn = document.querySelector('.send-btn');
    const chatMessages = document.querySelector('.chat-messages');

    function sendMessage() {
        if (!chatInput || !chatMessages) return;

        const message = chatInput.value.trim();
        if (!message) return;

        // Create message element
        const messageEl = document.createElement('div');
        messageEl.className = 'message sent';
        messageEl.innerHTML = `
            <div class="message-bubble">
                <p>${escapeHtml(message)}</p>
                <span class="message-timestamp">${formatTime(new Date())}</span>
            </div>
        `;

        chatMessages.appendChild(messageEl);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        chatInput.value = '';

        // Simulate response after delay
        setTimeout(() => {
            const responses = [
                "Thanks for the message! I'll get back to you shortly.",
                "Got it! Let me look into that for you.",
                "Absolutely, I'll have that information ready for our call.",
                "Perfect, I'll make a note of that."
            ];
            const randomResponse = responses[Math.floor(Math.random() * responses.length)];

            const responseEl = document.createElement('div');
            responseEl.className = 'message received';
            responseEl.innerHTML = `
                <div class="message-bubble">
                    <p>${randomResponse}</p>
                    <span class="message-timestamp">${formatTime(new Date())}</span>
                </div>
            `;

            chatMessages.appendChild(responseEl);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }, 1500);
    }

    if (sendBtn) {
        sendBtn.addEventListener('click', sendMessage);
    }

    if (chatInput) {
        chatInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }

    // Conversation switching
    const conversations = document.querySelectorAll('.conversation');
    conversations.forEach(conv => {
        conv.addEventListener('click', function() {
            conversations.forEach(c => c.classList.remove('active'));
            this.classList.add('active');
            // Remove unread dot when clicked
            const dot = this.querySelector('.unread-dot');
            if (dot) dot.remove();
        });
    });

    // Calendar day selection
    const calendarDays = document.querySelectorAll('.calendar-day:not(.other)');
    calendarDays.forEach(day => {
        day.addEventListener('click', function() {
            calendarDays.forEach(d => d.classList.remove('selected'));
            this.classList.add('selected');
        });
    });

    // Settings form handling
    const settingsForms = document.querySelectorAll('.settings-form');
    settingsForms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            const btn = this.querySelector('button');
            const originalText = btn.innerHTML;
            btn.innerHTML = '<span>Saved!</span>';
            btn.style.background = '#22c55e';
            setTimeout(() => {
                btn.innerHTML = originalText;
                btn.style.background = '';
            }, 2000);
        });
    });

    // Utility functions
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function formatTime(date) {
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    }

    // Notification button
    const notificationBtn = document.querySelector('.notification-btn');
    if (notificationBtn) {
        notificationBtn.addEventListener('click', function() {
            const dot = this.querySelector('.notification-dot');
            if (dot) dot.style.display = 'none';
            // In production, would show notification panel
            alert('No new notifications');
        });
    }

    // Document cards
    const documentCards = document.querySelectorAll('.document-card');
    documentCards.forEach(card => {
        card.addEventListener('click', function() {
            const title = this.querySelector('h4').textContent;
            alert(`Opening: ${title}`);
        });
    });

    // Resource cards
    const resourceCards = document.querySelectorAll('.resource-card');
    resourceCards.forEach(card => {
        card.addEventListener('click', function() {
            const title = this.querySelector('h4').textContent;
            alert(`Opening resource: ${title}`);
        });
    });

    // Initialize
    checkAuth();
});
