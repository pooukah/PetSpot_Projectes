from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from db import get_db_connection
from models import Clinica, ClinicaRegistro, ClienteRegistro, VetRegistro, Login
from typing import List

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],  
    allow_headers=["*"],  
)

##################################################### 1. REGISTRO DE CLIENTE
@app.post("/auth/registro/cliente", status_code=201)
def register_cliente(user: ClienteRegistro):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        cursor.execute("SELECT email FROM cliente WHERE email = %s", (user.email,))
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="El email ya está registrado")
        
        cursor.execute("SELECT email FROM veterinario WHERE email = %s", (user.email,))
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="El email ya está registrado")
        
        cursor.execute("""
            INSERT INTO cliente (nombre, apellidos, email, telefono, password)
            VALUES (%s, %s, %s, %s, %s)
        """, (user.nombre, user.apellidos, user.email, user.telefono, user.password))
        conn.commit()
        
        return {"message": "Cliente registrado correctamente", "email": user.email}
    
    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()

##################################################### 2. REGISTRO VETERINARIO
@app.post("/auth/registro/veterinario", status_code=201)
def register_veterinario(user: VetRegistro):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        cursor.execute("SELECT email FROM cliente WHERE email = %s", (user.email,))
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="El email ya está registrado")
        
        cursor.execute("SELECT email FROM veterinario WHERE email = %s", (user.email,))
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="El email ya está registrado")
        
        cursor.execute("SELECT id_clinica FROM clinica WHERE nombre = %s", (user.clinica,))
        clinica = cursor.fetchone()
        
        if not clinica:
            raise HTTPException(status_code=400, detail="La clínica no existe")
        
        cursor.execute("""
            INSERT INTO veterinario (nombre, apellidos, email, telefono, password, id_clinica)
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (user.nombre, user.apellidos, user.email, user.telefono, user.password, clinica['id_clinica']))
        conn.commit()
        
        return {"message": "Veterinario registrado correctamente", "email": user.email}
    
    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()

##################################################### 3. LOGIN
def get_user_by_email(email: str):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT id_cliente as id, nombre, email, password, 'cliente' as rol FROM cliente WHERE email = %s", (email,))
        user = cursor.fetchone()
        
        if not user:
            cursor.execute("SELECT id_veterinario as id, nombre, email, password, 'veterinario' as rol FROM veterinario WHERE email = %s", (email,))
            user = cursor.fetchone()
        
        return user
    finally:
        cursor.close()
        conn.close()

@app.post("/auth/login")
def login(user: Login):
    db_user = get_user_by_email(user.email)
    
    if not db_user:
        raise HTTPException(status_code=401, detail="Email o contraseña incorrectos")

    if db_user["rol"] != user.rol:  
        raise HTTPException(status_code=401, detail="Perfil incorrecto para este usuario")

    if user.password != db_user["password"]:
        raise HTTPException(status_code=401, detail="Email o contraseña incorrectos")

    return {
        "id": db_user["id"],
        "nombre": db_user["nombre"],
        "email": db_user["email"],
        "rol": db_user["rol"],
        "message": "Login exitoso"
    }

##################################################### 4. GET CLINICAS (registro)
@app.get("/clinicas/registro", response_model=List[ClinicaRegistro])
def get_clinicas_registro():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        cursor.execute("SELECT id_clinica, nombre FROM clinica ORDER BY nombre")
        clinicas = cursor.fetchall()
        return clinicas
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()

##################################################### 5. GET CLINICAS (mapa)
@app.get("/clinicas", response_model=List[Clinica])
def get_clinicas():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        cursor.execute("SELECT * FROM clinica")
        clinicas = cursor.fetchall()
        return clinicas
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()

##################################################### 6. GET INFO (cliente)
@app.get("/cliente/perfil")
def get_cliente_perfil(email: str):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT id_cliente as id, nombre, apellidos, email, telefono, direccion, codigo_postal FROM cliente WHERE email = %s", (email,))
        cliente = cursor.fetchone()
        
        if not cliente:
            raise HTTPException(status_code=404, detail="Cliente no encontrado")
        
        return cliente
    finally:
        cursor.close()
        conn.close()

##################################################### 6. ACTUALIZAR INFO (cliente)
@app.put("/cliente/perfil")
def update_cliente_perfil(
    email: str,  
    nombre: str,
    telefono: str = None,
    direccion: str = None,
    codigo_postal: str = None
):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            UPDATE cliente 
            SET nombre = %s, telefono = %s, direccion = %s, codigo_postal = %s
            WHERE email = %s
        """, (nombre, telefono, direccion, codigo_postal, email))
        conn.commit()
        
        return {"message": "Perfil actualizado correctamente"}
    finally:
        cursor.close()
        conn.close()