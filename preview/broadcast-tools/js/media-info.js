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
    const exportJsonBtn = document.getElementById('exportJsonBtn');
    const rawMetaPanel = document.getElementById('rawMetaPanel');
    const rawMetaToggle = document.getElementById('rawMetaToggle');
    const rawMetaBody = document.getElementById('rawMetaBody');
    const rawMetaContent = document.getElementById('rawMetaContent');

    // New panels
    const mediaPreviewPanel = document.getElementById('mediaPreviewPanel');
    const videoThumbContainer = document.getElementById('videoThumbContainer');
    const videoThumb = document.getElementById('videoThumb');
    const waveformContainer = document.getElementById('waveformContainer');
    const waveformCanvas = document.getElementById('waveformCanvas');

    const colorAnalysisPanel = document.getElementById('colorAnalysisPanel');
    const colorSwatches = document.getElementById('colorSwatches');
    const colorInfoTable = document.getElementById('colorInfoTable').querySelector('tbody');
    const brightnessTrack = document.getElementById('brightnessTrack');
    const brightnessIndicator = document.getElementById('brightnessIndicator');
    const brightnessLabel = document.getElementById('brightnessLabel');

    const comparePanel = document.getElementById('comparePanel');
    const compareDropZone = document.getElementById('compareDropZone');
    const compareLed = document.getElementById('compareLed');
    const compareResults = document.getElementById('compareResults');
    const compareTable = document.getElementById('compareTable').querySelector('tbody');
    const compareEmpty = document.getElementById('compareEmpty');
    const clearCompareBtn = document.getElementById('clearCompareBtn');
    const compareFileName = document.getElementById('compareFileName');

    /* --- State --- */
    let currentInfo = null;
    let compareData = null;

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

    /* --- Utility: Format bitrate --- */
    function formatBitrate(bytes, seconds) {
        if (!bytes || !seconds || !isFinite(seconds) || seconds <= 0) return 'N/A';
        const bitsPerSec = (bytes * 8) / seconds;
        if (bitsPerSec >= 1000000) return (bitsPerSec / 1000000).toFixed(2) + ' Mbps';
        if (bitsPerSec >= 1000) return (bitsPerSec / 1000).toFixed(0) + ' Kbps';
        return Math.round(bitsPerSec) + ' bps';
    }

    /* --- Utility: RGB to hex --- */
    function rgbToHex(r, g, b) {
        return '#' + [r, g, b].map(c => c.toString(16).padStart(2, '0')).join('');
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

    /* ==================================================
       COLOR ANALYSIS (Images)
       ================================================== */
    function analyzeColors(imgElement) {
        const size = 64;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(imgElement, 0, 0, size, size);
        const data = ctx.getImageData(0, 0, size, size).data;

        let hasAlpha = false;
        let totalR = 0, totalG = 0, totalB = 0;
        let totalBrightness = 0;
        const buckets = {};
        const pixelCount = data.length / 4;

        for (let i = 0; i < data.length; i += 4) {
            const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];

            if (a < 250) hasAlpha = true;

            totalR += r;
            totalG += g;
            totalB += b;
            totalBrightness += 0.299 * r + 0.587 * g + 0.114 * b;

            // Quantize to ~8 levels per channel
            const qr = Math.round(r / 32) * 32;
            const qg = Math.round(g / 32) * 32;
            const qb = Math.round(b / 32) * 32;
            const key = `${qr},${qg},${qb}`;

            if (!buckets[key]) {
                buckets[key] = { count: 0, r: 0, g: 0, b: 0 };
            }
            buckets[key].count++;
            buckets[key].r += r;
            buckets[key].g += g;
            buckets[key].b += b;
        }

        const dominantColors = Object.values(buckets)
            .sort((a, b) => b.count - a.count)
            .slice(0, 8)
            .map(bucket => ({
                r: Math.round(bucket.r / bucket.count),
                g: Math.round(bucket.g / bucket.count),
                b: Math.round(bucket.b / bucket.count),
                percent: ((bucket.count / pixelCount) * 100).toFixed(1),
            }));

        return {
            dominantColors,
            avgColor: {
                r: Math.round(totalR / pixelCount),
                g: Math.round(totalG / pixelCount),
                b: Math.round(totalB / pixelCount),
            },
            avgBrightness: Math.round(totalBrightness / pixelCount),
            brightnessPercent: ((totalBrightness / pixelCount / 255) * 100).toFixed(1),
            hasAlpha,
        };
    }

    function renderColorAnalysis(analysis) {
        colorSwatches.innerHTML = '';
        analysis.dominantColors.forEach(color => {
            const hex = rgbToHex(color.r, color.g, color.b);
            const swatch = document.createElement('div');
            swatch.className = 'color-swatch';
            swatch.innerHTML = `
                <div class="color-swatch-circle" style="background:${hex}"></div>
                <div class="color-swatch-label">${hex}</div>
                <div class="color-swatch-percent">${color.percent}%</div>
            `;
            colorSwatches.appendChild(swatch);
        });

        const avgHex = rgbToHex(analysis.avgColor.r, analysis.avgColor.g, analysis.avgColor.b);
        renderTable(colorInfoTable, [
            ['Average Color', `<span style="display:inline-block;width:12px;height:12px;border-radius:3px;background:${avgHex};vertical-align:middle;margin-right:6px"></span> ${avgHex}`, false],
            ['Avg Brightness', `${analysis.avgBrightness} / 255 (${analysis.brightnessPercent}%)`, false],
            ['Transparency', analysis.hasAlpha ? 'Yes (has alpha)' : 'No (fully opaque)', analysis.hasAlpha],
        ]);

        // Position brightness indicator
        brightnessIndicator.style.left = analysis.brightnessPercent + '%';
        brightnessLabel.textContent = analysis.brightnessPercent + '%';

        colorAnalysisPanel.classList.remove('hidden');
    }

    /* ==================================================
       BINARY METADATA PARSING (DPI / Color Space)
       ================================================== */
    async function parseBinaryMetadata(file) {
        const result = { dpiX: null, dpiY: null, colorSpace: null };

        try {
            const slice = file.slice(0, 65536);
            const buffer = await slice.arrayBuffer();
            const view = new DataView(buffer);
            const bytes = new Uint8Array(buffer);

            const ext = (file.name.split('.').pop() || '').toLowerCase();
            const isJpeg = file.type === 'image/jpeg' || ext === 'jpg' || ext === 'jpeg';
            const isPng = file.type === 'image/png' || ext === 'png';

            if (isJpeg) parseJpegMetadata(view, bytes, result);
            else if (isPng) parsePngMetadata(view, bytes, result);
        } catch (e) {
            console.warn('Binary metadata parse error:', e);
        }

        return result;
    }

    function parseJpegMetadata(view, bytes, result) {
        if (bytes.length < 4 || view.getUint16(0) !== 0xFFD8) return;

        let offset = 2;
        while (offset < bytes.length - 4) {
            if (bytes[offset] !== 0xFF) break;
            const marker = view.getUint16(offset);
            if (marker === 0xFFDA) break; // Start of scan — stop

            const segLen = view.getUint16(offset + 2);

            // APP0 — JFIF
            if (marker === 0xFFE0 && offset + 14 < bytes.length) {
                if (bytes[offset + 4] === 0x4A && bytes[offset + 5] === 0x46 &&
                    bytes[offset + 6] === 0x49 && bytes[offset + 7] === 0x46 &&
                    bytes[offset + 8] === 0x00) {
                    const densityUnit = bytes[offset + 11];
                    const xDensity = view.getUint16(offset + 12);
                    const yDensity = view.getUint16(offset + 14);

                    if (densityUnit === 1) {
                        result.dpiX = xDensity;
                        result.dpiY = yDensity;
                    } else if (densityUnit === 2) {
                        result.dpiX = Math.round(xDensity * 2.54);
                        result.dpiY = Math.round(yDensity * 2.54);
                    }
                }
            }

            // APP1 — EXIF
            if (marker === 0xFFE1 && offset + 10 < bytes.length) {
                if (bytes[offset + 4] === 0x45 && bytes[offset + 5] === 0x78 &&
                    bytes[offset + 6] === 0x69 && bytes[offset + 7] === 0x66 &&
                    bytes[offset + 8] === 0x00 && bytes[offset + 9] === 0x00) {
                    parseExifForDPI(view, bytes, offset + 10, result);
                }
            }

            // APP2 — ICC Profile
            if (marker === 0xFFE2 && offset + 18 < bytes.length) {
                let iccSig = '';
                for (let i = 0; i < 12; i++) iccSig += String.fromCharCode(bytes[offset + 4 + i]);
                if (iccSig.startsWith('ICC_PROFILE')) {
                    tryParseICCDescription(bytes, offset + 18, segLen - 16, result);
                }
            }

            offset += 2 + segLen;
        }
    }

    function parseExifForDPI(view, bytes, tiffOffset, result) {
        if (tiffOffset + 8 > bytes.length) return;

        const byteOrder = view.getUint16(tiffOffset);
        const le = byteOrder === 0x4949;

        const magic = le ? view.getUint16(tiffOffset + 2, true) : view.getUint16(tiffOffset + 2);
        if (magic !== 42) return;

        const ifdRel = le ? view.getUint32(tiffOffset + 4, true) : view.getUint32(tiffOffset + 4);
        const ifdStart = tiffOffset + ifdRel;
        if (ifdStart + 2 > bytes.length) return;

        const numEntries = le ? view.getUint16(ifdStart, true) : view.getUint16(ifdStart);
        let xRes = null, yRes = null, resUnit = 2;

        for (let i = 0; i < numEntries; i++) {
            const eo = ifdStart + 2 + i * 12;
            if (eo + 12 > bytes.length) break;

            const tag = le ? view.getUint16(eo, true) : view.getUint16(eo);
            const type = le ? view.getUint16(eo + 2, true) : view.getUint16(eo + 2);
            const valOff = le ? view.getUint32(eo + 8, true) : view.getUint32(eo + 8);

            // RATIONAL type
            if ((tag === 0x011A || tag === 0x011B) && type === 5) {
                const ratOff = tiffOffset + valOff;
                if (ratOff + 8 <= bytes.length) {
                    const num = le ? view.getUint32(ratOff, true) : view.getUint32(ratOff);
                    const den = le ? view.getUint32(ratOff + 4, true) : view.getUint32(ratOff + 4);
                    if (den > 0) {
                        if (tag === 0x011A) xRes = num / den;
                        else yRes = num / den;
                    }
                }
            }

            if (tag === 0x0128) {
                resUnit = le ? view.getUint16(eo + 8, true) : view.getUint16(eo + 8);
            }
        }

        if (xRes && yRes) {
            if (resUnit === 2) {
                result.dpiX = Math.round(xRes);
                result.dpiY = Math.round(yRes);
            } else if (resUnit === 3) {
                result.dpiX = Math.round(xRes * 2.54);
                result.dpiY = Math.round(yRes * 2.54);
            }
        }
    }

    function tryParseICCDescription(bytes, profileStart, profileLen, result) {
        if (profileStart + 132 > bytes.length) {
            result.colorSpace = 'ICC Profile';
            return;
        }

        try {
            const dv = new DataView(bytes.buffer, bytes.byteOffset);
            const csSig = String.fromCharCode(
                bytes[profileStart + 16], bytes[profileStart + 17],
                bytes[profileStart + 18], bytes[profileStart + 19]
            ).trim();

            const tagCount = dv.getUint32(profileStart + 128);
            for (let i = 0; i < Math.min(tagCount, 50); i++) {
                const to = profileStart + 132 + i * 12;
                if (to + 12 > bytes.length) break;

                const sig = String.fromCharCode(bytes[to], bytes[to + 1], bytes[to + 2], bytes[to + 3]);
                if (sig === 'desc') {
                    const dataOff = dv.getUint32(to + 4);
                    const descStart = profileStart + dataOff;
                    if (descStart + 12 >= bytes.length) break;

                    const descType = String.fromCharCode(
                        bytes[descStart], bytes[descStart + 1],
                        bytes[descStart + 2], bytes[descStart + 3]
                    );

                    if (descType === 'desc') {
                        const strLen = dv.getUint32(descStart + 8);
                        const len = Math.min(strLen - 1, 80, bytes.length - descStart - 12);
                        let str = '';
                        for (let j = 0; j < len; j++) {
                            const c = bytes[descStart + 12 + j];
                            if (c === 0) break;
                            str += String.fromCharCode(c);
                        }
                        if (str) { result.colorSpace = str; return; }
                    }

                    result.colorSpace = `ICC (${csSig})`;
                    return;
                }
            }

            result.colorSpace = `ICC (${csSig})`;
        } catch {
            result.colorSpace = 'ICC Profile';
        }
    }

    function parsePngMetadata(view, bytes, result) {
        if (bytes.length < 8) return;

        let offset = 8;
        while (offset + 12 < bytes.length) {
            const chunkLen = view.getUint32(offset);
            const ct = String.fromCharCode(bytes[offset + 4], bytes[offset + 5], bytes[offset + 6], bytes[offset + 7]);
            const ds = offset + 8;

            if (ct === 'pHYs' && chunkLen >= 9 && ds + 9 <= bytes.length) {
                const ppuX = view.getUint32(ds);
                const ppuY = view.getUint32(ds + 4);
                const unit = bytes[ds + 8];
                if (unit === 1) {
                    result.dpiX = Math.round(ppuX / 39.3701);
                    result.dpiY = Math.round(ppuY / 39.3701);
                }
            }

            if (ct === 'sRGB') {
                result.colorSpace = 'sRGB';
            }

            if (ct === 'iCCP' && chunkLen > 2) {
                let nameEnd = ds;
                while (nameEnd < ds + chunkLen && bytes[nameEnd] !== 0) nameEnd++;
                let name = '';
                for (let i = ds; i < nameEnd; i++) name += String.fromCharCode(bytes[i]);
                result.colorSpace = name || 'ICC Profile';
            }

            if (ct === 'IDAT') break;
            offset += 12 + chunkLen;
        }
    }

    /* ==================================================
       VIDEO FRAME CAPTURE
       ================================================== */
    function captureVideoFrame(file) {
        return new Promise((resolve) => {
            const video = document.createElement('video');
            video.preload = 'auto';
            video.muted = true;

            const timeout = setTimeout(() => {
                URL.revokeObjectURL(video.src);
                resolve(null);
            }, 10000);

            video.addEventListener('loadedmetadata', () => {
                video.currentTime = Math.min(video.duration * 0.1, 2);
            });

            video.addEventListener('seeked', () => {
                clearTimeout(timeout);
                try {
                    const canvas = document.createElement('canvas');
                    canvas.width = video.videoWidth;
                    canvas.height = video.videoHeight;
                    canvas.getContext('2d').drawImage(video, 0, 0);
                    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
                    URL.revokeObjectURL(video.src);
                    resolve(dataUrl);
                } catch {
                    URL.revokeObjectURL(video.src);
                    resolve(null);
                }
            });

            video.addEventListener('error', () => {
                clearTimeout(timeout);
                URL.revokeObjectURL(video.src);
                resolve(null);
            });

            video.src = URL.createObjectURL(file);
        });
    }

    /* ==================================================
       AUDIO WAVEFORM
       ================================================== */
    async function decodeAudioFile(file) {
        try {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (!AudioCtx) return null;
            if (file.size > 25 * 1024 * 1024) return null; // Skip files > 25MB

            const ctx = new AudioCtx();
            const arrayBuffer = await readFileAsArrayBuffer(file);
            const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
            ctx.close();

            return {
                channels: audioBuffer.numberOfChannels,
                sampleRate: audioBuffer.sampleRate,
                length: audioBuffer.length,
                buffer: audioBuffer,
            };
        } catch {
            return null;
        }
    }

    function drawWaveform(audioBuffer, canvas) {
        const dpr = window.devicePixelRatio || 1;
        const displayWidth = canvas.clientWidth || 800;
        const displayHeight = canvas.clientHeight || 150;
        canvas.width = displayWidth * dpr;
        canvas.height = displayHeight * dpr;

        const ctx = canvas.getContext('2d');
        ctx.scale(dpr, dpr);
        const w = displayWidth;
        const h = displayHeight;

        // Background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(0, 0, w, h);

        // Center line
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, h / 2);
        ctx.lineTo(w, h / 2);
        ctx.stroke();

        // Draw waveform for each channel
        const numChannels = audioBuffer.numberOfChannels;
        const channelHeight = h / numChannels;
        const colors = ['#06b6d4', '#8b5cf6', '#f59e0b', '#22c55e'];

        for (let ch = 0; ch < numChannels; ch++) {
            const data = audioBuffer.getChannelData(ch);
            const step = Math.ceil(data.length / w);
            const amp = channelHeight / 2;
            const yOffset = ch * channelHeight;

            // Gradient fill for waveform
            const gradient = ctx.createLinearGradient(0, yOffset, 0, yOffset + channelHeight);
            const color = colors[ch % colors.length];
            gradient.addColorStop(0, color + '40');
            gradient.addColorStop(0.5, color + 'cc');
            gradient.addColorStop(1, color + '40');

            ctx.fillStyle = gradient;
            ctx.beginPath();

            // Top half (positive)
            for (let i = 0; i < w; i++) {
                const start = step * i;
                let max = 0;
                for (let j = 0; j < step && start + j < data.length; j++) {
                    const v = Math.abs(data[start + j]);
                    if (v > max) max = v;
                }
                const barH = max * amp;
                ctx.rect(i, yOffset + amp - barH, 1, barH * 2);
            }
            ctx.fill();

            // Channel label
            if (numChannels > 1) {
                ctx.fillStyle = 'rgba(255,255,255,0.3)';
                ctx.font = '10px monospace';
                ctx.fillText(ch === 0 ? 'L' : ch === 1 ? 'R' : `CH${ch + 1}`, 4, yOffset + 12);
            }
        }

        // Time markers
        ctx.fillStyle = 'rgba(255,255,255,0.2)';
        ctx.font = '9px monospace';
        const dur = audioBuffer.duration;
        const markers = dur > 60 ? 6 : dur > 10 ? 5 : 4;
        for (let i = 1; i < markers; i++) {
            const x = (w / markers) * i;
            const t = (dur / markers) * i;
            ctx.fillRect(x, 0, 1, h);
            ctx.fillText(formatDurationPrecise(t).slice(3, 8), x + 3, h - 4);
        }
    }

    /* ==================================================
       SHOW / HIDE / RESET PANELS
       ================================================== */
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
        mediaPreviewPanel.classList.add('hidden');
        colorAnalysisPanel.classList.add('hidden');
        mediaTypeBadge.classList.add('hidden');
        sourceLed.className = 'status-led';
        videoThumbContainer.classList.add('hidden');
        waveformContainer.classList.add('hidden');
        currentInfo = null;
    }

    function showMediaBadge(category) {
        mediaTypeBadge.textContent = category.toUpperCase();
        mediaTypeBadge.className = 'media-type-badge ' + category;
        mediaTypeBadge.classList.remove('hidden');
    }

    /* --- Build "Copy All" formatted text --- */
    function buildCopyText(fileRows, mediaRows) {
        let text = '=== MEDIA INFO ===\n\n';
        text += '--- File Info ---\n';
        fileRows.forEach(([label, value]) => { text += `${label}: ${value}\n`; });
        text += '\n--- Media Properties ---\n';
        mediaRows.forEach(([label, value]) => { text += `${label}: ${value}\n`; });
        return text;
    }

    /* ==================================================
       INSPECT VIDEO
       ================================================== */
    function inspectVideo(file) {
        return new Promise((resolve) => {
            const video = document.createElement('video');
            video.preload = 'metadata';
            video.muted = true;

            video.addEventListener('loadedmetadata', () => {
                const w = video.videoWidth;
                const h = video.videoHeight;
                const duration = video.duration;
                const ratio = calcAspectRatio(w, h);
                const bitrate = formatBitrate(file.size, duration);

                const mediaRows = [
                    ['Resolution', `${w} x ${h}`, true],
                    ['Aspect Ratio', ratio, false],
                    ['Duration', formatDurationPrecise(duration), true],
                    ['Est. Bitrate', bitrate, false],
                ];

                if (video.videoTracks && video.videoTracks.length > 0) {
                    mediaRows.push(['Video Tracks', String(video.videoTracks.length), false]);
                }
                if (video.audioTracks && video.audioTracks.length > 0) {
                    mediaRows.push(['Audio Tracks', String(video.audioTracks.length), false]);
                }

                mediaRows.push(['Container/MIME', file.type || 'unknown', false]);

                const rawData = {
                    videoWidth: w,
                    videoHeight: h,
                    duration,
                    aspectRatio: ratio,
                    estimatedBitrate: bitrate,
                    mimeType: file.type,
                };

                URL.revokeObjectURL(video.src);
                resolve({ mediaRows, rawData });
            });

            video.addEventListener('error', () => {
                const mediaRows = [
                    ['Container/MIME', file.type || 'unknown', false],
                    ['Status', 'Could not decode — format may be unsupported by this browser', false],
                ];
                URL.revokeObjectURL(video.src);
                resolve({ mediaRows, rawData: { mimeType: file.type, error: 'Browser could not decode' } });
            });

            video.src = URL.createObjectURL(file);
        });
    }

    /* ==================================================
       INSPECT AUDIO
       ================================================== */
    async function inspectAudio(file) {
        return new Promise((resolve) => {
            const audio = document.createElement('audio');
            audio.preload = 'metadata';

            audio.addEventListener('loadedmetadata', async () => {
                const duration = audio.duration;
                const bitrate = formatBitrate(file.size, duration);

                const mediaRows = [
                    ['Duration', formatDurationPrecise(duration), true],
                    ['Est. Bitrate', bitrate, false],
                    ['Container/MIME', file.type || 'unknown', false],
                ];

                const rawData = {
                    duration,
                    estimatedBitrate: bitrate,
                    mimeType: file.type,
                };

                // Decode audio for details + waveform
                const decoded = await decodeAudioFile(file);
                if (decoded) {
                    mediaRows.splice(1, 0,
                        ['Channels', String(decoded.channels), false],
                        ['Sample Rate', `${decoded.sampleRate} Hz`, false],
                        ['Decoded Length', `${decoded.length.toLocaleString()} samples`, false]
                    );
                    rawData.channels = decoded.channels;
                    rawData.sampleRate = decoded.sampleRate;
                    rawData.decodedLength = decoded.length;

                    // Draw waveform
                    waveformContainer.classList.remove('hidden');
                    videoThumbContainer.classList.add('hidden');
                    mediaPreviewPanel.classList.remove('hidden');
                    drawWaveform(decoded.buffer, waveformCanvas);
                }

                URL.revokeObjectURL(audio.src);
                resolve({ mediaRows, rawData });
            });

            audio.addEventListener('error', () => {
                const mediaRows = [
                    ['Container/MIME', file.type || 'unknown', false],
                    ['Status', 'Could not decode — format may be unsupported by this browser', false],
                ];
                URL.revokeObjectURL(audio.src);
                resolve({ mediaRows, rawData: { mimeType: file.type, error: 'Browser could not decode' } });
            });

            audio.src = URL.createObjectURL(file);
        });
    }

    /* ==================================================
       INSPECT IMAGE
       ================================================== */
    async function inspectImage(file, dataUrl) {
        return new Promise(async (resolve) => {
            const img = new Image();

            img.addEventListener('load', async () => {
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

                // Parse binary metadata for DPI and color space
                const binMeta = await parseBinaryMetadata(file);
                if (binMeta.dpiX && binMeta.dpiY) {
                    const dpiStr = binMeta.dpiX === binMeta.dpiY
                        ? `${binMeta.dpiX} DPI`
                        : `${binMeta.dpiX} x ${binMeta.dpiY} DPI`;
                    mediaRows.push(['DPI / PPI', dpiStr, false]);
                    rawData.dpiX = binMeta.dpiX;
                    rawData.dpiY = binMeta.dpiY;
                }

                if (binMeta.colorSpace) {
                    mediaRows.push(['Color Space', binMeta.colorSpace, false]);
                    rawData.colorSpace = binMeta.colorSpace;
                }

                // Color analysis
                try {
                    const colorResult = analyzeColors(img);
                    mediaRows.push(
                        ['Transparency', colorResult.hasAlpha ? 'Yes (alpha channel)' : 'No (opaque)', colorResult.hasAlpha]
                    );
                    rawData.hasAlpha = colorResult.hasAlpha;
                    rawData.avgBrightness = colorResult.avgBrightness;
                    rawData.dominantColors = colorResult.dominantColors.map(c => rgbToHex(c.r, c.g, c.b));

                    renderColorAnalysis(colorResult);
                } catch (e) {
                    console.warn('Color analysis failed:', e);
                }

                resolve({ mediaRows, rawData });
            });

            img.addEventListener('error', () => {
                resolve({
                    mediaRows: [
                        ['Image Type', file.type || 'unknown', false],
                        ['Status', 'Could not decode — format may be unsupported by this browser', false],
                    ],
                    rawData: { mimeType: file.type, error: 'Browser could not decode' },
                });
            });

            img.src = dataUrl;
        });
    }

    /* ==================================================
       MAIN INSPECT HANDLER
       ================================================== */
    async function inspectFile(file) {
        resetPanels();

        const category = getMediaCategory(file.type);
        sourceLed.className = 'status-led active';
        showMediaBadge(category !== 'unknown' ? category : 'file');

        const fileRows = [
            ['File Name', file.name, false],
            ['File Size', formatBytes(file.size), true],
            ['MIME Type', file.type || 'unknown', false],
            ['Last Modified', formatDate(file.lastModified), false],
        ];

        let dataUrl = null;
        try { dataUrl = await readFileAsDataURL(file); } catch { /* ok */ }

        let result;
        try {
            switch (category) {
                case 'video':
                    result = await inspectVideo(file);
                    // Capture frame thumbnail in background
                    captureVideoFrame(file).then(frameUrl => {
                        if (frameUrl) {
                            videoThumb.src = frameUrl;
                            videoThumbContainer.classList.remove('hidden');
                            waveformContainer.classList.add('hidden');
                            mediaPreviewPanel.classList.remove('hidden');
                        }
                    });
                    break;
                case 'audio':
                    result = await inspectAudio(file);
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
                mediaRows: [['Error', err.message || 'Failed to inspect media', false]],
                rawData: { error: err.message },
            };
            Toast.error('Failed to inspect media file');
        }

        currentInfo = { file, category, fileRows, mediaRows: result.mediaRows, rawData: result.rawData };
        showResults(fileRows, result.mediaRows, result.rawData);
        Toast.success(`Inspected: ${file.name}`);

        // Show compare panel now that we have a file
        comparePanel.classList.remove('hidden');
    }

    /* ==================================================
       COMPARE MODE
       ================================================== */
    async function inspectForCompare(file) {
        compareLed.className = 'status-led warning';
        compareFileName.textContent = file.name;
        compareFileName.classList.remove('hidden');
        clearCompareBtn.classList.remove('hidden');

        const category = getMediaCategory(file.type);

        const fileRows = [
            ['File Name', file.name, false],
            ['File Size', formatBytes(file.size), true],
            ['MIME Type', file.type || 'unknown', false],
            ['Last Modified', formatDate(file.lastModified), false],
        ];

        let dataUrl = null;
        try { dataUrl = await readFileAsDataURL(file); } catch { /* ok */ }

        let result;
        try {
            switch (category) {
                case 'video': result = await inspectVideo(file); break;
                case 'audio': result = await inspectAudio(file); break;
                case 'image': result = await inspectImage(file, dataUrl); break;
                default:
                    result = {
                        mediaRows: [['Type', file.type || 'unknown', false]],
                        rawData: { mimeType: file.type },
                    };
                    break;
            }
        } catch (err) {
            result = {
                mediaRows: [['Error', err.message, false]],
                rawData: {},
            };
        }

        compareData = { file, category, fileRows, mediaRows: result.mediaRows, rawData: result.rawData };
        compareLed.className = 'status-led active';
        renderComparison();
    }

    function renderComparison() {
        if (!currentInfo || !compareData) return;

        compareEmpty.classList.add('hidden');
        compareResults.classList.remove('hidden');
        compareTable.innerHTML = '';

        // Build unified property list
        const propsA = {};
        const propsB = {};

        currentInfo.fileRows.forEach(([label, value]) => { propsA[label] = value; });
        currentInfo.mediaRows.forEach(([label, value]) => { propsA[label] = value; });
        compareData.fileRows.forEach(([label, value]) => { propsB[label] = value; });
        compareData.mediaRows.forEach(([label, value]) => { propsB[label] = value; });

        const allKeys = [];
        const seen = {};
        [...currentInfo.fileRows, ...currentInfo.mediaRows, ...compareData.fileRows, ...compareData.mediaRows].forEach(([label]) => {
            if (!seen[label]) { allKeys.push(label); seen[label] = true; }
        });

        allKeys.forEach(key => {
            const valA = propsA[key] || '—';
            const valB = propsB[key] || '—';
            const isDiff = valA !== valB;

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="compare-prop">${key}</td>
                <td class="compare-val-a${isDiff ? ' compare-diff' : ''}">${valA}</td>
                <td class="compare-val-b${isDiff ? ' compare-diff' : ''}">${valB}</td>
            `;
            compareTable.appendChild(tr);
        });
    }

    function clearCompare() {
        compareData = null;
        compareResults.classList.add('hidden');
        compareEmpty.classList.remove('hidden');
        compareLed.className = 'status-led';
        clearCompareBtn.classList.add('hidden');
        compareFileName.classList.add('hidden');
        compareTable.innerHTML = '';
    }

    /* ==================================================
       EXPORT
       ================================================== */
    function exportAsJSON() {
        if (!currentInfo) return;
        const data = {
            inspectedAt: new Date().toISOString(),
            file: {
                name: currentInfo.file.name,
                size: currentInfo.file.size,
                type: currentInfo.file.type,
            },
            category: currentInfo.category,
            properties: {},
            rawMetadata: currentInfo.rawData,
        };

        currentInfo.fileRows.forEach(([label, value]) => { data.properties[label] = value; });
        currentInfo.mediaRows.forEach(([label, value]) => { data.properties[label] = value; });

        if (compareData) {
            data.comparison = {
                file: { name: compareData.file.name, size: compareData.file.size, type: compareData.file.type },
                category: compareData.category,
                properties: {},
                rawMetadata: compareData.rawData,
            };
            compareData.fileRows.forEach(([label, value]) => { data.comparison.properties[label] = value; });
            compareData.mediaRows.forEach(([label, value]) => { data.comparison.properties[label] = value; });
        }

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const safeName = currentInfo.file.name.replace(/\.[^.]+$/, '');
        downloadBlob(blob, `${safeName}-media-info.json`);
        Toast.success('Exported as JSON');
    }

    /* ==================================================
       EVENT BINDINGS
       ================================================== */
    copyAllBtn.addEventListener('click', () => {
        if (!currentInfo) return;
        const text = buildCopyText(currentInfo.fileRows, currentInfo.mediaRows);
        navigator.clipboard.writeText(text).then(() => {
            Toast.success('Copied to clipboard');
        }).catch(() => {
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

    exportJsonBtn.addEventListener('click', exportAsJSON);

    rawMetaToggle.addEventListener('click', () => {
        rawMetaToggle.classList.toggle('expanded');
        rawMetaBody.classList.toggle('expanded');
    });

    clearCompareBtn.addEventListener('click', clearCompare);

    // Main drop zone
    initDropZone(dropZone, {
        accept: 'video/*,audio/*,image/*',
        multiple: false,
        onFiles(files) {
            if (files.length > 0) {
                clearCompare();
                inspectFile(files[0]);
            }
        },
    });

    // Compare drop zone
    initDropZone(compareDropZone, {
        accept: 'video/*,audio/*,image/*',
        multiple: false,
        onFiles(files) {
            if (files.length > 0) {
                if (!currentInfo) {
                    // No main file yet — use as main
                    inspectFile(files[0]);
                } else {
                    inspectForCompare(files[0]);
                }
            }
        },
    });

})();
