window.MateAventuras = window.MateAventuras || {};

MateAventuras.sonidos = (function () {
    function obtenerContextoAudio() {
        if (!window._audioCtx || window._audioCtx.state === 'closed') {
            window._audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        return window._audioCtx;
    }

    function partidaTerminada() {
        try {
            const ctx = obtenerContextoAudio();
            const t = ctx.currentTime;
            const secuencia = [
                { freq: 523.25, inicio: 0.00 },
                { freq: 659.25, inicio: 0.12 },
                { freq: 783.99, inicio: 0.24 },
                { freq: 659.25, inicio: 0.36 },
                { freq: 1046.5, inicio: 0.48 },
                { freq: 1046.5, inicio: 0.62 },
                { freq: 1174.7, inicio: 0.76 }
            ];
            secuencia.forEach(function (nota) {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.value = nota.freq;
                gain.gain.setValueAtTime(0, t + nota.inicio);
                gain.gain.linearRampToValueAtTime(0.28, t + nota.inicio + 0.04);
                gain.gain.exponentialRampToValueAtTime(0.001, t + nota.inicio + 0.30);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(t + nota.inicio);
                osc.stop(t + nota.inicio + 0.31);
            });
        } catch (e) { /* audio no disponible */ }
    }

    function acierto() {
        try {
            const ctx = obtenerContextoAudio();
            const t = ctx.currentTime;
            const notas = [523.25, 659.25, 783.99, 1046.5];
            notas.forEach(function (freq, i) {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.value = freq;
                gain.gain.setValueAtTime(0, t + i * 0.10);
                gain.gain.linearRampToValueAtTime(0.22, t + i * 0.10 + 0.03);
                gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.10 + 0.25);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(t + i * 0.10);
                osc.stop(t + i * 0.10 + 0.26);
            });
        } catch (e) { /* audio no disponible */ }
    }

    function error() {
        try {
            const ctx = obtenerContextoAudio();
            const t = ctx.currentTime;
            const pasos = [
                { freq: 330, inicio: 0.00, fin: 0.18 },
                { freq: 277, inicio: 0.16, fin: 0.36 },
                { freq: 220, inicio: 0.32, fin: 0.55 }
            ];
            pasos.forEach(function (paso) {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sawtooth';
                osc.frequency.value = paso.freq;
                gain.gain.setValueAtTime(0.18, t + paso.inicio);
                gain.gain.exponentialRampToValueAtTime(0.001, t + paso.fin);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(t + paso.inicio);
                osc.stop(t + paso.fin);
            });
        } catch (e) { /* audio no disponible */ }
    }

    return {
        partidaTerminada: partidaTerminada,
        acierto: acierto,
        error: error
    };
})();
