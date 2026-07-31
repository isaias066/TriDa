<!--
  ¿Qué? Historia de usuario que describe la implementación del módulo 
  de explicabilidad del score de riesgo.
  ¿Para qué? Formalizar la necesidad del programador de generar 
  automáticamente descripciones en lenguaje natural que justifiquen 
  la calificación de riesgo asignada a cada transacción.
  ¿Impacto? Sin explicabilidad los analistas no pueden validar las 
  decisiones del modelo, reduciendo la confianza en el sistema y 
  dificultando la gestión de casos.
-->

# HU-PR-05 — Implementación del Módulo de Explicabilidad del Score

## Identificación

| Campo      | Valor                                                    |
|------------|----------------------------------------------------------|
| **ID**     | HU-PR-05                                                 |
| **Título** | Implementación del módulo de explicabilidad del score    |
| **Módulo** | Programador                                              |

---

## Historia

**Como** programador,
**quiero** desarrollar el módulo de explicabilidad del score que genere 
automáticamente una descripción en lenguaje natural de los factores 
que determinaron la calificación de riesgo,
**para** que los analistas comprendan las decisiones del modelo sin 
conocimientos avanzados de Machine Learning.

---

## Criterios de Aceptación

### CA-PR-05.1 — Explicación incluida en cada score
- **Dado que** el modelo calcula el score de una transacción,
- **cuando** retorna el resultado,
- **entonces** debe incluir una explicación en español que describa 
  los factores que influyeron en la calificación.

### CA-PR-05.2 — Identificación de variables de mayor influencia
- **Dado que** el módulo genera la explicación,
- **cuando** presenta los factores determinantes,
- **entonces** debe identificar claramente las variables con mayor 
  peso en el resultado (ej: 'dispositivo no reconocido', 
  'monto 10 veces superior al promedio del cliente').

### CA-PR-05.3 — Lenguaje comprensible para el analista
- **Dado que** un analista sin conocimientos de Machine Learning 
  lee la explicación,
- **cuando** revisa los factores presentados,
- **entonces** debe comprender el razonamiento del modelo sin 
  necesidad de interpretación técnica adicional.
