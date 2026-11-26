# Registro de decisiones de producto y tecnología

## Nota de interpretación

No se proporcionaron actas de decisiones ni sus fechas. D-01 es un cambio de enfoque **informado por el equipo**. D-02 a D-09 son decisiones o restricciones **inferidas de la implementación**, no acuerdos históricos verificados. La evidencia disponible en Git no permite fechar estas decisiones.

| ID | Decisión observable / informada | Estado de evidencia | Evidencia técnica / fuente | Consecuencia de producto |
| --- | --- | --- | --- | --- |
| D-01 | Reorientar TriDa de un enfoque centrado en bancos a uno centrado en clientes. | Informado por el equipo; fecha y acta no disponibles. | El esquema y los módulos actuales modelan usuarios propietarios de cuentas y movimientos. | Priorizar la experiencia del cliente y la gestión de sus cuentas y movimientos. |
| D-02 | Administrar cuentas dentro de TriDa y permitir registro manual de movimientos. | Inferido del producto actual. | Módulos `accounts` y `transactions`; un movimiento manual requiere cuenta de efectivo. | Mantener cuentas controladas por el usuario como base del flujo financiero. |
| D-03 | Recibir eventos externos mediante un webhook autenticado. | Inferido del producto actual. | `/api/v2/integrations/transactions/webhook`, HMAC, timestamp y control de duplicados. | Integrar fuentes externas mediante contrato autenticado y configuración de secretos. |
| D-04 | Organizar el backend como API REST Express/TypeScript con rutas versionadas. | Inferido del producto actual. | `backend/src/app.ts` monta módulos bajo `/api/v2`. | Separar responsabilidades por módulos y mantener contratos de API versionados. |
| D-05 | Usar PostgreSQL/Prisma como modelo relacional y SQL para restricciones u operaciones específicas. | Inferido del producto actual. | `backend/prisma/schema.prisma` y `database/schema.sql`. | Mantener ambos artefactos alineados y documentar las restricciones externas a Prisma. |
| D-06 | Combinar el servicio Python y respaldo heurístico en los flujos que lo permiten. | Inferido del producto actual. | `risk.service`, `modulo-ia` e insights con consejos locales de respaldo. | Degradar de forma controlada donde hay fallback; el análisis de mensajes debe informar el fallo del servicio. |
| D-07 | Mantener gastos externos pendientes y pedir confirmación mediante enlace por correo. | Inferido del producto actual. | Token firmado, endpoints de confirmación y actualización transaccional. | Esperar la decisión del usuario y registrar alertas/auditoría asociadas. |
| D-08 | Aislar consultas y modificaciones por el usuario autenticado. | Inferido del producto actual. | Servicios filtran por `id_usuario`; middleware de autenticación protege rutas privadas. | Aplicar propiedad del usuario en endpoints, consultas y pruebas nuevas. |
| D-09 | Exigir exportación previa antes de purgar movimientos antiguos. | Inferido del producto actual. | Exportación temporal, descarga CSV previa y archivo de eventos externos. | Evitar borrados ordinarios y preservar trazabilidad y consistencia de saldos. |

## Validación pendiente

Para convertir una decisión inferida en un acuerdo confirmado, añadir fecha, participantes, alternativas consideradas, decisión, motivo y fuente (acta, issue, pull request o confirmación explícita de ambos integrantes).
