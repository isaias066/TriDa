<!--
  ¿Qué? Historia de usuario que describe la búsqueda avanzada de alertas con filtros combinados para el operador.
  ¿Para qué? Formalizar la necesidad del operador de localizar transacciones o alertas específicas durante su turno.
  ¿Impacto? Reduce el tiempo de localización de casos y mejora la eficiencia operativa durante el monitoreo.
-->

# HU-OP-07 — Búsqueda Avanzada de Alertas

## Identificación

| Campo            | Valor                          |
| ---------------- | ------------------------------ |
| **ID**           | HU-OP-07                       |
| **Título**       | Búsqueda avanzada de alertas   |
| **Módulo**       | Operador de Monitoreo          |

---

## Historia

**Como** operador de monitoreo,
**quiero** aplicar filtros por fecha, cliente, canal bancario, score de riesgo y estado de la alerta,
**para** localizar rápidamente transacciones o alertas específicas durante mi turno de monitoreo.

---

## Criterios de Aceptación

### CA-OP-07.1 — Filtros disponibles en el módulo de búsqueda
- **Dado que** accedo al módulo de búsqueda de alertas,
- **cuando** visualizo el panel de filtros,
- **entonces** debo encontrar disponibles los filtros de fecha, cliente, canal bancario, score de riesgo y estado de la alerta.

### CA-OP-07.2 — Aplicación de filtros combinados
- **Dado que** estoy en el módulo de búsqueda,
- **cuando** selecciono múltiples filtros al mismo tiempo y ejecuto la búsqueda,
- **entonces** los resultados deben corresponder exactamente a la combinación de todos los filtros aplicados.

### CA-OP-07.3 — Actualización de resultados en tiempo real
- **Dado que** estoy aplicando filtros,
- **cuando** modifico o agrego un filtro,
- **entonces** los resultados deben actualizarse de forma inmediata sin necesidad de recargar la página.

### CA-OP-07.4 — Persistencia de filtros al navegar
- **Dado que** apliqué filtros y obtuve resultados,
- **cuando** accedo al detalle de una alerta y regreso a la lista,
- **entonces** los filtros seleccionados deben permanecer activos y los resultados deben mantenerse sin necesidad de volver a configurarlos.
