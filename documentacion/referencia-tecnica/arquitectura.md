# Arquitectura del Sistema — TriDa (Sistema de Monitoreo de Transacciones con IA)

<!--
  ¿Qué? Documento de arquitectura general del sistema TriDa.
  ¿Para qué? Proveer una visión macro de cómo se relacionan las capas
  y decisiones técnicas del sistema de detección de fraude.
  ¿Impacto? Entender la arquitectura es prerequisito para contribuir
  correctamente al proyecto y comprender el flujo completo desde la
  ingesta de transacciones hasta la generación de alertas.
-->

## 1. Visión General

TriDa es un sistema de monitoreo de transacciones bancarias con IA
construido con arquitectura en **tres capas desacopladas**, siguiendo
los principios de alta cohesión interna y bajo acoplamiento entre módulos:

- **Frontend**: React + Vite + Tailwind CSS, se comunica con el backend
  exclusivamente mediante API REST sobre HTTPS con autenticación JWT
- **Backend**: Express.js + Prisma, contiene los servicios especializados
  de detección y el Núcleo TriDa como orquestador central
- **Base de datos**: PostgreSQL, implementa un esquema relacional
  normalizado en tercera forma normal con schema `trida`
- **IA Externa**: Gemini API, integrada mediante el patrón Adapter que
  define el contrato de comunicación con cualquier agente externo

```
┌─────────────────────────────────────────────────────────┐
│                     CLIENTE (Browser)                    │
│              React + Vite + Tailwind CSS                 │
│                   localhost:5173                         │
└───────────────────────┬─────────────────────────────────┘
                        │ API REST sobre HTTPS
                        │ Authorization: Bearer <token>
                        ▼
┌─────────────────────────────────────────────────────────┐
│                  BACKEND (Express.js)                    │
│                  Express.js + Prisma                     │
│                   localhost:5000                         │
│                                                          │
│  ┌─────────────────────────────────────────────────┐    │
│  │               NÚCLEO TRIDA                      │    │
│  │  Orquestador central del flujo de análisis      │    │
│  │  Coordina servicios y produce la decisión final │    │
│  └─────────────────────────────────────────────────┘    │
│                                                          │
│  ┌─────────────────────────────────────────────────┐    │
│  │            INTERFAZ IA (Adapter Pattern)         │    │
│  │  Define contrato con agentes externos de IA     │    │
│  │  Permite conmutar entre proveedores por config  │    │
│  └─────────────────────────────────────────────────┘    │
└──────────────┬──────────────────────┬───────────────────┘
               │ pg driver (pool)     │ HTTPS
               ▼                      ▼
┌──────────────────────┐  ┌──────────────────────────────┐
│  BASE DE DATOS       │  │     IA EXTERNA               │
│  (PostgreSQL)        │  │     (Gemini API)              │
│  localhost:5432      │  │                              │
│  schema: trida       │  │  Score de riesgo 0–100%      │
│  10 tablas           │  │  Explicabilidad en           │
│  pgcrypto extension  │  │  lenguaje natural            │
└──────────────────────┘  └──────────────────────────────┘
```

---

## 2. Arquitectura del Backend — Capas

El Núcleo TriDa no procesa directamente ninguna señal individual: su
responsabilidad es coordinar el flujo completo de análisis, agregar los
resultados de cada servicio y producir la decisión final. Este diseño
evita la dispersión de la lógica de decisión entre múltiples servicios,
un antipatrón frecuente que genera inconsistencias y dificulta el
mantenimiento.

```
HTTP Request
     │
     ▼
┌─────────────┐
│   Router    │  Define rutas y aplica middlewares específicos
│             │  No contiene lógica de negocio
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Controller │  Recibe req/res, extrae datos, llama al service
│             │  Retorna respuesta HTTP con status code correcto
│             │  NO contiene lógica de negocio
└──────┬──────┘
       │
       ▼
┌──────────────────────────────────┐
│          NÚCLEO TRIDA            │
│  Orquestador central             │
│  Coordina el flujo completo      │
│  Agrega resultados de servicios  │
│  Produce la decisión final       │
└──────┬───────────────────────────┘
       │
       ├──────────────────────────┐
       ▼                          ▼
┌─────────────┐          ┌──────────────────┐
│   Service   │          │  Interfaz IA     │
│             │          │  (Adapter)       │
│  Lógica de  │          │                  │
│  negocio    │          │  Contrato de     │
│  específica │          │  comunicación    │
│  de cada    │          │  con Gemini API  │
│  módulo     │          │  Conmutable por  │
│             │          │  configuración   │
│             │          │  en BD           │
└──────┬──────┘          └────────┬─────────┘
       │                          │ HTTPS
       ▼                          ▼
┌─────────────┐          ┌──────────────────┐
│  pg Pool    │          │   Gemini API     │
│             │          │                  │
│  PostgreSQL │          │  Score 0–100%    │
│  schema     │          │  con un decimal  │
│  trida      │          │                  │
└─────────────┘          └──────────────────┘

       │ (paralelo con Service)
       ▼
┌─────────────┐
│  Audit Log  │  Registra eventos en logs_auditoria
│             │  Inmutable por RULE en base de datos
└─────────────┘
```

### 2.1 Middlewares (en orden de ejecución)

| Middleware | Propósito |
|------------|-----------|
| `cors` | Control de orígenes permitidos |
| `express.json()` | Parsing de body JSON |
| `verifyToken` | Verificación de JWT en rutas protegidas |
| `requireAdmin` | Verificación de rol ADMINISTRADOR en rutas administrativas |

---

## 3. Arquitectura del Frontend

El frontend está organizado en seis módulos independientes:

- Autenticación con MFA
- Dashboard y alertas
- Transacciones
- Gestión de dispositivos
- Reportes
- Administración

Cada módulo es un componente React autónomo que se comunica con el
backend exclusivamente mediante API REST sobre HTTPS con autenticación
por tokens JWT. Esta separación garantiza que cada módulo pueda
desarrollarse, probarse y desplegarse de forma independiente sin
riesgo de interferencia entre funcionalidades.

---

## 4. Patrón Adapter — Integración con IA

La IA está implementada mediante el patrón Adapter, que define el
contrato de comunicación con cualquier agente externo y permite
conmutar entre proveedores modificando exclusivamente una configuración
en base de datos.

El proveedor actual es **Gemini API**, que proporciona:

- Score de riesgo entre 0 % y 100 % con un decimal (ej: 85,5 %)
- Explicación en lenguaje natural de los factores que determinaron
  el score

---

## 5. Stack Tecnológico

| Capa | Tecnología | Justificación |
|------|-----------|---------------|
| Frontend | React + Vite + Tailwind CSS | Framework basado en componentes que permite módulos independientes. Facilita actualizaciones rápidas sin afectar la lógica del servidor |
| Backend | Express.js + Prisma | Gestiona la lógica de negocio y las reglas de detección. Facilita la integración de seguridad JWT y la conexión con la base de datos |
| Base de datos | PostgreSQL | Almacenamiento y persistencia con esquema relacional normalizado en 3FN |
| IA | Gemini API (externa) | Proporciona análisis cognitivo para la detección de patrones sin necesidad de entrenar un modelo desde cero |
| Patrón de diseño | Adapter Pattern | Actúa como traductor entre el backend y la API de IA. Permite cambiar de proveedor sin modificar el código principal |
| Comunicación | API REST sobre HTTPS | Estándar de comunicación entre frontend y backend |
| Autenticación | JWT (24h) | Tokens firmados con secreto para autenticar usuarios del sistema |
| Email | Gmail vía Nodemailer | Envío de correos de recuperación de contraseña |

## 6. Modelo de Datos

La base de datos utiliza PostgreSQL con el schema `trida` y la extensión
`pgcrypto`. Implementa un esquema relacional normalizado con **10 tablas**
que cubren la totalidad del dominio del sistema.

### 6.1 Diagrama de relaciones

```
┌──────────────────────────────────┐
│             bancos               │
├──────────────────────────────────┤
│ id_banco        SERIAL PK        │
│ codigo          VARCHAR(50) UQ   │
│ nombre          VARCHAR(120)     │
│ color           VARCHAR(20)      │
│ estado          BOOLEAN          │
│ fecha_creacion  TIMESTAMPTZ      │
└──────┬───────────────────────────┘
       │ 1
       │ N
┌──────▼───────────────────────────┐
│            clientes              │
├──────────────────────────────────┤
│ id_cliente        SERIAL PK      │
│ id_banco          FK → bancos    │
│ nombre_completo   VARCHAR(150)   │
│ email             VARCHAR(254) UQ│
│ telefono          VARCHAR(20)    │
│ fecha_registro    TIMESTAMPTZ    │
│ estado            BOOLEAN        │
│ pais              VARCHAR(100)   │
│ ciudad            VARCHAR(100)   │
└──────┬───────────────────────────┘
       │ 1
       │ N
┌──────▼────────────────────────────┐
│          dispositivos             │
├───────────────────────────────────┤
│ id_dispositivo      SERIAL PK     │
│ id_cliente          FK → clientes │
│ tipo_dispositivo    VARCHAR(50)   │
│ identificador_unico VARCHAR(255) UQ│
│ sistema_operativo   VARCHAR(100)  │
│ navegador           VARCHAR(100)  │
│ fecha_primer_uso    TIMESTAMPTZ   │
│ fecha_ultimo_uso    TIMESTAMPTZ   │
└──────┬────────────────────────────┘
       │ 1
       │ N
┌──────▼───────────────────────────────┐
│       historico_de_ubicacion         │
├──────────────────────────────────────┤
│ id_ubicacion    SERIAL PK            │
│ id_dispositivo  FK → dispositivos    │
│ direccion_ip    INET                 │
│ pais            VARCHAR(100)         │
│ ciudad          VARCHAR(100)         │
│ latitud         NUMERIC(9,6)         │
│ longitud        NUMERIC(9,6)         │
│ fecha_registro  TIMESTAMPTZ          │
└──────┬───────────────────────────────┘
       │
       │         ┌──────────────────────────────────────┐
       │         │           transacciones              │
       │         ├──────────────────────────────────────┤
       └────────▶│ id_transaccion      SERIAL PK        │
                 │ id_cliente          FK → clientes     │
                 │ id_dispositivo      FK → dispositivos │
                 │ id_ubicacion        FK → hist_ubic.   │
                 │ id_banco            FK → bancos       │
                 │ tipo_transaccion    VARCHAR(50)       │
                 │ monto               NUMERIC(15,2)     │
                 │ cuenta_origen       VARCHAR(30)       │
                 │ cuenta_destino      VARCHAR(30)       │
                 │ fecha_transaccion   TIMESTAMPTZ       │
                 │ score_riesgo        NUMERIC(5,1)      │
                 │ estado_transaccion  VARCHAR(20)       │
                 │ es_fraude_real      BOOLEAN           │
                 │ tiempo_procesamiento INTEGER          │
                 │ moneda              CHAR(3)           │
                 │ canal               VARCHAR(20)       │
                 └──────┬───────────────────────────────┘
                        │ 1
                        │ N
                 ┌──────▼───────────────────────────────┐
                 │              alertas                  │
                 ├──────────────────────────────────────┤
                 │ id_alerta            SERIAL PK        │
                 │ id_transaccion       FK → transacc.   │
                 │ nivel_criticidad     VARCHAR(10)      │
                 │ fecha_generacion     TIMESTAMPTZ      │
                 │ factores_sospechosos TEXT             │
                 │ estado_alerta        VARCHAR(20)      │
                 │ prioridad            SMALLINT         │
                 └──────┬───────────────────────────────┘
                        │ 1
                        │ N
                 ┌──────▼───────────────────────────────┐
                 │           validaciones                │
                 ├──────────────────────────────────────┤
                 │ id_validacion     SERIAL PK           │
                 │ id_alerta         FK → alertas        │
                 │ id_usuario        FK → usuarios_sist. │
                 │ clasificacion     VARCHAR(35)         │
                 │ comentarios       TEXT                │
                 │ fecha_validacion  TIMESTAMPTZ         │
                 │ accion_tomada     VARCHAR(50)         │
                 └──────────────────────────────────────┘

┌──────────────────────────────────┐
│       usuarios_sistemas          │
├──────────────────────────────────┤
│ id_usuario            SERIAL PK  │
│ nombre_completo       VARCHAR(150)│
│ email           VARCHAR(254) UQ  │
│ password_hash         TEXT       │
│ rol                   VARCHAR(30)│
│ fecha_creacion        TIMESTAMPTZ│
│ ultimo_acceso         TIMESTAMPTZ│
│ estado                BOOLEAN    │
│ id_usuario_generador  FK → self  │
└──────────────────────────────────┘

┌──────────────────────────────────┐
│            reportes              │
├──────────────────────────────────┤
│ id_reporte            SERIAL PK  │
│ id_usuario_generador  FK → usuarios_sistemas│
│ tipo_reporte          VARCHAR(30)│
│ fecha_inicio          TIMESTAMPTZ│
│ fecha_fin             TIMESTAMPTZ│
│ total_transacciones   INTEGER    │
│ total_alertas_generadas INTEGER  │
│ fraudes_detectados    INTEGER    │
│ falsos_positivos      INTEGER    │
│ tasa_deteccion        NUMERIC(5,2)│
│ tiempo_promedio_respuesta NUMERIC(8,2)│
│ monto_protegido       NUMERIC(20,2)│
│ fecha_generacion      TIMESTAMPTZ│
│ ruta_archivo          TEXT       │
└──────────────────────────────────┘

┌──────────────────────────────────┐
│         logs_auditoria           │
├──────────────────────────────────┤
│ id_log             SERIAL PK     │
│ id_usuario         FK → usuarios_sistemas│
│ tipo_accion        VARCHAR(50)   │
│ entidad_afectada   VARCHAR(50)   │
│ descripcion        TEXT          │
│ fecha_accion       TIMESTAMPTZ   │
│ id_identidad       INTEGER       │
│ direccion_ip       INET          │
└──────────────────────────────────┘
  ⛔ UPDATE y DELETE bloqueados por RULE
```

### 6.2 Tablas del sistema

| Tabla | Tipo | Descripción |
|-------|------|-------------|
| `bancos` | Central | Catálogo de bancos con 12 registros iniciales |
| `clientes` | Central | Clientes bancarios vinculados a un banco |
| `dispositivos` | Central | Dispositivos registrados por cliente |
| `historico_de_ubicacion` | Central | Ubicaciones geográficas por dispositivo |
| `transacciones` | Central | Transacciones procesadas con score de riesgo |
| `alertas` | Central | Alertas generadas por nivel de criticidad |
| `validaciones` | Soporte | Clasificaciones manuales de analistas sobre alertas |
| `usuarios_sistemas` | Soporte | Usuarios internos del sistema |
| `reportes` | Soporte | Reportes generados con métricas de desempeño |
| `logs_auditoria` | Soporte | Registro inmutable de auditoría |

### 6.3 Relaciones principales

| Relación | Cardinalidad | Descripción |
|----------|-------------|-------------|
| `bancos` → `clientes` | 1:N | Un banco tiene múltiples clientes |
| `bancos` → `transacciones` | 1:N | Un banco tiene múltiples transacciones |
| `clientes` → `dispositivos` | 1:N | Un cliente tiene múltiples dispositivos |
| `dispositivos` → `historico_de_ubicacion` | 1:N | Un dispositivo tiene múltiples ubicaciones |
| `clientes` → `transacciones` | 1:N | Un cliente tiene múltiples transacciones |
| `dispositivos` → `transacciones` | 1:N | Un dispositivo puede originar múltiples transacciones |
| `historico_de_ubicacion` → `transacciones` | 1:N | Una ubicación puede asociarse a múltiples transacciones |
| `transacciones` → `alertas` | 1:N | Una transacción puede generar múltiples alertas |
| `alertas` → `validaciones` | 1:N | Una alerta puede tener múltiples validaciones |
| `usuarios_sistemas` → `validaciones` | 1:N | Un usuario puede realizar múltiples validaciones |
| `usuarios_sistemas` → `reportes` | 1:N | Un usuario puede generar múltiples reportes |
| `usuarios_sistemas` → `logs_auditoria` | 1:N | Un usuario genera múltiples registros de auditoría |
| `usuarios_sistemas` → `usuarios_sistemas` | 1:N | Un usuario puede crear otros usuarios |

### 6.4 Constraints y validaciones en base de datos

| Tabla | Constraint | Descripción |
|-------|-----------|-------------|
| `clientes` | `chk_clientes_email_formato` | Email debe cumplir formato RFC básico |
| `usuarios_sistemas` | `chk_usuarios_email_formato` | Email debe cumplir formato RFC básico |
| `usuarios_sistemas` | `chk_rol` | Rol: ADMINISTRADOR, ANALISTA, OPERADOR o AUDITOR |
| `dispositivos` | `chk_fechas_dispositivo` | `fecha_ultimo_uso` ≥ `fecha_primer_uso` |
| `historico_de_ubicacion` | `chk_latitud` | Latitud entre -90 y 90 |
| `historico_de_ubicacion` | `chk_longitud` | Longitud entre -180 y 180 |
| `transacciones` | `chk_monto_positivo` | Monto > 0 |
| `transacciones` | `chk_score_riesgo` | Score entre 0 y 100 |
| `transacciones` | `chk_estado_transaccion` | Estado: PENDIENTE, APROBADA, ALERTADA o BLOQUEADA |
| `transacciones` | `chk_tiempo_procesamiento` | Tiempo de procesamiento ≥ 0 |
| `transacciones` | `chk_moneda` | Código ISO de 3 letras mayúsculas |
| `transacciones` | `chk_canal_transaccion` | Canal: mobile, web, pos, atm o branch |
| `alertas` | `chk_nivel_criticidad` | Nivel: BAJA, MEDIA, ALTA o CRITICA |
| `alertas` | `chk_estado_alerta` | Estado: ACTIVA, EN_REVISION, RESUELTA o DESCARTADA |
| `alertas` | `chk_prioridad` | Prioridad entre 1 y 10 |
| `validaciones` | `chk_clasificacion` | Clasificación: FRAUDE_CONFIRMADO, FALSO_POSITIVO, PENDIENTE_INVESTIGACION o REQUIERE_CONTACTO_CLIENTE |
| `reportes` | `chk_fechas_reporte` | `fecha_fin` ≥ `fecha_inicio` |
| `reportes` | `chk_tipo_reporte` | Tipo: DIARIO, SEMANAL, MENSUAL o PERSONALIZADO |
| `reportes` | `chk_tasa_deteccion` | Tasa entre 0 y 100 |
| `reportes` | `chk_monto_protegido` | Monto protegido ≥ 0 |
| `logs_auditoria` | `logs_no_update` | RULE que bloquea UPDATE |
| `logs_auditoria` | `logs_no_delete` | RULE que bloquea DELETE |

### 6.5 Índices

| Tabla | Índice | Columna(s) |
|-------|--------|-----------|
| `bancos` | `idx_bancos_codigo` | `codigo` |
| `clientes` | `idx_clientes_id_banco` | `id_banco` |
| `clientes` | `idx_clientes_estado` | `estado` |
| `clientes` | `idx_clientes_ciudad` | `ciudad` |
| `usuarios_sistemas` | `idx_usuarios_rol` | `rol` |
| `usuarios_sistemas` | `idx_usuarios_estado` | `estado` |
| `dispositivos` | `idx_dispositivos_id_cliente` | `id_cliente` |
| `historico_de_ubicacion` | `idx_ubicacion_id_dispositivo` | `id_dispositivo` |
| `historico_de_ubicacion` | `idx_ubicacion_ciudad` | `ciudad` |
| `transacciones` | `idx_transacciones_id_cliente` | `id_cliente` |
| `transacciones` | `idx_transacciones_id_banco` | `id_banco` |
| `transacciones` | `idx_transacciones_score_riesgo` | `score_riesgo DESC` (parcial: WHERE NOT NULL) |
| `transacciones` | `idx_transacciones_fecha` | `fecha_transaccion DESC` |
| `transacciones` | `idx_transacciones_estado` | `estado_transaccion` |
| `transacciones` | `idx_transacciones_canal` | `canal` |
| `alertas` | `idx_alertas_nivel_criticidad` | `nivel_criticidad` |
| `alertas` | `idx_alertas_estado` | `estado_alerta` |
| `alertas` | `idx_alertas_fecha` | `fecha_generacion DESC` |
| `alertas` | `idx_alertas_nivel_estado` | `nivel_criticidad, estado_alerta` (compuesto) |
| `validaciones` | `idx_validaciones_clasificacion` | `clasificacion` |
| `validaciones` | `idx_validaciones_id_alerta` | `id_alerta` |
| `logs_auditoria` | `idx_logs_id_usuario` | `id_usuario` |
| `logs_auditoria` | `idx_logs_fecha_accion` | `fecha_accion DESC` |
| `logs_auditoria` | `idx_logs_tipo_accion` | `tipo_accion` |

### 6.6 Datos iniciales

La tabla `bancos` incluye 12 registros iniciales:

| Código | Nombre | Color |
|--------|--------|-------|
| `sin_asignar` | Sin banco asignado | `#6366F1` |
| `bancolombia` | Bancolombia | `#FFD700` |
| `davivienda` | Davivienda | `#E31837` |
| `bogota` | Banco de Bogotá | `#003DA5` |
| `bbva` | BBVA Colombia | `#004481` |
| `avvillas` | AV Villas | `#00A651` |
| `nequi` | Nequi | `#7B2D8E` |
| `daviplata` | Daviplata | `#FF6B00` |
| `scotiabank` | Scotiabank Colpatria | `#EC111A` |
| `occidente` | Banco de Occidente | `#006341` |
| `popular` | Banco Popular | `#0072CE` |
| `falabella` | Banco Falabella | `#00A650` |

---

## 7. Endpoints de la API

El servidor corre en `http://localhost:5000`. Los endpoints protegidos
requieren el header:

```
Authorization: Bearer <token>
```

### 7.1 Autenticación

| Método | Endpoint | Auth | Descripción |
|--------|----------|------|-------------|
| `POST` | `/api/auth/login` | No | Inicia sesión y retorna token JWT |
| `POST` | `/api/auth/register` | Sí (solo ADMINISTRADOR) | Crea un nuevo usuario del sistema |
| `POST` | `/api/auth/forgot-password` | No | Solicita recuperación de contraseña vía email |
| `GET` | `/api/auth/verify-reset-token` | No | Verifica si un token de reset es válido |
| `POST` | `/api/auth/reset-password` | No | Resetea la contraseña usando el token del email |
| `GET` | `/api/auth/usuarios-sistema` | Sí (solo ADMINISTRADOR) | Lista todos los usuarios del sistema |

---

#### `POST /api/auth/login`

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

| Código | Motivo |
|--------|--------|
| 400 | Email o contraseña no proporcionados |
| 401 | Credenciales inválidas |
| 403 | Cuenta desactivada |
| 500 | Error interno del servidor |

---

#### `POST /api/auth/register`

> Requiere token JWT con rol `ADMINISTRADOR`.

**Body:**
```json
{
  "nombre_completo": "string",
  "email": "string",
  "password": "string (mínimo 6 caracteres)",
  "rol": "ADMINISTRADOR | ANALISTA | OPERADOR | AUDITOR"
}
```

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

| Código | Motivo |
|--------|--------|
| 400 | Campos faltantes, contraseña corta o rol inválido |
| 401 | Token no proporcionado |
| 403 | Token inválido o usuario sin rol ADMINISTRADOR |
| 409 | Email ya registrado |
| 500 | Error interno del servidor |

---

#### `POST /api/auth/forgot-password`

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

> ⚠️ La respuesta es idéntica tanto si el email existe como si no
> existe (anti-enumeración). El email enviado contiene un enlace con
> token JWT temporal que expira en 15 minutos:
> `http://localhost:5173/reset-password?token=<token>`

**Errores:**

| Código | Motivo |
|--------|--------|
| 400 | Correo no proporcionado |
| 500 | Error interno al procesar la solicitud |

---

#### `GET /api/auth/verify-reset-token`

**Query param:**
```
/api/auth/verify-reset-token?token=<token>
```

**Respuesta exitosa** (HTTP 200):
```json
{ "valid": true, "email": "string" }
```

**Errores:**

| Código | Motivo |
|--------|--------|
| 400 | Token no proporcionado |
| 401 | Token expirado o inválido |

---

#### `POST /api/auth/reset-password`

**Body:**
```json
{
  "token": "string",
  "nuevaContrasena": "string (mínimo 6 caracteres)"
}
```

**Respuesta exitosa** (HTTP 200):
```json
{
  "message": "¡Contraseña actualizada con éxito! Ya puedes iniciar sesión.",
  "email": "string"
}
```

**Errores:**

| Código | Motivo |
|--------|--------|
| 400 | Token o contraseña no proporcionados, o contraseña muy corta |
| 401 | Token expirado o inválido |
| 404 | No se pudo actualizar la contraseña |
| 500 | Error interno del servidor |

---

#### `GET /api/auth/usuarios-sistema`

> Requiere token JWT con rol `ADMINISTRADOR`.

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

---

### 7.2 Clientes, Transacciones, Alertas y Dispositivos

| Método | Endpoint | Auth | Query param | Descripción |
|--------|----------|------|-------------|-------------|
| `GET` | `/api/tareas` | No | — | Lista todos los clientes |
| `GET` | `/api/transacciones` | No | `?banco=string` | Lista transacciones filtrable por banco |
| `GET` | `/api/alertas` | No | `?banco=string` | Lista alertas filtrable por banco |
| `GET` | `/api/dispositivos` | No | `?banco=string` | Lista dispositivos filtrable por banco |
| `GET` | `/api/usuarios` | No | `?banco=string` | Lista usuarios filtrable por banco |

---

### 7.3 Dashboard

| Método | Endpoint | Auth | Query param | Descripción |
|--------|----------|------|-------------|-------------|
| `GET` | `/api/dashboard/stats` | No | `?banco=string` | Estadísticas generales del dashboard |
| `GET` | `/api/dashboard/alertas-recientes` | No | `?banco=string` | Alertas recientes del sistema |

---

### 7.4 Analytics

| Método | Endpoint | Auth | Query param | Descripción |
|--------|----------|------|-------------|-------------|
| `GET` | `/api/analytics/metricas` | No | `?banco=string` | Métricas globales de detección |
| `GET` | `/api/analytics/agregaciones` | No | `?banco=string` | Agregaciones por tipo, ciudad, canal y banco |

**Respuesta de `/api/analytics/agregaciones`** (HTTP 200):
```json
{
  "porTipo":   [],
  "porCiudad": [],
  "porCanal":  [],
  "porBanco":  []
}
```

---

### 7.5 Mapa

| Método | Endpoint | Auth | Query param | Descripción |
|--------|----------|------|-------------|-------------|
| `GET` | `/api/mapa/stats` | No | `?banco=string` | Estadísticas geográficas del sistema |
| `GET` | `/api/mapa/ubicaciones` | No | `?banco=string` | Ubicaciones registradas en el sistema |

---

### 7.6 Catálogo de Bancos

| Método | Endpoint | Auth | Descripción |
|--------|----------|------|-------------|
| `GET` | `/api/bancos` | No | Lista todos los bancos del catálogo |

---

### 7.7 Middlewares de autenticación

| Middleware | Descripción |
|-----------|-------------|
| `verifyToken` | Verifica que el header `Authorization: Bearer <token>` sea válido. Retorna 401 si no hay token y 403 si es inválido o expirado |
| `requireAdmin` | Verifica que el usuario autenticado tenga rol `ADMINISTRADOR`. Retorna 403 si no cumple |

## 8. Funciones de Base de Datos

Todos los endpoints llaman a funciones del schema `trida` en lugar de
SQL directo sobre las tablas.

### 8.1 Catálogo de funciones

| Función | Descripción | Parámetros |
|---------|-------------|-----------|
| `fn_bancos()` | Lista todos los bancos del catálogo | — |
| `fn_login($1)` | Busca un usuario por email y retorna sus datos incluyendo `password_hash` | `email VARCHAR` |
| `fn_actualizar_ultimo_acceso($1)` | Actualiza `ultimo_acceso` tras login exitoso | `id_usuario INTEGER` |
| `fn_register($1,$2,$3,$4,$5)` | Crea un nuevo usuario del sistema | `nombre_completo, email, password_hash, rol, id_usuario_generador` |
| `fn_listar_usuarios_sistema()` | Lista todos los usuarios del sistema | — |
| `fn_cambiar_contrasena($1,$2)` | Actualiza el `password_hash` de un usuario | `email VARCHAR, nuevo_hash TEXT` |
| `fn_clientes()` | Lista todos los clientes con su banco asociado | — |
| `fn_usuarios($1)` | Lista clientes filtrable por banco | `banco_codigo VARCHAR` |
| `fn_transacciones($1)` | Lista transacciones filtrable por banco | `banco_codigo VARCHAR` |
| `fn_alertas($1)` | Lista alertas filtrable por banco | `banco_codigo VARCHAR` |
| `fn_dispositivos($1)` | Lista dispositivos filtrable por banco | `banco_codigo VARCHAR` |
| `fn_dashboard_stats($1)` | Estadísticas generales del dashboard | `banco_codigo VARCHAR` |
| `fn_alertas_recientes($1)` | Alertas recientes del sistema | `banco_codigo VARCHAR` |
| `fn_analytics_metricas($1)` | Métricas globales de detección | `banco_codigo VARCHAR` |
| `fn_analytics_por_tipo($1)` | Agregación por tipo de transacción | `banco_codigo VARCHAR` |
| `fn_analytics_por_ciudad($1)` | Agregación por ciudad | `banco_codigo VARCHAR` |
| `fn_analytics_por_canal($1)` | Agregación por canal | `banco_codigo VARCHAR` |
| `fn_analytics_por_banco_fraude($1)` | Agregación de fraudes por banco | `banco_codigo VARCHAR` |
| `fn_mapa_stats($1)` | Estadísticas geográficas | `banco_codigo VARCHAR` |
| `fn_mapa_ubicaciones($1)` | Ubicaciones registradas | `banco_codigo VARCHAR` |

### 8.2 Relación endpoint → función

| Endpoint | Función(es) invocada(s) |
|----------|------------------------|
| `GET /api/tareas` | `fn_clientes()` |
| `GET /api/transacciones` | `fn_transacciones($1)` |
| `GET /api/alertas` | `fn_alertas($1)` |
| `GET /api/dispositivos` | `fn_dispositivos($1)` |
| `GET /api/usuarios` | `fn_usuarios($1)` |
| `POST /api/auth/login` | `fn_login($1)`, `fn_actualizar_ultimo_acceso($1)` |
| `POST /api/auth/register` | `fn_register($1,$2,$3,$4,$5)` |
| `GET /api/auth/usuarios-sistema` | `fn_listar_usuarios_sistema()` |
| `POST /api/auth/reset-password` | `fn_cambiar_contrasena($1,$2)` |
| `GET /api/dashboard/stats` | `fn_dashboard_stats($1)` |
| `GET /api/dashboard/alertas-recientes` | `fn_alertas_recientes($1)` |
| `GET /api/analytics/metricas` | `fn_analytics_metricas($1)` |
| `GET /api/analytics/agregaciones` | `fn_analytics_por_tipo($1)`, `fn_analytics_por_ciudad($1)`, `fn_analytics_por_canal($1)`, `fn_analytics_por_banco_fraude($1)` |
| `GET /api/mapa/stats` | `fn_mapa_stats($1)` |
| `GET /api/mapa/ubicaciones` | `fn_mapa_ubicaciones($1)` |
| `GET /api/bancos` | `fn_bancos()` |

---

## 9. Consultas de Diagnóstico y Mantenimiento

### 9.1 Resumen general

```sql
-- Conteo de registros por tabla
SELECT 'bancos' AS tabla, COUNT(*) AS registros FROM trida.bancos
UNION ALL SELECT 'clientes',               COUNT(*) FROM trida.clientes
UNION ALL SELECT 'usuarios_sistemas',      COUNT(*) FROM trida.usuarios_sistemas
UNION ALL SELECT 'dispositivos',           COUNT(*) FROM trida.dispositivos
UNION ALL SELECT 'historico_de_ubicacion', COUNT(*) FROM trida.historico_de_ubicacion
UNION ALL SELECT 'transacciones',          COUNT(*) FROM trida.transacciones
UNION ALL SELECT 'alertas',                COUNT(*) FROM trida.alertas
UNION ALL SELECT 'validaciones',           COUNT(*) FROM trida.validaciones
UNION ALL SELECT 'reportes',               COUNT(*) FROM trida.reportes
UNION ALL SELECT 'logs_auditoria',         COUNT(*) FROM trida.logs_auditoria
ORDER BY tabla;

-- Listar todas las funciones del schema trida
SELECT routine_name AS funcion, routine_type AS tipo
FROM information_schema.routines
WHERE routine_schema = 'trida'
ORDER BY routine_name;

-- Tamaño total de la base de datos
SELECT pg_size_pretty(pg_database_size('TriDa')) AS tamano_total;
```

### 9.2 Usuarios del sistema

```sql
-- Ver todos los usuarios
SELECT id_usuario, nombre_completo, email, rol,
    CASE WHEN estado THEN 'Activo' ELSE 'Inactivo' END AS estado,
    fecha_creacion, ultimo_acceso
FROM trida.usuarios_sistemas
ORDER BY fecha_creacion DESC;

-- Contar usuarios por rol y estado
SELECT rol,
    COUNT(*) AS total,
    COUNT(*) FILTER (WHERE estado = TRUE)  AS activos,
    COUNT(*) FILTER (WHERE estado = FALSE) AS inactivos
FROM trida.usuarios_sistemas
GROUP BY rol ORDER BY total DESC;

-- Auditoría: quién creó a quién
SELECT
    nuevo.nombre_completo AS nuevo_usuario,
    nuevo.email, nuevo.rol, nuevo.fecha_creacion,
    admin.nombre_completo AS creado_por
FROM trida.usuarios_sistemas nuevo
LEFT JOIN trida.usuarios_sistemas admin
    ON admin.id_usuario = nuevo.id_usuario_generador
ORDER BY nuevo.fecha_creacion DESC;

-- Usuarios que nunca se han logueado
SELECT id_usuario, nombre_completo, email, rol, fecha_creacion
FROM trida.usuarios_sistemas
WHERE ultimo_acceso IS NULL AND estado = TRUE
ORDER BY fecha_creacion DESC;

-- Usuarios que se loguearon hoy
SELECT id_usuario, nombre_completo, email, rol, ultimo_acceso
FROM trida.usuarios_sistemas
WHERE ultimo_acceso >= CURRENT_DATE
ORDER BY ultimo_acceso DESC;
```

### 9.3 Verificación de contraseñas

```sql
-- Validar integridad del hash bcrypt por email
SELECT email, rol,
    LENGTH(password_hash) AS largo,
    LEFT(password_hash, 7) AS prefijo,
    CASE
        WHEN password_hash LIKE '$2a$%' THEN 'bcrypt v2a'
        WHEN password_hash LIKE '$2b$%' THEN 'bcrypt v2b'
        WHEN password_hash LIKE '$2y$%' THEN 'bcrypt v2y'
        ELSE 'Desconocido'
    END AS algoritmo,
    CASE
        WHEN password_hash LIKE '$2%' AND LENGTH(password_hash) = 60
            THEN '✅ Hash bcrypt válido'
        ELSE '⚠️ Hash sospechoso'
    END AS validacion
FROM trida.usuarios_sistemas
WHERE email = 'admin@trida.co';
```

### 9.4 Bancos

```sql
-- Bancos con más clientes
SELECT b.nombre, b.codigo, COUNT(c.id_cliente) AS total_clientes
FROM trida.bancos b
LEFT JOIN trida.clientes c ON c.id_banco = b.id_banco
GROUP BY b.id_banco, b.nombre, b.codigo
ORDER BY total_clientes DESC;

-- Bancos con más transacciones
SELECT b.nombre,
    COUNT(t.id_transaccion) AS total_transacciones,
    SUM(t.monto) AS monto_total,
    AVG(t.monto)::NUMERIC(15,2) AS monto_promedio
FROM trida.bancos b
LEFT JOIN trida.transacciones t ON t.id_banco = b.id_banco
GROUP BY b.id_banco, b.nombre
ORDER BY total_transacciones DESC;
```

### 9.5 Clientes

```sql
-- Clientes por país
SELECT pais, COUNT(*) AS total,
    COUNT(*) FILTER (WHERE estado = TRUE)  AS activos,
    COUNT(*) FILTER (WHERE estado = FALSE) AS inactivos
FROM trida.clientes
GROUP BY pais ORDER BY total DESC;

-- Clientes por banco con porcentaje
SELECT b.nombre AS banco,
    COUNT(c.id_cliente) AS clientes,
    ROUND(
        100.0 * COUNT(c.id_cliente) / SUM(COUNT(c.id_cliente)) OVER (),
    2) AS porcentaje
FROM trida.bancos b
LEFT JOIN trida.clientes c ON c.id_banco = b.id_banco
GROUP BY b.nombre ORDER BY clientes DESC;
```

### 9.6 Transacciones

```sql
-- Resumen general
SELECT
    COUNT(*) AS total,
    COUNT(*) FILTER (WHERE estado_transaccion = 'APROBADA')  AS aprobadas,
    COUNT(*) FILTER (WHERE estado_transaccion = 'ALERTADA')  AS alertadas,
    COUNT(*) FILTER (WHERE estado_transaccion = 'BLOQUEADA') AS bloqueadas,
    COUNT(*) FILTER (WHERE estado_transaccion = 'PENDIENTE') AS pendientes,
    SUM(monto)::NUMERIC(20,2) AS monto_total,
    AVG(monto)::NUMERIC(15,2) AS monto_promedio
FROM trida.transacciones;

-- Transacciones por nivel de riesgo
SELECT
    CASE
        WHEN score_riesgo < 25 THEN '🟢 Bajo (0-24%)'
        WHEN score_riesgo < 50 THEN '🟡 Medio (25-49%)'
        WHEN score_riesgo < 75 THEN '🟠 Alto (50-74%)'
        ELSE                        '🔴 Crítico (75-100%)'
    END AS nivel_riesgo,
    COUNT(*) AS total,
    SUM(monto)::NUMERIC(20,2) AS monto_total
FROM trida.transacciones
GROUP BY nivel_riesgo
ORDER BY MIN(score_riesgo);
```

### 9.7 Alertas

```sql
-- Resumen por nivel y estado
SELECT nivel_criticidad,
    COUNT(*) AS total,
    COUNT(*) FILTER (WHERE estado_alerta = 'ACTIVA')     AS activas,
    COUNT(*) FILTER (WHERE estado_alerta = 'RESUELTA')   AS resueltas,
    COUNT(*) FILTER (WHERE estado_alerta = 'DESCARTADA') AS descartadas
FROM trida.alertas
GROUP BY nivel_criticidad
ORDER BY CASE nivel_criticidad
    WHEN 'CRITICA' THEN 1 WHEN 'ALTA' THEN 2
    WHEN 'MEDIA'   THEN 3 WHEN 'BAJA' THEN 4
END;
```

### 9.8 Dispositivos y ubicaciones

```sql
-- Dispositivos por tipo
SELECT tipo_dispositivo,
    COUNT(*) AS total,
    COUNT(DISTINCT id_cliente) AS clientes_unicos
FROM trida.dispositivos
GROUP BY tipo_dispositivo ORDER BY total DESC;

-- Ciudades con más transacciones
SELECT u.ciudad, u.pais, COUNT(t.id_transaccion) AS total_transacciones
FROM trida.historico_de_ubicacion u
JOIN trida.transacciones t ON t.id_ubicacion = u.id_ubicacion
GROUP BY u.ciudad, u.pais
ORDER BY total_transacciones DESC
LIMIT 15;
```

### 9.9 Integridad referencial

```sql
-- Clientes sin banco
SELECT * FROM trida.clientes WHERE id_banco IS NULL;

-- Transacciones con referencias faltantes
SELECT
    COUNT(*) FILTER (WHERE id_cliente     IS NULL) AS sin_cliente,
    COUNT(*) FILTER (WHERE id_banco       IS NULL) AS sin_banco,
    COUNT(*) FILTER (WHERE id_dispositivo IS NULL) AS sin_dispositivo,
    COUNT(*) FILTER (WHERE id_ubicacion   IS NULL) AS sin_ubicacion
FROM trida.transacciones;

-- Alertas sin transacción asociada
SELECT a.id_alerta, a.id_transaccion
FROM trida.alertas a
LEFT JOIN trida.transacciones t ON t.id_transaccion = a.id_transaccion
WHERE t.id_transaccion IS NULL;
```

### 9.10 Operaciones de mantenimiento

> ⚠️ Las siguientes operaciones modifican datos. Ejecutar con precaución.

```sql
-- Desactivar un usuario
UPDATE trida.usuarios_sistemas SET estado = FALSE
WHERE email = 'usuario@trida.co';

-- Reactivar un usuario
UPDATE trida.usuarios_sistemas SET estado = TRUE
WHERE email = 'usuario@trida.co';

-- Cambiar rol de un usuario
UPDATE trida.usuarios_sistemas SET rol = 'ADMINISTRADOR'
WHERE email = 'usuario@trida.co';

-- Resetear el último acceso de un usuario
UPDATE trida.usuarios_sistemas SET ultimo_acceso = NULL
WHERE email = 'usuario@trida.co';
```

> ⛔ La tabla `logs_auditoria` tiene RULES que bloquean UPDATE y DELETE.
> Los registros de auditoría son inmutables por diseño.

---

## 10. Decisiones Técnicas

### 10.1 ¿Por qué el Patrón Adapter para la IA?

El patrón Adapter es vital para la modularidad del sistema. Permite
conectar con Gemini hoy pero deja el sistema listo para cambiar a
cualquier otra IA simplemente cambiando el adaptador, sin necesidad
de modificar el código principal de las transacciones.

### 10.2 ¿Por qué PostgreSQL?

PostgreSQL permite mantener un esquema relacional robusto normalizado
en tercera forma normal, con integridad referencial garantizada
mediante relaciones explícitas entre las 10 tablas del dominio y
constraints que validan los datos directamente en la base de datos.

### 10.3 ¿Por qué el Núcleo TriDa como orquestador central?

El diseño del Núcleo como orquestador central evita la dispersión
de la lógica de decisión entre múltiples servicios, un antipatrón
frecuente que genera inconsistencias y dificulta el mantenimiento.
El Núcleo no procesa directamente ninguna señal individual: coordina,
agrega y decide.

### 10.4 ¿Por qué funciones SQL en lugar de queries directos?

Todos los endpoints invocan funciones del schema `trida` en lugar de
ejecutar SQL directo sobre las tablas. Este diseño centraliza la lógica
de acceso a datos en la base de datos, facilita el mantenimiento y
permite modificar las consultas sin tocar el código del backend.

---

## 11. Estructura del Proyecto

> En desarrollo

---

## 12. Variables de Entorno

> En desarrollo
