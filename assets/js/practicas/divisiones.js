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
        3: { divisor: [2, 9], cociente: [11, 99], tresCifras: true, conResiduo: false, descripcion: '3 cifras ÷ 1 cifra, exacta' },
        4: { divisor: [3, 9], cociente: [2, 10], conResiduo: true, descripcion: 'Con residuo' },
        5: { divisor: [3, 9], cociente: [11, 99], tresCifras: true, conResiduo: true, descripcion: '3 cifras, con residuo' }
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

    // Marca la cifra que se baja del dividendo: se pinta como el dividendo (negra),
    // mientras que lo que sobró de la resta anterior queda en azul.
    function agregarRestoConBajada(rejilla, totalColumnas, valor, columnaFinal) {
        const digitos = String(valor).split('');
        const primeraColumna = columnaFinal - digitos.length + 1;

        for (let columna = 0; columna < totalColumnas; columna += 1) {
            if (columna >= primeraColumna && columna <= columnaFinal) {
                const indice = columna - primeraColumna;
                const esCifraBajada = indice === digitos.length - 1;
                rejilla.appendChild(crearCelda(
                    'text-2xl font-black ' + (esCifraBajada ? 'text-slate-900' : 'text-cyan-700'),
                    digitos[indice]));
            } else {
                rejilla.appendChild(crearCelda(''));
            }
        }
    }

    // Disposición del cuaderno: el dividendo y sus restas a la izquierda, y al otro
    // lado de la raya el divisor arriba con el cociente justo debajo.
    function construirVisualDivision(dividendo, divisor) {
        const datos = calcularDivisionLarga(dividendo, divisor);
        const cifras = datos.digitosDividendo.length;
        const totalColumnas = cifras + 1; // una columna extra a la izquierda para el signo "−"

        const envoltorio = document.createElement('div');
        envoltorio.className = 'flex items-start justify-center';

        const rejilla = document.createElement('div');
        rejilla.className = 'grid items-center gap-y-1 text-center';
        rejilla.style.gridTemplateColumns = 'repeat(' + totalColumnas + ', minmax(2.25rem, 1fr))';

        // Fila del dividendo
        for (let columna = 0; columna < totalColumnas; columna += 1) {
            const indiceDigito = columna - 1;
            rejilla.appendChild(crearCelda(
                'text-3xl font-black text-slate-900',
                indiceDigito >= 0 ? datos.digitosDividendo[indiceDigito] : null));
        }

        // Un bloque por paso: lo que se resta, la raya y lo que queda
        datos.pasos.forEach(function (paso, indice) {
            const columnaFinal = 1 + paso.columna;
            const digitosValor = String(paso.valor).length;

            agregarNumeroAlineado(rejilla, totalColumnas, paso.producto, columnaFinal, 'text-2xl font-black text-amber-600', '−');
            agregarLinea(rejilla, totalColumnas, columnaFinal - digitosValor + 1, columnaFinal);

            const siguiente = datos.pasos[indice + 1];

            if (siguiente) {
                agregarRestoConBajada(rejilla, totalColumnas, siguiente.valor, 1 + siguiente.columna);
            } else {
                agregarNumeroAlineado(rejilla, totalColumnas, paso.resto, columnaFinal, 'text-2xl font-black text-cyan-700');
            }
        });

        const caja = document.createElement('div');
        caja.className = 'ml-1 self-start border-l-4 border-slate-400 pl-3 text-center';

        const elementoDivisor = document.createElement('div');
        elementoDivisor.className = 'text-3xl font-black text-fuchsia-600';
        elementoDivisor.textContent = String(divisor);

        const raya = document.createElement('div');
        raya.className = 'my-1 border-t-4 border-slate-400';

        const elementoCociente = document.createElement('div');
        elementoCociente.className = 'text-3xl font-black text-emerald-700';
        elementoCociente.textContent = datos.digitosCociente.filter(function (digito) {
            return digito !== null;
        }).join('');

        caja.appendChild(elementoDivisor);
        caja.appendChild(raya);
        caja.appendChild(elementoCociente);

        envoltorio.appendChild(rejilla);
        envoltorio.appendChild(caja);

        return envoltorio;
    }

    function crearChipLeyenda(clasePunto, texto) {
        const chip = document.createElement('span');
        chip.className = 'flex items-center gap-1.5';

        const punto = document.createElement('span');
        punto.className = 'h-3 w-3 rounded-full ' + clasePunto;

        const etiqueta = document.createElement('span');
        etiqueta.textContent = texto;

        chip.appendChild(punto);
        chip.appendChild(etiqueta);
        return chip;
    }

    function crearLeyenda(resto) {
        const leyenda = document.createElement('div');
        leyenda.className = 'flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm font-bold text-slate-600';

        leyenda.appendChild(crearChipLeyenda('bg-amber-500', 'lo que multiplicas y restas'));
        leyenda.appendChild(crearChipLeyenda('bg-cyan-600', resto > 0 ? 'lo que va quedando, y al final el residuo' : 'lo que va quedando'));
        leyenda.appendChild(crearChipLeyenda('bg-emerald-600', 'el resultado'));

        return leyenda;
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

        envoltorio.appendChild(crearLeyenda(datos.resto));
        contenedor.appendChild(envoltorio);

        return 'Pregúntate "¿cuántas veces cabe el ' + divisorActual + '?", multiplica, resta y baja la siguiente cifra.';
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
        // Con divisores pequeños hace falta un cociente mayor para que el dividendo
        // llegue a las tres cifras que promete la etiqueta del nivel.
        const cocienteMinimo = nivel.tresCifras
            ? Math.max(nivel.cociente[0], Math.ceil(100 / divisor))
            : nivel.cociente[0];
        const cociente = motor.aleatorio(cocienteMinimo, nivel.cociente[1]);
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
