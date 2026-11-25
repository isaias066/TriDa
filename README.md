# TriDa

> **Guardián Financiero y de Ciberseguridad Personal Impulsado por Inteligencia Artificial**

---

## Tabla de Contenidos

1. [¿Qué es TriDa?](#1-qué-es-trida)
2. [Características Principales](#2-características-principales)
3. [Arquitectura del Sistema](#3-arquitectura-del-sistema)
4. [Patrones Arquitectónicos](#4-patrones-arquitectónicos)
5. [Stack Tecnológico](#5-stack-tecnológico)
6. [Requisitos Previos e Instalación](#6-requisitos-previos-e-instalación)
7. [Variables de Entorno](#7-variables-de-entorno)
8. [Estructura del Proyecto](#8-estructura-del-proyecto)
9. [Modelo y Esquema de Base de Datos (`schema: trida`)](#9-modelo-y-esquema-de-base-de-datos-schema-trida)
10. [Documentación de la API REST (`/api/v1`)](#10-documentación-de-la-api-rest-apiv1)
11. [Seguridad, Privacidad y Cumplimiento (Ley 1581)](#11-seguridad-privacidad-y-cumplimiento-ley-1581)
12. [Estándares de Desarrollo y Contribución](#12-estándares-de-desarrollo-y-contribución)
13. [Estado del Proyecto y Licencia](#13-estado-del-proyecto-y-licencia)

---

## 1. ¿Qué es TriDa?

**TriDa** es un **copiloto inteligente de protección financiera y ciberseguridad cotidiana** centrado en el usuario. Al vincularse de forma segura con tus cuentas y notificaciones, analiza en tiempo real movimientos enviados y recibidos, alertas SMS/push y enlaces web para **detectar intentos de estafa, suplantación (*phishing/smishing*) y fugas de dinero antes de que afecten tu patrimonio**.

A diferencia de los monitores pasivos tradicionales, TriDa convierte los datos en **acción preventiva**:
- Evalúa la seguridad de cualquier **sitio web o enlace** antes de que ingreses tus credenciales o datos de pago.
- Analiza **en qué se está yendo tu dinero** (gastos hormiga, suscripciones ocultas y flujo de caja).
- Diagnostica tu **vida crediticia** y capacidad de endeudamiento para prevenir mora o sobreendeudamiento.
- Genera **Planes Personalizados de Protección/Ciberseguridad y de Ahorro** mediante Inteligencia Artificial.
- Entrega un **Reporte Mensual del Guardián** que resume a cuántas situaciones sospechosas estuviste expuesto, el dinero protegido y tu progreso financiero.

---

## 2. Características Principales

| Módulo / Capacidad | Descripción |
| --- | --- |
| **Escudo en Tiempo Real (< 500 ms)** | Ingesta y normalización continua de transacciones enviadas/recibidas y notificaciones bancarias o SMS. |
| **Verificador de Sitios Web (URLs)** | Analiza certificados TLS/SSL, antigüedad del dominio, redirecciones ocultas y *typosquatting* antes de navegar. |
| **Motor de Criticidad + Explicabilidad** | Calcula un score de riesgo (0,0 % – 100,0 %) y traduce los factores técnicos a español cotidiano y empático. |
| **Alertas Preventivas por Criticidad** | Clasificación en 3 niveles: **Baja** (30–49 %), **Media** (50–79 %) y **Alta** (80–95 %) con despacho multicanal. |
| **Protocolo Escudo Crítico (> 95 %)** | Alerta prioritaria simultánea (Push, Email y SMS en < 30 s) con guía inmediata de contención ante estafas severas. |
| **Radiografía de Gastos** | Clasificación automática de ingresos y egresos, detección de gastos hormiga y alertas de desviación de presupuesto. |
| **Diagnóstico de Vida Crediticia** | Monitoreo de relación deuda/ingreso, uso de cupos de crédito, puntualidad de pagos y alertas de vencimiento. |
| **Planes Generados por IA** | Creación y recalibración dinámica de un **Plan de Protección/Seguridad** y un **Plan de Ahorro** a la medida. |
| **Reporte Mensual del Guardián** | Consolidado mensual de amenazas cercanas evitadas, monto protegido, balance financiero y exportación (PDF/XLSX/CSV). |
| **Privacidad por Diseño (ARCO)** | Cero almacenamiento de contraseñas bancarias, enmascaramiento de PII antes de IA y cumplimiento de Ley 1581 de 2012. |

---

## 3. Arquitectura del Sistema

### 3.1 Visión General (Tres Capas Desacopladas)

TriDa está construido bajo una arquitectura modular de alta cohesión y bajo acoplamiento:

- **Frontend (Cliente Web Responsivo)**: React 18 + Vite + Tailwind CSS + TypeScript. Se comunica con el backend mediante API REST sobre HTTPS/TLS 1.3 con tokens JWT.
- **Backend (Núcleo del Guardián)**: Node.js 22 + Express.js + TypeScript. Orquesta la ingesta de eventos, el análisis de URLs, la evaluación crediticia, el enmascaramiento de datos sensibles (`PIIMasker`) y la generación de planes.
- **Base de Datos**: PostgreSQL 17 con esquema relacional normalizado en 3FN (`schema: trida`), funciones almacenadas (`trida.fn_*`) y reglas de auditoría inmutable (`RULES`).
- **IA Externa**: Gemini API integrada mediante **Adapter Pattern**, garantizando explicabilidad y planes accionables sin acoplar el núcleo a un único proveedor.

```text
┌────────────────────────────────────────────────────────────────────┐
│                        CLIENTE (Browser / PWA)                     │
│                React 18 + Vite + Tailwind CSS + TS                 │
│                          localhost:5173                            │
└─────────────────────────────────┬──────────────────────────────────┘
                                  │ API REST sobre HTTPS (TLS 1.3)
                                  │ Authorization: Bearer <JWT>
                                  ▼
┌────────────────────────────────────────────────────────────────────┐
│                       BACKEND (Express.js)                         │
│                         localhost:5000                             │
│                                                                    │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                       NÚCLEO TRIDA                           │  │
│  │  Orquestador central del Guardián:                           │  │
│  │  • Ingesta de movimientos y notificaciones (SMS/Push)        │  │
│  │  • Verificación de seguridad de sitios web (URLs)            │  │
│  │  • Análisis de gastos y vida crediticia                      │  │
│  │  • Generación y seguimiento de Planes de Protección y Ahorro │  │
│  └──────────────────────────────┬───────────────────────────────┘  │
│                                 │                                  │
│  ┌──────────────────────────────▼───────────────────────────────┐  │
│  │            PIIMasker + INTERFAZ IA (Adapter Pattern)         │  │
│  │  Anonimiza datos personales y traduce contratos hacia IA     │  │
│  └──────────────────────────────┬───────────────────────────────┘  │
└──────────────┬──────────────────┼──────────────────┬───────────────┘
               │ pg Pool          │ HTTPS            │ HTTPS
               ▼                  ▼                  ▼
┌──────────────────────┐ ┌──────────────────┐ ┌──────────────────────┐
│   BASE DE DATOS      │ │   IA EXTERNA     │ │ INTELIGENCIA WEB     │
│   (PostgreSQL 17)    │ │  (Gemini API)    │ │ (SSL / Reputación)   │
│   schema: trida      │ │                  │ │                      │
│   12 tablas (3FN)    │ │ • Score 0-100 %  │ │ • Validez TLS/SSL    │
│   pgcrypto + RULES   │ │ • Explicabilidad │ │ • Antigüedad dominio │
│                      │ │ • Planes IA      │ │ • Anti-Phishing      │
└──────────────────────┘ └──────────────────┘ └──────────────────────┘
```

### 3.2 Flujo del Backend por Capas

El **Núcleo TriDa** actúa como orquestador central: evita la dispersión de lógica de decisión entre múltiples servicios coordinando el enriquecimiento, la anonimización y la respuesta final.

```text
HTTP Request
     │
     ▼
┌──────────────────┐
│      Router      │  Define rutas /api/v1/* y aplica middlewares de seguridad
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│    Controller    │  Valida payload con Zod, extrae req.user, invoca servicio
└────────┬─────────┘
         │
         ▼
┌───────────────────────────────────────────┐
│               NÚCLEO TRIDA                │
│  Orquestador central del flujo preventivo │
└────────┬─────────────────────────┬────────┘
         │                         │
         ▼                         ▼
┌──────────────────┐      ┌──────────────────┐
│     Service      │      │    PIIMasker +   │
│  Finanzas, URLs, │      │  IAIAdapter      │
│  Crédito, Planes │      │  (Gemini API)    │
└────────┬─────────┘      └────────┬─────────┘
         │                         │
         ▼                         ▼
┌──────────────────┐      ┌──────────────────┐
│   PostgreSQL     │      │  Audit Log       │
│  trida.fn_*()    │      │  logs_auditoria  │
└──────────────────┘      └──────────────────┘
```

### 3.3 Cadena de Middlewares (Express)

```text
Request → helmet → cors → express.json() → rateLimiter → verifyToken → verifyOwnership / requireAdmin → controller → Response
```

| Middleware | Propósito | Alcance |
| --- | --- | --- |
| `helmet` | Cabeceras HTTP de seguridad (`HSTS`, `CSP`, `X-Frame-Options: DENY`) | Global |
| `cors` | Control estricto de orígenes permitidos vía `FRONTEND_URL` (prohibido `*`) | Global |
| `express.json()` | Parsing de payloads JSON con control de tamaño | Global |
| `rateLimiter` | Protección contra fuerza bruta y abuso (máx. 100 req/min por IP) | Global / Auth / URLs |
| `verifyToken` | Valida firma JWT y adjunta `req.user` (`{ id_usuario, email, rol, nombre }`) | Rutas protegidas |
| `verifyOwnership` | Garantiza aislamiento total: cada usuario solo accede a sus propios registros | `/api/v1/guardian/*` |
| `requireAdmin` | Restringe acceso al rol `ADMINISTRADOR` | `/api/v1/admin/*` |

### 3.4 Arquitectura Modular del Frontend

El cliente web está estructurado en **seis módulos autónomos** bajo enfoque *Mobile-First* y soporte **Dark/Light Mode**:

1. **Autenticación y Seguridad de Cuenta**: Registro, login, recuperación sin enumeración y MFA (TOTP).
2. **Centro de Mando del Guardián (Dashboard)**: Índice de exposición mensual, alertas activas con código de color, flujo financiero y progreso de planes.
3. **Escáner de Sitios Web y Enlaces**: Verificador instantáneo de URLs con diagnóstico SSL, antigüedad de dominio y alerta anti-phishing.
4. **Finanzas Personales y Vida Crediticia**: Radiografía de gastos por categoría, detección de gastos hormiga y salud de endeudamiento.
5. **Planes Inteligentes de IA**: Gestión interactiva del **Plan de Protección/Seguridad** y del **Plan de Ahorro**.
6. **Reportes del Guardián y Privacidad (ARCO)**: Descarga de reportes mensuales (PDF/XLSX/CSV), vinculación de cuentas y ejercicio de derechos Habeas Data.

---

## 4. Patrones Arquitectónicos

| Patrón | Implementación en TriDa | Beneficio Clave |
| --- | --- | --- |
| **Adapter Pattern (IA)** | Interfaz `IAIAdapter` implementada por `GeminiAdapter` (conmutable por configuración a OpenAI/Claude/Local). | Permite cambiar el proveedor de IA sin alterar el Núcleo TriDa ni los servicios financieros. |
| **Privacy-by-Design (`PIIMasker`)** | Servicio intermedio que enmascara nombres, cédulas y números de cuenta antes de enviar contexto a la API externa de IA. | Cumple la Ley 1581 de 2012 evitando fuga de información personal identificable (PII). |
| **Funciones SQL (`schema trida`)** | Todos los endpoints invocan funciones almacenadas (`SELECT * FROM trida.fn_nombre($1)`) en lugar de SQL crudo. | Centraliza reglas de consulta, garantiza filtrado por `id_usuario` y desacopla las tablas. |
| **Auditoría Inmutable (`RULES`)** | Reglas `logs_no_update` y `logs_no_delete` en PostgreSQL sobre `trida.logs_auditoria` + hash SHA-256. | Impide modificar o borrar registros de seguridad incluso desde conexiones privilegiadas. |
| **RBAC + Aislamiento de Titular** | Roles `USUARIO` (acceso exclusivo a sus datos) y `ADMINISTRADOR` (salud técnica y modelos IA, sin ver finanzas privadas). | Garantiza confidencialidad patrimonial y principio de mínimo privilegio. |
| **Anti-Enumeración** | `login` y `forgot-password` devuelven mensajes y tiempos de respuesta genéricos sin revelar existencia de correos. | Protege contra ataques de descubrimiento de cuentas (OWASP A07). |

---

## 5. Stack Tecnológico

### Stack Actual (MVP)

| Capa | Tecnología | Versión | Función |
| --- | --- | --- | --- |
| **Runtime & Backend** | Node.js + Express.js + TypeScript | 22 LTS / 4.x / 5.x | API RESTful v1 y Núcleo Orquestador |
| **Base de Datos** | PostgreSQL (`schema: trida`) | 17 | Persistencia relacional 3FN, `pgcrypto` y `RULES` |
| **ORM / Driver** | Prisma ORM / `pg` (Pool) | 6.x / 8.x | Migraciones versionadas y ejecución de funciones SQL |
| **Motor de IA** | Gemini API (vía `IAIAdapter`) | v1 | Scoring de riesgo, explicabilidad y planes de ahorro/protección |
| **Validación & Seguridad** | Zod + Helmet + JWT + bcrypt | 3.x / 8.x / 9.x / 5.x | Esquemas estrictos, cabeceras seguras, tokens y hash (`cost = 12`) |
| **Frontend** | React + Vite + Tailwind CSS + TS | 18.3 / 5.4 / 3.4 / 5.5 | Interfaz responsiva con Dark/Light Mode sin degradados |
| **Iconografía & Mapas** | `lucide-react` + Leaflet | 0.453 / 1.9 | Iconografía unificada exclusiva y contexto geográfico |
| **Gestor de Paquetes** | `pnpm` (`save-exact=true`) | 10+ | Único gestor permitido (`npm` y `yarn` prohibidos) |

### Stack Objetivo (v2.0 — Escalabilidad Avanzada)

- **Caché y Colas Prioritarias**: Redis 7+ (TTL para dominios verificados y cola de alta prioridad para Escudo Crítico > 95 %).
- **Auditoría Distribuida**: MongoDB 8 (`append-only` collection).
- **Microservicio ML Local**: Python 3.12 + TensorFlow 2.18 + Scikit-learn 1.6.
- **Orquestación y Observabilidad**: Kubernetes, Nginx Load Balancer, Prometheus + Grafana y CI/CD con GitHub Actions.

---

## 6. Requisitos Previos e Instalación

### Requisitos Previos

- **Node.js** 22 LTS
- **pnpm** 10+ (`corepack enable` o `npm install -g pnpm`)
- **PostgreSQL** 17
- **API Key de Gemini** (obtenida en Google AI Studio)
- **Docker** y **Docker Compose** (vía recomendada)

### Opción A: Instalación con Docker (Recomendada)

```bash
# 1. Clonar el repositorio
git clone [https://github.com/isaias066/TriDa.git](https://github.com/isaias066/TriDa.git)
cd TriDa

# 2. Configurar variables de entorno
cp .env.example .env
# Edita .env con tus credenciales de PostgreSQL, JWT_SECRET, ENCRYPTION_KEY y GEMINI_API_KEY

# 3. Construir y levantar los servicios
docker compose up --build

# Servicios disponibles:
# - Frontend (Dashboard Guardián): http://localhost:5173
# - Backend (API REST v1):         http://localhost:5000
```

### Opción B: Instalación Local (Sin Docker)

```bash
# 1. Clonar el repositorio
git clone [https://github.com/isaias066/TriDa.git](https://github.com/isaias066/TriDa.git)
cd TriDa

# 2. Crear y poblar la base de datos en PostgreSQL 17
createdb TriDa
psql -d TriDa -f database/schema.sql
psql -d TriDa -f database/seed.sql

# 3. Configurar e iniciar el Backend
cd backend
cp .env.example .env
pnpm install
pnpm prisma generate
pnpm dev
# API corriendo en http://localhost:5000

# 4. Configurar e iniciar el Frontend (en otra terminal)
cd ../frontend
pnpm install
pnpm dev
# Interfaz corriendo en http://localhost:5173
```

### Primer Acceso

```bash
# Sembrar datos iniciales y usuario administrador de prueba
cd backend
pnpm seed:admin
```

---

## 7. Variables de Entorno

El servidor valida todas las variables al iniciar mediante `Zod`. **Si falta alguna variable obligatoria, la aplicación detiene el arranque automáticamente.**

| Variable | Obligatoria | Ejemplo | Descripción |
| --- | --- | --- | --- |
| `DATABASE_URL` | ✅ Sí | `postgresql://postgres:pass@localhost:5432/TriDa` | Cadena de conexión a PostgreSQL 17 |
| `JWT_SECRET` | ✅ Sí | `clave_secreta_super_segura_min_32_caracteres` | Llave de firma para tokens JWT |
| `GEMINI_API_KEY` | ✅ Sí | `AIzaSy...` | API Key para el proveedor de IA (`GeminiAdapter`) |
| `ENCRYPTION_KEY` | ✅ Sí | `0123456789abcdef0123456789abcdef...` | Llave AES-256 (32 bytes) para cifrado en reposo |
| `PORT` | No | `5000` | Puerto HTTP del backend Express |
| `JWT_ACCESS_EXPIRES` | No | `15m` | Tiempo de vida del Access Token |
| `JWT_REFRESH_EXPIRES` | No | `24h` | Tiempo de vida del Refresh Token |
| `FRONTEND_URL` | No | `http://localhost:5173` | Origen permitido en política CORS |
| `EMAIL_USER` | No | `alertas@trida.co` | Cuenta SMTP para notificaciones y recuperación |
| `EMAIL_PASS` | No | `app_password_smtp` | Contraseña de aplicación SMTP |
| `EMAIL_FROM` | No | `TriDa Guardián <alertas@trida.co>` | Remitente oficial de correos |

---

## 8. Estructura del Proyecto

```text
TriDa/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma               # Modelos de datos y migraciones
│   ├── src/
│   │   ├── adapters/
│   │   │   ├── aiAdapter.interface.ts  # Contrato estándar IAIAdapter
│   │   │   └── geminiAdapter.ts        # Implementación con Gemini API
│   │   ├── config/
│   │   │   └── env.ts                  # Validación centralizada de entorno con Zod
│   │   ├── controllers/
│   │   │   ├── authController.ts       # Registro, login, MFA y reset password
│   │   │   ├── guardianController.ts   # Dashboard y Reporte Mensual del Guardián
│   │   │   ├── eventsController.ts     # Ingesta de movimientos y notificaciones
│   │   │   ├── alertsController.ts     # Gestión y feedback de alertas preventivas
│   │   │   ├── urlScannerController.ts # Verificador de seguridad de sitios web
│   │   │   ├── financesController.ts   # Radiografía de gastos y vida crediticia
│   │   │   ├── plansController.ts      # Planes de Protección y Ahorro con IA
│   │   │   ├── privacyController.ts    # Derechos ARCO (Ley 1581 de 2012)
│   │   │   └── adminController.ts      # Salud técnica y ciclo de vida de modelos
│   │   ├── middlewares/
│   │   │   ├── auth.ts                 # verifyToken, verifyOwnership, requireAdmin
│   │   │   ├── rateLimiter.ts          # Control de tasa de peticiones
│   │   │   └── errorHandler.ts         # Manejo global sin exposición de stack traces
│   │   ├── routes/                     # Rutas versionadas /api/v1/*
│   │   ├── services/
│   │   │   ├── tridaCore.ts            # Núcleo orquestador del Guardián
│   │   │   ├── piiMasker.ts            # Anonimización de PII antes de IA
│   │   │   ├── riskScoring.ts          # Motor de score y reglas heurísticas
│   │   │   └── urlAnalyzer.ts          # Validación SSL, dominio y anti-SSRF
│   │   └── app.ts                      # Configuración de Express y middlewares
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── api/                        # Cliente HTTP y módulos tipados por dominio
│   │   ├── components/                 # Componentes UI, layouts y tarjetas del Guardián
│   │   ├── hooks/                      # Hooks de estado, alertas y tema Dark/Light
│   │   ├── pages/                      # Dashboard, UrlScanner, Finances, Plans, Privacy
│   │   ├── constants/                  # Códigos HTTP, umbrales y mensajes en español
│   │   └── App.tsx
│   ├── package.json
│   └── vite.config.ts
├── database/
│   ├── schema.sql                      # DDL completo, funciones trida.fn_* y RULES
│   └── seed.sql                        # Catálogo de entidades financieras y datos base
├── documentacion/
│   ├── requisitos/                     # RF-001..RF-024 y RNF-001..RNF-014
│   ├── referencia-tecnica/             # Arquitectura, Patrones y Esquema BD
│   ├── configuracion/                  # Restricciones y guías de despliegue
│   └── proceso/                        # Historias de usuario y casos de uso
├── docker-compose.yml
├── pnpm-workspace.yaml
└── README.md
```

---

## 9. Modelo y Esquema de Base de Datos (`schema: trida`)

PostgreSQL 17 implementa un esquema relacional normalizado en 3FN bajo el namespace `trida` con la extensión `pgcrypto` y precisión monetaria exacta (`NUMERIC(15, 2)`).

### 9.1 Diagrama Entidad-Relación (ER)

```text
┌──────────────────────────┐       ┌──────────────────────────────────┐
│          bancos          │       │             usuarios             │
├──────────────────────────┤       ├──────────────────────────────────┤
│ PK id_banco       SERIAL │       │ PK id_usuario          SERIAL    │
│    codigo         UQ     │       │    nombre_completo     VARCHAR   │
│    nombre         VARCHAR│       │    email               UQ        │
│    color          VARCHAR│       │    password_hash       TEXT      │
│    estado         BOOL   │       │    rol                 VARCHAR   │
└────────────┬─────────────┘       │    mfa_habilitado      BOOL      │
             │ 1                   │    estado              BOOL      │
             │                     └─┬──────┬──────┬──────┬──────┬────┘
             │ N                     │ 1    │ 1    │ 1    │ 1    │ 1
┌────────────▼─────────────────────┐ │      │      │      │      │
│       cuentas_vinculadas         │ │      │      │      │      │
├──────────────────────────────────┤ │      │      │      │      │
│ PK id_cuenta          SERIAL     │ │      │      │      │      │
│ FK id_usuario         → usuarios ◄─┘      │      │      │      │
│ FK id_banco           → bancos   │        │      │      │      │
│    alias_cuenta       VARCHAR    │        │      │      │      │
│    ultimos_digitos    CHAR(4)    │        │      │      │      │
│    tipo_producto      VARCHAR    │        │      │      │      │
│    lectura_notif      BOOL       │        │      │      │      │
└────────────┬─────────────────────┘        │      │      │      │
             │ 1                            │      │      │      │
             │ N                            │      │      │      │
┌────────────▼─────────────────────┐        │      │      │      │
│       eventos_financieros        │        │      │      │      │
├──────────────────────────────────┤        │      │      │      │
│ PK id_evento          SERIAL     │        │      │      │      │
│ FK id_usuario         → usuarios ◄────────┘      │      │      │
│ FK id_cuenta          → cuentas  │               │      │      │
│    tipo_evento        VARCHAR    │               │      │      │
│    es_ingreso         BOOLEAN    │               │      │      │
│    categoria_gasto    VARCHAR    │               │      │      │
│    monto              NUMERIC    │               │      │      │
│    comercio_remitente VARCHAR    │               │      │      │
│    canal_origen       VARCHAR    │               │      │      │
│    score_riesgo       NUMERIC    │               │      │      │
│    explicacion_ia     TEXT       │               │      │      │
└────────────┬─────────────────────┘               │      │      │
             │ 1                                   │      │      │
             │                                     │      │      │
             │       ┌─────────────────────────────┘      │      │
             │       ▼                                    │      │
             │  ┌──────────────────────────────────┐      │      │
             │  │          analisis_urls           │      │      │
             │  ├──────────────────────────────────┤      │      │
             │  │ PK id_analisis        SERIAL     │      │      │
             │  │ FK id_usuario         → usuarios │      │      │
             │  │    url_analizada      TEXT       │      │      │
             │  │    dominio            VARCHAR    │      │      │
             │  │    veredicto          VARCHAR    │      │      │
             │  │    score_riesgo       NUMERIC    │      │      │
             │  │    ssl_valido         BOOLEAN    │      │      │
             │  │    explicacion_ia     TEXT       │      │      │
             │  └────────────────┬─────────────────┘      │      │
             │                   │ 1                      │      │
             │ N                 │ N                      │      │
             ▼                   ▼                        │      │
┌──────────────────────────────────────────┐              │      │
│                 alertas                  │              │      │
├──────────────────────────────────────────┤              │      │
│ PK id_alerta             SERIAL          │              │      │
│ FK id_usuario            → usuarios      │              │      │
│ FK id_evento             → eventos (opt) │              │      │
│ FK id_analisis_url       → urls (opt)    │              │      │
│    nivel_criticidad      VARCHAR         │              │      │
│    titulo                VARCHAR         │              │      │
│    recomendacion_accion  TEXT            │              │      │
│    estado_validacion     VARCHAR         │              │      │
└──────────────────────────────────────────┘              │      │
                                                          │      │
┌──────────────────────────────────┐       ┌──────────────▼──────┴────┐
│       perfiles_crediticios       │       │         planes_ia          │
├──────────────────────────────────┤       ├──────────────────────────┤
│ PK id_perfil          SERIAL     │       │ PK id_plan          SERIAL │
│ FK id_usuario         → usuarios ◄───────┤ FK id_usuario       → usu. │
│    puntaje_salud      SMALLINT   │       │    tipo_plan        VARCHAR│
│    nivel_riesgo       VARCHAR    │       │    titulo           VARCHAR│
│    relacion_deuda_ing NUMERIC    │       │    resumen_ia       TEXT   │
│    cupo_total         NUMERIC    │       │    recomendaciones  JSONB  │
│    cupo_utilizado     NUMERIC    │       │    progreso_pct     NUMERIC│
│    diagnostico_ia     TEXT       │       │    estado           VARCHAR│
└──────────────────────────────────┘       └──────────────────────────┘

┌──────────────────────────────────┐       ┌──────────────────────────┐
│        reportes_guardian         │       │      logs_auditoria      │
├──────────────────────────────────┤       ├──────────────────────────┤
│ PK id_reporte            SERIAL  │       │ PK id_log           SERIAL │
│ FK id_usuario            → usu.  │       │ FK id_usuario       → usu. │
│    periodo_mes           CHAR(7) │       │    tipo_accion      VARCHAR│
│    situaciones_sospech   INTEGER │       │    entidad_afectada VARCHAR│
│    estafas_evitadas      INTEGER │       │    descripcion      TEXT   │
│    monto_protegido       NUMERIC │       │    fecha_accion     TIMESTZ│
│    total_ingresos        NUMERIC │       │    direccion_ip     INET   │
│    total_gastos          NUMERIC │       └──────────────────────────┘
│    ahorro_logrado        NUMERIC │         ⛔ UPDATE y DELETE bloqueados
│    resumen_ejecutivo_ia  TEXT    │            por RULE en PostgreSQL
└──────────────────────────────────┘
```

*(Adicionalmente, las tablas `dispositivos` e `historico_de_ubicacion` se vinculan 1:N a `usuarios` para validar dispositivos de confianza y coherencia geográfica).*

### 9.2 Resumen de Tablas del Esquema

| Tabla | Descripción | Restricciones / Notas Clave |
| --- | --- | --- |
| `bancos` | Catálogo de 12 entidades financieras y billeteras digitales en Colombia. | `codigo` único (`bancolombia`, `nequi`, `daviplata`, `davivienda`, etc.). |
| `usuarios` | Titulares protegidos (`USUARIO`) y administradores (`ADMINISTRADOR`). | `password_hash` con `bcrypt`, soporte MFA TOTP y `consentimiento_arco`. |
| `cuentas_vinculadas` | Productos financieros vinculados para lectura de movimientos/notificaciones. | Solo almacena `ultimos_digitos` (`CHAR(4)`), jamás claves ni PAN completos. |
| `dispositivos` | Dispositivos registrados del usuario para detectar accesos inusuales. | `chk_fechas_dispositivo`: `fecha_ultimo_uso >= fecha_primer_uso`. |
| `historico_de_ubicacion` | Contexto geográfico (`INET`, país, ciudad, lat/lon) por dispositivo. | Validación de rango geográfico (`latitud` -90..90, `longitud` -180..180). |
| `eventos_financieros` | Movimientos enviados/recibidos, alertas bancarias, SMS y cobros recurrentes. | `monto >= 0`, `score_riesgo` (0–100), `categoria_gasto` y `explicacion_ia`. |
| `analisis_urls` | Historial de sitios web verificados y enlaces extraídos de mensajes. | `veredicto` (`SEGURO`, `PRECAUCION`, `PELIGROSO`), SSL y *typosquatting*. |
| `alertas` | Alertas preventivas generadas con acción recomendada y feedback del usuario. | `nivel_criticidad` (`BAJA`, `MEDIA`, `ALTA`, `CRITICA`) y `estado_validacion`. |
| `perfiles_crediticios` | Diagnóstico dinámico de salud crediticia, deuda/ingreso y uso de cupos. | `puntaje_salud` (0–100) y estado (`SALUDABLE`, `EN_OBSERVACION`, `SOBREENDEUDAMIENTO`). |
| `planes_ia` | Planes activos de `PROTECCION` y `AHORRO` generados por la IA. | Lista de tareas accionables en `JSONB` y cálculo de `progreso_porcentaje`. |
| `reportes_guardian` | Consolidado mensual de situaciones sospechosas, ahorro y monto protegido. | Único por `(id_usuario, periodo_mes)` en formato `YYYY-MM`. |
| `logs_auditoria` | Bitácora inmutable de seguridad, accesos y ejercicio de derechos ARCO. | **Inmutable por motor**: `CREATE RULE logs_no_update` y `logs_no_delete`. |

### 9.3 Catálogo de Funciones Almacenadas (`trida.fn_*`)

| Función SQL | Parámetros | Propósito |
| --- | --- | --- |
| `trida.fn_bancos()` | — | Lista las entidades financieras y billeteras activas del catálogo. |
| `trida.fn_login($1)` | `email VARCHAR` | Recupera credenciales, rol y estado MFA para autenticación. |
| `trida.fn_registrar_evento($1..$9)` | `id_usuario, id_cuenta, tipo, ...` | Persiste un movimiento o notificación junto con su score y categoría. |
| `trida.fn_registrar_analisis_url($1..$7)` | `id_usuario, url, dominio, ...` | Almacena el resultado del escáner de seguridad de un sitio web. |
| `trida.fn_alertas_usuario($1, $2)` | `id_usuario INT, nivel VARCHAR` | Consulta alertas preventivas del usuario filtrables por criticidad. |
| `trida.fn_validar_alerta_usuario($1..$3)` | `id_alerta, id_usuario, estado` | Registra confirmación (`LEGITIMA` / `ESTAFA_CONFIRMADA`) y calibra perfil. |
| `trida.fn_resumen_gastos($1, $2, $3)` | `id_usuario, inicio, fin` | Calcula distribución de egresos por categoría, ingresos y gastos hormiga. |
| `trida.fn_salud_crediticia($1)` | `id_usuario INT` | Obtiene el diagnóstico vigente de vida crediticia del titular. |
| `trida.fn_planes_activos($1)` | `id_usuario INT` | Retorna los planes activos de Protección/Seguridad y Ahorro. |
| `trida.fn_consolidar_reporte_guardian($1,$2)` | `id_usuario INT, periodo CHAR(7)` | Consolida las métricas mensuales del Reporte del Guardián. |

### 9.4 Consultas Rápidas de Diagnóstico

```sql
-- Conteo de registros por tabla en el schema trida
SELECT 'bancos' AS tabla, COUNT(*) AS registros FROM trida.bancos
UNION ALL SELECT 'usuarios',               COUNT(*) FROM trida.usuarios
UNION ALL SELECT 'cuentas_vinculadas',     COUNT(*) FROM trida.cuentas_vinculadas
UNION ALL SELECT 'eventos_financieros',    COUNT(*) FROM trida.eventos_financieros
UNION ALL SELECT 'analisis_urls',          COUNT(*) FROM trida.analisis_urls
UNION ALL SELECT 'alertas',                COUNT(*) FROM trida.alertas
UNION ALL SELECT 'perfiles_crediticios',   COUNT(*) FROM trida.perfiles_crediticios
UNION ALL SELECT 'planes_ia',              COUNT(*) FROM trida.planes_ia
UNION ALL SELECT 'reportes_guardian',      COUNT(*) FROM trida.reportes_guardian
UNION ALL SELECT 'logs_auditoria',         COUNT(*) FROM trida.logs_auditoria
ORDER BY tabla;

-- Efectividad de detección y retroalimentación de usuarios por nivel de alerta
SELECT nivel_criticidad,
    COUNT(*) AS total_alertas,
    COUNT(*) FILTER (WHERE estado_validacion = 'ESTAFA_CONFIRMADA') AS estafas_confirmadas,
    COUNT(*) FILTER (WHERE estado_validacion = 'LEGITIMA')          AS operaciones_legitimas
FROM trida.alertas
GROUP BY nivel_criticidad;
```

---

## 10. Documentación de la API REST (`/api/v1`)

Todos los endpoints protegidos requieren el encabezado HTTP:
```http
Authorization: Bearer <access_token_jwt>
```

### 10.1 Autenticación y Seguridad de Cuenta (`/api/v1/auth`)

| Método | Endpoint | Auth | Descripción |
| --- | --- | --- | --- |
| `POST` | `/api/v1/auth/register` | Pública | Registra un nuevo usuario titular con aceptación de política Habeas Data. |
| `POST` | `/api/v1/auth/login` | Pública | Autentica credenciales y retorna `accessToken` (15 min) + `refreshToken` (24 h). |
| `POST` | `/api/v1/auth/mfa/verify` | Parcial | Valida el código temporal TOTP cuando el usuario tiene MFA habilitado. |
| `POST` | `/api/v1/auth/forgot-password` | Pública | Envía enlace temporal de recuperación (respuesta neutra anti-enumeración). |
| `POST` | `/api/v1/auth/reset-password` | Pública | Restablece la contraseña mediante token firmado con expiración de 15 min. |

### 10.2 Centro del Guardián y Reporte Mensual (`/api/v1/guardian`)

| Método | Endpoint | Auth | Descripción |
| --- | --- | --- | --- |
| `GET` | `/api/v1/guardian/dashboard` | `USUARIO` | Retorna estado de seguridad del mes, alertas activas, gastos, crédito y planes. |
| `GET` | `/api/v1/guardian/monthly-report` | `USUARIO` | Consulta el Reporte Mensual del Guardián (`?periodo=YYYY-MM`). |
| `GET` | `/api/v1/guardian/monthly-report/export` | `USUARIO` | Exporta el reporte en formato `PDF`, `XLSX` o `CSV` (`?format=pdf`). |

### 10.3 Ingesta de Eventos y Alertas Preventivas (`/api/v1/events` y `/api/v1/alerts`)

| Método | Endpoint | Auth | Descripción |
| --- | --- | --- | --- |
| `POST` | `/api/v1/events/ingest` | `USUARIO` | Recibe transacción enviada/recibida o notificación SMS/push y calcula score IA. |
| `GET` | `/api/v1/events` | `USUARIO` | Lista movimientos y notificaciones con filtros combinables (fecha, tipo, monto, categoría). |
| `GET` | `/api/v1/alerts` | `USUARIO` | Obtiene alertas preventivas (`?nivel=ALTA&estado=PENDIENTE`). |
| `PATCH` | `/api/v1/alerts/:id/feedback` | `USUARIO` | Marca una alerta como `LEGITIMA` o `ESTAFA_CONFIRMADA` para calibrar el perfil. |

### 10.4 Escáner de Seguridad de Sitios Web (`/api/v1/url-check`)

| Método | Endpoint | Auth | Descripción |
| --- | --- | --- | --- |
| `POST` | `/api/v1/url-check` | `USUARIO` | Analiza una URL (SSL, antigüedad, redirecciones, *phishing*) y entrega veredicto. |
| `GET` | `/api/v1/url-check/history` | `USUARIO` | Consulta el historial de sitios verificados por el usuario. |

**Ejemplo de respuesta `POST /api/v1/url-check`:**
```json
{
  "url": "[https://verificacion-seguridad-bancolombia-co.xyz](https://verificacion-seguridad-bancolombia-co.xyz)",
  "domain": "verificacion-seguridad-bancolombia-co.xyz",
  "verdict": "PELIGROSO",
  "riskScore": 96.4,
  "sslValid": true,
  "domainAgeDays": 2,
  "isTyposquatting": true,
  "explanation": "Este sitio imita el nombre de tu entidad bancaria pero fue registrado hace apenas 2 días bajo una extensión sospechosa.",
  "immediateAction": "No ingreses tu usuario, clave ni dinámica. Cierra esta página de inmediato."
}
```

### 10.5 Finanzas, Vida Crediticia y Planes de IA (`/api/v1/finances` y `/api/v1/plans`)

| Método | Endpoint | Auth | Descripción |
| --- | --- | --- | --- |
| `GET` | `/api/v1/finances/expenses-breakdown` | `USUARIO` | Desglosa en qué se va el dinero por categoría y agrupa gastos hormiga. |
| `GET` | `/api/v1/finances/credit-health` | `USUARIO` | Devuelve puntaje de salud crediticia, relación deuda/ingreso y uso de cupos. |
| `GET` | `/api/v1/plans` | `USUARIO` | Obtiene los planes vigentes de `PROTECCION` y `AHORRO` del usuario. |
| `POST` | `/api/v1/plans/generate` | `USUARIO` | Genera o recalibra planes personalizados con IA a partir de datos reales. |
| `PATCH` | `/api/v1/plans/:id/tasks/:taskId` | `USUARIO` | Marca una recomendación del plan como completada o descartada. |

### 10.6 Cuentas Vinculadas y Privacidad ARCO (`/api/v1/accounts` y `/api/v1/privacy`)

| Método | Endpoint | Auth | Descripción |
| --- | --- | --- | --- |
| `GET` | `/api/v1/bancos` | `USUARIO` | Lista el catálogo de entidades financieras y billeteras soportadas. |
| `POST` | `/api/v1/accounts` | `USUARIO` | Vincula una cuenta o lectura de notificaciones (sin solicitar contraseñas). |
| `DELETE` | `/api/v1/accounts/:id` | `USUARIO` | Revoca la vinculación de una cuenta con efecto inmediato. |
| `GET` | `/api/v1/privacy/arco/export` | `USUARIO` | Derecho de Acceso: descarga una copia íntegra de los datos del titular. |
| `DELETE` | `/api/v1/privacy/arco/delete-account` | `USUARIO` | Derecho de Cancelación: purga definitiva e irreversible de datos personales. |

### 10.7 Administración Técnica (`/api/v1/admin`)

| Método | Endpoint | Auth | Descripción |
| --- | --- | --- | --- |
| `GET` | `/api/v1/admin/health` | `ADMINISTRADOR` (con MFA) | Monitoreo de salud de módulos, CPU, memoria y latencia p95. |
| `POST` | `/api/v1/admin/models/retrain` | `ADMINISTRADOR` (con MFA) | Ejecuta reentrenamiento del modelo con dataset 100 % anonimizado. |

---

## 11. Seguridad, Privacidad y Cumplimiento (Ley 1581)

TriDa opera bajo estándares estrictos de protección de datos personales (**Ley 1581 de 2012 — Colombia**), controles alineados con **ISO 27001:2022** y mitigación **OWASP Top 10**:

| Control de Seguridad / Privacidad | Estado | Detalle de Implementación |
| --- | --- | --- |
| **Principio de Cero Credenciales** | ✅ Activo | Prohibido solicitar o almacenar contraseñas bancarias, claves dinámicas o CVV. |
| **Enmascaramiento de PII (`PIIMasker`)** | ✅ Activo | Nombres, cédulas y cuentas se anonimizan antes de enviar contexto a Gemini API. |
| **Cifrado en Tránsito y Reposo** | ✅ Activo | HTTPS con **TLS 1.3** obligatorio y cifrado **AES-256** para datos sensibles en BD. |
| **Autenticación JWT + MFA** | ✅ Activo | Access tokens (15 min), Refresh tokens (24 h), `bcrypt` (`cost = 12`) y TOTP. |
| **Aislamiento de Datos (Anti-IDOR)** | ✅ Activo | Middleware `verifyOwnership` + consultas filtradas por `id_usuario` en SQL. |
| **Protección Anti-SSRF (Escáner URL)** | ✅ Activo | Bloqueo de rangos de IP privadas/locales (`127.0.0.1`, `10.0.0.0/8`, `192.168.0.0/16`). |
| **Sanitización Anti-XSS** | ✅ Activo | Escape estricto en contenido proveniente de mensajes SMS y notificaciones externas. |
| **Auditoría Inmutable** | ✅ Activo | `RULES` en PostgreSQL (`logs_no_update` / `logs_no_delete`) + hash SHA-256. |
| **Derechos ARCO Automatizados** | ✅ Activo | Panel de privacidad para Acceso, Rectificación, Cancelación y Oposición. |

---

## 12. Estándares de Desarrollo y Contribución

### Reglas Técnicas y de Código

- **Gestor de paquetes único**: Usar exclusivamente **`pnpm`** con versiones exactas (`save-exact=true` en `.npmrc`). Está prohibido usar `npm` o `yarn`.
- **Convención de idiomas**:
  - **Código en inglés**: variables, funciones, clases, componentes React, rutas API y modelos (`FinancialEvent`, `UrlAnalysis`, `ProtectionPlan`).
  - **Documentación y UX en español**: comentarios pedagógicos, commits descriptivos, mensajes de error, explicaciones de IA y reportes.
- **Cabecera pedagógica obligatoria** en todo archivo nuevo:
  ```typescript
  // ¿Qué? Descripción breve de la responsabilidad del módulo
  // ¿Para qué? Caso de uso o beneficio que aporta al usuario o al sistema
  // ¿Impacto? Cómo afecta a la seguridad, finanzas o estabilidad de TriDa
  ```
- **Precisión monetaria**: Utilizar siempre `Decimal` (`Prisma.Decimal` / `decimal.js`) con redondeo `HALF_UP`. Prohibido usar `number` o `float` nativo para dinero.
- **Diseño Visual (Frontend)**:
  - **Prohibido usar degradados** (`bg-gradient-*`); usar colores planos con bordes y sombras sutiles.
  - **Iconografía exclusiva**: utilizar únicamente **`lucide-react`**.
  - **Dark / Light Mode**: soporte obligatorio con toggle visible (Light `#FFFFFF` / Dark `#0B1D3A`).
  - **Accesibilidad WCAG 2.1 AA**: toda alerta debe combinar color + ícono + etiqueta textual.
- **Pruebas y Calidad**: `vitest` con cobertura ≥ 80 % en lógica crítica y validación estricta con `tsc --noEmit` y `pnpm audit`.

### Flujo Git y Commits

1. Crear rama desde `develop`: `git checkout -b feat/nombre-funcionalidad develop`
2. Usar **Conventional Commits**: `feat:`, `fix:`, `docs:`, `style:`, `refactor:`, `test:`, `chore:`.
3. Abrir Pull Request hacia `develop` verificando que los tests y linters pasen sin errores.

---

## 13. Estado del Proyecto y Licencia

| Módulo | Estado | Versión |
| --- | --- | --- |
| Autenticación, MFA y Control de Privacidad (ARCO) | ✅ Implementado | MVP 1.0 |
| Dashboard Unificado del Guardián | ✅ Implementado | MVP 1.0 |
| Ingesta de Movimientos y Notificaciones (SMS/Push) | ✅ Implementado | MVP 1.0 |
| Escáner de Seguridad de Sitios Web (URLs) | ✅ Implementado | MVP 1.0 |
| Radiografía de Gastos y Diagnóstico de Vida Crediticia | ✅ Implementado | MVP 1.0 |
| Generador y Seguimiento de Planes de Protección y Ahorro (IA) | ✅ Implementado | MVP 1.0 |
| Reporte Mensual del Guardián y Exportación (PDF/XLSX/CSV) | ✅ Implementado | MVP 1.0 |
| Bitácora Inmutable en PostgreSQL (`RULES`) | ✅ Implementado | MVP 1.0 |
| Caché Distribuida y Colas Prioritarias con Redis | 🔜 Planificado | v2.0 |
| Microservicio ML Local en Python (TensorFlow / Scikit-learn) | 🔜 Planificado | v2.0 |

### Licencia

Este proyecto se distribuye bajo la licencia **MIT**. Consulta el archivo [LICENSE](LICENSE) para más detalles.

---

<div align="center">

**TriDa — Tu Guardián Financiero y de Ciberseguridad Personal con Inteligencia Artificial**

*MVP 2026 · Revisión 1.0*

</div>
