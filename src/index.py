from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from workers import asgi

app = FastAPI()

class LoginData(BaseModel):
    codigo: str
    pin: str
    es_admin: bool

@app.post("/api/auth/login")
async def login(data: LoginData):
    # Aquí irá tu lógica real de conexión a la BD
    if data.codigo == "AD001" and data.pin == "1234":
        return {"user": {"nombre": "Admin", "rol": "admin"}}
    elif data.codigo == "EM0038" and data.pin == "1234":
        return {"user": {"nombre": "Empleado", "rol": "empleado"}}
    else:
        raise HTTPException(status_code=401, detail="Credenciales inválidas")

# Esta línea es OBLIGATORIA para que Cloudflare ejecute tu Python
Default = asgi.entrypoint(app)