<!--
  ¿Qué? Historia de usuario que describe la visualización del dashboard de alertas en tiempo real.
  ¿Para qué? Formalizar la necesidad del analista de tener visibilidad inmediata del estado del sistema.
  ¿Impacto? Sin visibilidad centralizada el analista no puede priorizar ni responder a tiempo ante alertas críticas.
-->

# HU-AN-01 — Visualización del Dashboard de Alertas

## Identificación

| Campo            | Valor                                        |
| ---------------- | -------------------------------------------- |
| **ID**           | HU-AN-01                                     |
| **Título**       | Visualización del dashboard de alertas       |
| **Módulo**       | Analista de Seguridad                        |

---

## Historia

**Como** analista de seguridad,
**quiero** visualizar en el dashboard principal el flujo de transacciones procesadas en tiempo real y las alertas activas organizadas por nivel de criticidad (verde, amarillo y rojo),
**para** tener visibilidad inmediata del estado del sistema y priorizar la atención de las alertas más críticas sin perder tiempo buscando información dispersa.

---

## Criterios de Aceptación

### CA-AN-01.1 — Dashboard actualizado en tiempo real
- **Dado que** soy analista autenticado en el sistema,
- **cuando** accedo al dashboard principal,
- **entonces** debo ver el flujo de transacciones procesadas y las alertas activas actualizadas en tiempo real sin necesidad de recargar la página.

### CA-AN-01.2 — Clasificación por nivel de criticidad
- **Dado que** estoy en el dashboard principal,
- **cuando** visualizo las alertas activas,
- **entonces** deben estar organizadas por código de color según su criticidad: verde (bajo), amarillo (medio) y rojo (alto).

### CA-AN-01.3 — Acceso al detalle de una alerta
- **Dado que** estoy en el dashboard y veo una alerta listada,
- **cuando** hago clic sobre ella,
- **entonces** debo ser redirigido a la vista detallada de esa alerta con toda su información disponible.
