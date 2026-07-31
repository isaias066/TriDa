<!--
  ¿Qué? Historia de usuario que describe la recepción de notificaciones automáticas según criticidad para el operador.
  ¿Para qué? Formalizar la necesidad del operador de mantenerse informado y responder oportunamente a eventos relevantes.
  ¿Impacto? Evita que alertas relevantes pasen desapercibidas durante el turno de monitoreo.
-->

# HU-OP-04 — Recepción de Notificaciones

## Identificación

| Campo            | Valor                        |
| ---------------- | ---------------------------- |
| **ID**           | HU-OP-04                     |
| **Título**       | Recepción de notificaciones  |
| **Módulo**       | Operador de Monitoreo        |

---

## Historia

**Como** operador de monitoreo,
**quiero** recibir notificaciones automáticas según el nivel de criticidad de las alertas,
**para** mantenerme informado de la actividad del sistema y responder oportunamente a los eventos relevantes.

---

## Criterios de Aceptación

### CA-OP-04.1 — Alertas de nivel bajo visibles en el dashboard
- **Dado que** se genera una alerta de nivel bajo,
- **cuando** accedo al dashboard,
- **entonces** debo ver la alerta listada en el panel sin recibir notificaciones adicionales.

### CA-OP-04.2 — Notificación push para alertas de nivel medio
- **Dado que** se genera una alerta de nivel medio,
- **cuando** el sistema la registra,
- **entonces** debo recibir una notificación push en la interfaz independientemente de la sección en la que me encuentre.

### CA-OP-04.3 — Acceso directo al caso desde la notificación
- **Dado que** recibo una notificación push,
- **cuando** hago clic sobre ella,
- **entonces** debo ser redirigido directamente a la vista detallada de la alerta correspondiente.
