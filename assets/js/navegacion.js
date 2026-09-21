window.MateAventuras = window.MateAventuras || {};

MateAventuras.navegacion = (function () {
    function iniciarMenuHamburguesa() {
        const btnMenuHamburguesa = document.getElementById('btnMenuHamburguesa');
        const navPrincipal = document.getElementById('navPrincipal');

        if (!btnMenuHamburguesa || !navPrincipal) {
            return;
        }

        btnMenuHamburguesa.addEventListener('click', function () {
            const estaAbierto = !navPrincipal.classList.contains('hidden');
            navPrincipal.classList.toggle('hidden', estaAbierto);
            btnMenuHamburguesa.setAttribute('aria-expanded', estaAbierto ? 'false' : 'true');
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', iniciarMenuHamburguesa);
    } else {
        iniciarMenuHamburguesa();
    }

    return {};
})();
