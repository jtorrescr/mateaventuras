window.MateAventuras = window.MateAventuras || {};

MateAventuras.uiJugadores = (function () {
    const PERSONAJES = ['🦊', '🐶', '🐱', '🐼', '🦁', '🐸', '🦄', '🤖'];

    let opciones = null;
    let personajeSeleccionado = '🦊';
    let personajeParaNuevoJugador = '🦊';

    let mascota = null;
    let nombreJugador = null;
    let inputNombreJugador = null;
    let btnAbrirJugadores = null;
    let popupPersonaje = null;
    let popupJugadores = null;
    let nuevoNicknamePopup = null;
    let listaJugadoresPopup = null;
    let botonesPersonaje = [];
    let botonesPersonajeNuevo = [];

    function botonesPersonajeHtml(clase, alto, tamano) {
        return PERSONAJES.map(function (personaje) {
            return '<button class="' + clase + ' ' + alto + ' rounded-xl border border-slate-200 bg-white p-2 ' + tamano + ' hover:bg-slate-100" data-personaje="' + personaje + '">' + personaje + '</button>';
        }).join('\n');
    }

    function htmlPopups() {
        return `
    <div id="popupPersonaje" class="fixed inset-0 z-50 hidden items-center justify-center bg-slate-900/60 px-4"
        role="dialog" aria-modal="true" aria-labelledby="tituloPopupPersonaje">
        <div class="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div class="mb-4 flex items-center justify-between">
                <h2 id="tituloPopupPersonaje" class="text-xl font-black text-fuchsia-700">Elige tu personaje</h2>
                <button id="btnCerrarPopupPersonaje"
                    class="rounded-xl border border-slate-300 bg-slate-100 px-3 py-1.5 font-bold text-slate-700 hover:bg-slate-200">Cerrar</button>
            </div>
            <div class="grid grid-cols-4 gap-2">
                ${botonesPersonajeHtml('boton-personaje', 'min-h-14', 'text-3xl')}
            </div>
        </div>
    </div>

    <div id="popupJugadores" class="fixed inset-0 z-50 hidden items-center justify-center bg-slate-900/60 px-4"
        role="dialog" aria-modal="true" aria-labelledby="tituloPopupJugadores">
        <div class="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl">
            <div class="mb-4 flex items-center justify-between">
                <h2 id="tituloPopupJugadores" class="text-xl font-black text-indigo-700">Jugadores</h2>
                <button id="btnCerrarPopupJugadores"
                    class="rounded-xl border border-slate-300 bg-slate-100 px-3 py-1.5 font-bold text-slate-700 hover:bg-slate-200">Cerrar</button>
            </div>

            <div class="mb-5 rounded-2xl bg-gradient-to-br from-cyan-50 to-blue-50 p-4">
                <label for="nuevoNicknamePopup" class="mb-2 block font-bold text-slate-700">Crear nuevo
                    jugador</label>
                <div class="flex gap-2">
                    <input id="nuevoNicknamePopup" type="text" maxlength="15"
                        class="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-lg font-bold outline-none focus:border-slate-500"
                        placeholder="Ej: Ana" />
                    <button id="btnCrearJugadorPopup"
                        class="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2 font-bold text-white shadow-sm hover:from-emerald-600 hover:to-teal-600">Crear</button>
                </div>
                <p class="mb-2 mt-3 text-sm font-bold text-slate-600">Elige su personaje</p>
                <div id="selectorPersonajesNuevo" class="grid grid-cols-4 gap-2 sm:grid-cols-8">
                    ${botonesPersonajeHtml('boton-personaje-nuevo', 'min-h-12', 'text-2xl')}
                </div>
            </div>

            <p class="mb-2 text-lg font-black text-slate-800">Jugadores guardados</p>
            <div id="listaJugadoresPopup" class="space-y-3"></div>
        </div>
    </div>`;
    }

    function iniciar(config) {
        opciones = config;

        mascota = document.getElementById('mascota');
        nombreJugador = document.getElementById('nombreJugadorPractica');
        inputNombreJugador = document.getElementById('inputNombreJugador');
        btnAbrirJugadores = document.getElementById('btnAbrirJugadores');

        if (!document.getElementById('popupJugadores')) {
            document.body.insertAdjacentHTML('beforeend', htmlPopups());
        }

        popupPersonaje = document.getElementById('popupPersonaje');
        popupJugadores = document.getElementById('popupJugadores');
        nuevoNicknamePopup = document.getElementById('nuevoNicknamePopup');
        listaJugadoresPopup = document.getElementById('listaJugadoresPopup');
        botonesPersonaje = document.querySelectorAll('.boton-personaje');
        botonesPersonajeNuevo = document.querySelectorAll('.boton-personaje-nuevo');

        conectarEventos();
    }

    function personajeActual() {
        return personajeSeleccionado;
    }

    function mostrarMascota() {
        mascota.textContent = personajeSeleccionado;
    }

    function actualizarCabecera() {
        const jugador = MateAventuras.jugadores.obtenerActual();
        nombreJugador.textContent = jugador ? jugador.nickname : MateAventuras.jugadores.NOMBRE_PREDETERMINADO;
        mascota.textContent = personajeSeleccionado;
    }

    function actualizarResaltadoPersonajes() {
        botonesPersonaje.forEach(function (boton) {
            const seleccionado = boton.dataset.personaje === personajeSeleccionado;
            boton.classList.toggle('personaje-seleccionado-arcoiris', seleccionado);
            boton.setAttribute('aria-pressed', seleccionado ? 'true' : 'false');
        });
    }

    function actualizarResaltadoPersonajeNuevo() {
        botonesPersonajeNuevo.forEach(function (boton) {
            const seleccionado = boton.dataset.personaje === personajeParaNuevoJugador;
            boton.classList.toggle('personaje-seleccionado-arcoiris', seleccionado);
            boton.setAttribute('aria-pressed', seleccionado ? 'true' : 'false');
        });
    }

    function guardarEstado() {
        MateAventuras.jugadores.guardarEstadoActual({
            personaje: personajeSeleccionado,
            puntaje: MateAventuras.marcador.obtenerPuntaje(),
            techoPuntaje: MateAventuras.marcador.obtenerTecho(),
            configuracion: opciones.obtenerConfiguracion()
        });
    }

    function crearJugadorPredeterminado(nombre, personaje) {
        return MateAventuras.jugadores.crear(nombre, personaje, opciones.obtenerConfiguracionPredeterminada());
    }

    function aplicarJugador(jugador) {
        MateAventuras.jugadores.establecerActual(jugador.id);
        personajeSeleccionado = jugador.personaje || MateAventuras.jugadores.PERSONAJE_PREDETERMINADO;
        MateAventuras.marcador.reiniciar(jugador.puntaje || 0, jugador.techoPuntaje || 0);
        opciones.aplicarConfiguracion(jugador);
        actualizarCabecera();
        actualizarResaltadoPersonajes();
        guardarEstado();
    }

    function seleccionarJugadorYJugar(id) {
        const jugador = MateAventuras.jugadores.obtenerPorId(id);

        if (!jugador) {
            return;
        }

        aplicarJugador(jugador);
        cerrarPopupJugadores();
        opciones.alEmpezarPractica();
    }

    function crearJugadorDesdePopup() {
        const nombre = nuevoNicknamePopup.value.trim();

        if (nombre === '') {
            return;
        }

        const nuevoJugador = crearJugadorPredeterminado(nombre, personajeParaNuevoJugador);
        aplicarJugador(nuevoJugador);
        nuevoNicknamePopup.value = '';
        renderizarLista();
        cerrarPopupJugadores();
        opciones.alEmpezarPractica();
    }

    function eliminarJugadorPorId(id) {
        const eraActual = MateAventuras.jugadores.eliminar(id);

        if (eraActual) {
            const jugadores = MateAventuras.jugadores.obtenerTodos();
            aplicarJugador(jugadores.length > 0 ? jugadores[0] : crearJugadorPredeterminado());
        }

        renderizarLista();
    }

    function renderizarLista() {
        const contenedor = listaJugadoresPopup;
        const jugadores = MateAventuras.jugadores.obtenerTodos();
        const jugadorActual = MateAventuras.jugadores.obtenerActual();
        contenedor.innerHTML = '';

        if (jugadores.length === 0) {
            const vacio = document.createElement('div');
            vacio.className = 'rounded-xl border border-slate-200 bg-slate-50 p-4 text-center font-semibold text-slate-500';
            vacio.textContent = 'No hay jugadores guardados.';
            contenedor.appendChild(vacio);
            return;
        }

        jugadores.forEach(function (jugador) {
            const esActual = jugadorActual && jugador.id === jugadorActual.id;
            const item = document.createElement('div');
            item.className = 'flex items-center gap-2 rounded-xl border p-3 ' +
                (esActual ? 'border-fuchsia-300 bg-fuchsia-50' : 'border-slate-200 bg-white');

            const botonSeleccionar = document.createElement('button');
            botonSeleccionar.className = 'flex flex-1 items-center gap-3 rounded-lg p-2 text-left hover:bg-slate-50';

            const emoji = document.createElement('span');
            emoji.className = 'text-3xl';
            emoji.textContent = jugador.personaje;

            const texto = document.createElement('span');
            texto.className = 'flex-1';

            const nombre = document.createElement('span');
            nombre.className = 'block text-lg font-black text-slate-800';
            nombre.textContent = jugador.nickname;

            const puntos = document.createElement('span');
            puntos.className = 'block text-sm font-semibold text-slate-500';
            puntos.textContent = jugador.puntaje + ' monedas';

            texto.appendChild(nombre);
            texto.appendChild(puntos);
            botonSeleccionar.appendChild(emoji);
            botonSeleccionar.appendChild(texto);
            botonSeleccionar.addEventListener('click', function () {
                seleccionarJugadorYJugar(jugador.id);
            });

            const botonReset = document.createElement('button');
            botonReset.className = 'rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100';
            botonReset.textContent = 'Reset';
            botonReset.addEventListener('click', function () {
                MateAventuras.jugadores.reiniciarPuntaje(jugador.id);
                if (esActual) {
                    MateAventuras.marcador.establecerPuntaje(0);
                    MateAventuras.marcador.reiniciarRacha();
                }
                renderizarLista();
            });

            const botonEliminar = document.createElement('button');
            botonEliminar.className = 'rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-bold text-red-600 hover:bg-red-100';
            botonEliminar.textContent = 'Eliminar';
            botonEliminar.addEventListener('click', function () {
                eliminarJugadorPorId(jugador.id);
            });

            item.appendChild(botonSeleccionar);
            item.appendChild(botonReset);
            item.appendChild(botonEliminar);
            contenedor.appendChild(item);
        });
    }

    function abrirPopupPersonaje() {
        popupPersonaje.classList.remove('hidden');
        popupPersonaje.classList.add('flex');
    }

    function cerrarPopupPersonaje() {
        popupPersonaje.classList.add('hidden');
        popupPersonaje.classList.remove('flex');
    }

    function abrirPopupJugadores() {
        personajeParaNuevoJugador = MateAventuras.jugadores.PERSONAJE_PREDETERMINADO;
        nuevoNicknamePopup.value = '';
        actualizarResaltadoPersonajeNuevo();
        renderizarLista();
        popupJugadores.classList.remove('hidden');
        popupJugadores.classList.add('flex');
    }

    function cerrarPopupJugadores() {
        popupJugadores.classList.add('hidden');
        popupJugadores.classList.remove('flex');
    }

    function iniciarEdicionNombre() {
        const jugador = MateAventuras.jugadores.obtenerActual();
        inputNombreJugador.value = jugador ? jugador.nickname : MateAventuras.jugadores.NOMBRE_PREDETERMINADO;
        nombreJugador.classList.add('hidden');
        inputNombreJugador.classList.remove('hidden');
        inputNombreJugador.focus();
        inputNombreJugador.select();
    }

    function guardarEdicionNombre() {
        inputNombreJugador.classList.add('hidden');
        nombreJugador.classList.remove('hidden');

        const nombreNuevo = inputNombreJugador.value.trim();
        if (nombreNuevo === '') {
            return;
        }

        if (!MateAventuras.jugadores.obtenerActual()) {
            aplicarJugador(crearJugadorPredeterminado());
        }

        MateAventuras.jugadores.renombrarActual(nombreNuevo);
        actualizarCabecera();
        renderizarLista();
    }

    function conectarEventos() {
        botonesPersonaje.forEach(function (boton) {
            boton.addEventListener('click', function () {
                personajeSeleccionado = boton.dataset.personaje;
                mascota.textContent = personajeSeleccionado;
                actualizarResaltadoPersonajes();

                if (!MateAventuras.jugadores.obtenerActual()) {
                    aplicarJugador(crearJugadorPredeterminado());
                    renderizarLista();
                }

                guardarEstado();
                cerrarPopupPersonaje();
            });
        });

        botonesPersonajeNuevo.forEach(function (boton) {
            boton.addEventListener('click', function () {
                personajeParaNuevoJugador = boton.dataset.personaje;
                actualizarResaltadoPersonajeNuevo();
            });
        });

        mascota.addEventListener('click', abrirPopupPersonaje);
        document.getElementById('btnCerrarPopupPersonaje').addEventListener('click', cerrarPopupPersonaje);
        popupPersonaje.addEventListener('click', function (evento) {
            if (evento.target === popupPersonaje) {
                cerrarPopupPersonaje();
            }
        });

        nombreJugador.addEventListener('click', iniciarEdicionNombre);
        nombreJugador.addEventListener('keydown', function (evento) {
            if (evento.key === 'Enter' || evento.key === ' ') {
                evento.preventDefault();
                iniciarEdicionNombre();
            }
        });
        inputNombreJugador.addEventListener('keydown', function (evento) {
            if (evento.key === 'Enter') {
                inputNombreJugador.blur();
            }
        });
        inputNombreJugador.addEventListener('blur', guardarEdicionNombre);

        btnAbrirJugadores.addEventListener('click', abrirPopupJugadores);
        document.getElementById('btnCerrarPopupJugadores').addEventListener('click', cerrarPopupJugadores);
        popupJugadores.addEventListener('click', function (evento) {
            if (evento.target === popupJugadores) {
                cerrarPopupJugadores();
            }
        });

        document.getElementById('btnCrearJugadorPopup').addEventListener('click', crearJugadorDesdePopup);
        nuevoNicknamePopup.addEventListener('keydown', function (evento) {
            if (evento.key === 'Enter') {
                crearJugadorDesdePopup();
            }
        });
    }

    function inicializarJugador() {
        MateAventuras.jugadores.cargar();

        let jugador = MateAventuras.jugadores.obtenerActual();

        if (!jugador) {
            const jugadores = MateAventuras.jugadores.obtenerTodos();
            jugador = jugadores.length > 0 ? jugadores[0] : crearJugadorPredeterminado();
        }

        aplicarJugador(jugador);
        renderizarLista();
        opciones.alEmpezarPractica();
    }

    return {
        iniciar: iniciar,
        inicializarJugador: inicializarJugador,
        aplicarJugador: aplicarJugador,
        guardarEstado: guardarEstado,
        renderizarLista: renderizarLista,
        personajeActual: personajeActual,
        mostrarMascota: mostrarMascota
    };
})();
