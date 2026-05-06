FROM python:3.10-slim

EXPOSE 443

WORKDIR /app

COPY API/requirements.txt /app/requirements.txt

RUN pip install --no-cache-dir -r requirements.txt

COPY API /app/

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "443", "--ssl-keyfile", "/app/ssl/key.pem", "--ssl-certfile", "/app/ssl/cert.pem"]