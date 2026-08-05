<!--
  ¿Qué? Requisito funcional que describe la evaluación de los
  factores de riesgo considerados durante el análisis de una
  transacción.
  ¿Para qué? Definir los comportamientos que el modelo de IA debe
  evaluar para estimar el riesgo de fraude.
  ¿Impacto? Permite que las decisiones del modelo se basen en
  características relevantes del comportamiento transaccional.
-->

# RF-004 — Evaluación de Factores de Riesgo

**Historias de usuario relacionadas:** HU-PR-04

## Descripción

El modelo de Inteligencia Artificial deberá evaluar los factores de
riesgo calculados durante la etapa de extracción de características
con el fin de identificar comportamientos inusuales que puedan estar
asociados con posibles intentos de fraude.

La evaluación considera variables relacionadas con el contexto de la
transacción y el comportamiento histórico del cliente.

---

## Flujo del proceso

| Paso | Descripción |
|------|-------------|
| 1 | El modelo recibe los siete factores de riesgo generados por RF-002. |
| 2 | Se evalúa el comportamiento asociado a cada factor de riesgo. |
| 3 | Se identifican los factores que presentan mayor influencia en la predicción. |
| 4 | Los factores relevantes se asocian al score de riesgo generado en RF-003. |
| 5 | La información se envía al módulo de explicabilidad. |

---

## Reglas de Negocio

| ID | Regla |
|----|-------|
| RN-020 | El modelo evaluará el comportamiento asociado al monto de la transacción. |
| RN-021 | El modelo evaluará la información del dispositivo utilizado. |
| RN-022 | El modelo evaluará la ubicación geográfica de la operación. |
| RN-023 | El modelo evaluará la velocidad transaccional del cliente. |
| RN-024 | El modelo evaluará el horario de la operación. |
| RN-025 | El modelo evaluará el comportamiento histórico y el riesgo asociado al país. |
| RN-026 | Los factores que influyan significativamente en la predicción deberán quedar disponibles para el módulo de explicabilidad. |
