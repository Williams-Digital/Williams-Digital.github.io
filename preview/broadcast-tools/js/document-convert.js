/* ============================================
   DOCUMENT CONVERTER — Client-Side Logic
   DOCX -> HTML/PDF  |  CSV <-> XLSX
   ============================================ */

(function () {
    'use strict';

    /* -------------------------------------------------------
       State
    ------------------------------------------------------- */
    const state = {
        docx: {
            file: null,
            htmlContent: '',
            outputFormat: 'html',   // 'html' | 'pdf'
        },
        sheet: {
            file: null,
            workbook: null,
            inputFormat: null,      // 'csv' | 'xlsx' | 'xls'
            outputFormat: 'csv',    // 'csv' | 'xlsx'
            selectedSheet: 0,
        },
    };

    /* -------------------------------------------------------
       DOM References
    ------------------------------------------------------- */
    const dom = {};

    function cacheDom() {
        // Tabs
        dom.mainTabs = document.getElementById('mainTabs');

        // DOCX tab
        dom.docxDropZone     = document.getElementById('docxDropZone');
        dom.docxFileInfo     = document.getElementById('docxFileInfo');
        dom.docxFormatToggle = document.getElementById('docxFormatToggle');
        dom.docxPreview      = document.getElementById('docxPreview');
        dom.docxConvertBtn   = document.getElementById('docxConvertBtn');
        dom.docxStatus       = document.getElementById('docxStatus');
        dom.docxSourceLed    = document.getElementById('docxSourceLed');
        dom.docxPreviewLed   = document.getElementById('docxPreviewLed');
        dom.docxOutputLed    = document.getElementById('docxOutputLed');

        // Spreadsheet tab
        dom.sheetDropZone      = document.getElementById('sheetDropZone');
        dom.sheetFileInfo      = document.getElementById('sheetFileInfo');
        dom.sheetFormatToggle  = document.getElementById('sheetFormatToggle');
        dom.sheetDetectedFormat = document.getElementById('sheetDetectedFormat');
        dom.sheetSelectorGroup = document.getElementById('sheetSelectorGroup');
        dom.sheetSelector      = document.getElementById('sheetSelector');
        dom.sheetPreview       = document.getElementById('sheetPreview');
        dom.sheetPreviewInfo   = document.getElementById('sheetPreviewInfo');
        dom.sheetConvertBtn    = document.getElementById('sheetConvertBtn');
        dom.sheetStatus        = document.getElementById('sheetStatus');
        dom.sheetSourceLed     = document.getElementById('sheetSourceLed');
        dom.sheetPreviewLed    = document.getElementById('sheetPreviewLed');
        dom.sheetOutputLed     = document.getElementById('sheetOutputLed');
    }

    /* -------------------------------------------------------
       Toggle Groups
    ------------------------------------------------------- */
    function initToggleGroup(container, onChange) {
        const options = container.querySelectorAll('.toggle-option');
        options.forEach(btn => {
            btn.addEventListener('click', () => {
                options.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                if (onChange) onChange(btn.dataset.value);
            });
        });
    }

    /* -------------------------------------------------------
       File Info Display
    ------------------------------------------------------- */
    function showFileInfo(container, file, onRemove) {
        container.innerHTML = '';
        const item = document.createElement('div');
        item.className = 'file-item';
        item.innerHTML = `
            <div class="file-item-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-3)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                </svg>
            </div>
            <div class="file-item-info">
                <div class="file-item-name">${file.name}</div>
                <div class="file-item-meta">${formatBytes(file.size)}</div>
            </div>
            <div class="file-item-actions">
                <button class="file-item-remove" title="Remove file">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                </button>
            </div>
        `;
        item.querySelector('.file-item-remove').addEventListener('click', (e) => {
            e.stopPropagation();
            if (onRemove) onRemove();
        });
        container.appendChild(item);
    }

    function clearFileInfo(container) {
        container.innerHTML = '';
    }

    /* -------------------------------------------------------
       LED helpers
    ------------------------------------------------------- */
    function setLed(el, state) {
        if (!el) return;
        el.className = 'status-led';
        if (state) el.classList.add(state);
    }

    /* -------------------------------------------------------
       Status text helper
    ------------------------------------------------------- */
    function setStatus(el, text, type) {
        if (!el) return;
        el.textContent = text;
        el.className = 'status-text';
        if (type) el.classList.add(type);
    }

    /* -------------------------------------------------------
       DOCX CONVERSION
    ------------------------------------------------------- */

    async function handleDocxFile(files) {
        const file = files[0];
        if (!file) return;

        const ext = getFileExtension(file.name);
        if (ext !== 'docx') {
            Toast.error('Please select a .docx file');
            return;
        }

        state.docx.file = file;
        state.docx.htmlContent = '';

        showFileInfo(dom.docxFileInfo, file, clearDocx);
        setLed(dom.docxSourceLed, 'active');
        setLed(dom.docxPreviewLed, null);
        setLed(dom.docxOutputLed, null);
        dom.docxConvertBtn.disabled = true;
        setStatus(dom.docxStatus, '');

        // Convert to HTML for preview
        try {
            setStatus(dom.docxStatus, 'Parsing document...');
            const arrayBuffer = await readFileAsArrayBuffer(file);
            const result = await mammoth.convertToHtml(
                { arrayBuffer: arrayBuffer },
                {
                    styleMap: [
                        "p[style-name='Heading 1'] => h1:fresh",
                        "p[style-name='Heading 2'] => h2:fresh",
                        "p[style-name='Heading 3'] => h3:fresh",
                        "p[style-name='Heading 4'] => h4:fresh",
                        "p[style-name='Heading 5'] => h5:fresh",
                        "p[style-name='Heading 6'] => h6:fresh",
                    ],
                }
            );

            state.docx.htmlContent = result.value;

            // Show preview
            dom.docxPreview.classList.remove('empty');
            dom.docxPreview.innerHTML = state.docx.htmlContent || '<p style="color:var(--text-secondary)">Document is empty or contains no convertible content.</p>';
            setLed(dom.docxPreviewLed, 'active');

            // Show any warnings
            if (result.messages && result.messages.length > 0) {
                const warnings = result.messages.map(m => m.message).join('; ');
                setStatus(dom.docxStatus, 'Parsed with warnings: ' + warnings);
            } else {
                setStatus(dom.docxStatus, 'Document parsed successfully');
            }

            dom.docxConvertBtn.disabled = false;
            setLed(dom.docxOutputLed, 'warning');

        } catch (err) {
            console.error('DOCX parse error:', err);
            Toast.error('Failed to parse DOCX file');
            setStatus(dom.docxStatus, 'Error: ' + err.message, 'error');
            setLed(dom.docxPreviewLed, 'error');
        }
    }

    function clearDocx() {
        state.docx.file = null;
        state.docx.htmlContent = '';
        clearFileInfo(dom.docxFileInfo);
        dom.docxPreview.innerHTML = 'Load a .docx file to see a preview';
        dom.docxPreview.classList.add('empty');
        dom.docxConvertBtn.disabled = true;
        setLed(dom.docxSourceLed, null);
        setLed(dom.docxPreviewLed, null);
        setLed(dom.docxOutputLed, null);
        setStatus(dom.docxStatus, '');
    }

    async function convertDocx() {
        if (!state.docx.htmlContent) return;

        const baseName = getBaseName(state.docx.file.name);
        dom.docxConvertBtn.disabled = true;
        setStatus(dom.docxStatus, 'Converting...');

        try {
            if (state.docx.outputFormat === 'html') {
                convertDocxToHtml(baseName);
            } else {
                await convertDocxToPdf(baseName);
            }
        } catch (err) {
            console.error('Conversion error:', err);
            Toast.error('Conversion failed: ' + err.message);
            setStatus(dom.docxStatus, 'Conversion failed', 'error');
            setLed(dom.docxOutputLed, 'error');
        } finally {
            dom.docxConvertBtn.disabled = false;
        }
    }

    function convertDocxToHtml(baseName) {
        const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${baseName}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 800px;
            margin: 2rem auto;
            padding: 0 1rem;
            line-height: 1.6;
            color: #1a1a1a;
        }
        h1, h2, h3, h4, h5, h6 {
            margin: 1.5rem 0 0.75rem;
            line-height: 1.3;
        }
        p { margin: 0.5rem 0; }
        table { border-collapse: collapse; margin: 1rem 0; }
        table td, table th { border: 1px solid #ccc; padding: 0.5rem; }
        img { max-width: 100%; }
    </style>
</head>
<body>
${state.docx.htmlContent}
</body>
</html>`;

        const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
        downloadBlob(blob, baseName + '.html');

        setStatus(dom.docxStatus, 'Downloaded ' + baseName + '.html', 'success');
        setLed(dom.docxOutputLed, 'active');
        Toast.success('HTML file downloaded');
    }

    async function convertDocxToPdf(baseName) {
        setStatus(dom.docxStatus, 'Rendering PDF...');

        // Create a temporary off-screen container with the HTML content
        const container = document.createElement('div');
        container.style.cssText = 'position:fixed;left:-9999px;top:0;width:794px;padding:40px;background:#fff;color:#1a1a1a;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;font-size:12pt;line-height:1.6;';
        container.innerHTML = `
            <style>
                h1,h2,h3,h4,h5,h6 { margin:1rem 0 0.5rem; color:#1a1a1a; line-height:1.3; }
                p { margin:0.4rem 0; }
                table { border-collapse:collapse; margin:0.5rem 0; }
                table td, table th { border:1px solid #ccc; padding:0.4rem; }
                img { max-width:100%; }
                ul, ol { padding-left:1.5rem; }
            </style>
            ${state.docx.htmlContent}
        `;
        document.body.appendChild(container);

        try {
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4',
            });

            await pdf.html(container, {
                callback: function (doc) {
                    doc.save(baseName + '.pdf');
                },
                x: 0,
                y: 0,
                width: 170,
                windowWidth: 794,
                margin: [15, 15, 15, 15],
                autoPaging: 'text',
                html2canvas: {
                    scale: 0.264,       // ~72 DPI mapping for mm units
                    useCORS: true,
                    logging: false,
                },
            });

            setStatus(dom.docxStatus, 'Downloaded ' + baseName + '.pdf', 'success');
            setLed(dom.docxOutputLed, 'active');
            Toast.success('PDF file downloaded');

        } finally {
            document.body.removeChild(container);
        }
    }

    /* -------------------------------------------------------
       SPREADSHEET CONVERSION
    ------------------------------------------------------- */

    async function handleSheetFile(files) {
        const file = files[0];
        if (!file) return;

        const ext = getFileExtension(file.name);
        if (!['csv', 'xlsx', 'xls'].includes(ext)) {
            Toast.error('Please select a .csv, .xlsx, or .xls file');
            return;
        }

        state.sheet.file = file;
        state.sheet.inputFormat = ext;
        state.sheet.workbook = null;
        state.sheet.selectedSheet = 0;

        showFileInfo(dom.sheetFileInfo, file, clearSheet);
        setLed(dom.sheetSourceLed, 'active');
        setLed(dom.sheetPreviewLed, null);
        setLed(dom.sheetOutputLed, null);
        dom.sheetConvertBtn.disabled = true;
        setStatus(dom.sheetStatus, '');

        // Update detected format
        const formatLabels = { csv: 'CSV', xlsx: 'XLSX (Excel)', xls: 'XLS (Legacy Excel)' };
        dom.sheetDetectedFormat.textContent = formatLabels[ext] || ext.toUpperCase();

        // Smart default: if input is csv, output should be xlsx; if input is excel, output should be csv
        if (ext === 'csv') {
            setToggleValue(dom.sheetFormatToggle, 'xlsx');
            state.sheet.outputFormat = 'xlsx';
        } else {
            setToggleValue(dom.sheetFormatToggle, 'csv');
            state.sheet.outputFormat = 'csv';
        }

        // Parse file
        try {
            setStatus(dom.sheetStatus, 'Parsing spreadsheet...');
            const data = await readFileAsArrayBuffer(file);
            const workbook = XLSX.read(data, { type: 'array' });
            state.sheet.workbook = workbook;

            // Populate sheet selector
            populateSheetSelector(workbook);

            // Show/hide sheet selector based on number of sheets
            if (ext === 'csv' || workbook.SheetNames.length <= 1) {
                dom.sheetSelectorGroup.classList.add('hidden');
            } else {
                dom.sheetSelectorGroup.classList.remove('hidden');
            }

            // Render preview
            renderSheetPreview();

            dom.sheetConvertBtn.disabled = false;
            setLed(dom.sheetOutputLed, 'warning');
            setStatus(dom.sheetStatus, 'Ready to convert');

        } catch (err) {
            console.error('Spreadsheet parse error:', err);
            Toast.error('Failed to parse spreadsheet');
            setStatus(dom.sheetStatus, 'Error: ' + err.message, 'error');
            setLed(dom.sheetPreviewLed, 'error');
        }
    }

    function clearSheet() {
        state.sheet.file = null;
        state.sheet.workbook = null;
        state.sheet.inputFormat = null;
        state.sheet.selectedSheet = 0;

        clearFileInfo(dom.sheetFileInfo);
        dom.sheetDetectedFormat.textContent = 'No file loaded';
        dom.sheetSelectorGroup.classList.add('hidden');
        dom.sheetPreview.innerHTML = 'Load a spreadsheet file to see a preview';
        dom.sheetPreview.classList.add('empty');
        dom.sheetPreviewInfo.textContent = '';
        dom.sheetConvertBtn.disabled = true;
        setLed(dom.sheetSourceLed, null);
        setLed(dom.sheetPreviewLed, null);
        setLed(dom.sheetOutputLed, null);
        setStatus(dom.sheetStatus, '');
    }

    function populateSheetSelector(workbook) {
        dom.sheetSelector.innerHTML = '';
        workbook.SheetNames.forEach((name, i) => {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = name;
            dom.sheetSelector.appendChild(option);
        });
        dom.sheetSelector.value = 0;
    }

    function renderSheetPreview() {
        const wb = state.sheet.workbook;
        if (!wb) return;

        const sheetName = wb.SheetNames[state.sheet.selectedSheet];
        const sheet = wb.Sheets[sheetName];
        if (!sheet) return;

        // Get data as array of arrays
        const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

        if (jsonData.length === 0) {
            dom.sheetPreview.innerHTML = 'Sheet is empty';
            dom.sheetPreview.classList.add('empty');
            dom.sheetPreviewInfo.textContent = '';
            setLed(dom.sheetPreviewLed, 'warning');
            return;
        }

        const headers = jsonData[0];
        const rows = jsonData.slice(1, 21); // First 20 data rows
        const totalRows = jsonData.length - 1;

        // Build table HTML
        let html = '<table class="data-table"><thead><tr>';
        headers.forEach(h => {
            html += '<th>' + escapeHtml(String(h)) + '</th>';
        });
        html += '</tr></thead><tbody>';

        rows.forEach(row => {
            html += '<tr>';
            headers.forEach((_, ci) => {
                const cell = row[ci] !== undefined ? row[ci] : '';
                html += '<td>' + escapeHtml(String(cell)) + '</td>';
            });
            html += '</tr>';
        });

        html += '</tbody></table>';

        dom.sheetPreview.innerHTML = html;
        dom.sheetPreview.classList.remove('empty');
        setLed(dom.sheetPreviewLed, 'active');

        // Info line
        const showing = Math.min(20, totalRows);
        dom.sheetPreviewInfo.textContent = `Showing ${showing} of ${totalRows} rows`;
    }

    function convertSheet() {
        const wb = state.sheet.workbook;
        if (!wb || !state.sheet.file) return;

        const baseName = getBaseName(state.sheet.file.name);
        dom.sheetConvertBtn.disabled = true;
        setStatus(dom.sheetStatus, 'Converting...');

        try {
            if (state.sheet.outputFormat === 'csv') {
                convertSheetToCsv(wb, baseName);
            } else {
                convertSheetToXlsx(wb, baseName);
            }
        } catch (err) {
            console.error('Sheet conversion error:', err);
            Toast.error('Conversion failed: ' + err.message);
            setStatus(dom.sheetStatus, 'Conversion failed', 'error');
            setLed(dom.sheetOutputLed, 'error');
        } finally {
            dom.sheetConvertBtn.disabled = false;
        }
    }

    function convertSheetToCsv(wb, baseName) {
        const sheetName = wb.SheetNames[state.sheet.selectedSheet];
        const sheet = wb.Sheets[sheetName];
        const csvContent = XLSX.utils.sheet_to_csv(sheet);

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
        downloadBlob(blob, baseName + '.csv');

        setStatus(dom.sheetStatus, 'Downloaded ' + baseName + '.csv', 'success');
        setLed(dom.sheetOutputLed, 'active');
        Toast.success('CSV file downloaded');
    }

    function convertSheetToXlsx(wb, baseName) {
        const wbOut = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([wbOut], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        downloadBlob(blob, baseName + '.xlsx');

        setStatus(dom.sheetStatus, 'Downloaded ' + baseName + '.xlsx', 'success');
        setLed(dom.sheetOutputLed, 'active');
        Toast.success('Excel file downloaded');
    }

    /* -------------------------------------------------------
       Utilities
    ------------------------------------------------------- */
    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    function setToggleValue(container, value) {
        const options = container.querySelectorAll('.toggle-option');
        options.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.value === value);
        });
    }

    /* -------------------------------------------------------
       Initialization
    ------------------------------------------------------- */
    function init() {
        cacheDom();

        // Main tabs
        initTabs(dom.mainTabs);

        // DOCX drop zone
        initDropZone(dom.docxDropZone, {
            accept: '.docx',
            multiple: false,
            onFiles: handleDocxFile,
        });

        // DOCX output format toggle
        initToggleGroup(dom.docxFormatToggle, (value) => {
            state.docx.outputFormat = value;
        });

        // DOCX convert button
        dom.docxConvertBtn.addEventListener('click', convertDocx);

        // Spreadsheet drop zone
        initDropZone(dom.sheetDropZone, {
            accept: '.csv,.xlsx,.xls',
            multiple: false,
            onFiles: handleSheetFile,
        });

        // Spreadsheet output format toggle
        initToggleGroup(dom.sheetFormatToggle, (value) => {
            state.sheet.outputFormat = value;
        });

        // Sheet selector change
        dom.sheetSelector.addEventListener('change', () => {
            state.sheet.selectedSheet = parseInt(dom.sheetSelector.value, 10);
            renderSheetPreview();
        });

        // Spreadsheet convert button
        dom.sheetConvertBtn.addEventListener('click', convertSheet);
    }

    document.addEventListener('DOMContentLoaded', init);

})();
