/* ============================================
   COLOR PALETTE TOOL
   Color conversion, contrast checking, palette generation
   ============================================ */

(function () {
    'use strict';

    /* ============================
       COLOR CONVERSION FUNCTIONS
       ============================ */

    /**
     * Parse a hex string (#RRGGBB) to {r, g, b}
     */
    function hexToRgb(hex) {
        hex = hex.replace(/^#/, '');
        if (hex.length === 3) {
            hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
        }
        var num = parseInt(hex, 16);
        return {
            r: (num >> 16) & 255,
            g: (num >> 8) & 255,
            b: num & 255,
        };
    }

    /**
     * Convert {r, g, b} to hex string (#rrggbb)
     */
    function rgbToHex(r, g, b) {
        r = clamp(Math.round(r), 0, 255);
        g = clamp(Math.round(g), 0, 255);
        b = clamp(Math.round(b), 0, 255);
        return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }

    /**
     * Convert {r, g, b} (0-255) to {h, s, l} (h: 0-360, s: 0-100, l: 0-100)
     */
    function rgbToHsl(r, g, b) {
        r /= 255;
        g /= 255;
        b /= 255;
        var max = Math.max(r, g, b);
        var min = Math.min(r, g, b);
        var h, s;
        var l = (max + min) / 2;

        if (max === min) {
            h = 0;
            s = 0;
        } else {
            var d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r:
                    h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
                    break;
                case g:
                    h = ((b - r) / d + 2) / 6;
                    break;
                case b:
                    h = ((r - g) / d + 4) / 6;
                    break;
            }
        }
        return {
            h: Math.round(h * 360),
            s: Math.round(s * 100),
            l: Math.round(l * 100),
        };
    }

    /**
     * Convert {h, s, l} (h: 0-360, s: 0-100, l: 0-100) to {r, g, b} (0-255)
     */
    function hslToRgb(h, s, l) {
        h /= 360;
        s /= 100;
        l /= 100;
        var r, g, b;

        if (s === 0) {
            r = g = b = l;
        } else {
            var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            var p = 2 * l - q;
            r = hueToRgb(p, q, h + 1 / 3);
            g = hueToRgb(p, q, h);
            b = hueToRgb(p, q, h - 1 / 3);
        }
        return {
            r: Math.round(r * 255),
            g: Math.round(g * 255),
            b: Math.round(b * 255),
        };
    }

    function hueToRgb(p, q, t) {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
    }

    function hexToHsl(hex) {
        var rgb = hexToRgb(hex);
        return rgbToHsl(rgb.r, rgb.g, rgb.b);
    }

    function hslToHex(h, s, l) {
        var rgb = hslToRgb(h, s, l);
        return rgbToHex(rgb.r, rgb.g, rgb.b);
    }

    function clamp(val, min, max) {
        return Math.min(Math.max(val, min), max);
    }

    /* ============================
       WCAG CONTRAST
       ============================ */

    /**
     * Relative luminance of an sRGB color (0-1)
     * Per WCAG 2.0: https://www.w3.org/TR/WCAG20/#relativeluminancedef
     */
    function relativeLuminance(r, g, b) {
        var rs = r / 255;
        var gs = g / 255;
        var bs = b / 255;
        var rl = rs <= 0.03928 ? rs / 12.92 : Math.pow((rs + 0.055) / 1.055, 2.4);
        var gl = gs <= 0.03928 ? gs / 12.92 : Math.pow((gs + 0.055) / 1.055, 2.4);
        var bl = bs <= 0.03928 ? bs / 12.92 : Math.pow((bs + 0.055) / 1.055, 2.4);
        return 0.2126 * rl + 0.7152 * gl + 0.0722 * bl;
    }

    /**
     * WCAG contrast ratio between two colors
     */
    function contrastRatio(hex1, hex2) {
        var c1 = hexToRgb(hex1);
        var c2 = hexToRgb(hex2);
        var l1 = relativeLuminance(c1.r, c1.g, c1.b);
        var l2 = relativeLuminance(c2.r, c2.g, c2.b);
        var lighter = Math.max(l1, l2);
        var darker = Math.min(l1, l2);
        return (lighter + 0.05) / (darker + 0.05);
    }

    /* ============================
       PALETTE GENERATION
       ============================ */

    function generateComplementary(h, s, l) {
        return [hslToHex((h + 180) % 360, s, l)];
    }

    function generateAnalogous(h, s, l) {
        return [
            hslToHex((h + 330) % 360, s, l),
            hslToHex(h, s, l),
            hslToHex((h + 30) % 360, s, l),
        ];
    }

    function generateTriadic(h, s, l) {
        return [
            hslToHex(h, s, l),
            hslToHex((h + 120) % 360, s, l),
            hslToHex((h + 240) % 360, s, l),
        ];
    }

    function generateSplitComplementary(h, s, l) {
        return [
            hslToHex(h, s, l),
            hslToHex((h + 150) % 360, s, l),
            hslToHex((h + 210) % 360, s, l),
        ];
    }

    function generateMonochromatic(h, s, l) {
        return [
            hslToHex(h, s, clamp(l - 30, 5, 95)),
            hslToHex(h, s, clamp(l - 15, 5, 95)),
            hslToHex(h, s, l),
            hslToHex(h, s, clamp(l + 15, 5, 95)),
            hslToHex(h, s, clamp(l + 30, 5, 95)),
        ];
    }

    /* ============================
       BROADCAST SAFE COLOR DATA
       ============================ */

    var broadcastSafeColors = [
        { name: 'White', hex: '#ebebeb', note: 'RGB 235' },
        { name: 'Black', hex: '#101010', note: 'RGB 16' },
        { name: 'Red', hex: '#eb1010', note: 'Safe Red' },
        { name: 'Green', hex: '#10eb10', note: 'Safe Green' },
        { name: 'Blue', hex: '#1010eb', note: 'Safe Blue' },
        { name: 'Yellow', hex: '#ebeb10', note: 'Safe Yellow' },
        { name: 'Cyan', hex: '#10ebeb', note: 'Safe Cyan' },
        { name: 'Magenta', hex: '#eb10eb', note: 'Safe Magenta' },
        { name: '75% White', hex: '#b4b4b4', note: '75% Bars' },
        { name: '75% Yellow', hex: '#b4b410', note: '75% Bars' },
        { name: '75% Cyan', hex: '#10b4b4', note: '75% Bars' },
        { name: '75% Green', hex: '#10b410', note: '75% Bars' },
        { name: '75% Magenta', hex: '#b410b4', note: '75% Bars' },
        { name: '75% Red', hex: '#b41010', note: '75% Bars' },
        { name: '75% Blue', hex: '#1010b4', note: '75% Bars' },
        { name: '40% Gray', hex: '#5e5e5e', note: 'Mid Gray' },
    ];

    /* ============================
       DOM ELEMENTS
       ============================ */

    var mainColorPicker = document.getElementById('mainColorPicker');
    var mainSwatch = document.getElementById('mainSwatch');
    var hexInput = document.getElementById('hexInput');
    var rInput = document.getElementById('rInput');
    var gInput = document.getElementById('gInput');
    var bInput = document.getElementById('bInput');
    var hInput = document.getElementById('hInput');
    var sInput = document.getElementById('sInput');
    var lInput = document.getElementById('lInput');

    var valHex = document.getElementById('valHex');
    var valRgb = document.getElementById('valRgb');
    var valHsl = document.getElementById('valHsl');
    var valRgba = document.getElementById('valRgba');
    var valCss = document.getElementById('valCss');

    var contrastFg = document.getElementById('contrastFg');
    var contrastBg = document.getElementById('contrastBg');
    var contrastPreview = document.getElementById('contrastPreview');
    var contrastRatioDisplay = document.getElementById('contrastRatio');
    var swapContrastBtn = document.getElementById('swapContrastBtn');
    var wcagAANormal = document.getElementById('wcagAANormal');
    var wcagAALarge = document.getElementById('wcagAALarge');
    var wcagAAANormal = document.getElementById('wcagAAANormal');
    var wcagAAALarge = document.getElementById('wcagAAALarge');

    var palComplementary = document.getElementById('palComplementary');
    var palAnalogous = document.getElementById('palAnalogous');
    var palTriadic = document.getElementById('palTriadic');
    var palSplitComp = document.getElementById('palSplitComp');
    var palMono = document.getElementById('palMono');

    var broadcastColorsGrid = document.getElementById('broadcastColorsGrid');

    /* ============================
       CURRENT COLOR STATE
       ============================ */

    var currentColor = { r: 99, g: 102, b: 241 };

    /* ============================
       UPDATE FUNCTIONS
       ============================ */

    /**
     * Master update: given r, g, b — sync everything
     */
    function updateFromRGB(r, g, b, source) {
        r = clamp(Math.round(r), 0, 255);
        g = clamp(Math.round(g), 0, 255);
        b = clamp(Math.round(b), 0, 255);
        currentColor = { r: r, g: g, b: b };

        var hex = rgbToHex(r, g, b);
        var hsl = rgbToHsl(r, g, b);

        // Update picker
        if (source !== 'picker') {
            mainColorPicker.value = hex;
        }

        // Update swatch
        mainSwatch.style.background = hex;

        // Update hex input
        if (source !== 'hex') {
            hexInput.value = hex;
        }

        // Update RGB inputs
        if (source !== 'rgb') {
            rInput.value = r;
            gInput.value = g;
            bInput.value = b;
        }

        // Update HSL inputs
        if (source !== 'hsl') {
            hInput.value = hsl.h;
            sInput.value = hsl.s;
            lInput.value = hsl.l;
        }

        // Update color values display
        valHex.textContent = hex;
        valRgb.textContent = 'rgb(' + r + ', ' + g + ', ' + b + ')';
        valHsl.textContent = 'hsl(' + hsl.h + ', ' + hsl.s + '%, ' + hsl.l + '%)';
        valRgba.textContent = 'rgba(' + r + ', ' + g + ', ' + b + ', 1)';
        valCss.textContent = '--color-primary: ' + hex + ';';

        // Update palettes
        updatePalettes(hsl.h, hsl.s, hsl.l);
    }

    function updateFromHex(hex, source) {
        if (!/^#[0-9a-fA-F]{6}$/.test(hex)) return;
        var rgb = hexToRgb(hex);
        updateFromRGB(rgb.r, rgb.g, rgb.b, source);
    }

    function updateFromHSL(h, s, l, source) {
        h = clamp(Math.round(h), 0, 360);
        s = clamp(Math.round(s), 0, 100);
        l = clamp(Math.round(l), 0, 100);
        var rgb = hslToRgb(h, s, l);
        updateFromRGB(rgb.r, rgb.g, rgb.b, source);
    }

    /* ============================
       CONTRAST CHECKER UPDATE
       ============================ */

    function updateContrast() {
        var fg = contrastFg.value;
        var bg = contrastBg.value;

        // Update preview
        contrastPreview.style.color = fg;
        contrastPreview.style.backgroundColor = bg;

        // Calculate ratio
        var ratio = contrastRatio(fg, bg);
        var ratioRounded = Math.round(ratio * 10) / 10;
        contrastRatioDisplay.textContent = ratioRounded + ':1';

        // WCAG checks
        setWcagBadge(wcagAANormal, ratio >= 4.5, 'AA Normal');
        setWcagBadge(wcagAALarge, ratio >= 3.0, 'AA Large');
        setWcagBadge(wcagAAANormal, ratio >= 7.0, 'AAA Normal');
        setWcagBadge(wcagAAALarge, ratio >= 4.5, 'AAA Large');
    }

    function setWcagBadge(el, pass, label) {
        el.className = 'wcag-badge ' + (pass ? 'pass' : 'fail');
        el.textContent = label + ': ' + (pass ? 'Pass' : 'Fail');
    }

    /* ============================
       PALETTE UPDATE
       ============================ */

    function updatePalettes(h, s, l) {
        renderSwatches(palComplementary, generateComplementary(h, s, l));
        renderSwatches(palAnalogous, generateAnalogous(h, s, l));
        renderSwatches(palTriadic, generateTriadic(h, s, l));
        renderSwatches(palSplitComp, generateSplitComplementary(h, s, l));
        renderSwatches(palMono, generateMonochromatic(h, s, l));
    }

    function renderSwatches(container, colors) {
        container.innerHTML = '';
        colors.forEach(function (hex) {
            var swatch = document.createElement('div');
            swatch.className = 'palette-swatch';
            swatch.title = 'Click to copy ' + hex;
            swatch.innerHTML =
                '<div class="swatch-color" style="background: ' + hex + ';"></div>' +
                '<span class="swatch-label">' + hex + '</span>';
            swatch.addEventListener('click', function () {
                copyText(hex);
                Toast.success('Copied ' + hex);
            });
            container.appendChild(swatch);
        });
    }

    /* ============================
       BROADCAST SAFE COLORS
       ============================ */

    function renderBroadcastColors() {
        broadcastColorsGrid.innerHTML = '';
        broadcastSafeColors.forEach(function (color) {
            var chip = document.createElement('div');
            chip.className = 'broadcast-color-chip';
            chip.title = 'Click to copy ' + color.hex;
            chip.innerHTML =
                '<div class="broadcast-chip-swatch" style="background: ' + color.hex + ';"></div>' +
                '<span class="broadcast-chip-label">' + color.name + '</span>' +
                '<span class="broadcast-chip-hex">' + color.hex + '</span>';
            chip.addEventListener('click', function () {
                copyText(color.hex);
                Toast.success('Copied ' + color.hex + ' (' + color.name + ')');
            });
            broadcastColorsGrid.appendChild(chip);
        });
    }

    /* ============================
       COPY UTILITY
       ============================ */

    function copyText(text) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).catch(function () {
                fallbackCopy(text);
            });
        } else {
            fallbackCopy(text);
        }
    }

    function fallbackCopy(text) {
        var textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        try {
            document.execCommand('copy');
        } catch (e) {
            // silent fail
        }
        document.body.removeChild(textarea);
    }

    /* ============================
       EVENT LISTENERS
       ============================ */

    function initEvents() {
        // Main color picker
        mainColorPicker.addEventListener('input', function () {
            updateFromHex(mainColorPicker.value, 'picker');
        });

        // Hex input
        hexInput.addEventListener('input', function () {
            var val = hexInput.value.trim();
            if (/^#[0-9a-fA-F]{6}$/.test(val)) {
                updateFromHex(val, 'hex');
            }
        });
        hexInput.addEventListener('blur', function () {
            // Normalize on blur
            if (!/^#[0-9a-fA-F]{6}$/.test(hexInput.value.trim())) {
                hexInput.value = rgbToHex(currentColor.r, currentColor.g, currentColor.b);
            }
        });

        // RGB inputs
        function onRGBChange() {
            var r = parseInt(rInput.value, 10) || 0;
            var g = parseInt(gInput.value, 10) || 0;
            var b = parseInt(bInput.value, 10) || 0;
            updateFromRGB(r, g, b, 'rgb');
        }
        rInput.addEventListener('input', onRGBChange);
        gInput.addEventListener('input', onRGBChange);
        bInput.addEventListener('input', onRGBChange);

        // HSL inputs
        function onHSLChange() {
            var h = parseInt(hInput.value, 10) || 0;
            var s = parseInt(sInput.value, 10) || 0;
            var l = parseInt(lInput.value, 10) || 0;
            updateFromHSL(h, s, l, 'hsl');
        }
        hInput.addEventListener('input', onHSLChange);
        sInput.addEventListener('input', onHSLChange);
        lInput.addEventListener('input', onHSLChange);

        // Copy buttons in Color Values panel
        document.querySelectorAll('.copy-btn[data-copy]').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var targetId = btn.dataset.copy;
                var targetEl = document.getElementById(targetId);
                if (targetEl) {
                    copyText(targetEl.textContent);
                    Toast.success('Copied: ' + targetEl.textContent);
                }
            });
        });

        // Contrast checker
        contrastFg.addEventListener('input', updateContrast);
        contrastBg.addEventListener('input', updateContrast);

        // Swap contrast colors
        swapContrastBtn.addEventListener('click', function () {
            var temp = contrastFg.value;
            contrastFg.value = contrastBg.value;
            contrastBg.value = temp;
            updateContrast();
        });
    }

    /* ============================
       INIT
       ============================ */

    document.addEventListener('DOMContentLoaded', function () {
        initEvents();
        // Set initial color
        updateFromRGB(99, 102, 241, 'init');
        // Initial contrast check
        updateContrast();
        // Render broadcast safe colors
        renderBroadcastColors();
    });
})();
