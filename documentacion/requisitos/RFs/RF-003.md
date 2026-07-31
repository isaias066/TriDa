<!--
  ¿Qué? Requisito funcional que describe el análisis inteligente 
  con IA y el cálculo del score de riesgo para cada transacción.
  ¿Para qué? Definir cómo el modelo de Machine Learning evalúa 
  cada transacción enriquecida y genera un puntaje de riesgo 
  que determina las acciones automáticas del sistema.
  ¿Impacto? Es el núcleo del sistema de detección: sin el score 
  no es posible generar alertas, clasificar riesgo ni ejecutar 
  bloqueos automáticos.
-->

# RF-003 — Análisis Inteligente con IA y Cálculo de Score de Riesgo

**Historias de usuario relacionadas:** HU-PR-03

## Descripción

El sistema implementará un modelo de Machine Learning que analizará 
cada transacción enriquecida y calculará un puntaje de riesgo del 
0 % al 100 %, donde 0 % indica operación completamente legítima y 
100 % indica alta probabilidad de fraude. El score se generará en 
menos de 500 milisegundos y se expresará con un decimal (ej: 85,5 %).

---

## Flujo del proceso

| Paso | Descripción |
|------|-------------|
| 1 | El módulo de IA recibe la transacción enriquecida desde RF-002. |
| 2 | El Adapter Pattern traduce los datos al formato requerido por el modelo de IA (Gemini API). |
| 3 | El modelo analiza la transacción comparándola con el comportamiento histórico del cliente y patrones conocidos de fraude. |
| 4 | Se calcula el score de riesgo entre 0 % y 100 % con un decimal. |
| 5 | El score y los datos de análisis se envían al módulo de explicabilidad (RF-005). |
| 6 | El score se envía al motor de alertas (RF-006) para determinar acciones automáticas. |
| 7 | El resultado se almacena en la tabla de scores de riesgo. |

---

## Reglas de Negocio

| ID | Regla |
|----|-------|
| RN-014 | El score de riesgo debe expresarse como porcentaje con un decimal (ej: 85,5 %). |
| RN-015 | El rango del score es de 0 % (legítima) a 100 % (alta probabilidad de fraude). |
| RN-016 | El score debe generarse en menos de 500 milisegundos por transacción. |
| RN-017 | La comunicación con la IA externa se realiza mediante el Adapter Pattern, permitiendo cambiar de proveedor sin modificar el código principal. |
| RN-018 | Si la IA externa no responde, la transacción se marca como «pendiente de análisis» y se reintenta automáticamente. |
| RN-019 | El modelo debe alcanzar una tasa de detección de fraudes superior al 90 %. |
