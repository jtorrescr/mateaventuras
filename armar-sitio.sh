#!/bin/bash
# Arma en publicar/ exactamente los archivos que deben vivir en el servidor.
# Se copia solo lo que el navegador pide, así que todo lo demás (node_modules,
# package.json, tailwind.config.js, las fuentes entrada.css y mate.css, README.md
# y .git) nunca llega al servidor, porque nunca se copia aquí.
set -euo pipefail

cd "$(dirname "$0")"

echo "→ Regenerando el CSS"
npm run css --silent

echo "→ Armando publicar/"
rm -rf publicar
mkdir -p publicar/assets/css

cp index.html practicas.html publicar/
cp -R matematicas publicar/
cp -R assets/js publicar/assets/
cp assets/css/estilos.css publicar/assets/css/

# cp -R arrastra los .DS_Store que macOS deja dentro de las carpetas.
find publicar -name '.DS_Store' -delete

echo
echo "Listo: $(find publicar -type f | wc -l | tr -d ' ') archivos en"
echo "  $(pwd)/publicar"
echo "Sube el contenido de esa carpeta a la raíz del sitio."
