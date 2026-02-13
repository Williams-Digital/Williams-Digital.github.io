/* ============================================
   IMAGE CONVERTER — Client-side Logic
   ============================================ */

(function () {
    'use strict';

    /* --- State --- */
    const state = {
        files: [],          // { id, file, name, size, dataUrl, img (HTMLImageElement), width, height }
        selectedId: null,
        settings: {
            format: 'png',
            quality: 90,
            resize: false,
            width: null,
            height: null,
            aspectLock: true,
        },
        results: [],        // { id, name, blob, dataUrl, originalSize, convertedSize }
        converting: false,
    };

    let nextId = 1;

    /* --- DOM References --- */
    const dom = {};

    function cacheDom() {
        dom.dropZone = document.getElementById('dropZone');
        dom.fileList = document.getElementById('fileList');
        dom.clearAllBtn = document.getElementById('clearAllBtn');
        dom.sourceLed = document.getElementById('sourceLed');

        dom.formatGroup = document.getElementById('formatGroup');
        dom.qualityGroup = document.getElementById('qualityGroup');
        dom.qualitySlider = document.getElementById('qualitySlider');
        dom.qualityValue = document.getElementById('qualityValue');

        dom.resizeCheck = document.getElementById('resizeCheck');
        dom.resizeControls = document.getElementById('resizeControls');
        dom.resizePreset = document.getElementById('resizePreset');
        dom.resizeWidth = document.getElementById('resizeWidth');
        dom.resizeHeight = document.getElementById('resizeHeight');
        dom.aspectLockBtn = document.getElementById('aspectLockBtn');

        dom.previewEmpty = document.getElementById('previewEmpty');
        dom.previewContent = document.getElementById('previewContent');
        dom.previewOriginal = document.getElementById('previewOriginal');
        dom.previewConverted = document.getElementById('previewConverted');
        dom.previewOriginalMeta = document.getElementById('previewOriginalMeta');
        dom.previewConvertedMeta = document.getElementById('previewConvertedMeta');
        dom.previewLed = document.getElementById('previewLed');
        dom.previewHint = document.getElementById('previewHint');

        dom.convertAllBtn = document.getElementById('convertAllBtn');
        dom.downloadZipBtn = document.getElementById('downloadZipBtn');
        dom.batchProgress = document.getElementById('batchProgress');
        dom.progressFill = document.getElementById('progressFill');
        dom.progressLabel = document.getElementById('progressLabel');
        dom.progressText = document.getElementById('progressText');
        dom.resultsList = document.getElementById('resultsList');
        dom.resultsEmpty = document.getElementById('resultsEmpty');
        dom.resultCount = document.getElementById('resultCount');
        dom.outputLed = document.getElementById('outputLed');
    }

    /* --- Accepted Formats --- */
    const ACCEPTED_EXTENSIONS = ['png', 'jpg', 'jpeg', 'webp', 'bmp', 'tiff', 'tif', 'gif'];
    const ACCEPT_STRING = ACCEPTED_EXTENSIONS.map(e => '.' + e).join(',') + ',image/*';
    const LOSSY_FORMATS = ['jpg', 'webp'];

    /* --- File Handling --- */
    function addFiles(fileArray) {
        const valid = fileArray.filter(f => {
            const ext = getFileExtension(f.name);
            return ACCEPTED_EXTENSIONS.includes(ext) || f.type.startsWith('image/');
        });

        if (valid.length === 0) {
            Toast.error('No valid image files found');
            return;
        }

        const added = valid.length;
        const skipped = fileArray.length - valid.length;

        valid.forEach(file => {
            const entry = {
                id: nextId++,
                file,
                name: file.name,
                size: file.size,
                dataUrl: null,
                img: null,
                width: 0,
                height: 0,
            };
            state.files.push(entry);
            loadFilePreview(entry);
        });

        if (skipped > 0) {
            Toast.info(`${added} image(s) added, ${skipped} unsupported file(s) skipped`);
        } else {
            Toast.success(`${added} image(s) added`);
        }

        updateFileList();
        updateConvertButton();
    }

    async function loadFilePreview(entry) {
        const ext = getFileExtension(entry.name);
        const isTiff = ext === 'tiff' || ext === 'tif';

        try {
            if (isTiff) {
                // Use UTIF.js to decode TIFF
                const buffer = await readFileAsArrayBuffer(entry.file);
                const ifds = UTIF.decode(buffer);
                if (ifds.length === 0) throw new Error('No pages found in TIFF');
                UTIF.decodeImage(buffer, ifds[0]);
                const rgba = UTIF.toRGBA8(ifds[0]);
                const w = ifds[0].width;
                const h = ifds[0].height;

                // Create canvas to generate a data URL
                const canvas = document.createElement('canvas');
                canvas.width = w;
                canvas.height = h;
                const ctx = canvas.getContext('2d');
                const imageData = ctx.createImageData(w, h);
                imageData.data.set(new Uint8Array(rgba));
                ctx.putImageData(imageData, 0, 0);

                entry.dataUrl = canvas.toDataURL('image/png');
                entry.img = await loadImage(entry.dataUrl);
                entry.width = w;
                entry.height = h;
            } else {
                entry.dataUrl = await readFileAsDataURL(entry.file);
                entry.img = await loadImage(entry.dataUrl);
                entry.width = entry.img.naturalWidth;
                entry.height = entry.img.naturalHeight;
            }
        } catch (err) {
            console.error('Failed to load image:', entry.name, err);
            Toast.error(`Failed to load: ${entry.name}`);
            // Remove the broken entry
            state.files = state.files.filter(f => f.id !== entry.id);
            updateFileList();
            updateConvertButton();
            return;
        }

        updateFileList();

        // If this is the only file or the selected one, refresh preview
        if (state.files.length === 1 && !state.selectedId) {
            selectFile(entry.id);
        } else if (state.selectedId === entry.id) {
            updatePreview();
        }
    }

    function removeFile(id) {
        state.files = state.files.filter(f => f.id !== id);
        if (state.selectedId === id) {
            state.selectedId = state.files.length > 0 ? state.files[0].id : null;
        }
        updateFileList();
        updatePreview();
        updateConvertButton();
    }

    function clearAll() {
        state.files = [];
        state.selectedId = null;
        state.results = [];
        updateFileList();
        updatePreview();
        updateConvertButton();
        updateResults();
    }

    function selectFile(id) {
        state.selectedId = id;
        updateFileList();
        updatePreview();
    }

    /* --- UI Updates --- */
    function updateFileList() {
        const hasFiles = state.files.length > 0;
        dom.clearAllBtn.classList.toggle('hidden', !hasFiles);
        dom.sourceLed.className = 'status-led' + (hasFiles ? ' active' : '');

        dom.fileList.innerHTML = '';
        state.files.forEach(entry => {
            const item = document.createElement('div');
            item.className = 'file-item' + (entry.id === state.selectedId ? ' selected' : '');
            item.style.cursor = 'pointer';
            if (entry.id === state.selectedId) {
                item.style.borderColor = 'rgba(6, 182, 212, 0.4)';
                item.style.background = 'rgba(6, 182, 212, 0.05)';
            }

            const thumbHtml = entry.dataUrl
                ? `<img src="${entry.dataUrl}" alt="">`
                : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>`;

            const dims = entry.width ? `${entry.width} x ${entry.height}` : 'Loading...';

            item.innerHTML = `
                <div class="file-item-icon">${thumbHtml}</div>
                <div class="file-item-info">
                    <div class="file-item-name">${entry.name}</div>
                    <div class="file-item-meta">${formatBytes(entry.size)} &middot; ${dims}</div>
                </div>
                <div class="file-item-actions">
                    <button class="file-item-remove" data-id="${entry.id}" title="Remove">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                    </button>
                </div>
            `;

            // Click to select (but not on the remove button)
            item.addEventListener('click', (e) => {
                if (e.target.closest('.file-item-remove')) return;
                selectFile(entry.id);
            });

            dom.fileList.appendChild(item);
        });

        // Wire up remove buttons
        dom.fileList.querySelectorAll('.file-item-remove').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                removeFile(Number(btn.dataset.id));
            });
        });
    }

    function updateConvertButton() {
        const canConvert = state.files.length > 0 && !state.converting;
        dom.convertAllBtn.disabled = !canConvert;
    }

    /* --- Preview --- */
    async function updatePreview() {
        const entry = state.files.find(f => f.id === state.selectedId);

        if (!entry || !entry.img) {
            dom.previewEmpty.classList.remove('hidden');
            dom.previewContent.classList.add('hidden');
            dom.previewLed.className = 'status-led';
            dom.previewHint.textContent = 'Select an image to preview';
            return;
        }

        dom.previewEmpty.classList.add('hidden');
        dom.previewContent.classList.remove('hidden');
        dom.previewLed.className = 'status-led active';
        dom.previewHint.textContent = entry.name;

        // Original
        dom.previewOriginal.innerHTML = '';
        const origImg = document.createElement('img');
        origImg.src = entry.dataUrl;
        origImg.alt = 'Original';
        dom.previewOriginal.appendChild(origImg);
        dom.previewOriginalMeta.textContent = `${entry.width} x ${entry.height} | ${formatBytes(entry.size)}`;

        // Converted preview
        dom.previewConverted.innerHTML = '<span class="preview-placeholder">Generating preview...</span>';
        dom.previewConvertedMeta.textContent = '';

        try {
            const result = await convertSingle(entry);
            dom.previewConverted.innerHTML = '';
            const convImg = document.createElement('img');
            convImg.src = result.dataUrl;
            convImg.alt = 'Converted';
            dom.previewConverted.appendChild(convImg);

            const dims = getOutputDimensions(entry);
            const pct = ((result.blob.size / entry.size) * 100).toFixed(0);
            const diff = result.blob.size - entry.size;
            const sizeClass = diff <= 0 ? 'smaller' : 'larger';
            const sign = diff <= 0 ? '' : '+';
            dom.previewConvertedMeta.innerHTML =
                `${dims.width} x ${dims.height} | ${formatBytes(result.blob.size)} ` +
                `<span class="size-change ${sizeClass}">(${sign}${formatBytes(diff)}, ${pct}%)</span>`;
        } catch (err) {
            dom.previewConverted.innerHTML = '<span class="preview-placeholder">Preview failed</span>';
            console.error('Preview error:', err);
        }
    }

    /* --- Settings --- */
    function updateFormatUI() {
        const isLossy = LOSSY_FORMATS.includes(state.settings.format);
        dom.qualityGroup.classList.toggle('hidden', !isLossy);
    }

    function handleFormatChange(format) {
        state.settings.format = format;
        dom.formatGroup.querySelectorAll('.toggle-option').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.format === format);
        });
        updateFormatUI();
        debouncePreview();
    }

    function handleQualityChange(value) {
        state.settings.quality = parseInt(value, 10);
        dom.qualityValue.textContent = value;
        debouncePreview();
    }

    function handleResizeToggle(enabled) {
        state.settings.resize = enabled;
        dom.resizeControls.classList.toggle('hidden', !enabled);
        if (!enabled) {
            state.settings.width = null;
            state.settings.height = null;
            dom.resizeWidth.value = '';
            dom.resizeHeight.value = '';
            dom.resizePreset.value = 'original';
        }
        debouncePreview();
    }

    function handlePresetChange(value) {
        if (value === 'original' || value === 'custom') {
            if (value === 'original') {
                state.settings.width = null;
                state.settings.height = null;
                dom.resizeWidth.value = '';
                dom.resizeHeight.value = '';
            }
            // For custom, let the user type values
            return;
        }
        const [w, h] = value.split('x').map(Number);
        state.settings.width = w;
        state.settings.height = h;
        dom.resizeWidth.value = w;
        dom.resizeHeight.value = h;
        debouncePreview();
    }

    function handleWidthChange(value) {
        const w = parseInt(value, 10) || null;
        state.settings.width = w;
        dom.resizePreset.value = 'custom';

        if (w && state.settings.aspectLock && state.selectedId) {
            const entry = state.files.find(f => f.id === state.selectedId);
            if (entry && entry.width && entry.height) {
                const h = Math.round(w * (entry.height / entry.width));
                state.settings.height = h;
                dom.resizeHeight.value = h;
            }
        }
        debouncePreview();
    }

    function handleHeightChange(value) {
        const h = parseInt(value, 10) || null;
        state.settings.height = h;
        dom.resizePreset.value = 'custom';

        if (h && state.settings.aspectLock && state.selectedId) {
            const entry = state.files.find(f => f.id === state.selectedId);
            if (entry && entry.width && entry.height) {
                const w = Math.round(h * (entry.width / entry.height));
                state.settings.width = w;
                dom.resizeWidth.value = w;
            }
        }
        debouncePreview();
    }

    function toggleAspectLock() {
        state.settings.aspectLock = !state.settings.aspectLock;
        dom.aspectLockBtn.classList.toggle('locked', state.settings.aspectLock);
        // Update the icon
        dom.aspectLockBtn.innerHTML = state.settings.aspectLock
            ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>'
            : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 5-5 5 5 0 0 1 5 5"/></svg>';
    }

    /* --- Conversion Logic --- */
    function getOutputDimensions(entry) {
        let w = entry.width;
        let h = entry.height;

        if (state.settings.resize && (state.settings.width || state.settings.height)) {
            const targetW = state.settings.width;
            const targetH = state.settings.height;

            if (targetW && targetH) {
                w = targetW;
                h = targetH;
            } else if (targetW) {
                const ratio = targetW / entry.width;
                w = targetW;
                h = Math.round(entry.height * ratio);
            } else if (targetH) {
                const ratio = targetH / entry.height;
                h = targetH;
                w = Math.round(entry.width * ratio);
            }
        }

        return { width: Math.max(1, w), height: Math.max(1, h) };
    }

    function drawToCanvas(entry, dims) {
        const canvas = document.createElement('canvas');
        canvas.width = dims.width;
        canvas.height = dims.height;
        const ctx = canvas.getContext('2d');

        // For BMP/JPG, fill white background (no transparency support)
        if (state.settings.format === 'bmp' || state.settings.format === 'jpg') {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, dims.width, dims.height);
        }

        ctx.drawImage(entry.img, 0, 0, dims.width, dims.height);
        return canvas;
    }

    function canvasToBlob(canvas, format, quality) {
        return new Promise((resolve, reject) => {
            const mimeMap = {
                png: 'image/png',
                jpg: 'image/jpeg',
                webp: 'image/webp',
            };
            const mime = mimeMap[format];
            if (!mime) {
                reject(new Error('Unsupported format for toBlob: ' + format));
                return;
            }
            const q = LOSSY_FORMATS.includes(format) ? quality / 100 : undefined;
            canvas.toBlob(
                blob => {
                    if (blob) resolve(blob);
                    else reject(new Error('Canvas toBlob returned null'));
                },
                mime,
                q
            );
        });
    }

    /**
     * Manual BMP encoder: BITMAPFILEHEADER + BITMAPINFOHEADER + BGR pixel data (bottom-up).
     * Produces a 24-bit BMP.
     */
    function encodeBMP(canvas) {
        const ctx = canvas.getContext('2d');
        const w = canvas.width;
        const h = canvas.height;
        const imageData = ctx.getImageData(0, 0, w, h);
        const rgba = imageData.data;

        // Row stride: each row is padded to a multiple of 4 bytes
        const rowBytes = w * 3;
        const rowPadding = (4 - (rowBytes % 4)) % 4;
        const rowStride = rowBytes + rowPadding;
        const pixelDataSize = rowStride * h;

        const fileHeaderSize = 14;
        const infoHeaderSize = 40;
        const headerSize = fileHeaderSize + infoHeaderSize;
        const fileSize = headerSize + pixelDataSize;

        const buffer = new ArrayBuffer(fileSize);
        const view = new DataView(buffer);

        // BITMAPFILEHEADER (14 bytes)
        view.setUint8(0, 0x42); // 'B'
        view.setUint8(1, 0x4D); // 'M'
        view.setUint32(2, fileSize, true);       // bfSize
        view.setUint16(6, 0, true);              // bfReserved1
        view.setUint16(8, 0, true);              // bfReserved2
        view.setUint32(10, headerSize, true);    // bfOffBits

        // BITMAPINFOHEADER (40 bytes)
        view.setUint32(14, infoHeaderSize, true); // biSize
        view.setInt32(18, w, true);                // biWidth
        view.setInt32(22, h, true);                // biHeight (positive = bottom-up)
        view.setUint16(26, 1, true);               // biPlanes
        view.setUint16(28, 24, true);              // biBitCount
        view.setUint32(30, 0, true);               // biCompression (BI_RGB)
        view.setUint32(34, pixelDataSize, true);   // biSizeImage
        view.setInt32(38, 2835, true);             // biXPelsPerMeter (~72 DPI)
        view.setInt32(42, 2835, true);             // biYPelsPerMeter
        view.setUint32(46, 0, true);               // biClrUsed
        view.setUint32(50, 0, true);               // biClrImportant

        // Pixel data: BGR, bottom-up row order
        const pixels = new Uint8Array(buffer, headerSize);
        for (let y = 0; y < h; y++) {
            // BMP stores bottom row first
            const srcRow = (h - 1 - y);
            const dstOffset = y * rowStride;
            for (let x = 0; x < w; x++) {
                const srcIdx = (srcRow * w + x) * 4;
                const dstIdx = dstOffset + x * 3;
                pixels[dstIdx] = rgba[srcIdx + 2];     // B
                pixels[dstIdx + 1] = rgba[srcIdx + 1]; // G
                pixels[dstIdx + 2] = rgba[srcIdx];     // R
            }
            // Padding bytes are already 0 from ArrayBuffer initialization
        }

        return new Blob([buffer], { type: 'image/bmp' });
    }

    async function convertSingle(entry) {
        const dims = getOutputDimensions(entry);
        const canvas = drawToCanvas(entry, dims);
        let blob;

        if (state.settings.format === 'bmp') {
            blob = encodeBMP(canvas);
        } else {
            blob = await canvasToBlob(canvas, state.settings.format, state.settings.quality);
        }

        const dataUrl = URL.createObjectURL(blob);
        const outName = getBaseName(entry.name) + '.' + state.settings.format;

        return {
            id: entry.id,
            name: outName,
            blob,
            dataUrl,
            originalSize: entry.size,
            convertedSize: blob.size,
        };
    }

    /* --- Batch Conversion --- */
    async function convertAll() {
        if (state.files.length === 0 || state.converting) return;

        state.converting = true;
        state.results = [];
        updateConvertButton();
        updateResults();

        dom.batchProgress.classList.add('active');
        dom.outputLed.className = 'status-led warning';
        dom.downloadZipBtn.classList.add('hidden');
        setProgress(0, state.files.length);

        const total = state.files.length;
        let completed = 0;
        let errors = 0;

        for (const entry of state.files) {
            if (!entry.img) {
                // Skip files that haven't loaded yet
                errors++;
                completed++;
                setProgress(completed, total);
                continue;
            }

            try {
                dom.progressText.textContent = `Converting: ${entry.name}`;
                const result = await convertSingle(entry);
                state.results.push(result);
            } catch (err) {
                console.error('Conversion error:', entry.name, err);
                errors++;
            }

            completed++;
            setProgress(completed, total);

            // Yield to the UI between conversions
            await new Promise(r => setTimeout(r, 10));
        }

        state.converting = false;
        updateConvertButton();
        updateResults();

        if (errors > 0) {
            Toast.error(`${errors} file(s) failed to convert`);
            dom.outputLed.className = 'status-led error';
        } else {
            Toast.success(`${state.results.length} image(s) converted successfully`);
            dom.outputLed.className = 'status-led active';
        }

        if (state.results.length > 1) {
            dom.downloadZipBtn.classList.remove('hidden');
        }

        dom.progressText.textContent = `Done: ${state.results.length} converted, ${errors} error(s)`;
    }

    function setProgress(current, total) {
        const pct = total > 0 ? Math.round((current / total) * 100) : 0;
        dom.progressFill.style.width = pct + '%';
        dom.progressLabel.textContent = pct + '%';
    }

    /* --- Results UI --- */
    function updateResults() {
        const hasResults = state.results.length > 0;
        dom.resultsEmpty.classList.toggle('hidden', hasResults);
        dom.resultCount.style.display = hasResults ? '' : 'none';
        dom.resultCount.textContent = state.results.length + ' file' + (state.results.length !== 1 ? 's' : '');

        // Clear old result items (keep the empty state element)
        dom.resultsList.querySelectorAll('.result-item').forEach(el => el.remove());

        state.results.forEach(result => {
            const item = document.createElement('div');
            item.className = 'result-item';

            const pct = ((result.convertedSize / result.originalSize) * 100).toFixed(0);
            const diff = result.convertedSize - result.originalSize;
            const sizeClass = diff <= 0 ? 'smaller' : 'larger';
            const sign = diff <= 0 ? '' : '+';

            item.innerHTML = `
                <img class="result-item-thumb" src="${result.dataUrl}" alt="">
                <div class="result-item-info">
                    <div class="result-item-name">${result.name}</div>
                    <div class="result-item-meta">
                        ${formatBytes(result.convertedSize)}
                        <span class="size-change ${sizeClass}">(${sign}${formatBytes(diff)}, ${pct}%)</span>
                    </div>
                </div>
                <button class="btn btn-secondary btn-sm" data-result-id="${result.id}">Download</button>
            `;

            item.querySelector('button').addEventListener('click', () => {
                downloadBlob(result.blob, result.name);
            });

            dom.resultsList.appendChild(item);
        });
    }

    /* --- ZIP Download --- */
    async function downloadAllZip() {
        if (state.results.length === 0) return;

        dom.downloadZipBtn.disabled = true;
        dom.downloadZipBtn.textContent = 'Creating ZIP...';

        try {
            const zip = new JSZip();
            state.results.forEach(result => {
                zip.file(result.name, result.blob);
            });
            const zipBlob = await zip.generateAsync({ type: 'blob' });
            downloadBlob(zipBlob, 'converted-images.zip');
            Toast.success('ZIP downloaded');
        } catch (err) {
            console.error('ZIP error:', err);
            Toast.error('Failed to create ZIP');
        }

        dom.downloadZipBtn.disabled = false;
        dom.downloadZipBtn.textContent = 'Download All as ZIP';
    }

    /* --- Debounce for Preview --- */
    let previewTimer = null;
    function debouncePreview() {
        clearTimeout(previewTimer);
        previewTimer = setTimeout(() => updatePreview(), 300);
    }

    /* --- Wire Up Events --- */
    function bindEvents() {
        // Drop zone
        initDropZone(dom.dropZone, {
            accept: ACCEPT_STRING,
            multiple: true,
            onFiles: addFiles,
        });

        // Clear all
        dom.clearAllBtn.addEventListener('click', clearAll);

        // Format toggle
        dom.formatGroup.querySelectorAll('.toggle-option').forEach(btn => {
            btn.addEventListener('click', () => handleFormatChange(btn.dataset.format));
        });

        // Quality slider
        dom.qualitySlider.addEventListener('input', (e) => handleQualityChange(e.target.value));

        // Resize checkbox
        dom.resizeCheck.addEventListener('change', (e) => handleResizeToggle(e.target.checked));

        // Preset dropdown
        dom.resizePreset.addEventListener('change', (e) => handlePresetChange(e.target.value));

        // Width / Height inputs
        dom.resizeWidth.addEventListener('input', (e) => handleWidthChange(e.target.value));
        dom.resizeHeight.addEventListener('input', (e) => handleHeightChange(e.target.value));

        // Aspect lock toggle
        dom.aspectLockBtn.addEventListener('click', toggleAspectLock);

        // Convert all
        dom.convertAllBtn.addEventListener('click', convertAll);

        // Download ZIP
        dom.downloadZipBtn.addEventListener('click', downloadAllZip);
    }

    /* --- Init --- */
    function init() {
        cacheDom();
        bindEvents();
        updateFormatUI();
    }

    document.addEventListener('DOMContentLoaded', init);
})();
