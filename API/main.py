from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import os
import mysql.connector



app = FastAPI()


# ENDPOINTS DE PRUEBA
@app.get("/")
def root():
    return {"message": "PETSPOT API funcionando"}

@app.get("/health")
def health():
    return {"status": "ok"}