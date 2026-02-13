/* ============================================
   FORMAT REFERENCE
   Searchable broadcast format database
   ============================================ */

(function () {

    const FORMATS = [
        // SD
        { cat: 'sd', name: 'NTSC SD', resolution: '720x480', aspect: '4:3 / 16:9', scan: 'Interlaced', framerates: '29.97i', colorspace: 'Rec. 601', codecs: 'MPEG-2, DV25, XDCAM' },
        { cat: 'sd', name: 'PAL SD', resolution: '720x576', aspect: '4:3 / 16:9', scan: 'Interlaced', framerates: '25i', colorspace: 'Rec. 601', codecs: 'MPEG-2, DV25, XDCAM' },
        { cat: 'sd', name: 'NTSC Widescreen', resolution: '720x480', aspect: '16:9', scan: 'Interlaced', framerates: '29.97i', colorspace: 'Rec. 601', codecs: 'MPEG-2, DV' },
        { cat: 'sd', name: 'PAL Widescreen', resolution: '720x576', aspect: '16:9', scan: 'Interlaced', framerates: '25i', colorspace: 'Rec. 601', codecs: 'MPEG-2, DV' },

        // HD
        { cat: 'hd', name: '720p HD', resolution: '1280x720', aspect: '16:9', scan: 'Progressive', framerates: '23.976, 25, 29.97, 50, 59.94, 60', colorspace: 'Rec. 709', codecs: 'H.264, ProRes, DNxHD, XDCAM' },
        { cat: 'hd', name: '1080i HD', resolution: '1920x1080', aspect: '16:9', scan: 'Interlaced', framerates: '25i, 29.97i', colorspace: 'Rec. 709', codecs: 'H.264, MPEG-2, XDCAM HD, HDV' },
        { cat: 'hd', name: '1080p HD', resolution: '1920x1080', aspect: '16:9', scan: 'Progressive', framerates: '23.976, 24, 25, 29.97, 30, 50, 59.94', colorspace: 'Rec. 709', codecs: 'H.264, H.265, ProRes, DNxHR' },
        { cat: 'hd', name: '1080p HFR', resolution: '1920x1080', aspect: '16:9', scan: 'Progressive', framerates: '100, 119.88, 120', colorspace: 'Rec. 709', codecs: 'H.264, H.265, ProRes' },

        // UHD
        { cat: 'uhd', name: 'UHD 4K', resolution: '3840x2160', aspect: '16:9', scan: 'Progressive', framerates: '23.976, 24, 25, 29.97, 30, 50, 59.94, 60', colorspace: 'Rec. 709 / Rec. 2020', codecs: 'H.265, H.264, ProRes, DNxHR, AV1' },
        { cat: 'uhd', name: 'UHD 4K HDR', resolution: '3840x2160', aspect: '16:9', scan: 'Progressive', framerates: '23.976, 24, 25, 29.97, 50, 59.94', colorspace: 'Rec. 2020 (HDR10/HLG/DV)', codecs: 'H.265, AV1, VP9' },
        { cat: 'uhd', name: 'UHD 4K HFR', resolution: '3840x2160', aspect: '16:9', scan: 'Progressive', framerates: '100, 119.88, 120', colorspace: 'Rec. 2020', codecs: 'H.265, AV1' },
        { cat: 'uhd', name: '5K', resolution: '5120x2880', aspect: '16:9', scan: 'Progressive', framerates: '23.976, 24, 25, 30, 60', colorspace: 'Rec. 709 / Rec. 2020', codecs: 'ProRes, H.265, BRAW' },
        { cat: 'uhd', name: '6K', resolution: '6144x3456', aspect: '16:9', scan: 'Progressive', framerates: '23.976, 24, 25, 30, 60', colorspace: 'Rec. 709 / Rec. 2020', codecs: 'BRAW, ProRes RAW, R3D' },
        { cat: 'uhd', name: '8K UHD', resolution: '7680x4320', aspect: '16:9', scan: 'Progressive', framerates: '23.976, 24, 25, 29.97, 30, 50, 59.94', colorspace: 'Rec. 2020', codecs: 'H.265, H.266 (VVC), AV1' },

        // Cinema
        { cat: 'cinema', name: '2K DCI', resolution: '2048x1080', aspect: '1.90:1 (Flat)', scan: 'Progressive', framerates: '24, 25, 30, 48', colorspace: 'DCI-P3', codecs: 'JPEG 2000 (DCP)' },
        { cat: 'cinema', name: '2K Scope', resolution: '2048x858', aspect: '2.39:1', scan: 'Progressive', framerates: '24', colorspace: 'DCI-P3', codecs: 'JPEG 2000 (DCP)' },
        { cat: 'cinema', name: '2K Flat', resolution: '1998x1080', aspect: '1.85:1', scan: 'Progressive', framerates: '24', colorspace: 'DCI-P3', codecs: 'JPEG 2000 (DCP)' },
        { cat: 'cinema', name: '4K DCI', resolution: '4096x2160', aspect: '1.90:1 (Full)', scan: 'Progressive', framerates: '24, 25, 30, 48, 60', colorspace: 'DCI-P3', codecs: 'JPEG 2000 (DCP), ProRes' },
        { cat: 'cinema', name: '4K Scope', resolution: '4096x1716', aspect: '2.39:1', scan: 'Progressive', framerates: '24', colorspace: 'DCI-P3', codecs: 'JPEG 2000 (DCP)' },
        { cat: 'cinema', name: '4K Flat', resolution: '3996x2160', aspect: '1.85:1', scan: 'Progressive', framerates: '24', colorspace: 'DCI-P3', codecs: 'JPEG 2000 (DCP)' },
        { cat: 'cinema', name: 'IMAX Digital', resolution: '5616x4096', aspect: '1.37:1', scan: 'Progressive', framerates: '24, 48', colorspace: 'DCI-P3', codecs: 'JPEG 2000' },
        { cat: 'cinema', name: 'IMAX Laser', resolution: '5616x4096', aspect: '1.43:1', scan: 'Progressive', framerates: '24, 48', colorspace: 'Rec. 2020', codecs: 'JPEG 2000' },
    ];

    const CAT_LABELS = { sd: 'SD', hd: 'HD', uhd: 'UHD', cinema: 'Cinema' };

    const tableBody = document.getElementById('formatTableBody');
    const searchInput = document.getElementById('searchInput');
    const categoryFilter = document.getElementById('categoryFilter');
    const resultCount = document.getElementById('resultCount');

    function renderTable() {
        tableBody.innerHTML = FORMATS.map((f, i) => `
            <tr data-index="${i}" data-cat="${f.cat}">
                <td><span class="cat-badge cat-${f.cat}">${CAT_LABELS[f.cat]}</span></td>
                <td class="format-name">${f.name}</td>
                <td class="mono">${f.resolution}</td>
                <td class="mono">${f.aspect}</td>
                <td>${f.scan}</td>
                <td>${f.framerates.split(', ').map(r => `<span class="info-tag">${r}</span>`).join(' ')}</td>
                <td>${f.colorspace}</td>
                <td>${f.codecs.split(', ').map(c => `<span class="info-tag">${c}</span>`).join(' ')}</td>
            </tr>
        `).join('');
    }

    function filterTable() {
        const query = searchInput.value.toLowerCase().trim();
        const cat = categoryFilter.value;
        const rows = tableBody.querySelectorAll('tr');
        let visible = 0;

        rows.forEach(row => {
            const idx = parseInt(row.dataset.index);
            const f = FORMATS[idx];
            const matchesCat = cat === 'all' || f.cat === cat;
            const searchStr = `${f.name} ${f.resolution} ${f.aspect} ${f.scan} ${f.framerates} ${f.colorspace} ${f.codecs}`.toLowerCase();
            const matchesSearch = !query || searchStr.includes(query);

            if (matchesCat && matchesSearch) {
                row.classList.remove('hidden');
                visible++;
            } else {
                row.classList.add('hidden');
            }
        });

        resultCount.textContent = query || cat !== 'all'
            ? `Showing ${visible} of ${FORMATS.length} formats`
            : `Showing all ${FORMATS.length} formats`;
    }

    // Event listeners
    searchInput.addEventListener('input', filterTable);
    categoryFilter.addEventListener('change', filterTable);

    // Sorting
    document.querySelectorAll('.ref-table th').forEach(th => {
        th.addEventListener('click', () => {
            const col = th.dataset.col;
            const isAsc = th.classList.contains('sorted') && th.querySelector('.sort-arrow').textContent === '\u25B2';

            // Reset all
            document.querySelectorAll('.ref-table th').forEach(t => {
                t.classList.remove('sorted');
                t.querySelector('.sort-arrow').textContent = '\u25B2';
            });

            th.classList.add('sorted');
            th.querySelector('.sort-arrow').textContent = isAsc ? '\u25BC' : '\u25B2';

            FORMATS.sort((a, b) => {
                let va = a[col] || '';
                let vb = b[col] || '';

                // Try numeric sort for resolution
                if (col === 'resolution') {
                    const pa = parseInt(va);
                    const pb = parseInt(vb);
                    return isAsc ? pb - pa : pa - pb;
                }

                va = va.toString().toLowerCase();
                vb = vb.toString().toLowerCase();
                return isAsc ? vb.localeCompare(va) : va.localeCompare(vb);
            });

            renderTable();
            filterTable();
        });
    });

    // Initial render
    renderTable();
})();
