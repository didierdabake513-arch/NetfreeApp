from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import users, ads, esim

app = FastAPI(title="Netfree API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router, prefix="/users", tags=["users"])
app.include_router(ads.router,   prefix="/ads",   tags=["ads"])
app.include_router(esim.router,  prefix="/esim",  tags=["esim"])

@app.get("/")
def root():
    return {"status": "Netfree API opérationnelle"}
