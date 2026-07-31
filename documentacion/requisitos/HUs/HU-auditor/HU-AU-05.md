<!--
  ¿Qué? Historia de usuario que describe la exportación de registros de auditoría en múltiples formatos.
  ¿Para qué? Formalizar la necesidad del auditor de compartir evidencia con entidades regulatorias y áreas de cumplimiento.
  ¿Impacto? Facilita la entrega de evidencia verificable en el formato requerido por cada ente auditor o regulador.
-->

# HU-AU-05 — Exportación de Evidencias

## Identificación

| Campo            | Valor                      |
| ---------------- | -------------------------- |
| **ID**           | HU-AU-05                   |
| **Título**       | Exportación de evidencias  |
| **Módulo**       | Auditor                    |

---

## Historia

**Como** auditor,
**quiero** exportar los registros de auditoría en formatos PDF, Excel (XLSX) o CSV,
**para** compartir evidencia con entidades regulatorias, auditorías externas o áreas internas de cumplimiento.

---

## Criterios de Aceptación

### CA-AU-05.1 — Selección del formato de exportación
- **Dado que** voy a exportar registros de auditoría,
- **cuando** accedo a la opción de exportación,
- **entonces** debo poder elegir entre los formatos PDF, Excel (XLSX) y CSV antes de iniciar la descarga.

### CA-AU-05.2 — Integridad de los datos exportados
- **Dado que** ejecuté la exportación en el formato seleccionado,
- **cuando** abro el archivo descargado,
- **entonces** los datos deben coincidir exactamente con los registros visualizados en pantalla sin alteraciones ni pérdida de información.

### CA-AU-05.3 — Filtros aplicados reflejados en la exportación
- **Dado que** apliqué filtros antes de exportar,
- **cuando** reviso el archivo descargado,
- **entonces** debe contener únicamente los registros correspondientes a los filtros que estaban activos al momento de la exportación.
