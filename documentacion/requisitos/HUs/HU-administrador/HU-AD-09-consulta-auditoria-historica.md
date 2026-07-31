<!--
  ¿Qué? Historia de usuario que describe la consulta del historial de auditoría con filtros avanzados.
  ¿Para qué? Formalizar la necesidad de acceder a registros históricos para investigaciones y requerimientos regulatorios.
  ¿Impacto? Soporta investigaciones forenses, procesos legales y cumplimiento de normativas de retención de datos.
-->

# HU-AD-09 — Consulta de Auditoría Histórica

## Identificación

| Campo            | Valor                            |
| ---------------- | -------------------------------- |
| **ID**           | HU-AD-09                         |
| **Título**       | Consulta de auditoría histórica  |
| **Módulo**       | Administración                   |

---

## Historia

**Como** administrador del sistema,
**quiero** consultar el registro histórico de auditoría (mínimo cinco años), filtrando por fecha, cliente, tipo de transacción, analista y score de riesgo,
**para** soportar investigaciones forenses, procesos legales y requerimientos regulatorios.

---

## Criterios de Aceptación

### CA-AD-09.1 — Acceso al módulo de auditoría
- **Dado que** soy administrador autenticado,
- **cuando** accedo al módulo de auditoría histórica,
- **entonces** debo ver el listado de registros disponibles con sus datos principales (fecha, tipo, usuario y score).

### CA-AD-09.2 — Filtro por fecha
- **Dado que** estoy en el módulo de auditoría,
- **cuando** aplico un filtro por rango de fechas,
- **entonces** los resultados deben mostrar únicamente los registros que caen dentro del período seleccionado.

### CA-AD-09.3 — Filtros combinados simultáneos
- **Dado que** estoy consultando la auditoría,
- **cuando** aplico múltiples filtros al mismo tiempo (fecha, cliente, tipo de transacción, analista y score de riesgo),
- **entonces** los resultados deben corresponder exactamente a la combinación de todos los filtros aplicados.

### CA-AD-09.4 — Retención mínima de cinco años
- **Dado que** consulto registros históricos,
- **cuando** busco eventos con más de un año de antigüedad,
- **entonces** el sistema debe mostrar registros de hasta cinco años atrás sin pérdida de información.

### CA-AD-09.5 — Exportación de resultados
- **Dado que** obtuve resultados en la consulta de auditoría,
- **cuando** ejecuto la exportación,
- **entonces** debo poder descargar los registros filtrados en el formato disponible para su análisis externo.
