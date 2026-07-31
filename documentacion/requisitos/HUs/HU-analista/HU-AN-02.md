<!--
  ¿Qué? Historia de usuario que describe el acceso a la información completa de una alerta individual.
  ¿Para qué? Formalizar la necesidad del analista de contar con todos los datos en una sola pantalla para tomar decisiones.
  ¿Impacto? Elimina la consulta de sistemas externos y reduce el tiempo de resolución de cada caso.
-->

# HU-AN-02 — Consulta Detallada de Alertas

## Identificación

| Campo            | Valor                            |
| ---------------- | -------------------------------- |
| **ID**           | HU-AN-02                         |
| **Título**       | Consulta detallada de alertas    |
| **Módulo**       | Analista de Seguridad            |

---

## Historia

**Como** analista de seguridad,
**quiero** acceder a la vista detallada de cada alerta con la información completa del cliente, la transacción (monto, origen, destino, canal, dispositivo y ubicación) y su historial reciente,
**para** contar con toda la información necesaria para tomar decisiones fundamentadas sin consultar sistemas externos.

---

## Criterios de Aceptación

### CA-AN-02.1 — Información completa de la transacción
- **Dado que** accedo al detalle de una alerta,
- **cuando** visualizo la pantalla,
- **entonces** debo ver el monto, origen, destino, canal, dispositivo y ubicación de la transacción asociada.

### CA-AN-02.2 — Información completa del cliente
- **Dado que** accedo al detalle de una alerta,
- **cuando** visualizo la sección del cliente,
- **entonces** debo ver los datos de identificación del cliente involucrado en la transacción.

### CA-AN-02.3 — Historial reciente del cliente
- **Dado que** estoy en la vista detallada de una alerta,
- **cuando** consulto el historial,
- **entonces** debo ver las transacciones recientes del cliente para identificar patrones de comportamiento.

### CA-AN-02.4 — Acciones disponibles desde el detalle
- **Dado que** estoy en la vista detallada de una alerta,
- **cuando** reviso la información completa,
- **entonces** debo poder ejecutar acciones sobre la alerta (clasificar, desbloquear o escalar) directamente desde esa pantalla sin navegar a otra sección.
