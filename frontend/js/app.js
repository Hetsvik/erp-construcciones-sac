/* ===================================================
   1. ANIMACIÓN DE ONDAS DORADAS (Canvas Background)
=================================================== */
const canvas = document.getElementById('gold-wave-canvas');
const ctx = canvas.getContext('2d');

let width, height;
let step = 0;

function resizeCanvas() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function drawGoldWaves() {
    ctx.clearRect(0, 0, width, height);

    const lines = 5;
    for (let i = 0; i < lines; i++) {
        ctx.beginPath();
        ctx.lineWidth = 1.5;

        // Gradiente de oro con transparencia variable
        const gradient = ctx.createLinearGradient(0, 0, width, 0);
        gradient.addColorStop(0, 'rgba(212, 175, 55, 0)');
        gradient.addColorStop(0.5, `rgba(243, 229, 171, ${0.15 + i * 0.05})`);
        gradient.addColorStop(1, 'rgba(212, 175, 55, 0)');

        ctx.strokeStyle = gradient;

        for (let x = 0; x < width; x += 10) {
            const y = Math.sin((x * 0.003) + (step * 0.015) + (i * 0.8)) * (40 + i * 15)
                + Math.cos((x * 0.001) + (step * 0.01)) * 30
                + (height * 0.5) + (i * 20 - 40);

            if (x === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.stroke();
    }

    step += 1;
    requestAnimationFrame(drawGoldWaves);
}

// Iniciar animación al cargar página
window.addEventListener('load', () => {
    drawGoldWaves();
});

/* ===================================================
   2. NAVEGACIÓN Y CAMBIO DE VISTAS
=================================================== */
function switchView(viewId, triggerBtn) {
    // Ocultar todas las secciones activas
    const views = document.querySelectorAll('.view-panel');
    views.forEach(v => v.classList.remove('active'));

    // Desactivar estado activo de botones del menú
    const navLinks = document.querySelectorAll('.sidebar-nav .nav-link');
    navLinks.forEach(l => l.classList.remove('is-active'));

    // Activar vista destino
    const targetView = document.getElementById('view-' + viewId);
    if (targetView) {
        targetView.classList.add('active');
    }

    // Marcar botón activo en la navegación
    if (triggerBtn) {
        triggerBtn.classList.add('is-active');
    } else {
        const matchBtn = Array.from(navLinks).find(btn =>
            btn.getAttribute('onclick') && btn.getAttribute('onclick').includes(viewId)
        );
        if (matchBtn) matchBtn.classList.add('is-active');
    }

    // Actualizar el título en la barra superior
    const titleElem = document.getElementById('view-title');
    if (titleElem) {
        titleElem.textContent = viewId.toUpperCase();
    }

    // Cerrar el menú desplegable en dispositivos móviles
    const sidebar = document.getElementById('sidebar');
    if (sidebar) sidebar.classList.remove('open');
}

function navigateToSection(sectionId) {
    switchView(sectionId, null);
}

/* ===================================================
   3. MENÚ EMERGENTE DE NOTIFICACIONES
=================================================== */
function toggleNotifications() {
    const popup = document.getElementById('notifications-popup');
    if (popup) popup.classList.toggle('show');
}

function clearNotifs() {
    const badge = document.querySelector('.bell-badge');
    if (badge) badge.style.display = 'none';
    showToast('Notificaciones marcadas como leídas');
}

// Ocultar popover de notificaciones si se hace clic afuera
document.addEventListener('click', function (e) {
    const wrapper = document.querySelector('.notification-wrapper');
    const popup = document.getElementById('notifications-popup');
    if (wrapper && popup && !wrapper.contains(e.target)) {
        popup.classList.remove('show');
    }
});

/* ===================================================
   4. FUNCIONALIDADES DE SOPORTE Y UI
=================================================== */
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) sidebar.classList.toggle('open');
}

function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-5 right-5 bg-zinc-900 border border-amber-500/40 text-amber-200 px-4 py-3 rounded-lg shadow-2xl z-50 text-sm flex items-center gap-2 animate-bounce';
    toast.innerHTML = `<i class="fa-solid fa-circle-check text-amber-400"></i> ${message}`;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

