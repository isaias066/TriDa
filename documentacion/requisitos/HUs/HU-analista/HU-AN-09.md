<!--
  ¿Qué? Historia de usuario que describe la visualización de gráficos interactivos sobre el comportamiento del sistema.
  ¿Para qué? Formalizar la necesidad del analista de identificar patrones de fraude y tendencias operativas visualmente.
  ¿Impacto? Facilita la detección temprana de nuevos patrones que el modelo aún no ha clasificado como fraude.
-->

# HU-AN-09 — Visualización de Gráficos

## Identificación

| Campo            | Valor                        |
| ---------------- | ---------------------------- |
| **ID**           | HU-AN-09                     |
| **Título**       | Visualización de gráficos    |
| **Módulo**       | Analista de Seguridad        |

---

## Historia

**Como** analista de seguridad,
**quiero** visualizar gráficos interactivos sobre transacciones, alertas, criticidad, canales y comportamiento histórico,
**para** identificar patrones de fraude y detectar tendencias operativas.

---

## Criterios de Aceptación

### CA-AN-09.1 — Gráficos disponibles en el módulo
- **Dado que** accedo al módulo de visualización,
- **cuando** cargo la pantalla,
- **entonces** debo ver gráficos sobre transacciones procesadas, alertas generadas, distribución por criticidad, canales utilizados y comportamiento histórico.

### CA-AN-09.2 — Interacción con los gráficos
- **Dado que** estoy visualizando un gráfico,
- **cuando** interactúo con él (zoom, hover o selección de segmentos),
- **entonces** debo obtener información adicional del dato seleccionado sin abandonar la pantalla.

### CA-AN-09.3 — Filtrado de información en los gráficos
- **Dado que** estoy en el módulo de visualización,
- **cuando** aplico un filtro (rango de fechas, canal o tipo de transacción),
- **entonces** todos los gráficos de la pantalla deben actualizarse para reflejar únicamente la información correspondiente al filtro aplicado.

### CA-AN-09.4 — Exportación de visualizaciones
- **Dado que** visualizo un gráfico con información relevante,
- **cuando** ejecuto la exportación,
- **entonces** debo poder descargar la visualización en un formato de imagen o documento para compartirla.
