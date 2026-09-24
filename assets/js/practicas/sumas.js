(function () {
    const motor = MateAventuras.motor;
    const botonesNivel = document.querySelectorAll('.boton-nivel');
    const nivelSeleccionadoTexto = document.getElementById('nivelSeleccionadoTexto');

    let numeroOperacion1 = 0;
    let numeroOperacion2 = 0;
    let nivelSeleccionado = 1;

    const NIVELES_SUMA = {
        1: { cifras: [1, 1], descripcion: '1 cifra + 1 cifra' },
        2: { cifras: [1, 2], descripcion: '1 cifra + 2 cifras' },
        3: { cifras: [2, 2], descripcion: '2 cifras + 2 cifras' },
        4: { cifras: [2, 3], descripcion: '2 cifras + 3 cifras' },
        5: { cifras: [3, 3], descripcion: '3 cifras + 3 cifras' }
    };

    function actualizarVistaNivel() {
        nivelSeleccionadoTexto.textContent = 'Nivel ' + nivelSeleccionado + ': ' + NIVELES_SUMA[nivelSeleccionado].descripcion;

        motor.resaltarSeleccion(botonesNivel, function (boton) {
            return Number(boton.dataset.nivel) === nivelSeleccionado;
        });
    }

    // Construye la suma columna por columna (de derecha a izquierda) y devuelve,
    // además del resultado, qué columnas recibieron una llevada para poder dibujarlas.
    function calcularSumaEnColumna(a, b) {
        const digitosA = motor.digitos(a);
        const digitosB = motor.digitos(b);
        const cifras = Math.max(digitosA.length, digitosB.length);
        const resultado = new Array(cifras).fill(0);
        const llevadaEntra = new Array(cifras + 1).fill(0);

        let llevada = 0;
        for (let i = 0; i < cifras; i += 1) {
            const digitoA = digitosA[digitosA.length - 1 - i] || 0;
            const digitoB = digitosB[digitosB.length - 1 - i] || 0;
            const suma = digitoA + digitoB + llevada;

            resultado[i] = suma % 10;
            llevada = Math.floor(suma / 10);
            llevadaEntra[i + 1] = llevada;
        }

        return {
            digitosA: digitosA,
            digitosB: digitosB,
            cifras: cifras,
            resultado: resultado,
            llevadaEntra: llevadaEntra,
            llevadaFinal: llevada
        };
    }

    function crearCelda(clase) {
        const celda = document.createElement('div');
        celda.className = clase;
        return celda;
    }

    function construirVisualSuma(a, b) {
        const datos = calcularSumaEnColumna(a, b);
        const totalColumnas = datos.cifras + 1; // columna extra a la izquierda: signo y posible llevada final

        const rejilla = document.createElement('div');
        rejilla.className = 'grid gap-y-2 gap-x-1';
        rejilla.style.gridTemplateColumns = 'repeat(' + totalColumnas + ', minmax(2.5rem, 1fr))';

        // Fila de llevadas
        for (let p = 0; p < totalColumnas; p += 1) {
            const i = totalColumnas - 1 - p;
            const celda = crearCelda('flex h-6 items-end justify-center');
            if (datos.llevadaEntra[i] > 0) {
                const chip = document.createElement('span');
                chip.className = 'text-sm font-black text-amber-600';
                chip.textContent = '+' + datos.llevadaEntra[i];
                celda.appendChild(chip);
            }
            rejilla.appendChild(celda);
        }

        // Fila del primer sumando
        for (let p = 0; p < totalColumnas; p += 1) {
            const i = totalColumnas - 1 - p;
            const celda = crearCelda('flex items-center justify-center text-3xl font-black text-slate-900');
            if (i < datos.digitosA.length) {
                celda.textContent = String(datos.digitosA[datos.digitosA.length - 1 - i]);
            }
            rejilla.appendChild(celda);
        }

        // Fila del segundo sumando, con el signo "+" en la columna reservada
        for (let p = 0; p < totalColumnas; p += 1) {
            const i = totalColumnas - 1 - p;
            const celda = crearCelda('flex items-center justify-center text-3xl font-black text-slate-900');
            if (i === datos.cifras) {
                celda.textContent = '+';
                celda.classList.add('text-fuchsia-600');
            } else if (i < datos.digitosB.length) {
                celda.textContent = String(datos.digitosB[datos.digitosB.length - 1 - i]);
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
            } else if (datos.llevadaFinal > 0) {
                celda.textContent = String(datos.llevadaFinal);
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
        operacionOriginal.textContent = numeroOperacion1 + ' + ' + numeroOperacion2;

        envoltorio.appendChild(operacionOriginal);
        envoltorio.appendChild(construirVisualSuma(numeroOperacion1, numeroOperacion2));
        contenedor.appendChild(envoltorio);

        return 'Suma de derecha a izquierda. Si una columna da 10 o más, el 1 naranja "se lleva" a la columna de al lado.';
    }

    function crearRonda() {
        const nivel = NIVELES_SUMA[nivelSeleccionado];
        const sumando1 = motor.numeroConCifras(nivel.cifras[0]);
        const sumando2 = motor.numeroConCifras(nivel.cifras[1]);
        const correcta = sumando1 + sumando2;
        const magnitud = Math.pow(10, Math.max(0, String(correcta).length - 2));

        numeroOperacion1 = sumando1;
        numeroOperacion2 = sumando2;

        // Errores típicos: olvidar una llevada, sumar mal un dígito
        // o desplazar el resultado una decena.
        const candidatas = [
            sumando1 + (sumando2 + 1), sumando1 + (sumando2 - 1),
            (sumando1 + 1) + sumando2, (sumando1 - 1) + sumando2,
            correcta + 1, correcta - 1,
            correcta + 10, correcta - 10,
            correcta + magnitud, correcta - magnitud
        ];

        return {
            texto: sumando1 + ' + ' + sumando2,
            respuesta: correcta,
            opciones: motor.opcionesNumericas(correcta, candidatas),
            monedas: nivelSeleccionado
        };
    }

    const practica = motor.crear({
        configuracion: {
            actual: function () {
                return { nivelSuma: nivelSeleccionado };
            },
            predeterminada: function () {
                return { nivelSuma: 1 };
            },
            aplicar: function (configuracion) {
                const nivel = Number(configuracion.nivelSuma);
                nivelSeleccionado = NIVELES_SUMA[nivel] ? nivel : 1;
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

            if (!NIVELES_SUMA[nivel] || nivel === nivelSeleccionado) {
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
