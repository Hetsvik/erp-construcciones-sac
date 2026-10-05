from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Any
from .._middleware import get_db

router = APIRouter()

class LoginRequest(BaseModel):
    codigo: str
    pin: str
    es_admin: bool

@router.post("/api/auth/login")
async def login(req: LoginRequest, db: Any = Depends(get_db)):
    if req.es_admin:
        query = """
            SELECT a.ID_Administrador as id, e.Nombre_Completo as nombre, a.ID_Rol as rol
            FROM Administrador a
            JOIN Empleados e ON a.ID_Empleado    = e.ID_Empleado
            WHERE a.Codigo_Administrador = ? AND a.PIN_Acceso = ?
        """
    else:
        query = """
            SELECT t.ID_Trabajador as id, e.Nombre_Completo as nombre, t.ID_Rol as rol, t.Rol_Cargo as cargo
            FROM Trabajadores t
            JOIN Empleados e ON t.ID_Empleado = e.ID_Empleado
            WHERE t.Codigo_Trabajador = ? AND t.PIN_Acceso = ?
        """
        
    stmt = db.prepare(query)
    result = await stmt.bind(req.codigo, req.pin).first()

    if not result:
        raise HTTPException(status_code=401, detail="Código o PIN incorrecto")
        
    return {"status": "success", "user": result}