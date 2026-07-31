<!--
  ¿Qué? Historia de usuario que describe la verificación de que un cliente fue notificado tras un bloqueo automático.
  ¿Para qué? Formalizar la necesidad del operador de confirmar que el proceso de comunicación al cliente funcionó correctamente.
  ¿Impacto? Garantiza la transparencia con el cliente y permite escalar rápidamente cualquier fallo en la notificación.
-->

# HU-OP-10 — Verificación de Notificación al Cliente

## Identificación

| Campo            | Valor                                        |
| ---------------- | -------------------------------------------- |
| **ID**           | HU-OP-10                                     |
| **Título**       | Verificación de notificación al cliente      |
| **Módulo**       | Operador de Monitoreo                        |

---

## Historia

**Como** operador de monitoreo,
**quiero** verificar que un cliente afectado por un bloqueo automático recibió la notificación correspondiente a través de los canales oficiales (aplicación, SMS o correo electrónico) en un tiempo máximo de 30 segundos,
**para** confirmar que el proceso de comunicación funcionó correctamente y escalar cualquier incidente de notificación.

---

## Criterios de Aceptación

### CA-OP-10.1 — Consulta del registro de notificación
- **Dado que** accedo al detalle de una transacción bloqueada automáticamente,
- **cuando** consulto la sección de notificación al cliente,
- **entonces** debo ver el registro de la notificación enviada incluyendo el estado (enviada, fallida o pendiente).

### CA-OP-10.2 — Canal utilizado y marca temporal
- **Dado que** consulto el registro de notificación,
- **cuando** visualizo los detalles,
- **entonces** debo ver el canal utilizado (aplicación, SMS o correo electrónico) y la marca temporal exacta del envío.

### CA-OP-10.3 — Verificación del tiempo de envío
- **Dado que** consulto la notificación enviada,
- **cuando** comparo la hora del bloqueo con la hora del envío de la notificación,
- **entonces** el sistema debe indicar visualmente si la notificación se envió dentro del tiempo máximo de 30 segundos.

### CA-OP-10.4 — Escalamiento por fallo en la notificación
- **Dado que** la notificación falló o excedió el tiempo máximo de 30 segundos,
- **cuando** identifico el problema,
- **entonces** debo poder escalar el incidente de notificación con una nota obligatoria indicando el motivo del escalamiento.
