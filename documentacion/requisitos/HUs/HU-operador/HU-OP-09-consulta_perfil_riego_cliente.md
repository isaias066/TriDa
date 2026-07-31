<!--
  ¿Qué? Historia de usuario que describe la consulta del perfil de riesgo dinámico de un cliente.
  ¿Para qué? Formalizar la necesidad del operador de enriquecer la evaluación de alertas con el contexto histórico del cliente.
  ¿Impacto? Mejora la precisión de la evaluación del operador al comparar el comportamiento actual con el historial completo.
-->

# HU-OP-09 — Consulta del Perfil de Riesgo del Cliente

## Identificación

| Campo            | Valor                                      |
| ---------------- | ------------------------------------------ |
| **ID**           | HU-OP-09                                   |
| **Título**       | Consulta del perfil de riesgo del cliente  |
| **Módulo**       | Operador de Monitoreo                      |

---

## Historia

**Como** operador de monitoreo,
**quiero** consultar el perfil de riesgo dinámico de un cliente, incluyendo historial de scores, dispositivos registrados, ubicaciones frecuentes y alertas previas,
**para** enriquecer la evaluación de una alerta con el contexto histórico del cliente.

---

## Criterios de Aceptación

### CA-OP-09.1 — Acceso al perfil desde la vista de la alerta
- **Dado que** estoy en la vista detallada de una alerta,
- **cuando** selecciono la opción de ver el perfil del cliente,
- **entonces** debo acceder al perfil de riesgo dinámico sin necesidad de navegar a otro módulo.

### CA-OP-09.2 — Historial de scores del cliente
- **Dado que** estoy en el perfil de riesgo del cliente,
- **cuando** consulto el historial de scores,
- **entonces** debo ver la evolución de los scores de riesgo asignados a las transacciones del cliente a lo largo del tiempo.

### CA-OP-09.3 — Dispositivos registrados y ubicaciones frecuentes
- **Dado que** estoy en el perfil de riesgo del cliente,
- **cuando** consulto los dispositivos y ubicaciones,
- **entonces** debo ver la lista de dispositivos registrados y las ubicaciones frecuentes desde las cuales el cliente ha operado.

### CA-OP-09.4 — Alertas previas del cliente
- **Dado que** estoy en el perfil de riesgo del cliente,
- **cuando** consulto las alertas previas,
- **entonces** debo ver el historial de alertas generadas para ese cliente con su clasificación final y fecha.

### CA-OP-09.5 — Comparación del comportamiento actual vs historial
- **Dado que** estoy evaluando una alerta,
- **cuando** reviso el perfil de riesgo del cliente,
- **entonces** debo poder comparar el comportamiento de la transacción actual con los patrones históricos del cliente.

### CA-OP-09.6 — Sin requerir permisos administrativos
- **Dado que** soy operador de monitoreo,
- **cuando** accedo al perfil de riesgo de un cliente,
- **entonces** debo poder consultarlo con mis permisos de operador sin necesidad de privilegios de administrador.
