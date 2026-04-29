from pydantic import BaseModel
from typing import Optional

# CLINICA PARA MAPA
class Clinica(BaseModel):
    id_clinica: Optional[int] = None
    nombre: str
    direccion: str
    ciudad: str
    latitud: float
    longitud: float
    telefono: Optional[str] = None
    tiene_24h: bool = False
    tiene_urgencias: bool = False
    valoracion: float = 0.0

# CLINICA PARA REGISTRO
class ClinicaRegistro(BaseModel):
    id_clinica: int
    nombre: str


# USUARIO / CLIENTE
class Usuario(BaseModel):
    firebase_uid: Optional[str] = None
    nombre: str
    email: Optional[str] = None


# CHAT
class Chat(BaseModel):
    uid: str
    nombre: str
    ultimoMensaje: Optional[str] = None
    hora: Optional[str] = None
    inicial: Optional[str] = None


# CITA
class Cita(BaseModel):
    id_cita: int
    fecha: str
    hora: str
    motivo: Optional[str] = None
    nombre_otro: str
    mascota_nombre: Optional[str] = None


# PRODUCTO
class Producto(BaseModel):
    id_producto: int
    id_clinica: int
    nombre: str
    categoria: Optional[str] = None
    descripcion: Optional[str] = None
    precio: float
    stock: int
    foto_url: Optional[str] = None
    clinica_nombre: Optional[str] = None


class ProductoCreate(BaseModel):
    id_clinica: int
    nombre: str
    categoria: str
    descripcion: str
    precio: float
    stock: int
    foto_url: str = None


# RESPUESTA GENÉRICA
class ApiResponse(BaseModel):
    status: str
    message: str
    id_producto: Optional[int] = None