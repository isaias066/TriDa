# Restricciones del Proyecto — TriDa
## Sistema de Monitoreo de Transacciones con IA para Detección de Fraude

<!--
  ¿Qué? Restricciones globales que gobiernan el desarrollo, arquitectura y operación de TriDa.
  ¿Para qué? Definir límites claros de tecnología, seguridad, cumplimiento normativo y diseño que no son negociables.
  ¿Impacto? Toda decisión técnica, de arquitectura o de seguridad debe verificarse contra estas restricciones antes de implementarse.
-->

---

## 1. Restricciones Tecnológicas

### RT-001 — Stack Tecnológico Fijo

El stack tecnológico está definido y **no puede modificarse** sin aprobación explícita de la dirección del proyecto y revisión de cumplimiento normativo:

| Capa                      | Tecnología                                          |
| ------------------------- | --------------------------------------------------- |
| **Backend - Core**        | Node.js + Express                                   |
| **ORM / Acceso a Datos**  | Prisma ORM                                          |
| **ML/IA**                 | Microservicio Python / Servicio dedicado (TensorFlow + Scikit-learn) |
| **Base de Datos**         | PostgreSQL 17 (primaria) · MongoDB 6 (logs/auditoría) |
| **Validación BE**         | Zod / Pydantic (según servicio)                     |
| **Frontend - Dashboard**  | React + Vite + TailwindCSS + TypeScript             |
| **Iconografía**           | lucide-react (exclusivamente)                       |
| **Geolocalización**       | Google Maps API v3                                  |
| **Cifrado**               | Node crypto · TweetNaCl.js (Cliente)               |
| **Autenticación**         | JWT — access 15 min + refresh 24 horas             |
| **Hashing de Contraseñas** | bcrypt (work_factor = 12)                           |
| **Comunicaciones**        | HTTPS (TLS 1.3) · mTLS para core banking            |
| **Queue/Eventos**         | Redis (para procesado async/reentrenamiento)        |
| **Logging/Auditoría**     | Winston / Elasticsearch (producción)               |
| **Monitoreo**             | Prometheus + Grafana                                |

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
- Las respuestas del API (en `error.message`, alertas) deben estar en español para analistas colombianos.
- Los reportes exportables (PDF, Excel, CSV) **deben generar contenido en español**.

### RT-004 — Modelo de Machine Learning

- **Versión del modelo** debe estar documentada explícitamente en cada deployment.
- Cada reentrenamiento genera una nueva versión con timestamp: `model_v1_20250101_143022.pkl`.
- Las predicciones del modelo **siempre deben incluir** un score de confianza (0-1) y factores contribuyentes.
- **Prohibido** usar modelos entrenados fuera del ambiente controlado de TriDa.
- El historial de versiones de modelos debe guardarse inalterablemente en auditoría.

---

## 2. Restricciones de Seguridad (Críticas)

### RS-001 — Cumplimiento Normativo Obligatorio

El sistema **DEBE** cumplir sin excepción:
- **PCI-DSS 4.0** — Estándar de Seguridad de Datos de la Industria de Tarjetas de Pago
- **ISO 27001:2022** — Gestión de Seguridad de la Información
- **Ley 1581 de 2012** — Protección de Datos Personales (Colombia)
- **Superintendencia Financiera de Colombia** — Regulación de seguridad bancaria
- **OWASP Top 10** — Vulnerabilidades web más críticas

**Incumplimiento de cualquiera de estas normas = bloqueo inmediato de deploy**

### RS-002 — Cifrado de Datos

#### En Reposo (at-rest):
- Todas las bases de datos deben usar **AES-256** para cifrado de datos sensibles.
- Las columnas con datos personales (nombres, cédulas, números de transacción) **DEBEN estar cifradas**.
- Las claves de cifrado se almacenan en **HSM** (Hardware Security Module) o AWS KMS, jamás en la aplicación.
- Los backups de BD deben estar cifrados con la misma clave que los datos activos.

#### En Tránsito (in-transit):
- **HTTPS con TLS 1.3** obligatorio para todas las comunicaciones cliente-servidor.
- **mTLS (mutual TLS)** obligatorio para comunicación backend ↔ core banking.
- **Prohibido** cualquier comunicación sin cifrar o en HTTP.
- Los certificados deben ser emitidos por autoridades certificadoras reconocidas.
- Rotación de certificados cada 90 días máximo.

### RS-003 — Autenticación y Autorización

- **JWT** con algoritmo `HS256` o `RS256` — jamás `none`.
- Access tokens: **máximo 15 minutos**.
- Refresh tokens: **máximo 24 horas**, almacenados en base de datos.
- **Prohibido** almacenar contraseñas en texto plano — siempre `bcrypt` con work_factor ≥ 12.
- Implementar **autenticación multifactor (MFA)** para roles Administrador y Analista.
- Control de acceso por roles (RBAC):
  - **Administrador**: acceso total
  - **Analista**: solo lectura/validación de alertas, sin crear usuarios
  - **Auditor**: solo lectura de reportes e historial
  - **Operador**: lectura de dashboard en vivo, sin acceso a configuración
- **Prohibido** exponer `hashed_password` en respuestas HTTP.
- Sesiones deben cerrarse automáticamente después de 30 minutos de inactividad.

### RS-004 — Secrets y Credenciales

- **Prohibido** hardcodear:
  - Contraseñas
  - Claves privadas JWT
  - Credenciales de BD
  - API keys de servicios externos
  - URLs de recursos sensibles
- Usar **variables de entorno exclusivamente**:
  - Backend: cargadas desde archivo `.env` en desarrollo (gitignored), desde secrets manager en producción.
  - Frontend: solo variables **públicas** (prefijo `VITE_`, sin datos sensibles).
- El archivo `.env.example` **SIEMPRE debe estar actualizado**.
- Implementar validación de secrets al iniciar la aplicación (por ejemplo con `Zod`).

### RS-005 — Auditoría e Immutabilidad

- **Todo** debe ser auditado:
  - Transacciones procesadas
  - Scores generados
  - Decisiones automatizadas (bloqueos, alertas)
  - Acciones de analistas (validaciones, cambios de clasificación)
  - Cambios de configuración del sistema
  - Accesos de usuarios
- Los logs de auditoría **NO PUEDEN modificarse, eliminarse ni alterarse**.
  - Usar esquemas de BD con campos requeridos y fechas inmutables.
  - Guardar copia inmutable en MongoDB (append-only collection).
- Todos los logs deben incluir:
  - Timestamp preciso (ISO 8601 UTC)
  - Identificador único de la transacción
  - Usuario/sistema que ejecutó la acción
  - Datos completos antes/después del cambio (si aplica)
  - Dirección IP origen (para conexiones remotas)

### RS-006 — Protección Contra Ataques Comunes

- **CSRF**: Usar tokens CSRF en formularios / SameSite cookies en backend.
- **XSS**: Escapar todo contenido dinámico en templates React; usar la sanitización nativa de React.
- **SQL Injection**: Usar **siempre** prepared statements y queries seguras a través de Prisma ORM.
- **Rate Limiting**: Implementar en API — máximo 100 requests/minuto por IP.
- **Validación de Input**: Zod en backend y frontend antes de submit.
- **CORS**: Especificar orígenes explícitamente desde variables de entorno — **PROHIBIDO** `*`.
- **Headers de Seguridad HTTP** (vía Helmet):
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `Strict-Transport-Security: max-age=31536000`
  - `Content-Security-Policy: default-src 'self'`

### RS-007 — Manejo de Errores (No exponer Información Sensible)

- **Prohibido** retornar stack traces en respuestas de error a usuarios.
- Los errores en el dashboard deben ser genéricos: *"Error procesando solicitud. Por favor intente de nuevo."*
- Los detalles técnicos del error se loguean internamente con nivel `ERROR` pero **nunca** se muestran al cliente.
- Códigos HTTP correctos:
  - `400 Bad Request` — validación fallida
  - `401 Unauthorized` — no autenticado
  - `403 Forbidden` — autenticado pero sin permisos
  - `429 Too Many Requests` — rate limiting
  - `500 Internal Server Error` — error del servidor (sin detalles técnicos)

### RS-008 — Pruebas de Seguridad

- Antes de cada release: ejecutar escaneo de vulnerabilidades con `pnpm audit`.
- Auditoría de dependencias mensual en `security.snyk.io`.
- Prueba de penetración **trimestral** por tercero independiente.

---

## 3. Restricciones de Arquitectura

### RA-001 — Modularidad Obligatoria

El sistema **DEBE** mantener separación clara entre módulos:

| Módulo | Responsabilidad | Independencia |
| --- | --- | --- |
| **Ingesta** | Recepción de transacciones del core banking | Puede fallar sin afectar otros módulos |
| **Enriquecimiento** | Consulta historial y contexto del cliente | Cache local en caso de fallo de BD |
| **IA/ML** | Análisis y cálculo de score | Usa última versión del modelo, no espera reentrenamiento |
| **Motor de Reglas** | Decisión (aprobar/alertar/bloquear) | Independiente del score, puede tener reglas manuales |
| **Dashboard** | Visualización y validación manual | Solo lectura del estado, sin dependencias críticas |
| **Auditoría** | Logging inmutable de operaciones | Almacenamiento independiente, reintento automático |
| **Reportes** | Generación de métricas exportables | Lectura desde BD, sin impacto en operaciones en vivo |

### RA-002 — Escalabilidad

- **Throughput mínimo**: 1.000 transacciones/segundo concurrentes.
- **Latencia máxima**: 500 milisegundos (desde ingesta hasta decisión).
- **Arquitectura**: basada en microservicios o servicios monolíticos bien separados (Express + Prisma).
- **Caché**: implementar Redis para datos de consulta frecuente (historial cliente, dispositivos conocidos).
- **Base de datos**: usar índices B-tree en columnas de búsqueda (`clientId`, `transactionDate`, `score`).

### RA-003 — Disponibilidad

- **Uptime requerido**: 99,5% (máximo 3,6 horas de inactividad/mes).
- **RTO (Recovery Time Objective)**: ≤ 4 horas.
- **RPO (Recovery Point Objective)**: ≤ 1 hora de datos.
- **Arquitectura resiliente**:
  - Load balancer (Nginx) frente a múltiples instancias de Node.js.
  - Replicación de BD en tiempo real (PostgreSQL streaming replication).
  - Backup automático cada 6 horas, almacenado en S3 o backup externo.
  - Health checks cada 30 segundos.
  - Failover automático a réplica standby en caso de fallo primario.

### RA-004 — Monitoreo y Alertas

- **Métricas clave a monitorear**:
  - Latencia de transacción (p50, p95, p99)
  - Tasa de errores
  - Uptime de componentes
  - Uso de CPU, memoria, I/O de disco
- **Alertas configuradas**:
  - Latencia > 500ms
  - Tasa de error > 1%
  - Uptime < 99%
  - Espacio en disco < 10%

---

## 4. Restricciones de Diseño Visual (Frontend)

### RD-001 — Sin Degradados

- **Prohibido** usar `bg-gradient-*`, `from-*`, `via-*`, `to-*` en TailwindCSS.
- Todos los colores deben ser **sólidos y planos**.
- La profundidad visual se logra con `shadow`, `border`, u `opacity` — no gradientes.

### RD-002 — Tipografía

- **Sans-serif exclusivamente** en interfaz de usuario.
- Fuentes recomendadas: `Inter`, `system-ui`, `-apple-system`, `sans-serif`.
- **Prohibido** usar `serif` o `monospace` en la UI (excepto al desplegar código técnico).
- Tamaños mínimos:
  - Títulos principales: 28pt (h1)
  - Subtítulos: 18pt (h2)
  - Cuerpo de texto: 14pt
  - Captions/labels: 12pt

### RD-003 — Alineación de Botones de Acción

- Botones primarios (Guardar, Enviar, Aprobar, Bloquear): **alineados a la derecha** (`justify-end`).
- Botones secundarios (Cancelar, Volver, Descartar): a la izquierda o junto al botón primario.
- En mobile: stack vertical, botón primario debajo.

### RD-004 — Librería de Íconos

- **SOLO `lucide-react`** para iconografía.
- **Prohibido**: react-icons, Font Awesome, Material Icons, Bootstrap Icons, u otras librerías.
- Tamaño de íconos: 20px (estándar), 24px (CTA), 16px (small).

### RD-005 — Dark/Light Mode

- La interfaz **DEBE soportar** ambos modos: dark y light.
- Toggle visible en Navbar en todas las páginas.
- Valor inicial basado en `prefers-color-scheme` del navegador.
- Preferencia del usuario guardada en `localStorage`.
- **Colores base**:
  - Light: fondo blanco (`#FFFFFF`), texto oscuro (`#1F2937`)
  - Dark: fondo navy (`#0B1D3A`), texto claro (`#F3F4F6`)

### RD-006 — Accesibilidad Mínima (WCAG 2.1 Level AA)

- Contraste de texto ≥ 4.5:1 (body) · ≥ 3:1 (headings/large text).
- Todos los inputs deben tener `<label>` asociados (`htmlFor` → `id`).
- Botones con `aria-label` o contenido de texto claro.
- Listas de alertas con role `"alert"` (live region).
- Navegación por teclado: Tab, Enter, Escape deben funcionar.
- Foco visible en todos los elementos interactivos.

---

## 5. Restricciones de Lenguaje

### RL-001 — Código en Inglés

Todo código y configuración técnica **DEBE estar en inglés**:
- Variables, funciones, métodos, clases.
- Nombres de archivos y carpetas de código.
- Endpoints de API (`/api/transactions`, `/api/alerts`, `/api/models/retrain`).
- Nombres de modelos y campos en Prisma / BD (`User`, `Transaction`, `FraudScore`, `AuditLog`).
- Nombres de componentes React (`AlertCard`, `TransactionTable`, `DashboardMetrics`).
- SQL / Prisma Queries (`prisma.transaction.findMany(...)`).
- Mensajes de commits.

### RL-002 — Documentación y Mensajes de Usuario en Español

Todo lo orientado al usuario **DEBE estar en español** (Colombia):
- Comentarios en código (`//`, `/* */`, JSDoc).
- Archivos de documentación (`.md`).
- Mensajes de error visibles en el dashboard.
- Labels y placeholders de formularios.
- Notificaciones (alertas, confirmaciones, avisos).
- Textos de botones (Guardar, Enviar, Cancelar, Bloquear, Validar).
- Nombres de columnas en tablas del dashboard.
- Reportes exportables (PDF, Excel, CSV).
- Tooltips y ayuda en contexto.

### RL-003 — Commits con Conventional Commits

Formato obligatorio en todos los commits:

```text
<type>(<scope>): <subject>

## 6. Restricciones Organizacionales

### RO-001 — Propósito Educativo y Documentación

- **Cabecera obligatoria** en cada archivo nuevo:

```typescript
// ¿Qué? [Descripción breve de la responsabilidad del módulo]
// ¿Para qué? [Caso de uso o beneficio que proporciona]
// ¿Impacto? [Cómo afecta a otros sistemas o a la detección de fraude]
```

- Comentarios pedagógicos en lógica compleja:

```typescript
// ¿Qué? Calcular el riesgo geográfico comparando transacción actual con ubicación habitual del cliente
// ¿Para qué? Detectar transacciones en países/ciudades donde el cliente no acostumbra operar
// ¿Impacto? Reduce falsos positivos (clientes viajando) mientras mantiene detección de fraudes coordinados internacionales

const distanceKm = haversine(currentLat, currentLng, usualLat, usualLng);

if (distanceKm > MAX_DISTANCE_SAME_DAY) {
  riskScore += GEOGRAPHIC_ANOMALY_WEIGHT;
}
```

### RO-002 — Calidad Mínima No Negociable

- **Cobertura de tests**: mínimo **85%** en módulos de lógica de negocio (IA, ingesta, motor de reglas).
- `vitest` + `@vitest/coverage-v8` para TypeScript (Express y React).

- **Linting**: sin errores de ESLint/Prettier antes de hacer commit.
- Backend y Frontend: `eslint`, `prettier`.

- **Type checking**: TypeScript estricto (`tsc --noEmit`).
- Cada feature debe incluir tests **antes** de considerarse completa.

### RO-003 — Code Review

- **Todo código** requiere al menos 1 aprobación antes de merge a `dev`.
- Merge a `main` requiere 2 aprobaciones + todos los tests pasando.
- Revisor debe verificar:
  - Cumplimiento de restricciones (seguridad, formato, normalización).
  - Tests adecuados.
  - Documentación actualizada.
  - Impacto en auditoría/cumplimiento normativo.

### RO-004 — Variables de Entorno

- `.env` **jamás** debe versionarse (incluido en `.gitignore`).
- `.env.example` **SIEMPRE** debe estar actualizado con todas las variables requeridas.
- Documentar en `README.md` cada variable y su propósito.
- Validación de secrets al iniciar la aplicación (con esquemas de `Zod`).

---

## 7. Restricciones Operacionales

### RO-001 — Deployment y Releases

- **Ambiente de desarrollo**: `localhost` con Docker Compose.
- **Ambiente de staging**: réplica idéntica a producción, datos anonimizados.
- **Ambiente de producción**: mínimo 3 instancias con Load Balancer.
- **Release cadence**: mínimo 1 semana entre releases a producción.
- **Rollback plan**: cada release debe poder revertirse en máximo 30 minutos.

### RO-002 — Versionado de Modelos ML

- Cada versión del modelo se etiqueta con timestamp y métricas de rendimiento:

```text
model_v1_20250101_143022_acc_0.92_prec_0.88_recall_0.95.pkl
```

- Guardar metadatos del modelo:
  - Fecha de entrenamiento.
  - Dataset usado (tamaño, distribución de fraudes).
  - Métricas (accuracy, precision, recall, F1, AUC-ROC).
  - Versión de librerías (TensorFlow, Scikit-learn).

- Permitir rollback a versión anterior del modelo en caso de degradación.
- Monitorear performance en producción vs. validación.

### RO-003 — Mantenimiento Programado

- **Ventanas de mantenimiento**: viernes 22:00–06:00 (mínima actividad transaccional).
- Notificar a analistas y administrativos 48 horas antes.
- No hacer cambios en core banking, solo en TriDa.
- Replicación de BD se pausa durante mantenimiento (backups antes del inicio).

### RO-004 — Respaldo y Recuperación

- **Backup automático**: cada 6 horas a S3/almacenamiento externo.
- **Retención**:
  - 30 días de backups diarios.
  - 12 meses de backups mensuales.
- **Test de recuperación**: mensual, verificar integridad de datos.
- **Cifrado de backups**: AES-256 con claves gestionadas en KMS.

---

## 8. Restricciones Específicas del Dominio Financiero

### DF-001 — Precisión de Números Monetarios

- **Siempre** usar `Decimal` (`decimal.js` o tipo `Decimal` de Prisma) para montos.
- **Jamás** usar `number` o `float` nativo de JavaScript para dinero.
- Redondeo: **HALF_UP** (0.5 hacia arriba) para USD/COP.
- Precisión:
  - USD: 2 decimales.
  - COP: 0 decimales (no hay centavos).

### DF-002 — Información Sensible (PII)

- **Nunca** loguear números de cédula, tarjeta de crédito o PIN completos.
- Mascarar en logs/alertas:
  - `CC: ***7823`
  - `Tarjeta: ****3456`
- **Prohibido** exponer en respuestas API información personal innecesaria.
- La auditoría debe registrar **qué** fue accedido, pero **no mostrar** el dato sensible.

### DF-003 — Cumplimiento SLA con Core Banking

- El sistema TriDa no puede ser más lento que la transacción en el core banking.
- Latencia máxima: **500 ms**.
- En caso de timeout: fallar abierto (permitir la transacción) con log de riesgo no evaluado.
- Notificar al equipo técnico si la latencia supera los **400 ms**.

---

## 9. Restricciones de Testing

### RT-001 — Cobertura de Tests

Mínimos requeridos:

- **Lógica de IA/ML**: 85%+ de cobertura.
- **Motor de reglas**: 90%+ de cobertura (crítico).
- **API Endpoints**: 80%+ de cobertura.
- **Dashboard (Frontend)**: 70%+ de cobertura (componentes principales).

Tipos de tests:

- **Unitarios**: 60% del esfuerzo.
- **Integración**: 30% del esfuerzo.
- **E2E**: 10% del esfuerzo (flujos críticos).

### RT-002 — Test de Seguridad

- **OWASP ZAP**: escaneo automático antes de cada release.
- **SQL Injection**: fuzzing de consultas.
- **XSS**: inyección de payloads maliciosos en inputs.
- **CSRF**: verificación de tokens en formularios.
- **Rate Limiting**: prueba de estrés (10.000 requests/segundo).

### RT-003 — Test de Carga

- Load test mensual simulando **1.000 transacciones/segundo** concurrentes.
- Verificar latencia **p95 < 500 ms** bajo carga pico.
- Identificar cuellos de botella (CPU, I/O de BD, caché).
- Generar informe de capacidad para planificación.

---

## 10. Restricciones de Cumplimiento Normativo (Checklist)

Antes de cada deploy a producción, verificar:

### PCI-DSS 4.0

- [ ] Cifrado AES-256 de datos sensibles (PAN, CVV).
- [ ] Validación de certificados SSL/TLS.
- [ ] Políticas de contraseña (mínimo 8 caracteres y complejidad).
- [ ] Auditoría de acceso a datos sensibles.
- [ ] Segmentación de red (BD aislada).

### ISO 27001:2022

- [ ] Política de seguridad de la información documentada.
- [ ] Roles y responsabilidades de seguridad definidos.
- [ ] Plan de continuidad del negocio.
- [ ] Control de acceso basado en roles.
- [ ] Cifrado de datos en tránsito y en reposo.

### Ley 1581 de 2012 (Protección de Datos - Colombia)

- [ ] Política de tratamiento de datos personales accesible.
- [ ] Consentimiento explícito del cliente para procesar datos.
- [ ] Derechos ARCO implementados (Acceso, Rectificación, Cancelación y Oposición).
- [ ] Cláusula de confidencialidad en contratos de proveedores.
- [ ] Reporte de brechas de seguridad en máximo 5 días.

### OWASP Top 10

- [ ] Validación de inputs contra inyección.
- [ ] Autenticación multifactor.
- [ ] Gestión segura de sesiones.
- [ ] Sanitización de outputs contra XSS.
- [ ] CORS configurado correctamente.

---

## Violaciones Críticas = Bloqueo Inmediato

Las siguientes violaciones impiden cualquier deploy:

- ❌ Hardcodear credenciales o secrets en código.
- ❌ Comunicación sin TLS 1.3.
- ❌ Usar consultas sin sanitizar o SQL raw sin validación.
- ❌ Almacenar contraseñas en texto plano.
- ❌ Exponer `hashed_password` en respuestas API.
- ❌ No validar inputs con Zod.
- ❌ Rate limiting deshabilitado en producción.
- ❌ Logs sin información de auditoría.
- ❌ Tests con cobertura inferior al 70%.
- ❌ Deploy a `main` sin aprobación de Code Review.

---

## Matriz de Responsabilidades

| Restricción | Verifica | Autoriza | Cumple |
|-------------|----------|----------|---------|
| **Seguridad** | Security Officer | CTO | Backend / DevOps |
| **Arquitectura** | Tech Lead | CTO | Backend |
| **Cumplimiento normativo** | Legal / Compliance | Director | Todos |
| **Calidad de código** | Code Review | Tech Lead | Desarrollador |
| **Performance** | DevOps | Tech Lead | Backend |
| **ML / Modelos** | Data Scientist | CTO | ML Engineer |
| **Frontend** | QA | Product Owner | Frontend |
| **Operaciones** | DevOps | CTO | SRE |

---

**Última actualización:** 30/07/2026

**Revisión:** 0.6

**Autora:** Angie Bueno

**Estado:** En vigencia

**Próxima revisión:** 31/07/2026


Impact: <impacto técnico y de negocio>
