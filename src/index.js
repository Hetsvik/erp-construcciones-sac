export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);

        // Interceptar solo la ruta de Login
        if (request.method === 'POST' && url.pathname === '/api/auth/login') {
            try {
                const data = await request.json();
                const { codigo, pin, es_admin } = data;
                let query = "";

                if (es_admin) {
                    query = `
                        SELECT 
                            A.Codigo_Administrador as Codigo, 
                            A.PIN_Acceso as PIN, 
                            E.Nombre_Completo as Nombre, 
                            R.Nombre_Rol as Rol
                        FROM Administrador A
                        JOIN Empleados E ON A.ID_Empleado = E.ID_Empleado
                        JOIN Roles_Sistema R ON A.ID_Rol = R.ID_Rol
                        WHERE A.Codigo_Administrador = ?
                    `;
                } else {
                    query = `
                        SELECT 
                            T.Codigo_Trabajador as Codigo, 
                            T.PIN_Acceso as PIN, 
                            E.Nombre_Completo as Nombre, 
                            R.Nombre_Rol as Rol
                        FROM Trabajadores T
                        JOIN Empleados E ON T.ID_Empleado = E.ID_Empleado
                        JOIN Roles_Sistema R ON T.ID_Rol = R.ID_Rol
                        WHERE T.Codigo_Trabajador = ?
                    `;
                }

                // Consultar a D1
                const usuario = await env.DB.prepare(query).bind(codigo).first();

                // Validaciones
                if (!usuario) {
                    return new Response(JSON.stringify({ detail: "Usuario no encontrado o rol incorrecto" }), {
                        status: 401, headers: { 'Content-Type': 'application/json' }
                    });
                }

                if (String(usuario.PIN) !== String(pin)) {
                    return new Response(JSON.stringify({ detail: "PIN incorrecto" }), {
                        status: 401, headers: { 'Content-Type': 'application/json' }
                    });
                }

                // Respuesta exitosa
                return new Response(JSON.stringify({
                    user: {
                        nombre: usuario.Nombre,
                        rol: usuario.Rol,
                        codigo: usuario.Codigo
                    }
                }), { status: 200, headers: { 'Content-Type': 'application/json' } });

            } catch (error) {
                return new Response(JSON.stringify({ detail: "Error interno del servidor" }), { status: 500 });
            }
        }

        // Para cualquier otra ruta (HTML, CSS, JS), Cloudflare sirve los archivos estáticos automáticamente
        return env.ASSETS.fetch(request);
    }
};