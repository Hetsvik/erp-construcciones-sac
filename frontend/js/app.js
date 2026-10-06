document.addEventListener('DOMContentLoaded', () => {
    // 1. Manejo del menú desplegable de la campana de notificaciones
    const bellIcon = document.getElementById('notification-bell');
    const notifDropdown = document.getElementById('notification-dropdown');

    if (bellIcon && notifDropdown) {
        bellIcon.addEventListener('click', (e) => {
            e.stopPropagation();
            notifDropdown.classList.toggle('active');
        });

        document.addEventListener('click', (e) => {
            if (!notifDropdown.contains(e.target) && !bellIcon.contains(e.target)) {
                notifDropdown.classList.remove('active');
            }
        });
    }

    // 2. Interacción con las 3 tarjetas principales (Asistencia, Tareas, Reportes)
    const actionBoxes = document.querySelectorAll('.action-box');
    actionBoxes.forEach(box => {
        box.addEventListener('click', () => {
            const actionName = box.querySelector('span').innerText;
            alert(`Pulsaste el botón para ir a: ${actionName}`);
            // Aquí en el futuro puedes poner: window.location.href = 'ruta.html';
        });
    });

    // 3. Interacción con los labels del menú lateral (Sidebar)
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            navLinks.forEach(l => l.classList.remove('is-active'));
            link.classList.add('is-active');
        });
    });

    // 4. Animación de las ondas doradas en el fondo
    const canvas = document.getElementById('gold-wave-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let width, height;
        let time = 0;

        function resizeCanvas() {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        }
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        function drawWaves() {
            ctx.clearRect(0, 0, width, height);

            for (let i = 0; i < 3; i++) {
                ctx.beginPath();
                ctx.moveTo(0, height / 2);

                for (let x = 0; x < width; x++) {
                    const waveHeight = 60 + (i * 20);
                    const waveLength = 0.003 + (i * 0.001);
                    const y = Math.sin(x * waveLength + time + i) * waveHeight + (height / 2) + (i * 40);
                    ctx.lineTo(x, y);
                }

                ctx.lineTo(width, height);
                ctx.lineTo(0, height);
                ctx.closePath();

                ctx.fillStyle = `rgba(212, 175, 55, ${0.03 + i * 0.02})`;
                ctx.fill();
            }

            time += 0.015;
            requestAnimationFrame(drawWaves);
        }

        drawWaves();
    }
});