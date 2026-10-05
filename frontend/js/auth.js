document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('login-form');
    const mensajeError = document.getElementById('login-message');

    form.addEventListener('submit', async (e) => {
        e.preventDefault(); // Evita que la página se recargue

        const role = document.getElementById('login-role').value;
        const codigo = document.getElementById('login-code').value;
        const pin = document.getElementById('login-pin').value;
        const esAdmin = role === 'admin';

        // Ocultar mensaje de error previo
        mensajeError.style.display = 'none';

        try {
            // Llamada a tu backend en Python (Cloudflare Pages Functions)
            const respuesta = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    codigo: codigo,
                    pin: pin,
                    es_admin: esAdmin
                })
            });

            const datos = await respuesta.json();

            if (respuesta.ok) {
                // Login exitoso: Guardar datos y redirigir
                localStorage.setItem('usuario_actual', JSON.stringify(datos.user));

                if (esAdmin) {
                    window.location.href = '/dashboard-admin.html'; // Cambia esta ruta a la de tu dashboard real
                } else {
                    window.location.href = '/dashboard-empleado.html'; // Cambia esta ruta a la de tu dashboard real
                }
            } else {
                // Mostrar error
                mensajeError.textContent = datos.detail || "Error al iniciar sesión";
                mensajeError.style.display = 'block';
                mensajeError.style.color = 'red';
            }
        } catch (error) {
            console.error("Error de conexión:", error);
            mensajeError.textContent = "Error al conectar con el servidor.";
            mensajeError.style.display = 'block';
            mensajeError.style.color = 'red';
        }
    });
});