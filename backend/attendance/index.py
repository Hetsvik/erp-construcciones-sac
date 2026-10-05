from fastapi import APIRouter, Depends, HTTPException
from typing import Any
from datetime import datetime
from .._middleware import get_db

router = APIRouter()

@router.post("/api/attendance/check-in/{id_trabajador}")
async def check_in(id_trabajador: int, db: Any = Depends(get_db)):
    # Verificar si ya hizo check-in hoy (aprovechando la columna Fecha_Calculada)
    fecha_hoy = datetime.utcnow().strftime('%Y-%m-%d')
    check_query = "SELECT ID_Asistencia FROM Asistencia WHERE ID_Trabajador = ? AND Fecha_Calculada = ?"
    existe = await db.prepare(check_query).bind(id_trabajador, fecha_hoy).first()
    
    if existe:
        raise HTTPException(status_code=400, detail="El trabajador ya registró su entrada hoy.")
        
    query = "INSERT INTO Asistencia (ID_Trabajador, Fecha_Entrada) VALUES (?, datetime('now', 'localtime'))"
    await db.prepare(query).bind(id_trabajador).run()
    
    return {"status": "success", "message": "Entrada registrada exitosamente"}

@router.put("/api/attendance/check-out/{id_trabajador}")
async def check_out(id_trabajador: int, db: Any = Depends(get_db)):
    fecha_hoy = datetime.utcnow().strftime('%Y-%m-%d')
    query = """
        UPDATE Asistencia 
        SET Fecha_Salida = datetime('now', 'localtime') 
        WHERE ID_Trabajador = ? AND Fecha_Calculada = ? AND Fecha_Salida IS NULL
    """
    result = await db.prepare(query).bind(id_trabajador, fecha_hoy).run()
    
    if result.meta.changes == 0:
        raise HTTPException(status_code=404, detail="No se encontró un registro de entrada abierto para hoy.")
        
    return {"status": "success", "message": "Salida registrada exitosamente"}