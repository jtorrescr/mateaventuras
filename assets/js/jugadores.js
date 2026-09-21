window.MateAventuras = window.MateAventuras || {};

MateAventuras.jugadores = (function () {
    const claveAlmacenamientoJugadores = 'mateAventurasJugadores';
    const claveJugadorActual = 'mateAventurasJugadorActual';
    const claveGrupoJugadores = 'mateAventurasGrupoJugadores';
    const NOMBRE_PREDETERMINADO = 'Jugador 1';
    const PERSONAJE_PREDETERMINADO = '🦊';

    let jugadores = [];
    let jugadorActualId = null;

    function generarId() {
        if (window.crypto && typeof crypto.randomUUID === 'function') {
            return crypto.randomUUID();
        }
        return 'j-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10);
    }

    function cargar() {
        try {
            const datosGuardados = localStorage.getItem(claveAlmacenamientoJugadores);
            jugadores = datosGuardados ? JSON.parse(datosGuardados) : [];
        } catch (e) {
            jugadores = [];
            localStorage.removeItem(claveAlmacenamientoJugadores);
        }

        jugadorActualId = localStorage.getItem(claveJugadorActual);
    }

    function guardar() {
        localStorage.setItem(claveAlmacenamientoJugadores, JSON.stringify(jugadores));

        if (jugadorActualId !== null) {
            localStorage.setItem(claveJugadorActual, jugadorActualId);
        } else {
            localStorage.removeItem(claveJugadorActual);
        }
    }

    function obtenerGrupoId() {
        let grupoId = localStorage.getItem(claveGrupoJugadores);

        if (!grupoId) {
            grupoId = generarId();
            localStorage.setItem(claveGrupoJugadores, grupoId);
        }

        return grupoId;
    }

    function obtenerTodos() {
        return jugadores;
    }

    function obtenerPorId(id) {
        return jugadores.find(function (jugador) {
            return jugador.id === id;
        });
    }

    function obtenerActual() {
        return obtenerPorId(jugadorActualId);
    }

    function obtenerNombre() {
        const jugador = obtenerActual();
        return jugador ? jugador.nickname : 'campeón';
    }

    function establecerActual(id) {
        jugadorActualId = id;
    }

    function crear(nombre, personaje, configuracion) {
        const nuevoJugador = {
            id: generarId(),
            grupoJugadoresId: obtenerGrupoId(),
            nickname: nombre || NOMBRE_PREDETERMINADO,
            personaje: personaje || PERSONAJE_PREDETERMINADO,
            puntaje: 0,
            totalPartidas: 0,
            configuracion: configuracion || {}
        };

        jugadores.push(nuevoJugador);
        return nuevoJugador;
    }

    function eliminar(id) {
        const eraActual = jugadorActualId === id;

        jugadores = jugadores.filter(function (jugador) {
            return jugador.id !== id;
        });

        if (eraActual) {
            jugadorActualId = null;
        }

        guardar();
        return eraActual;
    }

    function renombrarActual(nombre) {
        const jugador = obtenerActual();

        if (!jugador) {
            return;
        }

        jugador.nickname = nombre;
        guardar();
    }

    function reiniciarPuntaje(id) {
        const jugador = obtenerPorId(id);

        if (!jugador) {
            return;
        }

        jugador.puntaje = 0;
        guardar();
    }

    function obtenerConfiguracion(jugador, predeterminada) {
        return Object.assign(predeterminada || {}, jugador.configuracion || {});
    }

    // La configuración se fusiona para no borrar la que guardan otras páginas de práctica.
    function guardarEstadoActual(estado) {
        const jugador = obtenerActual();

        if (!jugador) {
            return;
        }

        jugador.personaje = estado.personaje;
        jugador.puntaje = estado.puntaje;
        jugador.totalPartidas = jugador.totalPartidas || 0;
        jugador.configuracion = Object.assign({}, jugador.configuracion || {}, estado.configuracion || {});
        guardar();
    }

    function registrarPartidaTerminada() {
        const jugador = obtenerActual();

        if (!jugador) {
            return;
        }

        jugador.totalPartidas = (jugador.totalPartidas || 0) + 1;
        guardar();
    }

    return {
        NOMBRE_PREDETERMINADO: NOMBRE_PREDETERMINADO,
        PERSONAJE_PREDETERMINADO: PERSONAJE_PREDETERMINADO,
        cargar: cargar,
        guardar: guardar,
        obtenerTodos: obtenerTodos,
        obtenerPorId: obtenerPorId,
        obtenerActual: obtenerActual,
        obtenerNombre: obtenerNombre,
        establecerActual: establecerActual,
        crear: crear,
        eliminar: eliminar,
        renombrarActual: renombrarActual,
        reiniciarPuntaje: reiniciarPuntaje,
        obtenerConfiguracion: obtenerConfiguracion,
        guardarEstadoActual: guardarEstadoActual,
        registrarPartidaTerminada: registrarPartidaTerminada
    };
})();
