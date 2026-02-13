/* ============================================
   ASPECT RATIO CALCULATOR
   Full aspect ratio logic with visual preview
   ============================================ */

(function () {
    'use strict';

    /* --- Common Ratios Data --- */
    const COMMON_RATIOS = [
        {
            name: '16:9',
            w: 16, h: 9,
            desc: 'HD / UHD',
            resolutions: ['1920x1080', '3840x2160', '1280x720', '2560x1440'],
        },
        {
            name: '4:3',
            w: 4, h: 3,
            desc: 'SD Broadcast',
            resolutions: ['1440x1080', '720x480', '1024x768', '640x480'],
        },
        {
            name: '21:9',
            w: 21, h: 9,
            desc: 'Ultrawide',
            resolutions: ['2560x1080', '3440x1440', '5120x2160'],
        },
        {
            name: '1:1',
            w: 1, h: 1,
            desc: 'Social Square',
            resolutions: ['1080x1080', '720x720'],
        },
        {
            name: '9:16',
            w: 9, h: 16,
            desc: 'Vertical / Stories',
            resolutions: ['1080x1920', '720x1280'],
        },
        {
            name: '2.39:1',
            w: 2.39, h: 1,
            desc: 'Anamorphic Cinema',
            resolutions: ['2048x858', '4096x1716'],
        },
    ];

    /* --- DOM References --- */
    const calcWidth = document.getElementById('calcWidth');
    const calcHeight = document.getElementById('calcHeight');
    const lockBtn = document.getElementById('lockBtn');
    const lockPath = document.getElementById('lockPath');
    const ratioDisplay = document.getElementById('ratioDisplay');
    const ratioDecimal = document.getElementById('ratioDecimal');

    const srcWidth = document.getElementById('srcWidth');
    const srcHeight = document.getElementById('srcHeight');
    const targetRatio = document.getElementById('targetRatio');
    const customRatioRow = document.getElementById('customRatioRow');
    const customRatioW = document.getElementById('customRatioW');
    const customRatioH = document.getElementById('customRatioH');
    const fitModeGroup = document.getElementById('fitModeGroup');
    const resizeResultW = document.getElementById('resizeResultW');
    const resizeResultH = document.getElementById('resizeResultH');

    const ratiosGrid = document.getElementById('ratiosGrid');

    const previewContainer = document.getElementById('previewContainer');
    const previewFrame = document.getElementById('previewFrame');
    const safeAction = document.getElementById('safeAction');
    const safeTitle = document.getElementById('safeTitle');
    const previewRatioLabel = document.getElementById('previewRatioLabel');
    const previewDimLabel = document.getElementById('previewDimLabel');

    /* --- State --- */
    let isLocked = false;
    let lockedRatioW = 0;
    let lockedRatioH = 0;
    let fitMode = 'fit';
    let lastChangedField = 'width'; // track which field was edited last

    /* --- GCD utility --- */
    function gcd(a, b) {
        a = Math.abs(Math.round(a));
        b = Math.abs(Math.round(b));
        if (a === 0 && b === 0) return 1;
        if (a === 0) return b;
        if (b === 0) return a;
        while (b) {
            const t = b;
            b = a % b;
            a = t;
        }
        return a;
    }

    /* --- Calculate simplified ratio --- */
    function simplifyRatio(w, h) {
        if (!w || !h || w <= 0 || h <= 0) return { rw: 0, rh: 0 };
        const d = gcd(w, h);
        return { rw: w / d, rh: h / d };
    }

    /* --- Format ratio display (handle non-integer ratios) --- */
    function formatRatio(w, h) {
        if (!w || !h || w <= 0 || h <= 0) return '--:--';
        const { rw, rh } = simplifyRatio(w, h);

        // If simplified ratio has very large numbers, show decimal form
        if (rw > 100 || rh > 100) {
            const decimal = w / h;
            // Check known ratios
            const knownRatios = [
                { d: 16 / 9, label: '16:9' },
                { d: 4 / 3, label: '4:3' },
                { d: 21 / 9, label: '21:9' },
                { d: 1, label: '1:1' },
                { d: 9 / 16, label: '9:16' },
                { d: 2.39, label: '2.39:1' },
                { d: 2.35, label: '2.35:1' },
                { d: 1.85, label: '1.85:1' },
                { d: 3 / 2, label: '3:2' },
                { d: 5 / 4, label: '5:4' },
            ];
            for (const known of knownRatios) {
                if (Math.abs(decimal - known.d) < 0.02) return known.label;
            }
            return `${decimal.toFixed(2)}:1`;
        }

        return `${rw}:${rh}`;
    }

    /* --- Update Calculator Panel --- */
    function updateCalculator() {
        const w = parseFloat(calcWidth.value);
        const h = parseFloat(calcHeight.value);

        if (w > 0 && h > 0) {
            ratioDisplay.textContent = formatRatio(w, h);
            ratioDecimal.textContent = (w / h).toFixed(3);
            updatePreview(w, h);
        } else {
            ratioDisplay.textContent = '--:--';
            ratioDecimal.textContent = '0.000';
        }
    }

    /* --- Lock/Unlock Ratio --- */
    lockBtn.addEventListener('click', () => {
        isLocked = !isLocked;

        if (isLocked) {
            const w = parseFloat(calcWidth.value);
            const h = parseFloat(calcHeight.value);
            if (w > 0 && h > 0) {
                const d = gcd(w, h);
                lockedRatioW = w / d;
                lockedRatioH = h / d;
                lockBtn.classList.add('locked');
                lockPath.setAttribute('d', 'M7 11V7a5 5 0 0 1 10 0v4');
                Toast.info(`Ratio locked to ${lockedRatioW}:${lockedRatioH}`);
            } else {
                isLocked = false;
                Toast.error('Enter width and height first');
            }
        } else {
            lockBtn.classList.remove('locked');
            lockedRatioW = 0;
            lockedRatioH = 0;
        }
    });

    /* --- Calculator input handlers with lock --- */
    calcWidth.addEventListener('input', () => {
        lastChangedField = 'width';
        if (isLocked && lockedRatioW && lockedRatioH) {
            const w = parseFloat(calcWidth.value);
            if (w > 0) {
                calcHeight.value = Math.round(w * lockedRatioH / lockedRatioW);
            }
        }
        updateCalculator();
    });

    calcHeight.addEventListener('input', () => {
        lastChangedField = 'height';
        if (isLocked && lockedRatioW && lockedRatioH) {
            const h = parseFloat(calcHeight.value);
            if (h > 0) {
                calcWidth.value = Math.round(h * lockedRatioW / lockedRatioH);
            }
        }
        updateCalculator();
    });

    /* --- Resize By Ratio Panel --- */
    function getTargetRatioValues() {
        const val = targetRatio.value;
        if (val === 'custom') {
            const cw = parseFloat(customRatioW.value);
            const ch = parseFloat(customRatioH.value);
            return (cw > 0 && ch > 0) ? { tw: cw, th: ch } : null;
        }
        const parts = val.split(':');
        return { tw: parseFloat(parts[0]), th: parseFloat(parts[1]) };
    }

    function updateResize() {
        const sw = parseFloat(srcWidth.value);
        const sh = parseFloat(srcHeight.value);
        const ratio = getTargetRatioValues();

        if (!sw || !sh || sw <= 0 || sh <= 0 || !ratio) {
            resizeResultW.textContent = '--';
            resizeResultH.textContent = '--';
            return;
        }

        const targetAR = ratio.tw / ratio.th;
        const sourceAR = sw / sh;
        let resultW, resultH;

        if (fitMode === 'fit') {
            // Fit inside: the result fits within the source dimensions
            if (sourceAR > targetAR) {
                // Source is wider, constrain by height
                resultH = sh;
                resultW = Math.round(sh * targetAR);
            } else {
                // Source is taller, constrain by width
                resultW = sw;
                resultH = Math.round(sw / targetAR);
            }
        } else {
            // Fill/Crop: the result covers the source dimensions
            if (sourceAR > targetAR) {
                // Source is wider, expand to cover height
                resultW = sw;
                resultH = Math.round(sw / targetAR);
            } else {
                // Source is taller, expand to cover width
                resultH = sh;
                resultW = Math.round(sh * targetAR);
            }
        }

        resizeResultW.textContent = resultW;
        resizeResultH.textContent = resultH;
    }

    targetRatio.addEventListener('change', () => {
        if (targetRatio.value === 'custom') {
            customRatioRow.classList.add('visible');
        } else {
            customRatioRow.classList.remove('visible');
        }
        updateResize();
    });

    srcWidth.addEventListener('input', updateResize);
    srcHeight.addEventListener('input', updateResize);
    customRatioW.addEventListener('input', updateResize);
    customRatioH.addEventListener('input', updateResize);

    /* --- Fit Mode Toggle --- */
    fitModeGroup.querySelectorAll('.toggle-option').forEach(btn => {
        btn.addEventListener('click', () => {
            fitModeGroup.querySelectorAll('.toggle-option').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            fitMode = btn.dataset.mode;
            updateResize();
        });
    });

    /* --- Common Ratios Grid --- */
    function renderRatiosGrid() {
        ratiosGrid.innerHTML = '';

        COMMON_RATIOS.forEach(ratio => {
            const card = document.createElement('div');
            card.className = 'ratio-card';

            // Calculate proportional box dimensions
            const maxVisualW = 120;
            const maxVisualH = 70;
            const ar = ratio.w / ratio.h;
            let boxW, boxH;
            if (ar >= 1) {
                boxW = maxVisualW;
                boxH = Math.round(maxVisualW / ar);
                if (boxH > maxVisualH) {
                    boxH = maxVisualH;
                    boxW = Math.round(maxVisualH * ar);
                }
            } else {
                boxH = maxVisualH;
                boxW = Math.round(maxVisualH * ar);
                if (boxW > maxVisualW) {
                    boxW = maxVisualW;
                    boxH = Math.round(maxVisualW / ar);
                }
            }

            card.innerHTML = `
                <div class="ratio-card-visual">
                    <div class="ratio-card-box" style="width: ${boxW}px; height: ${boxH}px;"></div>
                </div>
                <div class="ratio-card-name">${ratio.name}</div>
                <div class="ratio-card-desc">${ratio.desc}</div>
                <div class="ratio-card-resolutions">
                    ${ratio.resolutions.map(r => `<span>${r}</span>`).join('')}
                </div>
            `;

            card.addEventListener('click', () => {
                // Populate calculator with first resolution
                const firstRes = ratio.resolutions[0];
                const [w, h] = firstRes.split('x').map(Number);
                calcWidth.value = w;
                calcHeight.value = h;

                // Unlock if locked
                if (isLocked) {
                    isLocked = false;
                    lockBtn.classList.remove('locked');
                    lockedRatioW = 0;
                    lockedRatioH = 0;
                }

                updateCalculator();
                Toast.info(`Loaded ${ratio.name} (${firstRes})`);

                // Scroll to top
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });

            ratiosGrid.appendChild(card);
        });
    }

    /* --- Visual Preview --- */
    function updatePreview(w, h) {
        if (!w || !h || w <= 0 || h <= 0) {
            previewFrame.style.width = '0px';
            previewFrame.style.height = '0px';
            previewRatioLabel.textContent = '--:--';
            previewDimLabel.textContent = '';
            return;
        }

        const containerRect = previewContainer.getBoundingClientRect();
        const maxW = containerRect.width - 40; // padding
        const maxH = 280;
        const ar = w / h;

        let frameW, frameH;
        if (ar >= 1) {
            frameW = Math.min(maxW, 400);
            frameH = frameW / ar;
            if (frameH > maxH) {
                frameH = maxH;
                frameW = frameH * ar;
            }
        } else {
            frameH = Math.min(maxH, 280);
            frameW = frameH * ar;
            if (frameW > maxW) {
                frameW = maxW;
                frameH = frameW / ar;
            }
        }

        previewFrame.style.width = Math.round(frameW) + 'px';
        previewFrame.style.height = Math.round(frameH) + 'px';

        // Title safe (80%) centered
        const titleW = frameW * 0.8;
        const titleH = frameH * 0.8;
        safeTitle.style.width = Math.round(titleW) + 'px';
        safeTitle.style.height = Math.round(titleH) + 'px';
        safeTitle.style.top = Math.round((frameH - titleH) / 2) + 'px';
        safeTitle.style.left = Math.round((frameW - titleW) / 2) + 'px';

        // Action safe (90%) centered
        const actionW = frameW * 0.9;
        const actionH = frameH * 0.9;
        safeAction.style.width = Math.round(actionW) + 'px';
        safeAction.style.height = Math.round(actionH) + 'px';
        safeAction.style.top = Math.round((frameH - actionH) / 2) + 'px';
        safeAction.style.left = Math.round((frameW - actionW) / 2) + 'px';

        previewRatioLabel.textContent = formatRatio(w, h);
        previewDimLabel.textContent = `${Math.round(w)} x ${Math.round(h)}`;
    }

    /* --- Handle window resize for preview --- */
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            const w = parseFloat(calcWidth.value);
            const h = parseFloat(calcHeight.value);
            if (w > 0 && h > 0) {
                updatePreview(w, h);
            }
        }, 150);
    });

    /* --- Initialize --- */
    function init() {
        renderRatiosGrid();

        // Set default values
        calcWidth.value = 1920;
        calcHeight.value = 1080;
        updateCalculator();

        srcWidth.value = 1920;
        srcHeight.value = 1080;
        updateResize();
    }

    // Run after DOM ready (app.js handles DOMContentLoaded for nav/server)
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
