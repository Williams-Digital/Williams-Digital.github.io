/* ============================================
   BROADCAST TOOLS — Shared Utilities
   ============================================ */

const CONFIG = {
    API_BASE: localStorage.getItem('bt_api_url') || 'https://broadcast-tools-server.onrender.com/api',
    HEALTH_CHECK_INTERVAL: 30000,
};

/* --- Backend Health Check --- */
const ServerStatus = {
    online: false,
    _led: null,
    _text: null,
    _interval: null,

    init() {
        this._led = document.getElementById('serverLed');
        this._text = document.getElementById('serverStatus');
        if (!this._led) return;
        this.check();
        this._interval = setInterval(() => this.check(), CONFIG.HEALTH_CHECK_INTERVAL);
    },

    async check() {
        try {
            const res = await fetch(`${CONFIG.API_BASE}/health`, {
                signal: AbortSignal.timeout(5000),
            });
            const data = await res.json();
            this.setOnline(data.status === 'ok');
        } catch {
            this.setOnline(false);
        }
    },

    setOnline(online) {
        this.online = online;
        if (!this._led) return;
        this._led.className = 'status-led' + (online ? ' active' : ' error');
        if (this._text) this._text.textContent = online ? 'Online' : 'Offline';
    },
};

/* --- Toast Notifications --- */
const Toast = {
    _container: null,

    _getContainer() {
        if (!this._container) {
            this._container = document.createElement('div');
            this._container.className = 'toast-container';
            document.body.appendChild(this._container);
        }
        return this._container;
    },

    show(message, type = 'info', duration = 4000) {
        const container = this._getContainer();
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;

        const icons = {
            success: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>',
            error: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
            info: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
        };

        toast.innerHTML = `${icons[type] || icons.info}<span>${message}</span>`;
        container.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('removing');
            toast.addEventListener('animationend', () => toast.remove());
        }, duration);
    },

    success(msg) { this.show(msg, 'success'); },
    error(msg) { this.show(msg, 'error', 6000); },
    info(msg) { this.show(msg, 'info'); },
};

/* --- Navigation --- */
function initNav() {
    // Highlight active page
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-links a').forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage) link.classList.add('active');
    });

    // Mobile menu toggle
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    if (menuBtn && navLinks) {
        menuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('mobile-active');
            menuBtn.classList.toggle('open');
        });

        // Close on link click
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('mobile-active');
                menuBtn.classList.remove('open');
            });
        });
    }
}

/* --- File Utilities --- */
function formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function getFileExtension(filename) {
    return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2).toLowerCase();
}

function getBaseName(filename) {
    const lastDot = filename.lastIndexOf('.');
    return lastDot > 0 ? filename.slice(0, lastDot) : filename;
}

function readFileAsArrayBuffer(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
    });
}

function readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

function readFileAsBinaryString(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsBinaryString(file);
    });
}

function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 10000);
}

function loadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
    });
}

/* --- Drag & Drop Zone --- */
function initDropZone(element, options = {}) {
    const { accept = '*', multiple = true, onFiles } = options;
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = accept;
    input.multiple = multiple;
    input.style.display = 'none';
    element.appendChild(input);

    element.addEventListener('click', () => input.click());
    input.addEventListener('change', () => {
        if (input.files.length > 0) {
            onFiles(Array.from(input.files));
            input.value = '';
        }
    });

    element.addEventListener('dragover', (e) => {
        e.preventDefault();
        element.classList.add('dragover');
    });

    element.addEventListener('dragleave', (e) => {
        e.preventDefault();
        element.classList.remove('dragover');
    });

    element.addEventListener('drop', (e) => {
        e.preventDefault();
        element.classList.remove('dragover');
        if (e.dataTransfer.files.length > 0) {
            onFiles(Array.from(e.dataTransfer.files));
        }
    });
}

/* --- Drag Reorder for File Lists --- */
function initDragReorder(container, onReorder) {
    let dragItem = null;
    let dragIndex = -1;

    container.addEventListener('dragstart', (e) => {
        const item = e.target.closest('[data-draggable]');
        if (!item) return;
        dragItem = item;
        dragIndex = [...container.children].indexOf(item);
        item.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
    });

    container.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        const target = e.target.closest('[data-draggable]');
        if (target && target !== dragItem) {
            const rect = target.getBoundingClientRect();
            const mid = rect.top + rect.height / 2;
            if (e.clientY < mid) {
                container.insertBefore(dragItem, target);
            } else {
                container.insertBefore(dragItem, target.nextSibling);
            }
        }
    });

    container.addEventListener('dragend', () => {
        if (dragItem) {
            dragItem.classList.remove('dragging');
            const newIndex = [...container.children].indexOf(dragItem);
            if (newIndex !== dragIndex && onReorder) {
                onReorder(dragIndex, newIndex);
            }
            dragItem = null;
            dragIndex = -1;
        }
    });
}

/* --- Tab Switching --- */
function initTabs(container) {
    const buttons = container.querySelectorAll('.tab-btn');
    const parent = container.closest('.broadcast-panel') || container.parentElement;
    const contents = parent.querySelectorAll('.tab-content');

    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            buttons.forEach(b => b.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));
            btn.classList.add('active');
            const target = parent.querySelector(`.tab-content[data-tab="${btn.dataset.tab}"]`);
            if (target) target.classList.add('active');
        });
    });
}

/* --- Duration Formatting --- */
function formatDuration(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    return `${m}:${String(s).padStart(2, '0')}`;
}

/* --- Init on DOM Ready --- */
document.addEventListener('DOMContentLoaded', () => {
    initNav();
    ServerStatus.init();
});
