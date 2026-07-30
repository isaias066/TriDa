<!--
  ¿Qué? Historia de usuario que describe la recepción de notificaciones según el nivel de criticidad de las alertas.
  ¿Para qué? Formalizar la necesidad del analista de responder oportunamente a los casos de mayor riesgo.
  ¿Impacto? Garantiza que ninguna alerta crítica pase desapercibida y reduce el tiempo de respuesta ante fraudes.
-->

# HU-AN-07 — Recepción de Notificaciones

## Identificación

| Campo            | Valor                        |
| ---------------- | ---------------------------- |
| **ID**           | HU-AN-07                     |
| **Título**       | Recepción de notificaciones  |
| **Módulo**       | Analista de Seguridad        |

---

## Historia

**Como** analista de seguridad,
**quiero** recibir notificaciones según el nivel de criticidad de cada alerta,
**para** responder oportunamente a los casos de mayor riesgo.

---

## Criterios de Aceptación

### CA-AN-07.1 — Alertas de nivel bajo visibles en el dashboard
- **Dado que** se genera una alerta de nivel bajo (verde),
- **cuando** accedo al dashboard,
- **entonces** debo ver la alerta listada en el panel sin recibir ninguna notificación adicional.

### CA-AN-07.2 — Notificación push para alertas de nivel medio
- **Dado que** se genera una alerta de nivel medio (amarillo),
- **cuando** el sistema la registra,
- **entonces** debo recibir una notificación push en la interfaz independientemente de la sección en la que me encuentre.

### CA-AN-07.3 — Notificación push y correo para alertas de nivel alto
- **Dado que** se genera una alerta de nivel alto (rojo),
- **cuando** el sistema la registra,
- **entonces** debo recibir simultáneamente una notificación push en la interfaz y un correo electrónico con los datos principales de la alerta.

### CA-AN-07.4 — Acceso directo al caso desde la notificación
- **Dado que** recibo una notificación de cualquier nivel,
- **cuando** hago clic sobre ella,
- **entonces** debo ser redirigido directamente a la vista detallada de la alerta correspondiente.
