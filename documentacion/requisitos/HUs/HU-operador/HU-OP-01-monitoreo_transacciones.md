<!--
  ¿Qué? Historia de usuario que describe el monitoreo en tiempo real del flujo de transacciones desde todos los canales.
  ¿Para qué? Formalizar la necesidad del operador de tener visión global del volumen transaccional en tiempo real.
  ¿Impacto? Sin monitoreo continuo no se detectan aumentos anómalos que indiquen ataques coordinados o fallos técnicos.
-->

# HU-OP-01 — Monitoreo de Transacciones en Tiempo Real

## Identificación

| Campo            | Valor                                          |
| ---------------- | ---------------------------------------------- |
| **ID**           | HU-OP-01                                       |
| **Título**       | Monitoreo de transacciones en tiempo real      |
| **Módulo**       | Operador de Monitoreo                          |

---

## Historia

**Como** operador de monitoreo,
**quiero** visualizar en tiempo real el flujo continuo de transacciones procesadas desde todos los canales bancarios (aplicación móvil, web, cajeros automáticos y puntos de venta), junto con el score de riesgo asignado a cada una,
**para** tener una visión global del volumen transaccional y detectar visualmente aumentos anómalos en la actividad que puedan indicar ataques coordinados o problemas técnicos.

---

## Criterios de Aceptación

### CA-OP-01.1 — Flujo de transacciones en tiempo real
- **Dado que** soy operador autenticado en el sistema,
- **cuando** accedo al módulo de monitoreo,
- **entonces** debo ver el flujo continuo de transacciones procesadas actualizado en tiempo real sin necesidad de recargar la página.

### CA-OP-01.2 — Score de riesgo visible por transacción
- **Dado que** estoy visualizando el flujo de transacciones,
- **cuando** observo cada transacción listada,
- **entonces** debo ver su score de riesgo asignado de forma clara junto a los datos principales de la operación.

### CA-OP-01.3 — Cobertura de todos los canales bancarios
- **Dado que** estoy en el módulo de monitoreo,
- **cuando** visualizo el flujo de transacciones,
- **entonces** debo ver transacciones provenientes de todos los canales (aplicación móvil, web, cajeros automáticos y puntos de venta) sin exclusión.

### CA-OP-01.4 — Actualización automática sin acción del usuario
- **Dado que** el módulo de monitoreo está abierto,
- **cuando** se procesan nuevas transacciones en el sistema,
- **entonces** deben aparecer automáticamente en pantalla sin que yo realice ninguna acción adicional.
