<!--
  ¿Qué? Historia de usuario que describe la búsqueda avanzada de registros de auditoría mediante filtros combinados.
  ¿Para qué? Formalizar la necesidad del auditor de localizar registros específicos de forma eficiente.
  ¿Impacto? Reduce el tiempo de localización de evidencia durante auditorías e investigaciones forenses.
-->

# HU-AU-02 — Búsqueda Avanzada de Registros

## Identificación

| Campo            | Valor                              |
| ---------------- | ---------------------------------- |
| **ID**           | HU-AU-02                           |
| **Título**       | Búsqueda avanzada de registros     |
| **Módulo**       | Auditor                            |

---

## Historia

**Como** auditor,
**quiero** realizar búsquedas avanzadas utilizando filtros por fecha, usuario, cliente, transacción, score de riesgo, tipo de evento y estado,
**para** localizar rápidamente registros específicos durante auditorías o investigaciones.

---

## Criterios de Aceptación

### CA-AU-02.1 — Filtros disponibles en el módulo de búsqueda
- **Dado que** accedo al módulo de búsqueda avanzada de registros,
- **cuando** visualizo el panel de filtros,
- **entonces** debo encontrar disponibles los filtros de fecha, usuario, cliente, transacción, score de riesgo, tipo de evento y estado.

### CA-AU-02.2 — Aplicación de filtros combinados
- **Dado que** estoy en el módulo de búsqueda,
- **cuando** selecciono múltiples filtros al mismo tiempo y ejecuto la búsqueda,
- **entonces** los resultados deben corresponder exactamente a la combinación de todos los filtros aplicados.

### CA-AU-02.3 — Resultados mostrados de forma inmediata
- **Dado que** ejecuto una búsqueda con los filtros configurados,
- **cuando** la consulta se completa,
- **entonces** los resultados deben aparecer de forma inmediata sin demoras perceptibles.

### CA-AU-02.4 — Limpieza y modificación de filtros sin pérdida de información
- **Dado que** apliqué filtros y obtuve resultados,
- **cuando** limpio o modifico alguno de los filtros,
- **entonces** los resultados deben actualizarse correctamente y los datos del historial no deben verse afectados por la operación.
