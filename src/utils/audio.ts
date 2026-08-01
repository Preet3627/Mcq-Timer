// Web Audio API Synthesizer for JEE/NEET Focus & Warning Audio

let audioCtx: AudioContext | null = null;
let ambientGainNode: GainNode | null = null;
let activeAmbientSources: Array<{ stop: () => void }> = [];
let tickInterval: number | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function playClickSound(enabled = true, volume = 0.5) {
  if (!enabled) return;
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.02);
    
    gain.gain.setValueAtTime(0.08 * volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.02);

    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.025);
  } catch (e) {
    // Ignore audio context errors before user interaction
  }
}

export function playCautionChime(enabled = true, volume = 0.8) {
  if (!enabled) return;
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    const playTone = (freq: number, delay: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + delay);
      
      gain.gain.setValueAtTime(0, now + delay);
      gain.gain.linearRampToValueAtTime(0.25 * volume, now + delay + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + delay + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + delay);
      osc.stop(now + delay + duration);
    };

    // Soft caution double-chime (A4 -> C#5)
    playTone(440, 0, 0.8);
    playTone(554.37, 0.2, 1.2);
  } catch (e) {
    console.warn('Audio play error', e);
  }
}

export function playUrgentAlarm(enabled = true, volume = 0.9) {
  if (!enabled) return;
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // 3 urgent alert pulses
    for (let i = 0; i < 3; i++) {
      const delay = i * 0.25;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'triangle';
      osc2.type = 'sawtooth';

      osc1.frequency.setValueAtTime(659.25, now + delay); // E5
      osc2.frequency.setValueAtTime(783.99, now + delay); // G5

      gain.gain.setValueAtTime(0.2 * volume, now + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.18);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now + delay);
      osc2.start(now + delay);
      osc1.stop(now + delay + 0.2);
      osc2.stop(now + delay + 0.2);
    }
  } catch (e) {
    console.warn('Audio play error', e);
  }
}

export function playFanfareSound(enabled = true, volume = 0.7) {
  if (!enabled) return;
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const notes = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.12);

      gain.gain.setValueAtTime(0, now + idx * 0.12);
      gain.gain.linearRampToValueAtTime(0.2 * volume, now + idx * 0.12 + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.6);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.12);
      osc.stop(now + idx * 0.12 + 0.65);
    });
  } catch (e) {
    console.warn('Fanfare sound error', e);
  }
}

// Stop current ambient background sound
export function stopAmbientSound() {
  activeAmbientSources.forEach((s) => {
    try {
      s.stop();
    } catch (e) {}
  });
  activeAmbientSources = [];
  if (tickInterval !== null) {
    clearInterval(tickInterval);
    tickInterval = null;
  }
}

// Start Ambient Focus Sound (Zen Pad, Ticking, Brown Noise, Rain)
export function startAmbientSound(
  type: 'none' | 'zen_pad' | 'ticking' | 'brown_noise' | 'rain',
  volume = 0.3
) {
  stopAmbientSound();
  if (type === 'none') return;

  try {
    const ctx = getAudioContext();
    ambientGainNode = ctx.createGain();
    ambientGainNode.gain.setValueAtTime(volume * 0.4, ctx.currentTime);
    ambientGainNode.connect(ctx.destination);

    if (type === 'zen_pad') {
      // Warm synth pad using 2 harmonic sine oscillators
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(350, ctx.currentTime);

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(146.83, ctx.currentTime); // D3
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(220.0, ctx.currentTime); // A3

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(ambientGainNode);

      osc1.start();
      osc2.start();

      activeAmbientSources.push(osc1, osc2);
    } else if (type === 'ticking') {
      // Metronome clock tick every second
      tickInterval = window.setInterval(() => {
        if (!audioCtx) return;
        const now = audioCtx.currentTime;
        const tickOsc = audioCtx.createOscillator();
        const tickGain = audioCtx.createGain();

        tickOsc.type = 'sine';
        tickOsc.frequency.setValueAtTime(900, now);
        tickGain.gain.setValueAtTime(0.05 * volume, now);
        tickGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.03);

        tickOsc.connect(tickGain);
        tickGain.connect(audioCtx.destination);
        tickOsc.start(now);
        tickOsc.stop(now + 0.035);
      }, 1000);
    } else if (type === 'brown_noise' || type === 'rain') {
      // Procedural Brown / Pink Rain Noise
      const bufferSize = 2 * ctx.sampleRate;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let lastOut = 0.0;

      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        if (type === 'brown_noise') {
          output[i] = (lastOut + 0.02 * white) / 1.02;
          lastOut = output[i];
          output[i] *= 3.5;
        } else {
          // Soft Rain effect
          output[i] = (lastOut + 0.05 * white) / 1.05;
          lastOut = output[i];
          output[i] *= 1.8;
        }
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(type === 'brown_noise' ? 250 : 600, ctx.currentTime);

      whiteNoise.connect(filter);
      filter.connect(ambientGainNode);
      whiteNoise.start();

      activeAmbientSources.push(whiteNoise);
    }
  } catch (e) {
    console.warn('Failed to start ambient audio:', e);
  }
}

export function updateAmbientVolume(volume: number) {
  if (ambientGainNode && audioCtx) {
    ambientGainNode.gain.setValueAtTime(volume * 0.4, audioCtx.currentTime);
  }
}
