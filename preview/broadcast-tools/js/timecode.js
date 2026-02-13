/* ============================================
   TIMECODE CALCULATOR — Logic
   Full SMPTE timecode math with drop-frame support
   ============================================ */

const Timecode = (() => {
    'use strict';

    // --- Frame rate helpers ---

    /** Get the nominal (integer) frames per second for a rate key */
    function nominalFps(rateKey) {
        switch (rateKey) {
            case '23.976': return 24;
            case '24':     return 24;
            case '25':     return 25;
            case '29.97df':
            case '29.97ndf': return 30;
            case '30':     return 30;
            case '50':     return 50;
            case '59.94df': return 60;
            case '60':     return 60;
            default:       return 30;
        }
    }

    /** Get the actual (real-time) frame rate as a float */
    function actualFps(rateKey) {
        switch (rateKey) {
            case '23.976':   return 24000 / 1001;
            case '24':       return 24;
            case '25':       return 25;
            case '29.97df':
            case '29.97ndf': return 30000 / 1001;
            case '30':       return 30;
            case '50':       return 50;
            case '59.94df':  return 60000 / 1001;
            case '60':       return 60;
            default:         return 30;
        }
    }

    /** Check if the rate key uses drop-frame counting */
    function isDropFrame(rateKey) {
        return rateKey === '29.97df' || rateKey === '59.94df';
    }

    /** Number of frames dropped per minute skip for drop-frame */
    function dropFramesPerSkip(rateKey) {
        // 29.97 drops frames 0,1 (2 frames); 59.94 drops 0,1,2,3 (4 frames)
        return rateKey === '59.94df' ? 4 : 2;
    }

    // --- Core conversion functions ---

    /**
     * Convert HH:MM:SS:FF to total frame count.
     * Handles drop-frame by adding back the dropped frames.
     */
    function timecodeToFrames(hh, mm, ss, ff, rateKey) {
        const h = parseInt(hh, 10) || 0;
        const m = parseInt(mm, 10) || 0;
        const s = parseInt(ss, 10) || 0;
        const f = parseInt(ff, 10) || 0;
        const fps = nominalFps(rateKey);

        if (!isDropFrame(rateKey)) {
            // Non-drop: straightforward
            return h * 3600 * fps + m * 60 * fps + s * fps + f;
        }

        // Drop-frame calculation
        const d = dropFramesPerSkip(rateKey);
        const totalMinutes = h * 60 + m;
        // Frames dropped = d frames at the start of every minute, except every 10th minute
        const droppedFrames = d * (totalMinutes - Math.floor(totalMinutes / 10));
        const totalFrames = h * 3600 * fps + m * 60 * fps + s * fps + f - droppedFrames;
        return Math.max(0, totalFrames);
    }

    /**
     * Convert a total frame count back to HH:MM:SS:FF.
     * Returns an object { hh, mm, ss, ff } with zero-padded strings.
     */
    function framesToTimecode(totalFrames, rateKey) {
        const fps = nominalFps(rateKey);
        let frames = Math.max(0, Math.round(totalFrames));

        if (!isDropFrame(rateKey)) {
            const f = frames % fps;
            frames = Math.floor(frames / fps);
            const s = frames % 60;
            frames = Math.floor(frames / 60);
            const m = frames % 60;
            const h = Math.floor(frames / 60);
            return {
                hh: String(h).padStart(2, '0'),
                mm: String(m).padStart(2, '0'),
                ss: String(s).padStart(2, '0'),
                ff: String(f).padStart(2, '0'),
            };
        }

        // Drop-frame reverse calculation
        const d = dropFramesPerSkip(rateKey);
        const framesPerMinute = fps * 60 - d;            // frames in a non-10th minute
        const framesPer10Min = framesPerMinute * 10 + d;  // frames in a 10-minute block
        const framesPerHour = framesPer10Min * 6;

        const h = Math.floor(frames / framesPerHour);
        frames -= h * framesPerHour;

        const tenMinBlocks = Math.floor(frames / framesPer10Min);
        frames -= tenMinBlocks * framesPer10Min;

        let m = 0;
        if (frames >= fps * 60) {
            // First minute of a 10-min block has no drops
            frames -= fps * 60;
            m = 1;
            const additionalMinutes = Math.floor(frames / framesPerMinute);
            m += additionalMinutes;
            frames -= additionalMinutes * framesPerMinute;
        }
        m += tenMinBlocks * 10;

        const s = Math.floor(frames / fps);
        const f = frames % fps;

        return {
            hh: String(h).padStart(2, '0'),
            mm: String(m).padStart(2, '0'),
            ss: String(s).padStart(2, '0'),
            ff: String(f).padStart(2, '0'),
        };
    }

    /** Format a timecode object to string "HH:MM:SS:FF" or "HH:MM:SS;FF" for drop-frame */
    function formatTimecode(tc, rateKey) {
        const sep = isDropFrame(rateKey) ? ';' : ':';
        return `${tc.hh}:${tc.mm}:${tc.ss}${sep}${tc.ff}`;
    }

    /** Add two timecodes (in frames) */
    function addTimecodes(hhA, mmA, ssA, ffA, hhB, mmB, ssB, ffB, rateKey) {
        const framesA = timecodeToFrames(hhA, mmA, ssA, ffA, rateKey);
        const framesB = timecodeToFrames(hhB, mmB, ssB, ffB, rateKey);
        return framesToTimecode(framesA + framesB, rateKey);
    }

    /** Subtract timecode B from A (in frames), clamp to 0 */
    function subtractTimecodes(hhA, mmA, ssA, ffA, hhB, mmB, ssB, ffB, rateKey) {
        const framesA = timecodeToFrames(hhA, mmA, ssA, ffA, rateKey);
        const framesB = timecodeToFrames(hhB, mmB, ssB, ffB, rateKey);
        return framesToTimecode(Math.max(0, framesA - framesB), rateKey);
    }

    /**
     * Convert timecode from one frame rate to another.
     * The conversion preserves real-world time (seconds), not frame count.
     */
    function convertFrameRate(hh, mm, ss, ff, sourceRate, targetRate) {
        const sourceFrames = timecodeToFrames(hh, mm, ss, ff, sourceRate);
        const srcFps = actualFps(sourceRate);
        const tgtFps = actualFps(targetRate);
        // Real-time seconds represented by source timecode
        const realSeconds = sourceFrames / srcFps;
        // Convert to target frames
        const targetFrames = Math.round(realSeconds * tgtFps);
        return {
            tc: framesToTimecode(targetFrames, targetRate),
            sourceFrames,
            targetFrames,
        };
    }

    /**
     * Validate a timecode field value.
     * Returns clamped integer value.
     */
    function clampField(value, max) {
        let v = parseInt(value, 10);
        if (isNaN(v) || v < 0) return 0;
        if (v > max) return max;
        return v;
    }

    return {
        nominalFps,
        actualFps,
        isDropFrame,
        timecodeToFrames,
        framesToTimecode,
        formatTimecode,
        addTimecodes,
        subtractTimecodes,
        convertFrameRate,
        clampField,
    };
})();


/* ============================================
   UI Wiring
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    // ---- Helper: read timecode fields from a group ----
    function readTC(prefix) {
        return {
            hh: document.getElementById(`${prefix}HH`).value,
            mm: document.getElementById(`${prefix}MM`).value,
            ss: document.getElementById(`${prefix}SS`).value,
            ff: document.getElementById(`${prefix}FF`).value,
        };
    }

    // ---- Helper: auto-advance to next field on 2-digit entry ----
    function initAutoAdvance(groupId) {
        const group = document.getElementById(groupId);
        if (!group) return;
        const inputs = group.querySelectorAll('input');
        inputs.forEach((input, i) => {
            input.addEventListener('input', () => {
                // Strip non-numeric
                input.value = input.value.replace(/\D/g, '');
                // Auto-advance when 2 digits entered
                if (input.value.length >= 2 && i < inputs.length - 1) {
                    inputs[i + 1].focus();
                    inputs[i + 1].select();
                }
            });

            // Select all text on focus for easy overwrite
            input.addEventListener('focus', () => input.select());

            // Pad on blur
            input.addEventListener('blur', () => {
                if (input.value.length === 1) {
                    input.value = '0' + input.value;
                }
            });
        });
    }

    // ---- Helper: validate and clamp all fields in a group ----
    function validateGroup(prefix, rateKey) {
        const fps = Timecode.nominalFps(rateKey);
        const hhEl = document.getElementById(`${prefix}HH`);
        const mmEl = document.getElementById(`${prefix}MM`);
        const ssEl = document.getElementById(`${prefix}SS`);
        const ffEl = document.getElementById(`${prefix}FF`);

        if (hhEl.value) hhEl.value = String(Timecode.clampField(hhEl.value, 99)).padStart(2, '0');
        if (mmEl.value) mmEl.value = String(Timecode.clampField(mmEl.value, 59)).padStart(2, '0');
        if (ssEl.value) ssEl.value = String(Timecode.clampField(ssEl.value, 59)).padStart(2, '0');
        if (ffEl.value) ffEl.value = String(Timecode.clampField(ffEl.value, fps - 1)).padStart(2, '0');
    }

    // ---- Update drop-frame separator display ----
    function updateSeparators() {
        const calcRate = document.getElementById('calcFrameRate').value;
        const convSourceRate = document.getElementById('convSourceRate').value;
        const framesRate = document.getElementById('framesRate').value;

        const calcSep = Timecode.isDropFrame(calcRate) ? ';' : ':';
        document.getElementById('tcASepFF').textContent = calcSep;
        document.getElementById('tcBSepFF').textContent = calcSep;

        const convSep = Timecode.isDropFrame(convSourceRate) ? ';' : ':';
        document.getElementById('convSepFF').textContent = convSep;

        const framesSep = Timecode.isDropFrame(framesRate) ? ';' : ':';
        document.getElementById('framesSepFF').textContent = framesSep;
    }


    // ==============================
    // Panel 1: Timecode Calculator
    // ==============================

    let currentOp = 'add';

    // Operation toggle
    document.getElementById('opToggle').addEventListener('click', (e) => {
        const btn = e.target.closest('button[data-op]');
        if (!btn) return;
        currentOp = btn.dataset.op;
        document.querySelectorAll('#opToggle button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        calculateResult();
    });

    function calculateResult() {
        const rate = document.getElementById('calcFrameRate').value;
        const a = readTC('tcA');
        const b = readTC('tcB');

        validateGroup('tcA', rate);
        validateGroup('tcB', rate);

        let result;
        if (currentOp === 'add') {
            result = Timecode.addTimecodes(a.hh, a.mm, a.ss, a.ff, b.hh, b.mm, b.ss, b.ff, rate);
        } else {
            result = Timecode.subtractTimecodes(a.hh, a.mm, a.ss, a.ff, b.hh, b.mm, b.ss, b.ff, rate);
        }

        const formatted = Timecode.formatTimecode(result, rate);
        document.getElementById('calcResult').textContent = formatted;

        const opLabel = currentOp === 'add' ? 'A + B' : 'A \u2212 B';
        document.getElementById('calcResultLabel').textContent = `Result (${opLabel})`;
    }

    // Auto-calculate on any input change in calculator panel
    ['tcAHH', 'tcAMM', 'tcASS', 'tcAFF', 'tcBHH', 'tcBMM', 'tcBSS', 'tcBFF'].forEach(id => {
        document.getElementById(id).addEventListener('input', calculateResult);
        document.getElementById(id).addEventListener('blur', calculateResult);
    });

    document.getElementById('calcFrameRate').addEventListener('change', () => {
        updateSeparators();
        calculateResult();
    });

    // Copy result
    document.getElementById('copyResultBtn').addEventListener('click', () => {
        const text = document.getElementById('calcResult').textContent;
        navigator.clipboard.writeText(text).then(() => {
            Toast.success('Timecode copied to clipboard');
        }).catch(() => {
            Toast.error('Failed to copy to clipboard');
        });
    });

    // Clear calculator
    document.getElementById('clearCalcBtn').addEventListener('click', () => {
        ['tcAHH', 'tcAMM', 'tcASS', 'tcAFF', 'tcBHH', 'tcBMM', 'tcBSS', 'tcBFF'].forEach(id => {
            document.getElementById(id).value = '';
        });
        document.getElementById('calcResult').textContent = '00:00:00:00';
        document.getElementById('calcResultLabel').textContent = 'Result';
    });


    // ==============================
    // Panel 2: Frame Rate Converter
    // ==============================

    function calculateConversion() {
        const sourceRate = document.getElementById('convSourceRate').value;
        const targetRate = document.getElementById('convTargetRate').value;
        const tc = readTC('conv');

        validateGroup('conv', sourceRate);

        const { tc: result, sourceFrames, targetFrames } = Timecode.convertFrameRate(
            tc.hh, tc.mm, tc.ss, tc.ff, sourceRate, targetRate
        );

        document.getElementById('convResult').textContent = Timecode.formatTimecode(result, targetRate);
        document.getElementById('convSourceFrames').textContent = sourceFrames.toLocaleString();
        document.getElementById('convTargetFrames').textContent = targetFrames.toLocaleString();
    }

    ['convHH', 'convMM', 'convSS', 'convFF'].forEach(id => {
        document.getElementById(id).addEventListener('input', calculateConversion);
        document.getElementById(id).addEventListener('blur', calculateConversion);
    });

    document.getElementById('convSourceRate').addEventListener('change', () => {
        updateSeparators();
        calculateConversion();
    });
    document.getElementById('convTargetRate').addEventListener('change', calculateConversion);


    // ==============================
    // Panel 3: Timecode to Frames
    // ==============================

    function calculateFrames() {
        const rate = document.getElementById('framesRate').value;
        const tc = readTC('frames');

        validateGroup('frames', rate);

        const totalFrames = Timecode.timecodeToFrames(tc.hh, tc.mm, tc.ss, tc.ff, rate);
        const realFps = Timecode.actualFps(rate);
        const totalSeconds = totalFrames / realFps;
        const totalMs = totalSeconds * 1000;

        document.getElementById('totalFrames').textContent = totalFrames.toLocaleString();
        document.getElementById('totalSeconds').textContent = totalSeconds.toFixed(3);
        document.getElementById('totalMs').textContent = Math.round(totalMs).toLocaleString();
    }

    ['framesHH', 'framesMM', 'framesSS', 'framesFF'].forEach(id => {
        document.getElementById(id).addEventListener('input', calculateFrames);
        document.getElementById(id).addEventListener('blur', calculateFrames);
    });

    document.getElementById('framesRate').addEventListener('change', () => {
        updateSeparators();
        calculateFrames();
        calculateReverse();
    });

    // Reverse: frames to timecode
    function calculateReverse() {
        const rate = document.getElementById('framesRate').value;
        const frameCount = parseInt(document.getElementById('reverseFramesInput').value, 10) || 0;
        const tc = Timecode.framesToTimecode(frameCount, rate);
        document.getElementById('reverseResult').textContent = Timecode.formatTimecode(tc, rate);
    }

    document.getElementById('reverseFramesInput').addEventListener('input', calculateReverse);


    // ==============================
    // Init
    // ==============================

    // Set up auto-advance for all timecode input groups
    initAutoAdvance('tcGroupA');
    initAutoAdvance('tcGroupB');
    initAutoAdvance('tcGroupConv');
    initAutoAdvance('tcGroupFrames');

    // Initial separator state
    updateSeparators();
});
