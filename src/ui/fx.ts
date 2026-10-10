/** Efectos de sonido sintetizados con Web Audio (sin ficheros) y vibración. */

let ctx: AudioContext | null = null;

function audio(): AudioContext | null {
  try {
    ctx ??= new AudioContext();
    if (ctx.state === 'suspended') void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function tone(freq: number, start: number, dur: number, opts: { type?: OscillatorType; gain?: number; to?: number } = {}): void {
  const ac = audio();
  if (!ac) return;
  const t = ac.currentTime + start;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = opts.type ?? 'sine';
  osc.frequency.setValueAtTime(freq, t);
  if (opts.to) osc.frequency.exponentialRampToValueAtTime(opts.to, t + dur);
  gain.gain.setValueAtTime(opts.gain ?? 0.2, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
  osc.connect(gain).connect(ac.destination);
  osc.start(t);
  osc.stop(t + dur);
}

function noise(start: number, dur: number, gainValue = 0.25, filterFreq = 3000): void {
  const ac = audio();
  if (!ac) return;
  const t = ac.currentTime + start;
  const buffer = ac.createBuffer(1, Math.ceil(ac.sampleRate * dur), ac.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
  const src = ac.createBufferSource();
  const filter = ac.createBiquadFilter();
  const gain = ac.createGain();
  src.buffer = buffer;
  filter.type = 'bandpass';
  filter.frequency.value = filterFreq;
  gain.gain.value = gainValue;
  src.connect(filter).connect(gain).connect(ac.destination);
  src.start(t);
}

export const sfx = {
  /** Carta deslizándose sobre la mesa. */
  card(): void {
    noise(0, 0.12, 0.3, 2500);
  },
  /** Redoble de tambor durante `seconds`. */
  drumroll(seconds: number): void {
    for (let t = 0; t < seconds; t += 0.05) noise(t, 0.05, 0.08 + (t / seconds) * 0.2, 180);
    noise(seconds, 0.25, 0.45, 120);
  },
  correct(): void {
    tone(660, 0, 0.12, { type: 'triangle' });
    tone(990, 0.1, 0.18, { type: 'triangle' });
  },
  fail(): void {
    tone(220, 0, 0.35, { type: 'sawtooth', gain: 0.12, to: 110 });
  },
  /** "Glu glu glu": burbujas ascendentes. */
  drink(): void {
    for (let i = 0; i < 4; i++) tone(260 + i * 30, i * 0.16, 0.12, { to: 700 + i * 60, gain: 0.25 });
  },
  /** Fanfarria al cruzar el puente. */
  cross(): void {
    [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.12, i === 3 ? 0.5 : 0.14, { type: 'square', gain: 0.08 }));
  },
};

export function vibrate(pattern: number | number[]): void {
  try {
    navigator.vibrate?.(pattern);
  } catch {
    /* no soportado (iOS) */
  }
}
