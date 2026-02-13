/* ============================================
   MEDIA INFO INSPECTOR
   Extracts media properties using browser APIs
   ============================================ */

(function () {
    'use strict';

    /* --- DOM References --- */
    const dropZone = document.getElementById('dropZone');
    const sourceLed = document.getElementById('sourceLed');
    const mediaTypeBadge = document.getElementById('mediaTypeBadge');
    const fileInfoPanel = document.getElementById('fileInfoPanel');
    const fileInfoTable = document.getElementById('fileInfoTable').querySelector('tbody');
    const mediaPropsPanel = document.getElementById('mediaPropsPanel');
    const mediaPropsTable = document.getElementById('mediaPropsTable').querySelector('tbody');
    const copyAllBtn = document.getElementById('copyAllBtn');
    const rawMetaPanel = document.getElementById('rawMetaPanel');
    const rawMetaToggle = document.getElementById('rawMetaToggle');
    const rawMetaBody = document.getElementById('rawMetaBody');
    const rawMetaContent = document.getElementById('rawMetaContent');

    /* --- State --- */
    let currentInfo = null;

    /* --- Utility: GCD for aspect ratio --- */
    function gcd(a, b) {
        a = Math.abs(Math.round(a));
        b = Math.abs(Math.round(b));
        while (b) {
            const t = b;
            b = a % b;
            a = t;
        }
        return a;
    }

    function calcAspectRatio(w, h) {
        if (!w || !h) return 'N/A';
        const d = gcd(w, h);
        return `${w / d}:${h / d}`;
    }

    /* --- Utility: Format duration as HH:MM:SS.ms --- */
    function formatDurationPrecise(seconds) {
        if (!seconds || !isFinite(seconds)) return 'N/A';
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = Math.floor(seconds % 60);
        const ms = Math.round((seconds % 1) * 1000);
        const parts = [];
        parts.push(String(h).padStart(2, '0'));
        parts.push(String(m).padStart(2, '0'));
        parts.push(String(s).padStart(2, '0'));
        return parts.join(':') + '.' + String(ms).padStart(3, '0');
    }

    /* --- Utility: Format date --- */
    function formatDate(date) {
        if (!date) return 'N/A';
        const d = new Date(date);
        if (isNaN(d.getTime())) return 'N/A';
        return d.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
        });
    }

    /* --- Detect media category from MIME --- */
    function getMediaCategory(mimeType) {
        if (!mimeType) return 'unknown';
        if (mimeType.startsWith('video/')) return 'video';
        if (mimeType.startsWith('audio/')) return 'audio';
        if (mimeType.startsWith('image/')) return 'image';
        return 'unknown';
    }

    /* --- Render info table rows --- */
    function renderTable(tableBody, rows) {
        tableBody.innerHTML = '';
        rows.forEach(([label, value, accent]) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="info-label">${label}</td>
                <td class="info-value${accent ? ' accent' : ''}">${value}</td>
            `;
            tableBody.appendChild(tr);
        });
    }

    /* --- Show/hide panels --- */
    function showResults(fileRows, mediaRows, rawData) {
        renderTable(fileInfoTable, fileRows);
        fileInfoPanel.classList.remove('hidden');

        renderTable(mediaPropsTable, mediaRows);
        mediaPropsPanel.classList.remove('hidden');

        if (rawData && Object.keys(rawData).length > 0) {
            rawMetaContent.textContent = JSON.stringify(rawData, null, 2);
            rawMetaPanel.classList.remove('hidden');
        } else {
            rawMetaPanel.classList.add('hidden');
        }
    }

    function resetPanels() {
        fileInfoPanel.classList.add('hidden');
        mediaPropsPanel.classList.add('hidden');
        rawMetaPanel.classList.add('hidden');
        mediaTypeBadge.classList.add('hidden');
        sourceLed.className = 'status-led';
        currentInfo = null;
    }

    /* --- Update media type badge --- */
    function showMediaBadge(category) {
        mediaTypeBadge.textContent = category.toUpperCase();
        mediaTypeBadge.className = 'media-type-badge ' + category;
        mediaTypeBadge.classList.remove('hidden');
    }

    /* --- Build "Copy All" formatted text --- */
    function buildCopyText(file, fileRows, mediaRows) {
        let text = '=== MEDIA INFO ===\n\n';
        text += '--- File Info ---\n';
        fileRows.forEach(([label, value]) => {
            text += `${label}: ${value}\n`;
        });
        text += '\n--- Media Properties ---\n';
        mediaRows.forEach(([label, value]) => {
            text += `${label}: ${value}\n`;
        });
        return text;
    }

    /* --- Inspect VIDEO file --- */
    function inspectVideo(file, dataUrl) {
        return new Promise((resolve, reject) => {
            const video = document.createElement('video');
            video.preload = 'metadata';
            video.muted = true;

            video.addEventListener('loadedmetadata', () => {
                const w = video.videoWidth;
                const h = video.videoHeight;
                const duration = video.duration;
                const ratio = calcAspectRatio(w, h);

                const mediaRows = [
                    ['Resolution', `${w} x ${h}`, true],
                    ['Aspect Ratio', ratio, false],
                    ['Duration', formatDurationPrecise(duration), true],
                ];

                // Try to get more info from video tracks
                if (video.videoTracks && video.videoTracks.length > 0) {
                    mediaRows.push(['Video Tracks', String(video.videoTracks.length), false]);
                }
                if (video.audioTracks && video.audioTracks.length > 0) {
                    mediaRows.push(['Audio Tracks', String(video.audioTracks.length), false]);
                }

                // Codec hint from MIME
                const codecHint = file.type || 'unknown';
                mediaRows.push(['Container/MIME', codecHint, false]);

                const rawData = {
                    videoWidth: w,
                    videoHeight: h,
                    duration: duration,
                    aspectRatio: ratio,
                    mimeType: file.type,
                    readyState: video.readyState,
                    networkState: video.networkState,
                };

                URL.revokeObjectURL(video.src);
                resolve({ mediaRows, rawData });
            });

            video.addEventListener('error', () => {
                // Even if the video can't fully load, return what we know
                const mediaRows = [
                    ['Container/MIME', file.type || 'unknown', false],
                    ['Status', 'Could not decode — format may be unsupported by this browser', false],
                ];
                const rawData = {
                    mimeType: file.type,
                    error: 'Browser could not decode this video format',
                };
                URL.revokeObjectURL(video.src);
                resolve({ mediaRows, rawData });
            });

            video.src = URL.createObjectURL(file);
        });
    }

    /* --- Inspect AUDIO file --- */
    function inspectAudio(file, dataUrl) {
        return new Promise((resolve, reject) => {
            const audio = document.createElement('audio');
            audio.preload = 'metadata';

            audio.addEventListener('loadedmetadata', () => {
                const duration = audio.duration;

                const mediaRows = [
                    ['Duration', formatDurationPrecise(duration), true],
                    ['Container/MIME', file.type || 'unknown', false],
                ];

                // Try AudioContext for more detail
                const rawData = {
                    duration: duration,
                    mimeType: file.type,
                };

                // Attempt to get channel/sample info via AudioContext
                tryAudioContext(file).then(ctxInfo => {
                    if (ctxInfo) {
                        mediaRows.splice(1, 0,
                            ['Channels', String(ctxInfo.channels), false],
                            ['Sample Rate', `${ctxInfo.sampleRate} Hz`, false],
                            ['Decoded Length', `${ctxInfo.length} samples`, false]
                        );
                        rawData.channels = ctxInfo.channels;
                        rawData.sampleRate = ctxInfo.sampleRate;
                        rawData.decodedLength = ctxInfo.length;
                    }
                    URL.revokeObjectURL(audio.src);
                    resolve({ mediaRows, rawData });
                });
            });

            audio.addEventListener('error', () => {
                const mediaRows = [
                    ['Container/MIME', file.type || 'unknown', false],
                    ['Status', 'Could not decode — format may be unsupported by this browser', false],
                ];
                const rawData = {
                    mimeType: file.type,
                    error: 'Browser could not decode this audio format',
                };
                URL.revokeObjectURL(audio.src);
                resolve({ mediaRows, rawData });
            });

            audio.src = URL.createObjectURL(file);
        });
    }

    /* --- Try AudioContext for detailed info --- */
    async function tryAudioContext(file) {
        try {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (!AudioCtx) return null;
            const ctx = new AudioCtx();
            const arrayBuffer = await readFileAsArrayBuffer(file);
            const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
            const info = {
                channels: audioBuffer.numberOfChannels,
                sampleRate: audioBuffer.sampleRate,
                length: audioBuffer.length,
            };
            ctx.close();
            return info;
        } catch {
            return null;
        }
    }

    /* --- Inspect IMAGE file --- */
    function inspectImage(file, dataUrl) {
        return new Promise((resolve, reject) => {
            const img = new Image();

            img.addEventListener('load', () => {
                const w = img.naturalWidth;
                const h = img.naturalHeight;
                const ratio = calcAspectRatio(w, h);
                const megapixels = ((w * h) / 1000000).toFixed(2);

                const mediaRows = [
                    ['Dimensions', `${w} x ${h}`, true],
                    ['Aspect Ratio', ratio, false],
                    ['Megapixels', megapixels + ' MP', false],
                    ['Image Type', file.type || 'unknown', false],
                ];

                const rawData = {
                    naturalWidth: w,
                    naturalHeight: h,
                    aspectRatio: ratio,
                    megapixels: parseFloat(megapixels),
                    mimeType: file.type,
                };

                resolve({ mediaRows, rawData });
            });

            img.addEventListener('error', () => {
                const mediaRows = [
                    ['Image Type', file.type || 'unknown', false],
                    ['Status', 'Could not decode — format may be unsupported by this browser', false],
                ];
                const rawData = {
                    mimeType: file.type,
                    error: 'Browser could not decode this image format',
                };
                resolve({ mediaRows, rawData });
            });

            img.src = dataUrl;
        });
    }

    /* --- Main inspect handler --- */
    async function inspectFile(file) {
        resetPanels();

        const category = getMediaCategory(file.type);
        sourceLed.className = 'status-led active';
        showMediaBadge(category !== 'unknown' ? category : 'file');

        // Build file info rows
        const fileRows = [
            ['File Name', file.name, false],
            ['File Size', formatBytes(file.size), true],
            ['MIME Type', file.type || 'unknown', false],
            ['Last Modified', formatDate(file.lastModified), false],
        ];

        let dataUrl = null;
        try {
            dataUrl = await readFileAsDataURL(file);
        } catch {
            // DataURL not needed for all analyses
        }

        let result;
        try {
            switch (category) {
                case 'video':
                    result = await inspectVideo(file, dataUrl);
                    break;
                case 'audio':
                    result = await inspectAudio(file, dataUrl);
                    break;
                case 'image':
                    result = await inspectImage(file, dataUrl);
                    break;
                default:
                    result = {
                        mediaRows: [
                            ['Type', file.type || 'unknown', false],
                            ['Status', 'Unsupported media type — showing available file info', false],
                        ],
                        rawData: { mimeType: file.type },
                    };
                    break;
            }
        } catch (err) {
            result = {
                mediaRows: [
                    ['Error', err.message || 'Failed to inspect media', false],
                ],
                rawData: { error: err.message },
            };
            Toast.error('Failed to inspect media file');
        }

        currentInfo = { file, fileRows, mediaRows: result.mediaRows, rawData: result.rawData };
        showResults(fileRows, result.mediaRows, result.rawData);
        Toast.success(`Inspected: ${file.name}`);
    }

    /* --- Copy All handler --- */
    copyAllBtn.addEventListener('click', () => {
        if (!currentInfo) return;
        const text = buildCopyText(currentInfo.file, currentInfo.fileRows, currentInfo.mediaRows);
        navigator.clipboard.writeText(text).then(() => {
            Toast.success('Copied to clipboard');
        }).catch(() => {
            // Fallback
            const ta = document.createElement('textarea');
            ta.value = text;
            ta.style.position = 'fixed';
            ta.style.opacity = '0';
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            document.body.removeChild(ta);
            Toast.success('Copied to clipboard');
        });
    });

    /* --- Collapsible raw metadata toggle --- */
    rawMetaToggle.addEventListener('click', () => {
        rawMetaToggle.classList.toggle('expanded');
        rawMetaBody.classList.toggle('expanded');
    });

    /* --- Initialize drop zone --- */
    initDropZone(dropZone, {
        accept: 'video/*,audio/*,image/*',
        multiple: false,
        onFiles(files) {
            if (files.length > 0) {
                inspectFile(files[0]);
            }
        },
    });

})();
