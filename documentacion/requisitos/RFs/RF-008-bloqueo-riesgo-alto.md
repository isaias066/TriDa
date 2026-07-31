<!--
  ¿Qué? Requisito funcional que describe el bloqueo automático e 
  inmediato de transacciones con score de riesgo superior al 95 %.
  ¿Para qué? Definir cómo el sistema detiene transacciones de muy 
  alto riesgo antes de que se completen en el Core Banking, 
  registrando el evento y notificando al cliente y al equipo 
  de seguridad.
  ¿Impacto? Sin bloqueo automático el sistema solo detecta fraudes 
  de forma reactiva, permitiendo que las pérdidas económicas se 
  materialicen antes de cualquier intervención.
-->

# RF-008 — Bloqueo Automático de Transacciones de Muy Alto Riesgo

**Historias de usuario relacionadas:** HU-OP-05, HU-PR-07

## Descripción

El sistema bloqueará automáticamente e inmediatamente toda transacción 
con score de riesgo superior al 95 %, antes de que se complete en el 
sistema bancario central. Al activarse un bloqueo, el sistema registrará 
el evento en el módulo de auditoría, notificará al equipo de seguridad 
mediante el dashboard y comunicará al cliente a través de canales 
oficiales (app, SMS, email) que su transacción fue detenida por 
razones de seguridad, usando un mensaje empático y no acusatorio.

---

## Flujo del proceso

| Paso | Descripción |
|------|-------------|
| 1 | El motor de alertas detecta que el score supera el 95 %. |
| 2 | Se bloquea inmediatamente la transacción antes de su autorización en el Core Banking. |
| 3 | Se registra el evento de bloqueo en el módulo de auditoría (RF-015) con todos los detalles. |
| 4 | Se notifica al equipo de seguridad mediante todos los canales (RF-007). |
| 5 | Se envía notificación al cliente afectado a través de canales oficiales (RF-027). |
| 6 | La transacción bloqueada queda disponible para revisión y posible desbloqueo (RF-009). |

---

## Reglas de Negocio

| ID | Regla |
|----|-------|
| RN-045 | Toda transacción con score superior al 95 % debe bloquearse automáticamente antes de completarse. |
| RN-046 | El bloqueo debe ejecutarse antes de la autorización en el Core Banking. |
| RN-047 | El evento de bloqueo debe registrarse inmediatamente en el módulo de auditoría con todos los detalles. |
| RN-048 | El equipo de seguridad debe ser notificado por todos los canales disponibles. |
| RN-049 | El cliente debe recibir la notificación en un máximo de 30 segundos tras el bloqueo. |
| RN-050 | El mensaje al cliente debe ser empático y no acusatorio. |
| RN-051 | El umbral de bloqueo (95 %) es configurable por el administrador (RF-024). |
