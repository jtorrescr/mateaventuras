window.MateAventuras = window.MateAventuras || {};

// Ayuda compartida por las prácticas que se apoyan en las tablas de multiplicar.
// Muestra la tabla (o tablas) que resuelven la operación y, si el niño sigue
// atorado unos segundos, le señala la fila exacta que está buscando.
MateAventuras.ayudaTablas = (function () {
    const RETRASO_RESALTADO = 7000;

    function digitosUnicos(numero) {
        const unicos = [];

        MateAventuras.motor.digitos(numero).forEach(function (digito) {
            if (digito !== 0 && !unicos.includes(digito)) {
                unicos.push(digito);
            }
        });

        if (unicos.length === 0) {
            unicos.push(0);
        }

        return unicos;
    }

    function tablasParaAyuda(a, b) {
        const base = Math.min(a, b);

        if (base >= 10) {
            return digitosUnicos(base);
        }

        return [base];
    }

    function crearTablaTradicional(tabla) {
        const contenedor = document.createElement('div');
        contenedor.className = 'rounded-3xl border border-cyan-100 bg-gradient-to-br from-cyan-50 to-sky-100 p-4';
        contenedor.dataset.tabla = String(tabla);

        const titulo = document.createElement('p');
        titulo.className = 'mb-3 text-center text-xl font-black text-cyan-700';
        titulo.textContent = 'Tabla del ' + tabla;

        const lista = document.createElement('div');
        lista.className = 'grid grid-cols-5 gap-1';

        for (let i = 1; i <= 10; i += 1) {
            const fila = document.createElement('div');
            fila.className = 'rounded-lg border border-cyan-100 bg-white/90 px-1 py-1 text-center';
            fila.dataset.multiplicador = String(i);

            const expresion = document.createElement('p');
            expresion.className = 'text-sm font-bold text-slate-500';
            expresion.textContent = tabla + ' × ' + i;

            const resultado = document.createElement('p');
            resultado.className = 'text-xl font-black text-cyan-700';
            resultado.textContent = String(tabla * i);

            fila.appendChild(expresion);
            fila.appendChild(resultado);
            lista.appendChild(fila);
        }

        contenedor.appendChild(titulo);
        contenedor.appendChild(lista);
        return contenedor;
    }

    // obtenerNumeros devuelve los dos factores de la operación que está en pantalla.
    function crear(obtenerNumeros) {
        let contenedorActual = null;
        let timeoutParpadeo = null;

        function resaltarFilaBuscada() {
            const numeros = obtenerNumeros();
            const tabla = Math.min(numeros[0], numeros[1]);
            const multiplicador = Math.max(numeros[0], numeros[1]);

            const fila = contenedorActual.querySelector(
                '[data-tabla="' + tabla + '"] [data-multiplicador="' + multiplicador + '"]'
            );

            if (!fila) {
                return;
            }

            fila.scrollIntoView({ behavior: 'smooth', block: 'center' });
            fila.classList.add('fila-parpadeo');
        }

        function cancelarParpadeo() {
            if (timeoutParpadeo !== null) {
                clearTimeout(timeoutParpadeo);
                timeoutParpadeo = null;
            }
        }

        return {
            construir: function (contenedor) {
                const numeros = obtenerNumeros();
                const tablas = tablasParaAyuda(numeros[0], numeros[1]);

                contenedorActual = contenedor;
                tablas.forEach(function (tabla) {
                    contenedor.appendChild(crearTablaTradicional(tabla));
                });

                if (tablas.length === 1) {
                    return 'Te mostramos la tabla clave para resolver esta operación.';
                }

                return 'La operación usa varios dígitos. Aquí tienes las tablas que te ayudan.';
            },
            alAbrir: function (practica) {
                cancelarParpadeo();

                timeoutParpadeo = setTimeout(function () {
                    timeoutParpadeo = null;

                    if (practica.ayudaAbierta()) {
                        resaltarFilaBuscada();
                    }
                }, RETRASO_RESALTADO);
            },
            alCerrar: cancelarParpadeo
        };
    }

    return {
        crear: crear
    };
})();
