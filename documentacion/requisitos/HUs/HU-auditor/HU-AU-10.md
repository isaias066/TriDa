<!--
  ¿Qué? Historia de usuario que describe la consulta del historial de disponibilidad del sistema y sus incidentes.
  ¿Para qué? Formalizar la necesidad del auditor de verificar el cumplimiento de los acuerdos de nivel de servicio.
  ¿Impacto? Permite demostrar o identificar incumplimientos de SLA y evaluar la continuidad operativa del sistema.
-->

# HU-AU-10 — Consulta de Disponibilidad del Sistema

## Identificación

| Campo            | Valor                                      |
| ---------------- | ------------------------------------------ |
| **ID**           | HU-AU-10                                   |
| **Título**       | Consulta de disponibilidad del sistema     |
| **Módulo**       | Auditor                                    |

---

## Historia

**Como** auditor,
**quiero** consultar el historial de disponibilidad del sistema, interrupciones, tiempos de respuesta y eventos críticos registrados,
**para** verificar el cumplimiento de los acuerdos de nivel de servicio (SLA) y la continuidad operativa.

---

## Criterios de Aceptación

### CA-AU-10.1 — Consulta del historial de disponibilidad
- **Dado que** accedo al módulo de disponibilidad del sistema,
- **cuando** visualizo el historial,
- **entonces** debo ver el registro completo de períodos de disponibilidad e indisponibilidad organizados cronológicamente.

### CA-AU-10.2 — Tiempos de indisponibilidad y causa del incidente
- **Dado que** estoy consultando el historial de disponibilidad,
- **cuando** reviso un período de indisponibilidad,
- **entonces** debo ver la duración exacta de la interrupción y la causa registrada del incidente.

### CA-AU-10.3 — Exportación de resultados para auditorías
- **Dado que** consulté el historial de disponibilidad con los filtros necesarios,
- **cuando** ejecuto la exportación,
- **entonces** debo poder descargar los resultados en un formato adecuado para ser presentado como evidencia en auditorías de cumplimiento de SLA.
