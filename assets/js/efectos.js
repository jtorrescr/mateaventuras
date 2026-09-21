window.MateAventuras = window.MateAventuras || {};

MateAventuras.efectos = (function () {
    let timeoutConfeti = null;
    let timeoutError = null;

    function volarMoneda(origenElemento, destinoElemento) {
        if (!origenElemento || !destinoElemento) {
            return;
        }

        const origenRect = origenElemento.getBoundingClientRect();
        const destinoRect = destinoElemento.getBoundingClientRect();

        const moneda = document.createElement('span');
        moneda.className = 'moneda-voladora';
        moneda.setAttribute('aria-hidden', 'true');
        moneda.textContent = '🪙';
        moneda.style.left = (origenRect.left + origenRect.width / 2) + 'px';
        moneda.style.top = (origenRect.top + origenRect.height / 2) + 'px';
        document.body.appendChild(moneda);

        requestAnimationFrame(function () {
            moneda.style.left = (destinoRect.left + destinoRect.width / 2) + 'px';
            moneda.style.top = (destinoRect.top + destinoRect.height / 2) + 'px';
            moneda.style.fontSize = '1rem';
            moneda.style.opacity = '0';
        });

        setTimeout(function () {
            moneda.remove();
        }, 750);
    }

    function establecerTextoOperacion(operacion, texto) {
        const textoElementoExistente = operacion.querySelector('.texto-operacion');
        const textoElemento = textoElementoExistente || document.createElement('span');
        textoElemento.className = 'texto-operacion';
        textoElemento.textContent = texto;

        operacion.textContent = '';
        operacion.appendChild(textoElemento);
    }

    function limpiarConfeti(operacion) {
        const capaActual = operacion.querySelector('.capa-confeti');
        if (capaActual) {
            capaActual.remove();
        }
    }

    function confeti(operacion) {
        const colores = ['#ef4444', '#f59e0b', '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899'];
        limpiarConfeti(operacion);

        const capaConfeti = document.createElement('div');
        capaConfeti.className = 'capa-confeti';

        for (let i = 0; i < 34; i += 1) {
            const pieza = document.createElement('span');
            pieza.className = 'pieza-confeti';
            pieza.style.left = Math.floor(Math.random() * 100) + '%';
            pieza.style.backgroundColor = colores[Math.floor(Math.random() * colores.length)];
            pieza.style.animationDuration = (0.72 + Math.random() * 0.35).toFixed(2) + 's';
            pieza.style.animationDelay = (Math.random() * 0.18).toFixed(2) + 's';
            pieza.style.transform = 'rotate(' + Math.floor(Math.random() * 360) + 'deg)';
            capaConfeti.appendChild(pieza);
        }

        operacion.appendChild(capaConfeti);

        if (timeoutConfeti !== null) {
            clearTimeout(timeoutConfeti);
        }

        timeoutConfeti = setTimeout(function () {
            limpiarConfeti(operacion);
            timeoutConfeti = null;
        }, 1150);
    }

    function temblorError(operacion) {
        operacion.classList.remove('operacion-incorrecta');
        void operacion.offsetWidth;
        operacion.classList.add('operacion-incorrecta');

        if (timeoutError !== null) {
            clearTimeout(timeoutError);
        }

        timeoutError = setTimeout(function () {
            operacion.classList.remove('operacion-incorrecta');
            timeoutError = null;
        }, 700);
    }

    return {
        volarMoneda: volarMoneda,
        establecerTextoOperacion: establecerTextoOperacion,
        confeti: confeti,
        temblorError: temblorError
    };
})();
