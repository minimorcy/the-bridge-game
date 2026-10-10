type LockableOrientation = ScreenOrientation & {
  lock?: (orientation: 'landscape') => Promise<void>;
  unlock?: () => void;
};

const orientation = (): LockableOrientation | undefined =>
  (screen as Screen & { orientation?: LockableOrientation }).orientation;

const standalone = (): boolean => matchMedia('(display-mode: standalone), (display-mode: fullscreen)').matches;

/** El navegador puede bloquear la orientación (Android). En iPhone no existe. */
export function canLockLandscape(): boolean {
  return typeof orientation()?.lock === 'function' && typeof document.documentElement.requestFullscreen === 'function';
}

/**
 * Intenta fijar la pantalla en horizontal. Fuera de la app instalada el navegador exige
 * pantalla completa, que solo se puede pedir tras un toque (`withFullscreen`).
 */
export async function lockLandscape(withFullscreen: boolean): Promise<boolean> {
  const o = orientation();
  if (typeof o?.lock !== 'function') return false;
  try {
    if (withFullscreen && !document.fullscreenElement && !standalone()) {
      await document.documentElement.requestFullscreen({ navigationUI: 'hide' });
    }
    await o.lock('landscape');
    return true;
  } catch {
    return false;
  }
}

export function unlockOrientation(): void {
  try {
    orientation()?.unlock?.();
  } catch {
    /* no soportado */
  }
}
