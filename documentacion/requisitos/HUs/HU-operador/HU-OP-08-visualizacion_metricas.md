<!--
  ¿Qué? Historia de usuario que describe la visualización de métricas operativas mediante gráficos interactivos.
  ¿Para qué? Formalizar la necesidad del operador de identificar tendencias y anticipar incrementos inusuales de actividad.
  ¿Impacto? Permite la detección temprana de anomalías operativas antes de que se conviertan en incidentes de fraude.
-->

# HU-OP-08 — Visualización de Métricas Operativas

## Identificación

| Campo            | Valor                                  |
| ---------------- | -------------------------------------- |
| **ID**           | HU-OP-08                               |
| **Título**       | Visualización de métricas operativas   |
| **Módulo**       | Operador de Monitoreo                  |

---

## Historia

**Como** operador de monitoreo,
**quiero** visualizar gráficos interactivos con métricas operativas como volumen de transacciones por hora, distribución de alertas y mapas de calor por canal y horario,
**para** identificar tendencias operativas y anticipar incrementos inusuales de actividad.

---

## Criterios de Aceptación

### CA-OP-08.1 — Gráficos actualizados en tiempo real
- **Dado que** accedo al módulo de métricas operativas,
- **cuando** visualizo los gráficos,
- **entonces** deben estar actualizados en tiempo real reflejando la actividad más reciente del sistema.

### CA-OP-08.2 — Modificación del período de visualización
- **Dado que** estoy visualizando las métricas operativas,
- **cuando** cambio el período de visualización (última hora, últimas 24 horas, última semana),
- **entonces** todos los gráficos deben actualizarse para reflejar únicamente el período seleccionado.

### CA-OP-08.3 — Identificación visual de anomalías
- **Dado que** estoy revisando los gráficos de métricas,
- **cuando** se presenta un incremento inusual de actividad,
- **entonces** debo poder identificarlo visualmente mediante cambios de color, indicadores o marcadores en el gráfico.
