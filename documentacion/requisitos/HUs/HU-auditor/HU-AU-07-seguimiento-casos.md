<!--
  ¿Qué? Historia de usuario que describe el seguimiento completo del ciclo de vida de cada caso de fraude investigado.
  ¿Para qué? Formalizar la necesidad del auditor de verificar que cada caso fue tratado conforme a los procedimientos establecidos.
  ¿Impacto? Garantiza la trazabilidad completa de cada caso y soporta procesos disciplinarios o legales derivados.
-->

# HU-AU-07 — Seguimiento de Casos Investigados

## Identificación

| Campo            | Valor                                |
| ---------------- | ------------------------------------ |
| **ID**           | HU-AU-07                             |
| **Título**       | Seguimiento de casos investigados    |
| **Módulo**       | Auditor                              |

---

## Historia

**Como** auditor,
**quiero** consultar el historial completo de cada caso de fraude, incluyendo las decisiones del sistema, las acciones del operador y las validaciones realizadas por el analista,
**para** verificar que cada caso fue tratado conforme a los procedimientos establecidos.

---

## Criterios de Aceptación

### CA-AU-07.1 — Trazabilidad completa del caso
- **Dado que** accedo al detalle de un caso de fraude,
- **cuando** visualizo su historial,
- **entonces** debo ver la secuencia completa de eventos ordenados cronológicamente desde la detección inicial hasta su cierre.

### CA-AU-07.2 — Decisiones automáticas del sistema visibles
- **Dado que** estoy revisando el historial de un caso,
- **cuando** consulto las decisiones automatizadas,
- **entonces** debo ver cada decisión tomada por el motor de riesgo con el score que la originó y la marca temporal.

### CA-AU-07.3 — Acciones del operador registradas
- **Dado que** estoy revisando el historial de un caso,
- **cuando** consulto las acciones del operador,
- **entonces** debo ver cada acción ejecutada con el nombre del operador responsable y la fecha y hora exacta.

### CA-AU-07.4 — Validaciones del analista registradas
- **Dado que** estoy revisando el historial de un caso,
- **cuando** consulto las validaciones del analista,
- **entonces** debo ver la clasificación asignada, la justificación ingresada, el nombre del analista y la fecha y hora de la validación.

### CA-AU-07.5 — Disponibilidad durante el tiempo normativo
- **Dado que** consulto un caso con varios años de antigüedad,
- **cuando** accedo a su historial,
- **entonces** toda la información debe estar disponible durante el período mínimo definido por la normativa vigente.
