<!--
  ¿Qué? Historia de usuario que describe la búsqueda avanzada de alertas mediante filtros combinados.
  ¿Para qué? Formalizar la necesidad del analista de localizar casos específicos durante investigaciones.
  ¿Impacto? Reduce el tiempo de localización de casos y facilita investigaciones forenses y seguimientos regulatorios.
-->

# HU-AN-06 — Búsqueda Avanzada de Alertas

## Identificación

| Campo            | Valor                          |
| ---------------- | ------------------------------ |
| **ID**           | HU-AN-06                       |
| **Título**       | Búsqueda avanzada de alertas   |
| **Módulo**       | Analista de Seguridad          |

---

## Historia

**Como** analista de seguridad,
**quiero** aplicar filtros avanzados por fecha, cliente, monto, score, tipo de transacción, canal, estado y analista asignado,
**para** localizar rápidamente casos específicos durante investigaciones.

---

## Criterios de Aceptación

### CA-AN-06.1 — Filtros disponibles en el módulo de búsqueda
- **Dado que** accedo al módulo de búsqueda de alertas,
- **cuando** visualizo el panel de filtros,
- **entonces** debo encontrar disponibles los filtros de fecha, cliente, monto, score, tipo de transacción, canal, estado y analista asignado.

### CA-AN-06.2 — Aplicación de filtros combinados
- **Dado que** estoy en el módulo de búsqueda,
- **cuando** selecciono múltiples filtros al mismo tiempo y ejecuto la búsqueda,
- **entonces** los resultados deben corresponder exactamente a la combinación de todos los filtros aplicados.

### CA-AN-06.3 — Actualización de resultados en tiempo real
- **Dado que** estoy aplicando filtros en la búsqueda,
- **cuando** modifico o agrego un filtro,
- **entonces** los resultados deben actualizarse de forma inmediata sin necesidad de recargar la página.

### CA-AN-06.4 — Exportación de resultados filtrados
- **Dado que** obtuve resultados en la búsqueda avanzada,
- **cuando** ejecuto la exportación,
- **entonces** debo poder descargar únicamente los registros que corresponden a los filtros aplicados.
