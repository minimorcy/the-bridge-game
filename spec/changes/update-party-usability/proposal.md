# Proposal: Usabilidad en fiesta (offline, pantalla encendida, deshacer, apaisado, configuración)

## Why

La app se usa con un solo móvil que pasa de mano en mano, en bares con mala cobertura y con jugadores con unas copas.

**Current state**: Necesita red para cargar (sprite de 1,2 MB), la pantalla se bloquea, un toque accidental no se puede deshacer, en vertical las cartas son pequeñas y el menú de opciones solo tiene el tamaño de baraja.

**Desired state**: App instalable que funciona offline, mantiene la pantalla encendida, permite deshacer el último toque, aprovecha el modo apaisado y centraliza todas las opciones en un menú de configuración persistente.

## What Changes

- **PWA**: manifest, iconos y service worker (vite-plugin-pwa) que precachea todos los recursos; instalable y offline tras la primera carga.
- **Sprite optimizado** a WebP (generado con sharp) para reducir peso.
- **Pantalla siempre encendida** (Screen Wake Lock API), configurable, activado por defecto.
- **Deshacer** el último robo (un nivel), configurable, activado por defecto.
- **Modo apaisado** con cartas más grandes.
- **Menú de configuración** con secciones (Partida / Mesa / Reglas extra) persistido en `localStorage`; sustituye al menú de opciones actual.

## Impact

### Affected Specifications
- `spec/specs/bridge-game/spec.md` - MODIFIED "Nueva partida y opciones" y "Aplicación estática sin red"; ADDED deshacer, pantalla encendida, apaisado.

### Affected Code
- `src/settings.ts` (nuevo), `src/main.ts`, `src/style.css`, `vite.config.ts`, `scripts/generate-assets.mjs`.

### User Impact
- Funciona sin cobertura; menos frustración por toques accidentales.

## Decisiones / supuestos

- El deshacer revierte el último robo completo (carta, posición, tragos); solo un nivel y no disponible tras terminar la partida.
- Wake Lock solo funciona en navegadores compatibles; si no, se ignora en silencio.

## Timeline Estimate

Pequeño.

## Risks

- Caché del service worker sirviendo versiones antiguas → `registerType: autoUpdate`.
