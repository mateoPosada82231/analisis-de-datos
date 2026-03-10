"""
Configuration settings for the API-gobierno project.
Adjust DB_* variables to match your MySQL environment.
"""

# External dataset URL (datos.gov.co – IPS Habilitadas)
# Dataset page: https://www.datos.gov.co/Salud-y-Protecci-n-Social/IPS-Habilitadas/ugc5-acjp
API_URL = "https://www.datos.gov.co/resource/ugc5-acjp.json"
API_LIMIT = 5000  # max records to fetch per request

# MySQL connection settings
DB_HOST = "localhost"
DB_PORT = 3306
DB_USER = "root"
DB_PASSWORD = ""
DB_NAME = "gobierno_db"

API_TIMEOUT = 30  # seconds for HTTP requests to datos.gov.co

# API server settings (uvicorn)
API_HOST = "0.0.0.0"
API_PORT = 5000
API_RELOAD = False
