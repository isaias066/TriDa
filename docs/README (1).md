# TriDa

> **Aplicación web de finanzas personales**

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
10. [Documentación de la API REST (`/api/v2`)](#10-documentación-de-la-api-rest-apiv2)
11. [Seguridad y privacidad](#11-seguridad-y-privacidad)
12. [Estándares de Desarrollo y Contribución](#12-estándares-de-desarrollo-y-contribución)
13. [Estado del Proyecto y Licencia](#13-estado-del-proyecto-y-licencia)

---

## 1. ¿Qué es TriDa?

TriDa es una aplicación web para administrar cuentas y movimientos financieros, consultar resúmenes, presupuestos, metas de ahorro y alertas generadas por reglas. Las transacciones manuales del backend solo se pueden registrar en cuentas de efectivo; otros tipos de cuenta reciben movimientos mediante el webhook autenticado. TriDa no se conecta directamente con bancos ni solicita credenciales bancarias.

El proyecto no integra actualmente un proveedor de IA. La evaluación de riesgo y los insights son reglas implementadas en el backend.

---

## 2. Características Principales

| Módulo disponible | Alcance actual |
| --- | --- |
| Autenticación | Registro, inicio/cierre de sesión, verificación de correo, recuperación y cambio de contraseña. El registro y los flujos por correo requieren SMTP configurado. |
| Finanzas | Cuentas, categorías, transacciones, presupuestos y metas de ahorro. Eliminar una cuenta la desactiva; no borra físicamente la cuenta. |
| Ingesta externa | Webhook de transacciones con secreto compartido, timestamp y firma HMAC. No conecta directamente con bancos. |
| Seguimiento | Dashboard, alertas/reglas de riesgo, dispositivos, insights, reportes, perfil y mapa de movimientos con ubicación disponible. |
| Auditoría | Consulta autenticada del historial de acciones propio. |

El contrato detallado está en Swagger (`/api/docs`) y en OpenAPI (`/api/docs.json`) cuando el backend no se ejecuta con `NODE_ENV=production`.

---

## 3. Arquitectura del Sistema

### 3.1 Arquitectura implementada

- **Frontend**: SPA React 18 + TypeScript servida por Vite. El cliente Axios usa `VITE_API_BASE_URL` (por defecto `http://localhost:3000/api/v2`) y JWT en rutas autenticadas.
- **Backend**: API Express 4 + TypeScript ejecutada en Node.js. Los módulos separan rutas, controladores y servicios; Zod valida entradas y Prisma accede a PostgreSQL.
- **Base de datos**: PostgreSQL, esquema `trida`. `database/schema.sql` instala el esquema y reglas SQL; Prisma Client se genera desde `backend/prisma/schema.prisma`. Algunas consultas usan SQL parametrizado.
- **Servicios externos**: SMTP es opcional, pero necesario para enviar correos; el mapa obtiene estilos y tiles de OpenFreeMap y la fuente Inter de Google Fonts desde el navegador. Un sistema externo puede enviar movimientos al webhook autenticado.
- **No configurado en el runtime actual**: proveedores de IA, agregadores bancarios, SMS/push, Redis, MongoDB, microservicios ML y Docker Compose.

```text
Navegador (React / Vite, localhost:5173)
  ├─ REST /api/v2 ───────────────> Backend Express (localhost:3000)
  │                                  ├─ Prisma / SQL ──> PostgreSQL (trida)
  │                                  └─ SMTP opcional ─> Servicio de correo
  └─ Tiles del mapa y fuente ─────> OpenFreeMap / Google Fonts

Sistema emisor ── webhook firmado ─> Backend Express
```

### 3.2 Flujo del backend

```text
HTTP request
  → global middleware
  → router del módulo (/api/v2/...)
  → requireAuth cuando la ruta lo exige
  → controller (validación Zod y respuesta)
  → service
  → Prisma o consulta SQL parametrizada
  → PostgreSQL
```

### 3.3 Cadena de Middlewares (Express)

```text
Request → requestLogger → helmet → cors → body parsers → rateLimiter → router
        → requireAuth (rutas protegidas) → controller → errorHandler → Response
```

| Middleware | Propósito | Alcance |
| --- | --- | --- |
| `requestLogger` | Añade ID de solicitud y registra metadatos de petición | Global |
| `helmet` | Cabeceras HTTP; CSP distinta según entorno | Global |
| `cors` | Permite el origen configurado en `FRONTEND_URL` | Global |
| `express.json()` | JSON con límite de 1 MB y retención del cuerpo bruto para firmar webhooks | Global |
| `apiRateLimiter` | Límite general; autenticación agrega límites específicos | Global / Auth |
| `requireAuth` | Valida JWT, usuario activo y versión del token | Rutas protegidas |
| `errorHandler` | Normaliza errores de validación, Prisma y aplicación | Al final de las rutas |

### 3.4 Aplicación web

Las rutas de la SPA están en `frontend/src/App.tsx`. Las páginas autenticadas incluyen dashboard, cuentas, transacciones, categorías, presupuestos, ahorro, insights, reportes, alertas/seguridad, perfil, dispositivos y mapa. Las rutas públicas incluyen inicio de sesión, registro, verificación de correo, recuperación de contraseña y confirmación de transacciones por correo.

---

## 4. Patrones Arquitectónicos

| Patrón | Implementación en TriDa | Beneficio Clave |
| --- | --- | --- |
| **Módulos por dominio** | Rutas, controladores y servicios organizados por dominio funcional. | Separa responsabilidades en la API. |
| **Validación de contratos** | Zod valida payloads y parámetros; Swagger/OpenAPI documenta operaciones. | Rechaza entradas que no cumplen los esquemas del backend. |
| **ORM y SQL parametrizado** | Prisma para acceso relacional y helper `queryRaw` para consultas SQL parametrizadas. | Acceso consistente al esquema `trida`. |
| **JWT** | `requireAuth` verifica firma, usuario activo y versión del token. | Protege las rutas autenticadas. |
| **Webhook firmado** | Secreto compartido, timestamp reciente y HMAC-SHA256 del cuerpo de la petición. | Autentica al emisor de movimientos externos. |

---

## 5. Stack Tecnológico

### Stack Actual (MVP)

| Capa | Dependencias principales | Versión declarada | Uso |
| --- | --- | --- | --- |
| Backend | Node.js, Express, TypeScript | Node `>=22.13.0`, Express 4, TypeScript 5 | API REST `/api/v2` |
| Datos | PostgreSQL, Prisma Client y Prisma CLI | Prisma 6 | Persistencia en los esquemas `trida` y `public` |
| Validación y seguridad | Zod, Helmet, CORS, express-rate-limit, jsonwebtoken, bcryptjs | Ver `backend/package.json` | Validación, HTTP, JWT y hash de contraseñas |
| Correo | Nodemailer | Ver `backend/package.json` | Verificación, recuperación y notificaciones por SMTP |
| Frontend | React, React DOM, React Router, Vite, TypeScript | React 18, Router 6, Vite 5, TypeScript 5 | SPA y compilación |
| UI y mapas | Tailwind CSS, lucide-react, MapLibre GL JS | Ver `frontend/package.json` | Estilos, iconos y mapa |
| Pruebas | Node test runner, Vitest, Testing Library | Ver manifiestos | Pruebas de contrato, integración y componentes |
| Workspace | pnpm | Lockfile `pnpm-lock.yaml` | Gestión de `frontend` y `backend` |

Los manifiestos y el lockfile son la fuente de verdad para dependencias y scripts. No hay un paquete raíz con comandos propios; ejecuta los scripts desde `backend` o `frontend`. El runtime no incluye conexión bancaria directa, proveedor de IA, Redis, MongoDB ni servicio ML externo.

---

## 6. Requisitos Previos e Instalación

### Requisitos Previos

- **Node.js** 22.13 o superior.
- **pnpm** compatible con el lockfile, habilitado mediante Corepack.
- **PostgreSQL** accesible desde el backend. `database/schema.sql` es el esquema instalado.
- **SMTP**, necesario para registrar/verificar usuarios y para los flujos de recuperación y notificación por correo.
- **psql / createdb**, para instalar el esquema SQL desde la terminal.

### Instalación local

```powershell
# 1. Instalar dependencias desde la raíz del monorepo
Set-Location C:\ruta\TriDa
corepack enable
pnpm install --frozen-lockfile

# 2. Crear la base de datos PostgreSQL e instalar el esquema
createdb TriDa
psql -d TriDa -v ON_ERROR_STOP=1 -f database/schema.sql

# 3. Configurar los archivos de entorno
Copy-Item .env.example backend\.env
Copy-Item frontend\.env.example frontend\.env
# Edita backend\.env: DATABASE_URL y JWT_SECRET son obligatorios.
# En desarrollo, frontend\.env puede dejar VITE_API_BASE_URL vacío:
# Vite usa http://localhost:3000/api/v2 como valor predeterminado.
# Para registro y correos, habilita SMTP_ENABLED=true y configura SMTP/EMAIL_*.
# Para habilitar la ingesta externa, configura también
# TRANSACTION_WEBHOOK_SECRET en backend\.env y en el sistema emisor.

# 4. Generar Prisma con el backend APAGADO
Set-Location backend
pnpm prisma:generate

# 5. Iniciar el backend
pnpm build
pnpm dev
# API disponible en http://localhost:3000
# Healthcheck: http://localhost:3000/health
# Readiness: http://localhost:3000/health/ready

# 6. Iniciar el frontend en otra terminal
Set-Location ..\frontend
pnpm dev
# Interfaz disponible en http://localhost:5173
```

El backend carga `backend/.env`; el frontend carga `frontend/.env`. No copies
credenciales reales a archivos versionados.

#### Build de producción del frontend

`pnpm build` en el frontend ejecuta primero los chequeos TypeScript. Los builds
que no sean de desarrollo requieren una URL HTTPS pública de la API. En
PowerShell:

```powershell
cd C:\ruta\TriDa\frontend
$env:VITE_API_BASE_URL = "https://api.example.com/api/v2"
pnpm build
Remove-Item Env:VITE_API_BASE_URL
```

Reemplaza `api.example.com` por el dominio real. También puedes definir el valor
en `frontend/.env.production` o en la configuración de variables de CI. No uses
la URL local del `.env` de desarrollo en un build de producción; Vite rechazará
HTTP y direcciones loopback.

#### Orden crítico de Prisma en Windows

El cliente Prisma se genera en `node_modules` y puede quedar bloqueado si el
backend todavía está ejecutándose. Antes de ejecutar `pnpm prisma:generate`,
`pnpm build` o una instalación que vuelva a generar Prisma:

1. Detén `pnpm dev` del backend.
2. Confirma que el puerto `3000` esté libre.
3. Ejecuta `pnpm prisma:generate`.
4. Inicia nuevamente el backend con `pnpm dev`.

Si aparece `EPERM: operation not permitted, rename ... query_engine-windows.dll.node`,
detén los procesos Node que usan el backend y repite la generación antes de
volver a iniciar el servidor.

#### Configurar la ingesta de transacciones por webhook (opcional)

Sin `TRANSACTION_WEBHOOK_SECRET`, el backend puede iniciar con normalidad, pero
`POST /api/v2/integrations/transactions/webhook` responde `503
WEBHOOK_NOT_CONFIGURED`. Para habilitarlo, genera una clave aleatoria de al menos
32 caracteres:

```powershell
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

Configura el mismo valor en `backend\.env` (`TRANSACTION_WEBHOOK_SECRET`) y en el
sistema que envía los movimientos. No lo publiques ni lo agregues al repositorio.
El emisor debe enviar `X-TriDa-Webhook-Secret`, un timestamp Unix de 10 dígitos
en `X-TriDa-Timestamp` y la firma HMAC-SHA256 hexadecimal del texto
`<timestamp>.<cuerpo JSON exacto>` en `X-TriDa-Signature`. También se acepta el
prefijo `sha256=` en la firma. El timestamp debe estar dentro de los cinco
minutos. Reinicia el backend tras modificar `.env`. El webhook procesa
movimientos externos y los gastos pueden requerir confirmación por correo;
para esas notificaciones también se necesita SMTP.

### Primer Acceso

Registra un usuario desde `/register`. En entornos distintos de `test`, el
backend exige SMTP funcional para enviar el enlace de verificación; sin él, el
registro no se completa. No existe un script `seed:admin`.

### Cuentas de ejemplo

El repositorio incluye una semilla de PostgreSQL con cuatro cuentas de usuario
de ejemplo para recorrer las funciones de la aplicación. La
[guía de cuentas de ejemplo](./CUENTAS_EJEMPLO.md) describe los perfiles, los
datos incluidos y cómo cargarla de forma segura. Ejecútala una sola vez y solo
en una base local o de pruebas aislada; no la uses en producción.

---

## 7. Variables de Entorno

El backend carga `backend/.env` y valida con Zod las variables que usa el
servidor. Copia el ejemplo raíz `.env.example` a `backend/.env`. El frontend
usa `frontend/.env`; `VITE_API_BASE_URL` se lee durante el build/desarrollo de
Vite, no desde la configuración del backend.

| Variable | Requerida / predeterminada | Uso |
| --- | --- | --- |
| `DATABASE_URL` | Requerida | Cadena de conexión a PostgreSQL |
| `JWT_SECRET` | Requerida; mínimo 32 caracteres | Firma de tokens JWT |
| `PORT` | `3000` | Puerto HTTP del backend |
| `NODE_ENV` | `development` | Swagger se monta cuando no es `production` |
| `FRONTEND_URL` | `http://localhost:5173` | Origen CORS permitido |
| `TRUST_PROXY` | `false` | Activa la confianza en el proxy Express |
| `APP_TIMEZONE` | `America/Bogota` | Zona horaria de operaciones que la usan |
| `JWT_EXPIRES_IN` | `8h` | Vigencia de JWT |
| `TRANSACTION_WEBHOOK_SECRET` | Opcional; el endpoint requiere al menos 32 caracteres | Secreto compartido para el webhook |
| `SMTP_ENABLED`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE` | SMTP deshabilitado por defecto; puerto predeterminado `587` | Transporte SMTP |
| `EMAIL_USER`, `EMAIL_PASS`, `EMAIL_FROM` | Credenciales opcionales; remitente predeterminado `TriDa App` | Envío de correo |
| `VITE_API_BASE_URL` | Desarrollo: `http://localhost:3000/api/v2`; otros builds: requerido y HTTPS | URL base de la API; se configura en `frontend/.env` o el entorno del build |
| `TEST_DATABASE_URL` | Solo la prueba de integración | PostgreSQL exclusivo, con nombre que identifique una base de test y distinto de `DATABASE_URL` |

`TEST_DATABASE_URL` se consume por el archivo de integración; no es una
variable validada por el servidor en `backend/src/config.ts`. Los correos de
registro/verificación y recuperación no funcionan sin un SMTP utilizable.

---

## 8. Estructura del Proyecto

```text
TriDa/
├── backend/
│   ├── prisma/schema.prisma
│   ├── src/
│   │   ├── app.ts, config.ts, index.ts
│   │   ├── config/         # Swagger/OpenAPI
│   │   ├── db/             # Prisma y consultas parametrizadas
│   │   ├── middlewares/
│   │   ├── modules/        # auth, accounts, transactions, reports, etc.
│   │   ├── tests/
│   │   └── utils/
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   └── App.tsx, main.tsx
│   └── package.json
├── database/
│   ├── schema.sql
│   └── seed_trida_bogota.sql
├── docs/
├── pnpm-workspace.yaml
└── pnpm-lock.yaml
```

El workspace pnpm contiene únicamente `backend` y `frontend`; no hay
`package.json` raíz ni scripts de ejecución en la raíz.

---

## 9. Modelo y Esquema de Base de Datos (`schema: trida`)

Las definiciones vigentes están en `database/schema.sql` (instalador del esquema SQL) y `backend/prisma/schema.prisma` (modelos que usa Prisma Client). El esquema Prisma declara PostgreSQL y el namespace `trida`; no existe un modelo de bancos vinculados ni de análisis de URL en el código actual.

Los modelos Prisma cubren:

| Área | Modelos / tablas principales |
| --- | --- |
| Identidad y seguridad | `usuario` / `usuarios`, `perfil_financiero`, `dispositivo` / `dispositivos`, `ubicacion` / `ubicaciones`, `log_auditoria` / `logs_auditoria` |
| Finanzas | `cuenta` / `cuentas`, `categoria` / `categorias`, `transaccion` / `transacciones` |
| Archivo de transacciones | `transaccion_archivo_exportacion`, `evento_transaccion_archivado` |
| Análisis y planificación | `patron_comportamiento`, `presupuesto` / `presupuestos`, `meta_ahorro` / `metas_ahorro`, `aporte_meta` / `aportes_meta`, `consejo_financiero` / `consejos_financieros`, `alerta_fraude` / `alertas_fraude`, `analisis_gastos`, `reporte_mensual` / `reportes_mensuales` |

`database/schema.sql` incluye extensiones, restricciones, índices y lógica SQL adicional necesaria para la aplicación. Mantén ese archivo y el schema Prisma alineados al cambiar la base. Los campos monetarios usan `NUMERIC`/`Decimal`; revisa los tipos concretos en los archivos de esquema antes de escribir consultas o scripts.

## 10. Documentación de la API REST (`/api/v2`)

La API está montada bajo `/api/v2`. Las operaciones y esquemas completos provienen de Swagger/OpenAPI, disponible en `http://localhost:3000/api/docs` y `/api/docs.json` cuando `NODE_ENV` no es `production`. No se exponen rutas `/api/v1`.

Las operaciones protegidas requieren:

```http
Authorization: Bearer <jwt>
```

Las rutas de confirmación por correo usan un token firmado de un solo propósito
y no requieren sesión; el webhook se autentica con sus propios headers.

| Prefijo | Módulo |
| --- | --- |
| `/api/v2/auth` | Registro, login, verificación de correo, recuperación, perfil de sesión y cierre de sesión. |
| `/api/v2/accounts` | Consulta, creación y actualización de cuentas; `DELETE` las desactiva. |
| `/api/v2/categories` | Categorías financieras. |
| `/api/v2/transactions` | Consulta y registro de movimientos, estados/categorías, confirmación por correo y archivo anual. El registro manual solo acepta cuentas de tipo `EFECTIVO`. |
| `/api/v2/integrations` | Webhook `POST /api/v2/integrations/transactions/webhook`; requiere secreto compartido y firma HMAC. |
| `/api/v2/devices` | Registro y administración de dispositivos. |
| `/api/v2/alerts` | Alertas y cambios de estado. |
| `/api/v2/dashboard` | Estadísticas, transacciones/alertas recientes y consejos. |
| `/api/v2/budgets` | Presupuestos. |
| `/api/v2/savings` | Metas y aportes de ahorro. |
| `/api/v2/profile` | Perfil y patrón de comportamiento. |
| `/api/v2/insights` | Resumen financiero basado en reglas y movimientos. |
| `/api/v2/reports` | Resúmenes, reportes por categoría y transacciones. |
| `/api/v2/map` | Estadísticas y ubicaciones de movimientos. |
| `/api/v2/audit` | Historial de auditoría propio, de solo lectura. |

Endpoints operativos:

| Método | Ruta | Uso |
| --- | --- | --- |
| `GET` | `/health` | Comprueba que el proceso responde. |
| `GET` | `/health/ready` | Comprueba conectividad con PostgreSQL. |

La ruta `/api/v2` por sí sola no es un índice de operaciones. Consulta Swagger o
los routers en `backend/src/modules/` para los métodos, payloads y respuestas.
La evaluación de riesgo en el backend es basada en reglas; no es un modelo de
IA.

---

## 11. Seguridad y privacidad

Controles presentes en el código:

| Control | Implementación verificable |
| --- | --- |
| Autenticación | JWT; `requireAuth` verifica firma, usuario activo y versión vigente del token. |
| Contraseñas | Hash con `bcryptjs`; las rutas autenticadas aplican controles de acceso por usuario. |
| Validación y abuso | Esquemas Zod, limitador global y límites específicos en rutas de autenticación. |
| Cabeceras y origen | Helmet y CORS en Express; la CSP del backend cambia por entorno. Vite genera la CSP del frontend durante el build. |
| Webhook | Secreto compartido, timestamp de 10 dígitos con ventana de cinco minutos y HMAC-SHA256 del cuerpo original. |
| Consultas SQL | Las consultas directas usan `queryRaw` parametrizado; Prisma se usa para el resto del acceso relacional. |

HTTPS/TLS depende del proxy o plataforma de despliegue. El código no implementa
MFA, cifrado AES de datos en reposo, conexión bancaria directa, proveedor de
IA, SMS/push ni una certificación ISO. Esta descripción no constituye una
declaración de cumplimiento legal o certificación.

---

## 12. Estándares de Desarrollo y Contribución

### Scripts del backend

Ejecuta estos comandos desde `backend`:

| Comando | Resultado |
| --- | --- |
| `pnpm dev` | Servidor de desarrollo con recarga. |
| `pnpm prisma:generate` | Genera Prisma Client. Detén el backend antes de ejecutarlo en Windows. |
| `pnpm build` | Genera Prisma Client y compila TypeScript a `dist/`. |
| `pnpm start` | Ejecuta `dist/index.js`; requiere un build previo. |
| `pnpm typecheck` | Comprueba TypeScript sin emitir archivos. |
| `pnpm test` | Ejecuta pruebas de contrato con el test runner de Node; no requiere PostgreSQL. |
| `pnpm test:integration` | Ejecuta pruebas HTTP/PostgreSQL; requiere `TEST_DATABASE_URL` configurada hacia una base exclusiva de pruebas con el esquema instalado. |
| `pnpm lint` | Ejecuta ESLint. |
| `pnpm lint:fix` | Ejecuta ESLint con corrección automática. |
| `pnpm format` | Formatea los archivos TypeScript del backend. |
| `pnpm format:check` | Comprueba el formato de los archivos TypeScript del backend. |

La integración rechaza una base cuyo nombre no incluya `test`, `testing`,
`prueba`, `pruebas` o `ci`, y rechaza que sea la misma base que
`DATABASE_URL`.

### Scripts del frontend

Ejecuta estos comandos desde `frontend`:

| Comando | Resultado |
| --- | --- |
| `pnpm dev` | Servidor Vite de desarrollo en el puerto `5173`. |
| `pnpm build` | Type-check y build con validación de URL HTTPS pública. |
| `pnpm build:local` | Type-check y build en modo `development`, con API local predeterminada. |
| `pnpm type-check` | Comprueba los proyectos TypeScript del frontend. |
| `pnpm test` | Ejecuta las pruebas Vitest en jsdom. |
| `pnpm lint` | Ejecuta ESLint. |
| `pnpm format` | Formatea el frontend. |
| `pnpm format:check` | Comprueba Prettier en el frontend. |
| `pnpm preview` | Sirve localmente el build de `dist/`. |

No hay un comando `pnpm dev`, `pnpm build` o `pnpm test` en la raíz: cambia al
workspace correspondiente antes de ejecutarlo. Los nombres de variables y
modelos del backend siguen el esquema de base de datos existente; conserva sus
convenciones y tipos al modificar módulos. Los commits tipo Conventional
Commits son una recomendación, no una validación automática del repositorio.

---

## 13. Estado del Proyecto y Licencia

El estado funcional se refleja en los módulos y rutas descritos en este
documento. En el árbol actual no se encontró un archivo de licencia; consulta
al responsable del repositorio antes de redistribuir el proyecto.

---

<div align="center">

**TriDa — Aplicación web de finanzas personales**

*README actualizado según los manifiestos y el código del workspace*

</div>