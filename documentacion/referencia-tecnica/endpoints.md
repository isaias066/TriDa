# API Endpoints — TriDa (Sistema de Monitoreo de Transacciones con IA)

<!--
  ¿Qué? Documentación de referencia de todos los endpoints disponibles en la API.
  ¿Para qué? Servir como contrato entre frontend y backend, y guía de implementación.
  ¿Impacto? Cualquier cambio en la API debe reflejarse aquí antes (o simultáneamente)
  a la implementación.
-->

## Información General

| Campo | Valor |
|-------|-------|
| Base URL (desarrollo) | `http://localhost:5000` |
| Formato de datos | `application/json` |
| Autenticación | `Authorization: Bearer <token>` |
| Duración del token | 24 horas |

---

## Resumen de Endpoints

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| `POST` | `/api/auth/login` | No | Login y emisión de token JWT |
| `POST` | `/api/auth/register` | Sí (ADMINISTRADOR) | Registro de nuevo usuario del sistema |
| `POST` | `/api/auth/forgot-password` | No | Solicitar recuperación de contraseña |
| `GET` | `/api/auth/verify-reset-token` | No | Verificar validez de token de reset |
| `POST` | `/api/auth/reset-password` | No | Restablecer contraseña |
| `GET` | `/api/auth/usuarios-sistema` | Sí (ADMINISTRADOR) | Listar usuarios del sistema |
| `GET` | `/api/tareas` | No | Listar clientes |
| `GET` | `/api/transacciones` | No | Listar transacciones |
| `GET` | `/api/alertas` | No | Listar alertas |
| `GET` | `/api/dispositivos` | No | Listar dispositivos |
| `GET` | `/api/usuarios` | No | Listar usuarios por banco |
| `GET` | `/api/dashboard/stats` | No | Estadísticas del dashboard |
| `GET` | `/api/dashboard/alertas-recientes` | No | Alertas recientes |
| `GET` | `/api/analytics/metricas` | No | Métricas globales de detección |
| `GET` | `/api/analytics/agregaciones` | No | Agregaciones por tipo, ciudad, canal y banco |
| `GET` | `/api/mapa/stats` | No | Estadísticas geográficas |
| `GET` | `/api/mapa/ubicaciones` | No | Ubicaciones registradas |
| `GET` | `/api/bancos` | No | Catálogo de bancos |

---

## Autenticación — `/api/auth`

### `POST /api/auth/login`

Inicia sesión y retorna el token JWT junto con los datos del usuario.

**No requiere autenticación.**

**Body:**
```json
{ "email": "string", "password": "string" }
```

**Respuesta exitosa** (HTTP 200):
```json
{
  "token": "string",
  "user": {
    "id": "number",
    "nombre": "string",
    "email": "string",
    "rol": "string"
  }
}
```

**Errores:**

| Código | Descripción |
|--------|-------------|
| 400 | Email o contraseña no proporcionados |
| 401 | Credenciales inválidas |
| 403 | Cuenta desactivada |
| 500 | Error interno del servidor |

> ⚠️ Seguridad: el mensaje de error 401 no revela si el email existe.
> Siempre devuelve «Credenciales inválidas».

---

### `POST /api/auth/register`

Crea un nuevo usuario del sistema. Solo puede ser ejecutado por un
usuario con rol `ADMINISTRADOR`.

**Requiere autenticación** — `Authorization: Bearer <token>`

**Body:**
```json
{
  "nombre_completo": "string",
  "email": "string",
  "password": "string (mínimo 6 caracteres)",
  "rol": "ADMINISTRADOR | ANALISTA | OPERADOR | AUDITOR"
}
```

**Validaciones:**
- `nombre_completo`: requerido
- `email`: formato válido, requerido, único en el sistema
- `password`: mínimo 6 caracteres, requerido
- `rol`: debe ser uno de los cuatro valores permitidos

**Respuesta exitosa** (HTTP 201):
```json
{
  "message": "Usuario creado exitosamente",
  "user": {
    "id": "number",
    "nombre": "string",
    "email": "string",
    "rol": "string",
    "estado": "boolean"
  }
}
```

**Errores:**

| Código | Descripción |
|--------|-------------|
| 400 | Campos faltantes, contraseña corta o rol inválido |
| 401 | Token no proporcionado |
| 403 | Token inválido o usuario sin rol ADMINISTRADOR |
| 409 | Email ya registrado |
| 500 | Error interno del servidor |

---

### `POST /api/auth/forgot-password`

Solicita el envío de un email de recuperación de contraseña.

**No requiere autenticación.**

**Body:**
```json
{ "correo": "string" }
```

**Respuesta exitosa** (HTTP 200):
```json
{
  "message": "Si el correo existe, recibirás un enlace de recuperación en breve."
}
```

> ⚠️ Seguridad: la respuesta es idéntica tanto si el email existe como
> si no existe (anti-enumeración).

**Efecto cuando el email existe:**
- Genera un token JWT temporal con expiración de 15 minutos
- Envía email con enlace: `http://localhost:5173/reset-password?token=<token>`

**Errores:**

| Código | Descripción |
|--------|-------------|
| 400 | Correo no proporcionado |
| 500 | Error interno al procesar la solicitud |

---

### `GET /api/auth/verify-reset-token`

Verifica si un token de reset de contraseña es válido sin ejecutar
ningún cambio.

**No requiere autenticación.**

**Query param:**
```
/api/auth/verify-reset-token?token=<token>
```

**Respuesta exitosa** (HTTP 200):
```json
{ "valid": true, "email": "string" }
```

**Errores:**

| Código | Descripción |
|--------|-------------|
| 400 | Token no proporcionado |
| 401 | Token expirado o inválido |

---

### `POST /api/auth/reset-password`

Restablece la contraseña usando el token de recuperación recibido
por email.

**No requiere autenticación.**

**Body:**
```json
{
  "token": "string",
  "nuevaContrasena": "string (mínimo 6 caracteres)"
}
```

**Validaciones:**
- `token`: requerido, string
- `nuevaContrasena`: mínimo 6 caracteres, requerido
- El token debe tener `purpose: 'reset_password'`

**Respuesta exitosa** (HTTP 200):
```json
{
  "message": "¡Contraseña actualizada con éxito! Ya puedes iniciar sesión.",
  "email": "string"
}
```

**Errores:**

| Código | Descripción |
|--------|-------------|
| 400 | Token o contraseña no proporcionados, o contraseña muy corta |
| 401 | Token expirado o inválido |
| 404 | No se pudo actualizar la contraseña |
| 500 | Error interno del servidor |

---

### `GET /api/auth/usuarios-sistema`

Lista todos los usuarios del sistema.

**Requiere autenticación** — `Authorization: Bearer <token>`
**Requiere rol** — `ADMINISTRADOR`

**Respuesta exitosa** (HTTP 200):
```json
[
  {
    "id_usuario": "number",
    "nombre_completo": "string",
    "email": "string",
    "rol": "string",
    "estado": "boolean"
  }
]
```

**Errores:**

| Código | Descripción |
|--------|-------------|
| 401 | Token no proporcionado |
| 403 | Token inválido o usuario sin rol ADMINISTRADOR |
| 500 | Error interno del servidor |

---

## Clientes, Transacciones, Alertas y Dispositivos

### `GET /api/tareas`

Lista todos los clientes del sistema.

**No requiere autenticación.**

**Respuesta exitosa** (HTTP 200):
```json
[ { } ]
```

**Errores:**

| Código | Descripción |
|--------|-------------|
| 500 | Error interno del servidor |

---

### `GET /api/transacciones`

Lista transacciones del sistema, filtrable por banco.

**No requiere autenticación.**

**Query param opcional:**
```
?banco=bancolombia
```

**Respuesta exitosa** (HTTP 200):
```json
[ { } ]
```

**Errores:**

| Código | Descripción |
|--------|-------------|
| 500 | Error interno del servidor |

---

### `GET /api/alertas`

Lista alertas del sistema, filtrable por banco.

**No requiere autenticación.**

**Query param opcional:**
```
?banco=bancolombia
```

**Respuesta exitosa** (HTTP 200):
```json
[ { } ]
```

**Errores:**

| Código | Descripción |
|--------|-------------|
| 500 | Error interno del servidor |

---

### `GET /api/dispositivos`

Lista dispositivos del sistema, filtrable por banco.

**No requiere autenticación.**

**Query param opcional:**
```
?banco=bancolombia
```

**Respuesta exitosa** (HTTP 200):
```json
[ { } ]
```

**Errores:**

| Código | Descripción |
|--------|-------------|
| 500 | Error interno del servidor |

---

### `GET /api/usuarios`

Lista usuarios (clientes) del sistema, filtrable por banco.

**No requiere autenticación.**

**Query param opcional:**
```
?banco=bancolombia
```

**Respuesta exitosa** (HTTP 200):
```json
[ { } ]
```

**Errores:**

| Código | Descripción |
|--------|-------------|
| 500 | Error interno del servidor |

---

## Dashboard — `/api/dashboard`

### `GET /api/dashboard/stats`

Retorna las estadísticas generales del dashboard, filtrable por banco.

**No requiere autenticación.**

**Query param opcional:**
```
?banco=bancolombia
```

**Respuesta exitosa** (HTTP 200):
```json
{ }
```

**Errores:**

| Código | Descripción |
|--------|-------------|
| 500 | Error interno del servidor |

---

### `GET /api/dashboard/alertas-recientes`

Retorna las alertas más recientes del sistema, filtrable por banco.

**No requiere autenticación.**

**Query param opcional:**
```
?banco=bancolombia
```

**Respuesta exitosa** (HTTP 200):
```json
[ { } ]
```

**Errores:**

| Código | Descripción |
|--------|-------------|
| 500 | Error interno del servidor |

---

## Analytics — `/api/analytics`

### `GET /api/analytics/metricas`

Retorna métricas globales de detección de fraude, filtrable por banco.

**No requiere autenticación.**

**Query param opcional:**
```
?banco=bancolombia
```

**Respuesta exitosa** (HTTP 200):
```json
{ }
```

**Errores:**

| Código | Descripción |
|--------|-------------|
| 500 | Error interno del servidor |

---

### `GET /api/analytics/agregaciones`

Retorna agregaciones de transacciones por tipo, ciudad, canal y banco.
Las cuatro consultas se ejecutan en paralelo.

**No requiere autenticación.**

**Query param opcional:**
```
?banco=bancolombia
```

**Respuesta exitosa** (HTTP 200):
```json
{
  "porTipo":   [],
  "porCiudad": [],
  "porCanal":  [],
  "porBanco":  []
}
```

**Errores:**

| Código | Descripción |
|--------|-------------|
| 500 | Error interno del servidor |

---

## Mapa — `/api/mapa`

### `GET /api/mapa/stats`

Retorna estadísticas geográficas del sistema, filtrable por banco.

**No requiere autenticación.**

**Query param opcional:**
```
?banco=bancolombia
```

**Respuesta exitosa** (HTTP 200):
```json
{ }
```

**Errores:**

| Código | Descripción |
|--------|-------------|
| 500 | Error interno del servidor |

---

### `GET /api/mapa/ubicaciones`

Retorna las ubicaciones registradas en el sistema, filtrable por banco.

**No requiere autenticación.**

**Query param opcional:**
```
?banco=bancolombia
```

**Respuesta exitosa** (HTTP 200):
```json
[ { } ]
```

**Errores:**

| Código | Descripción |
|--------|-------------|
| 500 | Error interno del servidor |

---

## Catálogo de Bancos — `/api/bancos`

### `GET /api/bancos`

Retorna todos los bancos disponibles en el catálogo del sistema.

**No requiere autenticación.**

**Respuesta exitosa** (HTTP 200):
```json
[
  {
    "id_banco": "number",
    "codigo": "string",
    "nombre": "string",
    "color": "string",
    "estado": "boolean"
  }
]
```

**Errores:**

| Código | Descripción |
|--------|-------------|
| 500 | Error interno del servidor |

---

## Middlewares de Autenticación

| Middleware | Descripción |
|-----------|-------------|
| `verifyToken` | Verifica que el header `Authorization: Bearer <token>` sea válido. Retorna 401 si no hay token y 403 si es inválido o expirado |
| `requireAdmin` | Verifica que el usuario autenticado tenga rol `ADMINISTRADOR`. Retorna 403 si no cumple |

---

## Formato de Errores

Todos los errores siguen el formato estándar:

```json
{ "error": "Descripción legible del error" }
```

### Códigos de error

| HTTP | Descripción |
|------|-------------|
| 400 | Datos de entrada inválidos o faltantes |
| 401 | Token no proporcionado o credenciales inválidas |
| 403 | Sin permisos para este recurso |
| 404 | Recurso no encontrado |
| 409 | Conflicto — recurso ya existe |
| 500 | Error interno no anticipado |

---

## Rate Limiting

> En desarrollo

---

## Ejemplos con curl

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@trida.co","password":"Admin1234"}'
```

### Registrar usuario (requiere token de admin)
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"nombre_completo":"Ana López","email":"ana@trida.co","password":"Ana1234","rol":"ANALISTA"}'
```

### Solicitar recuperación de contraseña
```bash
curl -X POST http://localhost:5000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"correo":"admin@trida.co"}'
```

### Verificar token de reset
```bash
curl "http://localhost:5000/api/auth/verify-reset-token?token=<token>"
```

### Restablecer contraseña
```bash
curl -X POST http://localhost:5000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{"token":"<token>","nuevaContrasena":"NuevoPass123"}'
```

### Listar transacciones por banco
```bash
curl "http://localhost:5000/api/transacciones?banco=bancolombia"
```

### Obtener estadísticas del dashboard
```bash
curl "http://localhost:5000/api/dashboard/stats?banco=nequi"
```

### Obtener agregaciones de analytics
```bash
curl "http://localhost:5000/api/analytics/agregaciones?banco=davivienda"
```

### Listar todos los bancos
```bash
curl http://localhost:5000/api/bancos
```
