// Sound effects using Web Audio API - no external files needed

let audioContext: AudioContext | null = null;

const getAudioContext = (): AudioContext => {
    if (!audioContext) {
        audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContext;
};

// Coin sound - multiple quick metallic pings
export const playCoinSound = () => {
    try {
        const ctx = getAudioContext();
        const now = ctx.currentTime;

        // Play 3 quick coin sounds
        for (let i = 0; i < 3; i++) {
            const oscillator = ctx.createOscillator();
            const gainNode = ctx.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(ctx.destination);

            // High pitched metallic sound
            oscillator.frequency.setValueAtTime(800 + i * 200, now + i * 0.08);
            oscillator.frequency.exponentialRampToValueAtTime(2000 + i * 300, now + i * 0.08 + 0.05);
            oscillator.type = 'sine';

            gainNode.gain.setValueAtTime(0.15, now + i * 0.08);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + i * 0.08 + 0.15);

            oscillator.start(now + i * 0.08);
            oscillator.stop(now + i * 0.08 + 0.2);
        }
    } catch (e) {
        console.log('Audio not supported');
    }
};

// Sword unsheathe sound - swoosh effect
export const playSwordSound = () => {
    try {
        const ctx = getAudioContext();
        const now = ctx.currentTime;

        // White noise for swoosh
        const bufferSize = ctx.sampleRate * 0.3;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            output[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 2);
        }

        const whiteNoise = ctx.createBufferSource();
        whiteNoise.buffer = buffer;

        // Bandpass filter for metallic quality
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(3000, now);
        filter.frequency.exponentialRampToValueAtTime(8000, now + 0.15);
        filter.Q.value = 5;

        const gainNode = ctx.createGain();
        gainNode.gain.setValueAtTime(0.2, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

        whiteNoise.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(ctx.destination);

        whiteNoise.start(now);
        whiteNoise.stop(now + 0.3);

        // Add a subtle metallic ring
        const ring = ctx.createOscillator();
        const ringGain = ctx.createGain();
        ring.connect(ringGain);
        ringGain.connect(ctx.destination);

        ring.frequency.setValueAtTime(1200, now);
        ring.type = 'triangle';
        ringGain.gain.setValueAtTime(0.08, now);
        ringGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

        ring.start(now);
        ring.stop(now + 0.4);
    } catch (e) {
        console.log('Audio not supported');
    }
};

// Hammer anvil sound - deep thud with metallic ring
export const playHammerSound = () => {
    try {
        const ctx = getAudioContext();
        const now = ctx.currentTime;

        // Deep thud
        const thud = ctx.createOscillator();
        const thudGain = ctx.createGain();
        thud.connect(thudGain);
        thudGain.connect(ctx.destination);

        thud.frequency.setValueAtTime(150, now);
        thud.frequency.exponentialRampToValueAtTime(50, now + 0.1);
        thud.type = 'sine';

        thudGain.gain.setValueAtTime(0.3, now);
        thudGain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

        thud.start(now);
        thud.stop(now + 0.2);

        // Metallic ring
        const ring = ctx.createOscillator();
        const ringGain = ctx.createGain();
        ring.connect(ringGain);
        ringGain.connect(ctx.destination);

        ring.frequency.setValueAtTime(600, now);
        ring.type = 'triangle';
        ringGain.gain.setValueAtTime(0.15, now + 0.02);
        ringGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

        ring.start(now);
        ring.stop(now + 0.5);
    } catch (e) {
        console.log('Audio not supported');
    }
};

// Success/completion fanfare
export const playSuccessSound = () => {
    try {
        const ctx = getAudioContext();
        const now = ctx.currentTime;

        const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
        
        notes.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            
            osc.connect(gain);
            gain.connect(ctx.destination);
            
            osc.frequency.value = freq;
            osc.type = 'sine';
            
            gain.gain.setValueAtTime(0, now + i * 0.1);
            gain.gain.linearRampToValueAtTime(0.15, now + i * 0.1 + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.1 + 0.3);
            
            osc.start(now + i * 0.1);
            osc.stop(now + i * 0.1 + 0.35);
        });
    } catch (e) {
        console.log('Audio not supported');
    }
};
