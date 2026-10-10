/** Mantiene la pantalla encendida mientras la app está visible (si el navegador lo soporta). */

let sentinel: WakeLockSentinel | null = null;
let wanted = false;

async function acquire(): Promise<void> {
  if (!('wakeLock' in navigator) || sentinel || document.visibilityState !== 'visible') return;
  try {
    sentinel = await navigator.wakeLock.request('screen');
    sentinel.addEventListener('release', () => (sentinel = null));
  } catch {
    /* denegado o no soportado */
  }
}

export function setWakeLock(on: boolean): void {
  wanted = on;
  if (on) void acquire();
  else void sentinel?.release();
}

document.addEventListener('visibilitychange', () => {
  if (wanted && document.visibilityState === 'visible') void acquire();
});
