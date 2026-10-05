from fastapi import FastAPI, HTTPException, Request
from pydantic import BaseModel
from workers import asgi

app = FastAPI()

class LoginData(BaseModel):
    codigo: str
    pin: str
    es_admin: bool

@app.post("/api/auth/login")
async def login(request: Request, data: LoginData):
    # 1. Obtener el entorno de Cloudflare desde la petición
    env = request.scope.get("env")
    if not env or not hasattr(env, "DB"):
        raise HTTPException(status_code=500, detail="Base de datos no vinculada")
    
    db = env.DB

    # 2. Consultar la base de datos D1
    # Asumiendo que tu tabla en schema.sql se llama 'users' 
    # y tiene las columnas 'codigo', 'pin', 'nombre', 'rol'
    query = "SELECT * FROM users WHERE codigo = ?"
    
    # Preparar la consulta, vincular el parámetro (evita inyecciones SQL) y obtener el primer resultado
    stmt = db.prepare(query).bind(data.codigo)
    usuario_js = await stmt.first()

    # 3. Validar si el usuario existe
    if not usuario_js:
        raise HTTPException(status_code=401, detail="Usuario no encontrado")

    # 4. Convertir el objeto de JavaScript (JsProxy) a un diccionario de Python
    usuario = usuario_js.to_py()

    # 5. Validar el PIN
    # Nota: Si el PIN en la BD es un número, lo pasamos a string para compararlo
    if str(usuario.get("pin")) != data.pin:
        raise HTTPException(status_code=401, detail="PIN incorrecto")

    # 6. Validar los permisos de Administrador si se marcó la casilla
    # Asumimos que tu base de datos guarda roles como 'admin' o 'empleado'
    rol_bd = usuario.get("rol", "empleado").lower()
    if data.es_admin and rol_bd != "admin":
        raise HTTPException(status_code=403, detail="No tienes permisos de administrador")

    # 7. Respuesta exitosa
    return {
        "user": {
            "nombre": usuario.get("nombre", "Usuario"),
            "rol": rol_bd,
            "codigo": usuario.get("codigo")
        }
    }

# Exportación obligatoria para Cloudflare Workers
Default = asgi.entrypoint(app)