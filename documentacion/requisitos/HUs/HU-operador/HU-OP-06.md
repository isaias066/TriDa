<!--
  ¿Qué? Historia de usuario que describe la consulta del historial de transacciones de un cliente desde la alerta.
  ¿Para qué? Formalizar la necesidad del operador de contextualizar el comportamiento del cliente sin sistemas externos.
  ¿Impacto? Reduce el tiempo de evaluación y mejora la precisión de la decisión del operador sobre cada alerta.
-->

# HU-OP-06 — Consulta del Historial del Cliente

## Identificación

| Campo            | Valor                              |
| ---------------- | ---------------------------------- |
| **ID**           | HU-OP-06                           |
| **Título**       | Consulta del historial del cliente |
| **Módulo**       | Operador de Monitoreo              |

---

## Historia

**Como** operador de monitoreo,
**quiero** consultar el historial reciente de transacciones de un cliente desde la vista de la alerta, incluyendo scores anteriores y dispositivos utilizados,
**para** contextualizar el comportamiento del cliente y determinar si la alerta corresponde a un patrón realmente inusual.

---

## Criterios de Aceptación

### CA-OP-06.1 — Acceso al historial desde la alerta
- **Dado que** estoy en la vista detallada de una alerta,
- **cuando** consulto la sección de historial del cliente,
- **entonces** debo ver las transacciones recientes del cliente sin necesidad de navegar a otro módulo o sistema externo.

### CA-OP-06.2 — Visualización de scores anteriores
- **Dado que** estoy consultando el historial del cliente,
- **cuando** reviso las transacciones listadas,
- **entonces** cada transacción debe mostrar el score de riesgo que le fue asignado en su momento.

### CA-OP-06.3 — Dispositivos utilizados por el cliente
- **Dado que** estoy consultando el historial del cliente,
- **cuando** reviso los dispositivos,
- **entonces** debo ver la lista de dispositivos desde los cuales el cliente ha operado recientemente.

### CA-OP-06.4 — Sin necesidad de acceder a sistemas externos
- **Dado que** necesito contextualizar una alerta,
- **cuando** consulto el historial del cliente,
- **entonces** toda la información debe estar disponible dentro del sistema antifraude sin requerir consultas externas.
