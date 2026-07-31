<!--
  ¿Qué? Historia de usuario que describe la implementación del motor 
  de alertas y notificaciones multicanal.
  ¿Para qué? Formalizar la necesidad del programador de configurar 
  el sistema para notificar a los actores correctos por el canal 
  adecuado según el nivel de score de riesgo.
  ¿Impacto? Sin el motor de alertas los analistas y operadores no 
  reciben información oportuna, retrasando la respuesta ante fraudes 
  y aumentando el riesgo de pérdidas económicas.
-->

# HU-PR-06 — Implementación del Motor de Alertas y Notificaciones

## Identificación

| Campo      | Valor                                                        |
|------------|--------------------------------------------------------------|
| **ID**     | HU-PR-06                                                     |
| **Título** | Implementación del motor de alertas y notificaciones         |
| **Módulo** | Programador                                                  |

---

## Historia

**Como** programador,
**quiero** implementar el motor de generación automática de alertas y 
notificaciones multicanal según el nivel de score: dashboard (30–49 %), 
push (50–79 %), push + correo electrónico (80–95 %) y todos los canales 
para bloqueos superiores al 95 %,
**para** que el sistema notifique a los actores correctos mediante el 
canal adecuado en tiempo real.

---

## Criterios de Aceptación

### CA-PR-06.1 — Notificaciones correctas por rango de score
- **Dado que** el sistema calcula el score de una transacción,
- **cuando** el resultado supera un umbral configurado,
- **entonces** debe generar las notificaciones correspondientes 
  al canal definido para ese rango de score.

### CA-PR-06.2 — Envío por el canal configurado
- **Dado que** el motor de alertas genera una notificación,
- **cuando** la envía al destinatario,
- **entonces** debe utilizar exclusivamente el canal configurado 
  para el nivel de criticidad correspondiente.

### CA-PR-06.3 — Cumplimiento de tiempos de respuesta
- **Dado que** se genera una alerta de cualquier nivel,
- **cuando** el motor la procesa,
- **entonces** la notificación debe llegar al destinatario dentro 
  del tiempo de respuesta definido para ese nivel de criticidad.
