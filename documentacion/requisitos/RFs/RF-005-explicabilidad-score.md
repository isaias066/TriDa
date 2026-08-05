<!--
  ¿Qué? Requisito funcional que describe la generación de
  explicaciones sobre las predicciones realizadas por el modelo
  de Inteligencia Artificial.
  ¿Para qué? Permitir que los analistas comprendan los factores
  que influyeron en el resultado obtenido.
  ¿Impacto? Incrementa la transparencia, facilita auditorías y
  mejora la confianza en el sistema.
-->

# RF-005 — Explicabilidad del Modelo de IA

**Historias de usuario relacionadas:** HU-AN-03, HU-PR-05

## Descripción

El sistema deberá generar automáticamente una explicación asociada
a cada predicción realizada por el modelo de Inteligencia Artificial,
indicando los factores de riesgo que tuvieron mayor influencia en el
resultado obtenido.

La explicación deberá presentarse en un lenguaje claro y comprensible
para facilitar la interpretación por parte de los analistas.

---

## Flujo del proceso

| Paso | Descripción |
|------|-------------|
| 1 | El módulo recibe el score de riesgo generado en RF-003. |
| 2 | Se identifican los factores con mayor influencia en la predicción. |
| 3 | Se construye una explicación utilizando dichos factores. |
| 4 | La explicación se asocia a la transacción analizada. |
| 5 | La información se almacena para auditoría. |
| 6 | La explicación queda disponible en el dashboard del sistema. |

---

## Reglas de Negocio

| ID | Regla |
|----|-------|
| RN-027 | Toda predicción deberá contar con una explicación asociada. |
| RN-028 | La explicación deberá redactarse en lenguaje claro y comprensible. |
| RN-029 | La explicación deberá indicar los factores que tuvieron mayor influencia en la predicción. |
| RN-030 | La explicación deberá facilitar la interpretación de la decisión por parte de los analistas. |
| RN-031 | La explicación permanecerá almacenada junto con el registro de la transacción. |
