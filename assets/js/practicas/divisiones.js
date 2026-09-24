(function () {
    const motor = MateAventuras.motor;
    const botonesNivel = document.querySelectorAll('.boton-nivel');
    const nivelSeleccionadoTexto = document.getElementById('nivelSeleccionadoTexto');

    let dividendoActual = 0;
    let divisorActual = 0;
    let nivelSeleccionado = 1;

    // La división se arma al revés: se eligen divisor, cociente y residuo, y de ahí
    // sale el dividendo. Así el resultado siempre cae donde el nivel lo pide.
    const NIVELES_DIVISION = {
        1: { divisor: [2, 5], cociente: [2, 10], conResiduo: false, descripcion: 'Tablas fáciles, exacta' },
        2: { divisor: [2, 9], cociente: [2, 10], conResiduo: false, descripcion: 'Todas las tablas, exacta' },
        3: { divisor: [2, 9], cociente: [11, 99], conResiduo: false, descripcion: '3 cifras ÷ 1 cifra, exacta' },
        4: { divisor: [3, 9], cociente: [2, 10], conResiduo: true, descripcion: 'Con residuo' },
        5: { divisor: [3, 9], cociente: [11, 99], conResiduo: true, descripcion: '3 cifras, con residuo' }
    };

    function actualizarVistaNivel() {
        nivelSeleccionadoTexto.textContent = 'Nivel ' + nivelSeleccionado + ': ' + NIVELES_DIVISION[nivelSeleccionado].descripcion;

        motor.resaltarSeleccion(botonesNivel, function (boton) {
            return Number(boton.dataset.nivel) === nivelSeleccionado;
        });
    }

    function textoConResiduo(cociente, residuo) {
        return cociente + (residuo === 1 ? ' y sobra 1' : ' y sobran ' + residuo);
    }

    function opcionConResiduo(cociente, residuo) {
        return {
            clave: cociente + 'r' + residuo,
            texto: textoConResiduo(cociente, residuo)
        };
    }

    // Resuelve la división dígito a dígito, como se hace en el cuaderno, y guarda
    // cada paso (qué se divide, qué se resta y qué sobra) para poder dibujarlo.
    function calcularDivisionLarga(dividendo, divisor) {
        const digitosDividendo = motor.digitos(dividendo);
        const digitosCociente = [];
        const pasos = [];

        let resto = 0;
        let yaComenzo = false;

        for (let i = 0; i < digitosDividendo.length; i += 1) {
            const valor = resto * 10 + digitosDividendo[i];
            const digito = Math.floor(valor / divisor);
            resto = valor % divisor;

            if (digito > 0) {
                yaComenzo = true;
            }

            digitosCociente.push(yaComenzo ? digito : null);

            if (yaComenzo) {
                pasos.push({
                    columna: i,
                    valor: valor,
                    producto: digito * divisor,
                    resto: resto
                });
            }
        }

        return {
            digitosDividendo: digitosDividendo,
            digitosCociente: digitosCociente,
            pasos: pasos,
            resto: resto
        };
    }

    function crearCelda(clase, texto) {
        const celda = document.createElement('div');
        celda.className = clase;

        if (texto !== undefined && texto !== null) {
            celda.textContent = String(texto);
        }

        return celda;
    }

    // Escribe un número alineado a la derecha, terminando en la columna indicada.
    function agregarNumeroAlineado(rejilla, totalColumnas, numero, columnaFinal, clase, prefijo) {
        const digitos = String(numero).split('');
        const primeraColumna = columnaFinal - digitos.length + 1;

        for (let columna = 0; columna < totalColumnas; columna += 1) {
            if (columna === primeraColumna - 1 && prefijo) {
                rejilla.appendChild(crearCelda(clase, prefijo));
            } else if (columna >= primeraColumna && columna <= columnaFinal) {
                rejilla.appendChild(crearCelda(clase, digitos[columna - primeraColumna]));
            } else {
                rejilla.appendChild(crearCelda(''));
            }
        }
    }

    function agregarLinea(rejilla, totalColumnas, desdeColumna, hastaColumna) {
        for (let columna = 0; columna < totalColumnas; columna += 1) {
            const esParteDeLaLinea = columna >= desdeColumna && columna <= hastaColumna;
            rejilla.appendChild(crearCelda(esParteDeLaLinea ? 'border-t-4 border-slate-400' : ''));
        }
    }

    function construirVisualDivision(dividendo, divisor) {
        const datos = calcularDivisionLarga(dividendo, divisor);
        const cifras = datos.digitosDividendo.length;
        const COLUMNA_DIVISOR = 0;
        const COLUMNA_PARED = 1;
        const totalColumnas = cifras + 2; // divisor, pared de la caja y un lugar por cifra del dividendo

        const rejilla = document.createElement('div');
        rejilla.className = 'grid items-center gap-y-1 text-center';
        rejilla.style.gridTemplateColumns = 'auto auto repeat(' + cifras + ', minmax(2.25rem, 1fr))';

        // Fila del cociente, encima del techo de la caja
        for (let columna = 0; columna < totalColumnas; columna += 1) {
            const indiceDigito = columna - COLUMNA_PARED - 1;
            const digito = indiceDigito >= 0 ? datos.digitosCociente[indiceDigito] : null;
            rejilla.appendChild(crearCelda('text-3xl font-black text-emerald-700', digito));
        }

        // Techo de la caja, solo sobre el dividendo
        agregarLinea(rejilla, totalColumnas, COLUMNA_PARED + 1, totalColumnas - 1);

        // Fila del dividendo, con el divisor afuera y la pared de la caja
        rejilla.appendChild(crearCelda('pr-1 text-3xl font-black text-fuchsia-600', divisor));
        rejilla.appendChild(crearCelda('h-10 border-l-4 border-slate-400'));
        for (let i = 0; i < cifras; i += 1) {
            rejilla.appendChild(crearCelda('text-3xl font-black text-slate-900', datos.digitosDividendo[i]));
        }

        // Un bloque por paso: lo que se resta, la raya y lo que queda
        datos.pasos.forEach(function (paso, indice) {
            const columnaFinal = COLUMNA_PARED + 1 + paso.columna;
            const digitosValor = String(paso.valor).length;

            agregarNumeroAlineado(rejilla, totalColumnas, paso.producto, columnaFinal, 'text-2xl font-black text-amber-600', '−');
            agregarLinea(rejilla, totalColumnas, columnaFinal - digitosValor + 1, columnaFinal);

            const siguiente = datos.pasos[indice + 1];

            if (siguiente) {
                // Se baja la siguiente cifra: lo que sobró pasa a ser parte del próximo reparto.
                agregarNumeroAlineado(rejilla, totalColumnas, siguiente.valor, COLUMNA_PARED + 1 + siguiente.columna, 'text-2xl font-black text-slate-700');
            } else {
                agregarNumeroAlineado(rejilla, totalColumnas, paso.resto, columnaFinal, 'text-2xl font-black text-cyan-700');
            }
        });

        return rejilla;
    }

    function construirAyuda(contenedor) {
        const datos = calcularDivisionLarga(dividendoActual, divisorActual);

        const envoltorio = document.createElement('div');
        envoltorio.className = 'flex flex-col items-center gap-4';

        const operacionOriginal = document.createElement('p');
        operacionOriginal.className = 'text-2xl font-black text-slate-500';
        operacionOriginal.textContent = dividendoActual + ' ÷ ' + divisorActual;

        envoltorio.appendChild(operacionOriginal);
        envoltorio.appendChild(construirVisualDivision(dividendoActual, divisorActual));

        const pista = document.createElement('p');
        pista.className = 'max-w-md text-center text-sm font-semibold text-slate-600';
        pista.textContent = 'Pregúntate "¿cuántas veces cabe el ' + divisorActual + '?", multiplica (naranja), resta y baja la siguiente cifra.';
        envoltorio.appendChild(pista);

        contenedor.appendChild(envoltorio);

        if (datos.resto > 0) {
            return 'Reparte de izquierda a derecha. Lo que queda al final y ya no alcanza para otro grupo es el residuo (azul).';
        }

        return 'Reparte de izquierda a derecha. Cuando al final queda 0, la división es exacta.';
    }

    function opcionesExactas(cociente, dividendo, divisor) {
        // Errores típicos: equivocarse de fila en la tabla o dividir entre el
        // número vecino. Con cocientes de dos cifras se añade el fallo de una
        // cifra completa, que en cocientes de una sola no tendría sentido.
        const candidatas = [
            cociente + 1, cociente - 1,
            cociente + 2, cociente - 2,
            Math.round(dividendo / (divisor + 1)),
            Math.round(dividendo / (divisor - 1))
        ];

        if (cociente >= 10) {
            candidatas.push(cociente + 10, cociente - 10, Number(String(cociente).split('').reverse().join('')));
        }

        return motor.opcionesNumericas(cociente, candidatas, { dispersion: cociente < 10 ? 4 : 10 });
    }

    function opcionesInexactas(cociente, residuo, divisor) {
        const elegidas = [];
        const claves = new Set();

        function agregar(otroCociente, otroResiduo) {
            if (otroCociente < 1 || otroResiduo < 1) {
                return;
            }

            const opcion = opcionConResiduo(otroCociente, otroResiduo);

            if (claves.has(opcion.clave)) {
                return;
            }

            claves.add(opcion.clave);
            elegidas.push(opcion);
        }

        agregar(cociente, residuo);

        // Errores típicos: contar mal lo que sobra, quedarse corto en el cociente y
        // dejar un residuo más grande que el divisor, o intercambiar ambos números.
        const candidatas = [
            [cociente, residuo + 1],
            [cociente, residuo - 1],
            [cociente - 1, residuo + divisor],
            [cociente + 1, residuo],
            [cociente - 1, residuo],
            [residuo, cociente],
            [cociente, divisor - residuo]
        ];

        motor.mezclar(candidatas).forEach(function (par) {
            if (elegidas.length < 5) {
                agregar(par[0], par[1]);
            }
        });

        let intentos = 0;
        while (elegidas.length < 5 && intentos < 200) {
            intentos += 1;
            agregar(cociente + motor.aleatorio(-3, 3), motor.aleatorio(1, divisor - 1));
        }

        return motor.mezclar(elegidas);
    }

    function crearRonda() {
        const nivel = NIVELES_DIVISION[nivelSeleccionado];
        const divisor = motor.aleatorio(nivel.divisor[0], nivel.divisor[1]);
        const cociente = motor.aleatorio(nivel.cociente[0], nivel.cociente[1]);
        const residuo = nivel.conResiduo ? motor.aleatorio(1, divisor - 1) : 0;
        const dividendo = divisor * cociente + residuo;

        dividendoActual = dividendo;
        divisorActual = divisor;

        return {
            texto: dividendo + ' ÷ ' + divisor,
            respuesta: nivel.conResiduo ? opcionConResiduo(cociente, residuo) : cociente,
            opciones: nivel.conResiduo
                ? opcionesInexactas(cociente, residuo, divisor)
                : opcionesExactas(cociente, dividendo, divisor),
            monedas: nivelSeleccionado
        };
    }

    const practica = motor.crear({
        configuracion: {
            actual: function () {
                return { nivelDivision: nivelSeleccionado };
            },
            predeterminada: function () {
                return { nivelDivision: 1 };
            },
            aplicar: function (configuracion) {
                const nivel = Number(configuracion.nivelDivision);
                nivelSeleccionado = NIVELES_DIVISION[nivel] ? nivel : 1;
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

            if (!NIVELES_DIVISION[nivel] || nivel === nivelSeleccionado) {
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
