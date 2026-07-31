<!--
  ¿Qué? Historia de usuario que describe la consulta de todas las acciones realizadas por los administradores del sistema.
  ¿Para qué? Formalizar la necesidad del auditor de verificar que las actividades administrativas cumplen las políticas de seguridad.
  ¿Impacto? Permite detectar acciones administrativas no autorizadas o inconsistentes con las políticas establecidas.
-->

# HU-AU-06 — Consulta de Acciones Administrativas

## Identificación

| Campo            | Valor                                    |
| ---------------- | ---------------------------------------- |
| **ID**           | HU-AU-06                                 |
| **Título**       | Consulta de acciones administrativas     |
| **Módulo**       | Auditor                                  |

---

## Historia

**Como** auditor,
**quiero** consultar todas las acciones realizadas por los administradores, incluyendo cambios de configuración, gestión de usuarios y modificaciones del motor de riesgo,
**para** verificar que las actividades administrativas cumplan las políticas de seguridad establecidas.

---

## Criterios de Aceptación

### CA-AU-06.1 — Visualización de todas las acciones administrativas
- **Dado que** accedo al módulo de acciones administrativas,
- **cuando** visualizo el listado,
- **entonces** debo ver todas las acciones realizadas por administradores incluyendo cambios de configuración, gestión de usuarios y modificaciones del motor de riesgo.

### CA-AU-06.2 — Usuario responsable y fecha por acción
- **Dado que** estoy revisando el listado de acciones administrativas,
- **cuando** observo cada registro,
- **entonces** debo ver claramente el usuario administrador que ejecutó la acción y la fecha y hora exacta en que ocurrió.

### CA-AU-06.3 — Filtro por tipo de cambio realizado
- **Dado que** estoy en el módulo de acciones administrativas,
- **cuando** aplico un filtro por tipo de cambio (configuración, gestión de usuarios o motor de riesgo),
- **entonces** los resultados deben mostrar únicamente las acciones correspondientes al tipo seleccionado.
