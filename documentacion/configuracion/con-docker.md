# Guía de Despliegue con Docker

Esta guía explica cómo ejecutar todo el entorno de la aplicación (**BackEnd**, **FrontEnd** y **Base de Datos PostgreSQL**) utilizando **Docker** y **Docker Compose**.

## Requisitos Previos

Asegúrate de tener instalado en tu sistema:
- [Docker Desktop](https://www.docker.com/) (en Windows/Mac) o **Docker Engine** + **Docker Compose** (en Linux).

---

## Pasos para Ejecutar el Proyecto

### 1. Clonar el Repositorio
```
bash
git clone https://github.com/isaias066/TriDa
cd PROYECTO_TRIDA
Verifica que las credenciales del archivo docker-compose.yml coincidan con tus necesidades o crea un archivo .env en la raíz si es necesario.

3. Construir y Levantar los Contenedores
Abre una terminal en la raíz del proyecto y ejecuta:

Bash
docker compose up --build
(En sistemas Linux puede requerir permisos de superusuario: sudo docker compose up --build).

Este comando se encargará de:

Descargar la imagen de PostgreSQL 15.

Crear los contenedores e instalar automáticamente las dependencias de Node.js.

Iniciar el servidor backend y la aplicación frontend.

Puertos y Accesos
Una vez iniciados los servicios, puedes acceder a:

FrontEnd (React): http://localhost:5173

BackEnd API (Express): http://localhost:3000

Base de Datos (PostgreSQL): localhost:5432

Detener el Proyecto
Para detener todos los servicios y liberar los puertos, presiona Ctrl + C en la terminal o ejecuta: docker compose down
```
Bash
docker compose down
