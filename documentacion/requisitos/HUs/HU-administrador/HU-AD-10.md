<!--
  ¿Qué? Historia de usuario que describe el registro inmutable de todas las acciones y transacciones del sistema.
  ¿Para qué? Formalizar la necesidad de garantizar trazabilidad completa e integridad de los registros de auditoría.
  ¿Impacto? Es el fundamento del cumplimiento de PCI-DSS e ISO 27001 — sin inmutabilidad no hay trazabilidad confiable.
-->

# HU-AD-10 — Auditoría Inmutable

## Identificación

| Campo            | Valor                  |
| ---------------- | ---------------------- |
| **ID**           | HU-AD-10               |
| **Título**       | Auditoría inmutable    |
| **Módulo**       | Administración         |

---

## Historia

**Como** administrador del sistema,
**quiero** que todas las transacciones procesadas, scores asignados, decisiones automáticas y acciones de los analistas queden registradas de forma inmutable con marca temporal, identificador único y firma de integridad,
**para** garantizar la trazabilidad completa del sistema y demostrar el cumplimiento de PCI-DSS e ISO 27001.

---

## Criterios de Aceptación

### CA-AD-10.1 — Registro automático de transacciones procesadas
- **Dado que** el sistema procesa una transacción,
- **cuando** el motor de riesgo asigna un score,
- **entonces** debe generarse automáticamente un registro en la auditoría con el identificador único, la marca temporal y el score asignado.

### CA-AD-10.2 — Registro de decisiones automáticas
- **Dado que** el motor toma una decisión automática (bloqueo o aprobación),
- **cuando** la decisión se ejecuta,
- **entonces** debe quedar registrada en la auditoría con el motivo, el score que la originó y la marca temporal.

### CA-AD-10.3 — Registro de acciones de analistas
- **Dado que** un analista realiza una acción sobre una alerta o transacción,
- **cuando** la acción se completa,
- **entonces** debe quedar registrada en la auditoría con la identidad del analista, la acción ejecutada y la marca temporal.

### CA-AD-10.4 — Verificación de firma de integridad
- **Dado que** consulto un registro de auditoría,
- **cuando** verifico su integridad,
- **entonces** el sistema debe confirmar que el registro no ha sido alterado desde su creación mediante su firma de integridad.

### CA-AD-10.5 — Imposibilidad de modificar o eliminar registros
- **Dado que** cualquier usuario intenta modificar o eliminar un registro de auditoría,
- **cuando** ejecuta la acción,
- **entonces** el sistema debe rechazarla sin importar el rol del usuario, incluido el administrador.

### CA-AD-10.6 — Identificador único por registro
- **Dado que** se genera cualquier evento auditable en el sistema,
- **cuando** el registro se almacena,
- **entonces** debe incluir un identificador único irrepetible que permita su localización exacta en cualquier consulta posterior.
