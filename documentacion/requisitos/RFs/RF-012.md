<!--
  ¿Qué? Requisito funcional que describe los filtros avanzados de 
  búsqueda en el dashboard.
  ¿Para qué? Definir los criterios de búsqueda combinables que 
  permiten a analistas y operadores localizar alertas y transacciones 
  específicas de forma rápida y precisa.
  ¿Impacto? Sin filtros avanzados la localización de casos específicos 
  es lenta e ineficiente, afectando los tiempos de respuesta durante 
  investigaciones y turnos de monitoreo.
-->

# RF-012 — Filtros Avanzados de Búsqueda en el Dashboard

**Historias de usuario relacionadas:** HU-OP-07, HU-AN-06

## Descripción

El dashboard debe incluir filtros avanzados y combinables para localizar 
alertas y transacciones específicas. Los filtros disponibles serán: 
rango de fechas, cliente (nombre o identificación), rango de monto, 
nivel de score de riesgo, tipo de transacción, canal bancario (app, 
cajero, web, punto de venta), estado de la alerta (pendiente, validada, 
bloqueada, falso positivo) y analista que gestionó el caso. Los 
resultados se mostrarán en tiempo real a medida que se aplican los filtros.

---

## Flujo del proceso

| Paso | Descripción |
|------|-------------|
| 1 | El usuario accede a la sección de filtros desde el dashboard. |
| 2 | El usuario selecciona uno o más criterios de filtrado. |
| 3 | Los resultados se actualizan en tiempo real a medida que se aplican los filtros. |
| 4 | La selección de filtros permanece activa mientras el usuario navega por los resultados. |
| 5 | El usuario puede limpiar o modificar los filtros sin perder la información. |
| 6 | Los resultados filtrados pueden exportarse si el usuario tiene permisos (RF-018). |

---

## Reglas de Negocio

| ID | Regla |
|----|-------|
| RN-070 | Los filtros disponibles son: rango de fechas, cliente, rango de monto, score de riesgo, tipo de transacción, canal bancario, estado de la alerta y analista asignado. |
| RN-071 | Los filtros deben ser combinables entre sí. |
| RN-072 | Los resultados deben actualizarse en tiempo real a medida que se aplican los filtros. |
| RN-073 | La selección de filtros debe persistir mientras el usuario navega por los resultados. |
| RN-074 | El usuario debe poder limpiar todos los filtros con una sola acción. |
