(function () {
    const mascota = document.getElementById('mascota');
    const botonesTabla = document.querySelectorAll('.boton-tabla');
    const tablaSeleccionadaTexto = document.getElementById('tablaSeleccionadaTexto');
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
    let tablasSeleccionadas = [1];

    function obtenerConfiguracionActual() {
        return {
            tablasSeleccionadas: tablasSeleccionadas
        };
    }

    function obtenerConfiguracionPredeterminada() {
        return {
            tablasSeleccionadas: [1]
        };
    }

    function aplicarConfiguracionJugador(jugador) {
        const configuracion = MateAventuras.jugadores.obtenerConfiguracion(jugador, obtenerConfiguracionPredeterminada());

        tablasSeleccionadas = Array.isArray(configuracion.tablasSeleccionadas) && configuracion.tablasSeleccionadas.length > 0
            ? configuracion.tablasSeleccionadas.slice().sort(function (a, b) { return a - b; })
            : [1];

        actualizarVistaModoTablas();
    }

    function actualizarVistaModoTablas() {
        tablaSeleccionadaTexto.textContent = 'Tablas seleccionadas: ' + tablasSeleccionadas.join(', ');

        botonesTabla.forEach(function (boton) {
            const esSeleccionada = tablasSeleccionadas.includes(Number(boton.dataset.tabla));
            boton.classList.toggle('bg-gradient-to-r', esSeleccionada);
            boton.classList.toggle('from-fuchsia-500', esSeleccionada);
            boton.classList.toggle('to-cyan-500', esSeleccionada);
            boton.classList.toggle('text-white', esSeleccionada);
            boton.classList.toggle('border-fuchsia-500', esSeleccionada);
            boton.classList.toggle('shadow-md', esSeleccionada);

            boton.classList.toggle('bg-white/90', !esSeleccionada);
            boton.classList.toggle('text-cyan-800', !esSeleccionada);
            boton.classList.toggle('border-cyan-300', !esSeleccionada);
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

    function generarOpcionesRespuesta(correcta) {
        const opciones = new Set([correcta]);
        let intentos = 0;

        while (opciones.size < 5 && intentos < 200) {
            intentos += 1;
            const variacion = obtenerNumeroAleatorio(-10, 10);
            const candidata = correcta + variacion;

            if (variacion !== 0 && candidata >= 1) {
                opciones.add(candidata);
            }
        }

        return mezclarArreglo(Array.from(opciones));
    }

    function renderizarOpcionesRespuesta(correcta) {
        opcionesRespuesta.innerHTML = '';

        generarOpcionesRespuesta(correcta).forEach(function (valor) {
            const boton = document.createElement('button');
            boton.type = 'button';
            boton.className = 'boton-opcion-respuesta rounded-xl border-2 border-slate-300 bg-white py-4 text-2xl font-black text-slate-800 shadow-sm transition hover:scale-[1.03] hover:border-fuchsia-400 hover:bg-fuchsia-50';
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

        const multiplicador = obtenerNumeroAleatorio(1, 10);
        const posicionTabla = obtenerNumeroAleatorio(0, tablasSeleccionadas.length - 1);
        const tablaParaPracticar = tablasSeleccionadas[posicionTabla];

        respuestaCorrecta = tablaParaPracticar * multiplicador;
        numeroOperacion1 = tablaParaPracticar;
        numeroOperacion2 = multiplicador;
        MateAventuras.efectos.establecerTextoOperacion(operacion, tablaParaPracticar + ' × ' + multiplicador);
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

            const partidaCompleta = MateAventuras.marcador.registrarAcierto(usoAyuda || huboError, boton);
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

        actualizarVistaModoTablas();
        MateAventuras.uiJugadores.inicializarJugador();
    }

    inicializar();
})();
