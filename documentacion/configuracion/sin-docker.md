##  Guía de Despliegue Local (Sin Docker)

Esta guía explica cómo configurar y ejecutar **TriDa** de forma local, instalando manualmente todas las dependencias necesarias en el sistema operativo.

---

##  Requisitos Previos

Antes de comenzar, verifica que tienes instalado:

- **Node.js** 22 LTS o superior
- **pnpm**
- **PostgreSQL 17**
- **pgAdmin 4** (opcional, recomendado)
- **Git**

Puedes verificar las versiones con:

```bash
node -v
pnpm -v
psql --version
git --version
```

---

##  1. Configurar PostgreSQL

1. Abre **pgAdmin 4** o la terminal de PostgreSQL (`psql`).
2. Crea una nueva base de datos:

```sql
CREATE DATABASE trida_db;
```

3. Verifica el usuario y contraseña de PostgreSQL (por defecto suele ser `postgres`).

---

##  2. Configurar el Backend

Abre una terminal y ubícate en la carpeta del backend:

```bash
cd backend
```

### Instalar dependencias

```bash
pnpm install
```

### Configurar variables de entorno

Crea un archivo `.env` con el siguiente contenido:

```env
PORT=3000

DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=tu_contraseña
DB_NAME=trida_db

JWT_SECRET=tu_clave_secreta
```

### Ejecutar el servidor

```bash
pnpm dev
```

La API estará disponible en:

```text
http://localhost:3000
```

---

##  3. Configurar el Frontend

Abre una nueva terminal.

Ubícate en la carpeta del frontend:

```bash
cd frontend
```

### Instalar dependencias

```bash
pnpm install
```

### Ejecutar el proyecto

```bash
pnpm dev
```

La aplicación estará disponible en:

```text
http://localhost:5173
```

---

##  Puertos Utilizados

| Servicio | Puerto | URL |
|----------|:------:|-----|
| Backend (Express) | **3000** | http://localhost:3000 |
| Frontend (React + Vite) | **5173** | http://localhost:5173 |
| PostgreSQL | **5432** | localhost:5432 |

---

## ✅ Verificación

Si todo está configurado correctamente:

- ✅ PostgreSQL se encuentra en ejecución.
- ✅ El backend inicia sin errores.
- ✅ El frontend carga correctamente en el navegador.
- ✅ El frontend puede consumir la API del backend.

---

##  Solución de Problemas

### Error: `pnpm: command not found`

Instala **pnpm**:

```bash
npm install -g pnpm
```

---

### Error de conexión a PostgreSQL

Verifica que:

- PostgreSQL esté en ejecución.
- La base de datos `trida_db` exista.
- Las credenciales del archivo `.env` sean correctas.

---

### El puerto ya está en uso

Verifica qué proceso está utilizando el puerto correspondiente o cambia el valor de `PORT` en el archivo `.env`.

---

> **Nota:** Esta guía corresponde a la ejecución local de **TriDa** sin contenedores. Para un entorno reproducible y más cercano a producción, consulta la guía de despliegue con **Docker Compose**.
