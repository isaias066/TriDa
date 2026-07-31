<!--
  ¿Qué? Historia de usuario que describe la consulta de transacciones bloqueadas automáticamente por el sistema.
  ¿Para qué? Formalizar la necesidad del operador de tener trazabilidad de las decisiones automáticas del motor de riesgo.
  ¿Impacto? Permite supervisar las acciones automáticas del sistema y escalar casos que requieran revisión humana.
-->

# HU-OP-05 — Consulta de Bloqueos Automáticos

## Identificación

| Campo            | Valor                            |
| ---------------- | -------------------------------- |
| **ID**           | HU-OP-05                         |
| **Título**       | Consulta de bloqueos automáticos |
| **Módulo**       | Operador de Monitoreo            |

---

## Historia

**Como** operador de monitoreo,
**quiero** visualizar las transacciones bloqueadas automáticamente por el sistema cuando el score de riesgo sea superior al 95%, incluyendo el motivo del bloqueo,
**para** tener trazabilidad de las decisiones automáticas y escalar aquellos casos que requieran revisión.

---

## Criterios de Aceptación

### CA-OP-05.1 — Listado de bloqueos automáticos
- **Dado que** accedo al módulo de bloqueos automáticos,
- **cuando** visualizo la pantalla,
- **entonces** debo ver el listado de todas las transacciones bloqueadas automáticamente con su score y motivo del bloqueo.

### CA-OP-05.2 — Detalle completo de cada transacción bloqueada
- **Dado que** estoy en el listado de bloqueos,
- **cuando** selecciono una transacción,
- **entonces** debo ver el detalle completo incluyendo monto, origen, destino, canal, dispositivo, score y motivo del bloqueo.

### CA-OP-05.3 — Escalamiento de bloqueos a un analista
- **Dado que** identifico un bloqueo automático que requiere revisión especializada,
- **cuando** selecciono la opción de escalar,
- **entonces** debo poder asignar el caso a un analista con una nota justificativa obligatoria.
