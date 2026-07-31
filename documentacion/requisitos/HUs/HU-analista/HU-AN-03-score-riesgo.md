<!--
  ¿Qué? Historia de usuario que describe la visualización del score de riesgo y su explicación en lenguaje natural.
  ¿Para qué? Formalizar la necesidad del analista de comprender la lógica del modelo de IA sin conocimientos técnicos.
  ¿Impacto? Aumenta la confianza en las decisiones del modelo y reduce errores de interpretación por parte del analista.
-->

# HU-AN-03 — Explicación del Score de Riesgo

## Identificación

| Campo            | Valor                            |
| ---------------- | -------------------------------- |
| **ID**           | HU-AN-03                         |
| **Título**       | Explicación del score de riesgo  |
| **Módulo**       | Analista de Seguridad            |

---

## Historia

**Como** analista de seguridad,
**quiero** visualizar el score de riesgo generado por la IA junto con una explicación en lenguaje natural de los factores que influyeron en su cálculo,
**para** comprender la lógica utilizada por el modelo y validar sus decisiones sin requerir conocimientos avanzados de Machine Learning.

---

## Criterios de Aceptación

### CA-AN-03.1 — Visualización del score de riesgo
- **Dado que** accedo al detalle de una alerta,
- **cuando** visualizo la pantalla,
- **entonces** debo ver el score de riesgo asignado por la IA expresado numéricamente y con su nivel correspondiente (bajo, medio o alto).

### CA-AN-03.2 — Explicación en lenguaje natural
- **Dado que** estoy viendo el score de riesgo de una alerta,
- **cuando** consulto la explicación,
- **entonces** debo ver una descripción en lenguaje natural que indique cuáles fueron los factores que influyeron en el resultado del modelo.

### CA-AN-03.3 — Identificación clara de variables influyentes
- **Dado que** leo la explicación del score,
- **cuando** reviso los factores listados,
- **entonces** cada variable debe estar identificada con su nombre y el nivel de influencia que tuvo en el resultado final.

### CA-AN-03.4 — Lenguaje comprensible para no especialistas
- **Dado que** soy analista sin conocimientos avanzados de Machine Learning,
- **cuando** leo la explicación del score,
- **entonces** debo poder entender la justificación del modelo sin necesidad de interpretar valores técnicos o estadísticos.
