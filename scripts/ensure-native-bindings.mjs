// El package-lock.json se genera en Windows y npm no guarda en él el campo "libc"
// de los binarios nativos opcionales (npm/cli#4828). En Linux eso puede dejar sin
// instalar el binario de Rolldown (bundler de Vite) para esta plataforma.
// Este script lo comprueba tras `npm ci` y, si falta, instala la versión exacta.
import { execSync } from 'node:child_process';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

if (process.platform === 'linux') {
  const arch = { x64: 'x64', arm64: 'arm64' }[process.arch];
  const libc = process.report.getReport().header.glibcVersionRuntime ? 'gnu' : 'musl';
  const binding = `@rolldown/binding-linux-${arch}-${libc}`;
  try {
    require.resolve(binding);
    console.log(`${binding}: ok`);
  } catch {
    const { version } = require('rolldown/package.json');
    console.log(`${binding}: no instalado, instalando ${version}…`);
    execSync(`npm install --no-save --no-audit --no-fund ${binding}@${version}`, { stdio: 'inherit' });
  }
}
