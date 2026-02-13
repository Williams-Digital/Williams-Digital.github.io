/* ============================================
   AUDIO TONE GENERATOR
   Web Audio API-based reference tone generator
   ============================================ */

(function () {
    let audioCtx = null;
    let oscillator = null;
    let noiseSource = null;
    let gainNode = null;
    let splitter = null;
    let mergerNode = null;
    let analyserL = null;
    let analyserR = null;
    let isPlaying = false;
    let animFrame = null;

    let currentFreq = 1000;
    let currentWaveform = 'sine';
    let currentVolume = 0.25;
    let currentChannel = 'stereo';
    let currentType = 'tone'; // 'tone', 'white', 'pink'

    // DOM
    const playBtn = document.getElementById('playBtn');
    const playIcon = document.getElementById('playIcon');
    const stopIcon = document.getElementById('stopIcon');
    const onAir = document.getElementById('onAirIndicator');
    const playLed = document.getElementById('playLed');
    const freqDisplay = document.getElementById('freqDisplay');
    const freqUnit = document.getElementById('freqUnit');
    const freqInput = document.getElementById('freqInput');
    const freqSlider = document.getElementById('freqSlider');
    const waveformSelect = document.getElementById('waveformSelect');
    const volumeSlider = document.getElementById('volumeSlider');
    const volumeDisplay = document.getElementById('volumeDisplay');
    const channelSelect = document.getElementById('channelSelect');
    const vuLeft = document.getElementById('vuLeft');
    const vuRight = document.getElementById('vuRight');

    function getAudioContext() {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        return audioCtx;
    }

    /* --- Noise Generators --- */

    function createWhiteNoise(ctx, duration) {
        const sampleRate = ctx.sampleRate;
        const length = sampleRate * duration;
        const buffer = ctx.createBuffer(1, length, sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < length; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        return buffer;
    }

    function createPinkNoise(ctx, duration) {
        const sampleRate = ctx.sampleRate;
        const length = sampleRate * duration;
        const buffer = ctx.createBuffer(1, length, sampleRate);
        const data = buffer.getChannelData(0);

        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
        for (let i = 0; i < length; i++) {
            const white = Math.random() * 2 - 1;
            b0 = 0.99886 * b0 + white * 0.0555179;
            b1 = 0.99332 * b1 + white * 0.0750759;
            b2 = 0.96900 * b2 + white * 0.1538520;
            b3 = 0.86650 * b3 + white * 0.3104856;
            b4 = 0.55000 * b4 + white * 0.5329522;
            b5 = -0.7616 * b5 - white * 0.0168980;
            data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
            b6 = white * 0.115926;
        }
        return buffer;
    }

    /* --- Playback --- */

    function startTone() {
        const ctx = getAudioContext();
        if (ctx.state === 'suspended') ctx.resume();

        stopTone(true);

        // Create gain
        gainNode = ctx.createGain();
        gainNode.gain.value = currentVolume;

        // Create channel merger for L/R control
        mergerNode = ctx.createChannelMerger(2);
        const leftGain = ctx.createGain();
        const rightGain = ctx.createGain();

        // Channel routing
        switch (currentChannel) {
            case 'left':
                leftGain.gain.value = 1;
                rightGain.gain.value = 0;
                break;
            case 'right':
                leftGain.gain.value = 0;
                rightGain.gain.value = 1;
                break;
            case 'mono':
                leftGain.gain.value = 0.707;
                rightGain.gain.value = 0.707;
                break;
            default: // stereo
                leftGain.gain.value = 1;
                rightGain.gain.value = 1;
        }

        // Create analysers
        analyserL = ctx.createAnalyser();
        analyserL.fftSize = 256;
        analyserR = ctx.createAnalyser();
        analyserR.fftSize = 256;

        // Create source
        if (currentType === 'tone') {
            oscillator = ctx.createOscillator();
            oscillator.type = currentWaveform;
            oscillator.frequency.value = currentFreq;
            oscillator.connect(gainNode);
        } else {
            const buffer = currentType === 'pink'
                ? createPinkNoise(ctx, 30)
                : createWhiteNoise(ctx, 30);
            noiseSource = ctx.createBufferSource();
            noiseSource.buffer = buffer;
            noiseSource.loop = true;
            noiseSource.connect(gainNode);
        }

        // Route: source -> gain -> splitter -> L/R gains -> merger -> analysers -> destination
        splitter = ctx.createChannelSplitter(2);

        // For mono sources, we need to handle differently
        gainNode.connect(leftGain);
        gainNode.connect(rightGain);
        leftGain.connect(mergerNode, 0, 0);
        rightGain.connect(mergerNode, 0, 1);

        // Split for analysis
        const postSplitter = ctx.createChannelSplitter(2);
        mergerNode.connect(postSplitter);
        postSplitter.connect(analyserL, 0);
        postSplitter.connect(analyserR, 1);

        mergerNode.connect(ctx.destination);

        // Start
        if (oscillator) oscillator.start();
        if (noiseSource) noiseSource.start();

        isPlaying = true;
        updateUI();
        startVUMeters();
    }

    function stopTone(internal) {
        if (oscillator) {
            try { oscillator.stop(); } catch (e) {}
            oscillator.disconnect();
            oscillator = null;
        }
        if (noiseSource) {
            try { noiseSource.stop(); } catch (e) {}
            noiseSource.disconnect();
            noiseSource = null;
        }
        if (gainNode) {
            gainNode.disconnect();
            gainNode = null;
        }
        if (mergerNode) {
            mergerNode.disconnect();
            mergerNode = null;
        }

        if (!internal) {
            isPlaying = false;
            if (animFrame) cancelAnimationFrame(animFrame);
            vuLeft.style.width = '0%';
            vuRight.style.width = '0%';
            updateUI();
        }
    }

    /* --- VU Meters --- */

    function startVUMeters() {
        const bufferL = new Uint8Array(analyserL.frequencyBinCount);
        const bufferR = new Uint8Array(analyserR.frequencyBinCount);

        function draw() {
            if (!isPlaying) return;
            animFrame = requestAnimationFrame(draw);

            analyserL.getByteTimeDomainData(bufferL);
            analyserR.getByteTimeDomainData(bufferR);

            const rmsL = calcRMS(bufferL);
            const rmsR = calcRMS(bufferR);

            vuLeft.style.width = `${Math.min(100, rmsL * 100)}%`;
            vuRight.style.width = `${Math.min(100, rmsR * 100)}%`;
        }

        draw();
    }

    function calcRMS(buffer) {
        let sum = 0;
        for (let i = 0; i < buffer.length; i++) {
            const v = (buffer[i] - 128) / 128;
            sum += v * v;
        }
        return Math.sqrt(sum / buffer.length) * 3; // Scale up for visibility
    }

    /* --- UI Updates --- */

    function updateUI() {
        playBtn.classList.toggle('active', isPlaying);
        playIcon.style.display = isPlaying ? 'none' : 'block';
        stopIcon.style.display = isPlaying ? 'block' : 'none';
        onAir.classList.toggle('active', isPlaying);
        playLed.className = 'status-led' + (isPlaying ? ' active' : '');

        if (currentType === 'tone') {
            freqDisplay.textContent = currentFreq >= 1000
                ? (currentFreq / 1000).toFixed(currentFreq % 1000 === 0 ? 0 : 1) + 'k'
                : currentFreq;
            const waveLabel = currentWaveform.charAt(0).toUpperCase() + currentWaveform.slice(1);
            freqUnit.innerHTML = `Hz &middot; ${waveLabel} Wave`;
        } else {
            freqDisplay.textContent = currentType === 'pink' ? 'Pink' : 'White';
            freqUnit.textContent = 'Noise';
        }
    }

    function updateVolume() {
        currentVolume = volumeSlider.value / 100;
        if (gainNode) gainNode.gain.value = currentVolume;

        const db = currentVolume > 0
            ? (20 * Math.log10(currentVolume)).toFixed(0)
            : '-\u221E';
        volumeDisplay.textContent = `${db} dB`;
    }

    /* --- Event Handlers --- */

    playBtn.addEventListener('click', () => {
        if (isPlaying) {
            stopTone();
        } else {
            startTone();
        }
    });

    // Presets
    document.getElementById('presetGrid').addEventListener('click', (e) => {
        const btn = e.target.closest('.preset-btn');
        if (!btn) return;

        document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        currentType = btn.dataset.type;
        if (currentType === 'tone') {
            currentFreq = parseInt(btn.dataset.freq);
            currentWaveform = btn.dataset.wave;
            freqInput.value = currentFreq;
            freqSlider.value = currentFreq;
            waveformSelect.value = currentWaveform;
        }

        if (isPlaying) startTone();
        updateUI();
    });

    // Frequency input
    freqInput.addEventListener('input', () => {
        const v = parseInt(freqInput.value);
        if (v >= 20 && v <= 20000) {
            currentFreq = v;
            freqSlider.value = v;
            currentType = 'tone';
            clearPresetActive();
            if (isPlaying && oscillator) {
                oscillator.frequency.value = currentFreq;
            }
            updateUI();
        }
    });

    // Frequency slider
    freqSlider.addEventListener('input', () => {
        currentFreq = parseInt(freqSlider.value);
        freqInput.value = currentFreq;
        currentType = 'tone';
        clearPresetActive();
        if (isPlaying && oscillator) {
            oscillator.frequency.value = currentFreq;
        }
        updateUI();
    });

    // Waveform
    waveformSelect.addEventListener('change', () => {
        currentWaveform = waveformSelect.value;
        currentType = 'tone';
        clearPresetActive();
        if (isPlaying && oscillator) {
            oscillator.type = currentWaveform;
        }
        updateUI();
    });

    // Volume
    volumeSlider.addEventListener('input', updateVolume);

    // Channel
    channelSelect.addEventListener('change', () => {
        currentChannel = channelSelect.value;
        if (isPlaying) startTone();
    });

    function clearPresetActive() {
        document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
    }

    // Initialize
    updateVolume();
    updateUI();
})();
