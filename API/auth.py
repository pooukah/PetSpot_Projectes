from fastapi import HTTPException, Header

def verificar_firebase_uid(x_user_uid: str = Header(...)) -> str:
    if not x_user_uid:
        raise HTTPException(status_code=401, detail="Falta el UID de usuario")
    
    if len(x_user_uid) < 10:
        raise HTTPException(status_code=401, detail="UID inválido")
    
    return x_user_uid