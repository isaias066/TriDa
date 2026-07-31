<!--
  ¿Qué? Historia de usuario que describe la consulta del historial completo de auditoría del sistema.
  ¿Para qué? Formalizar la necesidad del auditor de verificar el cumplimiento de políticas internas y requisitos regulatorios.
  ¿Impacto? Sin acceso al historial completo no es posible demostrar cumplimiento durante auditorías o investigaciones.
-->

# HU-AU-01 — Consulta del Historial de Auditoría

## Identificación

| Campo            | Valor                                    |
| ---------------- | ---------------------------------------- |
| **ID**           | HU-AU-01                                 |
| **Título**       | Consulta del historial de auditoría      |
| **Módulo**       | Auditor                                  |

---

## Historia

**Como** auditor,
**quiero** consultar el historial completo de auditoría del sistema, incluyendo transacciones, decisiones automáticas, acciones de analistas y configuraciones administrativas,
**para** verificar el cumplimiento de las políticas internas y los requisitos regulatorios durante auditorías o investigaciones.

---

## Criterios de Aceptación

### CA-AU-01.1 — Acceso al historial completo de auditoría
- **Dado que** soy auditor autenticado en el sistema,
- **cuando** accedo al módulo de auditoría,
- **entonces** debo ver el historial completo de eventos que incluya transacciones, decisiones automáticas, acciones de analistas y configuraciones administrativas.

### CA-AU-01.2 — Organización cronológica de los eventos
- **Dado que** estoy consultando el historial de auditoría,
- **cuando** visualizo los registros,
- **entonces** deben estar organizados cronológicamente del evento más reciente al más antiguo de forma predeterminada.

### CA-AU-01.3 — Información completa por evento
- **Dado que** estoy revisando un evento en el historial,
- **cuando** visualizo su contenido,
- **entonces** debo ver el usuario que lo generó, la fecha y hora exacta y la descripción de la acción realizada.
