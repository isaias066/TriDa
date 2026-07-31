# Patrones Arquitectónicos — TriDa (Sistema de Monitoreo de Transacciones con IA)

<!--
  ¿Qué? Documento de patrones arquitectónicos implementados en TriDa.
  ¿Para qué? Explicar las decisiones de diseño que gobiernan la estructura
  del código y facilitar la contribución correcta al proyecto.
  ¿Impacto? Entender estos patrones es prerequisito para modificar o extender
  cualquier capa del sistema sin romper la arquitectura establecida.
-->

---

## 1. Patrón de Capas — Router / Controller / Service / DB

TriDa implementa una arquitectura en capas con responsabilidades claras
y separadas. El Núcleo TriDa actúa como orquestador central que coordina
los servicios sin procesar directamente ninguna señal individual.

```
HTTP Request
    │
    ▼
[Router]         → Define la ruta y aplica middlewares
    │               No contiene lógica de negocio
    ▼
[Controller]     → Extrae datos de req (body, params, user)
    │               Llama al service correspondiente
    │               Construye y envía la respuesta HTTP
    │               NO contiene lógica de negocio
    ▼
[NÚCLEO TRIDA]   → Orquestador central del flujo de detección
    │               Coordina servicios especializados
    │               Agrega resultados y produce la decisión final
    │               Evita dispersión de lógica entre múltiples servicios
    ▼
[Service]        → Contiene la lógica de negocio específica de cada módulo
    │               Orquesta llamadas a la BD y servicios externos
    │               Lanza errores tipados ante condiciones inválidas
    ▼
[pg Pool / BD]   → Consultas a PostgreSQL a través de funciones del schema trida
                   Nunca SQL crudo directo sobre las tablas
```

### Módulos del sistema

| Módulo | Responsabilidad | Independencia |
|--------|----------------|---------------|
| **Ingesta** | Recepción de transacciones | Puede fallar sin afectar otros módulos |
| **Enriquecimiento** | Consulta historial y contexto del cliente | Cache local en caso de fallo de BD |
| **IA / Adapter** | Análisis y cálculo de score vía Gemini API | Usa Adapter Pattern — proveedor intercambiable |
| **Motor de Alertas** | Decisión según umbrales configurados | Independiente del score, puede tener reglas manuales |
| **Dashboard** | Visualización y validación manual | Solo lectura del estado, sin dependencias críticas |
| **Auditoría** | Logging inmutable de operaciones | Almacenamiento independiente con RULES en BD |
| **Reportes** | Generación de métricas exportables | Lectura desde BD sin impacto en operaciones en vivo |

---

## 2. Patrón Adapter — Integración con IA

El Adapter Pattern define el contrato de comunicación entre el Núcleo
TriDa y cualquier proveedor externo de IA. Permite conmutar entre
proveedores modificando exclusivamente una configuración en base de datos,
sin tocar el código del núcleo.

```
NÚCLEO TRIDA
    │
    │ invoca contrato estándar
    ▼
[IAIAdapter interface]      → Contrato independiente del proveedor
    │
    ├── GeminiAdapter       → Implementación actual (Gemini API)
    ├── OpenAIAdapter       → Implementación futura posible
    └── ClaudeAdapter       → Implementación futura posible
```

**Resultado estándar** (independiente del proveedor):

```
{
  score:       número entre 0.0 y 100.0 con un decimal (ej: 85,5)
  explanation: texto en español con los factores determinantes
  factors:     lista de variables que influyeron en el score
}
```

**Beneficio**: cambiar de Gemini a cualquier otro proveedor no requiere
modificar el Núcleo TriDa ni ningún servicio de detección.

---

## 3. Patrón Middleware Chain (Express)

Express procesa cada request a través de una cadena de middlewares.
Cada middleware puede modificar `req` o `res`, llamar `next()` para
continuar la cadena, o terminar el ciclo enviando una respuesta.

```
Request → cors → express.json() → verifyToken → requireAdmin → controller → Response
```

### Middlewares implementados

| Middleware | Propósito | Aplica en |
|------------|-----------|-----------|
| `cors` | Control de orígenes permitidos | Global |
| `express.json()` | Parsing de body JSON | Global |
| `verifyToken` | Verificación de JWT | Rutas protegidas |
| `requireAdmin` | Verificación de rol ADMINISTRADOR | Rutas administrativas |

### `verifyToken`

```javascript
function verifyToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // "Bearer xxx"

    if (!token) {
        return res.status(401).json({ error: 'Token no proporcionado' });
    }

    jwt.verify(token, CONFIG.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ error: 'Token inválido o expirado' });
        }
        req.user = decoded; // { id_usuario, email, rol, nombre }
        next();
    });
}
```

### `requireAdmin`

```javascript
function requireAdmin(req, res, next) {
    if (!req.user || req.user.rol !== 'ADMINISTRADOR') {
        return res.status(403).json({ error: 'Se requieren privilegios de administrador' });
    }
    next();
}
```

---

## 4. Patrón de Funciones SQL (Schema `trida`)

En lugar de ejecutar SQL directo sobre las tablas, todos los endpoints
invocan funciones del schema `trida`. Este patrón centraliza la lógica
de acceso a datos en la base de datos.

```
Endpoint del backend
    │
    │ pool.query('SELECT * FROM trida.fn_nombre($1);', [param])
    ▼
[Función SQL del schema trida]
    │
    ▼
[Tablas del schema trida]
```

**Beneficio**: modificar la lógica de consulta no requiere tocar el
código del backend. Las funciones actúan como una capa de abstracción
entre la aplicación y las tablas.

```javascript
// Patrón correcto — función SQL
const resultado = await pool.query(
    'SELECT * FROM trida.fn_transacciones($1);',
    [banco || null]
);

// Anti-patrón — SQL directo sobre tablas
const resultado = await pool.query(
    'SELECT * FROM trida.transacciones WHERE id_banco = $1',
    [banco]
);
```

---

## 5. Patrón de Auditoría Inmutable

Todos los eventos del sistema se registran en `logs_auditoria` mediante
RULES de PostgreSQL que bloquean UPDATE y DELETE a nivel de base de datos.
Esta garantía opera en la capa de persistencia, no solo en la aplicación.

```
Evento del sistema (transacción, alerta, validación, cambio de config)
    │
    │ INSERT automático
    ▼
[logs_auditoria]
    │
    ├── logs_no_update → cualquier UPDATE no produce efecto
    └── logs_no_delete → cualquier DELETE no produce efecto
```

**Campos obligatorios en cada registro:**

| Campo | Descripción |
|-------|-------------|
| `tipo_accion` | Tipo de evento registrado |
| `entidad_afectada` | Tabla o entidad afectada |
| `descripcion` | Descripción detallada del evento |
| `fecha_accion` | Timestamp preciso del evento |
| `id_identidad` | ID del registro afectado |
| `direccion_ip` | IP desde donde se ejecutó la acción |
| `id_usuario` | Usuario que ejecutó la acción |

---

## 6. Patrón de Control de Acceso por Roles (RBAC)

El acceso a recursos y funciones está controlado por roles definidos
directamente en la base de datos mediante constraint.

```
Request con JWT
    │
    │ verifyToken extrae { id_usuario, email, rol, nombre }
    ▼
[rol del usuario]
    │
    ├── ADMINISTRADOR → acceso total + requireAdmin pasa
    ├── ANALISTA      → revisar, validar y gestionar alertas
    ├── OPERADOR      → solo visualización y escalado
    └── AUDITOR       → solo lectura de registros e informes
```

### Aplicación en endpoints

| Endpoint | Middleware requerido | Rol mínimo |
|----------|---------------------|------------|
| `POST /api/auth/register` | `verifyToken` + `requireAdmin` | ADMINISTRADOR |
| `GET /api/auth/usuarios-sistema` | `verifyToken` + `requireAdmin` | ADMINISTRADOR |
| Resto de endpoints | Sin autenticación | — |

---

## 7. Patrón de Manejo de Errores

Los errores del servidor se capturan y retornan al cliente con un
formato estándar sin exponer información técnica interna.

```
Error en cualquier capa
    │
    ├── Error de BD (código 23505) → HTTP 409 Conflict
    ├── Error de BD (código 23514) → HTTP 400 Bad Request
    ├── Token inválido             → HTTP 403 Forbidden
    ├── Sin token                  → HTTP 401 Unauthorized
    └── Error no anticipado        → HTTP 500 (sin detalles técnicos)
```

### Formato estándar de error

```json
{ "error": "Descripción legible del error" }
```

### Códigos PostgreSQL manejados

| Código PG | HTTP | Descripción |
|-----------|------|-------------|
| `23505` | 409 | Violación de UNIQUE (email duplicado) |
| `23514` | 400 | Violación de CHECK constraint (email inválido, rol inválido) |

---

## 8. Patrón de Configuración Centralizada

La configuración del sistema está centralizada en un objeto `CONFIG`
al inicio del servidor, cargada desde variables de entorno.

```javascript
const CONFIG = {
    PORT: 5000,
    DB: {
        user:     'postgres',
        host:     'localhost',
        database: 'TriDa',
        password: process.env.DB_PASSWORD,
        port:     5432,
    },
    JWT_SECRET:     process.env.JWT_SECRET,
    JWT_EXPIRES_IN: '24h',
    FRONTEND_URL:   process.env.FRONTEND_URL || 'http://localhost:5173',
};
```

**Beneficio**: un único punto de modificación para variables de entorno
y configuración del sistema. Evita valores hardcodeados dispersos en el código.

---

## 9. Patrón de Pool de Conexiones

La conexión a PostgreSQL se gestiona mediante un pool que reutiliza
conexiones en lugar de crear una nueva por cada request.

```javascript
const pool = new Pool(CONFIG.DB);

pool.connect((err) => {
    if (err) {
        console.error('Error conectando a la base de datos:', err.stack);
    } else {
        console.log('¡Conectado exitosamente a PostgreSQL!');
    }
});
```

**Beneficio**: el pool gestiona automáticamente la creación, reutilización
y cierre de conexiones, mejorando el rendimiento bajo carga.

---

## 10. Patrón Anti-Enumeración en Autenticación

Los endpoints de autenticación devuelven mensajes genéricos que no
revelan si un email existe o no en el sistema.

```
POST /api/auth/login
    │
    ├── email no existe en BD     → HTTP 401 "Credenciales inválidas"
    ├── contraseña incorrecta     → HTTP 401 "Credenciales inválidas"
    └── cuenta desactivada        → HTTP 403 "Tu cuenta está desactivada"

POST /api/auth/forgot-password
    │
    ├── email existe en BD        → envía email + HTTP 200 (mismo mensaje)
    └── email NO existe en BD     → HTTP 200 (mismo mensaje, no envía email)
```

**Beneficio**: impide que un atacante determine qué emails están
registrados en el sistema mediante las respuestas de la API (OWASP A07).
