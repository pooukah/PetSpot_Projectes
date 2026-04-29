import mysql.connector

db_config = {
    'host': 'localhost',  # Cambiado de 'mariadb' a 'localhost' para ejecutar desde tu PC
    'user': 'petspot',
    'password': 'PetSpot',
    'database': 'petspot',
    'collation': 'utf8mb4_general_ci'
}

def get_db_connection():
    return mysql.connector.connect(**db_config)