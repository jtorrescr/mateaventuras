(function () {
    const motor = MateAventuras.motor;
    const botonesTabla = document.querySelectorAll('.boton-tabla');
    const tablaSeleccionadaTexto = document.getElementById('tablaSeleccionadaTexto');

    let numeroOperacion1 = 0;
    let numeroOperacion2 = 0;
    let tablasSeleccionadas = [1];

    function actualizarVistaModoTablas() {
        tablaSeleccionadaTexto.textContent = 'Tablas seleccionadas: ' + tablasSeleccionadas.join(', ');

        motor.resaltarSeleccion(botonesTabla, function (boton) {
            return tablasSeleccionadas.includes(Number(boton.dataset.tabla));
        });
    }

    function crearRonda() {
        const multiplicador = motor.aleatorio(1, 10);
        const posicionTabla = motor.aleatorio(0, tablasSeleccionadas.length - 1);
        const tablaParaPracticar = tablasSeleccionadas[posicionTabla];
        const correcta = tablaParaPracticar * multiplicador;

        numeroOperacion1 = tablaParaPracticar;
        numeroOperacion2 = multiplicador;

        return {
            texto: tablaParaPracticar + ' × ' + multiplicador,
            respuesta: correcta,
            opciones: motor.opcionesNumericas(correcta, []),
            monedas: 1
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
                return { tablasSeleccionadas: tablasSeleccionadas };
            },
            predeterminada: function () {
                return { tablasSeleccionadas: [1] };
            },
            aplicar: function (configuracion) {
                tablasSeleccionadas = Array.isArray(configuracion.tablasSeleccionadas) && configuracion.tablasSeleccionadas.length > 0
                    ? configuracion.tablasSeleccionadas.slice().sort(function (a, b) { return a - b; })
                    : [1];

                actualizarVistaModoTablas();
            }
        },
        crearRonda: crearRonda
    });

    botonesTabla.forEach(function (boton) {
        boton.addEventListener('click', function () {
            const tabla = Number(boton.dataset.tabla);

            if (tablasSeleccionadas.includes(tabla)) {
                tablasSeleccionadas = tablasSeleccionadas.filter(function (item) {
                    return item !== tabla;
                });
            } else {
                tablasSeleccionadas.push(tabla);
                tablasSeleccionadas.sort(function (a, b) {
                    return a - b;
                });
            }

            if (tablasSeleccionadas.length === 0) {
                tablasSeleccionadas = [tabla];
            }

            actualizarVistaModoTablas();
            MateAventuras.uiJugadores.guardarEstado();
        });
    });

    actualizarVistaModoTablas();
    practica.iniciar();
})();
