<!--
  ¿Qué? Requisito funcional que describe el mecanismo de escalado 
  formal de casos entre operadores y analistas.
  ¿Para qué? Definir cómo los operadores de monitoreo transfieren 
  alertas a los analistas de seguridad cuando identifican situaciones 
  que requieren validación especializada.
  ¿Impacto? Sin escalado formal los operadores no tienen un canal 
  estructurado para transferir casos, generando pérdida de contexto, 
  retrasos en la atención y falta de trazabilidad en la gestión 
  de alertas.
-->

# RF-029 — Escalado de Casos entre Operadores y Analistas

**Historias de usuario relacionadas:** HU-OP-03

## Descripción

El sistema debe implementar un mecanismo formal de escalado de casos. 
Los operadores de monitoreo, que tienen acceso limitado de solo 
visualización, deben poder escalar alertas a analistas de seguridad 
cuando identifiquen situaciones que requieran validación. El escalado 
debe incluir: selección del analista destino (o escalado automático 
al analista disponible), nota obligatoria explicando el motivo del 
escalado y notificación inmediata al analista receptor. El historial 
de escalados quedará registrado en la trazabilidad del caso.

---

## Flujo del proceso

| Paso | Descripción |
|------|-------------|
| 1 | El operador identifica una alerta que requiere validación especializada. |
| 2 | El operador selecciona la opción de escalado desde la vista de la alerta. |
| 3 | El operador selecciona el analista destino o elige escalado automático al analista disponible. |
| 4 | El operador ingresa una nota obligatoria explicando el motivo del escalado. |
| 5 | El sistema registra el escalado con: operador origen, analista destino, nota, fecha y hora. |
| 6 | El analista receptor recibe una notificación inmediata del caso asignado. |
| 7 | El escalado queda registrado en la trazabilidad del caso y en el módulo de auditoría (RF-015). |

---

## Reglas de Negocio

| ID | Regla |
|----|-------|
| RN-176 | Solo los operadores de monitoreo pueden escalar alertas a analistas. |
| RN-177 | El escalado debe incluir la selección del analista destino o escalado automático al analista disponible. |
| RN-178 | La nota explicando el motivo del escalado es obligatoria. |
| RN-179 | El analista receptor debe recibir una notificación inmediata del caso asignado. |
| RN-180 | El historial de escalados debe quedar registrado en la trazabilidad del caso. |
| RN-181 | El escalado debe registrarse en el módulo de auditoría con: operador, analista, nota, fecha y hora. |
