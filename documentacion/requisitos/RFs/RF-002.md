<!--
  ¿Qué? Requisito funcional que describe el enriquecimiento automático 
  de datos transaccionales con contexto interno y externo.
  ¿Para qué? Definir cómo el sistema agrega información contextual 
  a cada transacción antes de enviarla al modelo de IA.
  ¿Impacto? Sin el enriquecimiento el modelo opera con datos 
  incompletos, reduciendo la precisión en la detección de anomalías.
-->

# RF-002 — Enriquecimiento de Datos Transaccionales

**Historias de usuario relacionadas:** HU-PR-02

## Descripción

El sistema debe enriquecer automáticamente cada transacción consultando 
fuentes internas (historial transaccional del cliente, patrones de 
comportamiento habituales, dispositivos previamente registrados, 
ubicaciones frecuentes y frecuencia de operaciones) y servicios 
externos de geolocalización para verificar la coherencia geográfica 
de cada operación. Este enriquecimiento contextual es la base para 
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
