FROM python:3.10-slim

# Exposa el port per HTTPS 
EXPOSE 443

WORKDIR /app

# Copia les dependències (dins del contenidor)
COPY API/requirements.txt /app/requirements.txt

# Instal·la dependències
RUN pip install --no-cache-dir -r requirements.txt

# Copia tota l'aplicació FastAPI dins el contenidor
COPY API /app/

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "443", "--ssl-keyfile", "/app/ssl/key.pem", "--ssl-certfile", "/app/ssl/cert.pem"]