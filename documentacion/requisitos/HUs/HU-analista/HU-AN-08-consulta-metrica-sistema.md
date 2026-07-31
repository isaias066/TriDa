<!--
  ¿Qué? Historia de usuario que describe la consulta de métricas de desempeño del sistema antifraude.
  ¿Para qué? Formalizar la necesidad del analista de evaluar el rendimiento del sistema y apoyar la toma de decisiones.
  ¿Impacto? Permite identificar degradaciones del modelo y justificar ajustes operativos con datos concretos.
-->

# HU-AN-08 — Consulta de Métricas del Sistema

## Identificación

| Campo            | Valor                          |
| ---------------- | ------------------------------ |
| **ID**           | HU-AN-08                       |
| **Título**       | Consulta de métricas del sistema |
| **Módulo**       | Analista de Seguridad          |

---

## Historia

**Como** analista de seguridad,
**quiero** consultar reportes automáticos con métricas como tasa de detección, falsos positivos, tiempo de respuesta, monto protegido y tendencias,
**para** evaluar el desempeño del sistema y apoyar la toma de decisiones.

---

## Criterios de Aceptación

### CA-AN-08.1 — Consulta de reportes por período
- **Dado que** accedo al módulo de métricas,
- **cuando** selecciono un período de tiempo,
- **entonces** debo poder consultar reportes diarios, semanales y mensuales de forma independiente.

### CA-AN-08.2 — Visualización de métricas principales
- **Dado que** estoy en el módulo de métricas con un período seleccionado,
- **cuando** visualizo el reporte,
- **entonces** debo ver la tasa de detección, los falsos positivos, el tiempo de respuesta promedio y el monto total protegido.

### CA-AN-08.3 — Comparación entre períodos
- **Dado que** estoy consultando las métricas del sistema,
- **cuando** selecciono dos períodos diferentes para comparar,
- **entonces** debo ver ambos conjuntos de métricas lado a lado para identificar variaciones y tendencias.
