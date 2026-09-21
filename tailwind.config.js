/** @type {import('tailwindcss').Config} */
module.exports = {
    // El JS también se escanea: muchas clases (botones seleccionados, puntos de
    // progreso, personaje elegido) solo aparecen ahí. Deben escribirse completas,
    // nunca construidas por partes ('bg-' + color), o no se generarán.
    content: [
        './*.html',
        './matematicas/**/*.html',
        './assets/js/**/*.js'
    ],
    theme: {
        extend: {}
    },
    plugins: []
};
