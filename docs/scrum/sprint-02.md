# Sprint 2 — Transacciones, riesgo y alertas

> **Reconstrucción propuesta, no registro histórico confirmado.** Ventana de referencia: 15–28 de octubre de 2026.

## Sprint Goal propuesto

Permitir al cliente registrar y revisar movimientos de forma segura, con detección de riesgo y una ruta explícita para confirmar gastos externos. El incremento debe conservar propiedad de datos, integridad de saldos y trazabilidad.

## Sprint Backlog candidato

HU-14 a HU-20: transacciones, estados, categorías, webhook, confirmación por correo y alertas.
Esta selección es propuesta; solo debe convertirse en compromiso tras revisar dependencias y capacidad real.

## Desglose de trabajo sugerido

| Trabajo | Responsable principal | Resultado verificable en el código actual |
| --- | --- | --- |
| Diseñar relaciones, restricciones, índices e idempotencia para movimientos y alertas. | Juan Diego Morales | Modelos Prisma y restricciones SQL; referencias en `database/schema.sql`. |
| Implementar listado, detalle, registro manual, cambios de estado y categoría. | Angie Bueno | Servicio y rutas en `backend/src/modules/transactions/`. |
| Integrar evaluación de riesgo y respaldo heurístico. | Angie Bueno | Integración en `backend/src/modules/alerts/risk.service.ts` y servicio de transacciones. |
| Implementar validación de webhook, duplicados y confirmación de gastos externos. | Angie Bueno | Middleware HMAC, rutas de integración y tokens de confirmación. |
| Implementar consulta y resolución de alertas, incluyendo efecto en transacción/saldos. | Angie Bueno | Módulo `backend/src/modules/alerts/`. |
| Integrar formularios, listado de movimientos, alertas y confirmación desde correo. | Juan Diego Morales | Componentes de transacciones/alertas y página de confirmación. |
| Validar casos de integración y manejo de errores. | Ambos Developers | Hay pruebas de integración de transacciones; su ejecución dentro de este sprint no consta. |

## Decisiones observables relevantes

- Los movimientos manuales requieren una cuenta de efectivo.
- Los movimientos recibidos por webhook usan HMAC y ventana temporal; los gastos externos quedan pendientes de confirmación por correo.
- Se aplica evaluación IA/heurística según el flujo.

## Planificación y asignación propuesta

- Angie Bueno: backend de transacciones, riesgo, webhook, confirmación y alertas; Juan Diego Morales: persistencia, restricciones, consultas e interfaz de movimientos/alertas.
- Ambos Developers participan en integración, pruebas y revisión de criterios.
- Capacidad, votos Poker, puntos comprometidos, tareas ejecutadas y velocidad: **Sin registro**. Ver [Planning Poker](./planning-poker.md).

## Incremento observable hoy

- Consulta y registro de transacciones, resolución de pendientes y actualización de categoría.
- Integración webhook con autenticación HMAC, protección frente a duplicados y confirmación de gasto por correo.
- Evaluación de riesgo, generación/resolución de alertas y pruebas de integración transaccionales.

La presencia de estos elementos no determina cuándo se desarrollaron ni qué historias se aceptaron en una Review.

## Revisión de Sprint — escenario de demo propuesto

1. Registrar un movimiento manual desde una cuenta de efectivo y mostrar resultado de evaluación.
2. Consultar y resolver una transacción pendiente; observar efecto correspondiente sobre saldo/alerta.
3. Enviar evento externo válido, demostrar rechazo de firma inválida y manejo idempotente.
4. Confirmar un gasto de correo y mostrar la decisión guardada.

Resultado histórico de Review, feedback y aceptación: **Sin registro**. Las demos requieren entorno y secretos de prueba configurados; no se deben exponer credenciales reales.

## Retrospectiva

No hay notas históricas. Temas y acciones propuestos para validar con ambos integrantes:

| Tema a revisar | Acción propuesta (no acuerdo histórico) |
| --- | --- |
| Complejidad de flujos de riesgo, webhook y correo | Planificar una historia vertical por vez y verificar respuestas de error además del camino exitoso. |
| Consistencia de cuenta, transacción y saldo | Mantener invariantes transaccionales y probar reintentos/conflictos de duplicidad. |

Acuerdos originales, responsables y seguimiento: **Sin registro**.

## Métricas que faltan

| Dato | Registro |
| --- | --- |
| Puntos comprometidos / terminados | Sin registro |
| Historias aceptadas al Review | Sin registro |
| Carry-over al Sprint 3 | Sin registro |
| Bloqueos y defectos abiertos | Sin registro |
