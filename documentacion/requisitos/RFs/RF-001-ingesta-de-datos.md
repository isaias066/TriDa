<!--
  ¿Qué? Requisito funcional que describe la ingesta y procesamiento 
  de datos transaccionales en tiempo real.
  ¿Para qué? Definir cómo el sistema captura, extrae y normaliza 
  cada transacción proveniente de todos los canales bancarios para 
  su análisis posterior por el modelo de IA.
  ¿Impacto? Este RF es la puerta de entrada del sistema: sin él, 
  ningún otro módulo (scoring, alertas, bloqueos) puede operar.
-->

# RF-001 — Ingesta y Procesamiento de Datos Transaccionales en Tiempo Real

**Historias de usuario relacionadas:** HU-OP-01, HU-PR-01

## Descripción

El sistema debe recibir y procesar datos transaccionales del sistema 
bancario central en tiempo real mediante streaming continuo. Cada 
transacción ejecutada en cualquier canal bancario (app móvil, web, 
cajero automático, punto de venta) será capturada automáticamente, 
normalizada en un formato estándar unificado y enviada al módulo de 
enriquecimiento para su análisis posterior.

---

## Flujo del proceso

| Paso | Descripción |
|------|-------------|
| 1 | El sistema bancario central emite el evento de transacción mediante streaming continuo. |
| 2 | El módulo de ingesta recibe el evento y valida su integridad. |
| 3 | Si la validación falla, se registra el error y se activa el mecanismo de reconexión. |
| 4 | Se extraen los campos relevantes: monto, origen, destino, tipo de transacción, dispositivo, ubicación geográfica, fecha y hora. |
| 5 | Los datos extraídos se normalizan al formato estándar unificado del sistema. |
| 6 | La transacción normalizada se envía al módulo de enriquecimiento (RF-002). |
| 7 | El evento queda registrado en el módulo de auditoría (RF-015). |

---

## Reglas de Negocio

| ID | Regla |
|----|-------|
| RN-001 | Toda transacción ejecutada en cualquier canal bancario debe ser capturada sin excepción. |
| RN-002 | Los campos obligatorios son: monto, origen, destino, tipo de transacción, dispositivo, ubicación, fecha y hora. |
| RN-003 | Si la validación de integridad del evento falla, el sistema debe registrar el error y no procesar la transacción corrupta. |
| RN-004 | La transacción debe normalizarse al formato estándar antes de continuar el flujo de procesamiento. |
| RN-005 | La comunicación con el Core Banking debe realizarse mediante HTTPS/TLS 1.3 con Mutual TLS. |
| RN-006 | El sistema no puede modificar ni interactuar directamente con la base de datos del Core Banking. |
| RN-007 | El tiempo máximo de procesamiento de ingesta por transacción es de 500 ms. |
