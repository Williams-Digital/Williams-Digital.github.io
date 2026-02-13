/* ============================================
   BROADCAST TOOLS — YouTube Downloader
   ============================================ */

(function () {
    const YOUTUBE_REGEX = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|shorts\/|live\/)|youtu\.be\/)[a-zA-Z0-9_-]+/;

    // DOM refs
    const urlInput = document.getElementById('urlInput');
    const pasteBtn = document.getElementById('pasteBtn');
    const fetchBtn = document.getElementById('fetchBtn');
    const urlLed = document.getElementById('urlLed');
    const offlineWarning = document.getElementById('offlineWarning');

    const infoPanel = document.getElementById('infoPanel');
    const videoThumb = document.getElementById('videoThumb');
    const videoTitle = document.getElementById('videoTitle');
    const videoChannel = document.getElementById('videoChannel');
    const videoDuration = document.getElementById('videoDuration');
    const videoId = document.getElementById('videoId');

    const formatPanel = document.getElementById('formatPanel');
    const formatToggle = document.getElementById('formatToggle');
    const qualitySelect = document.getElementById('qualitySelect');
    const qualityGroup = document.getElementById('qualityGroup');

    const downloadPanel = document.getElementById('downloadPanel');
    const downloadBtn = document.getElementById('downloadBtn');
    const downloadLed = document.getElementById('downloadLed');
    const progressSection = document.getElementById('progressSection');
    const progressFill = document.getElementById('progressFill');
    const progressLabel = document.getElementById('progressLabel');
    const statusReadout = document.getElementById('statusReadout');
    const downloadLinkContainer = document.getElementById('downloadLinkContainer');
    const downloadLink = document.getElementById('downloadLink');

    let currentFormat = 'mp4';
    let videoData = null;
    let downloading = false;

    // --- Server status check for offline warning ---
    const origSetOnline = ServerStatus.setOnline.bind(ServerStatus);
    ServerStatus.setOnline = function (online) {
        origSetOnline(online);
        offlineWarning.classList.toggle('hidden', online);
        fetchBtn.disabled = !online || !isValidUrl();
    };

    // --- URL validation ---
    function isValidUrl() {
        return YOUTUBE_REGEX.test(urlInput.value.trim());
    }

    urlInput.addEventListener('input', () => {
        const valid = isValidUrl();
        urlLed.className = 'status-led' + (valid ? ' active' : '');
        fetchBtn.disabled = !valid || !ServerStatus.online;
    });

    urlInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !fetchBtn.disabled) {
            fetchBtn.click();
        }
    });

    // --- Paste button ---
    pasteBtn.addEventListener('click', async () => {
        try {
            const text = await navigator.clipboard.readText();
            urlInput.value = text;
            urlInput.dispatchEvent(new Event('input'));
        } catch {
            Toast.error('Could not read clipboard. Try pasting manually.');
        }
    });

    // --- Format toggle ---
    formatToggle.addEventListener('click', (e) => {
        const btn = e.target.closest('.toggle-option');
        if (!btn) return;
        formatToggle.querySelectorAll('.toggle-option').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFormat = btn.dataset.value;
        updateQualityOptions();
    });

    function updateQualityOptions() {
        qualitySelect.innerHTML = '';

        if (currentFormat === 'mp3') {
            qualityGroup.querySelector('.form-label').textContent = 'Audio Quality';
            const options = [
                { value: '320', label: '320 kbps (Best)' },
                { value: '192', label: '192 kbps' },
                { value: '128', label: '128 kbps' },
            ];
            options.forEach(opt => {
                const el = document.createElement('option');
                el.value = opt.value;
                el.textContent = opt.label;
                qualitySelect.appendChild(el);
            });
        } else {
            qualityGroup.querySelector('.form-label').textContent = 'Video Quality';
            const options = [
                { value: 'best', label: 'Best Available' },
                { value: '2160', label: '4K (2160p)' },
                { value: '1440', label: '1440p' },
                { value: '1080', label: '1080p (Full HD)' },
                { value: '720', label: '720p (HD)' },
                { value: '480', label: '480p' },
            ];
            options.forEach(opt => {
                const el = document.createElement('option');
                el.value = opt.value;
                el.textContent = opt.label;
                qualitySelect.appendChild(el);
            });
        }
    }

    // --- Fetch video info ---
    fetchBtn.addEventListener('click', async () => {
        const url = urlInput.value.trim();
        if (!url) return;

        fetchBtn.disabled = true;
        fetchBtn.textContent = 'Fetching...';
        statusReadout.textContent = '';
        resetDownloadUI();

        try {
            const res = await fetch(`${CONFIG.API_BASE}/youtube/info`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url }),
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || 'Failed to fetch video info');
            }

            videoData = await res.json();

            // Populate info panel
            videoThumb.src = videoData.thumbnail;
            videoTitle.textContent = videoData.title;
            videoChannel.textContent = videoData.channel;
            videoDuration.textContent = videoData.duration ? formatDuration(videoData.duration) : '';
            videoId.textContent = videoData.id;

            infoPanel.classList.remove('hidden');
            formatPanel.classList.remove('hidden');
            downloadPanel.classList.remove('hidden');

            updateQualityOptions();
            Toast.success('Video info loaded');
        } catch (err) {
            Toast.error(err.message);
            videoData = null;
        } finally {
            fetchBtn.disabled = !ServerStatus.online || !isValidUrl();
            fetchBtn.textContent = 'Fetch Info';
        }
    });

    // --- Download ---
    downloadBtn.addEventListener('click', () => {
        if (downloading || !videoData) return;
        startDownload();
    });

    function startDownload() {
        const url = urlInput.value.trim();
        const quality = qualitySelect.value;

        downloading = true;
        downloadBtn.disabled = true;
        downloadBtn.textContent = 'Downloading...';
        downloadLed.className = 'status-led warning';
        progressSection.classList.remove('hidden');
        downloadLinkContainer.classList.add('hidden');
        progressFill.style.width = '0%';
        progressLabel.textContent = '0%';
        statusReadout.textContent = 'Connecting...';

        const params = new URLSearchParams({ url, format: currentFormat, quality });
        const eventSource = new EventSource(`${CONFIG.API_BASE}/youtube/download/progress?${params}`);

        eventSource.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                updateProgress(data);
            } catch { }
        };

        eventSource.addEventListener('complete', (event) => {
            eventSource.close();
            try {
                const data = JSON.parse(event.data);
                onDownloadComplete(data);
            } catch {
                onDownloadError('Download completed but could not parse response');
            }
        });

        eventSource.addEventListener('error', (event) => {
            eventSource.close();
            try {
                const data = JSON.parse(event.data);
                onDownloadError(data.error || 'Download failed');
            } catch {
                onDownloadError('Connection lost');
            }
        });

        eventSource.onerror = () => {
            if (eventSource.readyState === EventSource.CLOSED) return;
            eventSource.close();
            onDownloadError('Connection to server lost');
        };
    }

    function updateProgress(data) {
        const percent = data.percent || 0;
        progressFill.style.width = Math.min(percent, 100) + '%';
        progressLabel.textContent = Math.round(percent) + '%';

        let statusParts = [];
        if (data.status === 'merging') {
            statusParts.push('Merging video + audio...');
        } else if (data.status === 'processing') {
            statusParts.push('Processing audio...');
        } else {
            if (data.speed) statusParts.push(data.speed);
            if (data.totalSize) statusParts.push(data.totalSize);
            if (data.eta && data.eta !== 'Unknown') statusParts.push('ETA ' + data.eta);
        }
        statusReadout.textContent = statusParts.join('  |  ');
    }

    function onDownloadComplete(data) {
        downloading = false;
        downloadBtn.disabled = false;
        downloadBtn.textContent = 'Download';
        downloadLed.className = 'status-led active';
        progressFill.style.width = '100%';
        progressLabel.textContent = '100%';
        statusReadout.textContent = 'Complete!';

        if (data.downloadUrl) {
            const fullUrl = CONFIG.API_BASE.replace('/api', '') + data.downloadUrl;
            downloadLink.href = fullUrl;
            if (data.filename) {
                downloadLink.textContent = data.filename;
                downloadLink.setAttribute('download', data.filename);
            }
            downloadLinkContainer.classList.remove('hidden');
        }

        Toast.success('Download complete!');
    }

    function onDownloadError(message) {
        downloading = false;
        downloadBtn.disabled = false;
        downloadBtn.textContent = 'Download';
        downloadLed.className = 'status-led error';
        statusReadout.textContent = 'Error: ' + message;
        Toast.error(message);
    }

    function resetDownloadUI() {
        progressSection.classList.add('hidden');
        downloadLinkContainer.classList.add('hidden');
        progressFill.style.width = '0%';
        progressLabel.textContent = '0%';
        downloadLed.className = 'status-led';
    }

    // Initialize with mp4 quality options
    updateQualityOptions();
})();
