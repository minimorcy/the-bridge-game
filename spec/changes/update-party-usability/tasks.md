# Implementation Tasks

1. [x] Script `scripts/generate-assets.mjs` (sharp): sprite a WebP e iconos PWA 192/512 + maskable.
2. [x] `vite-plugin-pwa` con manifest, `autoUpdate` y precache de todos los assets.
3. [x] Módulo `settings.ts`: tipo `Settings`, valores por defecto, carga/guardado tolerante a fallos en `localStorage` + tests.
4. [x] Menú de configuración por secciones con interruptores; aplicar tamaño de baraja (y jugadores) en la siguiente partida.
5. [x] Wake Lock: adquirir al cargar si está activo, re-adquirir en `visibilitychange`, liberar al desactivar.
6. [x] Deshacer de un nivel: instantánea antes de robar; botón en la mesa y en el aviso de beber.
7. [x] Estilos apaisados: tamaño de carta limitado también por la altura.
8. [x] Tests, build y verificación visual (vertical y apaisado).
