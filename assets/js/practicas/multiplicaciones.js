(function () {
    const motor = MateAventuras.motor;
    const botonesNivel = document.querySelectorAll('.boton-nivel');
    const nivelSeleccionadoTexto = document.getElementById('nivelSeleccionadoTexto');

    let numeroOperacion1 = 0;
    let numeroOperacion2 = 0;
    let nivelSeleccionado = 1;

    const NIVELES_MULTIPLICACION = {
        1: { cifras: [1, 1], descripcion: '1 cifra × 1 cifra' },
        2: { cifras: [1, 2], descripcion: '1 cifra × 2 cifras' },
        3: { cifras: [2, 2], descripcion: '2 cifras × 2 cifras' },
        4: { cifras: [2, 3], descripcion: '2 cifras × 3 cifras' },
        5: { cifras: [3, 3], descripcion: '3 cifras × 3 cifras' }
    };

    function actualizarVistaNivel() {
        nivelSeleccionadoTexto.textContent = 'Nivel ' + nivelSeleccionado + ': ' + NIVELES_MULTIPLICACION[nivelSeleccionado].descripcion;

        motor.resaltarSeleccion(botonesNivel, function (boton) {
            return Number(boton.dataset.nivel) === nivelSeleccionado;
        });
    }

    function crearRonda() {
        const nivel = NIVELES_MULTIPLICACION[nivelSeleccionado];
        const factor1 = motor.numeroConCifras(nivel.cifras[0]);
        const factor2 = motor.numeroConCifras(nivel.cifras[1]);
        const correcta = factor1 * factor2;
        const magnitud = Math.pow(10, Math.max(0, String(correcta).length - 2));

        numeroOperacion1 = factor1;
        numeroOperacion2 = factor2;

        // Errores típicos: fallar una fila de la tabla, olvidar una llevada
        // o desplazar mal un producto parcial.
        const candidatas = [
            factor1 * (factor2 + 1), factor1 * (factor2 - 1),
            (factor1 + 1) * factor2, (factor1 - 1) * factor2,
            correcta + 10, correcta - 10,
            correcta + magnitud, correcta - magnitud
        ];
        if (factor2 >= 10) {
            candidatas.push(factor1 * (factor2 + 10), factor1 * (factor2 - 10));
        }
        if (factor1 >= 10) {
            candidatas.push((factor1 + 10) * factor2, (factor1 - 10) * factor2);
        }

        return {
            texto: factor1 + ' × ' + factor2,
            respuesta: correcta,
            opciones: motor.opcionesNumericas(correcta, candidatas, { paso: magnitud }),
            monedas: nivelSeleccionado
        };
    }

    const ayuda = MateAventuras.ayudaTablas.crear(function () {
        return [numeroOperacion1, numeroOperacion2];
    });

    const practica = motor.crear({
        ayuda: {
            ids: {
                boton: 'btnAyudaTablas',
                popup: 'popupAyudaTablas',
                subtitulo: 'subtituloAyudaTablas',
                contenedor: 'contenedorTablasAyuda',
                cerrar: 'btnCerrarAyudaTablas'
            },
            construir: ayuda.construir,
            alAbrir: ayuda.alAbrir,
            alCerrar: ayuda.alCerrar
        },
        configuracion: {
            actual: function () {
                return { nivelMultiplicacion: nivelSeleccionado };
            },
            predeterminada: function () {
                return { nivelMultiplicacion: 1 };
            },
            aplicar: function (configuracion) {
                const nivel = Number(configuracion.nivelMultiplicacion);
                nivelSeleccionado = NIVELES_MULTIPLICACION[nivel] ? nivel : 1;
                actualizarVistaNivel();
            }
        },
        crearRonda: crearRonda
    });

    botonesNivel.forEach(function (boton) {
        boton.addEventListener('click', function () {
            const nivel = Number(boton.dataset.nivel);

            if (!NIVELES_MULTIPLICACION[nivel] || nivel === nivelSeleccionado) {
                return;
            }

            nivelSeleccionado = nivel;
            actualizarVistaNivel();
            MateAventuras.uiJugadores.guardarEstado();
            practica.nuevaOperacion();
        });
    });

    actualizarVistaNivel();
    practica.iniciar();
})();
