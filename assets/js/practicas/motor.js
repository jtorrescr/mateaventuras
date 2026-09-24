window.MateAventuras = window.MateAventuras || {};

// Motor común a todas las prácticas. Se queda con lo que no cambia entre
// operaciones (el ciclo de la ronda, el marcador, el popup de ayuda, el arranque)
// y deja a cada práctica solo lo suyo: qué operación generar, qué distractores
// ofrecer y qué dibujar en la ayuda.
MateAventuras.motor = (function () {
    const TOTAL_OPCIONES = 5;

    const IDS_PREDETERMINADOS = {
        mascota: 'mascota',
        operacion: 'operacion',
        opcionesRespuesta: 'opcionesRespuesta',
        tarjetaOperacion: 'tarjetaOperacion',
        btnNuevaOperacion: 'btnNuevaOperacion'
    };

    const IDS_AYUDA_PREDETERMINADOS = {
        boton: 'btnAyuda',
        popup: 'popupAyuda',
        subtitulo: 'subtituloAyuda',
        contenedor: 'contenedorAyuda',
        cerrar: 'btnCerrarAyuda'
    };

    function aleatorio(minimo, maximo) {
        return Math.floor(Math.random() * (maximo - minimo + 1)) + minimo;
    }

    function mezclar(arreglo) {
        const copia = arreglo.slice();

        for (let i = copia.length - 1; i > 0; i -= 1) {
            const j = Math.floor(Math.random() * (i + 1));
            const temporal = copia[i];
            copia[i] = copia[j];
            copia[j] = temporal;
        }

        return copia;
    }

    function digitos(numero) {
        return String(Math.abs(numero)).split('').map(function (caracter) {
            return Number(caracter);
        });
    }

    function numeroConCifras(cifras) {
        if (cifras === 1) {
            return aleatorio(2, 9);
        }

        const minimo = Math.pow(10, cifras - 1);
        return aleatorio(minimo, minimo * 10 - 1);
    }

    // Pinta como seleccionados los botones que cumplan la condición. Lo usan
    // tanto los selectores de nivel (uno activo) como el de tablas (varios).
    function resaltarSeleccion(botones, esSeleccionado) {
        botones.forEach(function (boton) {
            const seleccionado = esSeleccionado(boton);
            const numero = boton.querySelector('.nivel-numero');
            boton.setAttribute('aria-pressed', seleccionado ? 'true' : 'false');

            boton.classList.toggle('bg-gradient-to-r', seleccionado);
            boton.classList.toggle('from-fuchsia-500', seleccionado);
            boton.classList.toggle('to-cyan-500', seleccionado);
            boton.classList.toggle('text-white', seleccionado);
            boton.classList.toggle('border-fuchsia-500', seleccionado);
            boton.classList.toggle('shadow-md', seleccionado);

            boton.classList.toggle('bg-white/90', !seleccionado);
            boton.classList.toggle('text-cyan-800', !seleccionado);
            boton.classList.toggle('border-cyan-300', !seleccionado);

            if (numero) {
                numero.classList.toggle('bg-white/25', seleccionado);
                numero.classList.toggle('text-white', seleccionado);
                numero.classList.toggle('bg-cyan-100', !seleccionado);
                numero.classList.toggle('text-cyan-800', !seleccionado);
            }
        });
    }

    // Arma las cinco respuestas a elegir: primero los errores típicos que pasa
    // la práctica y, si no alcanzan, números cercanos al resultado correcto.
    function opcionesNumericas(correcta, candidatas, opciones) {
        const configuracion = opciones || {};
        const minimo = typeof configuracion.minimo === 'number' ? configuracion.minimo : 1;
        const paso = configuracion.paso || 1;
        // Qué tan lejos del resultado puede caer un relleno: en resultados chicos,
        // una opción muy lejana se descarta de un vistazo y no hace pensar.
        const dispersion = configuracion.dispersion || 10;
        const elegidas = new Set([correcta]);

        mezclar(candidatas).forEach(function (candidata) {
            if (elegidas.size < TOTAL_OPCIONES && candidata >= minimo && candidata !== correcta) {
                elegidas.add(candidata);
            }
        });

        let intentos = 0;
        while (elegidas.size < TOTAL_OPCIONES && intentos < 200) {
            intentos += 1;
            const variacion = aleatorio(-dispersion, dispersion) * paso;
            const candidata = correcta + variacion;

            if (variacion !== 0 && candidata >= minimo) {
                elegidas.add(candidata);
            }
        }

        return mezclar(Array.from(elegidas));
    }

    function crear(config) {
        const ids = Object.assign({}, IDS_PREDETERMINADOS, config.ids || {});
        const idsAyuda = Object.assign({}, IDS_AYUDA_PREDETERMINADOS, (config.ayuda && config.ayuda.ids) || {});

        const mascota = document.getElementById(ids.mascota);
        const operacion = document.getElementById(ids.operacion);
        const opcionesRespuesta = document.getElementById(ids.opcionesRespuesta);
        const tarjetaOperacion = document.getElementById(ids.tarjetaOperacion);
        const btnNuevaOperacion = document.getElementById(ids.btnNuevaOperacion);

        const btnAyuda = document.getElementById(idsAyuda.boton);
        const popupAyuda = document.getElementById(idsAyuda.popup);
        const subtituloAyuda = document.getElementById(idsAyuda.subtitulo);
        const contenedorAyuda = document.getElementById(idsAyuda.contenedor);
        const btnCerrarAyuda = document.getElementById(idsAyuda.cerrar);

        let respuestaCorrecta = null;
        let monedasRonda = 1;
        let usoAyuda = false;
        let huboError = false;

        // Cada opción viaja como { clave, texto }: la clave es lo que se compara
        // y el texto lo que se lee en el botón. Así una respuesta puede ser un
        // número suelto o algo compuesto, como "8 y sobran 3".
        function normalizarOpcion(opcion) {
            if (opcion !== null && typeof opcion === 'object') {
                return opcion;
            }

            return { clave: String(opcion), texto: String(opcion) };
        }

        function claseTamanoOpciones(opciones) {
            const largo = opciones.reduce(function (maximo, opcion) {
                return Math.max(maximo, opcion.texto.length);
            }, 0);

            if (largo > 9) {
                return 'text-base';
            }

            return largo > 4 ? 'text-xl' : 'text-2xl';
        }

        function renderizarOpciones(opciones) {
            opcionesRespuesta.innerHTML = '';

            const claseTamano = claseTamanoOpciones(opciones);

            opciones.forEach(function (opcion) {
                const boton = document.createElement('button');
                boton.type = 'button';
                boton.className = 'boton-opcion-respuesta rounded-xl border-2 border-slate-300 bg-white py-4 ' + claseTamano + ' font-black leading-tight text-slate-800 shadow-sm transition hover:scale-[1.03] hover:border-fuchsia-400 hover:bg-fuchsia-50';
                boton.dataset.valor = opcion.clave;
                boton.textContent = opcion.texto;
                boton.addEventListener('click', function () {
                    seleccionarOpcion(opcion, boton);
                });
                opcionesRespuesta.appendChild(boton);
            });
        }

        function nuevaOperacion() {
            if (!MateAventuras.jugadores.obtenerActual()) {
                return;
            }

            const ronda = config.crearRonda();

            if (!ronda) {
                return;
            }

            respuestaCorrecta = normalizarOpcion(ronda.respuesta);
            monedasRonda = ronda.monedas;

            MateAventuras.efectos.establecerTextoOperacion(operacion, ronda.texto);
            renderizarOpciones(ronda.opciones.map(normalizarOpcion));

            usoAyuda = false;
            huboError = false;
            MateAventuras.uiJugadores.mostrarMascota();
            tarjetaOperacion.classList.remove('brillar');
            operacion.classList.remove('operacion-incorrecta');
        }

        function terminarPartida() {
            MateAventuras.jugadores.registrarPartidaTerminada();
            MateAventuras.marcador.terminarPartida(MateAventuras.jugadores.obtenerNombre());
            mascota.textContent = '🥳';
            MateAventuras.sonidos.partidaTerminada();
            cerrarAyuda();
        }

        function seleccionarOpcion(opcion, boton) {
            if (opcion.clave === respuestaCorrecta.clave) {
                opcionesRespuesta.querySelectorAll('.boton-opcion-respuesta').forEach(function (otro) {
                    otro.disabled = true;
                });
                boton.classList.add('border-emerald-500', 'bg-emerald-100', 'text-emerald-700');

                const partidaCompleta = MateAventuras.marcador.registrarAcierto(usoAyuda || huboError, boton, monedasRonda);
                MateAventuras.uiJugadores.guardarEstado();
                MateAventuras.uiJugadores.renderizarLista();

                mascota.textContent = '🥳';
                mascota.classList.add('saltar');
                tarjetaOperacion.classList.add('brillar');
                MateAventuras.efectos.confeti(operacion);
                MateAventuras.sonidos.acierto();
                setTimeout(function () { mascota.classList.remove('saltar'); }, 500);

                if (partidaCompleta) {
                    setTimeout(terminarPartida, 900);
                } else {
                    setTimeout(nuevaOperacion, 900);
                }
            } else {
                boton.disabled = true;
                boton.classList.add('border-red-400', 'bg-red-100', 'text-red-600', 'opacity-60');
                huboError = true;
                MateAventuras.marcador.reiniciarRacha();
                MateAventuras.efectos.temblorError(operacion);
                MateAventuras.sonidos.error();
                mascota.textContent = '🤔';
            }
        }

        function ayudaAbierta() {
            return !popupAyuda.classList.contains('hidden');
        }

        function abrirAyuda() {
            usoAyuda = true;
            contenedorAyuda.innerHTML = '';
            subtituloAyuda.textContent = config.ayuda.construir(contenedorAyuda) || '';

            popupAyuda.classList.remove('hidden');
            popupAyuda.classList.add('flex');

            if (typeof config.ayuda.alAbrir === 'function') {
                config.ayuda.alAbrir(api);
            }
        }

        function cerrarAyuda() {
            popupAyuda.classList.add('hidden');
            popupAyuda.classList.remove('flex');

            if (typeof config.ayuda.alCerrar === 'function') {
                config.ayuda.alCerrar(api);
            }

            const primeraOpcion = opcionesRespuesta.querySelector('.boton-opcion-respuesta:not(:disabled)');
            if (primeraOpcion) {
                primeraOpcion.focus();
            }
        }

        function iniciarPractica() {
            MateAventuras.uiJugadores.guardarEstado();
            MateAventuras.marcador.reiniciarPartida();
            usoAyuda = false;
            huboError = false;
            nuevaOperacion();
        }

        function conectarEventos() {
            btnAyuda.addEventListener('click', abrirAyuda);
            btnCerrarAyuda.addEventListener('click', cerrarAyuda);
            popupAyuda.addEventListener('click', function (evento) {
                if (evento.target === popupAyuda) {
                    cerrarAyuda();
                }
            });

            btnNuevaOperacion.addEventListener('click', nuevaOperacion);
        }

        function iniciar() {
            conectarEventos();

            MateAventuras.marcador.iniciar({
                alSiguientePartida: function () {
                    usoAyuda = false;
                    huboError = false;
                    nuevaOperacion();
                }
            });

            MateAventuras.uiJugadores.iniciar({
                obtenerConfiguracion: config.configuracion.actual,
                obtenerConfiguracionPredeterminada: config.configuracion.predeterminada,
                aplicarConfiguracion: function (jugador) {
                    const guardada = MateAventuras.jugadores.obtenerConfiguracion(jugador, config.configuracion.predeterminada());
                    config.configuracion.aplicar(guardada);
                },
                alEmpezarPractica: iniciarPractica
            });

            MateAventuras.uiJugadores.inicializarJugador();
        }

        const api = {
            iniciar: iniciar,
            nuevaOperacion: nuevaOperacion,
            ayudaAbierta: ayudaAbierta,
            cerrarAyuda: cerrarAyuda
        };

        return api;
    }

    return {
        aleatorio: aleatorio,
        mezclar: mezclar,
        digitos: digitos,
        numeroConCifras: numeroConCifras,
        resaltarSeleccion: resaltarSeleccion,
        opcionesNumericas: opcionesNumericas,
        crear: crear
    };
})();
