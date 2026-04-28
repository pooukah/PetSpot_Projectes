import mysql.connector

db_config = {
    'host': 'mariadb',
    'user': 'petspot',
    'password': 'PetSpot',
    'database': 'petspot',
    'collation': 'utf8mb4_general_ci'
}

def get_db_connection():
    return mysql.connector.connect(**db_config)