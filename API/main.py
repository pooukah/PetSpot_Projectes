from fastapi import FastAPI, HTTPException, Header, Query
from fastapi.middleware.cors import CORSMiddleware
from db import get_db_connection
from models import Clinica, ClinicaRegistro, ClienteRegistro, VetRegistro, Login, NewProd, UserResponse, Mascota, MascotaCreate, Cita, CitaResponse
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

##################################################### 6. POST PRODUCT (vet)
@app.post("/productos", status_code=201)
def create_producto(producto: NewProd, x_user_email: str = Header(None)):
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
def get_mis_productos(x_user_email: str = Header(None)):
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
def update_producto(id_producto: int, producto: NewProd, x_user_email: str = Header(None)):
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
def delete_producto(id_producto: int, x_user_email: str = Header(None)):
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

##################################################### 14. OBTENER MASCOTAS DEL CLIENTE
@app.get("/api/mascotas/mis-mascotas")
def get_mis_mascotas(x_user_email: str = Header(None)):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        cursor.execute("SELECT id_cliente FROM cliente WHERE email = %s", (x_user_email,))
        cliente = cursor.fetchone()
        
        if not cliente:
            return [] 
        
        id_cliente = cliente['id_cliente']
        
        cursor.execute("""
            SELECT id_mascota, nombre, especie, raza, peso, fecha_nacimiento, microchip
            FROM mascota
            WHERE id_cliente = %s
            ORDER BY nombre ASC
        """, (id_cliente,))
        
        mascotas = cursor.fetchall()

        if len(mascotas) == 0:
            return []

        resultado = []
        for m in mascotas:
            especie = m['especie']
            if especie == 'Perro':
                icon_type = 'dog'
            elif especie == 'Gato':
                icon_type = 'cat'
            elif especie == 'Conejo':
                icon_type = 'rabbit'
            else:
                icon_type = 'rabbit' 
            
            resultado.append({
                "id": m['id_mascota'],
                "nombre": m['nombre'],
                "especie": especie,
                "raza": m['raza'],
                "peso": m['peso'],
                "nacimiento": m['fecha_nacimiento'].strftime('%d/%m/%Y') if m['fecha_nacimiento'] else '',
                "microchip": m['microchip'] or '',
                "type": icon_type
            })
        
        return resultado
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()

##################################################### 15. CREAR MASCOTA
@app.post("/api/mascotas/crear", status_code=201, response_model=dict)
def crear_mascota(mascota: dict, x_user_email: str = Header(None)):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        cursor.execute("SELECT id_cliente FROM cliente WHERE email = %s", (x_user_email,))
        cliente = cursor.fetchone()
        
        if not cliente:
            raise HTTPException(status_code=404, detail="Cliente no encontrado")
        
        id_cliente = cliente['id_cliente']
        
        cursor.execute("""
            INSERT INTO mascota 
            (id_cliente, nombre, especie, raza, peso, fecha_nacimiento, microchip)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """, (
            id_cliente,
            mascota.get('nombre'),
            mascota.get('especie'),
            mascota.get('raza'),
            mascota.get('peso'),
            mascota.get('fecha_nacimiento'),
            mascota.get('microchip')
        ))
        
        conn.commit()
        
        return {
            "id_mascota": cursor.lastrowid,
            "nombre": mascota.get('nombre'),
            "especie": mascota.get('especie'),
            "raza": mascota.get('raza'),
            "message": "Mascota creada correctamente"
        }
    
    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()

##################################################### BORRAR MASCOTA
@app.delete("/api/mascotas/{id_mascota}")
def eliminar_mascota(id_mascota: int, x_user_email: str = Header(None)):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            DELETE m FROM mascota m
            JOIN cliente c ON m.id_cliente = c.id_cliente
            WHERE m.id_mascota = %s AND c.email = %s
        """, (id_mascota, x_user_email))
        conn.commit()
        
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Mascota no encontrada")
        
        return {"message": "Mascota eliminada correctamente"}
    finally:
        cursor.close()
        conn.close()

##################################################### ACTUALIZAR MASCOTA (completo)
@app.put("/api/mascotas/{id_mascota}")
def actualizar_mascota(id_mascota: int, datos: dict, x_user_email: str = Header(None)):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            UPDATE mascota m
            JOIN cliente c ON m.id_cliente = c.id_cliente
            SET m.nombre = %s, m.especie = %s, m.raza = %s, m.peso = %s, 
                m.fecha_nacimiento = %s, m.microchip = %s
            WHERE m.id_mascota = %s AND c.email = %s
        """, (
            datos.get('nombre'),
            datos.get('especie'),
            datos.get('raza'),
            datos.get('peso'),
            datos.get('fecha_nacimiento'),
            datos.get('microchip'),
            id_mascota,
            x_user_email
        ))
        
        conn.commit()
        
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Mascota no encontrada")
        
        return {"message": "Mascota actualizada correctamente"}
    finally:
        cursor.close()
        conn.close()

##################################################### 16. CREAR CITA
@app.post("/api/citas/crear", status_code=201)
def crear_cita(cita: dict, x_user_email: str = Header(None)):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        cursor.execute("""
            SELECT id_cliente
            FROM cliente
            WHERE email = %s
        """, (x_user_email,))

        cliente = cursor.fetchone()

        if not cliente:
            raise HTTPException(status_code=404, detail="Cliente no encontrado")

        id_cliente = cliente['id_cliente']

        cursor.execute("""
            SELECT id_veterinario
            FROM veterinario
            WHERE id_veterinario = %s
        """, (cita.get('id_veterinario'),))

        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Veterinario no encontrado")

        cursor.execute("""
            SELECT id_mascota
            FROM mascota
            WHERE id_mascota = %s
              AND id_cliente = %s
        """, (
            cita.get('id_mascota'),
            id_cliente
        ))

        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Mascota no encontrada")

        cursor.execute("""
            INSERT INTO cita
            (id_cliente, id_veterinario, id_mascota, fecha, hora, motivo, estado)
            VALUES (%s, %s, %s, %s, %s, %s, 'pendiente')
        """, (
            id_cliente,
            cita.get('id_veterinario'),
            cita.get('id_mascota'),
            cita.get('fecha'),
            cita.get('hora'),
            cita.get('motivo')
        ))

        conn.commit()

        return {
            "message": "Cita creada correctamente",
            "id_cita": cursor.lastrowid
        }

    except HTTPException:
        raise

    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        cursor.close()
        conn.close()

##################################################### 17. OBTENER CITAS DEL CLIENTE
@app.get("/api/citas/mis-citas")
def get_citas_cliente(x_user_email: str = Header(None)):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        cursor.execute("""
            SELECT id_cliente
            FROM cliente
            WHERE email = %s
        """, (x_user_email,))

        cliente = cursor.fetchone()

        if not cliente:
            raise HTTPException(status_code=404, detail="Cliente no encontrado")

        id_cliente = cliente['id_cliente']

        cursor.execute("""
            SELECT
                c.id_cita,
                c.fecha,
                c.hora,
                c.motivo,
                c.estado,
                m.nombre AS mascota,
                CONCAT(v.nombre, ' ', v.apellidos) AS veterinario,
                cl.nombre AS clinica
            FROM cita c
            JOIN mascota m
                ON c.id_mascota = m.id_mascota
            JOIN veterinario v
                ON c.id_veterinario = v.id_veterinario
            JOIN clinica cl
                ON v.id_clinica = cl.id_clinica
            WHERE c.id_cliente = %s
            ORDER BY c.fecha ASC, c.hora ASC
        """, (id_cliente,))

        citas = cursor.fetchall()
        resultado = []
        for c in citas:
            resultado.append({
                "id": c["id_cita"],
                "hora": str(c["hora"]),
                "fecha": c["fecha"].strftime('%d/%m'),
                "fechaISO": str(c["fecha"]),
                "motivo": c["motivo"],
                "estado": c["estado"],
                "mascota": c["mascota"],
                "veterinario": c["veterinario"],
                "clinica": c["clinica"]
            })
        return resultado

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()

##################################################### 18. OBTENER CITAS DEL VETERINARIO
@app.get("/api/citas/veterinario/mis-citas")
def get_citas_veterinario(x_user_email: str = Header(None)):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        cursor.execute("""
            SELECT id_veterinario
            FROM veterinario
            WHERE email = %s
        """, (x_user_email,))

        vet = cursor.fetchone()

        if not vet:
            raise HTTPException(status_code=404, detail="Veterinario no encontrado")

        cursor.execute("""
            SELECT
                c.id_cita,
                c.fecha,
                c.hora,
                c.motivo,
                c.estado,
                CONCAT(cl.nombre, ' ', cl.apellidos) AS cliente_nombre,
                m.nombre AS mascota_nombre
            FROM cita c
            JOIN cliente cl
                ON c.id_cliente = cl.id_cliente
            JOIN mascota m
                ON c.id_mascota = m.id_mascota
            WHERE c.id_veterinario = %s
            ORDER BY c.fecha ASC, c.hora ASC
        """, (vet['id_veterinario'],))

        citas = cursor.fetchall()
        resultado = []
        for c in citas:
            resultado.append({
                "id_cita": c["id_cita"],
                "fecha": c["fecha"].strftime("%d/%m/%Y") if c["fecha"] else "",
                "hora": str(c["hora"]) if c["hora"] else "",
                "motivo": c["motivo"],
                "estado": c["estado"],
                "cliente_nombre": c["cliente_nombre"],
                "mascota_nombre": c["mascota_nombre"]
            })
        return resultado
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()

##################################################### BORRAR CITA
# @app.delete("/api/citas/{id_cita}")
# def eliminar_cita(id_cita: int, x_user_email: str = Header(None)):
#     conn = get_db_connection()
#     cursor = conn.cursor(dictionary=True)

#     try:
#         cursor.execute("""
#             DELETE c
#             FROM cita c
#             JOIN cliente cl ON c.id_cliente = cl.id_cliente
#             WHERE c.id_cita = %s
#               AND cl.email = %s
#         """, (id_cita, x_user_email))

#         conn.commit()

#         if cursor.rowcount == 0:
#             raise HTTPException(
#                 status_code=404,
#                 detail="Cita no encontrada"
#             )

#         return {"message": "Cita eliminada correctamente"}

#     except Exception as e:
#         conn.rollback()
#         raise HTTPException(status_code=500, detail=str(e))

#     finally:
#         cursor.close()
#         conn.close()
@app.delete("/api/citas/{id_cita}")
def eliminar_cita(id_cita: int, x_user_email: str = Header(None)):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        cursor.execute("""
            SELECT id_cliente, id_veterinario
            FROM cita
            WHERE id_cita = %s
        """, (id_cita,))
        
        cita = cursor.fetchone()

        if not cita:
            raise HTTPException(status_code=404, detail="Cita no encontrada")

        cursor.execute("""
            SELECT id_cliente
            FROM cliente
            WHERE email = %s
        """, (x_user_email,))
        cliente = cursor.fetchone()

        cursor.execute("""
            SELECT id_veterinario
            FROM veterinario
            WHERE email = %s
        """, (x_user_email,))
        vet = cursor.fetchone()

        permitido = False

        if cliente and cliente["id_cliente"] == cita["id_cliente"]:
            permitido = True
        if vet and vet["id_veterinario"] == cita["id_veterinario"]:
            permitido = True
        if not permitido:
            raise HTTPException(status_code=403, detail="No tienes permiso")

        cursor.execute("""
            DELETE FROM cita WHERE id_cita = %s
        """, (id_cita,))

        conn.commit()

        return {"message": "Cita eliminada correctamente"}

    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        cursor.close()
        conn.close()

##################################################### 19. ACTUALIZAR ESTADO DE CITA
@app.put("/api/citas/{id_cita}/estado", response_model=dict)
def actualizar_estado_cita(id_cita: int, datos: dict, x_user_email: str = Header(None)):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        estado = datos.get('estado')
        
        if estado not in ['pendiente', 'confirmada', 'completada', 'cancelada']:
            raise HTTPException(status_code=400, detail="Estado inválido")
        
        cursor.execute("""
            SELECT c.id_cita
            FROM cita c
            JOIN veterinario v ON c.id_veterinario = v.id_veterinario
            WHERE c.id_cita = %s AND v.email = %s
        """, (id_cita, x_user_email))
        
        if not cursor.fetchone():
            raise HTTPException(status_code=403, detail="No tienes permiso para actualizar esta cita")
        
        cursor.execute("""
            UPDATE cita 
            SET estado = %s
            WHERE id_cita = %s
        """, (estado, id_cita))
        
        conn.commit()
        
        return {
            "message": f"Cita actualizada a estado: {estado}",
            "id_cita": id_cita,
            "estado": estado
        }
    
    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()

##################################################### 20. COGER INFO PARA PERFIL (cliente)
@app.get("/auth/perfil/cliente/{email}")
def get_perfil_cliente(email: str):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("""
            SELECT c.nombre, c.apellidos, c.email, c.telefono,
                   c.direccion, c.codigo_postal,
                   cl.nombre as nombre_clinica
            FROM cliente c
            LEFT JOIN clinica cl ON c.id_clinica = cl.id_clinica
            WHERE c.email = %s
        """, (email,))
        data = cursor.fetchone()
        if not data:
            raise HTTPException(status_code=404, detail="Cliente no encontrado")
        return data
    finally:
        cursor.close()
        conn.close()

##################################################### 21. ACTUALIZAR PERFIL (cliente)
@app.put("/auth/perfil/cliente/{email}")
def update_perfil_cliente(email: str, datos: dict):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            UPDATE cliente 
            SET nombre = %s, apellidos = %s, telefono = %s, direccion = %s, codigo_postal = %s
            WHERE email = %s
        """, (
            datos.get('nombre'),
            datos.get('apellidos'),
            datos.get('telefono'),
            datos.get('direccion'),
            datos.get('codigo_postal'),
            email
        ))
        conn.commit()
        
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Cliente no encontrado")
            
        return {"message": "Perfil actualizado correctamente"}
    finally:
        cursor.close()
        conn.close()


##################################################### 22. CAMBIAR CONTRASEÑA (cliente)
@app.put("/auth/cambiar-password/{email}")
def cambiar_password(email: str, datos: dict, x_user_email: str = Header(None)):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        password_actual = datos.get('password_actual')
        password_nueva = datos.get('password_nueva')
        
        if email != x_user_email:
            raise HTTPException(status_code=403, detail="No autorizado")
        
        cursor.execute("SELECT password FROM cliente WHERE email = %s", (email,))
        user = cursor.fetchone()
        
        if not user:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")
        
        if user['password'] != password_actual:
            raise HTTPException(status_code=401, detail="Contraseña actual incorrecta")
        
        if len(password_nueva) < 6:
            raise HTTPException(status_code=400, detail="La nueva contraseña debe tener al menos 6 caracteres")
        
        cursor.execute("UPDATE cliente SET password = %s WHERE email = %s", (password_nueva, email))
        conn.commit()
        
        return {"message": "Contraseña actualizada correctamente"}
    
    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()

##################################################### OBTENER VETERINARIOS DE LA CLÍNICA DEL CLIENTE
@app.get("/api/veterinarios/mis-veterinarios")
def get_mis_veterinarios(x_user_email: str = Header(None)):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        cursor.execute("""
            SELECT id_clinica
            FROM cliente
            WHERE email = %s
        """, (x_user_email,))

        cliente = cursor.fetchone()

        if not cliente or not cliente['id_clinica']:
            return []

        id_clinica = cliente['id_clinica']

        cursor.execute("""
            SELECT 
                v.id_veterinario,
                v.nombre,
                v.apellidos,
                c.nombre as clinica
            FROM veterinario v
            JOIN clinica c 
                ON v.id_clinica = c.id_clinica
            WHERE v.id_clinica = %s
            ORDER BY v.nombre ASC
        """, (id_clinica,))

        veterinarios = cursor.fetchall()

        resultado = []

        for vet in veterinarios:
            resultado.append({
                "id": vet["id_veterinario"],
                "nombre": vet["nombre"],
                "apellidos": vet["apellidos"],
                "clinica": vet["clinica"]
            })

        return resultado

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        cursor.close()
        conn.close()