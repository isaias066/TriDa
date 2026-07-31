<!--
  ¿Qué? Requisito funcional que describe el módulo de registro y 
  auditoría inmutable del sistema.
  ¿Para qué? Definir cómo el sistema registra de forma permanente, 
  inalterable y con firma de integridad todas las transacciones, 
  scores, decisiones automáticas y acciones de los usuarios.
  ¿Impacto? Sin auditoría inmutable el sistema no puede demostrar 
  cumplimiento normativo (PCI-DSS, ISO 27001) ni proporcionar 
  evidencia válida para investigaciones forenses o procesos legales.
-->

# RF-015 — Módulo de Registro y Auditoría Inmutable

**Historias de usuario relacionadas:** HU-AD-10, HU-AU-01, HU-AU-03, HU-PR-09

## Descripción

El sistema registrará de forma inmutable y permanente todas las 
transacciones procesadas, scores asignados, decisiones automatizadas 
(aprobaciones, alertas, bloqueos) y acciones de analistas. Los logs 
deberán contener: marca temporal precisa, identificador único de 
transacción, datos completos de la operación, trazabilidad del flujo 
de procesamiento y firma de integridad que garantice que el registro 
no fue alterado. Estos registros son esenciales para cumplimiento 
normativo PCI-DSS, ISO 27001 y auditorías de la Superintendencia 
Financiera de Colombia.

---

## Flujo del proceso

| Paso | Descripción |
|------|-------------|
| 1 | Un evento ocurre en el sistema: transacción procesada, score asignado, alerta generada, bloqueo ejecutado o acción de un usuario. |
| 2 | El módulo de auditoría captura automáticamente el evento. |
| 3 | Se asigna un identificador único al registro. |
| 4 | Se agrega la marca temporal precisa del evento. |
| 5 | Se genera la firma criptográfica de integridad del registro. |
| 6 | El registro se almacena de forma inmutable en la base de datos. |
| 7 | El registro queda disponible para consulta por usuarios autorizados (RF-016). |

---

## Reglas de Negocio

| ID | Regla |
|----|-------|
| RN-085 | Todo evento del sistema debe registrarse de forma automática e inmutable. |
| RN-086 | Los eventos registrados incluyen: transacciones procesadas, scores asignados, alertas generadas, bloqueos ejecutados, desbloqueos, clasificaciones de analistas y cambios de configuración. |
| RN-087 | Cada registro debe contener: marca temporal precisa, identificador único, datos completos de la operación y trazabilidad del flujo. |
| RN-088 | Cada registro debe incluir una firma criptográfica de integridad que garantice que no fue alterado. |
| RN-089 | Ningún usuario, incluido el administrador, puede modificar ni eliminar registros de auditoría. |
| RN-090 | Los intentos de modificación o eliminación deben registrarse como eventos de seguridad. |
| RN-091 | Los registros deben conservarse por un mínimo de 5 años según normativa financiera colombiana. |
