# API-gobierno


Estos son los pasos para correr el proyecto en otro PC:

### 1. Clonar el repositorio
```bash
git clone https://github.com/andres-lopez-g/API-gobierno.git
cd API-gobierno
```

### 2. Backend (Python + MySQL)

**Requisitos previos:** Python 3 y MySQL instalados.

```bash
# Crear la base de datos en MySQL
mysql -u root -e "CREATE DATABASE IF NOT EXISTS gobierno_db"

# Instalar dependencias de Python
pip install -r requirements.txt

# Cargar datos desde datos.gov.co a la base de datos
python extractor.py

# Iniciar la API (corre en http://localhost:5000)
python app.py
```

> Si tu MySQL tiene contraseña, editá config.py y poné tu password en `DB_PASSWORD`.

### 3. Frontend (React + Vite)

**Requisito previo:** Node.js instalado.

```bash
cd frontend

# Instalar dependencias
npm install

# Iniciar el servidor de desarrollo (corre en http://localhost:5173)
npm run dev
```

### Resumen rápido

| Paso | Comando |
|---|---|
| Clonar | `git clone https://github.com/andres-lopez-g/API-gobierno.git` |
| Deps backend | `pip install -r requirements.txt` |
| Cargar datos | `python extractor.py` |
| Iniciar API | `python app.py` |
| Deps frontend | `cd frontend && npm install` |
| Iniciar frontend | `npm run dev` |
