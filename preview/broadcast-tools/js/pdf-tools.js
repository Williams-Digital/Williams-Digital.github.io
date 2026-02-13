/* ============================================
   PDF TOOLS — Client-side PDF Operations
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    // Set PDF.js worker
    pdfjsLib.GlobalWorkerOptions.workerSrc =
        'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

    // Initialize tabs
    initTabs(document.getElementById('pdfTabs'));

    // Initialize all three tools
    PdfToImages.init();
    ImagesToPdf.init();
    MergePdfs.init();
});

/* -----------------------------------------------
   Helper: parse a page range string
   "all" or "" => all pages, "1-5" => [1..5],
   "1,3,7" => [1,3,7], "2-4,8" => [2,3,4,8]
   ----------------------------------------------- */
function parsePageRange(input, totalPages) {
    const trimmed = (input || '').trim().toLowerCase();
    if (!trimmed || trimmed === 'all') {
        return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages = new Set();
    const parts = trimmed.split(',');
    for (const part of parts) {
        const p = part.trim();
        if (p.includes('-')) {
            const [startStr, endStr] = p.split('-');
            const start = Math.max(1, parseInt(startStr, 10) || 1);
            const end = Math.min(totalPages, parseInt(endStr, 10) || totalPages);
            for (let i = start; i <= end; i++) pages.add(i);
        } else {
            const num = parseInt(p, 10);
            if (num >= 1 && num <= totalPages) pages.add(num);
        }
    }
    return Array.from(pages).sort((a, b) => a - b);
}

/* -----------------------------------------------
   Helper: get active value from toggle group
   ----------------------------------------------- */
function getToggleValue(groupEl) {
    const active = groupEl.querySelector('.toggle-option.active');
    return active ? active.dataset.value : null;
}

/* -----------------------------------------------
   Helper: wire up toggle group click behavior
   ----------------------------------------------- */
function wireToggle(groupEl) {
    groupEl.querySelectorAll('.toggle-option').forEach(btn => {
        btn.addEventListener('click', () => {
            groupEl.querySelectorAll('.toggle-option').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
}

/* -----------------------------------------------
   Helper: create a drag handle SVG
   ----------------------------------------------- */
function dragHandleSVG() {
    return '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="8" y1="6" x2="8" y2="6.01"/><line x1="16" y1="6" x2="16" y2="6.01"/><line x1="8" y1="12" x2="8" y2="12.01"/><line x1="16" y1="12" x2="16" y2="12.01"/><line x1="8" y1="18" x2="8" y2="18.01"/><line x1="16" y1="18" x2="16" y2="18.01"/></svg>';
}

/* -----------------------------------------------
   Helper: create a remove button SVG
   ----------------------------------------------- */
function removeSVG() {
    return '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
}


/* ============================================
   TAB 1: PDF to Images
   ============================================ */
const PdfToImages = {
    file: null,
    pdfDoc: null,
    blobs: [],       // { blob, filename, pageNum }
    converting: false,

    init() {
        // Drop zone
        initDropZone(document.getElementById('ptiDropZone'), {
            accept: '.pdf',
            multiple: false,
            onFiles: (files) => this.handleFile(files[0]),
        });

        // Toggles
        wireToggle(document.getElementById('ptiFormatToggle'));
        wireToggle(document.getElementById('ptiScaleToggle'));

        // Convert button
        document.getElementById('ptiConvertBtn').addEventListener('click', () => this.convert());

        // Download all ZIP
        document.getElementById('ptiDownloadAllBtn').addEventListener('click', () => this.downloadZip());
    },

    handleFile(file) {
        if (!file || file.type !== 'application/pdf') {
            Toast.error('Please select a valid PDF file');
            return;
        }

        this.file = file;
        this.blobs = [];
        this.pdfDoc = null;

        // Show file info
        const info = document.getElementById('ptiFileInfo');
        info.innerHTML = `
            <div class="file-item">
                <div class="file-item-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                    </svg>
                </div>
                <div class="file-item-info">
                    <div class="file-item-name">${file.name}</div>
                    <div class="file-item-meta">${formatBytes(file.size)} &middot; Loading...</div>
                </div>
            </div>`;

        // LED active
        const led = document.getElementById('ptiSourceLed');
        if (led) led.className = 'status-led active';

        // Load PDF to get page count
        const arrayBufferPromise = readFileAsArrayBuffer(file);
        arrayBufferPromise.then(buffer => {
            return pdfjsLib.getDocument({ data: new Uint8Array(buffer) }).promise;
        }).then(pdf => {
            this.pdfDoc = pdf;
            const meta = info.querySelector('.file-item-meta');
            if (meta) meta.textContent = `${formatBytes(file.size)} \u00B7 ${pdf.numPages} page${pdf.numPages !== 1 ? 's' : ''}`;
            document.getElementById('ptiConvertBtn').disabled = false;
        }).catch(err => {
            Toast.error('Failed to load PDF: ' + err.message);
        });

        // Reset output
        document.getElementById('ptiThumbGrid').innerHTML = '';
        document.getElementById('ptiDownloadAllBtn').classList.add('hidden');
        document.getElementById('ptiProgress').classList.add('hidden');
        document.getElementById('ptiOutputInfo').textContent = '';
        const oLed = document.getElementById('ptiOutputLed');
        if (oLed) oLed.className = 'status-led';
    },

    async convert() {
        if (!this.pdfDoc || this.converting) return;
        this.converting = true;
        this.blobs = [];

        const format = getToggleValue(document.getElementById('ptiFormatToggle')) || 'png';
        const scale = parseFloat(getToggleValue(document.getElementById('ptiScaleToggle')) || '1.5');
        const rangeInput = document.getElementById('ptiPageRange').value;
        const pages = parsePageRange(rangeInput, this.pdfDoc.numPages);

        if (pages.length === 0) {
            Toast.error('No valid pages in the specified range');
            this.converting = false;
            return;
        }

        const convertBtn = document.getElementById('ptiConvertBtn');
        convertBtn.disabled = true;

        const progressEl = document.getElementById('ptiProgress');
        const fillEl = document.getElementById('ptiProgressFill');
        const labelEl = document.getElementById('ptiProgressLabel');
        progressEl.classList.remove('hidden');

        const grid = document.getElementById('ptiThumbGrid');
        grid.innerHTML = '';

        const mimeType = format === 'jpg' ? 'image/jpeg' : 'image/png';
        const ext = format === 'jpg' ? '.jpg' : '.png';
        const quality = format === 'jpg' ? 0.92 : undefined;
        const baseName = getBaseName(this.file.name);

        const oLed = document.getElementById('ptiOutputLed');
        if (oLed) oLed.className = 'status-led warning';

        for (let i = 0; i < pages.length; i++) {
            const pageNum = pages[i];
            const pct = Math.round(((i) / pages.length) * 100);
            fillEl.style.width = pct + '%';
            labelEl.textContent = `Page ${pageNum} of ${this.pdfDoc.numPages} (${pct}%)`;

            try {
                const page = await this.pdfDoc.getPage(pageNum);
                const viewport = page.getViewport({ scale });

                const canvas = document.createElement('canvas');
                canvas.width = viewport.width;
                canvas.height = viewport.height;
                const ctx = canvas.getContext('2d');

                // For JPG, fill white background (since JPG has no alpha)
                if (format === 'jpg') {
                    ctx.fillStyle = '#ffffff';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                }

                await page.render({ canvasContext: ctx, viewport }).promise;

                const blob = await new Promise(resolve => {
                    canvas.toBlob(resolve, mimeType, quality);
                });

                const filename = `${baseName}_page${String(pageNum).padStart(3, '0')}${ext}`;
                this.blobs.push({ blob, filename, pageNum });

                // Create thumbnail
                const thumbDiv = document.createElement('div');
                thumbDiv.className = 'thumb-item';
                const thumbImg = document.createElement('img');
                thumbImg.src = URL.createObjectURL(blob);
                thumbImg.alt = `Page ${pageNum}`;
                const thumbLabel = document.createElement('div');
                thumbLabel.className = 'thumb-label';
                thumbLabel.textContent = `Page ${pageNum}`;

                // Click to download individual
                thumbDiv.addEventListener('click', () => {
                    downloadBlob(blob, filename);
                });

                thumbDiv.appendChild(thumbImg);
                thumbDiv.appendChild(thumbLabel);
                grid.appendChild(thumbDiv);
            } catch (err) {
                Toast.error(`Error rendering page ${pageNum}: ${err.message}`);
            }
        }

        fillEl.style.width = '100%';
        labelEl.textContent = `Done \u2014 ${pages.length} page${pages.length !== 1 ? 's' : ''} converted`;

        document.getElementById('ptiOutputInfo').textContent = `${pages.length} image${pages.length !== 1 ? 's' : ''} \u00B7 ${format.toUpperCase()} \u00B7 ${scale}x`;
        document.getElementById('ptiDownloadAllBtn').classList.remove('hidden');

        if (oLed) oLed.className = 'status-led active';
        convertBtn.disabled = false;
        this.converting = false;
        Toast.success(`Converted ${pages.length} page${pages.length !== 1 ? 's' : ''} to ${format.toUpperCase()}`);
    },

    async downloadZip() {
        if (this.blobs.length === 0) return;

        Toast.info('Creating ZIP archive...');
        const zip = new JSZip();
        const baseName = getBaseName(this.file.name);

        for (const item of this.blobs) {
            zip.file(item.filename, item.blob);
        }

        try {
            const zipBlob = await zip.generateAsync({ type: 'blob' });
            downloadBlob(zipBlob, `${baseName}_pages.zip`);
            Toast.success('ZIP downloaded');
        } catch (err) {
            Toast.error('Failed to create ZIP: ' + err.message);
        }
    },
};


/* ============================================
   TAB 2: Images to PDF
   ============================================ */
const ImagesToPdf = {
    files: [],       // { file, dataUrl }
    pdfBlob: null,

    init() {
        // Drop zone
        initDropZone(document.getElementById('itpDropZone'), {
            accept: 'image/*',
            multiple: true,
            onFiles: (files) => this.addFiles(files),
        });

        // Toggles
        wireToggle(document.getElementById('itpOrientationToggle'));

        // Drag reorder
        initDragReorder(document.getElementById('itpFileList'), (oldIdx, newIdx) => {
            const item = this.files.splice(oldIdx, 1)[0];
            this.files.splice(newIdx, 0, item);
        });

        // Create PDF button
        document.getElementById('itpCreateBtn').addEventListener('click', () => this.createPdf());

        // Download button
        document.getElementById('itpDownloadBtn').addEventListener('click', () => {
            if (this.pdfBlob) downloadBlob(this.pdfBlob, 'images_combined.pdf');
        });
    },

    async addFiles(newFiles) {
        const imageFiles = newFiles.filter(f => f.type.startsWith('image/'));
        if (imageFiles.length === 0) {
            Toast.error('Please select valid image files');
            return;
        }

        for (const file of imageFiles) {
            const dataUrl = await readFileAsDataURL(file);
            this.files.push({ file, dataUrl });
        }

        this.renderFileList();
        document.getElementById('itpCreateBtn').disabled = false;
        const led = document.getElementById('itpSourceLed');
        if (led) led.className = 'status-led active';
    },

    renderFileList() {
        const list = document.getElementById('itpFileList');
        list.innerHTML = '';

        this.files.forEach((item, index) => {
            const el = document.createElement('div');
            el.className = 'file-item';
            el.draggable = true;
            el.setAttribute('data-draggable', '');
            el.innerHTML = `
                <div class="drag-handle">${dragHandleSVG()}</div>
                <div class="file-item-icon">
                    <img src="${item.dataUrl}" alt="${item.file.name}">
                </div>
                <div class="file-item-info">
                    <div class="file-item-name">${item.file.name}</div>
                    <div class="file-item-meta">${formatBytes(item.file.size)}</div>
                </div>
                <div class="file-item-actions">
                    <button class="file-item-remove" data-index="${index}" title="Remove">${removeSVG()}</button>
                </div>`;
            list.appendChild(el);
        });

        // Remove buttons
        list.querySelectorAll('.file-item-remove').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const idx = parseInt(btn.dataset.index, 10);
                this.files.splice(idx, 1);
                this.renderFileList();
                if (this.files.length === 0) {
                    document.getElementById('itpCreateBtn').disabled = true;
                    const led = document.getElementById('itpSourceLed');
                    if (led) led.className = 'status-led';
                }
            });
        });
    },

    async createPdf() {
        if (this.files.length === 0) return;

        const pageSize = document.getElementById('itpPageSize').value;
        const orientation = getToggleValue(document.getElementById('itpOrientationToggle')) || 'portrait';
        const createBtn = document.getElementById('itpCreateBtn');
        createBtn.disabled = true;

        const oLed = document.getElementById('itpOutputLed');
        if (oLed) oLed.className = 'status-led warning';

        try {
            const { jsPDF } = window.jspdf;

            // Page dimensions in mm
            const pageSizes = {
                a4: { portrait: [210, 297], landscape: [297, 210] },
                letter: { portrait: [215.9, 279.4], landscape: [279.4, 215.9] },
            };

            // Determine if we use fixed page or fit-to-image
            const isFit = pageSize === 'fit';

            // Build PDF; for "fit" mode we start with a dummy size and override per page
            const firstOrientation = orientation === 'landscape' ? 'l' : 'p';
            const pdf = isFit
                ? new jsPDF({ orientation: firstOrientation, unit: 'mm', format: [210, 297] })
                : new jsPDF({
                    orientation: firstOrientation,
                    unit: 'mm',
                    format: pageSize === 'letter' ? 'letter' : 'a4',
                });

            for (let i = 0; i < this.files.length; i++) {
                const item = this.files[i];
                const img = await loadImage(item.dataUrl);
                const imgW = img.naturalWidth;
                const imgH = img.naturalHeight;

                if (isFit) {
                    // Convert pixels to mm at 96 DPI
                    const mmW = (imgW / 96) * 25.4;
                    const mmH = (imgH / 96) * 25.4;

                    if (i === 0) {
                        // Adjust first page size
                        pdf.internal.pageSize.setWidth(mmW);
                        pdf.internal.pageSize.setHeight(mmH);
                    } else {
                        pdf.addPage([mmW, mmH]);
                    }
                    pdf.addImage(item.dataUrl, 'JPEG', 0, 0, mmW, mmH);
                } else {
                    const dims = pageSizes[pageSize] || pageSizes.a4;
                    const [pageW, pageH] = dims[orientation] || dims.portrait;
                    const margin = 10; // mm
                    const maxW = pageW - margin * 2;
                    const maxH = pageH - margin * 2;

                    // Scale image to fit within margins
                    const ratio = Math.min(maxW / ((imgW / 96) * 25.4), maxH / ((imgH / 96) * 25.4), 1);
                    const drawW = ((imgW / 96) * 25.4) * ratio;
                    const drawH = ((imgH / 96) * 25.4) * ratio;

                    // Center on page
                    const x = (pageW - drawW) / 2;
                    const y = (pageH - drawH) / 2;

                    if (i > 0) {
                        pdf.addPage();
                    }
                    pdf.addImage(item.dataUrl, 'JPEG', x, y, drawW, drawH);
                }
            }

            this.pdfBlob = pdf.output('blob');

            // Show preview using PDF.js
            const preview = document.getElementById('itpPreview');
            const arrayBuffer = await this.pdfBlob.arrayBuffer();
            const pdfPreview = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
            const page = await pdfPreview.getPage(1);
            const viewport = page.getViewport({ scale: 1.5 });

            const canvas = document.createElement('canvas');
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            canvas.className = 'preview-pdf';
            const ctx = canvas.getContext('2d');
            await page.render({ canvasContext: ctx, viewport }).promise;

            preview.innerHTML = '';
            preview.appendChild(canvas);

            document.getElementById('itpDownloadBtn').classList.remove('hidden');
            if (oLed) oLed.className = 'status-led active';
            Toast.success(`PDF created with ${this.files.length} page${this.files.length !== 1 ? 's' : ''}`);
        } catch (err) {
            Toast.error('Failed to create PDF: ' + err.message);
            if (oLed) oLed.className = 'status-led error';
        }

        createBtn.disabled = false;
    },
};


/* ============================================
   TAB 3: Merge PDFs
   ============================================ */
const MergePdfs = {
    files: [],       // { file, pageCount, arrayBuffer }
    mergedBlob: null,

    init() {
        // Drop zone
        initDropZone(document.getElementById('mergeDropZone'), {
            accept: '.pdf',
            multiple: true,
            onFiles: (files) => this.addFiles(files),
        });

        // Drag reorder
        initDragReorder(document.getElementById('mergeFileList'), (oldIdx, newIdx) => {
            const item = this.files.splice(oldIdx, 1)[0];
            this.files.splice(newIdx, 0, item);
            this.renderFileList();
        });

        // Merge button
        document.getElementById('mergeBtn').addEventListener('click', () => this.merge());

        // Download button
        document.getElementById('mergeDownloadBtn').addEventListener('click', () => {
            if (this.mergedBlob) downloadBlob(this.mergedBlob, 'merged.pdf');
        });
    },

    async addFiles(newFiles) {
        const pdfFiles = newFiles.filter(f => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf'));
        if (pdfFiles.length === 0) {
            Toast.error('Please select valid PDF files');
            return;
        }

        for (const file of pdfFiles) {
            try {
                const arrayBuffer = await readFileAsArrayBuffer(file);
                // Get page count using pdf-lib
                const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
                const pageCount = pdfDoc.getPageCount();
                this.files.push({ file, pageCount, arrayBuffer });
            } catch (err) {
                Toast.error(`Could not read "${file.name}": ${err.message}`);
            }
        }

        this.renderFileList();
        document.getElementById('mergeBtn').disabled = this.files.length < 2;
        const led = document.getElementById('mergeSourceLed');
        if (led) led.className = this.files.length > 0 ? 'status-led active' : 'status-led';
    },

    renderFileList() {
        const list = document.getElementById('mergeFileList');
        list.innerHTML = '';

        let totalPages = 0;

        this.files.forEach((item, index) => {
            totalPages += item.pageCount;
            const el = document.createElement('div');
            el.className = 'file-item';
            el.draggable = true;
            el.setAttribute('data-draggable', '');
            el.innerHTML = `
                <div class="drag-handle">${dragHandleSVG()}</div>
                <div class="file-item-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                    </svg>
                </div>
                <div class="file-item-info">
                    <div class="file-item-name">${item.file.name}</div>
                    <div class="file-item-meta">${formatBytes(item.file.size)} &middot; ${item.pageCount} page${item.pageCount !== 1 ? 's' : ''}</div>
                </div>
                <div class="file-item-actions">
                    <button class="file-item-remove" data-index="${index}" title="Remove">${removeSVG()}</button>
                </div>`;
            list.appendChild(el);
        });

        // Summary
        const summary = document.getElementById('mergeSummary');
        if (this.files.length > 0) {
            summary.textContent = `${this.files.length} file${this.files.length !== 1 ? 's' : ''} \u00B7 ${totalPages} total page${totalPages !== 1 ? 's' : ''}`;
        } else {
            summary.textContent = '';
        }

        // Remove buttons
        list.querySelectorAll('.file-item-remove').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const idx = parseInt(btn.dataset.index, 10);
                this.files.splice(idx, 1);
                this.renderFileList();
                document.getElementById('mergeBtn').disabled = this.files.length < 2;
                const led = document.getElementById('mergeSourceLed');
                if (led) led.className = this.files.length > 0 ? 'status-led active' : 'status-led';
            });
        });
    },

    async merge() {
        if (this.files.length < 2) return;

        const mergeBtn = document.getElementById('mergeBtn');
        mergeBtn.disabled = true;

        const progressEl = document.getElementById('mergeProgress');
        const fillEl = document.getElementById('mergeProgressFill');
        const labelEl = document.getElementById('mergeProgressLabel');
        progressEl.classList.remove('hidden');

        const oLed = document.getElementById('mergeOutputLed');
        if (oLed) oLed.className = 'status-led warning';

        try {
            const mergedPdf = await PDFLib.PDFDocument.create();

            for (let i = 0; i < this.files.length; i++) {
                const item = this.files[i];
                const pct = Math.round((i / this.files.length) * 100);
                fillEl.style.width = pct + '%';
                labelEl.textContent = `Merging "${item.file.name}" (${pct}%)`;

                const srcDoc = await PDFLib.PDFDocument.load(item.arrayBuffer, { ignoreEncryption: true });
                const copiedPages = await mergedPdf.copyPages(srcDoc, srcDoc.getPageIndices());
                for (const page of copiedPages) {
                    mergedPdf.addPage(page);
                }
            }

            fillEl.style.width = '100%';
            labelEl.textContent = 'Finalizing...';

            const mergedBytes = await mergedPdf.save();
            this.mergedBlob = new Blob([mergedBytes], { type: 'application/pdf' });

            const totalPages = mergedPdf.getPageCount();
            labelEl.textContent = `Done \u2014 ${totalPages} page${totalPages !== 1 ? 's' : ''} merged`;

            document.getElementById('mergeDownloadBtn').classList.remove('hidden');
            if (oLed) oLed.className = 'status-led active';
            Toast.success(`Merged ${this.files.length} PDFs into ${totalPages} pages`);
        } catch (err) {
            Toast.error('Merge failed: ' + err.message);
            if (oLed) oLed.className = 'status-led error';
            fillEl.style.width = '0%';
            labelEl.textContent = 'Error';
        }

        mergeBtn.disabled = false;
    },
};
