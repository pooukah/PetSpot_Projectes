from fastapi import FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from db import get_db_connection
from models import Clinica, ClinicaRegistro, Usuario, Chat, Cita, Producto, ApiResponse, ProductoCreate
from typing import List

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],  
    allow_headers=["*"],  
)

# PARA EL FIREBASE
def verificar_uid(x_user_uid: str = Header(...)) -> str:
    if not x_user_uid or len(x_user_uid) < 10:
        raise HTTPException(status_code=401, detail="UID inválido")
    return x_user_uid

# GET CLINICAS (registro)
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

# GET CLINICAS (mapa)
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

# Busca un usuario por email
@app.get("/usuario/buscar", response_model=Usuario)
def buscar_usuario_por_email(email: str):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        # Usamos LOWER para que no importe si escriben con mayúsculas
        query = "SELECT firebase_uid, nombre, email FROM cliente WHERE LOWER(email) = %s LIMIT 1"
        cursor.execute(query, (email.lower(),))
        
        # Obtenemos el primer resultado (si existe)
        usuario = cursor.fetchone()
        
        if not usuario:
            raise HTTPException(status_code=404, detail="No se encontró ningún usuario con ese email")
            
        return usuario
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()


@app.get("/chats/lista", response_model=List[Chat])
def get_lista_chats(mi_uid: str):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        # 1. Buscamos solo CLIENTES (quitamos la tabla clinica)
        # 2. Obtenemos el último mensaje intercambiado con cada uno
        query = """
            SELECT 
                c.firebase_uid as uid, 
                c.nombre, 
                (SELECT mensaje FROM mensajes 
                 WHERE (emisor_id = %s AND receptor_id = c.firebase_uid) 
                    OR (receptor_id = %s AND emisor_id = c.firebase_uid) 
                 ORDER BY fecha DESC LIMIT 1) as ultimo_mensaje,
                (SELECT fecha FROM mensajes 
                 WHERE (emisor_id = %s AND receptor_id = c.firebase_uid) 
                    OR (receptor_id = %s AND emisor_id = c.firebase_uid) 
                 ORDER BY fecha DESC LIMIT 1) as hora
            FROM cliente c
            WHERE c.firebase_uid != %s
        """
        
        cursor.execute(query, (mi_uid, mi_uid, mi_uid, mi_uid, mi_uid))
        resultados = cursor.fetchall()
        
        # Formateamos para que Android lo reciba perfecto
        lista_final = []
        for r in resultados:
            # Solo añadimos a la lista si hay un mensaje previo (chats activos)
            if r['ultimo_mensaje']:
                lista_final.append({
                    "uid": r['uid'],
                    "nombre": r['nombre'],
                    "ultimoMensaje": r['ultimo_mensaje'],
                    "hora": str(r['hora']) if r['hora'] else "",
                    "inicial": r['nombre'][0].upper() if r['nombre'] else "?"
                })
        
        return lista_final
        
    finally:
        cursor.close()
        conn.close()


@app.get("/citas/proximas", response_model=List[Cita])
def get_proximas_citas(mi_uid: str, es_veterinario: bool):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        if es_veterinario:
            # Si soy VETERINARIO: 
            # 1. Filtro por mi firebase_uid (en la tabla veterinario)
            # 2. Quiero ver el nombre del CLIENTE y de su MASCOTA
            query = """
                SELECT ci.id_cita, ci.fecha, ci.hora, ci.motivo, 
                       CONCAT(c.nombre, ' ', c.apellidos) as nombre_otro,
                       m.nombre as mascota_nombre
                FROM cita ci
                JOIN veterinario v ON ci.id_veterinario = v.id_veterinario
                JOIN cliente c ON ci.firebase_uid_cliente = c.firebase_uid
                JOIN mascota m ON ci.id_mascota = m.id_mascota
                WHERE v.firebase_uid = %s AND ci.fecha >= CURDATE()
                ORDER BY ci.fecha ASC, ci.hora ASC
            """
        else:
            # Si soy CLIENTE:
            # 1. Filtro por mi firebase_uid_cliente
            # 2. Quiero ver el nombre de la CLÍNICA donde tengo la cita
            query = """
                SELECT ci.id_cita, ci.fecha, ci.hora, ci.motivo, 
                       cl.nombre as nombre_otro,
                       m.nombre as mascota_nombre
                FROM cita ci
                JOIN veterinario v ON ci.id_veterinario = v.id_veterinario
                JOIN clinica cl ON v.id_clinica = cl.id_clinica
                JOIN mascota m ON ci.id_mascota = m.id_mascota
                WHERE ci.firebase_uid_cliente = %s AND ci.fecha >= CURDATE()
                ORDER BY ci.fecha ASC, ci.hora ASC
            """
        
        cursor.execute(query, (mi_uid,))
        citas = cursor.fetchall()
        
        # Formateamos fechas y horas para que no den error al enviar el JSON
        for c in citas:
            c['fecha'] = str(c['fecha'])
            c['hora'] = str(c['hora'])
            # Opcional: Combinar motivo con nombre de mascota para Android
            if c.get('mascota_nombre'):
                c['motivo'] = f"{c['mascota_nombre']}: {c['motivo']}"
            
        return citas

    finally:
        cursor.close()
        conn.close()

@app.get("/market/productos", response_model=List[Producto])
def get_productos(categoria: str = None):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        # Consulta base
        query = """
            SELECT p.*, cl.nombre as clinica_nombre 
            FROM producto p
            JOIN clinica cl ON p.id_clinica = cl.id_clinica
        """
        # Filtro opcional por categoría
        if categoria and categoria != "Todos":
            query += " WHERE p.categoria = %s"
            cursor.execute(query, (categoria,))
        else:
            cursor.execute(query)
            
        return cursor.fetchall()
    finally:
        cursor.close()
        conn.close()


@app.post("/productos", status_code=201, response_model=ApiResponse)
def crear_producto(producto: ProductoCreate):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        query = """
            INSERT INTO producto 
            (id_clinica, nombre, categoria, descripcion, precio, stock, foto_url)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """
        values = (
            producto.id_clinica,
            producto.nombre,
            producto.categoria,
            producto.descripcion,
            producto.precio,
            producto.stock,
            producto.foto_url
        )
        
        cursor.execute(query, values)
        conn.commit()
        
        return {
            "status": "success", 
            "message": "Producto publicado con éxito",
            "id_producto": cursor.lastrowid
        }
        
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Error al crear producto: {str(e)}")
    finally:
        cursor.close()
        conn.close()

