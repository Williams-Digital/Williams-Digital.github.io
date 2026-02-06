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

    // Calendar view toggle (Month/Week/Day)
    const viewBtns = document.querySelectorAll('.view-btn');
    const calendarViews = document.querySelectorAll('.calendar-view');
    const calendarTitle = document.querySelector('.calendar-title');

    viewBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const view = this.getAttribute('data-view');

            // Update active button
            viewBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            // Show corresponding view
            calendarViews.forEach(v => v.classList.remove('active'));
            const targetView = document.getElementById(view + 'View');
            if (targetView) targetView.classList.add('active');

            // Update title based on view
            if (calendarTitle) {
                switch(view) {
                    case 'month':
                        calendarTitle.textContent = 'February 2025';
                        break;
                    case 'week':
                        calendarTitle.textContent = 'Feb 9 - 15, 2025';
                        break;
                    case 'day':
                        calendarTitle.textContent = 'February 12, 2025';
                        break;
                }
            }
        });
    });

    // Player roster selection
    const rosterPlayers = document.querySelectorAll('.roster-player');
    const selectedPlayerHeader = document.querySelector('.selected-player-header');
    const scheduleWithPlayerBtn = document.querySelector('.schedule-with-player');
    const upcomingEventsTitle = document.querySelector('.upcoming-events h4');

    const playerData = {
        'marcus-johnson': { name: 'Marcus Johnson', initials: 'MJ', team: 'Houston Texans', position: 'QB', color: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' },
        'darius-williams': { name: 'Darius Williams', initials: 'DW', team: 'Dallas Cowboys', position: 'RB', color: 'linear-gradient(135deg, #22c55e, #16a34a)' },
        'jaylen-carter': { name: 'Jaylen Carter', initials: 'JC', team: 'Philadelphia Eagles', position: 'DT', color: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' },
        'chris-thompson': { name: 'Chris Thompson', initials: 'CT', team: 'Miami Dolphins', position: 'WR', color: 'linear-gradient(135deg, #f59e0b, #d97706)' },
        'andre-davis': { name: 'Andre Davis', initials: 'AD', team: 'Kansas City Chiefs', position: 'LB', color: 'linear-gradient(135deg, #ef4444, #dc2626)' },
        'kevin-moore': { name: 'Kevin Moore', initials: 'KM', team: 'Baltimore Ravens', position: 'CB', color: 'linear-gradient(135deg, #06b6d4, #0891b2)' },
        'brandon-lee': { name: 'Brandon Lee', initials: 'BL', team: 'San Francisco 49ers', position: 'TE', color: 'linear-gradient(135deg, #ec4899, #db2777)' },
        'tyler-jackson': { name: 'Tyler Jackson', initials: 'TJ', team: 'Buffalo Bills', position: 'S', color: 'linear-gradient(135deg, #84cc16, #65a30d)' }
    };

    function selectPlayer(playerId) {
        const player = playerData[playerId];
        if (!player) return;

        // Update roster selection
        rosterPlayers.forEach(p => p.classList.remove('selected'));
        const selectedRosterPlayer = document.querySelector(`.roster-player[data-player="${playerId}"]`);
        if (selectedRosterPlayer) selectedRosterPlayer.classList.add('selected');

        // Update header
        if (selectedPlayerHeader) {
            const avatar = selectedPlayerHeader.querySelector('.player-avatar');
            const nameEl = selectedPlayerHeader.querySelector('h3');
            const teamEl = selectedPlayerHeader.querySelector('p');

            if (avatar) {
                avatar.style.background = player.color;
                avatar.textContent = player.initials;
            }
            if (nameEl) nameEl.textContent = player.name;
            if (teamEl) teamEl.textContent = `${player.position} | ${player.team}`;
        }

        // Update button text
        if (scheduleWithPlayerBtn) {
            const firstName = player.name.split(' ')[0];
            scheduleWithPlayerBtn.querySelector('span').textContent = `Schedule with ${firstName}`;
        }

        // Update events title
        if (upcomingEventsTitle) {
            upcomingEventsTitle.textContent = `Upcoming with ${player.name}`;
        }

        // Update modal player selection
        const modalRadio = document.querySelector(`input[name="player"][value="${playerId}"]`);
        if (modalRadio) modalRadio.checked = true;
        updateModalPlayerSelection();
    }

    rosterPlayers.forEach(player => {
        player.addEventListener('click', function() {
            const playerId = this.getAttribute('data-player');
            selectPlayer(playerId);
        });
    });

    // Schedule with player button
    if (scheduleWithPlayerBtn) {
        scheduleWithPlayerBtn.addEventListener('click', openModal);
    }

    // Player selection in modal
    const playerSelectOptions = document.querySelectorAll('.player-select-option');

    function updateModalPlayerSelection() {
        playerSelectOptions.forEach(option => {
            const radio = option.querySelector('input[type="radio"]');
            if (radio.checked) {
                option.classList.add('selected');
            } else {
                option.classList.remove('selected');
            }
        });
    }

    playerSelectOptions.forEach(option => {
        option.addEventListener('click', function() {
            updateModalPlayerSelection();
        });
    });

    // Roster search
    const rosterSearch = document.querySelector('.roster-search input');
    if (rosterSearch) {
        rosterSearch.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            rosterPlayers.forEach(player => {
                const name = player.querySelector('.player-name').textContent.toLowerCase();
                const team = player.querySelector('.player-team').textContent.toLowerCase();
                if (name.includes(searchTerm) || team.includes(searchTerm)) {
                    player.style.display = 'flex';
                } else {
                    player.style.display = 'none';
                }
            });
        });
    }

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

    // Time-based greeting
    function updateGreeting() {
        const greetingEl = document.getElementById('greetingTime');
        if (!greetingEl) return;

        const hour = new Date().getHours();
        let greeting;

        if (hour < 12) {
            greeting = 'Good morning,';
        } else if (hour < 17) {
            greeting = 'Good afternoon,';
        } else {
            greeting = 'Good evening,';
        }

        greetingEl.textContent = greeting;
    }

    // Current date display
    function updateCurrentDate() {
        const dateEl = document.getElementById('currentDate');
        if (!dateEl) return;

        const options = { weekday: 'long', month: 'long', day: 'numeric' };
        const today = new Date();
        dateEl.textContent = today.toLocaleDateString('en-US', options);
    }

    // Quick action buttons
    const quickActionBtns = document.querySelectorAll('.quick-action-btn');
    quickActionBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const section = this.getAttribute('data-section');
            if (section) {
                showSection(section);
            }
        });
    });

    // Join meeting button
    const joinMeetingBtn = document.querySelector('.join-meeting-btn');
    if (joinMeetingBtn) {
        joinMeetingBtn.addEventListener('click', function() {
            alert('Joining video call...');
        });
    }

    // Initialize greeting and date
    updateGreeting();
    updateCurrentDate();

    // Initialize
    checkAuth();
});
