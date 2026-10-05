from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Any
from .._middleware import get_db

router = APIRouter()

class UpdateTaskStatus(BaseModel):
    estado: str # 'Asignada', 'En Progreso', 'Completada'
    observaciones: str = ""

@router.get("/api/tasks/worker/{id_trabajador}")
async def get_worker_tasks(id_trabajador: int, db: Any = Depends(get_db)):
    query = """
        SELECT t.ID_Tarea, t.Descripcion_Tarea, p.Nombre_Proyecto, t.Fecha_Entrega, t.Estado_Tarea, t.Observaciones
        FROM Tareas t
        JOIN Proyectos p ON t.ID_Proyecto = p.ID_Proyecto
        WHERE t.ID_Trabajador = ?
        ORDER BY t.Fecha_Entrega ASC
    """
    stmt = db.prepare(query)
    result = await stmt.bind(id_trabajador).all()
    return {"tasks": result.results}

@router.put("/api/tasks/{id_tarea}/status")
async def update_task_status(id_tarea: int, req: UpdateTaskStatus, db: Any = Depends(get_db)):
    query = "UPDATE Tareas SET Estado_Tarea = ?, Observaciones = ? WHERE ID_Tarea = ?"
    await db.prepare(query).bind(req.estado, req.observaciones, id_tarea).run()
    return {"status": "success", "message": "Estado de la tarea actualizado"}