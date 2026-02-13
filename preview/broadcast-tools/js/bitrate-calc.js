/* ============================================
   BITRATE CALCULATOR — Logic
   File size, duration, and data rate conversions
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    // ==============================
    // Unit conversion constants
    // ==============================

    /** Convert a bitrate value + unit string to bits per second */
    function bitrateToBps(value, unit) {
        switch (unit) {
            case 'Kbps': return value * 1000;
            case 'Mbps': return value * 1000000;
            case 'Gbps': return value * 1000000000;
            default:     return value;
        }
    }

    /** Convert bits per second to a given bitrate unit */
    function bpsToUnit(bps, unit) {
        switch (unit) {
            case 'Kbps': return bps / 1000;
            case 'Mbps': return bps / 1000000;
            case 'Gbps': return bps / 1000000000;
            default:     return bps;
        }
    }

    /** Convert file size value + unit string to bytes */
    function fileSizeToBytes(value, unit) {
        switch (unit) {
            case 'MB': return value * 1000000;
            case 'GB': return value * 1000000000;
            case 'TB': return value * 1000000000000;
            default:   return value;
        }
    }

    /** Convert bytes to a given file size unit */
    function bytesToUnit(bytes, unit) {
        switch (unit) {
            case 'MB': return bytes / 1000000;
            case 'GB': return bytes / 1000000000;
            case 'TB': return bytes / 1000000000000;
            default:   return bytes;
        }
    }

    /** Format a number nicely (up to 4 significant digits, no trailing zeros) */
    function formatNum(n) {
        if (n === 0) return '0';
        if (Math.abs(n) >= 1000) return n.toLocaleString(undefined, { maximumFractionDigits: 1 });
        if (Math.abs(n) >= 100) return n.toFixed(1).replace(/\.0$/, '');
        if (Math.abs(n) >= 10) return n.toFixed(2).replace(/0+$/, '').replace(/\.$/, '');
        if (Math.abs(n) >= 1) return n.toFixed(3).replace(/0+$/, '').replace(/\.$/, '');
        return n.toPrecision(4).replace(/0+$/, '').replace(/\.$/, '');
    }

    /** Smart format for large numbers */
    function smartFormat(n) {
        if (n === 0) return '0';
        if (n >= 1e12) return formatNum(n / 1e12) + 'T';
        if (n >= 1e9) return formatNum(n / 1e9) + 'G';
        if (n >= 1e6) return formatNum(n / 1e6) + 'M';
        if (n >= 1e3) return formatNum(n / 1e3) + 'K';
        return formatNum(n);
    }


    // ==============================
    // Panel 1: File Size Calculator
    // ==============================

    const durHH = document.getElementById('durHH');
    const durMM = document.getElementById('durMM');
    const durSS = document.getElementById('durSS');
    const bitrateValue = document.getElementById('bitrateValue');
    const bitrateUnit = document.getElementById('bitrateUnit');
    const fileSizeValue = document.getElementById('fileSizeValue');
    const fileSizeUnit = document.getElementById('fileSizeUnit');
    const calcResultBar = document.getElementById('calcResultBar');
    const calcResultText = document.getElementById('calcResultText');
    const fileSizeLed = document.getElementById('fileSizeLed');
    const durationGroup = document.getElementById('durationGroup');
    const bitrateGroup = document.getElementById('bitrateGroup');
    const fileSizeGroup = document.getElementById('fileSizeGroup');

    // Track which field was last edited by the user to determine which to calculate
    let lastEditedField = null;
    // Track which fields have user-entered values
    let fieldDirty = { duration: false, bitrate: false, fileSize: false };

    function getDurationSeconds() {
        const h = parseInt(durHH.value, 10) || 0;
        const m = parseInt(durMM.value, 10) || 0;
        const s = parseInt(durSS.value, 10) || 0;
        return h * 3600 + m * 60 + s;
    }

    function setDurationFromSeconds(totalSec) {
        const h = Math.floor(totalSec / 3600);
        totalSec -= h * 3600;
        const m = Math.floor(totalSec / 60);
        const s = Math.floor(totalSec % 60);
        durHH.value = h > 0 ? String(h) : '';
        durMM.value = m > 0 || h > 0 ? String(m).padStart(2, '0') : '';
        durSS.value = String(s).padStart(2, '0');
    }

    function getBitrateBps() {
        const val = parseFloat(bitrateValue.value);
        if (isNaN(val) || val <= 0) return 0;
        return bitrateToBps(val, bitrateUnit.value);
    }

    function getFileSizeBytes() {
        const val = parseFloat(fileSizeValue.value);
        if (isNaN(val) || val <= 0) return 0;
        return fileSizeToBytes(val, fileSizeUnit.value);
    }

    function clearCalculatedHighlight() {
        durationGroup.classList.remove('calculated');
        bitrateGroup.classList.remove('calculated');
        fileSizeGroup.classList.remove('calculated');
    }

    function calculate() {
        const durationSec = getDurationSeconds();
        const bps = getBitrateBps();
        const sizeBytes = getFileSizeBytes();

        // Count how many fields have values
        const hasDuration = durationSec > 0;
        const hasBitrate = bps > 0;
        const hasFileSize = sizeBytes > 0;

        const filledCount = (hasDuration ? 1 : 0) + (hasBitrate ? 1 : 0) + (hasFileSize ? 1 : 0);

        clearCalculatedHighlight();

        if (filledCount < 2) {
            calcResultBar.style.display = 'none';
            return;
        }

        // Determine which field to calculate:
        // - If all three are filled, recalculate the one most recently edited (as it is likely the output)
        //   Actually, recalculate the one that was NOT most recently edited among the two inputs.
        //   Better heuristic: the last edited field is the "newest input", so calculate the remaining unknown
        //   or the field that was edited earliest.
        let calcTarget;

        if (filledCount === 2) {
            // Calculate the empty one
            if (!hasDuration) calcTarget = 'duration';
            else if (!hasBitrate) calcTarget = 'bitrate';
            else calcTarget = 'fileSize';
        } else {
            // All three filled: recalculate the one that was last edited (treat it as output)
            calcTarget = lastEditedField || 'fileSize';
        }

        let resultMsg = '';

        if (calcTarget === 'fileSize') {
            // size (bytes) = bitrate (bps) * duration (s) / 8
            const calcBytes = (bps * durationSec) / 8;
            const displayValue = bytesToUnit(calcBytes, fileSizeUnit.value);
            fileSizeValue.value = formatNum(displayValue);
            fileSizeGroup.classList.add('calculated');
            resultMsg = `File size: <span>${formatNum(displayValue)} ${fileSizeUnit.value}</span> (${formatBytes(calcBytes)})`;
        } else if (calcTarget === 'duration') {
            // duration (s) = size (bytes) * 8 / bitrate (bps)
            const calcSeconds = (sizeBytes * 8) / bps;
            setDurationFromSeconds(calcSeconds);
            durationGroup.classList.add('calculated');
            const h = Math.floor(calcSeconds / 3600);
            const m = Math.floor((calcSeconds % 3600) / 60);
            const s = Math.floor(calcSeconds % 60);
            resultMsg = `Duration: <span>${h}h ${m}m ${s}s</span> (${formatNum(calcSeconds)} seconds)`;
        } else if (calcTarget === 'bitrate') {
            // bitrate (bps) = size (bytes) * 8 / duration (s)
            const calcBps = (sizeBytes * 8) / durationSec;
            const displayValue = bpsToUnit(calcBps, bitrateUnit.value);
            bitrateValue.value = formatNum(displayValue);
            bitrateGroup.classList.add('calculated');
            resultMsg = `Bitrate: <span>${formatNum(displayValue)} ${bitrateUnit.value}</span>`;
        }

        calcResultBar.style.display = 'flex';
        calcResultText.innerHTML = resultMsg;
    }

    // Duration input auto-advance
    [durHH, durMM, durSS].forEach((input, i, arr) => {
        input.addEventListener('input', () => {
            input.value = input.value.replace(/\D/g, '');
            fieldDirty.duration = true;
            lastEditedField = 'fileSize'; // if user edits duration, recalc file size by default
            if (input !== durHH && input.value.length >= 2 && i < arr.length - 1) {
                arr[i + 1].focus();
                arr[i + 1].select();
            }
            calculate();
        });
        input.addEventListener('focus', () => input.select());
        input.addEventListener('blur', () => {
            if (input.value.length === 1 && input !== durHH) {
                input.value = '0' + input.value;
            }
        });
    });

    // Bitrate input
    bitrateValue.addEventListener('input', () => {
        fieldDirty.bitrate = true;
        lastEditedField = 'fileSize'; // if user edits bitrate, recalc file size
        calculate();
    });
    bitrateUnit.addEventListener('change', () => {
        if (fieldDirty.bitrate) {
            lastEditedField = 'fileSize';
        }
        calculate();
    });

    // File size input
    fileSizeValue.addEventListener('input', () => {
        fieldDirty.fileSize = true;
        lastEditedField = 'duration'; // if user edits file size, recalc duration
        calculate();
    });
    fileSizeUnit.addEventListener('change', () => {
        if (fieldDirty.fileSize) {
            lastEditedField = 'duration';
        }
        calculate();
    });

    // Clear button
    document.getElementById('clearCalcBtn').addEventListener('click', () => {
        durHH.value = '';
        durMM.value = '';
        durSS.value = '';
        bitrateValue.value = '';
        fileSizeValue.value = '';
        lastEditedField = null;
        fieldDirty = { duration: false, bitrate: false, fileSize: false };
        clearCalculatedHighlight();
        calcResultBar.style.display = 'none';
    });


    // ==============================
    // Panel 2: Common Presets
    // ==============================

    document.getElementById('presetGrid').addEventListener('click', (e) => {
        const card = e.target.closest('.preset-card');
        if (!card) return;

        const rate = parseFloat(card.dataset.bitrate);
        const unit = card.dataset.unit;

        bitrateValue.value = rate;
        bitrateUnit.value = unit;
        fieldDirty.bitrate = true;
        lastEditedField = 'fileSize';

        Toast.info(`Applied preset: ${card.querySelector('.preset-card-name').textContent}`);
        calculate();
    });


    // ==============================
    // Panel 3: Data Rate Converter
    // ==============================

    const rateConvValue = document.getElementById('rateConvValue');
    const rateConvUnit = document.getElementById('rateConvUnit');

    /** Convert an input value + unit to bits per second */
    function rateInputToBps(value, unit) {
        switch (unit) {
            case 'bps':  return value;
            case 'Kbps': return value * 1000;
            case 'Mbps': return value * 1e6;
            case 'Gbps': return value * 1e9;
            case 'KB/s': return value * 1000 * 8;    // bytes to bits
            case 'MB/s': return value * 1e6 * 8;
            case 'GB/s': return value * 1e9 * 8;
            default:     return value;
        }
    }

    function updateRateConverter() {
        const val = parseFloat(rateConvValue.value);
        if (isNaN(val) || val < 0) {
            document.getElementById('rateBps').textContent = '0';
            document.getElementById('rateKbps').textContent = '0';
            document.getElementById('rateMbps').textContent = '0';
            document.getElementById('rateGbps').textContent = '0';
            document.getElementById('rateKBs').textContent = '0';
            document.getElementById('rateMBs').textContent = '0';
            document.getElementById('rateGBs').textContent = '0';
            return;
        }

        const bps = rateInputToBps(val, rateConvUnit.value);

        document.getElementById('rateBps').textContent = smartFormat(bps);
        document.getElementById('rateKbps').textContent = formatNum(bps / 1000);
        document.getElementById('rateMbps').textContent = formatNum(bps / 1e6);
        document.getElementById('rateGbps').textContent = formatNum(bps / 1e9);
        // Bytes per second (bits / 8)
        document.getElementById('rateKBs').textContent = formatNum(bps / 8 / 1000);
        document.getElementById('rateMBs').textContent = formatNum(bps / 8 / 1e6);
        document.getElementById('rateGBs').textContent = formatNum(bps / 8 / 1e9);
    }

    rateConvValue.addEventListener('input', updateRateConverter);
    rateConvUnit.addEventListener('change', updateRateConverter);
});
