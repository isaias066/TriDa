<!--
  ¿Qué? Historia de usuario que describe el escalamiento de alertas a un analista de seguridad.
  ¿Para qué? Formalizar la necesidad del operador de derivar casos que requieren análisis especializado.
  ¿Impacto? Garantiza que los casos complejos lleguen al especialista correcto con el contexto suficiente para actuar.
-->

# HU-OP-03 — Escalamiento de Alertas

## Identificación

| Campo            | Valor                      |
| ---------------- | -------------------------- |
| **ID**           | HU-OP-03                   |
| **Título**       | Escalamiento de alertas    |
| **Módulo**       | Operador de Monitoreo      |

---

## Historia

**Como** operador de monitoreo,
**quiero** escalar alertas a un analista de seguridad específico o al analista disponible, incluyendo una nota obligatoria con el motivo del escalamiento,
**para** garantizar que los casos que requieren un análisis especializado sean atendidos rápidamente y con el contexto suficiente.

---

## Criterios de Aceptación

### CA-OP-03.1 — Selección del analista responsable
- **Dado que** estoy en el detalle de una alerta y decido escalarla,
- **cuando** accedo a la opción de escalamiento,
- **entonces** debo poder seleccionar un analista específico de la lista o la opción de asignar al analista disponible.

### CA-OP-03.2 — Nota de escalamiento obligatoria
- **Dado que** seleccioné al analista para el escalamiento,
- **cuando** intento confirmar sin ingresar una nota justificativa,
- **entonces** el sistema debe impedirlo y mostrar un mensaje indicando que la nota es obligatoria.

### CA-OP-03.3 — Escalamiento exitoso
- **Dado que** seleccioné al analista e ingresé la nota justificativa,
- **cuando** confirmo el escalamiento,
- **entonces** la alerta debe quedar asignada al analista seleccionado y su estado debe actualizarse a "Escalada".

### CA-OP-03.4 — Notificación inmediata al analista
- **Dado que** escalé una alerta exitosamente,
- **cuando** el escalamiento se completa,
- **entonces** el analista asignado debe recibir una notificación inmediata con los datos principales del caso y la nota de escalamiento.

### CA-OP-03.5 — Registro en auditoría del escalamiento
- **Dado que** escalé una alerta,
- **cuando** la acción se completa,
- **entonces** debe quedar registrado en la auditoría con mi identidad, el analista asignado, la nota ingresada y la marca temporal.
