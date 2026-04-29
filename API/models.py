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

