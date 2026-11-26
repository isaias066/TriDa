# Modelado del sistema TriDa

Documentación separada por tema y basada en el estado actual del código. El frontend React, la API Express, PostgreSQL y el microservicio Python local se describen según sus rutas, servicios y esquemas existentes.

## Archivos

- [Arquitectura TriDa](./Arquitectura-TriDa.md): componentes, flujos e integraciones actuales, separados de la infraestructura de despliegue.
- [Historias de usuario TriDa](./Historias-de-usuario-TriDa.md): 35 identificadores principales y 17 subhistorias para desglosar cinco agrupadores compuestos.
- [Diagramas de casos de uso TriDa](./Diagramas-de-casos-de-uso-TriDa.md): catálogo de 30 casos, con diagramas PlantUML para los flujos que requieren relaciones y tabla para los casos simples.
- [MER TriDa](./MER-TriDa.md): entidades conceptuales y cardinalidades.
- [MR TriDa](./MR-TriDa.md): relaciones, claves y columnas de los 18 modelos Prisma, en formato tabular.
- [UML TriDa](./UML-TriDa.md): diagrama de clases y secuencias principales.
- [Reporte de ejecución y defectos](./Reporte-ejecucion-y-defectos.md): resultados de validación, hallazgos, riesgos de cobertura y contexto de ejecución.

Los bloques Mermaid se representan visualmente en visores compatibles (por ejemplo, GitHub). Los bloques PlantUML contienen el código fuente del diagrama y requieren un visor o extensión PlantUML para mostrarse como imagen; un visor Markdown genérico puede presentarlos como texto.

Las historias y los casos de uso no tienen una correspondencia uno a uno: las historias describen necesidades y criterios de aceptación; los casos agrupan interacciones de mayor nivel. La siguiente matriz enlaza cada historia con su caso y endpoint principal; una historia puede compartir caso con otras.

## Trazabilidad HU ↔ CU ↔ endpoint

| Historia | Caso de uso | Endpoint principal |
| --- | --- | --- |
| HU-01 Registrar usuario | CU-01 | `POST /api/v2/auth/register` |
| HU-02 Verificar correo | CU-02 | `POST /api/v2/auth/verify-email` |
| HU-03 Iniciar sesión | CU-03 | `POST /api/v2/auth/login` |
| HU-04 Cerrar sesión | CU-04 | `POST /api/v2/auth/logout` |
| HU-05 Solicitar recuperación | CU-05 | `POST /api/v2/auth/forgot-password` |
| HU-06 Validar token de recuperación | CU-06 | `POST /api/v2/auth/verify-reset-token` |
| HU-07 Restablecer contraseña | CU-07 | `POST /api/v2/auth/reset-password` |
| HU-08 Cambiar contraseña | CU-08 | `POST /api/v2/auth/change-password` |
| HU-09 Consultar perfil propio | CU-09 | `GET /api/v2/profile`; `GET /api/v2/auth/me` |
| HU-10 Actualizar perfil propio | CU-09 | `PATCH /api/v2/profile`; `PATCH /api/v2/auth/me` |
| HU-11 Consultar patrón financiero | CU-10 | `GET /api/v2/profile/behavior-pattern` |
| HU-12 Gestionar cuentas financieras | CU-11 | `GET /api/v2/accounts`; `GET /api/v2/accounts/{id}`; `POST /api/v2/accounts`; `PATCH/DELETE /api/v2/accounts/{id}` |
| HU-13 Gestionar categorías | CU-12 | `GET /api/v2/categories`; `GET /api/v2/categories/{id}`; `POST /api/v2/categories`; `PATCH/DELETE /api/v2/categories/{id}` |
| HU-14 Consultar transacciones | CU-13 | `GET /api/v2/transactions`; `GET /api/v2/transactions/{id}` |
| HU-15 Registrar transacción manual | CU-14 | `POST /api/v2/transactions` |
| HU-16 Resolver movimiento pendiente | CU-15 | `PATCH /api/v2/transactions/{id}/status` |
| HU-17 Categorizar transacción | CU-15 | `PATCH /api/v2/transactions/{id}/category` |
| HU-18 Registrar movimientos recibidos automáticamente | CU-16 | `POST /api/v2/integrations/transactions/webhook` |
| HU-19 Confirmar gasto desde correo | CU-17 | `GET/POST /api/v2/transactions/email-confirmation` |
| HU-20 Consultar y resolver alertas | CU-18 | `GET /api/v2/alerts`; `GET /api/v2/alerts/{id}`; `GET /api/v2/alerts/counts-by-level`; `PATCH /api/v2/alerts/{id}/status` |
| HU-21 Gestionar presupuestos | CU-19 | `GET/POST /api/v2/budgets`; `PATCH/DELETE /api/v2/budgets/{id}` |
| HU-22 Gestionar metas de ahorro | CU-20 | `GET/POST /api/v2/savings`; `PATCH/DELETE /api/v2/savings/{id}` |
| HU-23 Aportar a una meta | CU-21 | `POST /api/v2/savings/{id}/funds` |
| HU-24 Consultar dashboard | CU-22 | `GET /api/v2/dashboard/stats`; `GET /api/v2/dashboard/recent-alerts`; `GET /api/v2/dashboard/recent-transactions`; `GET /api/v2/dashboard/advice` |
| HU-25 Marcar consejo como leído | CU-23 | `PATCH /api/v2/dashboard/advice/{id}/read` |
| HU-26 Consultar insights | CU-24 | `GET /api/v2/insights` |
| HU-27 Analizar mensaje o enlace | CU-25 | `POST /api/v2/insights/scan-message` |
| HU-28 Consultar resumen y desglose financiero | CU-26 | `GET /api/v2/reports/summary`; `GET /api/v2/reports/by-category` |
| HU-29 Consultar reporte de movimientos | CU-26 | `GET /api/v2/reports/transactions` |
| HU-30 Consultar mapa de movimientos | CU-27 | `GET /api/v2/map/stats`; `GET /api/v2/map/locations` |
| HU-31 Gestionar dispositivos | CU-28 | `GET/POST /api/v2/devices`; `GET/DELETE /api/v2/devices/{id}`; `PATCH /api/v2/devices/{id}/trust` |
| HU-32 Consultar auditoría propia | CU-29 | `GET /api/v2/audit` |
| HU-33 Preparar exportación anual | CU-30 | `POST /api/v2/transactions/archive/prepare` |
| HU-34 Descargar CSV anual | CU-30 | `POST /api/v2/transactions/archive/{exportId}/download` |
| HU-35 Purgar movimientos exportados | CU-30 | `POST /api/v2/transactions/archive/{exportId}/purge` |

El caso compartido refleja un objetivo mayor que puede cubrir varias historias; los endpoints detallados y sus variantes están en [Historias de usuario TriDa](./Historias-de-usuario-TriDa.md). Las subhistorias HU-12.x, HU-13.x, HU-20.x, HU-22.x y HU-31.x heredan la fila de trazabilidad de su HU agrupadora.

## Criterio de alcance

Los diagramas describen los módulos y flujos identificables en el código actual. El microservicio `modulo-ia` es invocado desde el backend; la evaluación de riesgo y los consejos tienen respaldo heurístico/local, mientras que el análisis de mensajes depende de que el servicio responda. Para el detalle de componentes, integraciones y límites del diagrama, consulta [Arquitectura TriDa](./Arquitectura-TriDa.md).

### Fuentes revisadas

- `backend/src/modules/` y `backend/src/app.ts`
- `frontend/src/App.tsx`
- `backend/prisma/schema.prisma`
- `database/schema.sql`
- `modulo-ia/api.py` y `modulo-ia/risk_engine.py`

Al cambiar rutas, comportamiento de módulos o relaciones de datos, actualizar el archivo temático correspondiente y las fuentes de API/esquema aplicables.
