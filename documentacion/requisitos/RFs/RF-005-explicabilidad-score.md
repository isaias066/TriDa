<!--
  ¿Qué? Requisito funcional que describe la generación automática 
  de explicaciones legibles del score de riesgo calculado.
  ¿Para qué? Definir cómo el sistema produce descripciones en 
  lenguaje natural que justifican la calificación asignada a cada 
  transacción, permitiendo a los analistas validar las decisiones 
  del modelo sin conocimientos técnicos avanzados.
  ¿Impacto? Sin explicabilidad los analistas no pueden entender ni 
  validar las decisiones del modelo, reduciendo la confianza en el 
  sistema y dificultando la gestión de casos.
-->

# RF-005 — Explicabilidad del Score de Riesgo

**Historias de usuario relacionadas:** HU-AN-03, HU-PR-05

## Descripción

Por cada score de riesgo calculado, el sistema debe generar 
automáticamente una explicación legible y comprensible de los factores 
que influyeron en la calificación asignada. Esta explicación debe 
indicar, en lenguaje natural, cuáles variables dispararon el score 
(ej: «dispositivo no reconocido», «monto 10 veces superior al 
promedio del cliente», «primera transacción en este país»). Esto 
permite a los analistas entender y validar las decisiones del modelo 
de IA sin conocimientos técnicos avanzados.

---

## Flujo del proceso

| Paso | Descripción |
|------|-------------|
| 1 | El módulo de explicabilidad recibe el score de riesgo y los datos de análisis desde RF-003. |
| 2 | Se identifican las variables con mayor peso en el resultado del score. |
| 3 | Se genera una descripción en lenguaje natural en español para cada factor determinante. |
| 4 | La explicación se adjunta al score de la transacción. |
| 5 | La explicación se almacena en la tabla de explicaciones de riesgo. |
| 6 | La explicación queda disponible para su visualización en el dashboard (RF-011). |

---

## Reglas de Negocio

| ID | Regla |
|----|-------|
| RN-027 | Toda transacción con score calculado debe incluir una explicación generada automáticamente. |
| RN-028 | La explicación debe estar redactada en español y en lenguaje natural. |
| RN-029 | La explicación debe identificar claramente las variables con mayor influencia en el score. |
| RN-030 | La explicación debe ser comprensible para un analista sin conocimientos avanzados de Machine Learning. |
| RN-031 | La explicación se almacena de forma permanente y queda asociada al score de la transacción. |
