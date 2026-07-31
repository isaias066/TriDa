<!--
  ¿Qué? Historia de usuario que describe el monitoreo en tiempo real del estado de salud del sistema.
  ¿Para qué? Formalizar la necesidad del administrador de detectar y actuar ante fallos antes de que impacten la operación.
  ¿Impacto? Garantiza la disponibilidad continua del sistema de detección de fraude.
-->

# HU-AD-04 — Monitoreo del Estado del Sistema

## Identificación

| Campo            | Valor                              |
| ---------------- | ---------------------------------- |
| **ID**           | HU-AD-04                           |
| **Título**       | Monitoreo del estado del sistema   |
| **Módulo**       | Administración                     |

---

## Historia

**Como** administrador del sistema,
**quiero** visualizar en tiempo real el estado de salud de cada módulo del sistema (activo, degradado o inactivo), las métricas del servidor (CPU, memoria y latencia) y el estado de conexión con el Core Banking,
**para** detectar y actuar ante fallos o degradaciones antes de que afecten la detección de fraude o la operación del sistema.

---

## Criterios de Aceptación

### CA-AD-04.1 — Panel de salud del sistema
- **Dado que** soy administrador autenticado,
- **cuando** accedo al módulo de monitoreo,
- **entonces** debo ver el estado actual de cada módulo del sistema con su indicador visual (activo, degradado o inactivo).

### CA-AD-04.2 — Visualización de métricas del servidor
- **Dado que** estoy en el panel de monitoreo,
- **cuando** consulto las métricas del servidor,
- **entonces** debo ver el uso actual de CPU, memoria y latencia actualizados en tiempo real.

### CA-AD-04.3 — Estado de conexión con Core Banking
- **Dado que** estoy en el panel de monitoreo,
- **cuando** consulto el estado de integración,
- **entonces** debo ver si la conexión con el Core Banking está activa, degradada o inactiva.

### CA-AD-04.4 — Alertas automáticas ante fallos
- **Dado que** un componente del sistema cambia su estado a degradado o inactivo,
- **cuando** ocurre el fallo,
- **entonces** debo recibir una alerta automática con el nombre del componente afectado y la hora del incidente.

### CA-AD-04.5 — Historial de incidentes técnicos
- **Dado que** soy administrador en el módulo de monitoreo,
- **cuando** consulto el historial,
- **entonces** debo ver el registro de todos los incidentes técnicos anteriores con fecha, componente afectado y duración.
