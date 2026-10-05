from fastapi import APIRouter, Depends
from typing import Any
from .._middleware import get_db

router = APIRouter()

@router.get("/api/reports/worker/{id_trabajador}/monthly")
async def get_monthly_report(id_trabajador: int, db: Any = Depends(get_db)):
    # Reporte de Asistencia Mensual
    query_asistencia = """
        SELECT 
            COUNT(ID_Asistencia) AS Total_Asistencias,
            SUM(CASE WHEN Estado_Asistencia = 'A tiempo' THEN 1 ELSE 0 END) AS Llegadas_Tiempo,
            SUM(CASE WHEN Estado_Asistencia = 'Tardanza' THEN 1 ELSE 0 END) AS Tardanzas
        FROM Asistencia
        WHERE ID_Trabajador = ? AND Fecha_Entrada >= DATE('now', '-1 month')
    """
    
    # Reporte de Tareas Mensual
    query_tareas = """
        SELECT 
            COUNT(ID_Tarea) AS Total_Tareas,
            SUM(CASE WHEN Estado_Tarea = 'Completada' THEN 1 ELSE 0 END) AS Tareas_Completadas
        FROM Tareas
        WHERE ID_Trabajador = ? AND Fecha >= DATE('now', '-1 month')
    """
    
    asistencia = await db.prepare(query_asistencia).bind(id_trabajador).first()
    tareas = await db.prepare(query_tareas).bind(id_trabajador).first()
    
    eficiencia = 0
    if tareas['Total_Tareas'] > 0:
        eficiencia = round((tareas['Tareas_Completadas'] / tareas['Total_Tareas']) * 100, 2)
        
    return {
        "periodo": "Último Mes",
        "asistencia": asistencia,
        "tareas": tareas,
        "eficiencia_porcentaje": eficiencia
    }