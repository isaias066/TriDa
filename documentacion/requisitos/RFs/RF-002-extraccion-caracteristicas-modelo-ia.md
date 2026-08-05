<!--
  ¿Qué? Requisito funcional que describe la extracción automática de
  características utilizadas por el modelo de Inteligencia Artificial.
  ¿Para qué? Definir cómo TriDa transforma la información de una
  transacción en variables que permitan estimar el riesgo de fraude.
  ¿Impacto? Sin esta etapa el modelo de Inteligencia Artificial no
  dispone de las variables necesarias para realizar la predicción.
-->

# RF-002 — Extracción de Características para el Modelo de IA

**Historias de usuario relacionadas:** HU-PR-02

## Descripción

El sistema debe calcular automáticamente los siete factores de riesgo
definidos por TriDa a partir de la información de la transacción y del
historial disponible del cliente. Estos factores constituirán las
variables de entrada utilizadas por el modelo de Inteligencia Artificial
para estimar la probabilidad de fraude.

---

## Flujo del proceso

| Paso | Descripción |
|------|-------------|
| 1 | El módulo recibe la transacción normalizada desde RF-001. |
| 2 | Se consulta la información histórica disponible del cliente. |
| 3 | Se calculan los factores de desviación del monto, reconocimiento del dispositivo, ubicación geográfica, velocidad transaccional, horario, comportamiento histórico y riesgo por país. |
| 4 | Cada factor se transforma al formato requerido por el modelo de Inteligencia Artificial. |
| 5 | Los siete factores conforman el vector de características de la transacción. |
| 6 | El conjunto de características se envía al módulo de análisis mediante IA (RF-003). |

---

## Reglas de Negocio

| ID | Regla |
|----|-------|
| RN-008 | Toda transacción deberá generar los siete factores de riesgo definidos por TriDa antes de ser analizada por el modelo de IA. |
| RN-009 | Los factores de riesgo se calcularán utilizando la información disponible de la transacción y el historial del cliente. |
| RN-010 | Si alguna fuente de información no está disponible, el sistema utilizará los datos existentes y registrará la incidencia. |
| RN-011 | La ausencia de información complementaria no impedirá el análisis de la transacción cuando sea posible continuar con los datos disponibles. |
| RN-012 | Los factores calculados constituirán las variables de entrada del modelo de Inteligencia Artificial. |
| RN-013 | Este módulo únicamente calcula características y no determina si una transacción es fraudulenta. |de cada operación. Este enriquecimiento contextual es la base para 
que el modelo de IA detecte anomalías con alta precisión.

---

## Flujo del proceso

| Paso | Descripción |
|------|-------------|
| 1 | El módulo recibe la transacción normalizada desde RF-001. |
| 2 | Se consulta el historial transaccional del cliente en la base de datos. |
| 3 | Se consultan los dispositivos previamente registrados del cliente. |
| 4 | Se consultan las ubicaciones frecuentes y patrones de comportamiento habituales. |
| 5 | Se calcula la frecuencia de operaciones recientes del cliente. |
| 6 | Se consulta el servicio externo de geolocalización para verificar coherencia geográfica. |
| 7 | Se adjuntan todos los datos de contexto a la transacción enriquecida. |
| 8 | La transacción enriquecida se envía al módulo de análisis de IA (RF-003). |

---

## Reglas de Negocio

| ID | Regla |
|----|-------|
| RN-008 | Toda transacción debe ser enriquecida antes de ser analizada por el modelo de IA. |
| RN-009 | Las fuentes internas consultadas incluyen: historial del cliente, dispositivos registrados, ubicaciones frecuentes y frecuencia de operaciones. |
| RN-010 | El servicio externo de geolocalización debe consultarse para verificar coherencia geográfica. |
| RN-011 | Si una fuente interna no responde, el enriquecimiento continúa con los datos disponibles y se registra la incidencia. |
| RN-012 | Si el servicio de geolocalización no responde, la transacción se marca como «geolocalización no verificada» y continúa el flujo. |
| RN-013 | El enriquecimiento no debe superar el tiempo máximo que permita mantener la latencia total por debajo de 500 ms. |
