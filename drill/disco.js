/* --- MAX Disco Party Logic --- */

let audioCtx;
let particleInterval;
let beatInterval;
let partyDuration = 8000; // Increased duration for maximum fun

function startParty() {
    const body = document.body;

    // Add Elements if missing
    ensureDiscoElements();

    // 1. Visual Effects
    body.classList.add('party-mode');

    // 2. Audio & Beat Sync
    playMaxDiscoMusic();

    // 3. Particle Loop
    if (particleInterval) clearInterval(particleInterval);
    particleInterval = setInterval(createMaxParticle, 30); // Faster particles

    // 4. Stop after duration
    setTimeout(stopParty, partyDuration);
}

function stopParty() {
    const body = document.body;
    body.classList.remove('party-mode');
    body.classList.remove('party-shake'); // 画面シェイクを停止

    if (particleInterval) clearInterval(particleInterval);
    if (beatInterval) clearInterval(beatInterval);

    if (audioCtx) {
        audioCtx.close();
        audioCtx = null;
    }

    // Clean up disco elements
    const discoLayer = document.getElementById('disco-layer');
    if (discoLayer) discoLayer.innerHTML = '';
}

function ensureDiscoElements() {
    if (!document.getElementById('disco-layer')) {
        const layer = document.createElement('div');
        layer.id = 'disco-layer';
        layer.innerHTML = `
            <div class="laser-beam"></div>
            <div class="laser-beam reverse"></div>
            <div class="strobe"></div>
        `;
        document.body.appendChild(layer);
    }
    if (!document.getElementById('mirror-ball')) {
        const ball = document.createElement('div');
        ball.id = 'mirror-ball';
        ball.className = 'mirror-ball';
        document.body.appendChild(ball);
    }
}

/* --- Visual Effects --- */
function createMaxParticle() {
    const p = document.createElement('div');
    p.classList.add('particle');

    const x = Math.random() * 100;
    const colors = ['#ff0000', '#ff00ff', '#0000ff', '#00ffff', '#00ff00', '#ffff00'];
    const color = colors[Math.floor(Math.random() * colors.length)];

    p.style.left = x + 'vw';
    p.style.top = window.scrollY - 20 + 'px'; // Start slightly above
    p.style.background = color;
    p.style.boxShadow = `0 0 15px ${color}`;

    const size = Math.random() * 20 + 5;
    p.style.width = size + 'px';
    p.style.height = size + 'px';

    if (Math.random() > 0.3) {
        p.style.borderRadius = '0%'; // Squares
        p.style.transform = `rotate(${Math.random() * 360}deg)`;
    } else {
        p.style.borderRadius = '50%'; // Circles
    }

    const layer = document.getElementById('disco-layer');
    if (layer) layer.appendChild(p);

    setTimeout(() => { p.remove(); }, 2000);
}

function triggerBeatEffect() {
    const body = document.body;
    const targets = document.querySelectorAll('.celebration-message, .trophy');

    // 1. Screen Shake
    body.classList.remove('party-shake');
    void body.offsetWidth; // Trigger reflow
    body.classList.add('party-shake');

    // 2. Text Pump
    targets.forEach(t => {
        t.classList.add('pump-it');
        setTimeout(() => t.classList.remove('pump-it'), 100);
    });
}

/* --- Audio Synthesis (MAX Energy) --- */
function playMaxDiscoMusic() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    } else if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }

    const now = audioCtx.currentTime;
    const bpm = 140; // Faster BPM
    const beatTime = 60 / bpm;
    const totalBeats = Math.floor(partyDuration / 1000 / beatTime);

    // Schedule audio events
    for (let i = 0; i < 32; i++) {
        const time = now + i * beatTime;

        // Kick (The Beat)
        playKick(time);

        // Sync Visuals to Beat
        setTimeout(() => triggerBeatEffect(), i * beatTime * 1000);

        // Hi-Hat
        if (i % 1 === 0.5 || true) playHiHat(time + beatTime / 2);

        // Bassline
        if (i % 4 === 0) playBass(time, 150, 0.3); // Heavy Downbeat
        else playBass(time, 300, 0.1);

        // Snare/Clap
        if (i % 2 === 1) playSnare(time);
    }

    // Air Horn at start and halfway
    playAirHorn(now);
    playAirHorn(now + 4 * beatTime);
    playAirHorn(now + 2 * 4 * beatTime);

    // Lead Melody
    playHighEnergyLead(now, beatTime);
}

function playKick(time) {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.frequency.setValueAtTime(200, time);
    osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.4);
    gain.gain.setValueAtTime(1.5, time); // Louder
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.4);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(time);
    osc.stop(time + 0.4);
}

function playSnare(time) {
    const noiseBuffer = audioCtx.createBuffer(1, audioCtx.sampleRate * 0.1, audioCtx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < noiseBuffer.length; i++) {
        output[i] = Math.random() * 2 - 1;
    }
    const noise = audioCtx.createBufferSource();
    noise.buffer = noiseBuffer;
    const noiseGain = audioCtx.createGain();
    noiseGain.gain.setValueAtTime(0.5, time);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, time + 0.1);
    noise.connect(noiseGain);
    noiseGain.connect(audioCtx.destination);
    noise.start(time);
}

function playHiHat(time) {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(1000, time);
    osc.frequency.linearRampToValueAtTime(4000, time + 0.05);
    gain.gain.setValueAtTime(0.2, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.05);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(time);
    osc.stop(time + 0.05);
}

function playBass(time, freq, sustain) {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq / 2, time); // Sub bass

    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(freq, time);
    filter.frequency.linearRampToValueAtTime(50, time + sustain);

    gain.gain.setValueAtTime(0.6, time);
    gain.gain.linearRampToValueAtTime(0, time + sustain);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(time);
    osc.stop(time + sustain + 0.1);
}

function playAirHorn(time) {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sawtooth';

    // Air horn pitch drop effect
    osc.frequency.setValueAtTime(400, time);
    osc.frequency.linearRampToValueAtTime(400, time + 0.1); // Sustain
    osc.frequency.linearRampToValueAtTime(300, time + 0.3); // Drop

    // Harmonics
    const osc2 = audioCtx.createOscillator();
    osc2.type = 'sawtooth';
    osc2.frequency.setValueAtTime(405, time); // Detune
    osc2.frequency.linearRampToValueAtTime(405, time + 0.1);
    osc2.frequency.linearRampToValueAtTime(305, time + 0.3);

    gain.gain.setValueAtTime(0.4, time);
    gain.gain.linearRampToValueAtTime(0.4, time + 0.1);
    gain.gain.linearRampToValueAtTime(0, time + 0.4);

    osc.connect(gain);
    osc2.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start(time);
    osc2.start(time);
    osc.stop(time + 0.5);
    osc2.stop(time + 0.5);
}

function playHighEnergyLead(time, beatTime) {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'square';

    // Fast Arpeggio Pattern
    const notes = [
        523.25, 659.25, 783.99, 1046.50,
        523.25, 659.25, 783.99, 1046.50,
        587.33, 739.99, 880.00, 1174.66,
        523.25, 659.25, 783.99, 1046.50
    ];

    notes.forEach((note, i) => {
        const t = time + i * (beatTime / 2); // 8th notes
        osc.frequency.setValueAtTime(note, t);
        gain.gain.setValueAtTime(0.1, t);
        gain.gain.linearRampToValueAtTime(0, t + 0.1);
    });

    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(time);
    osc.stop(time + notes.length * (beatTime / 2));
}
