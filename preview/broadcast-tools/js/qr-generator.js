/* ============================================
   QR CODE GENERATOR
   Uses qrcode.js library for generation
   ============================================ */

(function () {
    'use strict';

    /* --- DOM Elements --- */
    const qrInput = document.getElementById('qrInput');
    const charCount = document.getElementById('charCount');
    const typeBadge = document.getElementById('typeBadge');
    const sizeSlider = document.getElementById('sizeSlider');
    const sizeValue = document.getElementById('sizeValue');
    const ecGroup = document.getElementById('ecGroup');
    const ecDescription = document.getElementById('ecDescription');
    const fgColor = document.getElementById('fgColor');
    const fgHex = document.getElementById('fgHex');
    const bgColor = document.getElementById('bgColor');
    const bgHex = document.getElementById('bgHex');
    const marginSlider = document.getElementById('marginSlider');
    const marginValue = document.getElementById('marginValue');
    const qrCanvas = document.getElementById('qrCanvas');
    const qrPlaceholder = document.getElementById('qrPlaceholder');
    const qrPreviewArea = document.getElementById('qrPreviewArea');
    const inputLed = document.getElementById('inputLed');
    const previewLed = document.getElementById('previewLed');
    const exportLed = document.getElementById('exportLed');
    const downloadPngBtn = document.getElementById('downloadPngBtn');
    const downloadSvgBtn = document.getElementById('downloadSvgBtn');
    const copyClipboardBtn = document.getElementById('copyClipboardBtn');
    const exportSize = document.getElementById('exportSize');

    /* --- State --- */
    let currentEC = 'M';
    let debounceTimer = null;
    let hasQR = false;

    /* --- Error correction descriptions --- */
    const ecDescriptions = {
        L: '7% error recovery',
        M: '15% error recovery',
        Q: '25% error recovery',
        H: '30% error recovery',
    };

    /* --- Input Type Detection --- */
    function detectInputType(text) {
        if (!text || text.trim().length === 0) return 'Text';
        const trimmed = text.trim();

        // URL
        if (/^https?:\/\//i.test(trimmed) || /^www\./i.test(trimmed)) return 'URL';
        // Also detect URLs like example.com/path
        if (/^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z]{2,})+/i.test(trimmed) && /\.[a-z]{2,}/i.test(trimmed) && !trimmed.includes(' ')) return 'URL';

        // Email
        if (/^mailto:/i.test(trimmed) || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return 'Email';

        // Phone
        if (/^tel:/i.test(trimmed) || /^\+?[\d\s()-]{7,}$/.test(trimmed)) return 'Phone';

        // WiFi
        if (/^WIFI:/i.test(trimmed)) return 'WiFi';

        return 'Text';
    }

    /* --- Get current QR options --- */
    function getQROptions() {
        return {
            width: parseInt(sizeSlider.value, 10),
            margin: parseInt(marginSlider.value, 10),
            errorCorrectionLevel: currentEC,
            color: {
                dark: fgColor.value,
                light: bgColor.value,
            },
        };
    }

    /* --- Generate QR Preview --- */
    function generatePreview() {
        const text = qrInput.value;

        // Update character count
        charCount.textContent = text.length + ' character' + (text.length !== 1 ? 's' : '');

        // Update type badge
        const type = detectInputType(text);
        typeBadge.textContent = type;

        // Update input LED
        if (text.trim().length > 0) {
            inputLed.className = 'status-led active';
        } else {
            inputLed.className = 'status-led';
        }

        if (!text.trim()) {
            qrCanvas.classList.add('hidden');
            qrPlaceholder.classList.remove('hidden');
            setExportState(false);
            return;
        }

        const opts = getQROptions();

        QRCode.toCanvas(qrCanvas, text, opts, function (error) {
            if (error) {
                Toast.error('QR generation failed: ' + error.message);
                qrCanvas.classList.add('hidden');
                qrPlaceholder.classList.remove('hidden');
                previewLed.className = 'status-led error';
                setExportState(false);
                return;
            }
            qrCanvas.classList.remove('hidden');
            qrPlaceholder.classList.add('hidden');
            previewLed.className = 'status-led active';
            setExportState(true);

            // Update export size display
            exportSize.textContent = opts.width + ' \u00d7 ' + opts.width + ' px';
        });
    }

    /* --- Debounced preview update --- */
    function schedulePreview() {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(generatePreview, 300);
    }

    /* --- Export state --- */
    function setExportState(enabled) {
        hasQR = enabled;
        downloadPngBtn.disabled = !enabled;
        downloadSvgBtn.disabled = !enabled;
        copyClipboardBtn.disabled = !enabled;
        exportLed.className = 'status-led' + (enabled ? ' active' : '');
        if (!enabled) {
            exportSize.textContent = '';
        }
    }

    /* --- Download as PNG --- */
    function downloadPNG() {
        if (!hasQR) return;
        const text = qrInput.value.trim();
        if (!text) return;

        const opts = getQROptions();

        QRCode.toDataURL(text, opts, function (error, url) {
            if (error) {
                Toast.error('PNG generation failed: ' + error.message);
                return;
            }
            // Convert data URL to blob
            const byteString = atob(url.split(',')[1]);
            const mimeString = url.split(',')[0].split(':')[1].split(';')[0];
            const ab = new ArrayBuffer(byteString.length);
            const ia = new Uint8Array(ab);
            for (let i = 0; i < byteString.length; i++) {
                ia[i] = byteString.charCodeAt(i);
            }
            const blob = new Blob([ab], { type: mimeString });
            downloadBlob(blob, 'qr-code.png');
            Toast.success('PNG downloaded');
        });
    }

    /* --- Download as SVG --- */
    function downloadSVG() {
        if (!hasQR) return;
        const text = qrInput.value.trim();
        if (!text) return;

        const opts = getQROptions();
        opts.type = 'svg';

        QRCode.toString(text, opts, function (error, svgString) {
            if (error) {
                Toast.error('SVG generation failed: ' + error.message);
                return;
            }
            const blob = new Blob([svgString], { type: 'image/svg+xml' });
            downloadBlob(blob, 'qr-code.svg');
            Toast.success('SVG downloaded');
        });
    }

    /* --- Copy to Clipboard --- */
    async function copyToClipboard() {
        if (!hasQR) return;

        try {
            const blob = await new Promise(function (resolve, reject) {
                qrCanvas.toBlob(function (b) {
                    if (b) resolve(b);
                    else reject(new Error('Failed to create blob from canvas'));
                }, 'image/png');
            });

            await navigator.clipboard.write([
                new ClipboardItem({ 'image/png': blob }),
            ]);
            Toast.success('QR code copied to clipboard');
        } catch (err) {
            Toast.error('Copy failed: ' + err.message);
        }
    }

    /* --- Color sync helpers --- */
    function syncFgColor(source) {
        if (source === 'picker') {
            fgHex.value = fgColor.value;
        } else {
            let val = fgHex.value.trim();
            if (/^#[0-9a-fA-F]{6}$/.test(val)) {
                fgColor.value = val;
            }
        }
        schedulePreview();
    }

    function syncBgColor(source) {
        if (source === 'picker') {
            bgHex.value = bgColor.value;
        } else {
            let val = bgHex.value.trim();
            if (/^#[0-9a-fA-F]{6}$/.test(val)) {
                bgColor.value = val;
            }
        }
        schedulePreview();
    }

    /* --- Error Correction Toggle --- */
    function initECGroup() {
        const buttons = ecGroup.querySelectorAll('.toggle-option');
        buttons.forEach(function (btn) {
            btn.addEventListener('click', function () {
                buttons.forEach(function (b) { b.classList.remove('active'); });
                btn.classList.add('active');
                currentEC = btn.dataset.ec;
                ecDescription.textContent = ecDescriptions[currentEC];
                schedulePreview();
            });
        });
    }

    /* --- Event Listeners --- */
    function initEvents() {
        // Text input
        qrInput.addEventListener('input', schedulePreview);

        // Size slider
        sizeSlider.addEventListener('input', function () {
            sizeValue.textContent = sizeSlider.value + 'px';
            schedulePreview();
        });

        // Margin slider
        marginSlider.addEventListener('input', function () {
            marginValue.textContent = marginSlider.value;
            schedulePreview();
        });

        // Foreground color
        fgColor.addEventListener('input', function () { syncFgColor('picker'); });
        fgHex.addEventListener('input', function () { syncFgColor('hex'); });
        fgHex.addEventListener('blur', function () {
            // Ensure valid hex on blur
            if (!/^#[0-9a-fA-F]{6}$/.test(fgHex.value.trim())) {
                fgHex.value = fgColor.value;
            }
        });

        // Background color
        bgColor.addEventListener('input', function () { syncBgColor('picker'); });
        bgHex.addEventListener('input', function () { syncBgColor('hex'); });
        bgHex.addEventListener('blur', function () {
            if (!/^#[0-9a-fA-F]{6}$/.test(bgHex.value.trim())) {
                bgHex.value = bgColor.value;
            }
        });

        // Export buttons
        downloadPngBtn.addEventListener('click', downloadPNG);
        downloadSvgBtn.addEventListener('click', downloadSVG);
        copyClipboardBtn.addEventListener('click', copyToClipboard);
    }

    /* --- Init --- */
    document.addEventListener('DOMContentLoaded', function () {
        initECGroup();
        initEvents();
        // Set initial state
        setExportState(false);
    });
})();
