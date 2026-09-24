(function () {
    const motor = MateAventuras.motor;
    const botonesNivel = document.querySelectorAll('.boton-nivel');
    const nivelSeleccionadoTexto = document.getElementById('nivelSeleccionadoTexto');

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

    function actualizarVistaNivel() {
        nivelSeleccionadoTexto.textContent = 'Nivel ' + nivelSeleccionado + ': ' + NIVELES_RESTA[nivelSeleccionado].descripcion;

        motor.resaltarSeleccion(botonesNivel, function (boton) {
            return Number(boton.dataset.nivel) === nivelSeleccionado;
        });
    }

    // Resuelve la resta columna por columna (de derecha a izquierda) y anota,
    // por cada columna, si tuvo que pedir prestado o si prestó al vecino de la derecha.
    function calcularRestaEnColumna(minuendo, sustraendo) {
        const digitosM = motor.digitos(minuendo);
        const digitosS = motor.digitos(sustraendo);
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

    function construirAyuda(contenedor) {
        const envoltorio = document.createElement('div');
        envoltorio.className = 'flex flex-col items-center gap-4';

        const operacionOriginal = document.createElement('p');
        operacionOriginal.className = 'text-2xl font-black text-slate-500';
        operacionOriginal.textContent = numeroOperacion1 + ' − ' + numeroOperacion2;

        envoltorio.appendChild(operacionOriginal);
        envoltorio.appendChild(construirVisualResta(numeroOperacion1, numeroOperacion2));
        contenedor.appendChild(envoltorio);

        return 'Resta de derecha a izquierda. Si el número de arriba es menor, pide prestado 1 a la columna de la izquierda (naranja).';
    }

    // Error clásico: restar cada columna por separado sin pedir prestado
    // (por ejemplo, 84 − 47 dando 43 en vez de 37).
    function calcularErrorSinPrestamo(minuendo, sustraendo) {
        const digitosM = motor.digitos(minuendo);
        const digitosS = motor.digitos(sustraendo);
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

    function crearRonda() {
        const nivel = NIVELES_RESTA[nivelSeleccionado];
        let minuendo = motor.numeroConCifras(nivel.cifras[0]);
        let sustraendo = motor.numeroConCifras(nivel.cifras[1]);

        if (minuendo < sustraendo) {
            const temporal = minuendo;
            minuendo = sustraendo;
            sustraendo = temporal;
        }

        const correcta = minuendo - sustraendo;
        const magnitud = Math.pow(10, Math.max(0, String(correcta).length - 2));

        numeroOperacion1 = minuendo;
        numeroOperacion2 = sustraendo;

        // Errores típicos: olvidar un préstamo, restar mal un dígito,
        // restar cada columna sin pedir prestado o desplazar el resultado.
        const candidatas = [
            minuendo - (sustraendo + 1), minuendo - (sustraendo - 1),
            (minuendo + 1) - sustraendo, (minuendo - 1) - sustraendo,
            correcta + 1, correcta - 1,
            correcta + 10, correcta - 10,
            correcta + magnitud, correcta - magnitud,
            calcularErrorSinPrestamo(minuendo, sustraendo)
        ];

        return {
            texto: minuendo + ' − ' + sustraendo,
            respuesta: correcta,
            opciones: motor.opcionesNumericas(correcta, candidatas, { minimo: 0 }),
            monedas: nivelSeleccionado
        };
    }

    const practica = motor.crear({
        configuracion: {
            actual: function () {
                return { nivelResta: nivelSeleccionado };
            },
            predeterminada: function () {
                return { nivelResta: 1 };
            },
            aplicar: function (configuracion) {
                const nivel = Number(configuracion.nivelResta);
                nivelSeleccionado = NIVELES_RESTA[nivel] ? nivel : 1;
                actualizarVistaNivel();
            }
        },
        crearRonda: crearRonda,
        ayuda: {
            construir: construirAyuda
        }
    });

    botonesNivel.forEach(function (boton) {
        boton.addEventListener('click', function () {
            const nivel = Number(boton.dataset.nivel);

            if (!NIVELES_RESTA[nivel] || nivel === nivelSeleccionado) {
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
