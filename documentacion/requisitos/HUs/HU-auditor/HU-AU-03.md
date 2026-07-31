<!--
  ¿Qué? Historia de usuario que describe la verificación de la inmutabilidad e integridad de los registros de auditoría.
  ¿Para qué? Formalizar la necesidad del auditor de garantizar que la información no ha sido alterada desde su creación.
  ¿Impacto? La integridad de los registros es el fundamento de cualquier proceso legal, regulatorio o forense.
-->

# HU-AU-03 — Verificación de Integridad de Registros

## Identificación

| Campo            | Valor                                      |
| ---------------- | ------------------------------------------ |
| **ID**           | HU-AU-03                                   |
| **Título**       | Verificación de integridad de registros    |
| **Módulo**       | Auditor                                    |

---

## Historia

**Como** auditor,
**quiero** verificar que los registros de auditoría sean inmutables mediante identificadores únicos, marcas de tiempo y mecanismos de integridad,
**para** garantizar que la información no haya sido alterada desde su creación.

---

## Criterios de Aceptación

### CA-AU-03.1 — Identificador único por registro
- **Dado que** consulto cualquier registro de auditoría,
- **cuando** visualizo su contenido,
- **entonces** debo ver un identificador único irrepetible que permita referenciarlo de forma inequívoca.

### CA-AU-03.2 — Verificación de integridad de un evento
- **Dado que** selecciono un registro de auditoría para verificar,
- **cuando** ejecuto la verificación de integridad,
- **entonces** el sistema debe confirmar si el registro ha sido alterado o si su integridad está intacta desde su creación.

### CA-AU-03.3 — Imposibilidad de modificar o eliminar registros
- **Dado que** intento modificar o eliminar un registro de auditoría,
- **cuando** ejecuto la acción independientemente de mi rol,
- **entonces** el sistema debe rechazarla y mostrar un mensaje indicando que los registros de auditoría son inmutables.
