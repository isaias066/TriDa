
```markdown
# 💻 Guía de Despliegue Local (Sin Docker)

Esta guía explica cómo configurar y ejecutar el proyecto manualmente de forma local instalando cada entorno de ejecución directamente en el sistema operativo.

## 📋 Requisitos Previos

Debes contar con las siguientes herramientas instaladas localmente:
- **Node.js** (Versión 18 o superior)
- **PostgreSQL** y **pgAdmin 4**
- **Git**

---

## Pasos para Ejecutar el Proyecto

### 1. Configurar la Base de Datos PostgreSQL
1. Abre **pgAdmin** o la terminal de PostgreSQL (`psql`).
2. Crea una nueva base de datos llamada `trida_db` (o el nombre configurado en el proyecto).
3. Asegúrate de recordar el usuario (`postgres`) y la contraseña configurada.

---

### 2. Configurar y Levantar el BackEnd (Express)

1. Abre una terminal y navega hasta la carpeta del backend:
   ```bash
   cd BackEnd
Instala las dependencias necesarias:

Bash
npm install
Crea un archivo .env en la carpeta BackEnd/ con la siguiente estructura:

Fragmento de código
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=tu_contraseña
DB_NAME=trida_db
Inicia el servidor backend:

Bash
npm start
# O si usas nodemon: npm run dev
3. Configurar y Levantar el FrontEnd (React)
Abre una nueva terminal y navega hasta la carpeta del frontend:

Bash
cd FrontEnd
Instala las dependencias:

Bash
npm install
Inicia el servidor de desarrollo de React:

Bash
npm run dev
Puertos y Accesos
FrontEnd: http://localhost:5173

BackEnd: http://localhost:3000


---

¡Con esto tus archivos `.md` quedarán súper organizados y profesionales para que el docente o tu equ
