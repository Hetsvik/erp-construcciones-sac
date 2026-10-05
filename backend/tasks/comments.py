from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Any
from .._middleware import get_db

router = APIRouter()

class CommentCreate(BaseModel):
    autor: str
    rol: str # 'Administrador' o 'Empleado'
    mensaje: str

@router.get("/api/tasks/{id_tarea}/comments")
async def get_task_comments(id_tarea: int, db: Any = Depends(get_db)):
    query = "SELECT Autor, Rol, Mensaje, Fecha FROM Comentarios_Tarea WHERE ID_Tarea = ? ORDER BY Fecha ASC"
    result = await db.prepare(query).bind(id_tarea).all()
    return {"comments": result.results}

@router.post("/api/tasks/{id_tarea}/comments")
async def add_task_comment(id_tarea: int, comment: CommentCreate, db: Any = Depends(get_db)):
    query = """
        INSERT INTO Comentarios_Tarea (ID_Tarea, Autor, Rol, Mensaje) 
        VALUES (?, ?, ?, ?)
    """
    await db.prepare(query).bind(id_tarea, comment.autor, comment.rol, comment.mensaje).run()
    return {"status": "success", "message": "Comentario añadido"}