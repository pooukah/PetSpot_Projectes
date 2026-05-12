from fastapi import FastAPI, HTTPException, Header, Query
from fastapi.middleware.cors import CORSMiddleware
from db import get_db_connection
from models import Clinica, ClinicaRegistro, ClienteRegistro, VetRegistro, Login, NewProd, UserResponse
from typing import List

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=False,
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

##################################################### 6. POST PRODUCT (vet)
@app.post("/productos", status_code=201)
def create_producto(producto: NewProd, x_user_email: str = Header(...)):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        cursor.execute("SELECT id_clinica FROM veterinario WHERE email = %s", (x_user_email,))
        vet = cursor.fetchone()
        
        if not vet:
            raise HTTPException(status_code=404, detail="Veterinario no encontrado")
        
        id_clinica = vet['id_clinica']
        
        cursor.execute("""
            INSERT INTO producto (nombre, categoria, precio, stock, id_clinica)
            VALUES (%s, %s, %s, %s, %s)
        """, (producto.nombre, producto.categoria, producto.precio, producto.stock, id_clinica))
        conn.commit()
        
        return {"message": "Producto creado correctamente", "id_producto": cursor.lastrowid}
    
    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()
 
##################################################### 7. GET PRODUCTS (vet)    
@app.get("/productos/mis-productos")
def get_mis_productos(x_user_email: str = Header(...)):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        cursor.execute("SELECT id_clinica FROM veterinario WHERE email = %s", (x_user_email,))
        vet = cursor.fetchone()
        
        if not vet:
            raise HTTPException(status_code=404, detail="Veterinario no encontrado")
        
        id_clinica = vet['id_clinica']
        
        cursor.execute("""
            SELECT id_producto, nombre, categoria, precio, stock, veces_vendido
            FROM producto 
            WHERE id_clinica = %s
            ORDER BY id_producto DESC
        """, (id_clinica,))
        
        return cursor.fetchall()
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()
 
##################################################### 8. UPDATE PRODUCT (vet)
@app.put("/productos/{id_producto}")
def update_producto(id_producto: int, producto: NewProd, x_user_email: str = Header(...)):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        cursor.execute("""
            SELECT p.id_producto
            FROM producto p
            JOIN veterinario v ON p.id_clinica = v.id_clinica
            WHERE p.id_producto = %s AND v.email = %s
        """, (id_producto, x_user_email))
        
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Producto no encontrado o no tienes permiso")
        
        cursor.execute("""
            UPDATE producto 
            SET nombre = %s, categoria = %s, precio = %s, stock = %s
            WHERE id_producto = %s
        """, (producto.nombre, producto.categoria, producto.precio, producto.stock, id_producto))
        conn.commit()
        
        return {"message": "Producto actualizado correctamente"}
    
    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()
 
##################################################### 9. DELETE PRODUCT (vet)
@app.delete("/productos/{id_producto}")
def delete_producto(id_producto: int, x_user_email: str = Header(...)):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        cursor.execute("""
            SELECT p.id_producto
            FROM producto p
            JOIN veterinario v ON p.id_clinica = v.id_clinica
            WHERE p.id_producto = %s AND v.email = %s
        """, (id_producto, x_user_email))
        
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Producto no encontrado o no tienes permiso")
        
        cursor.execute("DELETE FROM producto WHERE id_producto = %s", (id_producto,))
        conn.commit()
        
        return {"message": "Producto eliminado correctamente"}
    
    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()

##################################################### 10. GET TODAS LAS CUENTAS DE CLIENTES
@app.get("/cuentas/clientes", response_model=List[dict])
def get_cuentas_clientes():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        cursor.execute("""
            SELECT id_cliente, nombre, apellidos, email, telefono
            FROM cliente
            ORDER BY nombre ASC
        """)
        clientes = cursor.fetchall()
        return clientes
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()

##################################################### 11. GET TODAS LAS CUENTAS DE VETERINARIOS
@app.get("/cuentas/veterinarios", response_model=List[dict])
def get_cuentas_veterinarios():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        cursor.execute("""
            SELECT v.id_veterinario, v.nombre, v.apellidos, v.email, v.telefono, c.nombre as clinica
            FROM veterinario v
            JOIN clinica c ON v.id_clinica = c.id_clinica
            ORDER BY v.nombre ASC
        """)
        veterinarios = cursor.fetchall()
        return veterinarios
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()

##################################################### 12. BUSCAR CLIENTES POR EMAIL
@app.get("/api/usuarios/buscar-clientes", response_model=List[UserResponse])
def buscar_clientes(query: str = Query(..., min_length=1)):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        cursor.execute("""
            SELECT id_cliente as id, nombre, email, telefono
            FROM cliente
            WHERE email LIKE %s OR nombre LIKE %s
            ORDER BY nombre ASC
            LIMIT 10
        """, (f"%{query}%", f"%{query}%"))
        
        clientes = cursor.fetchall()
        return clientes
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()


