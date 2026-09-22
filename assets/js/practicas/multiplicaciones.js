(function () {
    const mascota = document.getElementById('mascota');
    const botonesNivel = document.querySelectorAll('.boton-nivel');
    const nivelSeleccionadoTexto = document.getElementById('nivelSeleccionadoTexto');
    const operacion = document.getElementById('operacion');
    const opcionesRespuesta = document.getElementById('opcionesRespuesta');
    const tarjetaOperacion = document.getElementById('tarjetaOperacion');
    const btnNuevaOperacion = document.getElementById('btnNuevaOperacion');
    const btnAyudaTablas = document.getElementById('btnAyudaTablas');
    const popupAyudaTablas = document.getElementById('popupAyudaTablas');
    const subtituloAyudaTablas = document.getElementById('subtituloAyudaTablas');
    const contenedorTablasAyuda = document.getElementById('contenedorTablasAyuda');
    const btnCerrarAyudaTablas = document.getElementById('btnCerrarAyudaTablas');

    let respuestaCorrecta = 0;
    let usoAyuda = false;
    let huboError = false;
    let numeroOperacion1 = 0;
    let numeroOperacion2 = 0;
    let timeoutParpadeoAyudaTablas = null;
    let nivelSeleccionado = 1;

    const NIVELES_MULTIPLICACION = {
        1: { cifras: [1, 1], descripcion: '1 cifra × 1 cifra' },
        2: { cifras: [1, 2], descripcion: '1 cifra × 2 cifras' },
        3: { cifras: [2, 2], descripcion: '2 cifras × 2 cifras' },
        4: { cifras: [2, 3], descripcion: '2 cifras × 3 cifras' },
        5: { cifras: [3, 3], descripcion: '3 cifras × 3 cifras' }
    };

    function obtenerConfiguracionActual() {
        return {
            nivelMultiplicacion: nivelSeleccionado
        };
    }

    function obtenerConfiguracionPredeterminada() {
        return {
            nivelMultiplicacion: 1
        };
    }

    function aplicarConfiguracionJugador(jugador) {
        const configuracion = MateAventuras.jugadores.obtenerConfiguracion(jugador, obtenerConfiguracionPredeterminada());

        const nivel = Number(configuracion.nivelMultiplicacion);
        nivelSeleccionado = NIVELES_MULTIPLICACION[nivel] ? nivel : 1;

        actualizarVistaNivel();
    }

    function actualizarVistaNivel() {
        const nivel = NIVELES_MULTIPLICACION[nivelSeleccionado];
        nivelSeleccionadoTexto.textContent = 'Nivel ' + nivelSeleccionado + ': ' + nivel.descripcion;

        botonesNivel.forEach(function (boton) {
            const esSeleccionado = Number(boton.dataset.nivel) === nivelSeleccionado;
            const numero = boton.querySelector('.nivel-numero');
            boton.setAttribute('aria-pressed', esSeleccionado ? 'true' : 'false');

            boton.classList.toggle('bg-gradient-to-r', esSeleccionado);
            boton.classList.toggle('from-fuchsia-500', esSeleccionado);
            boton.classList.toggle('to-cyan-500', esSeleccionado);
            boton.classList.toggle('text-white', esSeleccionado);
            boton.classList.toggle('border-fuchsia-500', esSeleccionado);
            boton.classList.toggle('shadow-md', esSeleccionado);

            boton.classList.toggle('bg-white/90', !esSeleccionado);
            boton.classList.toggle('text-cyan-800', !esSeleccionado);
            boton.classList.toggle('border-cyan-300', !esSeleccionado);

            numero.classList.toggle('bg-white/25', esSeleccionado);
            numero.classList.toggle('text-white', esSeleccionado);
            numero.classList.toggle('bg-cyan-100', !esSeleccionado);
            numero.classList.toggle('text-cyan-800', !esSeleccionado);
        });
    }

    function obtenerDigitosUnicos(numero) {
        const digitos = String(Math.abs(numero)).split('').map(function (digito) {
            return Number(digito);
        });

        const unicos = [];
        digitos.forEach(function (digito) {
            if (digito !== 0 && !unicos.includes(digito)) {
                unicos.push(digito);
            }
        });

        if (unicos.length === 0) {
            unicos.push(0);
        }

        return unicos;
    }

    function obtenerTablasParaAyuda() {
        const base = Math.min(numeroOperacion1, numeroOperacion2);
        if (base >= 10) {
            return obtenerDigitosUnicos(base);
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

    function resaltarFilaBuscadaAyuda() {
        const tabla = Math.min(numeroOperacion1, numeroOperacion2);
        const multiplicador = Math.max(numeroOperacion1, numeroOperacion2);

        const fila = contenedorTablasAyuda.querySelector(
            '[data-tabla="' + tabla + '"] [data-multiplicador="' + multiplicador + '"]'
        );

        if (!fila) {
            return;
        }

        fila.scrollIntoView({ behavior: 'smooth', block: 'center' });
        fila.classList.add('fila-parpadeo');
    }

    function abrirPopupAyudaTablas() {
        usoAyuda = true;

        const tablas = obtenerTablasParaAyuda();
        contenedorTablasAyuda.innerHTML = '';

        tablas.forEach(function (tabla) {
            contenedorTablasAyuda.appendChild(crearTablaTradicional(tabla));
        });

        if (tablas.length === 1) {
            subtituloAyudaTablas.textContent = 'Te mostramos la tabla clave para resolver esta operación.';
        } else {
            subtituloAyudaTablas.textContent = 'La operación usa varios dígitos. Aquí tienes las tablas que te ayudan.';
        }

        popupAyudaTablas.classList.remove('hidden');
        popupAyudaTablas.classList.add('flex');

        if (timeoutParpadeoAyudaTablas !== null) {
            clearTimeout(timeoutParpadeoAyudaTablas);
        }

        timeoutParpadeoAyudaTablas = setTimeout(function () {
            timeoutParpadeoAyudaTablas = null;

            if (!popupAyudaTablas.classList.contains('hidden')) {
                resaltarFilaBuscadaAyuda();
            }
        }, 7000);
    }

    function cerrarPopupAyudaTablas() {
        popupAyudaTablas.classList.add('hidden');
        popupAyudaTablas.classList.remove('flex');

        if (timeoutParpadeoAyudaTablas !== null) {
            clearTimeout(timeoutParpadeoAyudaTablas);
            timeoutParpadeoAyudaTablas = null;
        }

        const primeraOpcion = opcionesRespuesta.querySelector('.boton-opcion-respuesta:not(:disabled)');
        if (primeraOpcion) {
            primeraOpcion.focus();
        }
    }

    function terminarPartida() {
        MateAventuras.jugadores.registrarPartidaTerminada();
        MateAventuras.marcador.terminarPartida(MateAventuras.jugadores.obtenerNombre());
        mascota.textContent = '🥳';
        MateAventuras.sonidos.partidaTerminada();
        cerrarPopupAyudaTablas();
    }

    function iniciarPractica() {
        MateAventuras.uiJugadores.guardarEstado();
        MateAventuras.marcador.reiniciarPartida();
        usoAyuda = false;
        huboError = false;
        generarOperacion();
    }

    function obtenerNumeroAleatorio(minimo, maximo) {
        return Math.floor(Math.random() * (maximo - minimo + 1)) + minimo;
    }

    function mezclarArreglo(arreglo) {
        const copia = arreglo.slice();

        for (let i = copia.length - 1; i > 0; i -= 1) {
            const j = Math.floor(Math.random() * (i + 1));
            const temporal = copia[i];
            copia[i] = copia[j];
            copia[j] = temporal;
        }

        return copia;
    }

    function obtenerNumeroConCifras(cifras) {
        if (cifras === 1) {
            return obtenerNumeroAleatorio(2, 9);
        }

        const minimo = Math.pow(10, cifras - 1);
        return obtenerNumeroAleatorio(minimo, minimo * 10 - 1);
    }

    function generarOpcionesRespuesta(correcta) {
        const a = numeroOperacion1;
        const b = numeroOperacion2;
        const magnitud = Math.pow(10, Math.max(0, String(correcta).length - 2));

        // Errores típicos: fallar una fila de la tabla, olvidar una llevada
        // o desplazar mal un producto parcial.
        const candidatas = [
            a * (b + 1), a * (b - 1), (a + 1) * b, (a - 1) * b,
            correcta + 10, correcta - 10,
            correcta + magnitud, correcta - magnitud
        ];
        if (b >= 10) {
            candidatas.push(a * (b + 10), a * (b - 10));
        }
        if (a >= 10) {
            candidatas.push((a + 10) * b, (a - 10) * b);
        }

        const opciones = new Set([correcta]);
        mezclarArreglo(candidatas).forEach(function (candidata) {
            if (opciones.size < 5 && candidata >= 1 && candidata !== correcta) {
                opciones.add(candidata);
            }
        });

        let intentos = 0;
        while (opciones.size < 5 && intentos < 200) {
            intentos += 1;
            const variacion = obtenerNumeroAleatorio(-10, 10) * magnitud;
            const candidata = correcta + variacion;

            if (variacion !== 0 && candidata >= 1) {
                opciones.add(candidata);
            }
        }

        return mezclarArreglo(Array.from(opciones));
    }

    function renderizarOpcionesRespuesta(correcta) {
        opcionesRespuesta.innerHTML = '';

        const opciones = generarOpcionesRespuesta(correcta);
        const claseTamano = opciones.some(function (valor) { return String(valor).length > 4; }) ? 'text-xl' : 'text-2xl';

        opciones.forEach(function (valor) {
            const boton = document.createElement('button');
            boton.type = 'button';
            boton.className = 'boton-opcion-respuesta rounded-xl border-2 border-slate-300 bg-white py-4 ' + claseTamano + ' font-black text-slate-800 shadow-sm transition hover:scale-[1.03] hover:border-fuchsia-400 hover:bg-fuchsia-50';
            boton.dataset.valor = String(valor);
            boton.textContent = String(valor);
            boton.addEventListener('click', function () {
                seleccionarOpcionRespuesta(valor, boton);
            });
            opcionesRespuesta.appendChild(boton);
        });
    }

    function generarOperacion() {
        if (!MateAventuras.jugadores.obtenerActual()) {
            return;
        }

        const nivel = NIVELES_MULTIPLICACION[nivelSeleccionado];
        const factor1 = obtenerNumeroConCifras(nivel.cifras[0]);
        const factor2 = obtenerNumeroConCifras(nivel.cifras[1]);

        respuestaCorrecta = factor1 * factor2;
        numeroOperacion1 = factor1;
        numeroOperacion2 = factor2;
        MateAventuras.efectos.establecerTextoOperacion(operacion, factor1 + ' × ' + factor2);
        renderizarOpcionesRespuesta(respuestaCorrecta);
        usoAyuda = false;
        huboError = false;
        MateAventuras.uiJugadores.mostrarMascota();
        tarjetaOperacion.classList.remove('brillar');
        operacion.classList.remove('operacion-incorrecta');
    }

    function seleccionarOpcionRespuesta(valor, boton) {
        if (valor === respuestaCorrecta) {
            opcionesRespuesta.querySelectorAll('.boton-opcion-respuesta').forEach(function (b) {
                b.disabled = true;
            });
            boton.classList.add('border-emerald-500', 'bg-emerald-100', 'text-emerald-700');

            const partidaCompleta = MateAventuras.marcador.registrarAcierto(usoAyuda || huboError, boton, nivelSeleccionado);
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
                setTimeout(generarOperacion, 900);
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

    botonesNivel.forEach(function (boton) {
        boton.addEventListener('click', function () {
            const nivel = Number(boton.dataset.nivel);

            if (!NIVELES_MULTIPLICACION[nivel] || nivel === nivelSeleccionado) {
                return;
            }

            nivelSeleccionado = nivel;
            actualizarVistaNivel();
            MateAventuras.uiJugadores.guardarEstado();
            generarOperacion();
        });
    });

    btnAyudaTablas.addEventListener('click', abrirPopupAyudaTablas);
    btnCerrarAyudaTablas.addEventListener('click', cerrarPopupAyudaTablas);
    popupAyudaTablas.addEventListener('click', function (evento) {
        if (evento.target === popupAyudaTablas) {
            cerrarPopupAyudaTablas();
        }
    });

    btnNuevaOperacion.addEventListener('click', generarOperacion);

    function inicializar() {
        MateAventuras.marcador.iniciar({
            alSiguientePartida: function () {
                usoAyuda = false;
                huboError = false;
                generarOperacion();
            }
        });

        MateAventuras.uiJugadores.iniciar({
            obtenerConfiguracion: obtenerConfiguracionActual,
            obtenerConfiguracionPredeterminada: obtenerConfiguracionPredeterminada,
            aplicarConfiguracion: aplicarConfiguracionJugador,
            alEmpezarPractica: iniciarPractica
        });

        actualizarVistaNivel();
        MateAventuras.uiJugadores.inicializarJugador();
    }

    inicializar();
})();
