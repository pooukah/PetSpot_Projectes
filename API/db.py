import mysql.connector

# db_config = {
#     'host': 'localhost',  
#     'user': 'petspot',
#     'password': 'PetSpot',
#     'database': 'petspot',
#     'collation': 'utf8mb4_general_ci'
# }

# def get_db_connection():
#     return mysql.connector.connect(**db_config)


import os

db_config = {
    'host': os.getenv('DB_HOST', 'mariadb'),  # ← usa variable de entorno
    'port': int(os.getenv('DB_PORT', 3306)),
    'user': os.getenv('DB_USER', 'petspot'),
    'password': os.getenv('DB_PASSWORD', 'PetSpot'),
    'database': os.getenv('DB_NAME', 'petspot'),
}

def get_db_connection():
    return mysql.connector.connect(**db_config)