<!--
  ¿Qué? Requisito funcional que describe el monitoreo del estado 
  y salud del sistema en tiempo real.
  ¿Para qué? Definir cómo el administrador supervisa el estado de 
  cada módulo, las métricas de rendimiento del servidor y la 
  conexión con el Core Banking para detectar y actuar ante fallos.
  ¿Impacto? Sin monitoreo de salud los fallos y degradaciones del 
  sistema pasan desapercibidos hasta que afectan directamente la 
  detección de fraude o la operación del banco.
-->

# RF-025 — Monitoreo del Estado y Salud del Sistema

**Historias de usuario relacionadas:** HU-AD-04, HU-AU-10

## Descripción

El sistema debe proporcionar al administrador una vista de salud del 
sistema en tiempo real que incluya: estado de cada módulo (activo, 
degradado, inactivo), métricas de rendimiento del servidor (CPU, 
memoria, latencia de procesamiento), número de transacciones 
procesadas por segundo, estado de la conexión con el sistema bancario 
central y alertas técnicas ante anomalías de rendimiento. El sistema 
debe notificar automáticamente al administrador cuando algún 
componente presente fallos o degrade su rendimiento por debajo de 
los umbrales configurados.

---

## Flujo del proceso

| Paso | Descripción |
|------|-------------|
| 1 | El administrador accede al panel de salud del sistema. |
| 2 | El sistema muestra el estado de cada módulo: activo, degradado o inactivo. |
| 3 | Se presentan las métricas de rendimiento del servidor: CPU, memoria y latencia. |
| 4 | Se muestra el número de transacciones procesadas por segundo. |
| 5 | Se muestra el estado de la conexión con el Core Banking. |
| 6 | Si un componente falla o degrada su rendimiento por debajo de los umbrales, se genera una alerta técnica automática. |
| 7 | La alerta técnica se notifica al administrador mediante los canales configurados. |
| 8 | El historial de incidentes técnicos queda registrado para consulta posterior. |

---

## Reglas de Negocio

| ID | Regla |
|----|-------|
| RN-150 | El panel de salud debe mostrar el estado en tiempo real de cada módulo del sistema. |
| RN-151 | Los estados posibles de cada módulo son: activo, degradado e inactivo. |
| RN-152 | Las métricas de rendimiento obligatorias son: CPU, memoria, latencia y transacciones por segundo. |
| RN-153 | El estado de la conexión con el Core Banking debe ser visible en el panel. |
| RN-154 | El sistema debe notificar automáticamente al administrador cuando un componente falle o se degrade. |
| RN-155 | El historial de incidentes técnicos debe conservarse para consulta posterior y auditoría. |
