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