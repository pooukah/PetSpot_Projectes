from pydantic import BaseModel
from typing import Optional

########################################### CLINICA
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

########################################### CLIENTE

# PARA REGISTRO
class ClienteRegistro(BaseModel):
    nombre: str
    apellidos: str
    email: str
    telefono: str
    password: str


########################################### VETERINARIO

# PARA REGISTRO
class VetRegistro(BaseModel):
    nombre: str
    apellidos: str
    email: str
    telefono: str
    password: str
    clinica: str

########################################### AMBOS

# PARA LOGIN
class Login(BaseModel):
    email: str
    password: str
    rol: str

########################################### MARKETPLACE
# PARA CREAR UN PRODUCTO
class NewProd(BaseModel):
    nombre: str
    categoria: str
    precio: float
    stock: int

########################################### BÚSQUEDA
# PARA BUSCAR CLIENTES
class UserResponse(BaseModel):
    id: str
    nombre: str
    email: str
    telefono: Optional[str] = None
    es_veterinario: Optional[bool] = False

########################################### MASCOTAS
# PARA OBTENER MASCOTAS DEL CLIENTE
class Mascota(BaseModel):
    id_mascota: int
    nombre: str
    especie: str
    raza: Optional[str] = None
    peso: Optional[float] = None
    fecha_nacimiento: Optional[str] = None

# PARA CREAR MASCOTA
class MascotaCreate(BaseModel):
    firebase_uid: str
    nombre: str
    especie: str
    raza: Optional[str] = None
    peso: Optional[float] = None
    fecha_nacimiento: Optional[str] = None

########################################### CITAS
# PARA OBTENER Y CREAR CITAS
class Cita(BaseModel):
    id_cita: Optional[int] = None
    firebase_uid_cliente: str
    id_veterinario: int
    id_mascota: int
    fecha: str
    hora: str
    motivo: str
    estado: Optional[str] = "pendiente"
    nombre_otro: Optional[str] = None

# PARA RESPUESTA DE CITAS (lectura)
class CitaResponse(BaseModel):
    id_cita: int
    fecha: str
    hora: str
    motivo: str
    estado: str
    nombre_otro: str
    
