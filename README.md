# 🌉 El Puente

Juego de cartas con baraja española para jugar con amigos sin llevar baraja encima. Web estática e instalable (PWA): funciona sin conexión, sin backend ni llamadas de red.

## Reglas

- Se reparten 4 cartas boca arriba y una boca abajo en horizontal entre la 2ª y la 3ª: **el puente** (es una carta real que sale de la baraja).
- Elige tu apuesta y la nueva carta sale encima de la carta resaltada (si desactivas *Sacar al elegir* en ⚙️, hay que tocar la carta después).
  - **Posiciones 1 y 2**: mayor, menor o igual. Si sale igual y dijiste mayor/menor, fallas.
  - **Posición 3**: par o impar (Sota=10, Caballo=11, Rey=12).
  - **Posición 4**: palo (oros, copas, espadas, bastos).
- Si aciertas, avanzas una posición; si fallas, retrocedes una (en la 1 te quedas).
- **Tragos** 🍺: 1 por cada fallo y 1 por cada vez que cruzas el puente (en cualquier sentido). Fallar en la 3 = 2 tragos.
- Si aciertas en la 4, cruzas el puente.
- Si se acaba la baraja, puedes continuar con las 4 cartas de la mesa (se rebaraja el resto) o empezar de nuevo.

### Varios jugadores

Añade los nombres en ⚙️ (hasta 12). Cada jugador juega hasta cruzar las 4 cartas y luego le toca al siguiente con las cartas que hay en la mesa. Arriba se ve el marcador de tragos de todos. Cuando todos han cruzado sale la clasificación: 🏆 **Campeón** (menos tragos) y 🧽 **Esponja de la noche** (más tragos).

Se guarda el **récord** del dispositivo (menos tragos en un turno) y el resultado se puede **compartir** (menú de compartir del móvil o WhatsApp).

### Configuración (⚙️)

| Sección | Opción | Por defecto |
|---|---|---|
| Partida | Baraja de 40 o 48 cartas | 40 |
| Partida | Jugadores (sin jugadores = solitario) | — |
| Mesa | Orientación: horizontal (pide girar el móvil) o vertical | Horizontal |
| Mesa | Sacar al elegir: la carta sale al pulsar la apuesta, sin tocarla | ✅ |
| Mesa | Sonido | ✅ |
| Mesa | Vibración (no disponible en iPhone) | ✅ |
| Mesa | Suspense: la carta se voltea con redoble | ✅ |
| Mesa | Pantalla siempre encendida | ✅ |
| Reglas extra | *Igual reparte*: acertar "igual" te deja repartir 2 tragos | ❌ |
| Reglas extra | *As o Rey, doble*: fallar con un As o un Rey cuenta 2 tragos (+1 si además cruzas el puente) | ❌ |
| Reglas extra | *Puente limpio*: cruzar sin fallar ni una hace beber 1 a todos los demás | ❌ |

La configuración se guarda en el navegador. Baraja y jugadores se aplican en la siguiente partida; el resto, al momento.

### Jugar en horizontal

Por defecto se juega con el móvil girado: las 4 cartas y el puente se ven más grandes. Si abres la app en vertical, te pide girar el móvil. En Android puedes pulsar *Pantalla completa en horizontal*. En iPhone no se puede bloquear la orientación, así que hay que girarlo a mano (con el bloqueo de rotación del sistema desactivado). Si prefieres jugar en vertical, pulsa *Jugar en vertical* o cámbialo en ⚙️.

### Instalar en el móvil

Abre la web una vez y usa **"Añadir a pantalla de inicio"**. A partir de ahí se abre a pantalla completa y funciona sin cobertura. Las actualizaciones se descargan solas y se aplican al volver a abrirla.

## Desarrollo

Requisitos: Node.js 22+.

```bash
npm install
npm run dev     # servidor local
npm test        # tests de la lógica (Vitest)
npm run build   # comprobación de tipos + build estático en dist/ (incluye service worker)
npm run preview # sirve dist/ en local
npm run assets  # regenera sprite WebP e iconos desde assets-src/ (sharp)
```

Stack: Vite + TypeScript (sin framework), Vitest, vite-plugin-pwa (Workbox), Web Audio para los sonidos.

Estructura:

- `src/game/` – lógica pura y testeada: baraja, reglas, partida, sesión multijugador y récord.
- `src/settings.ts` – configuración persistida en `localStorage`.
- `src/ui/` – cartas (sprite `src/assets/baraja-espanola.webp`), efectos de sonido/vibración, wake lock, bloqueo de orientación y Umami.
- `src/main.ts` – renderizado y eventos.
- `assets-src/` – imagen original de la baraja; `public/icons/` – iconos generados.
- `scripts/generate-assets.mjs` – genera el sprite WebP y los iconos.

### Especificación (SDD)

El proyecto sigue desarrollo guiado por especificación (OpenSpec):

- `spec/specs/bridge-game/spec.md` – especificación vigente.
- `spec/changes/<id>/` – cambios propuestos (propuesta, tareas y delta de spec).
- `spec/changes/archive/` – cambios ya aplicados.

## Despliegue en Coolify

El `Dockerfile` (multi-stage) instala dependencias, **ejecuta los tests**, construye la app y la sirve con nginx en el puerto 80 (`nginx.conf`: caché inmutable para `/assets/`, `no-cache` para el resto y fallback a `index.html`).

1. Sube el código al repositorio (incluido `package-lock.json`).
2. En Coolify: **+ New → Public Repository** (o *Private Repository (with GitHub App)*), rama `main`.
3. Configuración del recurso:

   | Campo | Valor |
   |---|---|
   | Build Pack | `Dockerfile` |
   | Base Directory | `/` |
   | Dockerfile Location | `/Dockerfile` |
   | Ports Exposes | `80` |
   | Domains | `https://puente.tudominio.com` |
   | Variables de entorno | ninguna |

4. *(Opcional)* Estadísticas con [Umami](https://umami.is): en **Environment Variables** añade estas variables marcando **Build Variable** (se incrustan al construir; cambiarlas requiere *Redeploy*):

   | Variable | Ejemplo |
   |---|---|
   | `VITE_UMAMI_SCRIPT_URL` | `https://umami.tudominio.com/script.js` |
   | `VITE_UMAMI_WEBSITE_ID` | el *Website ID* del sitio en Umami |
   | `VITE_UMAMI_DOMAINS` | `puente.tudominio.com` (opcional: no cuenta visitas de otros dominios) |

   Si faltan, no se carga Umami. Para probar en local, copia `.env.example` a `.env.local`.
5. En el DNS, crea un registro **A** del dominio apuntando a la IP del VPS. Coolify genera el certificado con Let's Encrypt.
6. **Deploy**. Opcional: activa *Auto Deploy* para desplegar con cada push y el healthcheck en `/` puerto `80`.

> **HTTPS es obligatorio**: sin él no funcionan el modo offline, la instalación ni la pantalla siempre encendida.

Problemas habituales:

- *502 Bad Gateway*: revisa que *Ports Exposes* sea `80`.
- *Falla `npm ci`*: falta `package-lock.json` en el repositorio.
- *`npm error network ECONNRESET`*: corte de red puntual al descargar de npm; el build ya reintenta, pero si persiste basta con **Redeploy**.
- *Se sigue viendo la versión anterior*: cierra y vuelve a abrir la app; el service worker se actualiza en la siguiente apertura.

Para probar la imagen en local:

```bash
docker build -t el-puente .
docker run --rm -p 8080:80 el-puente   # http://localhost:8080
```

## Créditos

Ilustraciones de las cartas: [Baraja española completa](https://commons.wikimedia.org/wiki/File:Baraja_espa%C3%B1ola_completa.png), de Basquetteur (a partir del trabajo de Germarquezm y otros), Wikimedia Commons, licencia [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/deed.es). El sprite se convierte a WebP y el as de oros se usa en los iconos de la app; la atribución aparece también al final del menú ⚙️ de la app.
