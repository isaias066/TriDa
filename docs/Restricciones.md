# Restricciones del Proyecto — TriDa
## Guardián Financiero y de Ciberseguridad Personal Impulsado por IA

<!--
  ¿Qué? Restricciones globales que gobiernan el desarrollo, arquitectura y operación de TriDa.
  ¿Para qué? Definir límites claros de tecnología, seguridad, privacidad, cumplimiento normativo y diseño que no son negociables.
  ¿Impacto? Toda decisión técnica, de arquitectura, de IA o de experiencia de usuario debe verificarse contra estas restricciones antes de implementarse.
-->

---

## 1. Restricciones Tecnológicas

### RT-001 — Stack Tecnológico Fijo

El stack tecnológico está definido y **no puede modificarse** sin aprobación explícita del equipo de arquitectura y revisión de seguridad:

| Capa                       | Tecnología                                                                 |
| -------------------------- | -------------------------------------------------------------------------- |
| **Backend - Core**         | Node.js + Express + TypeScript                                             |
| **ORM / Acceso a Datos**   | Prisma ORM                                                                 |
| **ML / IA**                | Microservicio Python (TensorFlow + Scikit-learn) · Gemini API (vía Adapter) |
| **Base de Datos**          | PostgreSQL 17 (primaria) · MongoDB 6 (bitácora inmutable / auditoría)      |
| **Validación BE**          | Zod (Node.js) · Pydantic (Python)                                          |
| **Frontend - Dashboard**   | React + Vite + TailwindCSS + TypeScript                                    |
| **Iconografía**            | `lucide-react` (exclusivamente)                                            |
| **Análisis Web / Geo**     | APIs de reputación de dominios/SSL · Google Maps API v3 (contexto IP/geo)  |
| **Cifrado**                | Node `crypto` (AES-256) · `TweetNaCl.js` (Cliente)                         |
| **Autenticación**          | JWT — access token 15 min + refresh token 24 horas                         |
| **Hashing de Contraseñas** | `bcrypt` (`work_factor` = 12)                                              |
| **Comunicaciones**         | HTTPS (TLS 1.3) · Webhooks cifrados para ingesta de notificaciones         |
| **Queue / Eventos**        | Redis (procesamiento asíncrono, colas de alertas y reentrenamiento)        |
| **Logging / Auditoría**    | Winston / Elasticsearch (producción)                                       |
| **Monitoreo**              | Prometheus + Grafana                                                       |

### RT-002 — Gestión de Paquetes (Exclusivamente `pnpm`)

- **`pnpm`** como único gestor de paquetes por razones de rendimiento, seguridad y aislamiento de dependencias.
- **`npm` y `yarn` están estrictamente prohibidos.**
- Versiones exactas en `package.json` — jamás rangos `^`, `~`, `>=`, `*` ni `latest`.
- El archivo `.npmrc` debe incluir `save-exact=true`.
- Todas las dependencias críticas deben auditarse en `security.snyk.io` o vía `pnpm audit` **antes** de instalarlas.
- **Prohibido** instalar paquetes de forma global sin aprobación previa del equipo.

### RT-003 — Idiomas Soportados (i18n)

- Solo se soportan los locales `"es"` (Español — Colombia) y `"en"` (English).
- El idioma predeterminado es `"es"`.
- Las respuestas del API (`error.message`, explicaciones de riesgo, alertas) y las recomendaciones de los planes de IA deben generarse en español natural y cercano para usuarios en Colombia.
- Los reportes exportables (PDF, Excel, CSV) **deben generar contenido en español**.

### RT-004 — Modelos de Machine Learning e IA Generativa

- **Versión del modelo** debe estar documentada explícitamente en cada deployment.
- Cada reentrenamiento genera una nueva versión con timestamp: `model_v1_20260101_143022.pkl`.
- Las evaluaciones de riesgo (transacciones, notificaciones y URLs) **siempre deben incluir** un score de riesgo (0–100 %) y una explicación en lenguaje natural de los factores detectados.
- **Prohibido** entrenar modelos globales con datos personales identificables (PII) sin previa anonimización irreversible.
- El historial de versiones de modelos debe guardarse inalterablemente en auditoría.

---

## 2. Restricciones de Seguridad (Críticas)

### RS-001 — Cumplimiento Normativo y Privacidad Obligatoria

El sistema **DEBE** cumplir sin excepción:
- **Ley 1581 de 2012** — Protección de Datos Personales y Habeas Data (Colombia)
- **ISO 27001:2022** — Gestión de Seguridad de la Información
- **OWASP Top 10** — Protección contra vulnerabilidades web críticas
- **PCI-DSS 4.0 (Alcance de No Almacenamiento)** — Prohibición estricta de almacenar números completos de tarjeta (PAN), códigos CVV o contraseñas bancarias

**Incumplimiento de cualquiera de estas normas = bloqueo inmediato de deploy.**

### RS-002 — Cifrado de Datos

#### En Reposo (at-rest):
- Todas las bases de datos deben usar **AES-256** para cifrado de datos sensibles.
- Las columnas con datos personales y financieros (nombres, documentos, tokens de vinculación, extractos crediticios y contenido de notificaciones) **DEBEN estar cifradas**.
- Las claves de cifrado se almacenan en **AWS KMS / Vault**, jamás en el código fuente ni en el repositorio.
- Los backups de BD deben estar cifrados con AES-256.

#### En Tránsito (in-transit):
- **HTTPS con TLS 1.3** obligatorio para todas las comunicaciones cliente-servidor, ingesta de notificaciones y consultas de URLs.
- **Prohibido** cualquier comunicación sin cifrar o en HTTP plano.
- Los certificados deben ser emitidos por autoridades certificadoras reconocidas y rotarse cada 90 días máximo.

### RS-003 — Autenticación, Autorización y Soberanía del Usuario

- **JWT** con algoritmo `HS256` o `RS256` — jamás `none`.
- Access tokens: **máximo 15 minutos**.
- Refresh tokens: **máximo 24 horas**, almacenados de forma segura con rotación.
- **Prohibido** almacenar contraseñas en texto plano — siempre `bcrypt` con `work_factor` ≥ 12.
- Soporte de **autenticación multifactor (MFA / TOTP)** para todos los usuarios y **obligatoria** para el rol Administrador.
- Control de acceso por roles (RBAC) y propiedad de recursos:
  - **Usuario Final (Titular)**: acceso exclusivo a sus propias cuentas vinculadas, alertas, análisis de URLs, vida crediticia, reportes y planes de IA.
  - **Administrador del Sistema**: monitoreo de salud técnica, gestión del ciclo de vida de modelos IA y configuración global (sin acceso a datos financieros privados ni contraseñas de usuarios).
- **Prohibido** exponer `hashed_password` o tokens de vinculación en respuestas HTTP.
- Las sesiones inactivas deben cerrarse automáticamente después de 30 minutos.

### RS-004 — Secrets y Credenciales

- **Prohibido** hardcodear:
  - Contraseñas y hashes
  - Claves privadas JWT
  - Credenciales de BD
  - API keys de servicios externos (Gemini API, reputación web, Google Maps)
  - URLs de recursos internos sensibles
- Usar **variables de entorno exclusivamente**:
  - Backend: cargadas desde archivo `.env` en desarrollo (gitignored), desde gestor de secretos en producción.
  - Frontend: solo variables **públicas** (prefijo `VITE_`, sin datos sensibles).
- El archivo `.env.example` **SIEMPRE debe estar actualizado**.
- Implementar validación estricta de variables de entorno al iniciar la aplicación mediante `Zod`.

### RS-005 — Auditoría e Inmutabilidad

- **Todo evento crítico** debe ser auditado:
  - Inicios y cierres de sesión (exitosos y fallidos)
  - Activaciones del protocolo de Escudo Crítico (> 95 %)
  - Vinculación y revocación de cuentas o lectura de notificaciones
  - Ejercicio de derechos ARCO (descarga o borrado de datos)
  - Cambios de configuración y reentrenamientos de IA
- Los logs de auditoría **NO PUEDEN modificarse, eliminarse ni alterarse**.
  - Guardar copia inmutable en MongoDB (`append-only` collection) con hash SHA-256 de integridad.
- Todos los logs deben incluir:
  - Timestamp preciso (`ISO 8601 UTC`)
  - Identificador único del evento
  - Usuario/módulo que ejecutó la acción
  - Metadatos técnicos sin exponer información financiera en claro
  - Dirección IP origen

### RS-006 — Protección Contra Ataques Comunes

- **CSRF**: Tokens CSRF en formularios / cookies `SameSite=Strict` + `HttpOnly` + `Secure`.
- **XSS**: Escapar todo contenido dinámico (especialmente texto proveniente de SMS/notificaciones externas y URLs analizadas) mediante sanitización nativa de React y DOMPurify donde aplique.
- **SQL Injection**: Usar **siempre** consultas parametrizadas a través de Prisma ORM.
- **SSRF (Server-Side Request Forgery)**: En el verificador de sitios web (`RF-005`), bloquear peticiones hacia rangos de IP privadas/locales (`127.0.0.1`, `10.0.0.0/8`, `192.168.0.0/16`, metadatos cloud).
- **Rate Limiting**: Máximo 100 requests/minuto por IP en API general y límites específicos en verificación de URLs.
- **Validación de Input**: `Zod` en backend y frontend antes de procesar cualquier solicitud.
- **CORS**: Especificar orígenes explícitamente desde variables de entorno — **PROHIBIDO** `*`.
- **Headers de Seguridad HTTP** (vía Helmet):
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `Strict-Transport-Security: max-age=31536000`
  - `Content-Security-Policy: default-src 'self'`

### RS-007 — Manejo de Errores (No Exponer Información Sensible)

- **Prohibido** retornar stack traces o detalles internos de BD en respuestas de error a usuarios.
- Los errores visibles en la interfaz deben ser claros y empáticos: *"No pudimos procesar tu solicitud en este momento. Por favor intenta de nuevo."*
- Los detalles técnicos del error se loguean internamente con nivel `ERROR` pero **nunca** se muestran al cliente.
- Códigos HTTP estándar:
  - `400 Bad Request` — validación fallida
  - `401 Unauthorized` — no autenticado
  - `403 Forbidden` — autenticado pero sin permisos sobre el recurso
  - `429 Too Many Requests` — rate limiting alcanzado
  - `500 Internal Server Error` — error interno controlado

### RS-008 — Pruebas de Seguridad

- Antes de cada release: ejecutar escaneo de vulnerabilidades con `pnpm audit`.
- Auditoría de dependencias mensual en `security.snyk.io`.
- Revisión periódica de seguridad (OWASP ZAP) sobre endpoints de autenticación, ingesta y verificador de URLs.

---

## 3. Restricciones de Arquitectura

### RA-001 — Modularidad Obligatoria

El sistema **DEBE** mantener separación clara entre módulos:

| Módulo | Responsabilidad | Independencia |
| --- | --- | --- |
| **Ingesta Multifuente** | Captura y normalización de movimientos, notificaciones y URLs | Puede recibir eventos en cola sin bloquear la UI |
| **Enriquecimiento Contextual** | Consulta historial de gastos, estado crediticio y reputación web | Opera con caché en Redis si una fuente externa tarda |
| **Motor IA / ML y Planes** | Cálculo de score, explicabilidad y planes de ahorro/protección | Desacoplado vía Adapter Pattern; usa última versión estable |
| **Motor de Alertas y Escudo** | Clasificación de riesgo y despacho multicanal (Push, Email, SMS) | Ejecución en paralelo e independiente del renderizado web |
| **Dashboard del Guardián** | Visualización unificada de seguridad, gastos, crédito y planes | Consumo vía API REST sin lógica pesada en el cliente |
| **Bitácora y Privacidad** | Auditoría inmutable y gestión de derechos ARCO | Almacenamiento independiente en MongoDB (`append-only`) |
| **Reportes del Guardián** | Consolidación del reporte mensual de exposición y finanzas | Procesamiento asíncrono sin afectar operaciones en tiempo real |

### RA-002 — Escalabilidad

- **Throughput mínimo**: 500 eventos concurrentes/segundo sin degradación superior al 10 %.
- **Latencia máxima**: 500 milisegundos en tiempo real (ingesta → enriquecimiento → score).
- **Arquitectura**: servicios desacoplados con backend stateless (Express + Prisma) y workers asíncronos.
- **Caché**: Redis para perfil dinámico del usuario, dominios verificados recientemente (TTL) y sesiones.
- **Base de datos**: índices B-tree en columnas frecuentes (`userId`, `eventDate`, `riskScore`, `category`).

### RA-003 — Disponibilidad

- **Uptime requerido**: 99,5 % (máximo 3,6 horas de inactividad/mes).
- **RTO (Recovery Time Objective)**: ≤ 2 horas.
- **RPO (Recovery Point Objective)**: ≤ 1 hora de datos (con archivado WAL).
- **Arquitectura resiliente**:
  - Load balancer (Nginx) frente a múltiples instancias stateless de Node.js.
  - Replicación de BD PostgreSQL y respaldos automáticos cifrados cada 24 horas.
  - Health checks cada 30 segundos y respaldo heurístico local si la API de IA externa no responde.

### RA-004 — Monitoreo y Alertas Técnicas

- **Métricas clave a monitorear**:
  - Latencia de procesamiento de eventos (p50, p95, p99)
  - Tasa de errores HTTP y fallos de APIs externas
  - Uptime de cada servicio
  - Uso de CPU, memoria y espacio en disco
- **Alertas operativas configuradas**:
  - Latencia p95 > 500 ms
  - Tasa de error > 1 %
  - Uptime < 99,5 %
  - Espacio en disco < 10 %

---

## 4. Restricciones de Diseño Visual (Frontend)

### RD-001 — Sin Degradados

- **Prohibido** usar `bg-gradient-*`, `from-*`, `via-*`, `to-*` en TailwindCSS.
- Todos los colores deben ser **sólidos y planos**.
- La profundidad visual se logra con `shadow`, `border`, u `opacity` — nunca gradientes.

### RD-002 — Tipografía

- **Sans-serif exclusivamente** en toda la interfaz de usuario.
- Fuentes recomendadas: `Inter`, `system-ui`, `-apple-system`, `sans-serif`.
- **Prohibido** usar `serif` o `monospace` en la UI (excepto al mostrar hashes, URLs técnicas o fragmentos de código).
- Tamaños mínimos:
  - Títulos principales: 28px (`h1`)
  - Subtítulos: 18px (`h2`)
  - Cuerpo de texto: 14px
  - Captions / labels: 12px

### RD-003 — Alineación de Botones de Acción

- Botones primarios (Guardar, Verificar URL, Activar Plan, Confirmar): **alineados a la derecha** (`justify-end`).
- Botones secundarios (Cancelar, Volver, Descartar): a la izquierda o junto al botón primario.
- En dispositivos móviles: apilado vertical con el botón primario en la parte inferior.

### RD-004 — Librería de Íconos

- **SOLO `lucide-react`** para iconografía.
- **Prohibido**: `react-icons`, Font Awesome, Material Icons, Bootstrap Icons u otras librerías.
- Tamaño de íconos: `20px` (estándar), `24px` (CTA), `16px` (small/badges).

### RD-005 — Dark / Light Mode

- La interfaz **DEBE soportar** ambos modos: oscuro (dark) y claro (light).
- Toggle visible en el Navbar en todas las vistas.
- Valor inicial basado en `prefers-color-scheme` del navegador y persistido en `localStorage`.
- **Colores base**:
  - Light: fondo blanco (`#FFFFFF`), texto oscuro (`#1F2937`)
  - Dark: fondo navy profundo (`#0B1D3A`), texto claro (`#F3F4F6`)

### RD-006 — Accesibilidad Mínima (WCAG 2.1 Nivel AA)

- Contraste de texto ≥ 4.5:1 (cuerpo) · ≥ 3:1 (títulos e íconos grandes).
- Las alertas nunca deben depender solo del color (verde/amarillo/rojo); deben incluir ícono y etiqueta textual.
- Todos los inputs deben tener `<label>` asociados (`htmlFor` → `id`).
- Botones con `aria-label` o contenido textual claro.
- Listas de alertas activas con `role="alert"` (live region).
- Navegación completa por teclado (`Tab`, `Enter`, `Escape`) con foco visible.

---

## 5. Restricciones de Lenguaje

### RL-001 — Código en Inglés

Todo código y configuración técnica **DEBE estar en inglés**:
- Variables, funciones, métodos y clases.
- Nombres de archivos y carpetas de código.
- Endpoints de API (`/api/v1/events`, `/api/v1/url-check`, `/api/v1/plans`, `/api/v1/credit-health`).
- Nombres de modelos y campos en Prisma / BD (`User`, `FinancialEvent`, `RiskScore`, `UrlAnalysis`, `ProtectionPlan`, `SavingsPlan`, `CreditProfile`, `AuditLog`).
- Nombres de componentes React (`GuardianDashboard`, `UrlScannerCard`, `AlertDetailModal`, `SavingsPlanWidget`).
- Consultas Prisma (`prisma.financialEvent.findMany(...)`).
- Mensajes de commits.

### RL-002 — Documentación y Mensajes de Usuario en Español

Todo lo orientado al usuario **DEBE estar en español** (Colombia):
- Comentarios en código (`//`, `/* */`, JSDoc).
- Archivos de documentación (`.md`).
- Explicaciones generadas por la IA, alertas preventivas y consejos de ahorro/seguridad (siempre con tono empático y no culpabilizador).
- Labels, placeholders, botones, encabezados de tablas y tooltips.
- Reportes exportables (Reporte Mensual del Guardián en PDF, Excel, CSV).

### RL-003 — Commits con Conventional Commits

Formato obligatorio en todos los commits:

```text
<type>(<scope>): <subject>