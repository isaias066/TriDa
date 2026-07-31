<!--
  ¿Qué? Requisito funcional que describe el registro de validaciones 
  con trazabilidad completa del analista.
  ¿Para qué? Definir cómo el sistema registra de forma permanente e 
  inalterable cada acción que un analista realiza sobre una alerta, 
  garantizando la trazabilidad para auditorías e investigaciones.
  ¿Impacto? Sin trazabilidad del analista no es posible auditar las 
  decisiones humanas del sistema, incumpliendo los requisitos de 
  PCI-DSS e ISO 27001 y comprometiendo la integridad del proceso.
-->

# RF-014 — Registro de Validaciones con Trazabilidad del Analista

**Historias de usuario relacionadas:** HU-AN-04, HU-AU-07

## Descripción

Cada validación o acción que realice un analista sobre una alerta debe 
quedar registrada de forma permanente con: nombre completo del analista, 
rol del usuario, fecha y hora exacta de la acción, clasificación 
asignada, comentarios adicionales y estado anterior de la alerta antes 
de la modificación. Este registro es inalterable y garantiza trazabilidad 
completa para auditorías, investigaciones de fraude y evaluación del 
desempeño del equipo de analistas.

---

## Flujo del proceso

| Paso | Descripción |
|------|-------------|
| 1 | El analista realiza una acción sobre una alerta (clasificación, desbloqueo o escalado). |
| 2 | El sistema captura automáticamente el estado anterior de la alerta. |
| 3 | Se registra la acción con: nombre del analista, rol, fecha, hora, clasificación asignada y comentarios. |
| 4 | El registro se almacena de forma inmutable en el módulo de auditoría (RF-015). |
| 5 | El registro queda disponible para consulta por auditores y administradores. |

---

## Reglas de Negocio

| ID | Regla |
|----|-------|
| RN-080 | Toda acción de un analista sobre una alerta debe registrarse de forma permanente. |
| RN-081 | El registro debe incluir: nombre completo, rol, fecha, hora, clasificación asignada, comentarios y estado anterior de la alerta. |
| RN-082 | Los registros de validación son inmutables y no pueden modificarse ni eliminarse. |
| RN-083 | Los registros deben estar disponibles para consulta por auditores y administradores autorizados. |
| RN-084 | El registro debe capturar el estado anterior de la alerta antes de la modificación. |
