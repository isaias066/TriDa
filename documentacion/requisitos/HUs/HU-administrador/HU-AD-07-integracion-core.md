<!--
  ¿Qué? Historia de usuario que describe la gestión y monitoreo de la integración con el Core Banking.
  ¿Para qué? Formalizar la necesidad de garantizar la continuidad del flujo de transacciones hacia el sistema.
  ¿Impacto? Sin integración activa ninguna transacción llega al motor de detección de fraude.
-->

# HU-AD-07 — Gestión de Integración con Core Banking

## Identificación

| Campo            | Valor                                        |
| ---------------- | -------------------------------------------- |
| **ID**           | HU-AD-07                                     |
| **Título**       | Gestión de integración con Core Banking      |
| **Módulo**       | Administración                               |

---

## Historia

**Como** administrador del sistema,
**quiero** gestionar la integración del sistema con el Core Banking mediante APIs seguras (HTTPS/TLS 1.3 y Mutual TLS), incluyendo el monitoreo del flujo de datos y la reconexión automática ante interrupciones,
**para** asegurar la continuidad del procesamiento de transacciones y garantizar que ninguna operación quede sin análisis de fraude.

---

## Criterios de Aceptación

### CA-AD-07.1 — Verificación del estado de integración
- **Dado que** soy administrador en el módulo de integraciones,
- **cuando** consulto el estado de la conexión con el Core Banking,
- **entonces** debo ver si la integración está activa, degradada o inactiva junto con la hora de la última sincronización.

### CA-AD-07.2 — Registro de errores de conexión
- **Dado que** ocurre un fallo en la conexión con el Core Banking,
- **cuando** consulto los registros de errores,
- **entonces** debo ver el detalle del error, la hora en que ocurrió y el número de intentos de reconexión realizados.

### CA-AD-07.3 — Reconexión automática sin pérdida de datos
- **Dado que** la conexión con el Core Banking se interrumpió,
- **cuando** el sistema detecta la interrupción,
- **entonces** debe intentar reconectarse automáticamente y garantizar que ninguna transacción quede sin procesar durante la interrupción.

### CA-AD-07.4 — Confirmación de integridad del flujo
- **Dado que** la conexión se restableció tras una interrupción,
- **cuando** reviso el estado de la integración,
- **entonces** debo poder confirmar que no se perdió ninguna transacción durante el período de desconexión.

### CA-AD-07.5 — Seguridad de la comunicación
- **Dado que** el sistema se comunica con el Core Banking,
- **cuando** se establece cualquier conexión,
- **entonces** debe utilizarse exclusivamente HTTPS con TLS 1.3 y Mutual TLS para garantizar la seguridad del canal.
