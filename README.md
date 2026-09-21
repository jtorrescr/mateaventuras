# Mate Aventuras

Sitio estático de práctica de matemáticas para primaria. No necesita servidor ni
framework: cualquier página se abre directamente en el navegador.

## Estructura

```
index.html                 portada
practicas.html             índice de todas las prácticas
matematicas/operaciones-basicas/
    sumas.html …           páginas de teoría (una por operación)
    practica-*.html        páginas de práctica (solo marcado)
assets/
    css/entrada.css        fuente del CSS (Tailwind + mate.css)
    css/mate.css           animaciones propias
    css/estilos.css        CSS generado — no editar a mano
    js/*.js                módulos compartidos (jugadores, marcador, efectos…)
    js/practicas/*.js      lógica específica de cada práctica
```

## CSS

El CSS se genera con Tailwind CLI y se commitea, así que el sitio funciona sin
instalar nada. Solo hace falta regenerarlo cuando se agregan o cambian clases
de Tailwind en el HTML o en el JS:

```
npm install        # una vez
npm run css        # genera assets/css/estilos.css
npm run css:watch  # lo regenera al guardar, mientras desarrollas
```

Tailwind escanea `*.html` y `assets/js/**/*.js`. Las clases deben escribirse
completas (`'bg-amber-300'`), nunca construidas por partes (`'bg-' + color`),
o no se incluirán en el CSS.
