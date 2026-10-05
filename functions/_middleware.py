from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from .api.tasks import comments

app = FastAPI(title="API Sistema de Gestión Empresarial")

# Dependencia para inyectar la conexión de la base de datos D1
def get_db(request: Request):
    # 'request.state.env' es proporcionado por el runtime de Cloudflare Workers
    return request.state.env.DB

@app.middleware("http")
async def add_cloudflare_env(request: Request, call_next):
    # Aquí puedes manejar validaciones de tokens en un futuro
    response = await call_next(request)
    return response

from .api.auth import login
from .api.attendance import index as attendance
from .api.tasks import index as tasks
from .api.reports import index as reports

app.include_router(login.router)
app.include_router(attendance.router)
app.include_router(tasks.router)
app.include_router(comments.router)
app.include_router(reports.router)

# En Cloudflare Pages Functions, este manejador expone la app de FastAPI
def on_fetch(request, env):
    # Asignamos el env al estado para que FastAPI pueda leer `env.DB`
    import asgi
    return asgi.fetch(app, request, env)