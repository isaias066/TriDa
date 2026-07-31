<!--
  ¿Qué? Requisito funcional que describe el sistema de notificaciones 
  multicanal según el nivel de criticidad de las alertas.
  ¿Para qué? Definir cómo el sistema notifica a los analistas y 
  operadores a través de diferentes canales según la urgencia 
  de cada alerta generada.
  ¿Impacto? Sin notificaciones multicanal las alertas de alta 
  criticidad podrían pasar desapercibidas, retrasando la respuesta 
  ante fraudes activos.
-->

# RF-007 — Notificaciones Multicanal por Nivel de Criticidad

**Historias de usuario relacionadas:** HU-OP-04, HU-AN-07, HU-PR-06

## Descripción

El sistema debe notificar a los analistas y operadores a través de 
diferentes canales según el nivel de criticidad de la alerta: para 
nivel bajo, notificación visual en el dashboard; para nivel medio, 
notificación visual más notificación push; para nivel alto (80–95 %), 
notificación visual, push y correo electrónico al analista responsable. 
Para bloqueos automáticos (score > 95 %), se activan todos los canales 
de notificación de forma simultánea e inmediata.

---

## Flujo del proceso

| Paso | Descripción |
|------|-------------|
| 1 | El motor de notificaciones recibe la alerta generada por RF-006 con su nivel de criticidad. |
| 2 | Si la alerta es de nivel bajo (30–49 %), se muestra únicamente en el dashboard. |
| 3 | Si la alerta es de nivel medio (50–79 %), se muestra en el dashboard y se envía notificación push. |
| 4 | Si la alerta es de nivel alto (80–95 %), se muestra en el dashboard, se envía notificación push y correo electrónico al analista responsable. |
| 5 | Si es un bloqueo automático (> 95 %), se activan todos los canales simultáneamente. |
| 6 | Se registra la notificación enviada con canal, destinatario y marca temporal. |

---

## Reglas de Negocio

| ID | Regla |
|----|-------|
| RN-039 | Nivel bajo (30–49 %): solo notificación visual en el dashboard. |
| RN-040 | Nivel medio (50–79 %): notificación visual en dashboard + notificación push. |
| RN-041 | Nivel alto (80–95 %): notificación visual + push + correo electrónico al analista responsable. |
| RN-042 | Bloqueo automático (> 95 %): todos los canales de notificación se activan simultáneamente. |
| RN-043 | Toda notificación enviada debe registrarse con canal utilizado, destinatario y marca temporal. |
| RN-044 | El usuario debe poder acceder al caso directamente desde la notificación recibida. |
