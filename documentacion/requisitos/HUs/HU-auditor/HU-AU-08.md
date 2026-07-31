<!--
  ¿Qué? Historia de usuario que describe la verificación del cumplimiento normativo del sistema antifraude.
  ¿Para qué? Formalizar la necesidad del auditor de identificar incumplimientos antes de auditorías regulatorias.
  ¿Impacto? Permite corregir brechas de cumplimiento con anticipación y evitar sanciones regulatorias.
-->

# HU-AU-08 — Consulta del Cumplimiento Normativo

## Identificación

| Campo            | Valor                                  |
| ---------------- | -------------------------------------- |
| **ID**           | HU-AU-08                               |
| **Título**       | Consulta del cumplimiento normativo    |
| **Módulo**       | Auditor                                |

---

## Historia

**Como** auditor,
**quiero** verificar que el sistema cumpla con los controles establecidos por PCI-DSS, ISO 27001 y la normativa vigente de la Superintendencia Financiera de Colombia,
**para** identificar posibles incumplimientos antes de auditorías regulatorias.

---

## Criterios de Aceptación

### CA-AU-08.1 — Consulta de controles implementados
- **Dado que** accedo al módulo de cumplimiento normativo,
- **cuando** visualizo el panel de controles,
- **entonces** debo ver el listado de controles implementados organizados por marco normativo (PCI-DSS, ISO 27001 y Superintendencia Financiera de Colombia).

### CA-AU-08.2 — Identificación de controles pendientes o incumplidos
- **Dado que** estoy revisando el panel de cumplimiento,
- **cuando** consulto el estado de cada control,
- **entonces** debo poder identificar visualmente cuáles están implementados, cuáles están pendientes y cuáles presentan incumplimiento.

### CA-AU-08.3 — Generación de evidencia del estado de cumplimiento
- **Dado que** revisé el estado de cumplimiento normativo,
- **cuando** genero la evidencia,
- **entonces** debo poder exportar un documento que refleje el estado actual de cada control con su clasificación y fecha de verificación.
