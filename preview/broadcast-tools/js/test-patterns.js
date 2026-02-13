/* ============================================
   TEST PATTERN GENERATOR
   ============================================ */

(function () {
    const canvas = document.getElementById('patternCanvas');
    const ctx = canvas.getContext('2d');
    const fsOverlay = document.getElementById('fullscreenOverlay');
    const fsCanvas = document.getElementById('fullscreenCanvas');
    const fsCtx = fsCanvas.getContext('2d');

    let currentPattern = 'smpte';
    let currentWidth = 1920;
    let currentHeight = 1080;

    const PATTERN_INFO = {
        smpte: '<strong>SMPTE Color Bars (SMPTE EG 1-1990):</strong> The standard color bar test pattern used in NTSC television. The top 67% contains seven vertical bars at 75% intensity: white, yellow, cyan, green, magenta, red, and blue. The middle strip contains reverse blue, magenta, cyan, white signals plus -I and +Q reference signals. The bottom strip (PLUGE) provides 3.5, 7.5, and 11.5 IRE references for setting monitor brightness and black levels.',
        ebu: '<strong>EBU Color Bars (EBU Tech 3325):</strong> The European Broadcasting Union standard test pattern. Eight full-height vertical bars at 100% saturation and 75% amplitude: white, yellow, cyan, green, magenta, red, blue, and black. Used widely in PAL/SECAM broadcasting for color calibration and monitor setup.',
        grayscale: '<strong>Grayscale Ramp:</strong> A smooth gradient from pure black (0 IRE) to peak white (100 IRE) divided into 11 equal steps. Used for checking gamma response, verifying grayscale tracking, and ensuring proper brightness/contrast calibration across the full dynamic range.',
        grid: '<strong>Grid / Crosshatch:</strong> A precision alignment pattern with evenly spaced horizontal and vertical lines, center crosshair, and corner markers. Used for checking geometry, convergence, linearity, and aspect ratio on displays. The circle tests for pincushion and barrel distortion.',
        white: '<strong>White Field (100% White):</strong> A full-screen white field at 100% intensity (235 digital / 100 IRE). Used for checking display uniformity, identifying dead pixels, and setting peak white levels. Also useful for measuring screen brightness and checking for color tinting.',
        black: '<strong>Black Field (0% Black):</strong> A full-screen black field at 0% intensity (16 digital / 0 IRE). Used for checking black level, verifying display light leakage, identifying bright pixel defects, and setting the brightness/black level control on monitors.',
        rgbw: '<strong>RGBW Color Fields:</strong> Four quadrants displaying pure red, green, blue, and white at 100% intensity. Used for checking individual color channel performance, verifying color purity, and identifying color balance issues on displays and projectors.',
        multiburst: '<strong>Multiburst:</strong> A series of vertical line groups at increasing spatial frequencies. Used for measuring the horizontal resolution capability and frequency response of a display or camera system. Each burst section doubles in line density from left to right.',
    };

    /* --- Pattern Drawing Functions --- */

    function drawSMPTE(ctx, w, h) {
        const topH = Math.round(h * 0.67);
        const midH = Math.round(h * 0.08);
        const botH = h - topH - midH;

        // Top 67%: 7 bars at 75%
        const topColors = [
            [191, 191, 191], // 75% White
            [191, 191, 0],   // 75% Yellow
            [0, 191, 191],   // 75% Cyan
            [0, 191, 0],     // 75% Green
            [191, 0, 191],   // 75% Magenta
            [191, 0, 0],     // 75% Red
            [0, 0, 191],     // 75% Blue
        ];

        const barW = w / 7;
        topColors.forEach((c, i) => {
            ctx.fillStyle = `rgb(${c[0]},${c[1]},${c[2]})`;
            ctx.fillRect(Math.round(i * barW), 0, Math.ceil(barW) + 1, topH);
        });

        // Middle strip: reverse blue-only bars + I/Q
        const midColors = [
            [0, 0, 191],     // Blue
            [19, 19, 19],    // Black
            [191, 0, 191],   // Magenta
            [19, 19, 19],    // Black
            [0, 191, 191],   // Cyan
            [19, 19, 19],    // Black
            [191, 191, 191], // White
        ];

        midColors.forEach((c, i) => {
            ctx.fillStyle = `rgb(${c[0]},${c[1]},${c[2]})`;
            ctx.fillRect(Math.round(i * barW), topH, Math.ceil(barW) + 1, midH);
        });

        // Bottom strip: PLUGE
        const botY = topH + midH;
        const seg = w / 7;

        // -I signal (dark navy)
        ctx.fillStyle = 'rgb(0, 33, 76)';
        ctx.fillRect(0, botY, Math.ceil(seg), botH);

        // White 100%
        ctx.fillStyle = 'rgb(255, 255, 255)';
        ctx.fillRect(Math.round(seg), botY, Math.ceil(seg), botH);

        // +Q signal (dark purple)
        ctx.fillStyle = 'rgb(50, 0, 106)';
        ctx.fillRect(Math.round(seg * 2), botY, Math.ceil(seg), botH);

        // 3.5 IRE (sub-black)
        ctx.fillStyle = 'rgb(9, 9, 9)';
        ctx.fillRect(Math.round(seg * 3), botY, Math.ceil(seg * 0.75), botH);

        // 7.5 IRE (black reference)
        ctx.fillStyle = 'rgb(19, 19, 19)';
        ctx.fillRect(Math.round(seg * 3 + seg * 0.75), botY, Math.ceil(seg * 0.5), botH);

        // 11.5 IRE (slightly above black)
        ctx.fillStyle = 'rgb(29, 29, 29)';
        ctx.fillRect(Math.round(seg * 3 + seg * 1.25), botY, Math.ceil(seg * 0.75), botH);

        // Black fill rest
        ctx.fillStyle = 'rgb(19, 19, 19)';
        ctx.fillRect(Math.round(seg * 5), botY, Math.ceil(seg * 2) + 1, botH);
    }

    function drawEBU(ctx, w, h) {
        const colors = [
            [191, 191, 191], // White 75%
            [191, 191, 0],   // Yellow
            [0, 191, 191],   // Cyan
            [0, 191, 0],     // Green
            [191, 0, 191],   // Magenta
            [191, 0, 0],     // Red
            [0, 0, 191],     // Blue
            [0, 0, 0],       // Black
        ];
        const barW = w / 8;
        colors.forEach((c, i) => {
            ctx.fillStyle = `rgb(${c[0]},${c[1]},${c[2]})`;
            ctx.fillRect(Math.round(i * barW), 0, Math.ceil(barW) + 1, h);
        });
    }

    function drawGrayscale(ctx, w, h) {
        const steps = 11;
        const barW = w / steps;
        for (let i = 0; i < steps; i++) {
            const v = Math.round((i / (steps - 1)) * 255);
            ctx.fillStyle = `rgb(${v},${v},${v})`;
            ctx.fillRect(Math.round(i * barW), 0, Math.ceil(barW) + 1, h);
        }

        // Labels
        ctx.font = `${Math.max(12, Math.round(h * 0.02))}px "JetBrains Mono", monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        for (let i = 0; i < steps; i++) {
            const x = Math.round(i * barW + barW / 2);
            const pct = Math.round((i / (steps - 1)) * 100);
            const v = Math.round((i / (steps - 1)) * 255);
            ctx.fillStyle = v > 128 ? '#000' : '#fff';
            ctx.fillText(`${pct}%`, x, h - Math.round(h * 0.02));
        }
    }

    function drawGrid(ctx, w, h) {
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, w, h);

        ctx.strokeStyle = '#444';
        ctx.lineWidth = 1;

        const gridSize = Math.round(Math.min(w, h) / 16);

        // Vertical lines
        for (let x = 0; x <= w; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x + 0.5, 0);
            ctx.lineTo(x + 0.5, h);
            ctx.stroke();
        }

        // Horizontal lines
        for (let y = 0; y <= h; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y + 0.5);
            ctx.lineTo(w, y + 0.5);
            ctx.stroke();
        }

        // Center crosshair
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        const cx = Math.round(w / 2);
        const cy = Math.round(h / 2);
        ctx.beginPath();
        ctx.moveTo(cx, 0);
        ctx.lineTo(cx, h);
        ctx.moveTo(0, cy);
        ctx.lineTo(w, cy);
        ctx.stroke();

        // Center circle
        const radius = Math.min(w, h) * 0.4;
        ctx.strokeStyle = '#888';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.stroke();

        // Safe area boxes (action safe 90%, title safe 80%)
        ctx.strokeStyle = 'rgba(34, 197, 94, 0.5)';
        ctx.lineWidth = 1;
        ctx.setLineDash([8, 4]);
        const as = 0.05; // 5% each side = 90% action safe
        ctx.strokeRect(w * as, h * as, w * (1 - 2 * as), h * (1 - 2 * as));

        ctx.strokeStyle = 'rgba(245, 158, 11, 0.5)';
        const ts = 0.1; // 10% each side = 80% title safe
        ctx.strokeRect(w * ts, h * ts, w * (1 - 2 * ts), h * (1 - 2 * ts));
        ctx.setLineDash([]);

        // Corner markers
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        const cm = gridSize;
        [[0, 0], [w, 0], [0, h], [w, h]].forEach(([x, y]) => {
            const dx = x === 0 ? 1 : -1;
            const dy = y === 0 ? 1 : -1;
            ctx.beginPath();
            ctx.moveTo(x, y + dy * cm);
            ctx.lineTo(x, y);
            ctx.lineTo(x + dx * cm, y);
            ctx.stroke();
        });

        // Labels
        ctx.fillStyle = '#22c55e';
        ctx.font = `${Math.max(10, Math.round(h * 0.015))}px "JetBrains Mono", monospace`;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText('ACTION SAFE (90%)', w * as + 4, h * as + 4);
        ctx.fillStyle = '#f59e0b';
        ctx.fillText('TITLE SAFE (80%)', w * ts + 4, h * ts + 4);

        // Resolution label
        ctx.fillStyle = '#fff';
        ctx.font = `${Math.max(14, Math.round(h * 0.025))}px "JetBrains Mono", monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${w} x ${h}`, cx, cy + radius + Math.round(h * 0.04));
    }

    function drawWhite(ctx, w, h) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, w, h);
    }

    function drawBlack(ctx, w, h) {
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, w, h);
    }

    function drawRGBW(ctx, w, h) {
        const hw = Math.ceil(w / 2);
        const hh = Math.ceil(h / 2);

        ctx.fillStyle = '#ff0000';
        ctx.fillRect(0, 0, hw, hh);

        ctx.fillStyle = '#00ff00';
        ctx.fillRect(hw, 0, hw, hh);

        ctx.fillStyle = '#0000ff';
        ctx.fillRect(0, hh, hw, hh);

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(hw, hh, hw, hh);

        // Labels
        ctx.font = `bold ${Math.max(16, Math.round(h * 0.04))}px "JetBrains Mono", monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        ctx.fillText('RED', hw / 2, hh / 2);

        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillText('GREEN', hw + hw / 2, hh / 2);

        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        ctx.fillText('BLUE', hw / 2, hh + hh / 2);

        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        ctx.fillText('WHITE', hw + hw / 2, hh + hh / 2);
    }

    function drawMultiburst(ctx, w, h) {
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, w, h);

        // Reference white bar on the left
        const refW = Math.round(w * 0.06);
        ctx.fillStyle = '#bfbfbf';
        ctx.fillRect(0, 0, refW, h);

        const burstCount = 6;
        const gapW = Math.round(w * 0.02);
        const availW = w - refW - gapW;
        const burstW = Math.floor(availW / burstCount);
        const startX = refW + gapW;

        for (let b = 0; b < burstCount; b++) {
            const freq = Math.pow(2, b + 1); // 2, 4, 8, 16, 32, 64 lines
            const bx = startX + b * burstW;
            const lineW = burstW / (freq * 2);

            for (let l = 0; l < freq; l++) {
                ctx.fillStyle = '#bfbfbf';
                ctx.fillRect(Math.round(bx + l * lineW * 2), 0, Math.ceil(lineW), h);
            }
        }

        // Frequency labels
        ctx.fillStyle = '#888';
        ctx.font = `${Math.max(10, Math.round(h * 0.018))}px "JetBrains Mono", monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        for (let b = 0; b < burstCount; b++) {
            const bx = startX + b * burstW + burstW / 2;
            const mhz = [0.5, 1, 2, 3, 4, 5][b];
            ctx.fillText(`${mhz} MHz`, bx, h - Math.round(h * 0.015));
        }
    }

    const PATTERN_RENDERERS = {
        smpte: drawSMPTE,
        ebu: drawEBU,
        grayscale: drawGrayscale,
        grid: drawGrid,
        white: drawWhite,
        black: drawBlack,
        rgbw: drawRGBW,
        multiburst: drawMultiburst,
    };

    /* --- Render --- */

    function render() {
        canvas.width = currentWidth;
        canvas.height = currentHeight;

        ctx.clearRect(0, 0, currentWidth, currentHeight);
        PATTERN_RENDERERS[currentPattern](ctx, currentWidth, currentHeight);

        document.getElementById('resolutionDisplay').textContent = `${currentWidth} x ${currentHeight}`;
        document.getElementById('patternInfo').innerHTML = PATTERN_INFO[currentPattern];
    }

    /* --- Event Handlers --- */

    // Pattern type selection
    document.getElementById('patternTypeGrid').addEventListener('click', (e) => {
        const card = e.target.closest('.pattern-type-card');
        if (!card) return;
        document.querySelectorAll('.pattern-type-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        currentPattern = card.dataset.pattern;
        render();
    });

    // Resolution selector
    document.getElementById('resolutionSelect').addEventListener('change', (e) => {
        const [w, h] = e.target.value.split('x').map(Number);
        currentWidth = w;
        currentHeight = h;
        render();
    });

    // Fullscreen
    document.getElementById('fullscreenBtn').addEventListener('click', () => {
        fsCanvas.width = currentWidth;
        fsCanvas.height = currentHeight;
        PATTERN_RENDERERS[currentPattern](fsCtx, currentWidth, currentHeight);
        fsOverlay.classList.add('active');
    });

    fsOverlay.addEventListener('click', () => {
        fsOverlay.classList.remove('active');
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && fsOverlay.classList.contains('active')) {
            fsOverlay.classList.remove('active');
        }
    });

    // Download
    document.getElementById('downloadBtn').addEventListener('click', () => {
        canvas.toBlob((blob) => {
            downloadBlob(blob, `${currentPattern}-${currentWidth}x${currentHeight}.png`);
            Toast.success('Pattern downloaded');
        }, 'image/png');
    });

    // Initial render
    render();
})();
