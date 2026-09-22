window.MateAventuras = window.MateAventuras || {};

MateAventuras.marcador = (function () {
    const OPERACIONES_POR_PARTIDA = 8;

    let puntaje = 0;
    let rachaActual = 0;
    let operacionesEnPartidaActual = 0;
    let partidasEnSesion = 0;
    let operacionesConAyuda = [];

    let puntajeTexto = null;
    let rachaTexto = null;
    let partidasTexto = null;
    let textoProgreso = null;
    let progresoDots = [];
    let popupFinPartida = null;
    let subtituloFinPartida = null;
    let contadorPartidasPopup = null;

    const htmlPopupFinPartida = `
    <div id="popupFinPartida" class="fixed inset-0 z-50 hidden items-center justify-center bg-slate-900/60 px-4"
        role="dialog" aria-modal="true" aria-labelledby="tituloFinPartida">
        <div class="w-full max-w-sm rounded-3xl bg-white p-8 text-center shadow-2xl">
            <div class="mb-3 text-7xl">🏆</div>
            <h2 id="tituloFinPartida" class="mb-1 text-3xl font-black text-fuchsia-700">¡Partida terminada!</h2>
            <p id="subtituloFinPartida" class="mb-2 text-lg font-bold text-slate-600"></p>
            <p id="contadorPartidasPopup" class="mb-6 text-base font-semibold text-slate-500"></p>
            <button id="btnSiguientePartida"
                class="rounded-xl bg-gradient-to-r from-fuchsia-500 to-cyan-500 px-8 py-3 text-xl font-bold text-white shadow-md transition hover:scale-[1.02] hover:from-fuchsia-600 hover:to-cyan-600">
                ¡Siguiente partida!
            </button>
        </div>
    </div>`;

    function iniciar(opciones) {
        puntajeTexto = document.getElementById('puntaje');
        rachaTexto = document.getElementById('racha');
        partidasTexto = document.getElementById('partidasTexto');
        textoProgreso = document.getElementById('textoProgreso');
        progresoDots = [];
        for (let i = 0; i < OPERACIONES_POR_PARTIDA; i += 1) {
            progresoDots.push(document.getElementById('dot-' + i));
        }

        if (!document.getElementById('popupFinPartida')) {
            document.body.insertAdjacentHTML('beforeend', htmlPopupFinPartida);
        }
        popupFinPartida = document.getElementById('popupFinPartida');
        subtituloFinPartida = document.getElementById('subtituloFinPartida');
        contadorPartidasPopup = document.getElementById('contadorPartidasPopup');

        document.getElementById('btnSiguientePartida').addEventListener('click', function () {
            cerrarFinPartida();
            if (opciones && typeof opciones.alSiguientePartida === 'function') {
                opciones.alSiguientePartida();
            }
        });

        actualizarTodo();
    }

    function actualizarPuntaje() {
        puntajeTexto.textContent = puntaje + ' 🪙';
    }

    function actualizarRacha() {
        rachaTexto.textContent = rachaActual + ' 🔥';
    }

    function actualizarPartidas() {
        partidasTexto.textContent = partidasEnSesion + ' 🎮';
    }

    function actualizarProgreso() {
        progresoDots.forEach(function (dot, i) {
            dot.classList.remove('bg-white', 'border-fuchsia-300', 'bg-fuchsia-500', 'border-fuchsia-500', 'bg-amber-300', 'border-amber-500');

            if (i < operacionesEnPartidaActual) {
                if (operacionesConAyuda.includes(i)) {
                    dot.classList.add('bg-amber-300', 'border-amber-500');
                } else {
                    dot.classList.add('bg-fuchsia-500', 'border-fuchsia-500');
                }
            } else {
                dot.classList.add('bg-white', 'border-fuchsia-300');
            }
        });
        textoProgreso.textContent = operacionesEnPartidaActual + ' / ' + OPERACIONES_POR_PARTIDA;
    }

    function actualizarTodo() {
        actualizarPuntaje();
        actualizarRacha();
        actualizarPartidas();
        actualizarProgreso();
    }

    function reiniciar(puntajeInicial) {
        puntaje = puntajeInicial || 0;
        rachaActual = 0;
        operacionesEnPartidaActual = 0;
        partidasEnSesion = 0;
        operacionesConAyuda = [];
        actualizarTodo();
    }

    function reiniciarPartida() {
        operacionesEnPartidaActual = 0;
        operacionesConAyuda = [];
        actualizarProgreso();
    }

    function obtenerPuntaje() {
        return puntaje;
    }

    function establecerPuntaje(valor) {
        puntaje = valor;
        actualizarPuntaje();
    }

    function reiniciarRacha() {
        rachaActual = 0;
        actualizarRacha();
    }

    function registrarAcierto(conAyuda, botonOrigen, monedas) {
        const monedasOtorgadas = monedas || 1;
        const indiceOperacionResuelta = operacionesEnPartidaActual;
        operacionesEnPartidaActual += 1;

        if (!conAyuda) {
            puntaje += monedasOtorgadas;
            rachaActual += 1;
            MateAventuras.efectos.volarMoneda(botonOrigen, puntajeTexto);
        } else {
            rachaActual = 0;
            if (!operacionesConAyuda.includes(indiceOperacionResuelta)) {
                operacionesConAyuda.push(indiceOperacionResuelta);
            }
        }

        actualizarPuntaje();
        actualizarRacha();
        actualizarProgreso();

        return operacionesEnPartidaActual >= OPERACIONES_POR_PARTIDA;
    }

    function terminarPartida(nombreJugador) {
        partidasEnSesion += 1;
        actualizarPartidas();
        reiniciarPartida();

        subtituloFinPartida.textContent = '¡Muy bien, ' + nombreJugador + '!';
        contadorPartidasPopup.textContent = 'Partidas completadas hoy: ' + partidasEnSesion;
        popupFinPartida.classList.remove('hidden');
        popupFinPartida.classList.add('flex');
    }

    function cerrarFinPartida() {
        popupFinPartida.classList.add('hidden');
        popupFinPartida.classList.remove('flex');
    }

    return {
        OPERACIONES_POR_PARTIDA: OPERACIONES_POR_PARTIDA,
        iniciar: iniciar,
        reiniciar: reiniciar,
        reiniciarPartida: reiniciarPartida,
        obtenerPuntaje: obtenerPuntaje,
        establecerPuntaje: establecerPuntaje,
        reiniciarRacha: reiniciarRacha,
        registrarAcierto: registrarAcierto,
        terminarPartida: terminarPartida,
        cerrarFinPartida: cerrarFinPartida
    };
})();
