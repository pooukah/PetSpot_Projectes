import mysql.connector
import os

db_config = {
    'host': os.getenv('DB_HOST', 'mariadb'),
    'port': int(os.getenv('DB_PORT', 3306)),
    'user': os.getenv('DB_USER', 'petspot'),
    'password': os.getenv('DB_PASSWORD', 'PetSpot'),
    'database': os.getenv('DB_NAME', 'petspot'),
    'collation': 'utf8mb4_general_ci'
}

def get_db_connection():
    return mysql.connector.connect(**db_config)