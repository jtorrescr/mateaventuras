(function () {
    const mascota = document.getElementById('mascota');
    const botonesNivel = document.querySelectorAll('.boton-nivel');
    const nivelSeleccionadoTexto = document.getElementById('nivelSeleccionadoTexto');
    const operacion = document.getElementById('operacion');
    const opcionesRespuesta = document.getElementById('opcionesRespuesta');
    const tarjetaOperacion = document.getElementById('tarjetaOperacion');
    const btnNuevaOperacion = document.getElementById('btnNuevaOperacion');
    const btnAyuda = document.getElementById('btnAyuda');
    const popupAyuda = document.getElementById('popupAyuda');
    const subtituloAyuda = document.getElementById('subtituloAyuda');
    const contenedorAyuda = document.getElementById('contenedorAyuda');
    const btnCerrarAyuda = document.getElementById('btnCerrarAyuda');

    let respuestaCorrecta = 0;
    let usoAyuda = false;
    let huboError = false;
    let numeroOperacion1 = 0; // minuendo
    let numeroOperacion2 = 0; // sustraendo
    let nivelSeleccionado = 1;

    // El minuendo siempre tiene igual o más cifras que el sustraendo,
    // para que la resta nunca dé negativo.
    const NIVELES_RESTA = {
        1: { cifras: [1, 1], descripcion: '1 cifra − 1 cifra' },
        2: { cifras: [2, 1], descripcion: '2 cifras − 1 cifra' },
        3: { cifras: [2, 2], descripcion: '2 cifras − 2 cifras' },
        4: { cifras: [3, 2], descripcion: '3 cifras − 2 cifras' },
        5: { cifras: [3, 3], descripcion: '3 cifras − 3 cifras' }
    };

    function obtenerConfiguracionActual() {
        return {
            nivelResta: nivelSeleccionado
        };
    }

    function obtenerConfiguracionPredeterminada() {
        return {
            nivelResta: 1
        };
    }

    function aplicarConfiguracionJugador(jugador) {
        const configuracion = MateAventuras.jugadores.obtenerConfiguracion(jugador, obtenerConfiguracionPredeterminada());

        const nivel = Number(configuracion.nivelResta);
        nivelSeleccionado = NIVELES_RESTA[nivel] ? nivel : 1;

        actualizarVistaNivel();
    }

    function actualizarVistaNivel() {
        const nivel = NIVELES_RESTA[nivelSeleccionado];
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

    function obtenerDigitos(numero) {
        return String(numero).split('').map(function (caracter) {
            return Number(caracter);
        });
    }

    // Resuelve la resta columna por columna (de derecha a izquierda) y anota,
    // por cada columna, si tuvo que pedir prestado o si prestó al vecino de la derecha.
    function calcularRestaEnColumna(minuendo, sustraendo) {
        const digitosM = obtenerDigitos(minuendo);
        const digitosS = obtenerDigitos(sustraendo);
        const cifras = digitosM.length;
        const resultado = new Array(cifras).fill(0);
        const prestamoEntra = new Array(cifras).fill(0);
        const prestamoSale = new Array(cifras).fill(0);

        let prestamo = 0;
        for (let i = 0; i < cifras; i += 1) {
            const digitoM = digitosM[digitosM.length - 1 - i];
            const digitoS = i < digitosS.length ? digitosS[digitosS.length - 1 - i] : 0;

            prestamoEntra[i] = prestamo;
            let valor = digitoM - prestamo;
            const necesitaPrestamo = valor < digitoS;

            if (necesitaPrestamo) {
                valor += 10;
            }

            resultado[i] = valor - digitoS;
            prestamoSale[i] = necesitaPrestamo ? 1 : 0;
            prestamo = necesitaPrestamo ? 1 : 0;
        }

        return {
            digitosM: digitosM,
            digitosS: digitosS,
            cifras: cifras,
            resultado: resultado,
            prestamoEntra: prestamoEntra,
            prestamoSale: prestamoSale
        };
    }

    function crearCelda(clase) {
        const celda = document.createElement('div');
        celda.className = clase;
        return celda;
    }

    function crearCeldaMinuendo(digito, necesitaPrestamo, fueReducido) {
        const celda = crearCelda('flex items-end justify-center');
        const fila = document.createElement('div');
        fila.className = 'flex items-start justify-center gap-0.5';

        if (necesitaPrestamo) {
            const chip = document.createElement('span');
            chip.className = 'mt-0.5 text-xs font-black text-amber-600';
            chip.textContent = '1';
            fila.appendChild(chip);
        }

        if (fueReducido) {
            const pila = document.createElement('span');
            pila.className = 'flex flex-col items-center leading-none';

            const tachado = document.createElement('span');
            tachado.className = 'text-base font-bold text-slate-400 line-through';
            tachado.textContent = String(digito);

            const corregido = document.createElement('span');
            corregido.className = 'text-3xl font-black text-amber-600';
            corregido.textContent = String((digito + 9) % 10);

            pila.appendChild(tachado);
            pila.appendChild(corregido);
            fila.appendChild(pila);
        } else {
            const digitoNormal = document.createElement('span');
            digitoNormal.className = 'text-3xl font-black text-slate-900';
            digitoNormal.textContent = String(digito);
            fila.appendChild(digitoNormal);
        }

        celda.appendChild(fila);
        return celda;
    }

    function construirVisualResta(minuendo, sustraendo) {
        const datos = calcularRestaEnColumna(minuendo, sustraendo);
        const totalColumnas = datos.cifras + 1; // columna extra a la izquierda para el signo "−"

        const rejilla = document.createElement('div');
        rejilla.className = 'grid gap-y-2 gap-x-1';
        rejilla.style.gridTemplateColumns = 'repeat(' + totalColumnas + ', minmax(2.5rem, 1fr))';

        // Fila del minuendo (arriba), con las anotaciones de préstamo
        for (let p = 0; p < totalColumnas; p += 1) {
            const i = totalColumnas - 1 - p;
            if (i === datos.cifras) {
                rejilla.appendChild(crearCelda(''));
                continue;
            }
            const digito = datos.digitosM[datos.digitosM.length - 1 - i];
            rejilla.appendChild(crearCeldaMinuendo(digito, datos.prestamoSale[i] === 1, datos.prestamoEntra[i] === 1));
        }

        // Fila del sustraendo, con el signo "−" en la columna reservada
        for (let p = 0; p < totalColumnas; p += 1) {
            const i = totalColumnas - 1 - p;
            const celda = crearCelda('flex items-center justify-center text-3xl font-black text-slate-900');
            if (i === datos.cifras) {
                celda.textContent = '−';
                celda.classList.add('text-fuchsia-600');
            } else if (i < datos.digitosS.length) {
                celda.textContent = String(datos.digitosS[datos.digitosS.length - 1 - i]);
            }
            rejilla.appendChild(celda);
        }

        // Línea divisoria
        const linea = crearCelda('mt-1 border-t-4 border-slate-700');
        linea.style.gridColumn = '1 / -1';
        rejilla.appendChild(linea);

        // Fila de resultado
        for (let p = 0; p < totalColumnas; p += 1) {
            const i = totalColumnas - 1 - p;
            const celda = crearCelda('flex items-center justify-center text-3xl font-black text-emerald-700');
            if (i < datos.cifras) {
                celda.textContent = String(datos.resultado[i]);
            }
            rejilla.appendChild(celda);
        }

        return rejilla;
    }

    function abrirPopupAyuda() {
        usoAyuda = true;

        contenedorAyuda.innerHTML = '';
        contenedorAyuda.appendChild(construirVisualResta(numeroOperacion1, numeroOperacion2));

        subtituloAyuda.textContent = 'Resta de derecha a izquierda. Si el número de arriba es menor, pide prestado 1 a la columna de la izquierda (naranja).';

        popupAyuda.classList.remove('hidden');
        popupAyuda.classList.add('flex');
    }

    function cerrarPopupAyuda() {
        popupAyuda.classList.add('hidden');
        popupAyuda.classList.remove('flex');

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
        cerrarPopupAyuda();
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

    // Error clásico: restar cada columna por separado sin pedir prestado
    // (por ejemplo, 84 − 47 dando 43 en vez de 37).
    function calcularErrorSinPrestamo(minuendo, sustraendo) {
        const digitosM = obtenerDigitos(minuendo);
        const digitosS = obtenerDigitos(sustraendo);
        const cifras = digitosM.length;
        let texto = '';

        for (let i = 0; i < cifras; i += 1) {
            const digitoM = digitosM[i];
            const posicionS = i - (cifras - digitosS.length);
            const digitoS = posicionS >= 0 ? digitosS[posicionS] : 0;
            texto += String(Math.abs(digitoM - digitoS));
        }

        return Number(texto);
    }

    function generarOpcionesRespuesta(correcta) {
        const a = numeroOperacion1;
        const b = numeroOperacion2;
        const magnitud = Math.pow(10, Math.max(0, String(correcta).length - 2));

        // Errores típicos: olvidar un préstamo, restar mal un dígito,
        // restar cada columna sin pedir prestado o desplazar el resultado.
        const candidatas = [
            a - (b + 1), a - (b - 1), (a + 1) - b, (a - 1) - b,
            correcta + 1, correcta - 1,
            correcta + 10, correcta - 10,
            correcta + magnitud, correcta - magnitud,
            calcularErrorSinPrestamo(a, b)
        ];

        const opciones = new Set([correcta]);
        mezclarArreglo(candidatas).forEach(function (candidata) {
            if (opciones.size < 5 && candidata >= 0 && candidata !== correcta) {
                opciones.add(candidata);
            }
        });

        let intentos = 0;
        while (opciones.size < 5 && intentos < 200) {
            intentos += 1;
            const variacion = obtenerNumeroAleatorio(-10, 10);
            const candidata = correcta + variacion;

            if (variacion !== 0 && candidata >= 0) {
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

        const nivel = NIVELES_RESTA[nivelSeleccionado];
        let minuendo = obtenerNumeroConCifras(nivel.cifras[0]);
        let sustraendo = obtenerNumeroConCifras(nivel.cifras[1]);

        if (minuendo < sustraendo) {
            const temporal = minuendo;
            minuendo = sustraendo;
            sustraendo = temporal;
        }

        respuestaCorrecta = minuendo - sustraendo;
        numeroOperacion1 = minuendo;
        numeroOperacion2 = sustraendo;
        MateAventuras.efectos.establecerTextoOperacion(operacion, minuendo + ' − ' + sustraendo);
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

            if (!NIVELES_RESTA[nivel] || nivel === nivelSeleccionado) {
                return;
            }

            nivelSeleccionado = nivel;
            actualizarVistaNivel();
            MateAventuras.uiJugadores.guardarEstado();
            generarOperacion();
        });
    });

    btnAyuda.addEventListener('click', abrirPopupAyuda);
    btnCerrarAyuda.addEventListener('click', cerrarPopupAyuda);
    popupAyuda.addEventListener('click', function (evento) {
        if (evento.target === popupAyuda) {
            cerrarPopupAyuda();
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
