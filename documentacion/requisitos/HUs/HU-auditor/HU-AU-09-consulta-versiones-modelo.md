<!--
  ¿Qué? Historia de usuario que describe la consulta del historial de versiones del modelo de inteligencia artificial.
  ¿Para qué? Formalizar la necesidad del auditor de garantizar la trazabilidad de la evolución del modelo de detección.
  ¿Impacto? Permite demostrar que cada versión del modelo fue validada y autorizada antes de entrar en producción.
-->

# HU-AU-09 — Consulta de Versiones del Modelo

## Identificación

| Campo            | Valor                              |
| ---------------- | ---------------------------------- |
| **ID**           | HU-AU-09                           |
| **Título**       | Consulta de versiones del modelo   |
| **Módulo**       | Auditor                            |

---

## Historia

**Como** auditor,
**quiero** consultar el historial de versiones del modelo de inteligencia artificial, incluyendo fechas de entrenamiento, métricas obtenidas y responsable de la implementación,
**para** garantizar la trazabilidad de la evolución del modelo de detección de fraude.

---

## Criterios de Aceptación

### CA-AU-09.1 — Visualización de todas las versiones del modelo
- **Dado que** accedo al módulo de versiones del modelo,
- **cuando** visualizo el historial,
- **entonces** debo ver todas las versiones registradas ordenadas cronológicamente con su fecha de entrenamiento y estado (activa, reemplazada o revertida).

### CA-AU-09.2 — Métricas de desempeño por versión
- **Dado que** estoy revisando el historial de versiones,
- **cuando** consulto una versión específica,
- **entonces** debo ver sus métricas de desempeño registradas (Precisión, Recall y F1-Score) al momento de su implementación.

### CA-AU-09.3 — Responsable de la implementación
- **Dado que** consulto el detalle de una versión del modelo,
- **cuando** reviso la información de implementación,
- **entonces** debo ver el nombre del administrador que autorizó su puesta en producción y la marca temporal de la acción.
