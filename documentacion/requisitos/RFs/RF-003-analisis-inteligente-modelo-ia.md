<!--
  ¿Qué? Requisito funcional que describe el análisis de las
  características de una transacción mediante un modelo de
  Inteligencia Artificial.
  ¿Para qué? Definir cómo el modelo de IA estima la probabilidad
  de fraude a partir de los siete factores de riesgo calculados.
  ¿Impacto? Constituye el núcleo analítico de TriDa, ya que genera
  la predicción utilizada posteriormente por el motor de decisiones.
-->

# RF-003 — Análisis Inteligente mediante Modelo de IA

**Historias de usuario relacionadas:** HU-PR-03

## Descripción

El sistema debe implementar un modelo de Inteligencia Artificial
basado en Random Forest que analice los siete factores de riesgo
calculados previamente y estime la probabilidad de que una
transacción corresponda a un posible fraude.

El resultado del análisis será un score de riesgo comprendido entre
0 % y 100 %, donde un valor más alto representa una mayor
probabilidad de fraude.

---

## Flujo del proceso

| Paso | Descripción |
|------|-------------|
| 1 | El modelo de IA recibe el conjunto de características generado en RF-002. |
| 2 | Se carga el modelo de IA previamente entrenado. |
| 3 | El modelo analiza los factores de riesgo de la transacción. |
| 4 | Se calcula la probabilidad de fraude. |
| 5 | Se genera el score de riesgo entre 0 % y 100 %. |
| 6 | El resultado se envía al módulo de explicabilidad (RF-005). |
| 7 | El score se envía al módulo de decisiones y alertas (RF-006). |
| 8 | La predicción queda registrada para auditoría. |

---

## Reglas de Negocio

| ID | Regla |
|----|-------|
| RN-014 | El score de riesgo deberá expresarse como un porcentaje entre 0 % y 100 %. |
| RN-015 | El modelo de IA utilizará como entrada únicamente los factores de riesgo generados en RF-002. |
| RN-016 | El modelo deberá ejecutarse localmente utilizando una versión previamente entrenada. |
| RN-017 | La arquitectura permitirá actualizar o reemplazar el modelo sin modificar el resto del sistema. |
| RN-018 | Toda predicción deberá enviarse al módulo de explicabilidad y al motor de decisiones. |
| RN-019 | El resultado del análisis deberá registrarse para fines de auditoría y seguimiento. |
