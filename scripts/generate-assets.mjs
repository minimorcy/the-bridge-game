// Genera el sprite WebP y los iconos PWA a partir de assets-src/baraja-espanola.png.
// Uso: npm run assets
import sharp from 'sharp';

const SRC = 'assets-src/baraja-espanola.png';
const CARD = { width: 208, height: 319 }; // celda del sprite (12×5)
const FELT = '#0f5a3f';

await sharp(SRC).webp({ quality: 82 }).toFile('src/assets/baraja-espanola.webp');

// As de oros como icono
const ace = await sharp(SRC).extract({ left: 0, top: 0, ...CARD }).png().toBuffer();

async function icon(size, file, cardScale) {
  const h = Math.round(size * cardScale);
  const card = await sharp(ace).resize({ height: h }).png().toBuffer();
  await sharp({ create: { width: size, height: size, channels: 4, background: FELT } })
    .composite([{ input: card, gravity: 'center' }])
    .png()
    .toFile(`public/icons/${file}`);
}

await icon(192, 'icon-192.png', 0.86);
await icon(512, 'icon-512.png', 0.86);
await icon(512, 'maskable-512.png', 0.66);
await icon(180, 'apple-touch-icon.png', 0.86);
console.log('Assets generados');
