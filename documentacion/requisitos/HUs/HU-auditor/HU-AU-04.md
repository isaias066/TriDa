<!--
  ¿Qué? Historia de usuario que describe la generación de reportes completos de auditoría con filtros aplicados.
  ¿Para qué? Formalizar la necesidad del auditor de producir evidencia estructurada para auditorías internas o externas.
  ¿Impacto? Permite entregar evidencia verificable y organizada a cualquier ente auditor sin reprocesos manuales.
-->

# HU-AU-04 — Generación de Reportes de Auditoría

## Identificación

| Campo            | Valor                                  |
| ---------------- | -------------------------------------- |
| **ID**           | HU-AU-04                               |
| **Título**       | Generación de reportes de auditoría    |
| **Módulo**       | Auditor                                |

---

## Historia

**Como** auditor,
**quiero** generar reportes completos de auditoría filtrando por período, tipo de evento y usuario,
**para** entregar evidencia durante auditorías internas o externas.

---

## Criterios de Aceptación

### CA-AU-04.1 — Selección del rango de fechas
- **Dado que** voy a generar un reporte de auditoría,
- **cuando** configuro los parámetros del reporte,
- **entonces** debo poder definir un rango de fechas específico que delimite el período a reportar.

### CA-AU-04.2 — Aplicación de filtros antes de generar
- **Dado que** estoy configurando el reporte,
- **cuando** aplico filtros por tipo de evento y usuario antes de generarlo,
- **entonces** el reporte resultante debe contener únicamente los registros que correspondan a los filtros seleccionados.

### CA-AU-04.3 — Contenido completo del período consultado
- **Dado que** generé el reporte con los parámetros definidos,
- **cuando** reviso su contenido,
- **entonces** debe incluir todos los eventos del período seleccionado sin omisiones y con la información completa de cada registro.
