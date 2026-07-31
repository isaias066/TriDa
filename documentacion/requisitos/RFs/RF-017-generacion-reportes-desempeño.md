<!--
  ¿Qué? Requisito funcional que describe la generación automática 
  de reportes de desempeño del sistema.
  ¿Para qué? Definir las métricas clave que el sistema debe calcular 
  y presentar automáticamente para evaluar la efectividad de la 
  detección de fraude y el rendimiento operativo.
  ¿Impacto? Sin reportes automáticos no es posible evaluar el 
  desempeño del sistema ni tomar decisiones basadas en datos para 
  la mejora continua del modelo y la operación.
-->

# RF-017 — Generación de Reportes Automáticos de Desempeño

*Historias de usuario relacionadas:* HU-AN-08, HU-AU-04

## Descripción

El sistema generará reportes automáticos con métricas clave de 
rendimiento y efectividad: número total de transacciones procesadas, 
alertas generadas por nivel de criticidad, tasa de detección de fraudes 
reales, tasa de falsos positivos y falsos negativos, tiempo promedio 
de respuesta del sistema, número y monto de transacciones bloqueadas, 
monto total protegido y tendencias temporales de los indicadores. Los 
reportes se generarán automáticamente en intervalos configurables: 
diario, semanal y mensual.

---

## Flujo del proceso

| Paso | Descripción |
|------|-------------|
| 1 | El sistema ejecuta automáticamente la generación del reporte según el intervalo configurado (diario, semanal o mensual). |
| 2 | Se recopilan las métricas del período correspondiente desde la base de datos. |
| 3 | Se calculan los indicadores: total de transacciones, alertas por nivel, tasa de detección, falsos positivos, falsos negativos, tiempo de respuesta, transacciones bloqueadas y monto protegido. |
| 4 | Se generan las tendencias temporales comparando con períodos anteriores. |
| 5 | El reporte se almacena y queda disponible para consulta en el dashboard. |
| 6 | El reporte puede exportarse en formatos estándar (RF-018). |

---

## Reglas de Negocio

| ID | Regla |
|----|-------|
| RN-098 | Los reportes deben generarse automáticamente en intervalos configurables: diario, semanal y mensual. |
| RN-099 | Las métricas obligatorias son: total de transacciones, alertas por nivel, tasa de detección, falsos positivos, falsos negativos, tiempo de respuesta, transacciones bloqueadas y monto protegido. |
| RN-100 | Los reportes deben incluir tendencias temporales comparando con períodos anteriores. |
| RN-101 | Los reportes generados deben almacenarse para consulta posterior. |
| RN-102 | El intervalo de generación debe ser configurable por el administrador. |
