<!--
  ¿Qué? Requisito funcional que describe la notificación al cliente 
  cuando el sistema bloquea automáticamente una transacción.
  ¿Para qué? Definir el contenido, los canales, el tono y el tiempo 
  máximo de entrega del mensaje que recibe el cliente afectado por 
  un bloqueo automático de su transacción.
  ¿Impacto? Sin notificación oportuna el cliente desconoce el motivo 
  de la detención de su transacción, generando confusión, frustración 
  y pérdida de confianza en la institución financiera.
-->

# RF-027 — Notificación al Cliente ante Bloqueos de Transacciones

**Historias de usuario relacionadas:** HU-OP-10

## Descripción

Cuando el sistema bloquee automáticamente una transacción por score 
superior al 95 %, debe comunicar al cliente afectado a través de los 
canales oficiales disponibles (aplicación móvil, SMS, correo 
electrónico). El mensaje debe redactarse con tono empático, respetuoso 
y no acusatorio, evitando términos como «actividad sospechosa de su 
parte». El cliente debe recibir el mensaje en un tiempo máximo de 
30 segundos tras el bloqueo.

---

## Flujo del proceso

| Paso | Descripción |
|------|-------------|
| 1 | El sistema ejecuta un bloqueo automático de transacción (RF-008). |
| 2 | Se activa el módulo de notificación al cliente. |
| 3 | Se identifica al cliente afectado y sus canales de comunicación disponibles. |
| 4 | Se genera el mensaje con tono empático y no acusatorio. |
| 5 | Se envía la notificación a través de los canales oficiales: aplicación móvil, SMS y/o correo electrónico. |
| 6 | Se registra la notificación enviada con: canal utilizado, destinatario, marca temporal y estado de entrega. |
| 7 | Si la notificación falla en algún canal, se registra el error para seguimiento. |

---

## Reglas de Negocio

| ID | Regla |
|----|-------|
| RN-163 | El cliente debe recibir la notificación en un máximo de 30 segundos tras el bloqueo. |
| RN-164 | Los canales de notificación disponibles son: aplicación móvil, SMS y correo electrónico. |
| RN-165 | El mensaje debe redactarse con tono empático, respetuoso y no acusatorio. |
| RN-166 | El mensaje oficial es: «Detectamos una transacción inusual en su cuenta. Por seguridad, la hemos detenido temporalmente. Si la realizó usted, comuníquese con nosotros.» |
| RN-167 | Se prohíbe el uso de términos como «actividad sospechosa de su parte» o cualquier expresión acusatoria. |
| RN-168 | Toda notificación enviada debe registrarse con: canal, destinatario, marca temporal y estado de entrega. |
| RN-169 | Los fallos de notificación deben registrarse como incidentes para seguimiento. |
