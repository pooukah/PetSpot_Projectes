from pydantic import BaseModel, EmailStr, validator
from typing import Optional
from datetime import datetime

# ============================================================
# REGISTRO CLIENTE 
# ============================================================

class ClienteRegister(BaseModel):
    nombre: str
    apellidos: str
    email: EmailStr
    telefono: Optional[str] = None
    password: str
    confirmar_password: str
    
    @validator('confirmar_password')
    def passwords_match(cls, v, values):
        if 'password' in values and v != values['password']:
            raise ValueError('Las contraseñas no coinciden')
        return v

# ============================================================
# REGISTRO VETERINARIO 
# ============================================================

class VeterinarioRegister(BaseModel):
    nombre: str
    apellidos: str
    email: EmailStr
    telefono: Optional[str] = None
    password: str
    confirmar_password: str
    id_clinica: int  # ← Obligatorio en el registro
    
    @validator('confirmar_password')
    def passwords_match(cls, v, values):
        if 'password' in values and v != values['password']:
            raise ValueError('Las contraseñas no coinciden')
        return v

# ============================================================
# LOGIN (igual para ambos)
# ============================================================

class UserLogin(BaseModel):
    email: EmailStr
    password: str

# ============================================================
# RESPUESTAS
# ============================================================

class UserResponse(BaseModel):
    id_persona: int
    nombre: str
    apellidos: str
    email: str
    telefono: Optional[str] = None
    rol: str
    id_clinica: Optional[int] = None  # Solo para veterinarios
    nombre_clinica: Optional[str] = None  # Para mostrar

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    rol: str
    id_persona: int
    nombre: str

# ============================================================
# CLÍNICA (para el selector del formulario)
# ============================================================

class ClinicaResponse(BaseModel):
    id_clinica: int
    nombre: str
    direccion: str
    ciudad: str

# ============================================================
# PERFIL (para editar después)
# ============================================================

class PerfilUpdate(BaseModel):
    telefono: Optional[str] = None
    direccion: Optional[str] = None
    ciudad: Optional[str] = None